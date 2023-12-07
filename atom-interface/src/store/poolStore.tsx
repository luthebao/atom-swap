import { proxy } from 'valtio'
import { formatInputNumber } from '../configs/utils'
import { Address } from 'viem'

export enum PoolType {
    PUBLIC = 0,
    WHITELIST,
    FAIRLAUNCH
}

export interface Metadata {
    logo: string
    website: string
    twitter: string
    telegram: string
    github: string
    discord: string
    document: string
    youtube: string
    description: string
}

interface State {
    token?: Address
    loading: boolean,

    buy_rate: string,
    list_rate: string,

    buy_min: string,
    buy_max: string,

    softcap: string,
    hardcap: string,
    isBurnRefund: boolean,

    liquidity_percent: number,
    liquidity_lock: number,

    pool_type: PoolType,
    pool_start: number,
    pool_end: number,

    metadata: string,
}

const state = proxy<State>({
    token: undefined,
    loading: false,
    buy_rate: "0",
    list_rate: "0",
    buy_min: "0",
    buy_max: "0",
    softcap: "0",
    hardcap: "0",
    isBurnRefund: true,
    liquidity_percent: 100,
    liquidity_lock: 0,
    pool_type: PoolType.PUBLIC,
    pool_start: Math.floor(Math.floor((Date.now() / 1000) / 3600 + 1) * 3600),
    pool_end: Math.floor(Math.floor((Date.now() / 1000) / 3600 + 2) * 3600),
    metadata: ""
})

const PoolStore = {
    state,
    setToken(value: Address) {
        state.token = value
    },

    setLoading(value: boolean) {
        state.loading = value
    },

    setBuyRate(value: string) {
        state.buy_rate = formatInputNumber(value)
    },

    setListRate(value: string) {
        state.list_rate = formatInputNumber(value)
    },
    setBuyMin(value: string) {
        state.buy_min = formatInputNumber(value)
    },
    setBuyMax(value: string) {
        state.buy_max = formatInputNumber(value)
    },
    setSoftCap(value: string) {
        state.softcap = formatInputNumber(value)
    },
    setHardCap(value: string) {
        state.hardcap = formatInputNumber(value)
    },
    setBurnRefund(value: boolean) {
        state.isBurnRefund = value
    },
    setLiquidityPercent(value: number) {
        if (value > 100) {
            value = 100
        }
        state.liquidity_percent = value
    },
    setLiquidityLock(value: number) {
        if (value <= 0) value = 0
        state.liquidity_lock = value
    },
    setPoolStart(value: number) {
        state.pool_start = value
    },
    setPoolEnd(value: number) {
        state.pool_end = value
    },
    setPoolType(value: PoolType) {
        state.pool_type = value
    },

    setMetadata(value: string) {
        state.metadata = value
    },

    reset() {
        state.token = undefined
        state.loading = false
        state.buy_rate = "0"
        state.list_rate = "0"
        state.buy_min = "0"
        state.buy_max = "0"
        state.softcap = "0"
        state.hardcap = "0"
        state.isBurnRefund = true
        state.liquidity_percent = 100
        state.liquidity_lock = 0
        state.pool_type = PoolType.PUBLIC
        state.pool_start = Math.floor(Math.floor((Date.now() / 1000) / 3600 + 1) * 3600)
        state.pool_end = Math.floor(Math.floor((Date.now() / 1000) / 3600 + 2) * 3600)
        state.metadata = ""
    },
}

export default PoolStore