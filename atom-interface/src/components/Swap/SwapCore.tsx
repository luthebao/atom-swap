import { useState, useEffect, useCallback } from 'react'
import {
    TextField,
    Typography,
    InputAdornment,
    Button,
    CircularProgress,
    Tooltip,
    IconButton,
} from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { withTheme } from '@material-ui/core/styles'
import { useSearchParams } from 'react-router-dom'
import GlobalStore, { CurrencyInputType, Quote, SWAPSTATE, SwapInputType, TXHstatus, Token } from '../../store/gobalStore'
import { MAX_UINT256, devide, formatInputNumber } from '../../configs/utils'
import CurrencyInput from '../CoreComponents/CurrencyInput'
import { useSnapshot } from 'valtio'
import { ContractFunctionExecutionError, Hash, TransactionExecutionError, formatUnits, parseUnits, zeroAddress } from 'viem'
import { Address, erc20ABI, useAccount, useChainId, useNetwork, useSignTypedData } from 'wagmi'
import { wagmiCore } from '../../configs/connectors'
import { toast } from 'react-toastify'
import { MdCandlestickChart, MdRefresh, MdOutlineSettings, MdSwapCalls } from "react-icons/md";
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { DEXB } from '../../configs/addresses'
import { ABI_DEXB, ABI_UNISWAP } from '../../configs/abi'

