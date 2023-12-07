// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./IAssetV2.sol";

interface IFeeCollectorV2 {
    function collectFees(IAssetV2 asset_, uint256 amount_) external;
}
