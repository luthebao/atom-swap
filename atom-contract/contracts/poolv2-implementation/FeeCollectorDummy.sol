// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFeeCollectorV2.sol";
import "./interfaces/IAssetV2.sol";

contract FeeCollectorDummy is IFeeCollectorV2, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant COLLECTOR_ROLE = keccak256("COLLECTOR_ROLE");

    event FeesCollected(IAssetV2 asset, uint256 amount);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
        uint256 amount__
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        token_.safeTransfer(msg.sender, amount__);
    }

    function withdrawAll(IERC20 token_) external {
        withdraw(token_, token_.balanceOf(address(this)));
    }
}
