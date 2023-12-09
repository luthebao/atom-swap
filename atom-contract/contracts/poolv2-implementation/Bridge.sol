// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IAssetRouter.sol";
import "./interfaces/ILayerZeroReceiver.sol";
import "./interfaces/ILayerZeroEndpoint.sol";
import "./interfaces/ILayerZeroUserApplicationConfig.sol";
import "./interfaces/IBridge.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Bridge is AccessControl, IBridge {
    using SafeMath for uint256;

    bytes32 public constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    ILayerZeroEndpoint public immutable layerZeroEndpoint;
    mapping(uint16 => bytes) public bridgeLookup;
    mapping(uint16 => mapping(IAssetRouter.MESSAGE_TYPE => uint256))
        public gasLookup;
    IAssetRouter public router;
    bool public useLayerZeroToken;

    mapping(uint16 => mapping(bytes => mapping(uint64 => bytes32)))
        public failedMessages;

    /// @notice received parameters per chain per action id for both swap or vouchers
    mapping(uint16 => mapping(bytes32 => IAssetRouter.SwapMessage))
        private receivedSwapMessages;
    mapping(uint16 => mapping(bytes32 => IAssetRouter.LiquidityMessage))
        private receivedLiquidityMessages;

    event MessageDispatched(
        uint16 indexed chainId,
        IAssetRouter.MESSAGE_TYPE indexed type_,
        address indexed refundAddress,
        bytes payload
    );

    event MessageFailed(
        uint16 _srcChainId,
        bytes _srcAddress,
        uint64 _nonce,
        bytes _payload
    );
    event SwapMessageReceived(IAssetRouter.SwapMessage _message);
    event LiquidityMessageReceived(IAssetRouter.LiquidityMessage _message);

    error InsuficientFee(uint256);
    error NotLayerZero();
    error InsufficientAccess();
    error BridgeMismatch();
    error SliceOverflow();
    error SliceBoundsError();

    constructor(address _layerZeroEndpoint, address _router) {
        layerZeroEndpoint = ILayerZeroEndpoint(_layerZeroEndpoint);
        router = IAssetRouter(_router);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ROUTER_ROLE, msg.sender);
    }

    function dispatchMessage(
        uint16 _chainId,
        IAssetRouter.MESSAGE_TYPE _type,
        address payable _refundAddress,
        bytes memory _payload
    ) external payable override onlyRole(ROUTER_ROLE) {
        uint16 version = 1;
        bytes memory adapterParams = abi.encodePacked(
            version,
            gasLookup[_chainId][_type]
        );
        (uint256 estimatedFee, ) = layerZeroEndpoint.estimateFees(
            _chainId,
            address(this),
            _payload,
            false,
            adapterParams
        );
        if (estimatedFee > msg.value) {
            revert InsuficientFee(estimatedFee);
        }

        layerZeroEndpoint.send{value: msg.value}(
            _chainId,
            bridgeLookup[_chainId],
            _payload,
            _refundAddress,
            address(this),
            adapterParams
        );
        emit MessageDispatched(_chainId, _type, _refundAddress, _payload);
    }

    function lzReceive(
        uint16 srcChainId_,
        bytes memory srcAddressBytes_,
        uint64 nonce_,
        bytes memory payload_
    ) external override {
        if (msg.sender != address(layerZeroEndpoint)) revert NotLayerZero();
        try
            this.nonBlockingReceive(srcChainId_, srcAddressBytes_, payload_)
        {} catch {
            failedMessages[srcChainId_][srcAddressBytes_][nonce_] = keccak256(
                payload_
            );
            emit MessageFailed(srcChainId_, srcAddressBytes_, nonce_, payload_);
        }
    }

    // use this method for testing
    // function lzReceive(
    //     uint16 srcChainId_,
    //     bytes memory srcAddressBytes_,
    //     uint64 nonce_,
    //     bytes memory payload_
    // ) external override {
    //     nonBlockingReceive(srcChainId_, srcAddressBytes_, payload_);
    // }

    function nonBlockingReceive(
        uint16 srcChainId_,
        bytes memory srcAddressBytes_,
        bytes memory payload_
    ) public {
        // TODO remove this for testing
        if (
            msg.sender != address(this) &&
            !hasRole(DEFAULT_ADMIN_ROLE, msg.sender)
        ) revert InsufficientAccess();
        if (
            srcAddressBytes_.length != bridgeLookup[srcChainId_].length ||
            keccak256(srcAddressBytes_) != keccak256(bridgeLookup[srcChainId_])
        ) {
            revert BridgeMismatch();
        }
        handleReceive(srcChainId_, payload_);
    }

    function handleReceive(uint16 _srcChainId, bytes memory _payload) internal {
        uint8 functionType;
        assembly ("memory-safe") {
            functionType := mload(add(_payload, 1))
        }
        if (functionType == 1) {
            IAssetRouter.SwapMessage memory swapMessage = decodeSwapMessage(
                _payload
            );
            swapMessage.srcChainId = _srcChainId;

            receivedSwapMessages[_srcChainId][swapMessage.id] = swapMessage;

            router.swapRemote(
                swapMessage.srcPoolId,
                swapMessage.dstPoolId,
                _srcChainId,
                swapMessage.receiver,
                swapMessage.amount,
                swapMessage.fee,
                swapMessage.vouchers,
                swapMessage.optimalDstBandwidth
            );
            emit SwapMessageReceived(swapMessage);
        } else if (functionType == 2) {
            IAssetRouter.LiquidityMessage
                memory liquidityMessage = decodeLiquidityMessage(_payload);

            receivedLiquidityMessages[_srcChainId][
                liquidityMessage.id
            ] = liquidityMessage;
            router.receiveVouchers(
                _srcChainId,
                liquidityMessage.srcPoolId,
                liquidityMessage.dstPoolId,
                liquidityMessage.vouchers,
                liquidityMessage.optimalDstBandwidth,
                false
            );
            emit LiquidityMessageReceived(liquidityMessage);
        }
    }

    function decodeSwapMessage(
        bytes memory _payload
    ) private pure returns (IAssetRouter.SwapMessage memory swapMessage) {
        uint16 scrPoolId;
        uint16 dstPoolId;
        address receiver;
        uint256 amount;
        uint256 fee;
        uint256 vouchers;
        uint256 optimalDstBandwidth;
        bytes32 id;
        swapMessage.payload = slice(_payload, 185, _payload.length - 185);

        assembly ("memory-safe") {
            _payload := add(_payload, 1)

            scrPoolId := mload(add(_payload, 2))
            _payload := add(_payload, 2)

            dstPoolId := mload(add(_payload, 2))
            _payload := add(_payload, 2)

            receiver := mload(add(_payload, 20))
            _payload := add(_payload, 20)

            amount := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            fee := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            vouchers := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            optimalDstBandwidth := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            id := mload(add(_payload, 32))
            _payload := add(_payload, 32)
        }
        swapMessage.srcPoolId = scrPoolId;
        swapMessage.dstPoolId = dstPoolId;
        swapMessage.receiver = receiver;
        swapMessage.amount = amount;
        swapMessage.fee = fee;
        swapMessage.vouchers = vouchers;
        swapMessage.optimalDstBandwidth = optimalDstBandwidth;
        swapMessage.id = id;
    }

    function decodeLiquidityMessage(
        bytes memory _payload
    )
        private
        pure
        returns (IAssetRouter.LiquidityMessage memory liquidityMessage)
    {
        uint16 scrPoolId;
        uint16 dstPoolId;
        uint256 vouchers;
        uint256 optimalDstBandwidth;
        bytes32 id;

        assembly ("memory-safe") {
            _payload := add(_payload, 1)

            scrPoolId := mload(add(_payload, 2))
            _payload := add(_payload, 2)

            dstPoolId := mload(add(_payload, 2))
            _payload := add(_payload, 2)

            vouchers := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            optimalDstBandwidth := mload(add(_payload, 32))
            _payload := add(_payload, 32)

            id := mload(add(_payload, 32))
            _payload := add(_payload, 32)
        }
        liquidityMessage.srcPoolId = scrPoolId;
        liquidityMessage.dstPoolId = dstPoolId;
        liquidityMessage.vouchers = vouchers;
        liquidityMessage.optimalDstBandwidth = optimalDstBandwidth;
        liquidityMessage.id = id;
    }

    function slice(
        bytes memory _bytes,
        uint256 _start,
        uint256 _length
    ) internal pure returns (bytes memory) {
        if (_length + 31 < _length) revert SliceOverflow();
        if (_bytes.length < _start + _length) revert SliceBoundsError();

        bytes memory tempBytes;

        // Check length is 0. `iszero` return 1 for `true` and 0 for `false`.
        assembly ("memory-safe") {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // Calculate length mod 32 to handle slices that are not a multiple of 32 in size.
                let lengthmod := and(_length, 31)

                // tempBytes will have the following format in memory: <length><data>
                // When copying data we will offset the start forward to avoid allocating additional memory
                // Therefore part of the length area will be written, but this will be overwritten later anyways.
                // In case no offset is require, the start is set to the data region (0x20 from the tempBytes)
                // mc will be used to keep track where to copy the data to.
                let mc := add(
                    add(tempBytes, lengthmod),
                    mul(0x20, iszero(lengthmod))
                )
                let end := add(mc, _length)

                for {
                    // Same logic as for mc is applied and additionally the start offset specified for the method is added
                    let cc := add(
                        add(
                            add(_bytes, lengthmod),
                            mul(0x20, iszero(lengthmod))
                        ),
                        _start
                    )
                } lt(mc, end) {
                    // increase `mc` and `cc` to read the next word from memory
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    // Copy the data from source (cc location) to the slice data (mc location)
                    mstore(mc, mload(cc))
                }

                // Store the length of the slice. This will overwrite any partial data that
                // was copied when having slices that are not a multiple of 32.
                mstore(tempBytes, _length)

                // update free-memory pointer
                // allocating the array padded to 32 bytes like the compiler does now
                // To set the used memory as a multiple of 32, add 31 to the actual memory usage (mc)
                // and remove the modulo 32 (the `and` with `not(31)`)
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            // if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)
                // zero out the 32 bytes slice we are about to return
                // we need to do it because Solidity does not garbage collect
                mstore(tempBytes, 0)

                // update free-memory pointer
                // tempBytes uses 32 bytes in memory (even when empty) for the length.
                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }

    /**
     * @notice  Returns the fee for a message sent onchain
     * @dev The parameters within this function are mock parameters as L0 fee calculation is based on params length and not the actual parameters
     *      That is why we are using address(this) as mock address
     * @param _chainId to what chain we want to estimate
     * @param _type what type of message we want to estimate
     * @param _payload the payload we want to send with the message, this is the actual payload we want to send with that type of message
     * @return
     * @return
     */
    function quoteLayerZeroFee(
        uint16 _chainId,
        IAssetRouter.MESSAGE_TYPE _type,
        bytes memory _payload
    ) external view returns (uint256, uint256) {
        bytes memory encodedMessage = "";

        if (_type == IAssetRouter.MESSAGE_TYPE.SWAP) {
            encodedMessage = abi.encodePacked(
                IAssetRouter.MESSAGE_TYPE.SWAP,
                type(uint16).max,
                type(uint16).max,
                address(this),
                type(uint256).max,
                type(uint256).max,
                type(uint256).max,
                type(uint256).max,
                keccak256(
                    abi.encode(
                        address(this),
                        1,
                        1,
                        IAssetRouter.MESSAGE_TYPE.SWAP
                    )
                ),
                _payload
            );
        } else if (_type == IAssetRouter.MESSAGE_TYPE.ADD_LIQUIDITY) {
            encodedMessage = abi.encodePacked(
                IAssetRouter.MESSAGE_TYPE.ADD_LIQUIDITY,
                type(uint16).max,
                type(uint16).max,
                type(uint256).max,
                type(uint256).max,
                keccak256(
                    abi.encode(
                        address(this),
                        1,
                        1,
                        IAssetRouter.MESSAGE_TYPE.SWAP
                    )
                )
            );
        } else {
            revert("invalid operation");
        }

        uint16 version = 1;
        bytes memory adapterParams = abi.encodePacked(
            version,
            gasLookup[_chainId][_type]
        );
        return
            layerZeroEndpoint.estimateFees(
                _chainId,
                address(this),
                encodedMessage,
                useLayerZeroToken,
                adapterParams
            );
    }

    function nextNonce(
        uint16 dstChain_
    ) public view override returns (uint256) {
        return layerZeroEndpoint.getOutboundNonce(dstChain_, address(this)) + 1;
    }

    function getReceivedSwaps(
        uint16 srcChain_,
        bytes32 id_
    ) external view override returns (IAssetRouter.SwapMessage memory) {
        return receivedSwapMessages[srcChain_][id_];
    }

    function getReceivedLiquidity(
        uint16 srcChain_,
        bytes32 id_
    ) external view override returns (IAssetRouter.LiquidityMessage memory) {
        return receivedLiquidityMessages[srcChain_][id_];
    }

    function setBridge(
        uint16 _chainId,
        bytes calldata _bridgeAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridgeLookup[_chainId] = abi.encodePacked(
            _bridgeAddress,
            address(this)
        );
    }

    function setRouter(
        IAssetRouter _newRouter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        router = _newRouter;
    }

    function setGasAmount(
        uint16 _chainId,
        IAssetRouter.MESSAGE_TYPE _functionType,
        uint256 _gasAmount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        gasLookup[_chainId][_functionType] = _gasAmount;
    }

    function approveTokenSpender(
        address token,
        address spender,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).approve(spender, amount);
    }

    function setUseLayerZeroToken(
        bool enable
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        useLayerZeroToken = enable;
    }

    function forceResumeReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        layerZeroEndpoint.forceResumeReceive(_srcChainId, _srcAddress);
    }

    function setConfig(
        uint16 _version,
        uint16 _chainId,
        uint256 _configType,
        bytes calldata _config
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        layerZeroEndpoint.setConfig(_version, _chainId, _configType, _config);
    }

    function setSendVersion(
        uint16 version
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        layerZeroEndpoint.setSendVersion(version);
    }

    function setReceiveVersion(
        uint16 version
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        layerZeroEndpoint.setReceiveVersion(version);
    }
}
