
interface POOL {
    [name: string]: {
        chainid: number
        chainrpc: number
        FeeCollector: string;
        FeeHandlerMock: string;
        AssetRouter: string
        Bridge: string
        DEXBAggregatorUniswap: string
        Token: string
        AssetV2: string
        uniswap: string
        weth: string
    }
}

export const DEXB: POOL = {
    "goerli": {
        chainid: 10121,
        chainrpc: 5,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
    },
    "baseGoerli": {
        chainid: 10160,
        chainrpc: 84531,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        uniswap: "0x48e62E03D4683D9193797209EC3fA8aA3Bc90BC6",
        weth: "0x4200000000000000000000000000000000000006"
    }
}