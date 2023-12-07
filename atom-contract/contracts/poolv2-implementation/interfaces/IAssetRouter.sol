// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IAssetRouter {
    //---------------------------------------------------------------------------
    // STRUCTS
    struct ChainPath {
        bool active;
        uint16 srcPoolId;
        uint16 dstChainId;
        uint16 dstPoolId;
        uint16 weight;
        uint256 bandwidth; // local bandwidth
        uint256 actualBandwidth; // local bandwidth
        uint256 kbp; // kbp = Known Bandwidth Proof dst bandwidth
        uint256 actualKbp; // kbp = Known Bandwidth Proof dst bandwidth
        uint256 vouchers;
        uint256 optimalDstBandwidth; // optimal dst bandwidth
        address poolAddress;
    }

    struct SwapParams {
        uint16 srcPoolId;
        uint16 dstPoolId;
        uint16 dstChainId;
        uint256 amount;
        uint256 minAmount;
        address payable refundAddress;
        address to;
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

    function receiveVouchers(
        uint16 _srcChainId,
        uint16 _srcPoolId,
        uint16 _dstPoolId,
        uint256 _vouchers,
        uint256 _optimalDstBandwidth,
        bool _swap
    ) external;

    function swapRemote(
        uint16 _srcPoolId,
        uint16 _dstPoolId,
        uint16 _srcChainId,
        address _to,
        uint256 _amount,
        uint256 _fee,
        uint256 _vouchers,
        uint256 _optimalDstBandwidth
    ) external;

    enum MESSAGE_TYPE {
        NONE,
        SWAP,
        ADD_LIQUIDITY
    }

    function swap(SwapParams memory swapParams) external payable returns (bytes32);

    function getPool(uint16 _poolId) external view returns (PoolObject memory);
}