function SwapCore() {
    const globalstore = useSnapshot(GlobalStore.state)
    const chainid = useChainId()
    const [loading, setLoading] = useState(false)
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();
    const { signTypedDataAsync } = useSignTypedData({})
    const account = useAccount()

    const onSwap = async () => {
        setLoading(true)
        if (globalstore.currentChain === null || globalstore.toChain === null || globalstore.fromToken === null || globalstore.toToken === null || Number(globalstore.fromAmount) <= 0) {
            toast("Invalid Input")
        }
        else if (Number(globalstore.toAmount) <= 0) {
            const sendFromAmount0 = parseUnits(globalstore.fromAmount, globalstore.fromToken.decimals)

            let addy0 = globalstore.fromToken.address
            let addy1 = globalstore.toToken.address

            if (globalstore.fromToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
                addy0 = DEXB[globalstore.currentChain.id].WETH
            }

            if (globalstore.toToken.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
                addy1 = DEXB[globalstore.toChain.id].WETH
            }

            console.log(addy0, addy1, DEXB[globalstore.toChain.id].Token)

            const result0 = await wagmiCore.readContract({
                abi: ABI_UNISWAP,
                address: DEXB[globalstore.currentChain.id].Uniswap,
                chainId: globalstore.currentChain.id,
                functionName: "getAmountsOut",
                args: [
                    sendFromAmount0,
                    [
                        addy0 as Address, DEXB[globalstore.currentChain.id].Token
                    ]
                ]
            })

            if (result0.length !== 2) {
                toast("Can not find pair")
                return
            }

            console.log("result0", result0)

            const sendFromAmount1 = result0[1]

            const result1 = await wagmiCore.readContract({
                abi: ABI_UNISWAP,
                address: DEXB[globalstore.toChain.id].Uniswap,
                chainId: globalstore.toChain.id,
                functionName: "getAmountsOut",
                args: [
                    sendFromAmount1,
                    [
                        DEXB[globalstore.toChain.id].Token, addy1 as Address
                    ]
                ]
            })

            console.log(result1)

            if (result1.length !== 2) {
                toast("Can not find pair")
                return
            }
            console.log(formatUnits(result1[1], globalstore.toToken.decimals).toString())
            GlobalStore.setToAmount(formatUnits(result1[1], globalstore.toToken.decimals))

        }
        else {
            try {
                console.log(globalstore.fromAmount)
                const sendFromAmount0 = parseUnits(globalstore.fromAmount, globalstore.fromToken.decimals)

                const signature = await signTypedDataAsync({
                    domain: {
                        name: "DEXB Swap",
                        version: "0.0.1",
                        chainId: globalstore.currentChain.id,
                        verifyingContract: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    },
                    types: {
                        Parameters: [
                            { name: 'receiver', type: 'address' },
                            { name: 'lwsPoolId', type: 'uint16' },
                            { name: 'hgsPoolId', type: 'uint16' },
                            { name: 'dstToken', type: 'address' },
                            { name: 'minHgsAmount', type: 'uint256' },
                        ]
                    },
                    primaryType: 'Parameters',
                    message: {
                        receiver: account.address as Address,
                        lwsPoolId: 1,
                        hgsPoolId: 1,
                        dstToken: globalstore.toToken.address,
                        minHgsAmount: 0n,
                    },

                });

                console.log("signature", signature, {
                    srcToken: globalstore.fromToken.address as Address,
                    srcAmount: sendFromAmount0 * 50n / 100n,
                    lwsPoolId: 1,
                    hgsPoolId: 1,
                    dstToken: globalstore.toToken.address as Address,
                    dstChain: DEXB[globalstore.toChain.id].l0chainid,
                    dstAggregatorAddress: DEXB[globalstore.toChain.id].DEXBAggregatorUniswap,
                    minHgsAmount: 0n,
                    signature: signature,
                })

                const write = await wagmiCore.writeContract({
                    abi: ABI_DEXB,
                    address: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    functionName: "startSwap",
                    args: [
                        {
                            srcToken: globalstore.fromToken.address as Address,
                            srcAmount: sendFromAmount0 * 60n / 100n,
                            lwsPoolId: 1,
                            hgsPoolId: 1,
                            dstToken: globalstore.toToken.address as Address,
                            dstChain: DEXB[globalstore.toChain.id].l0chainid,
                            dstAggregatorAddress: DEXB[globalstore.toChain.id].DEXBAggregatorUniswap,
                            minHgsAmount: 0n,
                            signature: signature,
                        }
                    ],
                    value: sendFromAmount0,
                    gasPrice: 500000n
                })
                const hash = write.hash
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                console.log(wait2, hash)
                // wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                if (wait2.status === "success") {
                    toast("Swap successfully")
                }
            } catch (error: unknown) {
                console.log(error)
                if (error instanceof TransactionExecutionError) {
                    toast(error.shortMessage)
                } else if (error instanceof ContractFunctionExecutionError) {
                    toast(error.shortMessage)
                } else {
                    toast("Unknown error")
                }
            }
            GlobalStore.setToAmount("0")
        }
        setLoading(false)
    }


    return (
        <div className="flex flex-col w-full">
            <div className='flex flex-row justify-between mb-1'>
                <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => { }}>
                    <MdCandlestickChart className='text-2xl' />
                </IconButton>
                <div className='flex flex-row'>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => { }}>
                        <MdRefresh className='text-2xl' />
                    </IconButton>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md">
                        <MdOutlineSettings className='text-2xl hover:animate-spin' />
                    </IconButton>
                </div>
            </div>
            <CurrencyInput type={SwapInputType.FROM} />
            <div className="w-full flex items-center justify-center mt-5 mb-4">
                <div className="bg-color-component-iconbtn rounded-[9px]">
                    <MdSwapCalls className="cursor-pointer p-[6px] !text-[35px] bg-color-component-input m-1 rounded-md" onClick={() => { }} />
                </div>
            </div>
            <CurrencyInput type={SwapInputType.TO} />

            <div className="flex flex-col py-5 px-4">
                {
                    openConnectModal ? (
                        <Button
                            variant='contained'
                            size='large'
                            color='primary'
                            className="!bg-[#FFFFFF] !text-[#000000] w-full"
                            onClick={openConnectModal}
                        >
                            <Typography className='!font-bold'>
                                Connect Wallet
                            </Typography>
                        </Button>
                    ) : (openChainModal && chainid !== globalstore.currentChain?.id) ? (
                        <Button
                            variant='contained'
                            size='large'
                            color='primary'
                            className="!bg-[#FFFFFF] !text-[#000000] w-full"
                            onClick={openChainModal}
                        >
                            <Typography className='!font-bold'>
                                Switch Network
                            </Typography>
                        </Button>
                    ) : <Button
                        variant='contained'
                        size='large'
                        color='primary'
                        className="!bg-[#FFFFFF] !text-[#000000]"
                        onClick={onSwap}
                    >
                        <Typography className='font-[400]'>
                            {
                                loading ? `Processing` :
                                    globalstore.swapstate === SWAPSTATE.QUOTE ? `Get Quote` : `Swap`
                            }
                        </Typography>
                        {(loading) && <CircularProgress size={10} />}
                    </Button>
                }
            </div>
            {/* <QuoteInfomation quoteError={quoteError} isLoading={loading || quoteLoading} quote={quote} from={fromAssetValue?.symbol} to={toAssetValue?.symbol} slippage={slippage} setSlippage={setSlippage} /> */}
            {/* <StrangeToken show={isStrangeToken} /> */}
        </div>
    )
}

