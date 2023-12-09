import { Address } from "viem"
import { baseGoerli, goerli, lineaTestnet, } from "viem/chains"

export type AddressMap = { [chainId: number]: `0x${string}` }
export type DextoolMap = { [chainId: number]: string }

interface POOL {
    [chainId: number]: {
        iconUrl: string
        l0chainid: number
        chainid: number
        FeeCollector: Address
        FeeHandlerMock: Address
        AssetRouter: Address
        Bridge: Address
        DEXBAggregatorUniswap: Address
        Token: Address
        AssetV2: Address
        Uniswap: Address
        WETH: Address
    }
}

export const DEXB: POOL = {
    [goerli.id]: {
        iconUrl: "/chains/ethereum.svg",
        l0chainid: 10121,
        chainid: goerli.id,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    },
    [baseGoerli.id]: {
        iconUrl: "/chains/base.svg",
        l0chainid: 10160,
        chainid: baseGoerli.id,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        Uniswap: "0x48e62E03D4683D9193797209EC3fA8aA3Bc90BC6",
        WETH: "0x4200000000000000000000000000000000000006",
    }
}