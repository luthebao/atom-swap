// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../libraries/EIP712.sol";
import "../poolv2-implementation/interfaces/IAssetRouter.sol";
import "../poolv2-implementation/interfaces/IBridge.sol";
import "../poolv2-implementation/interfaces/IAssetV2.sol";
import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IWrappedNativeToken.sol";

contract DEXBAggregatorUniswap is AccessControl, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using Counters for Counters.Counter;

    struct PendingSwap {
        bytes32 id;
        IERC20 lwsToken;
        uint16 lwsPoolId;
        uint16 hgsPoolId;
        IERC20 dstToken;
        uint16 dstChainId;
        address receiver;
        bool processed;
        uint256 minHgsAmount;
        bytes signature;
    }

    struct SwapParams {
        IERC20 srcToken;
        uint256 srcAmount;
        //        address router1Inch;
        //        bytes data;
        uint16 lwsPoolId;
        uint16 hgsPoolId;
        IERC20 dstToken;
        uint16 dstChain;
        address dstAggregatorAddress;
        uint256 minHgsAmount;
        bytes signature;
    }

    struct ContinueSwapParams {
        uint16 srcChainId;
        bytes32 id;
        //        address router1Inch;
        //        bytes data;
    }

    struct PayloadData {
        //        uint256 srcChainId;
        //        address srcAggregatorAddress;
        uint16 lwsPoolId;
        uint16 hgsPoolId;
        IERC20 dstToken;
        uint256 minHgsAmount;
        address receiver;
        bytes signature;
    }

    struct AggregatorInfo {
        address srcAggregatorAddress;
        uint16 l0ChainId;
        uint256 chainId;
    }

    IAssetRouter public assetRouter;
    IBridge public bridge;
    IUniswapV2Router02 public uniswap;
    mapping(bytes32 => PendingSwap) public pendingSwaps;
    bool initialized;
    IWrappedNativeToken public wrappedNativeToken;
    mapping(uint16 => AggregatorInfo) public aggregatorInfos;
    mapping(uint16 => mapping(bytes32 => bool)) public continuedSwaps;

    bytes32 public constant CONTINUE_EXECUTOR_ROLE =
        keccak256("CONTINUE_EXECUTOR_ROLE");
    address public constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    event NewPendingSwap(bytes32 id);
    event SwapContinued(bytes32 id);
    event AggregatorInfosUpdated();

    constructor() EIP712("DEXB Swap", "0.0.1") {}

    function initialize(
        IAssetRouter assetRouter_,
        IBridge bridge_,
        IUniswapV2Router02 uniswap_,
        IWrappedNativeToken wrappedNativeToken_,
        address admin
    ) external {
        require(!initialized, "initialized");
        assetRouter = assetRouter_;
        bridge = bridge_;
        uniswap = uniswap_;
        wrappedNativeToken = wrappedNativeToken_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        initialized = true;
    }

    function setAggregatorInfos(
        AggregatorInfo[] calldata infos
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < infos.length; i++) {
            aggregatorInfos[infos[i].l0ChainId] = infos[i];
        }
        emit AggregatorInfosUpdated();
    }

    function updateAssetRouter(
        IAssetRouter assetRouter_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        assetRouter = assetRouter_;
    }

    function updateBridge(
        IBridge bridge_
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridge = bridge_;
    }

    function _approve(IERC20 token, address operator, uint256 amount) internal {
        token.safeApprove(operator, 0);
        token.safeApprove(operator, amount);
    }

    function startSwap(SwapParams memory params) external payable {
        uint256 value = msg.value;

        require(params.lwsPoolId != 0 && params.hgsPoolId != 0, "!lws/hgs");
        IERC20 lwsToken = IERC20(
            IAssetV2(assetRouter.getPool(params.lwsPoolId).poolAddress).token()
        );
        require(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Parameters(address receiver,uint16 lwsPoolId,uint16 hgsPoolId,address dstToken,uint256 minHgsAmount)"
                        ),
                        msg.sender,
                        params.lwsPoolId,
                        params.hgsPoolId,
                        params.dstToken,
                        params.minHgsAmount
                    )
                ),
                block.chainid,
                address(this)
            ).recover(params.signature) == msg.sender,
            "!signature"
        );

        // src -> lws
        if (address(params.srcToken) == NATIVE_TOKEN) {
            require(value >= params.srcAmount, "insufficient value");
            value -= params.srcAmount;
            wrappedNativeToken.deposit{value: params.srcAmount}();
            params.srcToken = IERC20(wrappedNativeToken);
        } else {
            params.srcToken.safeTransferFrom(
                msg.sender,
                address(this),
                params.srcAmount
            );
        }
        uint256 returnAmount;
        if (
            params.srcToken != lwsToken /*&& params.router1Inch != address(0)*/
        ) {
            uint256 srcBefore = params.srcToken.balanceOf(address(this)) -
                params.srcAmount;
            uint256 lwsBefore = lwsToken.balanceOf(address(this));

            _approve(params.srcToken, address(uniswap), params.srcAmount);

            //            (bool success, ) = params.router1Inch.call{ value: 0 }(params.data);
            //            require(success, "!inSuccess");
            uniswapSwap(params.srcToken, lwsToken, params.srcAmount);
            uint256 unspentAmount = params.srcToken.balanceOf(address(this)) -
                srcBefore;
            returnAmount = lwsToken.balanceOf(address(this)) - lwsBefore;
            if (unspentAmount > 0) {
                params.srcToken.safeTransfer(msg.sender, unspentAmount);
            }
        } else {
            returnAmount = params.srcAmount;
        }

        // lws -> hgs
        _approve(lwsToken, address(assetRouter), returnAmount);
        bytes memory payload = abi.encodePacked(
            params.lwsPoolId,
            params.hgsPoolId,
            params.dstToken,
            params.minHgsAmount,
            msg.sender,
            params.signature
        );
        bytes32 swapId = assetRouter.swap{value: value}(
            IAssetRouter.SwapParams({
                srcPoolId: params.lwsPoolId,
                dstPoolId: params.hgsPoolId,
                dstChainId: params.dstChain,
                amount: returnAmount,
                minAmount: params.minHgsAmount,
                refundAddress: payable(msg.sender),
                to: params.dstAggregatorAddress,
                payload: payload
            })
        );

        PendingSwap storage swap = pendingSwaps[swapId];
        swap.id = swapId;
        swap.lwsToken = lwsToken;
        swap.lwsPoolId = params.lwsPoolId;
        swap.hgsPoolId = params.hgsPoolId;
        swap.dstToken = params.dstToken;
        swap.dstChainId = params.dstChain;
        swap.receiver = msg.sender;
        swap.minHgsAmount = params.minHgsAmount;
        swap.signature = params.signature;

        emit NewPendingSwap(swapId);
    }

    function continueSwap(
        ContinueSwapParams memory params
    ) external onlyRole(CONTINUE_EXECUTOR_ROLE) {
        require(
            !continuedSwaps[params.srcChainId][params.id],
            "already continued"
        );
        IAssetRouter.SwapMessage memory swapMsg = bridge.getReceivedSwaps(
            params.srcChainId,
            params.id
        );
        PayloadData memory payload;
        bytes memory data = swapMsg.payload;
        // TODO: check for dirty bits
        assembly ("memory-safe") {
            let sigLength := sub(mload(data), 76)
            data := add(data, 32)
            let payloadPtr := payload

            //            mstore(payloadPtr, mload(data)) // uint256 srcChainId
            //            data := add(data, 32)
            //            payloadPtr := add(payloadPtr, 32)
            //
            //            mstore(payloadPtr, shr(96, mload(data))) // address srcAggregatorAddress
            //            data := add(data, 20)
            //            payloadPtr := add(payloadPtr, 32)

            mstore(payloadPtr, shr(240, mload(data))) // uint16 lwsPoolId
            data := add(data, 2)
            payloadPtr := add(payloadPtr, 32)

            mstore(payloadPtr, shr(240, mload(data))) // uint16 hgsPoolId
            data := add(data, 2)
            payloadPtr := add(payloadPtr, 32)

            mstore(payloadPtr, shr(96, mload(data))) // address dstToken
            data := add(data, 20)
            payloadPtr := add(payloadPtr, 32)

            mstore(payloadPtr, mload(data)) // uint256 minHgsAmount
            data := add(data, 32)
            payloadPtr := add(payloadPtr, 32)

            mstore(payloadPtr, shr(96, mload(data))) // address receiver
            data := sub(data, 12) // + 20 - 32
            payloadPtr := add(payloadPtr, 32)

            mstore(data, sigLength) // set signature length
            mstore(payloadPtr, data) // bytes signature
        }
        IERC20 hgsToken = IERC20(
            IAssetV2(assetRouter.getPool(payload.hgsPoolId).poolAddress).token()
        );

        require(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Parameters(address receiver,uint16 lwsPoolId,uint16 hgsPoolId,address dstToken,uint256 minHgsAmount)"
                        ),
                        payload.receiver,
                        payload.lwsPoolId,
                        payload.hgsPoolId,
                        payload.dstToken,
                        payload.minHgsAmount
                    )
                ),
                aggregatorInfos[swapMsg.srcChainId].chainId,
                aggregatorInfos[swapMsg.srcChainId].srcAggregatorAddress
            ).recover(payload.signature) == payload.receiver,
            "!signature"
        );

        // hgs -> dst
        bool isDstNative = address(payload.dstToken) == NATIVE_TOKEN;
        if (isDstNative) {
            payload.dstToken = IERC20(wrappedNativeToken);
        }
        uint256 returnAmount;
        if (
            hgsToken != payload.dstToken /*&& params.router1Inch != address(0)*/
        ) {
            uint256 hgsBefore = hgsToken.balanceOf(address(this)) -
                swapMsg.amount;
            uint256 dstBefore = payload.dstToken.balanceOf(address(this));

            _approve(hgsToken, address(uniswap), swapMsg.amount);
            //            (bool success, ) = params.router1Inch.call{ value: 0 }(params.data);
            //            require(success, "!inSuccess");
            uniswapSwap(hgsToken, payload.dstToken, swapMsg.amount);
            uint256 unspentAmount = hgsToken.balanceOf(address(this)) -
                hgsBefore;
            returnAmount =
                payload.dstToken.balanceOf(address(this)) -
                dstBefore;
            if (unspentAmount > 0) {
                hgsToken.safeTransfer(payload.receiver, unspentAmount);
            }
        } else {
            returnAmount = swapMsg.amount;
        }
        if (returnAmount > 0) {
            if (isDstNative) {
                wrappedNativeToken.withdraw(returnAmount);
                payable(payload.receiver).transfer(returnAmount);
            } else {
                payload.dstToken.safeTransfer(payload.receiver, returnAmount);
            }
        }
        continuedSwaps[params.srcChainId][params.id] = true;
        emit SwapContinued(params.id);
    }

    function withdrawTokens(
        IERC20 token,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        token.safeTransfer(msg.sender, amount);
    }

    function uniswapSwap(
        IERC20 fromToken,
        IERC20 toToken,
        uint256 fromAmount
    ) internal {
        address[] memory path = new address[](2);
        path[0] = address(fromToken);
        path[1] = address(toToken);
        uniswap.swapExactTokensForTokens(
            fromAmount,
            0,
            path,
            address(this),
            block.timestamp + 1000
        );
    }

    receive() external payable {
        require(msg.sender == address(wrappedNativeToken), "invalid sender");
    }
}
