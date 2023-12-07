
export const ETHs = [
    {
        "name": "Ether",
        "decimals": 18,
        "symbol": "ETH",
        "address": "",
        "chainId": 59140,
        "logoURI": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
]

export const WETHs = [
    {
        "name": "Wrapped Ether",
        "decimals": 18,
        "symbol": "WETH",
        "address": "0x2C1b868d6596a18e32E61B901E4060C872647b6C",
        "chainId": 59140,
        "logoURI": "https://assets.coingecko.com/coins/images/2518/large/weth.png"
    },
]

const GOERLI_TOKENS_5 = [
    {
        "name": "Tether USD",
        "decimals": 18,
        "symbol": "USDT",
        "address": "0x92D4FF11b44E641D9f2cc8e526E36fc9c85dD667",
        "chainId": 5,
        "logoURI": "https://assets.coingecko.com/coins/images/325/large/Tether.png"
    },
    {
        "name": "USD Coin",
        "decimals": 18,
        "symbol": "USDC",
        "address": "0x2ddDd0fF97D63ce55EEF0bE2015d3f5715865446",
        "chainId": 5,
        "logoURI": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"
    },
    {
        "name": "Doge Coin",
        "decimals": 18,
        "symbol": "Doge",
        "address": "0xF8Fc905188fB270dC3CDF94410e8E6eAC9D22558ƒ",
        "chainId": 5,
        "logoURI": "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
    }
]

const GOERLI_TOKENS_59140 = [
    {
        "name": "Tether USD",
        "decimals": 18,
        "symbol": "USDT",
        "address": "0x827A0a6e102F97a79eecf3f15BF4f0d9E675d2C4",
        "chainId": 59140,
        "logoURI": "https://assets.coingecko.com/coins/images/325/large/Tether.png"
    },
    {
        "name": "USD Coin",
        "decimals": 18,
        "symbol": "USDC",
        "address": "0xc6542517C8cfB23328A31aB2Aa87D4d73309617B",
        "chainId": 59140,
        "logoURI": "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png"
    },
    {
        "name": "zkLine",
        "decimals": 18,
        "symbol": "LINE",
        "address": "0x35f46eeaDaF676ef31d168532900F063543a3489",
        "chainId": 59140,
        "logoURI": "https://zkline.finance/favicon.svg"
    }
]

export const TokenList = {
    "name": "Token List",
    "logoURI": "/tokens/unknown-logo.png?v=006",
    "keywords": [
        "audited",
        "verified",
        "lending",
        "aave"
    ],
    "tokens": [
        ...GOERLI_TOKENS_59140,
    ],
    "timestamp": "2020-12-11T17:08:18.941Z",
    "version": {
        "major": 1,
        "minor": 3,
        "patch": 0
    }
}