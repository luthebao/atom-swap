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
import GlobalStore, { CurrencyInputType, Quote, SwapInputType, TXHstatus, Token } from '../../store/gobalStore'
import { MAX_UINT256, devide, formatInputNumber } from '../../configs/utils'
import CurrencyInput from '../CoreComponents/CurrencyInput'
import StrangeToken from './StrangeToken'
import { useSnapshot } from 'valtio'
import { ContractFunctionExecutionError, Hash, TransactionExecutionError, formatUnits, parseUnits } from 'viem'
import { ABI_ROUTER, ABI_WETH } from '../../configs/abi'
import { Address, erc20ABI, useAccount, useNetwork } from 'wagmi'
import { wagmiCore } from '../../configs/connectors'
import { toast } from 'react-toastify'
import { MdCandlestickChart, MdRefresh, MdOutlineSettings } from "react-icons/md";

function SwapCore() {
    const globalstore = useSnapshot(GlobalStore.state)
    const account = useAccount()
    const network = useNetwork()

    const onSwap = async () => {

    }


    return (
        <div className="flex flex-col w-full">
            <div className='flex flex-row justify-between mb-1'>
                <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => {
                    // if (DEXTOOLS[globalstore.currentChain.id] && toAssetValue) {
                    //     window.open(DEXTOOLS[globalstore.currentChain.id] + toAssetValue.address, "_blank", "noreferrer")
                    // }
                }}>
                    <MdCandlestickChart className='text-2xl' />
                </IconButton>
                <div className='flex flex-row'>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => {
                        // calculateReceiveAmount(fromAmountValue, fromAssetValue, toAssetValue)
                    }}>
                        <MdRefresh className='text-2xl' />
                    </IconButton>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md">
                        <MdOutlineSettings className='text-2xl hover:animate-spin' />
                    </IconButton>
                </div>
            </div>
            <CurrencyInput type={SwapInputType.FROM} />
            <div className="w-full flex items-center justify-center z-1 h-0">
                <div className="bg-color-component-iconbtn rounded-[9px] h-[38px] z-10">
                    <ArrowDownwardIcon className="cursor-pointer p-[6px] !text-[30px] bg-color-component-input m-1 rounded-md" onClick={() => { }} />
                </div>
            </div>
            <CurrencyInput type={SwapInputType.TO} />

            <div className="flex w-full mt-[10px]">
                {/* <Button
                    variant='contained'
                    size='large'
                    color='primary'
                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                    disabled={!(fromAssetValue && toAssetValue) || !(quote || (fromAssetValue && toAssetValue && natives.includes(fromAssetValue.address.toLowerCase()) && natives.includes(toAssetValue.address.toLowerCase()))) || loading || quoteLoading || !(account.isConnected && account.address) || network.chain?.unsupported}
                    onClick={onSwap}
                >
                    <Typography className='!font-bold'>
                        {
                            loading ? `Swapping` :
                                fromAssetValue && toAssetValue && natives.includes(fromAssetValue.address.toLowerCase()) && natives.includes(toAssetValue.address.toLowerCase()) ?
                                    fromAssetValue.address === "" ? "WRAP" : "UN-WRAP"
                                    : `Swap`
                        }
                    </Typography>
                    {(loading) && <CircularProgress size={10} />}
                </Button> */}
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
