import { useEffect, useState } from 'react'
import { Typography, Button, TextField, InputAdornment, CircularProgress } from '@material-ui/core'

import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SearchIcon from '@material-ui/icons/Search'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import { useNavigate, useParams } from 'react-router-dom'
import CurrencyInput from '../../CoreComponents/CurrencyInput'
import GlobalStore, { CurrencyInputType, LiquidityInputType, Pair, Token } from '../../../store/gobalStore'
import CurrencyPicker from '../../CoreComponents/CurrencyPicker'
import { MAX_UINT256, formatInputNumber, formatNumber } from '../../../configs/utils'
import { ContractFunctionExecutionError, Hash, TransactionExecutionError, formatEther, formatUnits, isAddress, parseEther, parseUnits } from 'viem'
import { Address, useAccount, useNetwork } from 'wagmi'
import { toast } from 'react-toastify'
import { ROUTER_ADDRESS, WETH } from '../../../configs/addresses'
import { useSnapshot } from 'valtio'
import { TXHstatus } from '../../../store/gobalStore'
import { wagmiCore } from '../../../configs/connectors'
import { ABI_PAIR, ABI_ROUTER } from '../../../configs/abi'

export default function LiquidityWithdraw() {
    let { pairaddress } = useParams()

    const account = useAccount()
    const network = useNetwork()

    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [withdrawing, setWithdrawing] = useState(false)
    const [asset0, setAsset0] = useState<Token | null>(null)
    const [asset1, setAsset1] = useState<Token | null>(null)
    const [pair, setPair] = useState<Pair | null>(null)
    const [availablePairs, setAvailablePairs] = useState<Pair[]>([])

    const [amount0, setAmount0] = useState('')
    const [amount1, setAmount1] = useState('')

    const [amountp, setAmountp] = useState('')

    const [percent, setPercent] = useState<number>(100)

    const [slippage, setSlippage] = useState('2')

    const globalstore = useSnapshot(GlobalStore.state)

    useEffect(() => {
        if (pair) {
            setAsset0(pair.token0)
            setAsset1(pair.token1)
            setAmount0(formatUnits(pair.reserve0 * parseEther(amountp as `${number}`) / pair.totalSupply, pair.token0.decimals))
            setAmount1(formatUnits(pair.reserve1 * parseEther(amountp as `${number}`) / pair.totalSupply, pair.token1.decimals))
        }
    }, [pair, amountp])

    useEffect(() => {
        if (pairaddress && isAddress(pairaddress)) {
            parsePair(pairaddress)
        }
    }, [pairaddress])

    const onAssetSelect = (type: CurrencyInputType, value: Token | Pair) => {
        if (type === LiquidityInputType.ASSET0) {
            navigate("")
            if (asset1 && value.address.toLowerCase() === asset1.address.toLowerCase()) {
                swapAsset()
                getPairs(asset1, asset0)
            } else {
                setAsset0(value)
                getPairs(value, asset1)
            }
        } else if (type === LiquidityInputType.ASSET1) {
            navigate("")
            if (asset0 && value.address.toLowerCase() === asset0.address.toLowerCase()) {
                swapAsset()
                getPairs(asset1, asset0)
            } else {
                setAsset1(value)
                getPairs(asset0, value)
            }
        } else if (type === LiquidityInputType.PAIR) {
            setPair(value as Pair)
        }
    }

    const getPairs = async (asset0: Token | null, asset1: Token | null) => {
        setAvailablePairs([])
        setPair(null)
        setAmount0("")
        setAmount1("")
        setAmountp("")
        if (asset0 && asset1) {
            setLoading(true)
            const xs: Pair[] = []
            const x1 = await GlobalStore.getPair(asset0, asset1, true)
            const x2 = await GlobalStore.getPair(asset0, asset1, false)
            if (x1) xs.push(x1)
            if (x2) xs.push(x2)
            setAvailablePairs(xs)
            if (xs.length > 0) {
                setPair(xs[0])
            }
            setLoading(false)
        }
    }

    const parsePair = async (address: Address) => {
        setLoading(true)
        const getPair = await GlobalStore.fetchPair(address)
        if (getPair) {
            setPair(getPair)
            setAsset0(getPair.token0)
            setAsset1(getPair.token1)
            setAmount0(formatUnits(getPair.reserve0, getPair.token0.decimals))
            setAmount1(formatUnits(getPair.reserve1, getPair.token1.decimals))
        }
        setLoading(false)
    }

    const swapAsset = () => {
        const a0 = asset0
        const a1 = asset1
        setAsset0(a1)
        setAsset1(a0)
    }

    const onWithdraw = async () => {
        if (!account.address) {
            toast("Please connect your wallet")
            return
        }
        if (pair && asset0 && asset1) {
            setWithdrawing(true)
            GlobalStore.setTxQueue([
                {
                    id: 0,
                    name: `Checking your ${pair.symbol} allowance`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 2,
                    name: `Withdraw liquidity pool`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            let allowance: bigint = 0n

            if (pair.address !== "") {
                while (true) {
                    allowance = await wagmiCore.readContract({
                        abi: ABI_PAIR,
                        address: pair.address as Address,
                        functionName: "allowance",
                        args: [account.address, ROUTER_ADDRESS[globalstore.currentChain.id]],
                    })
                    if (allowance < parseUnits(amountp as `${number}`, pair.decimals) * BigInt(percent) / 100n) {
                        try {
                            GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                            const approved = await wagmiCore.writeContract({
                                abi: ABI_PAIR,
                                address: pair.address as Address,
                                functionName: "approve",
                                args: [
                                    ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                                    MAX_UINT256
                                ]
                            })
                            GlobalStore.updateTxQueue(0, TXHstatus.SUBMITTED)
                            const await0 = await wagmiCore.waitForTransaction({
                                confirmations: globalstore.confirmations,
                                hash: approved.hash
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
                        allowance = MAX_UINT256
                        GlobalStore.updateTxQueue(0, TXHstatus.DONE)
                        break;
                    }
                }
            } else {
                allowance = MAX_UINT256
                GlobalStore.updateTxQueue(0, TXHstatus.DONE)
            }

            const sendSlippage = BigInt(Number(100 - (Number(slippage) <= 100 && Number(slippage) > 0 ? Number(slippage) : 100)) * 100000)
            const sendAmount0 = parseUnits(amount0 as `${number}`, asset0.decimals) * BigInt(percent) / 100n
            const sendAmount1 = parseUnits(amount1 as `${number}`, asset1.decimals) * BigInt(percent) / 100n
            const sendAmountp = parseEther(amountp as `${number}`) * BigInt(percent) / 100n
            const deadline = BigInt(Math.floor((Date.now() + 20 * 60 * 1000) / 1000))
            const sendAmount0min = sendAmount0 * sendSlippage / 100n / 100000n
            const sendAmount1min = sendAmount1 * sendSlippage / 100n / 100000n
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                if (asset0.address === "" || asset1.address === "") {
                    let toki = asset0.address
                    if (asset0.address === '') {
                        toki = asset1.address
                    }
                    if (asset1.address === '') {
                        toki = asset0.address
                    }
                    const removeLiquid = await wagmiCore.writeContract({
                        abi: ABI_ROUTER,
                        address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                        functionName: "removeLiquidityETH",
                        args: [
                            toki as Address,
                            pair.isStable,
                            sendAmountp,
                            asset0.address === '' ? sendAmount1min : sendAmount0min,
                            asset0.address === '' ? sendAmount0min : sendAmount1min,
                            account.address,
                            deadline
                        ]
                    })
                    hash = removeLiquid.hash
                } else {
                    const removeLiquid = await wagmiCore.writeContract({
                        abi: ABI_ROUTER,
                        address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                        functionName: "removeLiquidity",
                        args: [
                            asset0.address as Address,
                            asset1.address as Address,
                            pair.isStable,
                            sendAmountp,
                            sendAmount0min,
                            sendAmount1min,
                            account.address,
                            deadline
                        ]
                    })
                    hash = removeLiquid.hash
                }
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
            setWithdrawing(false)
        }
    }

    return (
        <div className="px-0 py-[12px]">
            <div className="px-[12px] py-0">
                <div className="grid gap-[4px] grid-cols-2">
                    <CurrencyPicker type={LiquidityInputType.ASSET0} assetValue={asset0} onAssetSelect={onAssetSelect} amountValue={
                        formatEther(
                            parseEther(amount0 as `${number}`) * BigInt(percent) / 100n
                        )
                    } amountChanged={console.log} />
                    <CurrencyPicker type={LiquidityInputType.ASSET1} assetValue={asset1} onAssetSelect={onAssetSelect} amountValue={
                        formatEther(
                            parseEther(amount1 as `${number}`) * BigInt(percent) / 100n
                        )
                    } amountChanged={console.log} />
                </div>
                <div className="w-full flex items-center justify-center h-[0px] z-10">
                    <div className="bg-color-component-iconbtn rounded-[9px] h-[38px] z-10">
                        <ArrowDownwardIcon className="cursor-pointer p-[6px] !text-[30px] bg-color-component-input m-[4px] rounded-[6px]" />
                    </div>
                </div>
                <CurrencyInput loading={loading} type={LiquidityInputType.PAIR} amountValue={(
                    formatEther(
                        parseEther(amountp as `${number}`) * BigInt(percent) / 100n
                    )
                ).toString()} amountChanged={setAmountp} assetValue={pair} onAssetSelect={onAssetSelect} list={availablePairs} />
                <div className="grid gap-[4px] grid-cols-11 mt-2">
                    <div className={`col-span-3 p-[5px] rounded-[8px] flex items-center justify-center text-color-text-btn border-[1px] border-solid border-color-component-input hover:!bg-color-component-tab hover:!text-color-text-btn ${percent === 25 && "!bg-color-component-tab !text-color-text-btn !border-color-text"}`} onClick={() => { setPercent(25) }}>
                        <Typography className="text-center">25%</Typography>
                    </div>
                    <div className={`col-span-3 p-[5px] rounded-[8px] flex items-center justify-center text-color-text-btn border-[1px] border-solid border-color-component-input hover:!bg-color-component-tab hover:!text-color-text-btn ${percent === 50 && "!bg-color-component-tab !text-color-text-btn !border-color-text"}`} onClick={() => { setPercent(50) }}>
                        <Typography className="text-center">50%</Typography>
                    </div>
                    <div className={`col-span-3 p-[5px] rounded-[8px] flex items-center justify-center text-color-text-btn border-[1px] border-solid border-color-component-input hover:!bg-color-component-tab hover:!text-color-text-btn ${percent === 100 && "!bg-color-component-tab !text-color-text-btn !border-color-text"}`} onClick={() => { setPercent(100) }}>
                        <Typography className="text-center">100%</Typography>
                    </div>
                    <div className={`col-span-2 p-[5px] rounded-[8px] flex items-center justify-center text-color-text-btn border-[1px] border-solid border-color-component-input hover:!bg-color-component-tab hover:!text-color-text-btn ${![25, 50, 100].includes(percent) && "!bg-color-component-tab !text-color-text-btn !border-color-text"}`}>
                        <TextField
                            className="px-1"
                            placeholder="Custom"
                            fullWidth
                            value={percent}
                            onChange={(e) => {
                                setPercent(Number(e.target.value))
                            }}
                            disabled={loading || withdrawing}
                            type="number"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    %
                                </InputAdornment>,
                            }}
                            inputProps={{
                                step: 1,
                                min: 1,
                                max: 100
                            }}
                        />
                    </div>
                </div>
                {pair && <div className="mt-[8px] p-[12px] flex flex-wrap rounded-[10px] w-full items-center">
                    <Typography className="w-full !font-bold !text-color-text-btn !pb-[6px] [border-bottom:1px_solid_rgba(126,153,176,0.2)] !text-[14px]">Reserve Info</Typography>
                    <div className="grid grid-cols-3 gap-[12px] w-full">
                        <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                            <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center" >
                                {
                                    formatNumber(formatUnits(pair.reserve0, pair.token0.decimals))
                                }
                            </Typography>
                            <Typography className="!text-[13px] text-color-text2" >{pair.token0.symbol}</Typography>
                        </div>
                        <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                            <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center" >
                                {
                                    formatNumber(formatUnits(pair.reserve1, pair.token1.decimals))
                                }
                            </Typography>
                            <Typography className="!text-[13px] text-color-text2" >{pair.token1.symbol}</Typography>
                        </div>
                        <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                            <div className="mb-[4px] relative">
                                <div className="w-full flex items-center absolute top-0">
                                    <div className="pl-[12px]">
                                        <Typography className="!font-[100] !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap>Slippage</Typography>
                                    </div>
                                </div>
                                <div className="flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input max-w-[80px] max-h-[50px] pl-[12px] pr-[12px] py-[20px]">
                                    <TextField
                                        placeholder='0.00'
                                        fullWidth
                                        value={slippage}
                                        onChange={(e) => {
                                            setSlippage(formatInputNumber(e.target.value))
                                        }}
                                        disabled={loading || withdrawing}
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
                </div>}
            </div>
            <div className="grid gap-[12px] grid-cols-[1fr] px-[24px] py-[0px] w-full h-full mt-[12px]">
                <Button
                    variant='contained'
                    size='large'
                    color='primary'
                    className={(loading || withdrawing) ? "w-auto" : "!bg-color-component-tab !text-color-text-btn !font-bold hover:!bg-color-component-hover disabled:!bg-color-component-disabled disabled:!text-color-text-btn-disabled"}
                    disabled={loading || withdrawing || !(pair && (parseEther(amountp as `${number}`) * BigInt(percent) / 100n) > 0n) || !(account.address && account.isConnected) || network.chain?.unsupported}
                    onClick={onWithdraw}
                >
                    <Typography className="!font-bold">{(loading || withdrawing) ? `Loading` : `Withdraw`}</Typography>
                    {(loading || withdrawing) && <CircularProgress size={10} className="!ml-[6px] !text-white" />}
                </Button>
            </div>
        </div>
    );
}