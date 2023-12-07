// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// imports
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "./interfaces/IAssetV2.sol";
import "hardhat/console.sol";

contract AssetV2 is IAssetV2, ERC20, ERC20Burnable, ERC20Permit, ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    uint256 public constant BP_DENOMINATOR = 10_000;
    bytes32 public constant ROUTER_ROLE = keccak256("ROUTER_ROLE");

    IERC20 public immutable _token;

    uint256 public mintfeePercentage; // not used for now
    uint256 public mintFeeBalance;

    uint256 public feePercentage; // denominated in 10_000. 10_000 = 100%

    event Mint(address to, uint256 amount, uint256 fee);
    event FeesUpdated(uint256 oldFee, uint256 newFee);

    error CumulativeFeeTooHigh();

    constructor(
        address _tokenAddress,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) ERC20Permit(_name) {
        require(_tokenAddress != address(0), "Token can not be zero");
        _token = IERC20(_tokenAddress);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ROUTER_ROLE, msg.sender);
    }

    function mint(address _to, uint256 _amountLD) external nonReentrant onlyRole(ROUTER_ROLE) returns (uint256) {
        return _mintInternal(_to, _amountLD, true);
    }

    function setFee(uint256 _feePercentage) external onlyRole(ROUTER_ROLE) {
        if (_feePercentage > BP_DENOMINATOR) revert CumulativeFeeTooHigh();
        emit FeesUpdated(mintfeePercentage, _feePercentage);

        mintfeePercentage = _feePercentage;
    }

    function release(address _to, uint256 _amount) external onlyRole(ROUTER_ROLE) {
        _token.safeTransfer(_to, _amount);
    }

    function decimals() public view override returns (uint8) {
        return IERC20Metadata(address(_token)).decimals();
    }

    function token() public view override returns (address) {
        return address(_token);
    }

    function _mintInternal(address _to, uint256 _amount, bool _feesEnabled) internal returns (uint256) {
        uint256 fee;
        if (_feesEnabled) {
            fee = (_amount * mintfeePercentage) / BP_DENOMINATOR;
            _amount = _amount - fee;
            mintFeeBalance = mintFeeBalance + fee;
        }

        uint256 amountLPTokens = _amount;

        _mint(_to, amountLPTokens);
        emit Mint(_to, _amount, fee);
        return _amount;
    }
}
