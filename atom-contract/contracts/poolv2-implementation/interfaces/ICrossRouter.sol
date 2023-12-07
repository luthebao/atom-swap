// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {Shared} from "../libraries/Shared.sol";
import {IBridge} from "./IBridge.sol";
import {ReentrancyGuard} from "../libraries/ReentrancyGuard.sol";

import {IFeeHandler} from "./IFeeHandler.sol";
import {ICrossRouter} from "./ICrossRouter.sol";
import {IAsset} from "./IAsset.sol";
import {IFeeCollectorV2} from "./IFeeCollectorV2.sol";

interface ICrossRouter is Shared {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct ChainPath {
        // Storage slot one
        bool active; // Mask: 0x0f
        uint16 srcPoolId; // Mask: 0xffff
        uint16 dstChainId; // Mask: 0xffff
        uint16 dstPoolId; // Mask: 0xffff
        uint16 weight; // Mask: 0xffff
        address poolAddress; // Mask: 0xffffffffffffffffffff Equivalent to uint160
        // Second storage slot
        uint256 bandwidth; // local bandwidth
        uint256 actualBandwidth; // local bandwidth
        uint256 kbp; // kbp = Known Bandwidth Proof dst bandwidth
        uint256 actualKbp; // kbp = Known Bandwidth Proof dst bandwidth
        uint256 vouchers;
        uint256 optimalDstBandwidth; // optimal dst bandwidth
    }

    struct SwapParams {
        uint16 srcPoolId; // Mask: 0xffff
        uint16 dstPoolId; // Mask: 0xffff
        uint16 dstChainId; // Mask: 0xffff  // Remain 208 bits
        address to;
        uint256 amount;
        uint256 minAmount;
        address payable refundAddress;
        bytes payload;
    }

    struct VoucherObject {
        uint256 vouchers;
        uint256 optimalDstBandwidth;
        bool swap;
    }

    struct PoolObject {
        uint16 poolId;
        address poolAddress;
        uint256 totalWeight;
        uint256 totalLiquidity;
        uint256 undistributedVouchers;
    }

    struct ChainData {
        uint16 srcPoolId;
        uint16 srcChainId;
        uint16 dstPoolId;
        uint16 dstChainId;
    }

    struct SwapMessage {
        uint16 srcChainId;
        uint16 srcPoolId;
        uint16 dstPoolId;
        address receiver;
        uint256 amount;
        uint256 fee;
        uint256 vouchers;
        uint256 optimalDstBandwidth;
        bytes32 id;
        bytes payload;
    }

    struct ReceiveSwapMessage {
        uint16 srcPoolId;
        uint16 dstPoolId;
        uint16 srcChainId;
        address receiver;
        uint256 amount;
        uint256 fee;
        uint256 vouchers;
        uint256 optimalDstBandwidth;
    }

    struct LiquidityMessage {
        uint16 srcPoolId;
        uint16 dstPoolId;
        uint256 vouchers;
        uint256 optimalDstBandwidth;
        bytes32 id;
    }

    /**
     * @notice Swaps crosschain assets
     * @dev DEXB is leveraging fragmented liquidity pools to crossswap assets. The slippage takes into account the
     * src bandwidth and dst bandwidth to calculate how many assets it should send. Fees will be calculated on src but
     * taken out of the dst chain.
     * @param swapParams The swap parameters
     *                       struct SwapParams {
     *                         uint16 srcPoolId;                   <= source pool id
     *                         uint16 dstPoolId;                   <= destination pool id
     *                         uint16 dstChainId;                  <= destination chain
     *                         address to;                         <= where to release the liquidity on dst
     *                         uint256 amount;                     <= the amount preferred for swap
     *                         uint256 minAmount;                  <= the minimum amount accepted for swap
     *                         address payable refundAddress;      <= refund cross-swap fee
     *                         bytes payload;                      <= payload to send to the destination chain
     *                     }
     * @return swapId The swap id
     */
    function swap(
        SwapParams memory swapParams
    ) external payable returns (bytes32 swapId);

    /**
     * @notice Deposits liquidity to a pool
     * @dev The amount deposited will be wrapped to the pool asset and the user will receive the same amount of assets -
     * fees
     * @param to The address to receive the assets
     * @param poolId The pool id
     * @param amount The amount to deposit
     */
    function deposit(address to, uint16 poolId, uint256 amount) external;

    /**
     * @notice Redeems liquidity from a pool
     * @dev The amount redeemed will be unwrapped from the pool asset
     * @param to The address to receive the assets
     * @param poolId The pool id
     * @param amount The amount to redeem
     */
    function redeemLocal(address to, uint16 poolId, uint256 amount) external;

    /**
     * @notice Syncs a pool with the current liquidity distribution
     * @dev We have this function in case it needs to be triggered manually
     * @param poolId The pool id
     */
    function sync(uint16 poolId) external;

