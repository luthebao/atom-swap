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
import { ETHs, WETHs } from '../../configs/tokens'
import CurrencyInput from '../CoreComponents/CurrencyInput'
import StrangeToken from './StrangeToken'
import { useSnapshot } from 'valtio'
import { ContractFunctionExecutionError, Hash, TransactionExecutionError, formatUnits, parseUnits } from 'viem'
import { ABI_ROUTER, ABI_WETH } from '../../configs/abi'
import { DEXTOOLS, ROUTER_ADDRESS, WETH } from '../../configs/addresses'
import { Address, erc20ABI, useAccount, useNetwork } from 'wagmi'
import { wagmiCore } from '../../configs/connectors'
import { toast } from 'react-toastify'
import { MdCandlestickChart, MdRefresh, MdOutlineSettings } from "react-icons/md";

function SwapCore() {
    const globalstore = useSnapshot(GlobalStore.state)
    const account = useAccount()
    const network = useNetwork()
    const natives = ETHs.concat(WETHs).filter(val => val.chainId === globalstore.currentChain.id).map(val => val.address.toLowerCase())

    const [isStrangeToken, setIsStrangeToken] = useState<boolean>(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const [loading, setLoading] = useState<boolean>(false)
    const [quoteLoading, setQuoteLoading] = useState<boolean>(false)

    const [fromAmountValue, setFromAmountValue] = useState('')
    const [fromAssetValue, setFromAssetValue] = useState<Token | null>(null)

    const [toAmountValue, setToAmountValue] = useState('')
    const [toAssetValue, setToAssetValue] = useState<Token | null>(null)

    const [slippage, setSlippage] = useState('0.5')

    const [quoteError, setQuoteError] = useState<string | undefined | null>(null)
    const [quote, setQuote] = useState<Quote | null>(null)

    useEffect(() => {
        if (fromAssetValue) {
            setFromAssetValue(ETHs.find(val => val.chainId === globalstore.currentChain.id) || null)
        }
    }, [globalstore.currentChain])

    useEffect(() => {
        if (searchParams.get("outputCurrency")) {
            const outputCurrency = searchParams.get("outputCurrency")
            if (outputCurrency) {
                const getingToken = GlobalStore.getTokenList().find(val => val.address.toLowerCase() === outputCurrency.toLowerCase() && val.chainId === globalstore.currentChain.id)
                if (getingToken) {
                    setToAssetValue(getingToken)
                    setIsStrangeToken(false)
                } else {
                    setToAssetValue(null)
                    setIsStrangeToken(true)
                }
            }
        } else {
            setIsStrangeToken(false)
        }
        if (fromAssetValue === null || fromAssetValue.address === "") {
            setFromAssetValue(ETHs.find(val => val.chainId === globalstore.currentChain.id) || null)
        }
    }, [searchParams, globalstore.baseTokens, GlobalStore.getTokenList()])

    const onAssetSelect = (type: CurrencyInputType, value: Token) => {
        if (type === SwapInputType.FROM) {
            if (toAssetValue && value.address === toAssetValue.address) {
                swapAssets()
                calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue)
            } else {
                setFromAssetValue(value)
                calculateReceiveAmount(fromAmountValue, value, toAssetValue)
            }
        } else {
            if (fromAssetValue && value.address === fromAssetValue.address) {
                swapAssets()
                value.address.length > 0 ? setSearchParams({
                    "outputCurrency": value.address
                }) : setSearchParams()
                calculateReceiveAmount(fromAmountValue, toAssetValue, fromAssetValue)
            } else {
                setToAssetValue(value)
                value.address.length > 0 ? setSearchParams({
                    "outputCurrency": value.address
                }) : setSearchParams()
                calculateReceiveAmount(fromAmountValue, fromAssetValue, value)
            }
        }
    }

    const fromAmountChanged = (v: string) => {
        const inputValue: string = formatInputNumber(v)
        setFromAmountValue(inputValue)
        if (v === '') {
            setToAmountValue('')
            setQuote(null)
        } else {
            calculateReceiveAmount(inputValue, fromAssetValue, toAssetValue)
        }
    }

    const toAmountChanged = (v: string) => {
    }

    const calculateReceiveAmount = useCallback(
        async (fromAmount: string, from: Token | null, to: Token | null) => {
            if (from && to && parseUnits(fromAmount as `${number}`, from.decimals) > 0n) {
                if (natives.includes(from.address.toLowerCase()) && natives.includes(to.address.toLowerCase())) {
                    setToAmountValue(fromAmount)
                } else {
                    try {
                        // setToAmountValue("")
                        setQuoteLoading(true)
                        setQuoteError(null)
                        const sendFromAmount = parseUnits(fromAmount as `${number}`, from.decimals)
                        let addy0 = from.address
                        let addy1 = to.address
                        const WETH = WETHs.find(val => val.chainId === globalstore.currentChain.id)
                        if (from.address.length === 0 && WETH) {
                            addy0 = WETH.address
                        }
                        if (to.address.length === 0 && WETH) {
                            addy1 = WETH.address
                        }

                        const result = await wagmiCore.readContract({
                            abi: ABI_ROUTER,
                            address: ROUTER_ADDRESS[globalstore.currentChain.id],
                            functionName: "getAmountOut",
                            args: [
                                sendFromAmount,
                                addy0 as `0x${string}`,
                                addy1 as `0x${string}`
                            ]
                        })
                        if (result[0] === 0n) {
                            setQuote(null)
                            setQuoteError("Insufficient liquidity or no route available to complete swap")
                        } else {
                            const reverse = await wagmiCore.readContract({
                                abi: ABI_ROUTER,
                                address: ROUTER_ADDRESS[globalstore.currentChain.id],
                                functionName: "getReserves",
                                args: [
                                    addy0 as `0x${string}`,
                                    addy1 as `0x${string}`,
                                    result[1]
                                ]
                            })

                            setQuote({
                                amountin: parseUnits(fromAmount as `${number}`, from.decimals),
                                amountout: result[0],
                                stable: result[1],
                                reversein: reverse[0],
                                reverseout: reverse[1]
                            })
                            setToAmountValue(formatUnits(result[0], to.decimals))
                        }
                    } catch (error) {
                        console.log(error)
                        setToAmountValue("")
                        setQuote(null)
                        setQuoteError("Too much request, please try again later")
                    }
                }
            }
            setQuoteLoading(false)
        },
        [fromAmountValue, fromAssetValue, toAssetValue]
    )

    const onSwap = async () => {
        if (fromAssetValue && toAssetValue && account.address) {
            setLoading(true)
            if (natives.includes(fromAssetValue.address.toLowerCase()) && natives.includes(toAssetValue.address.toLowerCase())) {
                if (fromAssetValue.address === '') {
                    GlobalStore.setTxQueue([
                        {
                            id: 2,
                            name: `WRAP ${fromAmountValue} ${fromAssetValue.symbol} to ${toAssetValue.symbol}`,
                            status: TXHstatus.WAITING,
                            hash: ""
                        },
                    ])
                    try {
                        GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                        let hash: Hash
                        const wrappp = await wagmiCore.writeContract({
                            abi: ABI_WETH,
                            address: WETH[globalstore.currentChain.id] as Address,
                            functionName: "deposit",
                            value: parseUnits(fromAmountValue as `${number}`, fromAssetValue.decimals)
                        })
                        hash = wrappp.hash
                        GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                        const wait2 = await wagmiCore.waitForTransaction({
                            confirmations: globalstore.confirmations,
                            hash: hash
                        })
                        wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                    } catch (error: unknown) {
                        GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                        if (error instanceof TransactionExecutionError) {
                            toast(error.shortMessage)
                        } else if (error instanceof ContractFunctionExecutionError) {
                            toast(error.shortMessage)
                        } else {
                            toast("Unknown error")
                        }
                    }
                } else if (toAssetValue.address === '') {
                    GlobalStore.setTxQueue([
                        {
                            id: 0,
                            name: `Checking your ${fromAssetValue.symbol} allowance`,
                            status: TXHstatus.WAITING,
                            hash: ""
                        },
                        {
                            id: 2,
                            name: `UN-WRAP ${fromAmountValue} ${fromAssetValue.symbol} to ${toAssetValue.symbol}`,
                            status: TXHstatus.WAITING,
                            hash: ""
                        },
                    ])
                    let allowance0: bigint = 0n

                    while (true) {
                        allowance0 = await wagmiCore.readContract({
                            abi: erc20ABI,
                            address: fromAssetValue.address as Address,
                            functionName: "allowance",
                            args: [account.address, ROUTER_ADDRESS[globalstore.currentChain.id]],
                        })
                        if (allowance0 < parseUnits(fromAmountValue as `${number}`, fromAssetValue.decimals)) {
                            try {
                                GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                                const approve0 = await wagmiCore.writeContract({
                                    abi: erc20ABI,
                                    address: fromAssetValue.address as Address,
                                    functionName: "approve",
                                    args: [
                                        ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                                        MAX_UINT256
                                    ]
                                })
                                GlobalStore.updateTxQueue(0, TXHstatus.SUBMITTED)
                                const await0 = await wagmiCore.waitForTransaction({
                                    confirmations: globalstore.confirmations,
                                    hash: approve0.hash
                                })
                                await0.status === "success" ? GlobalStore.updateTxQueue(0, TXHstatus.DONE) : GlobalStore.updateTxQueue(0, TXHstatus.REJECTED)
                            } catch (error: unknown) {
                                GlobalStore.updateTxQueue(0, TXHstatus.REJECTED)
                                if (error instanceof TransactionExecutionError) {
                                    toast(error.shortMessage)
                                } else if (error instanceof ContractFunctionExecutionError) {
                                    toast(error.shortMessage)
                                } else {
                                    toast("Unknown error")
                                }
                                break;
                            }
                        } else {
                            allowance0 = MAX_UINT256
                            GlobalStore.updateTxQueue(0, TXHstatus.DONE)
                            break;
                        }
                    }

                    try {
                        GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                        let hash: Hash
                        const wrappp = await wagmiCore.writeContract({
                            abi: ABI_WETH,
                            address: WETH[globalstore.currentChain.id] as Address,
                            functionName: "withdraw",
                            args: [
                                parseUnits(fromAmountValue as `${number}`, fromAssetValue.decimals)
                            ]
                        })
                        hash = wrappp.hash
                        GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                        const wait2 = await wagmiCore.waitForTransaction({
                            confirmations: globalstore.confirmations,
                            hash: hash
                        })
                        wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                    } catch (error: unknown) {
                        GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                        if (error instanceof TransactionExecutionError) {
                            toast(error.shortMessage)
                        } else if (error instanceof ContractFunctionExecutionError) {
                            toast(error.shortMessage)
                        } else {
                            toast("Unknown error")
                        }
                    }
                }
            } else if (quote) {
                let toki0 = fromAssetValue.address
                let toki1 = toAssetValue.address

                if (fromAssetValue.address === '') {
                    toki0 = WETH[globalstore.currentChain.id]
                }
                if (toAssetValue.address === '') {
                    toki1 = WETH[globalstore.currentChain.id]
                }
                GlobalStore.setTxQueue([
                    {
                        id: 0,
                        name: `Checking your ${fromAssetValue.symbol} allowance`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                    {
                        id: 2,
                        name: `Swap ${fromAmountValue} ${fromAssetValue.symbol} to ${toAssetValue.symbol}`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                ])
                let allowance0: bigint = 0n

                if (fromAssetValue.address !== "") {
                    while (true) {
                        allowance0 = await wagmiCore.readContract({
                            abi: erc20ABI,
                            address: fromAssetValue.address as Address,
                            functionName: "allowance",
                            args: [account.address, ROUTER_ADDRESS[globalstore.currentChain.id]],
                        })
                        if (allowance0 < parseUnits(fromAmountValue as `${number}`, fromAssetValue.decimals)) {
                            try {
                                GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                                const approve0 = await wagmiCore.writeContract({
                                    abi: erc20ABI,
                                    address: toki0 as Address,
                                    functionName: "approve",
                                    args: [
                                        ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                                        MAX_UINT256
                                    ]
                                })
                                GlobalStore.updateTxQueue(0, TXHstatus.SUBMITTED)
                                const await0 = await wagmiCore.waitForTransaction({
                                    confirmations: globalstore.confirmations,
                                    hash: approve0.hash
                                })
                                await0.status === "success" ? GlobalStore.updateTxQueue(0, TXHstatus.DONE) : GlobalStore.updateTxQueue(0, TXHstatus.REJECTED)
                            } catch (error: unknown) {
                                GlobalStore.updateTxQueue(0, TXHstatus.REJECTED)
                                if (error instanceof TransactionExecutionError) {
                                    toast(error.shortMessage)
                                } else if (error instanceof ContractFunctionExecutionError) {
                                    toast(error.shortMessage)
                                } else {
                                    toast("Unknown error")
                                }
                                break;
                            }
                        } else {
                            allowance0 = MAX_UINT256
                            GlobalStore.updateTxQueue(0, TXHstatus.DONE)
                            break;
                        }
                    }
                } else {
                    allowance0 = MAX_UINT256
                    GlobalStore.updateTxQueue(0, TXHstatus.DONE)
                }

                const sendSlippage = BigInt(Number(100 - (Number(slippage) <= 100 ? Number(slippage) : 100)) * 100000)
                const deadline = BigInt(Math.floor((Date.now() + 20 * 60 * 1000) / 1000))
                const fromAmountMax = parseUnits(fromAmountValue as `${number}`, fromAssetValue.decimals)
                const toAmountMax = parseUnits(toAmountValue as `${number}`, toAssetValue.decimals)
                const toAmountMin = toAmountMax * sendSlippage / 100n / 100000n

                try {
                    GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                    let hash: Hash
                    if (fromAssetValue.address === "") {
                        const swappp = await wagmiCore.writeContract({
                            abi: ABI_ROUTER,
                            address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                            functionName: "swapExactETHForTokens",
                            args: [
                                toAmountMin,
                                [
                                    {
                                        "from": toki0 as Address,
                                        "to": toki1 as Address,
                                        "stable": quote.stable
                                    },
                                ],
                                account.address,
                                deadline
                            ],
                            value: fromAmountMax
                        })
                        hash = swappp.hash

                    } else if (toAssetValue.address === "") {
                        const swappp = await wagmiCore.writeContract({
                            abi: ABI_ROUTER,
                            address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                            functionName: "swapExactTokensForETH",
                            args: [
                                fromAmountMax,
                                toAmountMin,
                                [
                                    {
                                        "from": toki0 as Address,
                                        "to": toki1 as Address,
                                        "stable": quote.stable
                                    },
                                ],
                                account.address,
                                deadline
                            ]
                        })
                        hash = swappp.hash
                    } else {
                        const swappp = await wagmiCore.writeContract({
                            abi: ABI_ROUTER,
                            address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                            functionName: "swapExactTokensForTokens",
                            args: [
                                fromAmountMax,
                                toAmountMin,
                                [
                                    {
                                        "from": toki0 as Address,
                                        "to": toki1 as Address,
                                        "stable": quote.stable
                                    },
                                ],
                                account.address,
                                deadline
                            ]
                        })
                        hash = swappp.hash
                    }

                    GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                    const wait2 = await wagmiCore.waitForTransaction({
                        confirmations: globalstore.confirmations,
                        hash: hash
                    })
                    // console.log(wait2.logs)
                    wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                } catch (error: unknown) {
                    GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                    if (error instanceof TransactionExecutionError) {
                        toast(error.shortMessage)
                    } else if (error instanceof ContractFunctionExecutionError) {
                        toast(error.shortMessage)
                    } else {
                        toast("Unknown error")
                    }
                }
                setFromAmountValue("")
                setToAmountValue("")
            }
            setLoading(false)
        }
    }

    const swapAssets = () => {
        const fa: Token | null = fromAssetValue
        const ta: Token | null = toAssetValue
        setFromAmountValue(toAmountValue)
        setFromAssetValue(ta)
        setToAssetValue(fa)
        fa && fa.address.length > 0 ? setSearchParams({
            "outputCurrency": fa.address
        }) : setSearchParams()
        calculateReceiveAmount(fromAmountValue, ta, fa)
    }


    return (
        <div className="flex flex-col w-full">
            <div className='flex flex-row justify-between mb-1'>
                <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => {
                    if (DEXTOOLS[globalstore.currentChain.id] && toAssetValue) {
                        window.open(DEXTOOLS[globalstore.currentChain.id] + toAssetValue.address, "_blank", "noreferrer")
                    }
                }}>
                    <MdCandlestickChart className='text-2xl' />
                </IconButton>
                <div className='flex flex-row'>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={() => {
                        calculateReceiveAmount(fromAmountValue, fromAssetValue, toAssetValue)
                    }}>
                        <MdRefresh className='text-2xl' />
                    </IconButton>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md">
                        <MdOutlineSettings className='text-2xl hover:animate-spin' />
                    </IconButton>
                </div>
            </div>
            <CurrencyInput type={SwapInputType.FROM} assetValue={fromAssetValue} onAssetSelect={onAssetSelect} amountValue={fromAmountValue} amountChanged={fromAmountChanged} />
            <div className="w-full flex items-center justify-center z-1 h-0">
                <div className="bg-color-component-iconbtn rounded-[9px] h-[38px] z-10">
                    <ArrowDownwardIcon className="cursor-pointer p-[6px] !text-[30px] bg-color-component-input m-1 rounded-md" onClick={swapAssets} />
                </div>
            </div>
            <CurrencyInput type={SwapInputType.TO} assetValue={toAssetValue} onAssetSelect={onAssetSelect} amountValue={toAmountValue} amountChanged={toAmountChanged} />

            <div className="flex w-full mt-[10px]">
                <Button
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
                </Button>
            </div>
            <QuoteInfomation quoteError={quoteError} isLoading={loading || quoteLoading} quote={quote} from={fromAssetValue?.symbol} to={toAssetValue?.symbol} slippage={slippage} setSlippage={setSlippage} />
            <StrangeToken show={isStrangeToken} />
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
