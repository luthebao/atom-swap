import exp from "constants";
import { Address, Chain, PublicClient, WalletClient, createPublicClient, createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { formattersOptimism } from "viem/chains/utils";

export const account = privateKeyToAccount("0xbbccee8ec3cdcc444de94da5c3566c647b168172ff133732cf260cf5f44b7b39")

export const goerli: Chain = defineChain({
    id: 5,
    network: 'goerli',
    name: 'Goerli',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        alchemy: {
            http: ['https://eth-goerli.g.alchemy.com/v2'],
            webSocket: ['wss://eth-goerli.g.alchemy.com/v2'],
        },
        infura: {
            http: ['https://goerli.infura.io/v3'],
            webSocket: ['wss://goerli.infura.io/ws/v3'],
        },
        default: {
            http: ['https://rpc.ankr.com/eth_goerli'],
        },
        public: {
            http: ['https://rpc.ankr.com/eth_goerli'],
        },
    },
    blockExplorers: {
        etherscan: {
            name: 'Etherscan',
            url: 'https://goerli.etherscan.io',
        },
        default: {
            name: 'Etherscan',
            url: 'https://goerli.etherscan.io',
        },
    },
    contracts: {
        ensRegistry: {
            address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        },
        ensUniversalResolver: {
            address: '0x56522D00C410a43BFfDF00a9A569489297385790',
            blockCreated: 8765204,
        },
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 6507670,
        },
    },
    testnet: true,
})

export const baseGoerli: Chain = defineChain({
    id: 84531,
    network: 'base-goerli',
    name: 'Base Goerli',
    nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        alchemy: {
            http: ['https://base-goerli.g.alchemy.com/v2'],
            webSocket: ['wss://base-goerli.g.alchemy.com/v2'],
        },
        default: {
            http: ['https://goerli.base.org'],
        },
        public: {
            http: ['https://goerli.base.org'],
        },
    },
    blockExplorers: {
        etherscan: {
            name: 'Basescan',
            url: 'https://goerli.basescan.org',
        },
        default: {
            name: 'Basescan',
            url: 'https://goerli.basescan.org',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 1376988,
        },
    },
    testnet: true,
    sourceId: 5, // goerli
}, {
    formatters: formattersOptimism,
})

export interface POOLITEM {
    l0chainid: number
    FeeCollector: Address
    FeeHandlerMock: Address
    AssetRouter: Address
    Bridge: Address
    DEXBAggregatorUniswap: Address
    Token: Address
    AssetV2: Address
    Uniswap: Address
    WETH: Address
    chain: Chain
    client: PublicClient
    wallet: WalletClient
}

export interface POOL {
    [id: number]: POOLITEM
}

export const DEXB: POOL = {
    [10121]: {
        l0chainid: 10121,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        Uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        chain: goerli,
        client: createPublicClient({
            chain: goerli,
            transport: http()
        }),
        wallet: createWalletClient({
            chain: goerli,
            transport: http(),
            account: account
        })
    },
    [10160]: {
        l0chainid: 10160,
        FeeCollector: '0x9457281D31dC7e60421F234529Fa90cde413aCC5',
        FeeHandlerMock: '0x119ae050D1D6886580F8D46bEe9Be140Ca42a276',
        AssetRouter: '0xD588cA6dfD76b5D2EF3bd61b98373d8e94b478B6',
        Bridge: '0x81AA18fD3cf8B8E48B73aC5B5a42C3c4D55D4E1d',
        DEXBAggregatorUniswap: '0x0f621E8Db0B5f3Ff4BEC9f4C0875911600271e5F',
        Token: '0x4967FFab425016004f97C4E1dB7B12F501d24f39',
        AssetV2: '0x1F1aBf1140eeae20E5bAe6026d8BeBF81720b5EC',
        Uniswap: "0x48e62E03D4683D9193797209EC3fA8aA3Bc90BC6",
        WETH: "0x4200000000000000000000000000000000000006",
        chain: baseGoerli,
        client: createPublicClient({
            chain: baseGoerli,
            transport: http()
        }),
        wallet: createWalletClient({
            chain: baseGoerli,
            transport: http(),
            account: account
        })
    }
}