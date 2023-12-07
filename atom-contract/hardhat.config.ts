import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@nomicfoundation/hardhat-verify";

export default {
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      accounts: [
        "3b9fac5e9fb4672db9e7d73ed07b83e0fd579d823a4c5aaf51af6b9c61ee48db"
      ],
    },
    baseGoerli: {
      url: "https://goerli.base.org",
      accounts: [
        "3b9fac5e9fb4672db9e7d73ed07b83e0fd579d823a4c5aaf51af6b9c61ee48db"
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
        }
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
