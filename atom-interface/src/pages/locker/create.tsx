import { Button, Checkbox, CircularProgress, FormControlLabel, FormGroup, Paper, TextField, Typography } from "@material-ui/core";
import CurrencyInput from "../../components/CoreComponents/CurrencyInput";
import GlobalStore, { CurrencyInputType, Ether, SwapInputType, TXHstatus, Token } from "../../store/gobalStore";
import { useState } from "react";
import { MAX_UINT256, formatInputNumber } from "../../configs/utils";
import { Address, erc20ABI, useAccount, useNetwork } from "wagmi";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { ContractFunctionExecutionError, TransactionExecutionError, isAddress, parseEther, parseUnits } from "viem";
import { wagmiCore } from "../../configs/connectors";
import { useSnapshot } from "valtio";
import { LOCKER_ADDRESS } from "../../configs/addresses";
import { Hash } from "@wagmi/core";
import { ABI_LOCKER } from "../../configs/abi";


export default function LockerCreator() {
    const account = useAccount()
    const network = useNetwork()
    const globalstore = useSnapshot(GlobalStore.state)
    const [loading, setLoading] = useState<boolean>(false)
    const [assetValue, setAssetValue] = useState<Token | null>(null)
    const [amountValue, setAmountValue] = useState("")

    const [isLp, setIsLp] = useState<boolean>(false)
    const [otherOwner, setOtherOwner] = useState<boolean>(false)
    const [useVesting, setUseVesting] = useState<boolean>(false)

    const [title, setTitle] = useState<string>("")
    const [owner, setOwner] = useState<Address>(account.address as Address)
    const [tgeP, setTgeP] = useState<number>(0)
    const [cycle, setCycle] = useState<number>(0)
    const [cycleP, setCycleP] = useState<number>(0)

    const [unlockDate, setUnlockDate] = useState<number>(Math.floor(Math.floor((Date.now() / 1000) / 3600 + 2) * 3600))


    const onAssetSelect = (type: CurrencyInputType, value: Token) => {
        setAssetValue(value)
    }

    const amountChanged = (v: string) => {
        const inputValue: string = formatInputNumber(v)
        setAmountValue(inputValue)
    }

    const onLock = async () => {
        setLoading(true)
        if (assetValue && parseEther(amountValue as Ether) > 0n && account.address) {
            GlobalStore.setTxQueue([
                {
                    id: 0,
                    name: `Checking your ${assetValue.symbol} allowance`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 2,
                    name: `LOCK ${amountValue} ${assetValue.symbol}`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            // 0
            let allowance0: bigint = 0n
            while (true) {
                allowance0 = await wagmiCore.readContract({
                    abi: erc20ABI,
                    address: assetValue.address as Address,
                    functionName: "allowance",
                    args: [account.address, LOCKER_ADDRESS[globalstore.currentChain.id]],
                })
                if (allowance0 < parseUnits(amountValue as `${number}`, assetValue.decimals)) {
                    try {
                        GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                        const approve0 = await wagmiCore.writeContract({
                            abi: erc20ABI,
                            address: assetValue.address as Address,
                            functionName: "approve",
                            args: [
                                LOCKER_ADDRESS[globalstore.currentChain.id] as Address,
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

            // 2
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const lock = await wagmiCore.writeContract({
                    abi: ABI_LOCKER,
                    address: LOCKER_ADDRESS[globalstore.currentChain.id],
                    functionName: useVesting ? "vestingLock" : "lock",
                    args: useVesting ? [
                        otherOwner ? owner as Address : account.address,
                        assetValue.address as Address,
                        isLp,
                        parseUnits(amountValue as `${number}`, assetValue.decimals),
                        BigInt(unlockDate),
                        BigInt(tgeP * 100),
                        BigInt(cycle * 86400),
                        BigInt(cycleP * 100),
                        title
                    ] : [
                        otherOwner ? owner as Address : account.address,
                        assetValue.address as Address,
                        isLp,
                        parseUnits(amountValue as `${number}`, assetValue.decimals),
                        BigInt(unlockDate),
                        title
                    ]
                })
                hash = lock.hash
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
        } else {
            toast("Please input valid values")
        }
        setLoading(false)
    }


    return (
        <div className="w-full flex flex-col justify-center relative mt-[80px]">
            <div className="flex justify-center items-center">
                <Paper elevation={0} className="max-w-[650px] min-h-[400px] w-full p-[12px] flex flex-col">
                    <form className="flex flex-col w-full" onSubmit={(e) => {
                        e.preventDefault();
                        onLock();
                    }}>
                        <div className="flex flex-row justify-center items-center mb-5">
                            <Typography className="!font-bold" variant="h1">
                                Create Lock
                            </Typography>
                        </div>
                        <div className="mt-[2px] mb-[2px] relative">
                            <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                <div className="flex-1 h-full p-4">
                                    <TextField
                                        required
                                        placeholder='Lock title'
                                        fullWidth
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        InputProps={{
                                            className: "!text-[30px]"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <CurrencyInput type={SwapInputType.FROM} assetValue={assetValue} onAssetSelect={onAssetSelect} amountValue={amountValue} amountChanged={amountChanged} />

                        <div className="flex mb-5 px-2">
                            <FormGroup className="flex !flex-row !flex-nowrap w-full justify-between">
                                <FormControlLabel className="!flex-1" control={<Checkbox checked={isLp} onChange={(e, checked) => setIsLp(checked)} />} label="Is this LP Token?" />
                                <FormControlLabel className="!flex-1" control={<Checkbox checked={otherOwner} onChange={(e, checked) => setOtherOwner(checked)} />} label="Use other owner?" />
                                <FormControlLabel className="!flex-1" control={<Checkbox checked={useVesting} onChange={(e, checked) => setUseVesting(checked)} />} label="Use Vesting?" />
                            </FormGroup>
                        </div>

                        {
                            otherOwner && <div className="mt-[2px] mb-[2px] relative">
                                <div className="w-full flex items-center justify-start absolute top-[4px]">
                                    <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                        Other Owner
                                    </div>
                                </div>
                                <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                    <div className="flex-1 h-full px-5 pt-7 pb-5">
                                        <TextField
                                            required={otherOwner}
                                            error={!isAddress(owner)}
                                            placeholder="Owner address"
                                            fullWidth
                                            value={owner}
                                            onChange={(e) => setOwner(e.target.value as Address)}
                                            InputProps={{
                                                className: "!text-[18px]"
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="mt-[2px] mb-[2px] relative">
                            <div className="w-full flex items-center justify-start absolute top-[4px]">
                                <div className="flex pl-[12px] pb-[6px] cursor-pointer">
                                    {useVesting ? "TGE" : "Unlock"} Date (Local time)
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
                                        selected={new Date(unlockDate * 1000)}
                                        onChange={(date: Date) => {
                                            setUnlockDate(Number(date.getTime() / 1000))
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {
                            useVesting && <div className="grid grid-cols-3 gap-1">
                                <div className="mt-[2px] mb-[2px] relative">
                                    <div className="w-full flex items-center justify-start absolute top-[4px]">
                                        <div className="flex pl-[12px] pb-[6px] cursor-pointer truncate">
                                            TGE percent (%)
                                        </div>
                                    </div>
                                    <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                        <div className="flex-1 h-full px-5 pt-7 pb-5">
                                            <TextField
                                                required={useVesting}
                                                placeholder="TGE percent (%)"
                                                fullWidth
                                                type="number"
                                                value={tgeP}
                                                onChange={(e) => setTgeP(Number(e.target.value))}
                                                InputProps={{
                                                    className: "!text-[18px]"
                                                }}
                                                inputProps={{
                                                    min: 0,
                                                    max: 100,
                                                    step: 1
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-[2px] mb-[2px] relative">
                                    <div className="w-full flex items-center justify-start absolute top-[4px]">
                                        <div className="flex pl-[12px] pb-[6px] cursor-pointer truncate">
                                            Release cycle (days)
                                        </div>
                                    </div>
                                    <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                        <div className="flex-1 h-full px-5 pt-7 pb-5">
                                            <TextField
                                                required={useVesting}
                                                placeholder="Input valid day(s)"
                                                fullWidth
                                                type="number"
                                                value={cycle}
                                                onChange={(e) => setCycle(Number(e.target.value))}
                                                InputProps={{
                                                    className: "!text-[18px]"
                                                }}
                                                inputProps={{
                                                    min: 0,
                                                    step: 1
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-[2px] mb-[2px] relative">
                                    <div className="w-full flex items-center justify-start absolute top-[4px]">
                                        <div className="flex pl-[12px] pb-[6px] cursor-pointer truncate">
                                            Release percent (%)
                                        </div>
                                    </div>
                                    <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                        <div className="flex-1 h-full px-5 pt-7 pb-5">
                                            <TextField
                                                required={useVesting}
                                                placeholder="Release percent (%)"
                                                fullWidth
                                                type="number"
                                                value={cycleP}
                                                onChange={(e) => setCycleP(Number(e.target.value))}
                                                InputProps={{
                                                    className: "!text-[18px]"
                                                }}
                                                inputProps={{
                                                    min: 0,
                                                    max: 100,
                                                    step: 1
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        <div className="flex w-full mt-[10px]">
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
                                        loading ? `Locking` : `Lock`
                                    }
                                </Typography>
                                {(loading) && <CircularProgress size={10} />}
                            </Button>
                        </div>
                    </form>
                </Paper>
            </div >
        </div >
    )
}