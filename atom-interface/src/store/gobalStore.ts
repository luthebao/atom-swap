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
    minHgsAmount: bigint
}

export enum SwapInputType {
    FROM,
    TO
}

export enum SWAPSTATE {
    INPUT,
    QUOTE,
    SUBMIT
}

interface GlobalState {
    currentChain: Chain | null
    toChain: Chain | null
    fromToken: Token | null
    toToken: Token | null
    fromAmount: Ether
    toAmount: Ether
    swapstate: SWAPSTATE
    quote: Quote | null

    openQueue: boolean
    txQueue: Transaction[]
    confirmations: number
}

const state = proxy<GlobalState>({
    currentChain: mainChain,
    toChain: null,
    fromToken: null,
    toToken: null,
    fromAmount: "0",
    toAmount: "0",
    swapstate: SWAPSTATE.INPUT,
    quote: null,

    openQueue: false,
    txQueue: [],
    confirmations: 2
})

const GlobalStore = {
    state,
    setCurrentChain(value: Chain | null) {
        state.currentChain = value
        state.fromToken = null
        if (value && state.toChain?.id === value.id && state.fromToken && state.fromToken === state.toToken) {
            state.toChain = null
        }
        state.toAmount = "0"
        
        this.getStepSwap()
    },
    setToChain(value: Chain | null) {
        state.toChain = value
        state.toToken = null
        if (value && state.currentChain?.id === value.id && state.fromToken && state.fromToken === state.toToken) {
            state.currentChain = null
        }
        state.toAmount = "0"

        this.getStepSwap()
    },
    setSwapInput() {
        const MID_Chain = state.currentChain
        state.currentChain = state.toChain
        state.toChain = MID_Chain

        const MID_Token = state.fromToken
        state.fromToken = state.toToken
        state.toToken = MID_Token

        this.getStepSwap()
    },

    setFromToken(value: Token | null) {
        state.fromToken = value
        if (value && state.currentChain?.id === state.toChain?.id && value.symbol === state.toToken?.symbol) {
            state.toToken = null
        }
        state.toAmount = "0"

        this.getStepSwap()
    },
    setToToken(value: Token | null) {
        state.toToken = value
        if (value && state.currentChain?.id === state.toChain?.id && value.symbol === state.fromToken?.symbol) {
            state.fromToken = null
        }
        state.toAmount = "0"

        this.getStepSwap()
    },

    setQuote(value: Quote | null) {
        state.quote = value
    },

    setFromAmount(value: string) {
        state.fromAmount = formatInputNumber(value) as Ether
        state.toAmount = "0"
        this.getStepSwap()
    },
    setToAmount(value: string) {
        state.toAmount = formatInputNumber(value) as Ether
        this.getStepSwap()
    },

    getStepSwap() {
        if (state.currentChain === null || state.toChain === null || state.fromToken === null || state.toToken === null || Number(state.fromAmount) <= 0) {
            state.swapstate = SWAPSTATE.INPUT
        } else if (Number(state.toAmount) <= 0) {
            state.swapstate = SWAPSTATE.QUOTE
        } else {
            state.swapstate = SWAPSTATE.SUBMIT
        }
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
