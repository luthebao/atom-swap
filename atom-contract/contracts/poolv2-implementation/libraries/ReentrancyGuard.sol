// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.8.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Reviewed reetrancy guard for better gas optimisation
 * @author @KONFeature
 * Based from solidity ReetrancyGuard :
 * https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/security/ReentrancyGuard.sol
 */
abstract contract ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  Constants                                 */
    /* -------------------------------------------------------------------------- */

    /// @dev Not entered function status
    uint256 private constant _NOT_ENTERED = 1;
    /// @dev Entered function status
    uint256 private constant _ENTERED = 2;

    /* -------------------------------------------------------------------------- */
    /*                                   Error's                                  */
    /* -------------------------------------------------------------------------- */

    /// @dev Error if function is reentrant
    error ReetrantCall();

    /// @dev 'bytes4(keccak256("ReetrantCall()"))'
    uint256 private constant _REETRANT_CALL_SELECTOR = 0x920856a0;

    /* -------------------------------------------------------------------------- */
    /*                                   Storage                                  */
    /* -------------------------------------------------------------------------- */

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        assembly ("memory-safe") {
            // Check if not re entrant
            if eq(sload(_status.slot), _ENTERED) {
                mstore(0x00, _REETRANT_CALL_SELECTOR)
                revert(0x1c, 0x04)
            }

            // Any calls to nonReentrant after this point will fail
            sstore(_status.slot, _ENTERED)
        }
        _;
        // Reset the reentrant slot
        assembly ("memory-safe") {
            sstore(_status.slot, _NOT_ENTERED)
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                           Internal view function                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}
