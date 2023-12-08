import { proxy } from 'valtio'
import { Chain, erc20ABI } from 'wagmi'
import { mainChain, wagmiCore } from '../configs/connectors'
import { Address, zeroAddress } from 'viem'
import { baseGoerli } from 'viem/chains'
import { formatInputNumber } from '../configs/utils'

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
    toChain: Chain
    fromToken: Token | null
    toToken: Token | null
    fromAmount: Ether
    toAmount: Ether

    openQueue: boolean
    txQueue: Transaction[]
    confirmations: number
}

const state = proxy<GlobalState>({
    currentChain: mainChain,
    toChain: baseGoerli,
    fromToken: null,
    toToken: null,
    fromAmount: "0",
    toAmount: "0",

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
    setToChain(value: Chain | undefined | null) {
        if (value) {
            state.toChain = value
        } else {
            state.toChain = baseGoerli
        }
    },
    setFromToken(value: Token | null) {
        state.fromToken = value
    },
    setToToken(value: Token | null) {
        state.toToken = value
    },

    setFromAmount(value: string) {
        state.fromAmount = formatInputNumber(value) as Ether
    },
    setToAmount(value: string) {
        state.toAmount = formatInputNumber(value) as Ether
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
