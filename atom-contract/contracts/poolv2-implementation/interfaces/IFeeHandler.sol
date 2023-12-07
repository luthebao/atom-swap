// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ICrossRouter} from "./ICrossRouter.sol";

interface IFeeHandler {
    /**
     * @notice Apply slippage algorithm to an amount using bandwidth and optimal bandwidth of both src and dst
     * @param amount Amount we apply the slippage for
     * @param bandwidthSrc Bandwidth of the source pool
     * @param optimalBandwidthDst Optimal bandwidth of the destination pool
     * @param bandwidthDst Bandwidth of the destination pool
     * @param optimalBandwidthSrc Optimal bandwidth of the source pool
     * @return actualAmount The amount after applying slippage
     * @return fee The fee amount
     */
    function getFees(
        uint256 amount,
        uint256 bandwidthSrc,
        uint256 optimalBandwidthDst,
        uint256 bandwidthDst,
        uint256 optimalBandwidthSrc
    ) external view returns (uint256 actualAmount, uint256 fee);

    /**
     * @notice Compute the compensation ratio for a given bandwidth and optimal bandwidth
     * @param bandwidth Bandwidth of a pool
     * @param optimalBandwidth Optimal bandwidth of a pool
     * @return compensationRatio The compensation ratio
     */
    function getCompensatioRatio(
        uint256 bandwidth,
        uint256 optimalBandwidth
    ) external pure returns (uint256 compensationRatio);

    function swapFee() external view returns (uint256);

    function mintFee() external view returns (uint256);

    function burnFee() external view returns (uint256);
}
