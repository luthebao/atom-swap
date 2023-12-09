// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IFeeHandler.sol";
import "./interfaces/IAssetRouter.sol";
import "./interfaces/IAssetV2.sol";
import "./interfaces/IBridge.sol";
import "./interfaces/IFeeCollectorV2.sol";
import "hardhat/console.sol";

contract AssetRouter is IAssetRouter, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");

    uint256 public constant BP_DENOMINATOR = 10000;

    /// @notice chainpaths per pool poolId=>chainPath
    mapping(uint16 => ChainPath[]) public chainPaths;

    /// @notice bytes of srcPoolId + chainId + dstPoolId => index in the array of chainpaths
    mapping(bytes => uint256) public chainPathIndexLookup;

    /// @notice lookup by poolId => PoolObject
    mapping(uint16 => PoolObject) public poolLookup;

    uint16 public chainId; // local chain id

    mapping(uint16 => uint16[]) public poolIdsPerChain; // ids of pools that are registered on a specific chain

    IFeeHandler public feeHandler; // address for retrieving fee params for swaps
    IFeeCollectorV2 public feeCollector;
    IBridge public bridge;

    uint256 public syncDeviation; // % of deviation accepted for triggering syncing

    event CrossChainSwapInitiated(
        address indexed sender,
        bytes32 id,
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId,
        uint256 amount,
        uint256 fee,
        uint256 vouchers,
        uint256 optimalDstBandwidth,
        bytes payload
    );
    event CrossChainSwapPerformed(
        uint16 srcPoolId,
        uint16 dstPoolId,
        uint16 srcChainId,
        address to,
        uint256 amount,
        uint256 fee
    );
    event CrossChainLiquidityInitiated(
        address indexed sender,
        bytes32 id,
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId,
        uint256 vouchers,
        uint256 optimalDstBandwidth
    );
    event CrossChainLiquidityPerformed(LiquidityMessage _message);
    event SendVouchers(
        uint16 dstChainId,
        uint16 dstPoolId,
        uint256 vouchers,
        uint256 optimalDstBandwidth
    );
    event VouchersReceived(
        uint16 chainId,
        uint16 srcPoolId,
        uint256 amount,
        uint256 optimalDstBandwidth
    );
    event SwapRemote(address to, uint256 amount, uint256 fee);
    event ChainPathUpdate(uint16 dstChainId, uint16 dstPoolId, uint256 weight);
    event FeeHandlerUpdated(address oldFeeHandler, address newFeeHandler);
    event SyncDeviationUpdated(uint256 oldDeviation, uint256 newDeviation);
    event FeeCollected(uint256 fee);

    error InactiveChainPath();
    error ActiveChainPath();
    error UnknownChainPath();
    error InsufficientLiquidity();
    error SlippageTooHigh();
    error SrcBandwidthTooLow();
    error DstBandwidthTooLow();
    error ChainPathExists();
    error FeeLibraryZero();
    error SyncDeviationTooHigh();
    error NotEnoughLiquidity();

    constructor(
        IFeeHandler _feeHandler,
        uint16 _chainId,
        IFeeCollectorV2 _feeCollector
    ) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(BRIDGE_ROLE, msg.sender);
        chainId = _chainId;
        feeHandler = _feeHandler;
        feeCollector = _feeCollector;
    }

    function getChainPathsLength(uint16 _poolId) public view returns (uint256) {
        return chainPaths[_poolId].length;
    }

    function swap(
        SwapParams calldata swapParams
    ) external payable nonReentrant returns (bytes32) {
        ChainPath storage cp = getChainPath(
            swapParams.srcPoolId,
            swapParams.dstChainId,
            swapParams.dstPoolId
        );
        PoolObject storage pool = poolLookup[swapParams.srcPoolId];
        if (!cp.active) revert InactiveChainPath();
        if (cp.actualKbp <= swapParams.amount) revert InsufficientLiquidity();
        SwapMessage memory swapMessage;
        swapMessage.payload = swapParams.payload;
        (swapMessage.amount, swapMessage.fee) = feeHandler.getFees(
            // swapParams.srcPoolId,
            swapParams.amount,
            cp.actualKbp,
            cp.optimalDstBandwidth,
            cp.actualBandwidth,
            (pool.totalLiquidity * cp.weight) / pool.totalWeight
        );

        if (swapMessage.amount <= swapParams.minAmount)
            revert SlippageTooHigh();
        if (cp.bandwidth <= swapParams.amount) revert SrcBandwidthTooLow();
        if (cp.kbp + cp.vouchers <= swapMessage.amount)
            revert DstBandwidthTooLow();
        if (cp.bandwidth <= swapMessage.amount) revert DstBandwidthTooLow();

        cp.bandwidth -= swapMessage.amount;
        cp.actualBandwidth -= swapMessage.amount;

        cp.actualKbp += swapMessage.amount;
        pool.undistributedVouchers += swapParams.amount;

        if (
            pool.undistributedVouchers >=
            (pool.totalLiquidity * syncDeviation) / BP_DENOMINATOR
        ) {
            _sync(pool);
        }

        (
            swapMessage.vouchers,
            swapMessage.optimalDstBandwidth
        ) = _sendVouchersInternal(cp, pool, true);

        IERC20(IAssetV2(pool.poolAddress).token()).safeTransferFrom(
            msg.sender,
            pool.poolAddress,
            swapParams.amount
        );
        {
            swapMessage.id = keccak256(
                abi.encodePacked(
                    bridge,
                    bridge.nextNonce(swapParams.dstChainId),
                    block.timestamp,
                    MESSAGE_TYPE.SWAP
                )
            );

            bridge.dispatchMessage{value: msg.value}(
                swapParams.dstChainId,
                MESSAGE_TYPE.SWAP,
                swapParams.refundAddress,
                abi.encodePacked(
                    MESSAGE_TYPE.SWAP,
                    swapParams.srcPoolId,
                    swapParams.dstPoolId,
                    swapParams.to,
                    swapMessage.amount,
                    swapMessage.fee,
                    swapMessage.vouchers,
                    swapMessage.optimalDstBandwidth,
                    swapMessage.id,
                    swapMessage.payload
                )
            );

            emit CrossChainSwapInitiated(
                msg.sender,
                swapMessage.id,
                swapParams.srcPoolId,
                swapParams.dstChainId,
                swapParams.dstPoolId,
                swapParams.amount,
                swapMessage.fee,
                swapMessage.vouchers,
                swapMessage.optimalDstBandwidth,
                swapMessage.payload
            );

            return swapMessage.id;
        }
    }

    function swapRemote(
        uint16 _srcPoolId,
        uint16 _dstPoolId,
        uint16 _srcChainId,
        address _to,
        uint256 _amount,
        uint256 _fee,
        uint256 _vouchers,
        uint256 _optimalDstBandwidth
    ) external nonReentrant onlyRole(BRIDGE_ROLE) {
        ChainPath storage cp = unsafeGetChainPath(
            _dstPoolId,
            _srcChainId,
            _srcPoolId
        );
        PoolObject storage pool = poolLookup[_dstPoolId];

        cp.bandwidth += _vouchers;
        if (cp.optimalDstBandwidth != _optimalDstBandwidth) {
            cp.optimalDstBandwidth = _optimalDstBandwidth;
        }
        emit VouchersReceived(
            _srcChainId,
            _srcPoolId,
            _vouchers,
            _optimalDstBandwidth
        );

        cp.kbp -= _amount;
        cp.actualKbp -= _amount;
        cp.actualBandwidth += _amount;
        IAssetV2(pool.poolAddress).release(_to, _amount);
        if (_fee > 0 && address(feeCollector) != address(0)) {
            emit FeeCollected(_fee);
            pool.totalLiquidity += _fee;
            // feeCollector.collectFees(_to, _s.fee); // TODO this needs to be implemented
        }
        emit CrossChainSwapPerformed(
            _srcPoolId,
            _dstPoolId,
            _srcChainId,
            _to,
            _amount,
            _fee
        );
    }

    function sendVouchers(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId,
        address payable _refundAddress
    ) public payable nonReentrant returns (bytes32 id) {
        ChainPath storage cp = getChainPath(
            _srcPoolId,
            _dstChainId,
            _dstPoolId
        );
        PoolObject storage pool = poolLookup[_srcPoolId];
        (uint256 vouchers, uint256 optimalDstBandwidth) = _sendVouchersInternal(
            cp,
            pool,
            false
        );
        id = keccak256(
            abi.encodePacked(
                bridge,
                bridge.nextNonce(_dstChainId),
                block.timestamp,
                MESSAGE_TYPE.ADD_LIQUIDITY
            )
        );
        bridge.dispatchMessage{value: msg.value}(
            _dstChainId,
            MESSAGE_TYPE.ADD_LIQUIDITY,
            _refundAddress,
            abi.encodePacked(
                MESSAGE_TYPE.ADD_LIQUIDITY,
                _srcPoolId,
                _dstPoolId,
                vouchers,
                optimalDstBandwidth,
                id
            )
        );
        emit CrossChainLiquidityInitiated(
            msg.sender,
            id,
            _srcPoolId,
            _dstChainId,
            _dstPoolId,
            vouchers,
            optimalDstBandwidth
        );
    }

    function _sendVouchersInternal(
        ChainPath storage cp,
        PoolObject storage pool,
        bool _swap
    ) internal returns (uint256 vouchers, uint256 optimalDstBandwidth) {
        if (!cp.active) revert InactiveChainPath();

        unchecked {
            cp.kbp += cp.vouchers;
            if (!_swap) cp.actualKbp += cp.vouchers;
            vouchers = cp.vouchers;
            cp.vouchers = 0;
        }
        optimalDstBandwidth =
            (pool.totalLiquidity * cp.weight) /
            pool.totalWeight;
    }

    function receiveVouchers(
        uint16 _srcChainId,
        uint16 _srcPoolId,
        uint16 _dstPoolId,
        uint256 _vouchers,
        uint256 _optimalDstBandwidth,
        bool _swap
    ) external nonReentrant onlyRole(BRIDGE_ROLE) {
        ChainPath storage cp = getChainPath(
            _dstPoolId,
            _srcChainId,
            _srcPoolId
        );

        cp.bandwidth += _vouchers;
        if (!_swap) {
            cp.actualBandwidth += _vouchers;
        }
        if (cp.optimalDstBandwidth != _optimalDstBandwidth) {
            cp.optimalDstBandwidth = _optimalDstBandwidth;
        }
        emit VouchersReceived(
            _srcChainId,
            _srcPoolId,
            _vouchers,
            _optimalDstBandwidth
        );
    }

    function deposit(address _to, uint16 _poolId, uint256 _amount) external {
        PoolObject storage pool = poolLookup[_poolId];
        pool.totalLiquidity += _amount;
        pool.undistributedVouchers += _amount;

        _sync(pool);

        IERC20(IAssetV2(pool.poolAddress).token()).safeTransferFrom(
            msg.sender,
            pool.poolAddress,
            _amount
        );
        IAssetV2(pool.poolAddress).mint(_to, _amount);
    }

    function createChainPath(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId,
        uint16 _weight,
        address _poolAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 chainPathLength = chainPaths[_srcPoolId].length;
        for (uint256 i; i < chainPathLength; ++i) {
            ChainPath memory cp = chainPaths[_srcPoolId][i];
            bool exists = cp.dstChainId == _dstChainId &&
                cp.dstPoolId == _dstPoolId &&
                cp.srcPoolId == _srcPoolId;
            if (exists) revert ActiveChainPath();
        }
        if (poolLookup[_srcPoolId].poolAddress == address(0)) {
            poolLookup[_srcPoolId] = PoolObject(
                _srcPoolId,
                _poolAddress,
                0,
                0,
                0
            );
        }
        poolLookup[_srcPoolId].totalWeight += _weight;
        chainPathIndexLookup[
            abi.encodePacked(_srcPoolId, _dstChainId, _dstPoolId)
        ] = chainPaths[_srcPoolId].length;
        chainPaths[_srcPoolId].push(
            ChainPath(
                false,
                _srcPoolId,
                _dstChainId,
                _dstPoolId,
                _weight,
                0,
                0,
                0,
                0,
                0,
                0,
                _poolAddress
            )
        );
        emit ChainPathUpdate(_dstChainId, _dstPoolId, _weight);
    }

    function setBridge(
        IBridge _newBridge
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bridge = _newBridge;
    }

    function setWeightForChainPath(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId,
        uint16 _weight
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ChainPath storage cp = getChainPath(
            _srcPoolId,
            _dstChainId,
            _dstPoolId
        );
        PoolObject storage pool = poolLookup[_srcPoolId];
        pool.totalWeight = pool.totalWeight - cp.weight + _weight;
        cp.weight = _weight;
        emit ChainPathUpdate(_dstChainId, _dstPoolId, _weight);
    }

    function setFeeLibrary(
        address _feeHandler
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_feeHandler == address(0)) revert FeeLibraryZero();
        emit FeeHandlerUpdated(address(feeHandler), _feeHandler);
        feeHandler = IFeeHandler(_feeHandler);
    }

    function setSyncDeviation(
        uint256 _syncDeviation
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_syncDeviation > BP_DENOMINATOR) revert SyncDeviationTooHigh();
        emit SyncDeviationUpdated(syncDeviation, _syncDeviation);
        syncDeviation = _syncDeviation;
    }

    function sync(uint16 _poolId) external {
        _sync(poolLookup[_poolId]);
    }

    function activateChainPath(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ChainPath storage cp = getChainPath(
            _srcPoolId,
            _dstChainId,
            _dstPoolId
        );
        if (cp.active) revert ActiveChainPath();
        cp.active = true;
        // we check if this pool id was registered in the poolIds if not, we add it
        bool found;
        uint256 poolLengthSrc = poolIdsPerChain[chainId].length;
        uint256 poolLengthDst = poolIdsPerChain[_dstChainId].length;
        for (uint256 i; i < poolLengthSrc; i++) {
            if (poolIdsPerChain[chainId][i] == _srcPoolId) {
                found = true;
            }
        }
        if (!found) {
            poolIdsPerChain[chainId].push(_srcPoolId);
        }

        found = false;
        for (uint256 i; i < poolLengthDst; i++) {
            if (poolIdsPerChain[_dstChainId][i] == _dstPoolId) {
                found = true;
            }
        }
        if (!found) {
            poolIdsPerChain[_dstChainId].push(_dstPoolId);
        }
    }

    function getChainPath(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId
    ) internal view returns (ChainPath storage) {
        ChainPath storage cp = chainPaths[_srcPoolId][
            chainPathIndexLookup[
                abi.encodePacked(_srcPoolId, _dstChainId, _dstPoolId)
            ]
        ];
        if (cp.dstChainId != _dstChainId) {
            revert UnknownChainPath();
        }
        if (cp.dstPoolId != _dstPoolId) {
            revert UnknownChainPath();
        }
        return cp;
    }

    function unsafeGetChainPath(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId
    ) internal view returns (ChainPath storage) {
        return
            chainPaths[_srcPoolId][
                chainPathIndexLookup[
                    abi.encodePacked(_srcPoolId, _dstChainId, _dstPoolId)
                ]
            ];
    }

    function getChainPathPublic(
        uint16 _srcPoolId,
        uint16 _dstChainId,
        uint16 _dstPoolId
    ) public view returns (ChainPath memory) {
        ChainPath storage cp = chainPaths[_srcPoolId][
            chainPathIndexLookup[
                abi.encodePacked(_srcPoolId, _dstChainId, _dstPoolId)
            ]
        ];
        if (cp.dstChainId != _dstChainId) {
            revert UnknownChainPath();
        }
        if (cp.dstPoolId != _dstPoolId) {
            revert UnknownChainPath();
        }
        return cp;
    }

    function quoteSwap(
        SwapParams calldata swapParams
    ) external view returns (uint256 amount, uint256 fee) {
        ChainPath storage cp = getChainPath(
            swapParams.srcPoolId,
            swapParams.dstChainId,
            swapParams.dstPoolId
        );
        PoolObject storage pool = poolLookup[swapParams.srcPoolId];
        if (!cp.active) revert InactiveChainPath();
        if (cp.actualKbp <= swapParams.amount) revert NotEnoughLiquidity();
        SwapMessage memory swapMessage;
        (amount, fee) = feeHandler.getFees(
            // swapParams.srcPoolId,
            swapParams.amount,
            cp.actualKbp,
            cp.optimalDstBandwidth,
            cp.actualBandwidth,
            (pool.totalLiquidity * cp.weight) / pool.totalWeight
        );

        if (cp.bandwidth < swapParams.amount) revert SrcBandwidthTooLow();
        if (cp.kbp + cp.vouchers < swapMessage.amount)
            revert DstBandwidthTooLow();
    }

    function getPool(uint16 _poolId) external view returns (PoolObject memory) {
        return poolLookup[_poolId];
    }

    /**
     * @notice returns the effective path to move funds from A to Bb
     * @param _dstChainId the destination chain id
     * @param _amountToSimulate the amount to simulate to get the right path
     */
    function getEffectivePath(
        uint16 _dstChainId,
        uint256 _amountToSimulate
    ) external view returns (uint16[2] memory effectivePath) {
        unchecked {
            uint16[] memory poolsSrc = poolIdsPerChain[chainId];
            uint16[] memory poolsDst = poolIdsPerChain[_dstChainId];

            uint256 actualAmount;
            int256 highestSlipp = type(int256).min;

            uint256 poolSrcLength = poolsSrc.length;
            uint256 poolDstLength = poolsDst.length;

            // TODO: nested loops are very inefficient. will work on a better way to do this. likely yul.

            for (uint256 i; i < poolSrcLength; i++) {
                PoolObject memory poolSrc = poolLookup[poolsSrc[i]];

                for (uint256 j; j < poolDstLength; j++) {
                    PoolObject memory poolDst = poolLookup[poolsDst[j]];
                    ChainPath memory cp = getChainPathPublic(
                        poolSrc.poolId,
                        _dstChainId,
                        poolDst.poolId
                    );

                    (actualAmount, ) = feeHandler.getFees(
                        // poolSrc.poolId,
                        _amountToSimulate,
                        cp.actualKbp,
                        cp.optimalDstBandwidth,
                        cp.actualBandwidth,
                        (poolSrc.totalLiquidity * cp.weight) /
                            poolSrc.totalWeight
                    );

                    // deal with the case when optimal bandwidth or bandwidth is 0 for a chain, meaning that chain does not have liquidity
                    if (actualAmount == 0) continue;
                    int256 diff = int256(actualAmount) -
                        int256(_amountToSimulate);

                    if (diff > highestSlipp) {
                        highestSlipp = diff;
                        effectivePath = [poolSrc.poolId, poolDst.poolId];
                    }
                }
            }
        }
    }

    /**
     * @notice Syncs chainpaths for a specific pool
     * @dev (liquidity * (weight/totalWeight)) - (kbp+vouchers)
     * @param pool the pool to sync for
     */
    function _sync(PoolObject storage pool) internal {
        uint256 undistributedVouchers = pool.undistributedVouchers;

        if (pool.totalWeight > 0) {
            uint256 cpLength = chainPaths[pool.poolId].length;
            uint256[] memory deficit = new uint256[](cpLength);
            uint256 totalDeficit = 0;

            for (uint256 i; i < cpLength; ) {
                ChainPath storage cp = chainPaths[pool.poolId][i];

                uint256 balLiq = (pool.totalLiquidity * cp.weight) /
                    pool.totalWeight;

                uint256 currLiq = cp.kbp + cp.vouchers;
                if (balLiq > currLiq) {
                    unchecked {
                        // todo check if this overflows
                        deficit[i] = balLiq - currLiq;
                        totalDeficit = totalDeficit + deficit[i];
                    }
                }

                unchecked {
                    ++i;
                }
            }
            uint256 spentVouchers;
            if (totalDeficit == 0 && undistributedVouchers > 0) {
                for (uint256 i = 0; i < cpLength; ) {
                    ChainPath storage cp = chainPaths[pool.poolId][i];
                    uint256 consumed = (pool.undistributedVouchers *
                        cp.weight) / pool.totalWeight;
                    unchecked {
                        spentVouchers += consumed;
                        cp.vouchers += consumed;
                        ++i;
                    }
                }
            } else if (totalDeficit <= undistributedVouchers) {
                for (uint256 i; i < cpLength; ) {
                    if (deficit[i] > 0) {
                        ChainPath storage cp = chainPaths[pool.poolId][i];
                        uint256 consumed = deficit[i];
                        unchecked {
                            // todo check if this overflows
                            spentVouchers += consumed;
                            cp.vouchers = cp.vouchers + consumed;
                        }
                    }
                    unchecked {
                        ++i;
                    }
                }
            } else {
                for (uint256 i; i < cpLength; ) {
                    if (deficit[i] > 0) {
                        ChainPath storage cp = chainPaths[pool.poolId][i];
                        uint256 proportionalDeficit = (deficit[i] *
                            undistributedVouchers) / totalDeficit;
                        unchecked {
                            // todo check if this overflows
                            spentVouchers += proportionalDeficit;
                            cp.vouchers += proportionalDeficit;
                        }
                    }
                    unchecked {
                        ++i;
                    }
                }
            }

            pool.undistributedVouchers -= spentVouchers;
        }
    }
}