const QuoteInfomation = ({
    quoteError, isLoading, quote, from, to, slippage, setSlippage
}: {
    quoteError?: string | null
    isLoading: boolean
    quote?: Quote | null
    from?: string
    to?: string
    slippage: string
    setSlippage: (v: string) => void
}) => {

    if (quoteError) {
        return (
            <div className="flex items-center justify-center min-h-[100px]">
                <Typography className="!text-[13px] !font-[200] !border-[1px] !border-solid !border-color-text-btn rounded-[10px] !bg-color-component-tab !p-6 min-w-full">{quoteError}</Typography>
            </div>
        )
    }

    if (quote && quote.amountin > 0n && quote.amountout > 0n && quote.reversein > 0n && quote.reverseout > 0n) {
        const amIn = Number(devide(quote.amountin, quote.reversein))
        const amOut = Number(devide(quote.amountout, quote.reverseout))
        const ratio = amOut / amIn
        const price_impact = 100 - ratio * 100

        return (
            <div className="mt-3 p-3 flex flex-wrap rounded-[10px] w-full items-center">
                <Typography className="w-full !font-[700] !text-color-text-btn !pb-[15px] border-b-[1px] border-solid border-border">Price Info</Typography>
                <div className="grid grid-cols-3 gap-3 w-full">
                    <div className="flex flex-col items-center justify-center p-[12px_0px]">
                        <Typography className="!font-bold !text-[14px] p-[6px_0px]"> {Number(devide(quote.amountin, quote.amountout)).toLocaleString()} </Typography>
                        <Typography className="!text-[13px] text-color-text2">{`${to} per ${from}`}</Typography>
                    </div>
                    <div className="flex flex-col items-center justify-center p-[12px_0px]">
                        <Typography className="!font-bold !text-[14px] p-[6px_0px]">{Number(devide(quote.amountout, quote.amountin)).toLocaleString()}</Typography>
                        <Typography className="!text-[13px] text-color-text2">{`${from} per ${to}`}</Typography>
                    </div>
                    <div className="flex flex-col items-center justify-center p-[12px_0px]">
                        <div className="mt-[2px] mb-[2px] relative">
                            <div className="w-full flex items-center absolute top-0">
                                <div className="pl-[12px]">
                                    <Tooltip title="Set 100% for automatic slippage">
                                        <Typography className="!font-[100] !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap>Slippage </Typography>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input max-w-[80px] min-h-[50px] p-[20px_12px_4px_12px]">
                                <TextField
                                    placeholder='0.00'
                                    fullWidth
                                    value={slippage}
                                    onChange={(e) => setSlippage(formatInputNumber(e.target.value))}
                                    disabled={false}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">
                                            %
                                        </InputAdornment>,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {
                    price_impact > 2 &&
                    <div className="flex items-center justify-center w-full">
                        <Typography className={price_impact > 5 ? "!text-[13px] !font-extralight !border-[1px] !border-solid !border-color-border3 rounded-[10px] !bg-color-bg10 !p-[24px] min-w-full" : "!text-[13px] !font-extralight !border-[1px] !border-solid !border-color-text1 rounded-[10px] !bg-color-component-tab !p-[24px] min-w-full"} align='center'>Price impact {price_impact.toLocaleString()}%</Typography>
                    </div>
                }
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[100px]">
                <CircularProgress size={20} />
            </div>
        )
    }
    return null
}

export default withTheme(SwapCore)
