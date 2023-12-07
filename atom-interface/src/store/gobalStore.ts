import { proxy } from 'valtio'
import { Chain, erc20ABI } from 'wagmi'
import { mainChain, wagmiCore } from '../configs/connectors'
import { ETHs, TokenList, WETHs } from '../configs/tokens'
import { Address, zeroAddress } from 'viem'
import { ABI_FACTORY, ABI_PAIR } from '../configs/abi'
import { FACTORY_ADDRESS, WETH } from '../configs/addresses'

export interface Token {
    name: string
    decimals: number
    symbol: string
    address: string
    chainId: number
    logoURI?: string
}

export type Ether = `${number}`

export interface Pair extends Token {
    isStable: boolean
    token0: Token
    token1: Token
    totalSupply: bigint
    reserve0: bigint
    reserve1: bigint
}

export enum TXHstatus {
    WAITING,
    PENDING,
    SUBMITTED,
    CONFIRMED,
    REJECTED,
    DONE
}

export interface Transaction {
    id: number
    name: string
    status: TXHstatus
    hash: string
}

export interface Quote {
    amountin: bigint
    amountout: bigint
    stable: boolean
    reversein: bigint
    reverseout: bigint
}

export enum SwapInputType {
    FROM,
    TO
}

export enum LiquidityInputType {
    FROM,
    TO,
    ASSET0,
    ASSET1,
    PAIR
}

export type CurrencyInputType = SwapInputType | LiquidityInputType

interface GlobalState {
    currentChain: Chain
    baseTokens: Token[]
    openQueue: boolean
    txQueue: Transaction[]
    confirmations: number
}

const state = proxy<GlobalState>({
    currentChain: mainChain,
    baseTokens: [],
    openQueue: false,
    txQueue: [],
    confirmations: 2
})

const GlobalStore = {
    state,
    setCurrentChain(value: Chain | undefined | null) {
        if (value) {
            state.currentChain = value
        } else {
            state.currentChain = mainChain
        }
    },
    async setBaseTokens(value: Token) {
        const tempTokens: Token[] = state.baseTokens
        tempTokens.push(value)
        const tempTokens2: Token[] = tempTokens.filter((value, index) => tempTokens.indexOf(value) === index);
        state.baseTokens = tempTokens2
        localStorage.setItem("baseTokens", JSON.stringify(tempTokens2))
    },
    async loadBaseTokens() {
        const tempTokens = localStorage.getItem("baseTokens")
        if (tempTokens) {
            state.baseTokens = JSON.parse(tempTokens) as Token[]
        }
    },
    getTokenList(): Token[] {
        return [...ETHs, ...WETHs, ...TokenList.tokens, ...state.baseTokens].filter(val => val.chainId === state.currentChain.id)
    },
    async getPair(asset0: Token, asset1: Token, stable: boolean): Promise<Pair | null> {
        let add0 = asset0.address
        if (add0 === "") {
            add0 = WETH[state.currentChain.id]
        }
        let add1 = asset1.address
        if (add1 === "") {
            add1 = WETH[state.currentChain.id]
        }
        const result = await wagmiCore.readContract({
            abi: ABI_FACTORY,
            address: FACTORY_ADDRESS[state.currentChain.id],
            functionName: "getPair",
            args: [
                add0 as Address,
                add1 as Address,
                stable
            ]
        })
        if (result && result !== zeroAddress) {
            const pairContract = wagmiCore.getContract({
                abi: ABI_PAIR,
                address: result
            })
            const pair: Pair = {
                address: result,
                name: (await pairContract.read.name()).toString(),
                chainId: state.currentChain.id,
                symbol: (await pairContract.read.symbol()).toString(),
                decimals: await pairContract.read.decimals(),
                isStable: await pairContract.read.stable(),
                token0: (await pairContract.read.token0()).toLowerCase() === add0.toLowerCase() ? asset0 : asset1,
                // this.getTokenList().find(async (val) => val.address.toLowerCase() === await pairContract.read.token0()) || {
                //     address: await pairContract.read.token0(),
                //     symbol: await token0.read.symbol(),
                //     decimals: await token0.read.decimals(),
                //     name: await token0.read.name(),
                //     chainId: state.currentChain.id
                // },
                token1: (await pairContract.read.token1()).toLowerCase() === add1.toLowerCase() ? asset1 : asset0,
                // this.getTokenList().find(async (val) => val.address.toLowerCase() === await pairContract.read.token1()) || {
                //     address: await pairContract.read.token1(),
                //     symbol: await token1.read.symbol(),
                //     decimals: await token1.read.decimals(),
                //     name: await token1.read.name(),
                //     chainId: state.currentChain.id
                // },
                totalSupply: await pairContract.read.totalSupply(),
                reserve0: await pairContract.read.reserve0(),
                reserve1: await pairContract.read.reserve1(),
            }
            return pair
        }
        return null
    },
    async fetchPair(pairAddress: Address): Promise<Pair | null> {
        const pairContract = wagmiCore.getContract({
            abi: ABI_PAIR,
            address: pairAddress
        })
        if (pairContract) {
            const token0 = wagmiCore.getContract({
                abi: erc20ABI,
                address: await pairContract.read.token0(),
            })
            const token1 = wagmiCore.getContract({
                abi: erc20ABI,
                address: await pairContract.read.token1(),
            })
            const add0 = (await pairContract.read.token0())
            const add1 = (await pairContract.read.token1())

            const pair: Pair = {
                address: pairAddress,
                name: (await pairContract.read.name()).toString(),
                chainId: state.currentChain.id,
                symbol: (await pairContract.read.symbol()).toString(),
                decimals: await pairContract.read.decimals(),
                isStable: await pairContract.read.stable(),
                token0: this.getTokenList().find((val) => val.address.toLowerCase() === add0.toLowerCase()) || {
                    address: await pairContract.read.token0(),
                    symbol: await token0.read.symbol(),
                    decimals: await token0.read.decimals(),
                    name: await token0.read.name(),
                    chainId: state.currentChain.id
                },
                token1: this.getTokenList().find((val) => val.address.toLowerCase() === add1.toLowerCase()) || {
                    address: await pairContract.read.token1(),
                    symbol: await token1.read.symbol(),
                    decimals: await token1.read.decimals(),
                    name: await token1.read.name(),
                    chainId: state.currentChain.id
                },
                totalSupply: await pairContract.read.totalSupply(),
                reserve0: await pairContract.read.reserve0(),
                reserve1: await pairContract.read.reserve1(),
            }
            return pair
        }
        return null
    },
    setOpenQueue(value: boolean) {
        state.openQueue = value
        const isDone = state.txQueue.length > 0 && state.txQueue.filter((tx) => { return [TXHstatus.DONE, TXHstatus.CONFIRMED, TXHstatus.REJECTED].includes(tx.status) }).length === state.txQueue.length
        if (!value && isDone) {
            state.txQueue = []
        }
    },
    setTxQueue(value: Transaction[]) {
        state.txQueue = value
        state.openQueue = true
    },
    updateTxQueue(id: number, status?: TXHstatus, hash?: string, name?: string) {
        state.openQueue = true
        const txIndex = state.txQueue.findIndex(val => val.id === id)
        if (status) state.txQueue[txIndex].status = status
        if (hash) state.txQueue[txIndex].hash = hash
        if (name) state.txQueue[txIndex].name = name
    },
}

export default GlobalStore
