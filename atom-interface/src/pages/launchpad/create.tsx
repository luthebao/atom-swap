import { Button, CircularProgress, FormControl, FormControlLabel, FormLabel, MenuItem, Paper, Radio, RadioGroup, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@material-ui/core";
import GlobalStore, { CurrencyInputType, SwapInputType, TXHstatus, Token } from "../../store/gobalStore";
import { useState } from "react";
import { MAX_UINT256, formatNumber, ipfsClient, isValidHttpUrl } from "../../configs/utils";
import { Address, erc20ABI, useAccount, useContractRead, useNetwork } from "wagmi";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { ContractFunctionExecutionError, TransactionExecutionError, formatEther, parseEther, parseUnits } from "viem";
import { wagmiCore } from "../../configs/connectors";
import { useSnapshot } from "valtio";
import { LAUNCHFACTORY_ADDRESS } from "../../configs/addresses";
import { Hash } from "@wagmi/core";
import { ABI_LAUNCH_FACTORY } from "../../configs/abi";
import CurrencyInfor from "../../components/CoreComponents/CurrencyInfo";
import PoolStore, { Metadata, PoolType } from "../../store/poolStore";
import TokenAmountInput from "../../components/CoreComponents/TokenAmountInput";
import { InfoOutlined } from "@material-ui/icons";
import { Link, useNavigate } from "react-router-dom";

type Ether = `${number}`

type KeyMetadata = keyof Metadata

export default function LaunchpadCreator() {
    const navigate = useNavigate()
    const account = useAccount()
    const network = useNetwork()
    const globalstore = useSnapshot(GlobalStore.state)
    const poolstore = useSnapshot(PoolStore.state)

    const [loading, setLoading] = useState<boolean>(false)
    const [assetValue, setAssetValue] = useState<Token | null>(null)
    const [step, setStep] = useState<number>(1)

    const [metadata, setMetadata] = useState<Metadata>({
        logo: "",
        website: "",
        twitter: "",
        telegram: "",
        github: "",
        discord: "",
        document: "",
        youtube: "",
        description: ""
    })

    const nativeToken = globalstore.currentChain.nativeCurrency

    const fundFee = useContractRead({
        abi: ABI_LAUNCH_FACTORY,
        address: LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id],
        functionName: "fundFee",
    }).data || 0n

    const poolFee = useContractRead({
        abi: ABI_LAUNCH_FACTORY,
        address: LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id],
        functionName: "flatFee",
    }).data || 0n

    const onAssetSelect = (type: CurrencyInputType, value: Token) => {
        setAssetValue(value)
        PoolStore.setToken(value.address as Address)
    }

    const tokenneed = poolstore.pool_type === PoolType.FAIRLAUNCH ?
        parseEther(poolstore.buy_rate as Ether) + parseEther(poolstore.buy_rate as Ether) * (100n - fundFee) * BigInt(poolstore.liquidity_percent) / 100n / 100n
        : parseEther(poolstore.buy_rate as Ether) * parseEther(poolstore.hardcap as Ether) / parseEther("1") + parseEther(poolstore.list_rate as Ether) * (
            parseEther(poolstore.hardcap as Ether) * (100n - fundFee) * BigInt(poolstore.liquidity_percent) / 100n / 100n
        ) / parseEther("1")

    const onCreate = async () => {
        setLoading(true)
        if (assetValue && account.address && parseEther(poolstore.buy_rate as Ether) > 0n && parseEther(poolstore.softcap as Ether) > 0n) {
            console.log(poolstore)
            GlobalStore.setTxQueue([
                {
                    id: 0,
                    name: `Checking your ${assetValue.symbol} allowance`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 2,
                    name: `Create pool for ${assetValue.symbol}`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            // 0
            let allowance0: bigint = 0n
            const amountValue = formatEther(tokenneed)
            while (true) {
                allowance0 = await wagmiCore.readContract({
                    abi: erc20ABI,
                    address: assetValue.address as Address,
                    functionName: "allowance",
                    args: [account.address, LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id]],
                })
                if (allowance0 < parseUnits(amountValue as Ether, assetValue.decimals)) {
                    try {
                        GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                        const approve0 = await wagmiCore.writeContract({
                            abi: erc20ABI,
                            address: assetValue.address as Address,
                            functionName: "approve",
                            args: [
                                LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id],
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

            // 1
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const logo = await fetch(metadata.logo)
                const logo_blob = await logo.blob()
                const ipfs = await ipfsClient.store({
                    name: `${assetValue.name} ${poolstore.pool_type === PoolType.FAIRLAUNCH ? "Fairlaunch" : poolstore.pool_type === PoolType.PUBLIC ? "Public sale" : "Whitelist"}`,
                    description: metadata.description,
                    image: logo_blob,
                    properties: metadata
                })
                const create = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_FACTORY,
                    address: LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id],
                    functionName: "create_pool",
                    args: [
                        {
                            "sale_token": assetValue.address as Address,
                            "buy_rate": parseUnits(poolstore.buy_rate as Ether, assetValue.decimals),
                            "list_rate": parseUnits(poolstore.list_rate as Ether, assetValue.decimals),
                            "buy_min": parseEther(poolstore.buy_min as Ether),
                            "buy_max": parseEther(poolstore.buy_max as Ether),
                            "softcap": parseEther(poolstore.softcap as Ether),
                            "hardcap": parseEther(poolstore.hardcap as Ether),
                            "isBurnRefund": true,
                            "liquidity_percent": BigInt(poolstore.liquidity_percent),
                            "liquidity_lock": BigInt(poolstore.liquidity_lock),
                            "pool_type": BigInt(poolstore.pool_type),
                            "pool_start": BigInt(poolstore.pool_start),
                            "pool_end": BigInt(poolstore.pool_end),
                            "metadata": ipfs.ipnft
                        }
                    ],
                    value: poolFee
                })
                hash = create.hash
                GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                // console.log(wait2.contractAddress, wait2)
                wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                navigate("/launchpad")
            } catch (error: unknown) {
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
        } else {
            toast("Please input valid values")
        }
        setLoading(false)
    }

    return (
        <div className="w-full flex flex-col justify-center relative mt-[80px]">
            <div className="flex justify-center items-center">
                <Paper elevation={0} className="max-w-[700px] w-full p-[12px] flex flex-col">
                    <form className="flex flex-col w-full" onSubmit={(e) => {
                        e.preventDefault();
                        step === 1 ?
                            setStep(2) :
                            step === 2 ?
                                setStep(3) :
                                step === 3 ?
                                    setStep(4) :
                                    onCreate()
                    }}>
                        <div className="flex flex-row justify-center items-center mb-5">
                            <Typography className="!font-bold" variant="h1">
                                Create Pool
                            </Typography>
                        </div>
                        {
                            step === 1 &&
                            <div>
                                <div className=" text-xl">
                                    Pool fee: {formatEther(poolFee)} {globalstore.currentChain.nativeCurrency.symbol} + {fundFee.toLocaleString()}% fund raised
                                </div>
                                <CurrencyInfor type={SwapInputType.FROM} assetValue={assetValue} onAssetSelect={onAssetSelect} list={[]} />
                                <FormControl className="flex w-full !mt-[10px] gap-2 !px-1" required>
                                    <FormLabel>Pool type</FormLabel>
                                    <RadioGroup row value={poolstore.pool_type} onChange={(e, value) => PoolStore.setPoolType(Number(value) as PoolType)}>
                                        <FormControlLabel className="flex-1" value={PoolType.PUBLIC} control={<Radio />} label="Public sale" />
                                        <FormControlLabel className="flex-1" value={PoolType.WHITELIST} control={<Radio />} label="Private sale" />
                                        <FormControlLabel className="flex-1" value={PoolType.FAIRLAUNCH} control={<Radio />} label="Fairlaunch" />
                                    </RadioGroup>
                                </FormControl>
                                <div className="flex w-full mt-[10px] gap-2">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                        disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                    >
                                        <Typography className="!font-bold">
                                            {
                                                loading ? `Processing` : `Next step`
                                            }
                                        </Typography>
                                        {(loading) && <CircularProgress size={10} />}
                                    </Button>

                                </div>
                            </div>
                        }
                        {
                            step === 2 && <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-4">
                                    <TokenAmountInput title={poolstore.pool_type === PoolType.FAIRLAUNCH ? "Total token for sale" : "Buy rate"} assetValue={assetValue} amountValue={poolstore.buy_rate} amountChanged={PoolStore.setBuyRate} />
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Softcap ({nativeToken.symbol})
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    placeholder="0"
                                                    fullWidth
                                                    value={poolstore.softcap}
                                                    onChange={(e) => PoolStore.setSoftCap(e.target.value)}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {poolstore.pool_type !== PoolType.FAIRLAUNCH && <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Hardcap ({nativeToken.symbol})
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    placeholder="0"
                                                    fullWidth
                                                    value={poolstore.hardcap}
                                                    onChange={(e) => PoolStore.setHardCap(e.target.value)}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                                {poolstore.pool_type !== PoolType.FAIRLAUNCH && <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Min Buy ({nativeToken.symbol})
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    placeholder="0"
                                                    fullWidth
                                                    value={poolstore.buy_min}
                                                    onChange={(e) => PoolStore.setBuyMin(e.target.value)}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex px-[12px] pb-[6px] cursor-pointer">
                                                Max Buy ({nativeToken.symbol})
                                            </div>

                                            {poolstore.pool_type === PoolType.FAIRLAUNCH && <Tooltip className="flex mx-[12px] mb-[6px] cursor-pointer z-50" title="Leave it '0' if you dont want to set maximum buy">
                                                <InfoOutlined className="!text-[18px]" />
                                            </Tooltip>}
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    placeholder="0"
                                                    fullWidth
                                                    value={poolstore.buy_max}
                                                    onChange={(e) => PoolStore.setBuyMax(e.target.value)}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {poolstore.pool_type !== PoolType.FAIRLAUNCH && <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Listing rate
                                            </div>
                                            <Tooltip className="flex mx-[12px] mb-[6px] cursor-pointer z-50" title="After listing, If I buy 1 ETH how many tokens will I receive?">
                                                <InfoOutlined className="!text-[18px]" />
                                            </Tooltip>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    placeholder="0"
                                                    fullWidth
                                                    value={poolstore.list_rate}
                                                    onChange={(e) => PoolStore.setListRate(e.target.value)}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                                <div className={poolstore.pool_type !== PoolType.FAIRLAUNCH ? "" : "col-span-2"}>
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Liquidity percent
                                            </div>
                                            <Tooltip className="flex mx-[2px] mb-[6px] cursor-pointer z-50" title="Percentage of fund raised uses for liquidity. Min 51%">
                                                <InfoOutlined className="!text-[18px]" />
                                            </Tooltip>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type="number"
                                                    value={poolstore.liquidity_percent}
                                                    onChange={(e) => PoolStore.setLiquidityPercent(Number(e.target.value))}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                    inputProps={{
                                                        min: 51,
                                                        max: 100,
                                                        step: 1
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {poolstore.pool_type !== PoolType.FAIRLAUNCH && <div>
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Unsold token
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <FormControl >
                                                    <Select className="!text-[22px]" value={poolstore.isBurnRefund} onChange={(e, value) => {
                                                        PoolStore.setBurnRefund(value === "true")
                                                    }}>
                                                        <MenuItem value={"true"}>Burn</MenuItem>
                                                        <MenuItem value={"false"}>Refund</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                                <div className={poolstore.pool_type !== PoolType.FAIRLAUNCH ? "col-span-4" : "col-span-2"}>
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Liquidity Lock days
                                            </div>
                                            <Tooltip className="flex mx-[2px] mb-[6px] cursor-pointer z-50" title="After launch, how long do you want to lock LP?">
                                                <InfoOutlined className="!text-[18px]" />
                                            </Tooltip>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    required
                                                    fullWidth
                                                    type="number"
                                                    value={poolstore.liquidity_lock}
                                                    onChange={(e) => PoolStore.setLiquidityLock(Number(e.target.value))}
                                                    InputProps={{
                                                        className: "!text-[22px]"
                                                    }}
                                                    inputProps={{
                                                        min: 0,
                                                        step: 1
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px]">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Start Date (Local time)
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full px-5 pt-7 pb-5">
                                                <DatePicker
                                                    locale="enUS"
                                                    showYearDropdown
                                                    showMonthDropdown
                                                    showTimeInput
                                                    timeFormat="HH:mm:ss"
                                                    dateFormat="MM-d-yyyy HH:mm:ss"
                                                    placeholderText="MM-d-yyyy HH:mm"
                                                    customInput={<TextField fullWidth autoComplete='off' />}
                                                    selected={new Date(poolstore.pool_start * 1000)}
                                                    onChange={(date: Date) => {
                                                        PoolStore.setPoolStart(Number(date.getTime() / 1000))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px]">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                End Date (Local time)
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full px-5 pt-7 pb-5">
                                                <DatePicker
                                                    locale="enUS"
                                                    showYearDropdown
                                                    showMonthDropdown
                                                    showTimeInput
                                                    timeFormat="HH:mm:ss"
                                                    dateFormat="MM-d-yyyy HH:mm:ss"
                                                    placeholderText="MM-d-yyyy HH:mm"
                                                    customInput={<TextField fullWidth autoComplete='off' />}
                                                    selected={new Date(poolstore.pool_end * 1000)}
                                                    onChange={(date: Date) => {
                                                        PoolStore.setPoolEnd(Number(date.getTime() / 1000))
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    You need total: {formatNumber(formatEther(tokenneed))} {assetValue?.symbol} to create this pool
                                </div>
                                <div className="col-span-4 flex w-full mt-[10px] gap-2">
                                    <Button
                                        onClick={() => setStep(1)}
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                        disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                    >
                                        <Typography className="!font-bold">
                                            {
                                                loading ? `Processing` : `Back`
                                            }
                                        </Typography>
                                        {(loading) && <CircularProgress size={10} />}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                        disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                    >
                                        <Typography className="!font-bold">
                                            {
                                                loading ? `Processing` : `Next`
                                            }
                                        </Typography>
                                        {(loading) && <CircularProgress size={10} />}
                                    </Button>
                                </div>
                            </div>
                        }

                        {
                            step === 3 && <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Logo url
                                            </div>
                                            <Tooltip className="flex mx-[2px] mb-[6px] cursor-pointer z-50" title="URL must end with a supported image extension png, jpg, jpeg or gif">
                                                <InfoOutlined className="!text-[18px]" />
                                            </Tooltip>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    required
                                                    value={metadata.logo}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        logo: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Website url
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    required
                                                    value={metadata.website}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        website: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Twitter
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.twitter}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        twitter: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Telegram
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.telegram}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        telegram: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Discord
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.discord}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        discord: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Github
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.github}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        github: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Document
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.document}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        document: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Youtube video
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    value={metadata.youtube}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        youtube: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <div className="mt-[2px] mb-[2px] relative">
                                        <div className="w-full flex items-center justify-start absolute top-[4px] truncate">
                                            <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                                Description
                                            </div>
                                        </div>
                                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                            <div className="flex-1 h-full p-4">
                                                <TextField
                                                    fullWidth
                                                    type={"url"}
                                                    multiline
                                                    minRows={6}
                                                    maxRows={8}
                                                    value={metadata.description}
                                                    onChange={(e) => setMetadata(old => ({
                                                        ...old,
                                                        description: e.target.value
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-4 flex w-full mt-[10px] gap-2">
                                    <Button
                                        onClick={() => setStep(2)}
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                        disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                    >
                                        <Typography className="!font-bold">
                                            {
                                                loading ? `Processing` : `Back`
                                            }
                                        </Typography>
                                        {(loading) && <CircularProgress size={10} />}
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        size="large"
                                        color="primary"
                                        className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                        disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                    >
                                        <Typography className="!font-bold">
                                            {
                                                loading ? `Processing` : `Next`
                                            }
                                        </Typography>
                                        {(loading) && <CircularProgress size={10} />}
                                    </Button>
                                </div>
                            </div>
                        }

                        {step === 4 && <div>
                            <TableContainer className="overflow-auto max-h-[500px]">
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Info</TableCell>
                                            <TableCell align="right">detail</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Token name</TableCell>
                                            <TableCell align="right">{assetValue?.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total symbol</TableCell>
                                            <TableCell align="right">{assetValue?.symbol}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Sale method</TableCell>
                                            <TableCell align="right">{poolstore.pool_type === PoolType.FAIRLAUNCH ? "Fair launch" : poolstore.pool_type === PoolType.PUBLIC ? "Public" : "Whitelist"}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Total token for pool</TableCell>
                                            <TableCell align="right">{formatNumber(formatEther(tokenneed))} {assetValue?.symbol}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>{poolstore.pool_type === PoolType.FAIRLAUNCH ? "Token for sale" : "Buy rate"}</TableCell>
                                            <TableCell align="right">{formatNumber(poolstore.buy_rate)} {assetValue?.symbol}</TableCell>
                                        </TableRow>
                                        {
                                            poolstore.pool_type !== PoolType.FAIRLAUNCH && <TableRow>
                                                <TableCell>Listing rate</TableCell>
                                                <TableCell align="right">{formatNumber(poolstore.list_rate)} {assetValue?.symbol}</TableCell>
                                            </TableRow>
                                        }
                                        <TableRow>
                                            <TableCell>Softcap</TableCell>
                                            <TableCell align="right">{formatNumber(poolstore.softcap)} {nativeToken.symbol}</TableCell>
                                        </TableRow>
                                        {
                                            poolstore.pool_type !== PoolType.FAIRLAUNCH && <TableRow>
                                                <TableCell>Hardcap</TableCell>
                                                <TableCell align="right">{formatNumber(poolstore.hardcap)} {nativeToken.symbol}</TableCell>
                                            </TableRow>
                                        }
                                        {
                                            poolstore.pool_type !== PoolType.FAIRLAUNCH && <TableRow>
                                                <TableCell>Unsold tokens</TableCell>
                                                <TableCell align="right">{poolstore.isBurnRefund ? "Burn" : "Refund"}</TableCell>
                                            </TableRow>
                                        }
                                        {
                                            poolstore.pool_type !== PoolType.FAIRLAUNCH && <TableRow>
                                                <TableCell>Minumum buy</TableCell>
                                                <TableCell align="right">{formatNumber(poolstore.buy_min)} {nativeToken.symbol}</TableCell>
                                            </TableRow>
                                        }
                                        {
                                            parseEther(poolstore.buy_max as Ether) > 0n && <TableRow>
                                                <TableCell>Maximum buy</TableCell>
                                                <TableCell align="right">{formatNumber(poolstore.buy_max)} {nativeToken.symbol}</TableCell>
                                            </TableRow>
                                        }
                                        <TableRow>
                                            <TableCell>Liquidity</TableCell>
                                            <TableCell align="right">{poolstore.liquidity_percent}%</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Liquidity lock</TableCell>
                                            <TableCell align="right">{poolstore.liquidity_lock} day(s)</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Start time (UTC)</TableCell>
                                            <TableCell align="right">{new Date(poolstore.pool_start * 1000).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>End time (UTC)</TableCell>
                                            <TableCell align="right">{new Date(poolstore.pool_end * 1000).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                                        </TableRow>
                                        {
                                            (Object.keys(metadata)).map((key) => <TableRow key={key} hover tabIndex={-1}>
                                                <TableCell className="capitalize">{key}</TableCell>
                                                <TableCell align="right">{
                                                    isValidHttpUrl(metadata[key as KeyMetadata]) ? <Link to={metadata[key as KeyMetadata]} target="_blank">{metadata[key as KeyMetadata]}</Link>
                                                        : metadata[key as KeyMetadata]
                                                }</TableCell>
                                            </TableRow>)
                                        }
                                        <TableRow>
                                            <TableCell></TableCell>
                                            <TableCell align="right"></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <div className="flex flex-col gap-2 w-full mt-[10px]">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                    disabled={!(assetValue) || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                >
                                    <Typography className="!font-bold">
                                        {
                                            loading ? `Creating` : `Create`
                                        }
                                    </Typography>
                                    {(loading) && <CircularProgress size={10} />}
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                    disabled={!assetValue || loading || !(account.isConnected && account.address) || network.chain?.unsupported}
                                >
                                    <Typography className="!font-bold">
                                        Back
                                    </Typography>
                                </Button>
                            </div>
                        </div>}
                    </form>
                </Paper>
            </div >
        </div >
    )
}