

export const ABI_UNISWAP = [
    {
        "inputs": [],
        "name": "WETH",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountADesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "addLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenDesired",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETHMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "addLiquidityETH",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountToken",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETH",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "factory",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveOut",
                "type": "uint256"
            }
        ],
        "name": "getAmountIn",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveOut",
                "type": "uint256"
            }
        ],
        "name": "getAmountOut",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            }
        ],
        "name": "getAmountsIn",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            }
        ],
        "name": "getAmountsOut",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "reserveB",
                "type": "uint256"
            }
        ],
        "name": "quote",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "removeLiquidity",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETHMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "removeLiquidityETH",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountToken",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETH",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETHMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "removeLiquidityETHSupportingFeeOnTransferTokens",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountETH",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETHMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "approveMax",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "removeLiquidityETHWithPermit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountToken",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETH",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountTokenMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountETHMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "approveMax",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountETH",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenA",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenB",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "liquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountAMin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountBMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "approveMax",
                "type": "bool"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "removeLiquidityWithPermit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amountA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountB",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapETHForExactTokens",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactTokensForETH",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountInMax",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapTokensForExactETH",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountInMax",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "swapTokensForExactTokens",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const

export const ABI_DEXB = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [],
        "name": "AggregatorInfosUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            }
        ],
        "name": "NewPendingSwap",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "previousAdminRole",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "newAdminRole",
                "type": "bytes32"
            }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            }
        ],
        "name": "SwapContinued",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "CONTINUE_EXECUTOR_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "NATIVE_TOKEN",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "name": "aggregatorInfos",
        "outputs": [
            {
                "internalType": "address",
                "name": "srcAggregatorAddress",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "l0ChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "chainId",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "assetRouter",
        "outputs": [
            {
                "internalType": "contract IAssetRouter",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "bridge",
        "outputs": [
            {
                "internalType": "contract IBridge",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "srcChainId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    }
                ],
                "internalType": "struct DEXBAggregatorUniswap.ContinueSwapParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "continueSwap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            },
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "continuedSwaps",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleAdmin",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "hasRole",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IAssetRouter",
                "name": "assetRouter_",
                "type": "address"
            },
            {
                "internalType": "contract IBridge",
                "name": "bridge_",
                "type": "address"
            },
            {
                "internalType": "contract IUniswapV2Router02",
                "name": "uniswap_",
                "type": "address"
            },
            {
                "internalType": "contract IWrappedNativeToken",
                "name": "wrappedNativeToken_",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin",
                "type": "address"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "pendingSwaps",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "internalType": "contract IERC20",
                "name": "lwsToken",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "lwsPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "hgsPoolId",
                "type": "uint16"
            },
            {
                "internalType": "contract IERC20",
                "name": "dstToken",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "processed",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "minHgsAmount",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "srcAggregatorAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint16",
                        "name": "l0ChainId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "chainId",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct DEXBAggregatorUniswap.AggregatorInfo[]",
                "name": "infos",
                "type": "tuple[]"
            }
        ],
        "name": "setAggregatorInfos",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "contract IERC20",
                        "name": "srcToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "srcAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint16",
                        "name": "lwsPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "hgsPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "contract IERC20",
                        "name": "dstToken",
                        "type": "address"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstChain",
                        "type": "uint16"
                    },
                    {
                        "internalType": "address",
                        "name": "dstAggregatorAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minHgsAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "signature",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct DEXBAggregatorUniswap.SwapParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "startSwap",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniswap",
        "outputs": [
            {
                "internalType": "contract IUniswapV2Router02",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IAssetRouter",
                "name": "assetRouter_",
                "type": "address"
            }
        ],
        "name": "updateAssetRouter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IBridge",
                "name": "bridge_",
                "type": "address"
            }
        ],
        "name": "updateBridge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IERC20",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wrappedNativeToken",
        "outputs": [
            {
                "internalType": "contract IWrappedNativeToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
] as const


export const ABI_ASSET_ROUTER = [
    {
        "inputs": [
            {
                "internalType": "contract IFeeHandler",
                "name": "_feeHandler",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "_chainId",
                "type": "uint16"
            },
            {
                "internalType": "contract IFeeCollectorV2",
                "name": "_feeCollector",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ActiveChainPath",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ChainPathExists",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "DstBandwidthTooLow",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "FeeLibraryZero",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InactiveChainPath",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InsufficientLiquidity",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotEnoughLiquidity",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SlippageTooHigh",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SrcBandwidthTooLow",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "SyncDeviationTooHigh",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "UnknownChainPath",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "weight",
                "type": "uint256"
            }
        ],
        "name": "ChainPathUpdate",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "srcPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "vouchers",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "optimalDstBandwidth",
                "type": "uint256"
            }
        ],
        "name": "CrossChainLiquidityInitiated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "srcPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "vouchers",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "optimalDstBandwidth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes32",
                        "name": "id",
                        "type": "bytes32"
                    }
                ],
                "indexed": false,
                "internalType": "struct IAssetRouter.LiquidityMessage",
                "name": "_message",
                "type": "tuple"
            }
        ],
        "name": "CrossChainLiquidityPerformed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "srcPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "vouchers",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "optimalDstBandwidth",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "payload",
                "type": "bytes"
            }
        ],
        "name": "CrossChainSwapInitiated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "srcPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "srcChainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "CrossChainSwapPerformed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "FeeCollected",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "oldFeeHandler",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "newFeeHandler",
                "type": "address"
            }
        ],
        "name": "FeeHandlerUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "previousAdminRole",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "newAdminRole",
                "type": "bytes32"
            }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            }
        ],
        "name": "RoleRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "vouchers",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "optimalDstBandwidth",
                "type": "uint256"
            }
        ],
        "name": "SendVouchers",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "name": "SwapRemote",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "oldDeviation",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newDeviation",
                "type": "uint256"
            }
        ],
        "name": "SyncDeviationUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "chainId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "srcPoolId",
                "type": "uint16"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "optimalDstBandwidth",
                "type": "uint256"
            }
        ],
        "name": "VouchersReceived",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "BP_DENOMINATOR",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "BRIDGE_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            }
        ],
        "name": "activateChainPath",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "bridge",
        "outputs": [
            {
                "internalType": "contract IBridge",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "chainId",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "name": "chainPathIndexLookup",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "chainPaths",
        "outputs": [
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            },
            {
                "internalType": "uint16",
                "name": "srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "weight",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "bandwidth",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "actualBandwidth",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "kbp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "actualKbp",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "vouchers",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "optimalDstBandwidth",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_weight",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_poolAddress",
                "type": "address"
            }
        ],
        "name": "createChainPath",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "_poolId",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeCollector",
        "outputs": [
            {
                "internalType": "contract IFeeCollectorV2",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "feeHandler",
        "outputs": [
            {
                "internalType": "contract IFeeHandler",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            }
        ],
        "name": "getChainPathPublic",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "bool",
                        "name": "active",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint16",
                        "name": "srcPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstChainId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "weight",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "bandwidth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "actualBandwidth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "kbp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "actualKbp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "vouchers",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "optimalDstBandwidth",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "poolAddress",
                        "type": "address"
                    }
                ],
                "internalType": "struct IAssetRouter.ChainPath",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_poolId",
                "type": "uint16"
            }
        ],
        "name": "getChainPathsLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "_amountToSimulate",
                "type": "uint256"
            }
        ],
        "name": "getEffectivePath",
        "outputs": [
            {
                "internalType": "uint16[2]",
                "name": "effectivePath",
                "type": "uint16[2]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_poolId",
                "type": "uint16"
            }
        ],
        "name": "getPool",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "poolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "address",
                        "name": "poolAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalWeight",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalLiquidity",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "undistributedVouchers",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct IAssetRouter.PoolObject",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            }
        ],
        "name": "getRoleAdmin",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "hasRole",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "poolIdsPerChain",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "name": "poolLookup",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "poolId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "poolAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "totalWeight",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalLiquidity",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "undistributedVouchers",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "srcPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstChainId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "refundAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "payload",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct IAssetRouter.SwapParams",
                "name": "swapParams",
                "type": "tuple"
            }
        ],
        "name": "quoteSwap",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "fee",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint256",
                "name": "_vouchers",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_optimalDstBandwidth",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "_swap",
                "type": "bool"
            }
        ],
        "name": "receiveVouchers",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "role",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "address payable",
                "name": "_refundAddress",
                "type": "address"
            }
        ],
        "name": "sendVouchers",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "contract IBridge",
                "name": "_newBridge",
                "type": "address"
            }
        ],
        "name": "setBridge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_feeHandler",
                "type": "address"
            }
        ],
        "name": "setFeeLibrary",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_syncDeviation",
                "type": "uint256"
            }
        ],
        "name": "setSyncDeviation",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstChainId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_weight",
                "type": "uint16"
            }
        ],
        "name": "setWeightForChainPath",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes4",
                "name": "interfaceId",
                "type": "bytes4"
            }
        ],
        "name": "supportsInterface",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint16",
                        "name": "srcPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstPoolId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "dstChainId",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "minAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address payable",
                        "name": "refundAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "bytes",
                        "name": "payload",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct IAssetRouter.SwapParams",
                "name": "swapParams",
                "type": "tuple"
            }
        ],
        "name": "swap",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_srcPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_dstPoolId",
                "type": "uint16"
            },
            {
                "internalType": "uint16",
                "name": "_srcChainId",
                "type": "uint16"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_fee",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_vouchers",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_optimalDstBandwidth",
                "type": "uint256"
            }
        ],
        "name": "swapRemote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_poolId",
                "type": "uint16"
            }
        ],
        "name": "sync",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "syncDeviation",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const