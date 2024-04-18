// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ICrossRouter} from "../interfaces/ICrossRouter.sol";
import {IFeeHandler} from "../interfaces/IFeeHandler.sol";
import {DSMath} from "../libraries/DSMath.sol";

/**
 * @author MineralX.tech Labs
 * @title FeeHandler
 * @notice This contract is used to handle fees within the MineralX.tech ecosystem. It is used to apply mint/burn/swap fees
 * or calculate the slippage
 */
contract FeeHandlerMock is IFeeHandler, AccessControl {
    using DSMath for uint128;
    using DSMath for uint256;

    /*//////////////////////////////////////////////////////////////
                                  FEES
    //////////////////////////////////////////////////////////////*/
    uint256 private _swapFee;
    uint256 private _burnFee;
    uint256 private _mintFee;
    uint256 private constant BP_DENOMINATOR = 10_000;

    /*//////////////////////////////////////////////////////////////
                                  SLIPPAGE
    //////////////////////////////////////////////////////////////*/

    SlippageParams public slippageParams;

    uint256 private constant WAD = 1e18;
    uint256 private constant BASE_POINTS = 100_000;

    /// @notice RAY to WAD ratio (equivalent to RAY / WAD)
    uint256 private constant RAY_TO_WAD_RATION = 1e9;

    struct SlippageParams {
        uint128 s1;
        uint128 s2;
        uint128 s3;
        uint128 s4;
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @inheritdoc IFeeHandler
     */
    function getFees(
        uint256 amount,
        uint256 bandwidthSrc,
        uint256 optimalBandwidthDst,
        uint256 bandwidthDst,
        uint256 optimalBandwidthSrc
    ) external view override returns (uint256 actualAmount, uint256 fee) {
        uint256 feePercentage;
        assembly ("memory-safe") {
            // Ensure params are valid
            if iszero(bandwidthSrc) {
                mstore(0, 0)
                mstore(0x20, 0)
                return(0, 0x40)
            }
            if iszero(optimalBandwidthDst) {
                mstore(0, 0)
                mstore(0x20, 0)
                return(0, 0x40)
            }
            if iszero(optimalBandwidthSrc) {
                mstore(0, 0)
                mstore(0x20, 0)
                return(0, 0x40)
            }
            if iszero(bandwidthDst) {
                mstore(0, 0)
                mstore(0x20, 0)
                return(0, 0x40)
            }

            feePercentage := sload(_swapFee.slot)
        }

        // We can safely use an unchecked block here, cause each WAD mul / div is checked
        unchecked {
            actualAmount = amount;
            // compute fee
            fee = (actualAmount * feePercentage) / BASE_POINTS;
        }
    }

    /**
     * @inheritdoc IFeeHandler
     */
    function getCompensatioRatio(
        uint256 bandwidth,
        uint256 optimalBandwidth
    ) external pure returns (uint256 compensationRatio) {
        compensationRatio =
            (optimalBandwidth * RAY_TO_WAD_RATION).wdiv(bandwidth) /
            RAY_TO_WAD_RATION;
    }

    /*//////////////////////////////////////////////////////////////
                               GOVERNANCE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Set the fee percentage for cross-swaps
     * @param fee The fee percentage
     */
    function setSwapFee(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (fee > BP_DENOMINATOR) revert FeeToHigh();
        emit FeeUpdated(_swapFee, fee);

        _swapFee = fee;
    }

    /**
     * @notice Set the fee percentage for deposits
     * @param fee The fee percentage
     */
    function setMintFee(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (fee > BP_DENOMINATOR) revert FeeToHigh();
        emit MintFeesUpdated(_mintFee, fee);

        _mintFee = fee;
    }

    /**
     * @notice Set the fee percentage for withdraws
     * @param fee The fee percentage
     */
    function setBurnFee(uint256 fee) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (fee > BP_DENOMINATOR) revert FeeToHigh();
        emit BurnFeesUpdated(_burnFee, fee);

        _burnFee = fee;
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/
    function swapFee() external view override returns (uint256) {
        return _swapFee;
    }

    function mintFee() external view override returns (uint256) {
        return _mintFee;
    }

    function burnFee() external view override returns (uint256) {
        return _burnFee;
    }

    /*//////////////////////////////////////////////////////////////
                           EVENTS AND ERRORS
    //////////////////////////////////////////////////////////////*/
    event MintFeesUpdated(uint256 oldFeePercentage, uint256 newFeePercentage);
    event BurnFeesUpdated(uint256 oldFeePercentage, uint256 newFeePercentage);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    error FeeToHigh();
}
