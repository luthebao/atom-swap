import { Button, FormControlLabel, FormGroup, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@material-ui/core";
import { useState } from "react";
import { Address, ContractFunctionExecutionError, TransactionExecutionError, formatUnits, isAddress, isAddressEqual } from "viem";
import { useSnapshot } from "valtio";
import GlobalStore, { TXHstatus } from "../../store/gobalStore";
import { useAccount, useBalance, useContractRead, useNetwork, useToken } from "wagmi";
import { ABI_LOCKER } from "../../configs/abi";
import { LOCKER_ADDRESS } from "../../configs/addresses";
import { Link, useParams } from "react-router-dom";
import { formatNumber } from "../../configs/utils";
import Countdown from 'react-countdown'
import { wagmiCore } from "../../configs/connectors";
import { Hash } from "@wagmi/core";
import { toast } from "react-toastify";

interface Data {
    id: bigint;
    token: Address
    owner: Address
    amount: bigint;
    lockDate: bigint;
    tgeDate: bigint;
    tgeBps: bigint;
    cycle: bigint;
    cycleBps: bigint;
    unlockedAmount: bigint;
    description: string;
}

function LockRecordInfo() {
    const { recordid } = useParams()
    const check = recordid && !isNaN(Number(recordid))

    if (!check) {
        return null
    }
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }
    const globalstate = useSnapshot(GlobalStore.state)
    const account = useAccount()
    const network = useNetwork()

    const lockinfo = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: "getLockById",
        args: [
            BigInt(recordid)
        ],
        watch: true,
    })

    const tokeninfo = useToken({
        address: lockinfo.data?.token
    })

    const canwithdraw = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: "withdrawableTokens",
        args: [BigInt(recordid)],
        watch: true
    })
    const [loading, setLoading] = useState<boolean>(false)

    if (lockinfo.data && tokeninfo.data) {
        const listA = lockinfo.data.cycleBps > 0n ? new Array(Math.ceil((100 - Number(lockinfo.data.tgeBps) / 100) / (Number(lockinfo.data.cycleBps) / 100))).fill(0) : []

        const data: {
            index: number,
            date: number,
            amount: string
        }[] = [
                {
                    index: 1,
                    date: Number(lockinfo.data.tgeDate) * 1000,
                    amount: formatUnits(lockinfo.data.tgeBps > 0n ? lockinfo.data.amount * (lockinfo.data.tgeBps / 100n) / 100n : lockinfo.data.amount, tokeninfo.data.decimals),
                },
                ...listA.map((value, index) => {
                    return {
                        index: index + 2,
                        date: lockinfo.data ? (Number(lockinfo.data.tgeDate) + (index + 1) * Number(lockinfo.data.cycle)) * 1000 : 0,
                        amount: lockinfo.data ? formatUnits(
                            lockinfo.data.amount
                            *
                            ((lockinfo.data.cycleBps / 100n) <= (100n - (lockinfo.data.tgeBps / 100n) - (lockinfo.data.cycleBps / 100n) * BigInt(index))
                                ? (lockinfo.data.cycleBps / 100n)
                                : (100n - (lockinfo.data.tgeBps / 100n) - (lockinfo.data.cycleBps / 100n) * BigInt(index))) / 100n
                            , tokeninfo.data?.decimals || 18
                        ) : "0"
                    }
                })
            ]
        const totalClaimed = formatUnits(lockinfo.data.unlockedAmount, tokeninfo.data.decimals)
        const totalLocked = formatUnits(lockinfo.data.amount, tokeninfo.data.decimals)
        const nextClaim = data.find(val => val.date > Date.now())
        const canclaim = canwithdraw.data && account.address && isAddressEqual(account.address, lockinfo.data.owner) && !network.chain?.unsupported && canwithdraw.data > 0n

        const onClaim = async () => {
            setLoading(true)
            if (canclaim) {
                GlobalStore.setTxQueue([
                    {
                        id: 2,
                        name: `Unlock tokens`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                ])
                try {
                    GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                    let hash: Hash
                    const action = await wagmiCore.writeContract({
                        abi: ABI_LOCKER,
                        address: LOCKER_ADDRESS[globalstate.currentChain.id],
                        functionName: "unlock",
                        args: [
                            BigInt(recordid)
                        ]
                    })
                    hash = action.hash
                    GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                    const wait2 = await wagmiCore.waitForTransaction({
                        confirmations: globalstate.confirmations,
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
            setLoading(false)
        }

        return (
            <div className="w-full flex flex-col justify-center relative px-1 lg:px-28">
                <Paper className="border-[1px] border-solid border-[#7e99b033] w-full flex flex-col mb-2">
                    <div className="m-5 mb-4">
                        <Typography variant="h3">Lock Info</Typography>
                    </div>
                    <TableContainer className="h-[calc(100%-100px)]">
                        <Table>
                            {
                                tokeninfo.data && <TableBody>
                                    <TableRow hover>
                                        <TableCell>Token address</TableCell>
                                        <TableCell align="right" className="truncate">{lockinfo.data.token}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell>Token name</TableCell>
                                        <TableCell align="right" className="truncate">{tokeninfo.data.name}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell>Token symbol</TableCell>
                                        <TableCell align="right" className="truncate">{tokeninfo.data.symbol}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell>Token decimals</TableCell>
                                        <TableCell align="right" className="truncate">{tokeninfo.data.decimals}</TableCell>
                                    </TableRow>
                                    <TableRow hover>
                                        <TableCell>Claimed / locked amount</TableCell>
                                        <TableCell align="right" className="truncate">{formatNumber(totalClaimed)} / {formatNumber(totalLocked)} {tokeninfo.data.symbol}</TableCell>
                                    </TableRow>
                                    {
                                        nextClaim && < TableRow hover>
                                            <TableCell>Next claim</TableCell>
                                            <TableCell align="right" className="truncate">
                                                <Countdown key={nextClaim.date} date={new Date(nextClaim.date)} />
                                            </TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            }
                        </Table>
                    </TableContainer>
                </Paper>
                <Paper className="border-[1px] border-solid border-[#7e99b033] w-full flex flex-col p-2">
                    <div className="m-5 mb-4 flex items-center justify-between">
                        <Typography variant="h3">Lock Records</Typography>
                        {account.address && isAddressEqual(account.address, lockinfo.data.owner) && <Button onClick={onClaim} variant="contained" className="!px-5" disabled={!canclaim && loading}>Claim</Button>}
                    </div>
                    <TableContainer className="h-[calc(100%-100px)]">
                        <Table stickyHeader>
                            <TableHead className="[border-bottom:1px_solid_#7e99b026!important] [@media(max-width:1000px)]:hidden">
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell align="center">Unlock Date (UTC)</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((val) => {
                                            return (
                                                <TableRow hover key={val.index}>
                                                    <TableCell>{val.index}</TableCell>
                                                    <TableCell align="center">
                                                        {new Date(val.date).toLocaleString("en-US", { timeZone: "UTC" })}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {formatNumber(val.amount)} {tokeninfo.data?.symbol}
                                                    </TableCell>
                                                </TableRow>)
                                        })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10]}
                        component="div"
                        count={data.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div >
        )
    }
    return null
}

export default LockRecordInfo
