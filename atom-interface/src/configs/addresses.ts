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
        FeeCollector: '0x856aCE234b0DE7B4202183AA7cAA20c6E4A7d940',
        FeeHandlerMock: '0xC83BC7B2D46D0f87998C8aB86C5D6F10C2dE4282',
        AssetRouter: '0x816028F9Baf2E5333A38951104432A34c21a0cc6',
        Bridge: '0xebA665e14a61b78b428Bb0B17Dd98718C90D98C0',
        DEXBAggregatorUniswap: '0x5b2f6a025e4E4ADE8a7dE4E5E3eA9B26F2D44D12',
        Token: '0xb06C0c0D6F86B0ff59648756219cC919705264bc',
        AssetV2: '0xBe7E90bAbC3AC60B48DC701f748EC63f77DCb46A',
        Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    },
    [baseGoerli.id]: {
        iconUrl: "/chains/base.svg",
        l0chainid: 10160,
        chainid: baseGoerli.id,
        FeeCollector: '0x856aCE234b0DE7B4202183AA7cAA20c6E4A7d940',
        FeeHandlerMock: '0xC83BC7B2D46D0f87998C8aB86C5D6F10C2dE4282',
        AssetRouter: '0x816028F9Baf2E5333A38951104432A34c21a0cc6',
        Bridge: '0xebA665e14a61b78b428Bb0B17Dd98718C90D98C0',
        DEXBAggregatorUniswap: '0x5b2f6a025e4E4ADE8a7dE4E5E3eA9B26F2D44D12',
        Token: '0xb06C0c0D6F86B0ff59648756219cC919705264bc',
        AssetV2: '0xBe7E90bAbC3AC60B48DC701f748EC63f77DCb46A',
        Uniswap: "0x48e62E03D4683D9193797209EC3fA8aA3Bc90BC6",
        WETH: "0x4200000000000000000000000000000000000006",
    }
}