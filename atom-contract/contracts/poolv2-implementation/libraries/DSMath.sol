// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @title Library used to perform WAD and RAY math
 * @author @KONFeature
 * @author @MorphoUtils : https://github.com/Vectorized/solady/blob/main/src/utils/FixedPointMathLib.sol
 * @author @Solmate : https://github.com/transmissions11/solmate/blob/main/src/utils/FixedPointMathLib.sol
 * @author @Solady : https://github.com/Vectorized/solady/blob/main/src/utils/FixedPointMathLib.sol
 */
library DSMath {
    /* -------------------------------------------------------------------------- */
    /*                                 Constant's                                 */
    /* -------------------------------------------------------------------------- */

    uint256 private constant WAD = 1e18;
    uint256 private constant RAY = 1e27;

    uint256 internal constant HALF_WAD = 0.5e18;
    uint256 internal constant HALF_RAY = 0.5e27;

    // Max uint's
    uint256 internal constant MAX_UINT256 = 2 ** 256 - 1;
    uint256 internal constant MAX_UINT256_MINUS_HALF_WAD = 2 ** 256 - 1 - 0.5e18;
    uint256 internal constant MAX_UINT256_MINUS_HALF_RAY = 2 ** 256 - 1 - 0.5e27;

    /* -------------------------------------------------------------------------- */
    /*                                   Error's                                  */
    /* -------------------------------------------------------------------------- */

    error MathOverflow();

    /// @dev 'bytes4(keccak256("MathOverflow()"))'
    uint256 private constant _MATH_OVERFLOW_SELECTOR = 0x9d565d4e;

    /// @dev wad multiplication (so 1 eth * 1 eth = 1 eth)
    function wmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        assembly ("memory-safe") {
            if mul(y, gt(x, div(MAX_UINT256, y))) {
                mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                revert(0x1c, 0x04)
            }

            z := div(mul(x, y), WAD)
        }
    }

    /// @dev wad division (so 1 eth / 1 eth = 1 eth)
    function wdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
        assembly ("memory-safe") {
            if iszero(mul(y, lt(x, add(div(MAX_UINT256, WAD), 1)))) {
                mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                revert(0x1c, 0x04)
            }

            z := div(mul(WAD, x), y)
        }
    }

    function reciprocal(uint256 x) internal pure returns (uint256) {
        return wdiv(WAD, x);
    }

    /// Adapted from : https://github.com/transmissions11/solmate/blob/main/src/utils/FixedPointMathLib.sol#72
    function wpow(uint256 x, uint256 n) internal pure returns (uint256 z) {
        assembly ("memory-safe") {
            switch x
            case 0 {
                switch n
                case 0 {
                    // 0 ** 0 = 1
                    z := WAD
                }
                default {
                    // 0 ** n = 0
                    z := 0
                }
            }
            default {
                switch mod(n, 2)
                case 0 {
                    // If n is even, store scalar in z for now.
                    z := WAD
                }
                default {
                    // If n is odd, store x in z for now.
                    z := x
                }

                // Shifting right by 1 is like dividing by 2.
                let half := shr(1, WAD)

                for {
                    // Shift n right by 1 before looping to halve it.
                    n := shr(1, n)
                } n {
                    // Shift n right by 1 each iteration to halve it.
                    n := shr(1, n)
                } {
                    // Revert immediately if x ** 2 would overflow.
                    // Equivalent to iszero(eq(div(xx, x), x)) here.
                    if shr(128, x) {
                        mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                        revert(0x1c, 0x04)
                    }

                    // Store x squared.
                    let xx := mul(x, x)

                    // Round to the nearest number.
                    let xxRound := add(xx, half)

                    // Revert if xx + half overflowed.
                    if lt(xxRound, xx) {
                        mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                        revert(0x1c, 0x04)
                    }

                    // Set x to scaled xxRound.
                    x := div(xxRound, WAD)

                    // If n is even:
                    if mod(n, 2) {
                        // Compute z * x.
                        let zx := mul(z, x)

                        // If z * x overflowed:
                        if iszero(eq(div(zx, x), z)) {
                            // Revert if x is non-zero.
                            if iszero(iszero(x)) {
                                mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                                revert(0x1c, 0x04)
                            }
                        }

                        // Round to the nearest number.
                        let zxRound := add(zx, half)

                        // Revert if zx + half overflowed.
                        if lt(zxRound, zx) {
                            mstore(0x00, _MATH_OVERFLOW_SELECTOR)
                            revert(0x1c, 0x04)
                        }

                        // Return properly scaled zxRound.
                        z := div(zxRound, WAD)
                    }
                }
            }
        }
    }
}
