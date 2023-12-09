import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";

export default {
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [
        "c83d303f2f607d257d67c52866da74ef897bca7f18072bafe67099037598e598"
      ],
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      // gasPrice: 10000000,
      accounts: [
        "c83d303f2f607d257d67c52866da74ef897bca7f18072bafe67099037598e598"
      ],
    }
  },
  etherscan: {
    apiKey: {
      goerli: "5GB9UC81MHTMV4U11BG61HBJUGTTT791J6",
      baseGoerli: "5GB9UC81MHTMV4U11BG61HBJUGTTT791J6",
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
