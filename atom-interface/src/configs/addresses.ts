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
    }
}

export const DEXB: POOL = {
    [goerli.id]: {
        iconUrl: "/chains/ethereum.svg",
        l0chainid: 10121,
        chainid: goerli.id,
        FeeCollector: "0x355b0A841c702389bD69dbEbbFa24d0Bd70B5b9F",
        FeeHandlerMock: "0xf1fc310F6D2B68874bcEf2BA888bDd578A6eEAd6",
        AssetRouter: "0xAf774b5Ef94e74C3552A031dC844BdDebf508f57",
        Bridge: "0xAEC785255E9FC504d9949A7f01B303acDb9E9F41",
        DEXBAggregatorUniswap: "0xF18B5EfCd4d6EfCb5B5585536AadE4CFFB7847Fc",
        Token: "0x2F1Dc3e170afF5dD3AFFc2dBBbF5bC5a4385b2Cc",
        AssetV2: "0x42457E843Cd0F03435062aF0882b80E221645b51",
    },
    [baseGoerli.id]: {
        iconUrl: "/chains/base.svg",
        l0chainid: 10160,
        chainid: baseGoerli.id,
        FeeCollector: "0xd3deDCf3d07E4E3657C8022a7fdCE2E54ab9803B",
        FeeHandlerMock: "0xb45A16aA48B58Ba3090821184B76e2A9e0EE242A",
        AssetRouter: "0xa2D448B691a97FA5aCC5cFDfe14dD8D5927aa6f2",
        Bridge: "0x5D7448DC945783d7Ea7B0726306ef715bC2486C2",
        DEXBAggregatorUniswap: "0x71803af23F3be02311490A2a6C479c880ef5d48d",
        Token: "0x9f2A50A859Eaded1c80116c4384378d056839ABB",
        AssetV2: "0x737873BC769682533181fF35E3d4C7C132d76d2D",
    }
}