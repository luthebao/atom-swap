import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";

// // mineral X
// const deploy_vault = "bd604e9385983bc5aeb8e0ab94d8d9728b614b2cd2651c29549b57d25c73ff89"
// const deploy_swap = "c0b09b398f3c85c01061354d7d2982d6a034bbf0ed2ad2fe90b219c4dca17809"
// const deploy_router = "41d7e9c9b5e49ff21db8e29cf7dbb40bd2bc99a851f55b5e5616f0418408a28f"

// zkline
const deploy_vault = "bd604e9385983bc5aeb8e0ab94d8d9728b614b2cd2651c29549b57d25c73ff89"
const deploy_swap = "c0b09b398f3c85c01061354d7d2982d6a034bbf0ed2ad2fe90b219c4dca17809"
const deploy_router = "41d7e9c9b5e49ff21db8e29cf7dbb40bd2bc99a851f55b5e5616f0418408a28f"

export default {
    defaultNetwork: "goerli",
    networks: {
        goerli: {
            url: "https://rpc.ankr.com/eth_goerli",
            accounts: [
                deploy_vault, deploy_swap, deploy_router
            ],
        },
        baseGoerli: {
            url: "https://goerli.base.org",
            accounts: [
                deploy_vault, deploy_swap, deploy_router
            ],
        },
        lineaGoerli: {
            url: "https://rpc.goerli.linea.build",
            accounts: [
                deploy_vault, deploy_swap, deploy_router
            ],
        },
        zkEVMtestnet: {
            url: "https://rpc.public.zkevm-test.net",
            accounts: [
                deploy_vault, deploy_swap, deploy_router
            ],
        },
        opGoerli: {
            url: "https://goerli.optimism.io",
            accounts: [
                deploy_vault, deploy_swap, deploy_router
            ],
        },
    },
    etherscan: {
        apiKey: {
            goerli: "5GB9UC81MHTMV4U11BG61HBJUGTTT791J6",
            baseGoerli: "5GB9UC81MHTMV4U11BG61HBJUGTTT791J6",
            lineaGoerli: "TI27WF63VEZMEWQ57JDCK8K38JX28G2JDK",
            zkEVMtestnet: "GW4CFZHJP157RXWEW33M2PYDWSG3HJI2KV",
            opGoerli: "RZ5B9JWXQABZ779P8NH57HNGAAGW9X7BVN",
        },
        customChains: [
            {
                network: "baseGoerli",
                chainId: 84531,
                urls: {
                    apiURL: "https://api-goerli.basescan.org/api",
                    browserURL: "https://goerli.basescan.org/"
                },
            },
            {
                network: "lineaGoerli",
                chainId: 59140,
                urls: {
                    apiURL: "https://api-testnet.lineascan.build/api",
                    browserURL: "https://goerli.lineascan.build/"
                },
            },
            {
                network: "zkEVMtestnet",
                chainId: 1442,
                urls: {
                    apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
                    browserURL: "https://testnet-zkevm.polygonscan.com/"
                },
            },
            {
                network: "opGoerli",
                chainId: 420,
                urls: {
                    apiURL: "https://api-goerli-optimistic.etherscan.io/api",
                    browserURL: "https://goerli-optimism.etherscan.io/"
                },
            },
        ]
    },
    solidity: {
        compilers: [
            {
                version: "0.8.19",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            },
        ]
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};
