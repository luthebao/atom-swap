// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./ILayerZeroReceiver.sol";
import "./ILayerZeroEndpoint.sol";
import "./ILayerZeroUserApplicationConfig.sol";
import "./IAssetRouter.sol";

interface IBridge is ILayerZeroReceiver, ILayerZeroUserApplicationConfig {
    function lzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) external;

    // function swap(
    //     IAssetRouter.SwapParams memory _swapParams,
    //     IAssetRouter.CreditObj memory _c,
    //     IAssetRouter.SwapObj memory _s
    // ) external payable;

    // function sendVouchers(
    //     uint16 _chainId,
    //     uint16 _srcPoolId,
    //     uint16 _dstPoolId,
    //     address payable _refundAddress,
    //     IAssetRouter.VoucherObject memory _c
    // ) external payable;

    function nextNonce(uint16 dstChain_) external view returns (uint256);

    function getReceivedSwaps(
        uint16 _srcChainId,
        bytes32 _id
    ) external view returns (IAssetRouter.SwapMessage memory);

    function getReceivedLiquidity(
        uint16 srcChain_,
        bytes32 id_
    ) external view returns (IAssetRouter.LiquidityMessage memory);

    function dispatchMessage(
        uint16 _chainId,
        IAssetRouter.MESSAGE_TYPE _type,
        address payable _refundAddress,
        bytes memory _payload
    ) external payable;

    function quoteLayerZeroFee(
        uint16 _chainId,
        IAssetRouter.MESSAGE_TYPE _type,
        bytes memory _payload
    ) external view returns (uint256, uint256);
}
