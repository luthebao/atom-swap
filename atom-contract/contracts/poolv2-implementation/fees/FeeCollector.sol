// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IFeeCollectorV2} from "../interfaces/IFeeCollectorV2.sol";
import {IAssetV2} from "../interfaces/IAssetV2.sol";

/**
 * @notice This is a dummy contract for testing purposes only.
 */
contract FeeCollector is IFeeCollectorV2, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 private constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");

    event FeesCollected(IAssetV2 asset, uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function collectFees(
        IAssetV2 asset_,
        uint256 amount_
    ) external onlyRole(COLLECTOR_ROLE) {
        IERC20(asset_.token()).safeTransferFrom(
            msg.sender,
            address(this),
            amount_
        );
        emit FeesCollected(asset_, amount_);
    }

    function withdraw(
        IERC20 token_,
        uint256 amount_
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        token_.safeTransfer(msg.sender, amount_);
    }

    function withdrawAll(IERC20 token_) external {
        withdraw(token_, token_.balanceOf(address(this)));
    }
}
