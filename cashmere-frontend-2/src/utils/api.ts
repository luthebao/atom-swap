import axios from 'axios';
import { apiAddress } from '../constants/utils';
import RootStore from '../store/RootStore';

export type Hex = `0x${string}`
export type Hash = `0x${string}`
export type Address = `0x${string}`

export interface DaoStatsResponse {
    transactions: number;
    users: number;
    volume: string;
    fees: string;
    tvl: string;
}

export type SwapData = {
    swapId: Hex;

    // chains
    srcChainId: number;
    dstChainId: number;
    srcL0ChainId: number;
    dstL0ChainId: number;

    // swap path
    lwsPoolId: number;
    hgsPoolId: number;
    hgsAmount: string;
    dstToken: Address;
    minHgsAmount: string;
    fee: string;

    // user data
    receiver: Address;
    signature: Hex;

    // statuses
    swapInitiatedTimestamp: number;
    swapInitiatedTxid: Hash; // implies src tx found
    l0Link?: string;
    swapPerformedTxid?: Hash; // implies dst tx found
    swapContinueTxid?: Hash; // implies swap continue tx submitted
    swapContinueConfirmed?: boolean;
    progressHidden?: boolean;

    // progress info
    srcAmount: string;
    srcToken: Address;
    srcDecimals?: number;
    srcTokenSymbol?: string;
    lwsTokenSymbol?: string;
    hgsTokenSymbol?: string;
    dstTokenSymbol?: string;

    failed?: number;
    fake?: boolean;
}

export type SwapEstimateResponse = {
    dstAmount: string;
    minReceivedDst: string;
    fee: string;
    priceImpact: string;
    nativeFee: string;
    error: any;
    cause: any;
}

export interface SwapParamsResponse {
    args: {
        srcToken: string;
        srcAmount: string;
        lwsPoolId: string;
        hgsPoolId: string;
        dstToken: Address;
        dstChain: string;
        dstAggregatorAddress: string;
        minHgsAmount: string;
    };
    to: Address;
    value: string;
    swapData: SwapData;
}

export class Api {
    client = axios.create({
        baseURL: `${apiAddress}/`,
        withCredentials: false,
    });

    constructor(
        private readonly rootStore: RootStore
    ) {
        this.client.interceptors.request.use(config => {
            if (rootStore.authStore.token && !config.headers['Authorization'])
                config.headers['Authorization'] = `Bearer ${rootStore.authStore.token}`;
            return config;
        });
    }

    async stats(): Promise<DaoStatsResponse> {
        return (await this.client.get('/api/stats')).data;
    }

    async pendingTransactionsList(account: string): Promise<{ count: number, items: SwapData[] }> {
        return (await this.client.get('/api/transactionsList', { params: {
            type: 'pending',
            account,
        } })).data;
    }

    async transactionHistory(account: string, page= 0): Promise<{ count: number, items: SwapData[] }> {
        return (await this.client.get('/api/transactionsList', { params: {
            type: 'complete',
            account,
            page,
        } })).data;
    }

    async getUndetectedTxids(txIds: string[]): Promise<string[]> {
        return (await this.client.get('/api/getUndetectedTxids', { params: {
            txIds: txIds.join(','),
        } })).data;
    }

    async getSwapParams(srcChainId: number, srcToken: string, amount: string, dstChainId: number, dstToken: string, receiver: string): Promise<SwapParamsResponse> {
        return (await this.client.get('/api/params', { params: { srcChainId, srcToken, amount, dstChainId, dstToken, receiver } })).data;
    }

    async getSwapEstimate(srcChainId: number, srcToken: string, amount: string, dstChainId: number, dstToken: string): Promise<SwapEstimateResponse> {
        return (await this.client.get('/api/estimate', { params: { srcChainId, srcToken, amount, dstChainId, dstToken } })).data;
    }

    async submitSwapTx(srcChainId: number, txid: Hash) {
        await this.client.post('/api/submitSwapTx', {}, { params: { srcChainId, txid } });
    }

    async getNonce(requestId: string): Promise<{ nonce: string }> {
        return (await this.client.get('/api/auth/nonce', { params: { requestId } })).data;
    }

    async login(message: any, signature: string): Promise<{ accessToken: string, refreshToken: string }> {
        return (await this.client.post('/api/auth/login', { message, signature })).data;
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        return (await this.client.get('/api/auth/refresh', { headers: { Authorization: `Bearer ${refreshToken}`} })).data;
    }

    async logout(): Promise<{ accessToken: string, refreshToken: string }> {
        return (await this.client.post('/api/auth/logout'));
    }

    async hideCompletedSwaps() {
        await this.client.delete('/api/transactionsList');
    }

    async hideCompletedSwap(swapId: string) {
        if (!swapId) return;
        await this.client.delete(`/api/transactionsList/${swapId}`);
    }

    async me() {
        return (await this.client.get('/api/auth/me')).data;
    }
}
