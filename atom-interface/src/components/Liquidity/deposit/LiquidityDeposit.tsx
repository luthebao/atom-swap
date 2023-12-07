import { useState, useEffect, useCallback, useMemo } from 'react'
import { Typography, Button, CircularProgress, TextField, InputAdornment } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import SwitchStable from './SwitchStable'
import GlobalStore, { CurrencyInputType, LiquidityInputType, Pair, TXHstatus, Token } from '../../../store/gobalStore'
import { MAX_UINT256, devide, formatInputNumber, formatNumber } from '../../../configs/utils'
import { ROUTER_ADDRESS, WETH } from '../../../configs/addresses'
import { useSnapshot } from 'valtio'
import { ContractFunctionExecutionError, Hash, TransactionExecutionError, formatUnits, parseEther, parseGwei, parseUnits } from 'viem'
import { toast } from 'react-toastify'
import { Address, erc20ABI, useAccount, useNetwork } from 'wagmi'
import { ABI_ROUTER } from '../../../configs/abi'
import { wagmiCore } from '../../../configs/connectors'
import CurrencyInput from '../../CoreComponents/CurrencyInput'

export default function LiquidityDeposit() {

    const [pair, setPair] = useState<Pair | null>(null);
    const [depositLoading, setDepositLoading] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [amount0, setAmount0] = useState<string>('');
    const [amount1, setAmount1] = useState<string>('');
    const [asset0, setAsset0] = useState<Token | null>(null)
    const [asset1, setAsset1] = useState<Token | null>(null)
    const [stable, setStable] = useState<boolean>(false)
    const [slipage, setSlipage] = useState<string>("10")

    const globalstore = useSnapshot(GlobalStore.state)

    const account = useAccount()

    const network = useNetwork()

    const initPair = useMemo(async () => {
        if (asset0 && asset1) {
            setCreateLoading(true)
            const p = await GlobalStore.getPair(asset0, asset1, stable)
            setPair(p)
            setCreateLoading(false)
            return p
        }
        return null
    }, [asset0, asset1, stable])

    const swapAsset = () => {
        const a0 = asset0
        const a1 = asset1
        setAsset0(a1)
        setAsset1(a0)
    }

    const onAssetSelect = async (type: CurrencyInputType, value: Token) => {
        if (type === LiquidityInputType.ASSET0) {
            if (asset1 && value.address === asset1.address) {
                swapAsset()
            } else {
                setAsset0(value)
            }
        } else {
            if (asset0 && value.address === asset0.address) {
                swapAsset()
            } else {
                setAsset1(value)
            }
        }
    }

    const callQuoteLiquidity = useCallback(
        (amount0: string, amount1: string, input: 0 | 1, stable: boolean, pair: Pair | null, asset0: Token, asset1: Token) => {
            if (pair === null || pair.reserve0 === 0n || pair.reserve1 === 0n) {
                return
            }
            let invert = false
            let addy0 = asset0.address
            let addy1 = asset1.address
            if (asset0.address === '') {
                addy0 = WETH[globalstore.currentChain.id]
            }
            if (asset1.address === '') {
                addy1 = WETH[globalstore.currentChain.id]
            }
            if (addy1.toLowerCase() === pair.token0.address.toLowerCase() && addy0.toLowerCase() === pair.token1.address.toLowerCase()) {
                invert = true
            }
            if (input == 0) {
                if (amount0 == '') {
                    setAmount1('')
                } else {
                    if (invert) {
                        amount1 = formatUnits(parseUnits(amount0 as `${number}`, asset0.decimals) * pair.reserve0 / pair.reserve1, asset0.decimals)
                    } else {
                        amount1 = formatUnits(parseUnits(amount0 as `${number}`, asset0.decimals) * pair.reserve1 / pair.reserve0, asset0.decimals)
                    }
                    setAmount1(amount1)
                }
            }
            if (input == 1) {
                if (amount1 == '') {
                    setAmount0('')
                } else {
                    if (invert) {
                        amount0 = formatUnits(parseUnits(amount1 as `${number}`, asset0.decimals) * pair.reserve1 / pair.reserve0, asset0.decimals)
                    } else {
                        amount0 = formatUnits(parseUnits(amount1 as `${number}`, asset0.decimals) * pair.reserve0 / pair.reserve1, asset0.decimals)
                    }
                    setAmount0(amount0)
                }
            }
        },
        [amount0, amount1, asset0, asset1, pair, stable]
    )

    const AmountAsset0Changed = (v: string) => {
        const inputValue: string = formatInputNumber(v)
        setAmount0(inputValue)
        if (asset0 && asset1 && pair) {
            callQuoteLiquidity(inputValue, amount1, 0, stable, pair, asset0, asset1)
        }
    }

    const AmountAsset1Changed = (v: string) => {
        const inputValue: string = formatInputNumber(v)
        setAmount1(inputValue)
        if (asset0 && asset1 && pair) {
            callQuoteLiquidity(amount0, inputValue, 1, stable, pair, asset0, asset1)
        }
    }

    useEffect(() => {
        if (asset0 && asset1) {
            if (pair && asset0.address !== pair.token0.address) {
                setAsset0(pair.token0)
                setAsset1(pair.token1)
            }
            callQuoteLiquidity(amount0, amount1, 0, stable, pair, asset0, asset1)
        }
    }, [stable, pair, initPair])

    useEffect(() => {
        initPair
    }, [stable, pair, asset0, asset1])

    useEffect(() => {
        if (!globalstore.openQueue) {
            setCreateLoading(false)
        }
    }, [globalstore.openQueue])

    const handleAddLiquidity = async () => {
        if (!account.address) {
            toast("Please connect your wallet")
            return
        }
        if (asset0 && asset1) {
            setCreateLoading(true)
            let toki0 = asset0.address
            let toki1 = asset1.address
            if (asset0.address === '') {
                toki0 = WETH[globalstore.currentChain.id]
            }
            if (asset1.address === '') {
                toki1 = WETH[globalstore.currentChain.id]
            }

            GlobalStore.setTxQueue([
                {
                    id: 0,
                    name: `Checking your ${asset0.symbol} allowance`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 1,
                    name: `Checking your ${asset1.symbol} allowance`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 2,
                    name: `Create liquidity pool`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            let allowance0: bigint = 0n
            let allowance1: bigint = 0n

            if (asset0.address !== "") {
                while (true) {
                    allowance0 = await wagmiCore.readContract({
                        abi: erc20ABI,
                        address: asset0.address as Address,
                        functionName: "allowance",
                        args: [account.address, ROUTER_ADDRESS[globalstore.currentChain.id]],
                    })
                    if (allowance0 < parseUnits(amount0 as `${number}`, asset0.decimals)) {
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

            if (asset1.address !== "") {
                while (true) {
                    allowance1 = await wagmiCore.readContract({
                        abi: erc20ABI,
                        address: asset1.address as Address,
                        functionName: "allowance",
                        args: [account.address, ROUTER_ADDRESS[globalstore.currentChain.id]]
                    })
                    if (allowance1 < parseUnits(amount1 as `${number}`, asset1.decimals)) {
                        try {
                            GlobalStore.updateTxQueue(1, TXHstatus.PENDING)
                            const approve1 = await wagmiCore.writeContract({
                                abi: erc20ABI,
                                address: toki1 as Address,
                                functionName: "approve",
                                args: [
                                    ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                                    MAX_UINT256
                                ]
                            })
                            GlobalStore.updateTxQueue(1, TXHstatus.SUBMITTED)
                            const await1 = await wagmiCore.waitForTransaction({
                                confirmations: globalstore.confirmations,
                                hash: approve1.hash
                            })
                            await1.status === "success" ? GlobalStore.updateTxQueue(1, TXHstatus.DONE) : GlobalStore.updateTxQueue(1, TXHstatus.REJECTED)
                        } catch (error: unknown) {
                            GlobalStore.updateTxQueue(1, TXHstatus.REJECTED)
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
                        allowance1 = MAX_UINT256
                        GlobalStore.updateTxQueue(1, TXHstatus.DONE)
                        break;
                    }
                }
            } else {
                allowance1 = MAX_UINT256
                GlobalStore.updateTxQueue(1, TXHstatus.DONE)
            }

            const sendSlippage = BigInt(Number(100 - (Number(slipage) <= 100 ? Number(slipage) : 100)) * 100000)
            const sendAmount0 = parseUnits(amount0 as `${number}`, asset0.decimals)
            const sendAmount1 = parseUnits(amount1 as `${number}`, asset1.decimals)
            const deadline = BigInt(Math.floor((Date.now() + 30 * 60 * 1000) / 1000))
            const sendAmount0min = sendAmount0 * sendSlippage / 100n / 100000n
            const sendAmount1min = sendAmount1 * sendSlippage / 100n / 100000n

            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                if (asset0.address === "") {
                    console.log("globalstore.currentChain.id", globalstore.currentChain.id)
                    const addLiquid = await wagmiCore.writeContract({
                        account: account.address,
                        abi: ABI_ROUTER,
                        address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                        functionName: "addLiquidityETH",
                        args: [
                            asset1.address as Address, stable, sendAmount1, sendAmount1min, sendAmount0min, account.address, deadline
                        ],
                        value: sendAmount0,
                    })
                    hash = addLiquid.hash
                } else if (asset1.address === "") {
                    const addLiquid = await wagmiCore.writeContract({
                        account: account.address,
                        abi: ABI_ROUTER,
                        address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                        functionName: "addLiquidityETH",
                        args: [
                            asset0.address as Address, stable, sendAmount0, sendAmount0min, sendAmount1min, account.address, deadline
                        ],
                        value: sendAmount1,
                    })
                    hash = addLiquid.hash
                } else {
                    const addLiquid = await wagmiCore.writeContract({
                        account: account.address,
                        abi: ABI_ROUTER,
                        address: ROUTER_ADDRESS[globalstore.currentChain.id] as Address,
                        functionName: "addLiquidity",
                        args: [
                            asset0.address as Address, asset1.address as Address, stable, sendAmount0, sendAmount1, sendAmount0min, sendAmount1min, account.address, deadline
                        ]
                    })
                    hash = addLiquid.hash
                }
                GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
            } catch (error) {
                GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                console.log(error)
                if (error instanceof TransactionExecutionError) {
                    toast(error.shortMessage)
                } else if (error instanceof ContractFunctionExecutionError) {
                    toast(error.shortMessage)
                } else {
                    toast("Unknown error")
                }
            }
            setCreateLoading(false)
        }
    }

    return (
        <div className="px-0 py-[12px]">
            <div className="px-[12px] py-0">
                <CurrencyInput type={LiquidityInputType.ASSET0} amountValue={amount0} amountChanged={AmountAsset0Changed} assetValue={asset0} onAssetSelect={onAssetSelect} />
                <div className="w-full flex items-center justify-center h-[0px] z-10">
                    <div className="bg-color-component-iconbtn rounded-[9px] h-[38px] z-10">
                        <AddIcon className="cursor-pointer p-[6px] !text-[30px] bg-color-component-input m-[4px] rounded-[6px]" />
                    </div>
                </div>
                <CurrencyInput type={LiquidityInputType.ASSET1} amountValue={amount1} amountChanged={AmountAsset1Changed} assetValue={asset1} onAssetSelect={onAssetSelect} />
                <SwitchStable stable={stable} setStable={setStable} />
                {
                    pair ?
                        (<div className="mt-[12px] p-[12px] flex flex-wrap rounded-[10px] w-full items-center">
                            <Typography className="w-full !font-bold !text-color-text1 !pb-[6px] [border-bottom:1px_solid_rgba(126,153,176,0.2)] !text-[14px]" >Reserve Info</Typography>
                            <div className="grid grid-cols-3 gap-[12px] w-full">
                                <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                                    <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center">
                                        {formatNumber(formatUnits(pair.reserve0, pair.token0.decimals))}
                                    </Typography>
                                    <Typography className="!text-[13px] text-color-text2">{`${pair?.token0?.symbol}`}</Typography>
                                </div>
                                <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                                    <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center">
                                        {formatNumber(formatUnits(pair.reserve1, pair.token1.decimals))}
                                    </Typography>
                                    <Typography className="!text-[13px] text-color-text2" >{`${pair?.token1?.symbol}`}</Typography>
                                </div>

                                <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                                    <div className="mb-[4px] relative">
                                        <div className="w-full flex items-center absolute top-0">
                                            <div className="pl-[12px]">
                                                <Typography className="!font-thin !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap > Slippage </Typography>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input max-w-[80px] max-h-[50px] pl-[12px] pr-[12px] py-[20px]">
                                            <TextField
                                                placeholder='0.00'
                                                fullWidth
                                                // error={amountError}
                                                // helperText={amountError}
                                                value={slipage}
                                                onChange={(e) => {
                                                    setSlipage(formatInputNumber(e.target.value))
                                                }}
                                                disabled={depositLoading || createLoading}
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
                        </div>)
                        :
                        (asset0 && asset1) && (<div className="mt-[12px] p-[12px] flex flex-wrap rounded-[10px] w-full items-center">
                            <Typography className="w-full !font-bold !text-color-text-btn !pb-[6px] [border-bottom:1px_solid_rgba(126,153,176,0.2)] !text-[14px]" >Starting Liquidity Info</Typography>
                            <div className="grid grid-cols-[repeat(2,1fr)] gap-[12px] w-full">
                                <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                                    <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center" >{parseUnits(amount1 as `${number}`, asset1?.decimals || 18) > 0n ? formatNumber(devide(parseUnits(amount0 as `${number}`, asset0?.decimals || 18), parseUnits(amount1 as `${number}`, asset1?.decimals || 18)).toString()) : '0.00'}</Typography>
                                    <Typography className="!text-[13px] text-color-text2" >{`${asset0?.symbol} per ${asset1?.symbol}`}</Typography>
                                </div>
                                <div className="flex flex-col items-center justify-center pl-0 pr-0 py-[12px]">
                                    <Typography className="!font-bold !text-[14px] pb-[6px] truncate w-full text-center" >{parseUnits(amount0 as `${number}`, asset0?.decimals || 18) > 0n ? formatNumber(devide(parseUnits(amount1 as `${number}`, asset1?.decimals || 18), parseUnits(amount0 as `${number}`, asset0?.decimals || 18)).toString()) : '0.00'}</Typography>
                                    <Typography className="!text-[13px] text-color-text2" >{`${asset1?.symbol} per ${asset0?.symbol}`}</Typography>
                                </div>
                            </div>
                        </div>)
                }
            </div>
            <div className="grid gap-[12px] grid-cols-[1fr] px-[24px] py-0 w-full h-full mt-[12px] [@media_screen_and(max-width:1280px)]:[border-left:0px_solid_rgba(104,108,122,0.25)!important] [@media_screen_and(max-width:1200px)]:[border-left:0px_solid_rgba(104,108,122,0.25)]">
                <Button
                    variant='contained'
                    size='large'
                    className={(createLoading || depositLoading) ? "w-auto" : "!bg-color-component-tab !text-color-text-btn !font-bold hover:!bg-color-component-hover disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"}
                    color='primary'
                    disabled={createLoading || depositLoading || !(asset0 && asset1) || !(account.address && account.isConnected) || network.chain?.unsupported}
                    onClick={handleAddLiquidity}
                >
                    <Typography className="!font-bold">{depositLoading ? `Depositing` : pair ? "Deposit" : `Create Pair & Deposit`}</Typography>
                    {(createLoading || depositLoading) && <CircularProgress size={10} className="!ml-[6px] !text-white" />}
                </Button>
            </div>
        </div>
    );
}