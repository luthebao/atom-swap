import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";

export default {
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [
        "bbccee8ec3cdcc444de94da5c3566c647b168172ff133732cf260cf5f44b7b39"
      ],
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      // gasPrice: 10000000,
      accounts: [
        "bbccee8ec3cdcc444de94da5c3566c647b168172ff133732cf260cf5f44b7b39"
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
