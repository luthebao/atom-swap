// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAsset {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function release(address to, uint256 amount) external;
    function token() external view returns (address);
}