    /**
     * @notice Sends vouchers to the destination chain
     * @dev This function is called by the bridge contract when a voucher message is received
     * @param srcPoolId The source pool id
     * @param dstChainId The destination chain id
     * @param dstPoolId The destination chain id
     * @param refundAddress The refund address for cross-swap fee
     */
    function sendVouchers(
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId,
        address payable refundAddress
    ) external payable returns (bytes32 messageId);

    /**
     * @notice Called by the bridge when a swap message is received
     * @param srcPoolId The pool id of the source pool
     * @param dstPoolId The pool id of the destination pool
     * @param srcChainId The chain id of the source chain
     * @param to The address to receive the assets
     * @param amount The amount that needs to be received
     * @param fee The fee that it will be collected
     * @param vouchers The amount of vouchers that were sent from src and distributed to dst
     * @param optimalDstBandwidth The optimal bandwidth that should be received so we can sync it
     */
    function swapRemote(
        uint16 srcPoolId,
        uint16 dstPoolId,
        uint16 srcChainId,
        address to,
        uint256 amount,
        uint256 fee,
        uint256 vouchers,
        uint256 optimalDstBandwidth,
        uint256 srcActualKbp
    ) external;

    /**
     * @notice Called by the bridge when vouchers are received
     * @param srcChainId The chain id of the source chain
     * @param srcPoolId The pool id of the source pool
     * @param dstPoolId The pool id of the destination pool
     * @param vouchers The amount of vouchers that were sent from src and distributed to dst
     * @param optimalDstBandwidth The optimal bandwidth that should be received so we can sync it
     * @param isSwap Whether or not the liquidity comes from a swap or not
     */
    function receiveVouchers(
        uint16 srcChainId,
        uint16 srcPoolId,
        uint16 dstPoolId,
        uint256 vouchers,
        uint256 optimalDstBandwidth,
        bool isSwap,
        uint256 srcActualKbp
    ) external;

    /**
     * @notice Quotes a possible cross swap
     * @dev Check swap method for swapParams explanation
     * @param swapParams The swap parameters
     * @return amount The amount of tokens that would be received
     * @return fee The fee that would be paid
     */
    function quoteSwap(
        SwapParams calldata swapParams
    ) external view returns (uint256 amount, uint256 fee);

    /**
     * @notice returns the effective path to move funds from A to B
     * @param dstChainId the destination chain id
     * @param amountToSimulate the amount to simulate to get the right path
     * @return effectivePath the effective path to move funds from A to B which represents poolId A and poolId B
     */
    function getEffectivePath(
        uint16 dstChainId,
        uint256 amountToSimulate
    ) external view returns (uint16[2] memory effectivePath);

    function getChainPathPublic(
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId
    ) external view returns (ChainPath memory path);

    function getPool(uint16 _poolId) external view returns (PoolObject memory);

    function poolIdsPerChain(
        uint16 chainId
    ) external view returns (uint16[] memory);

    function getChainPathsLength(uint16 poolId) external view returns (uint256);

    function getPaths(
        uint16 _poolId
    ) external view returns (ChainPath[] memory);

    function chainPathIndexLookup(bytes32 key) external view returns (uint256);

    function getFeeHandler() external view returns (IFeeHandler);

    function getFeeCollector() external view returns (IFeeCollectorV2);

    function getBridge() external view returns (IBridge);

    function getChainId() external view returns (uint16);

    function getBridgeVersion() external view returns (uint16);

    function getSyncDeviation() external view returns (uint256);

    /*//////////////////////////////////////////////////////////////
                                EVENTS AND ERRORS
    //////////////////////////////////////////////////////////////*/
    event CrossChainSwapInitiated(
        address indexed sender,
        bytes32 id,
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId,
        uint256 expectedAmount,
        uint256 actualAmount,
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
    event CrossChainLiquidityPerformed(LiquidityMessage message);
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
    event ChainPathUpdate(
        uint16 srcPoolId,
        uint16 dstChainId,
        uint16 dstPoolId,
        uint256 weight
    );
    event ChainActivated(uint16 srcPoolId, uint16 dstChainId, uint16 dstPoolId);
    event FeeHandlerUpdated(address oldFeeHandler, address newFeeHandler);
    event SyncDeviationUpdated(uint256 oldDeviation, uint256 newDeviation);
    event FeeCollected(uint256 fee);
    event AssetDeposited(address indexed to, uint16 poolId, uint256 amount);
    event AssetRedeemed(address indexed from, uint16 poolId, uint256 amount);
    event PoolSynced(uint16 poolId, uint256 distributedVouchers);
    event BridgeUpdated(IBridge oldBridge, IBridge newBridge);

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
    error AmountZero();
    error UnknownPool();
    error MathOverflow();
    error InsufficientSrcLiquidity();
    error InsufficientDstLiquidity();
}
