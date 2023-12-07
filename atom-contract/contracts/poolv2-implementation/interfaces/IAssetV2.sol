// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./IAssetRouter.sol";

interface IAssetV2 {
    function mint(address _to, uint256 _amountLD) external returns (uint256);

    function release(address _to, uint256 _amount) external;

    function token() external view returns (address);
}
