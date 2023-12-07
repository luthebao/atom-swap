import { FormControlLabel, FormGroup, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from "@material-ui/core";
import { useState } from "react";
import { Address, formatUnits, isAddress, isAddressEqual } from "viem";
import { useSnapshot } from "valtio";
import GlobalStore from "../../store/gobalStore";
import { useAccount, useBalance, useContractRead, useToken } from "wagmi";
import { ABI_LOCKER } from "../../configs/abi";
import { LOCKER_ADDRESS } from "../../configs/addresses";
import { Link, useParams } from "react-router-dom";
import { formatNumber } from "../../configs/utils";

interface Data {
    id: bigint;
    token: `0x${string}`;
    owner: `0x${string}`;
    amount: bigint;
    lockDate: bigint;
    tgeDate: bigint;
    tgeBps: bigint;
    cycle: bigint;
    cycleBps: bigint;
    unlockedAmount: bigint;
    description: string;
}

function LockInfo() {
    const { tokenaddress } = useParams()
    const check = tokenaddress && isAddress(tokenaddress)

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

    const tokeninfo = useToken({
        address: tokenaddress
    })

    const [mylock, setMyLock] = useState<boolean>(false)
    const globalstate = useSnapshot(GlobalStore.state)

    const account = useAccount()

    const lockCount = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: "totalLockCountForToken",
        args: [tokenaddress]
    })

    const alllock = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: "getLocksForToken",
        args: [
            tokenaddress,
            0n,
            lockCount.data || 0n
        ]
    })

    const lockAmount = useBalance({
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        token: tokenaddress
    })

    const data = (alllock.data as Data[] || []).filter(x => mylock && account.address ? isAddressEqual(x.owner, account.address) : true)

    return (
        <div className="w-full flex flex-col justify-center relative px-1 lg:px-28">
            <Paper className="border-[1px] border-solid border-[#7e99b033] w-full flex flex-col mb-2">
                <div className="m-5 mb-4">
                    <Typography variant="h3">Token Info</Typography>
                </div>
                <TableContainer className="h-[calc(100%-100px)]">
                    <Table>
                        {tokeninfo.data && <TableBody>
                            <TableRow hover>
                                <TableCell>Token address</TableCell>
                                <TableCell align="right" className="truncate">{tokenaddress}</TableCell>
                            </TableRow>
                            <TableRow hover>
                                <TableCell>Total locked amount</TableCell>
                                <TableCell align="right" className="truncate">{(formatUnits(lockAmount.data?.value || 0n, lockAmount.data?.decimals || 18)).toLocaleString()} {tokeninfo.data.symbol}</TableCell>
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
                        </TableBody>}
                    </Table>
                </TableContainer>
            </Paper>
            <Paper className="border-[1px] border-solid border-[#7e99b033] w-full flex flex-col p-2">
                <div className="m-5 mb-4 flex items-center justify-between">
                    <Typography variant="h3">Lock Records</Typography>
                    <FormGroup>
                        <FormControlLabel control={<Switch checked={mylock} onChange={(e, checked) => setMyLock(checked)} />} label="My lock" />
                    </FormGroup>
                </div>
                <TableContainer className="h-[calc(100%-100px)]">
                    <Table stickyHeader>
                        <TableHead className="[border-bottom:1px_solid_#7e99b026!important] [@media(max-width:1000px)]:hidden">
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell align="right">Admount</TableCell>
                                <TableCell align="right">Cycle(d)</TableCell>
                                <TableCell align="right">Cycle Release(%)</TableCell>
                                <TableCell align="right">TGE(%)</TableCell>
                                <TableCell align="right">Unlock time (local)</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((val) => {
                                        return (
                                            <TableRow hover key={val.id.toString()}>
                                                <TableCell>{val.id.toLocaleString()}</TableCell>
                                                <TableCell>{val.owner}</TableCell>
                                                <TableCell align="right">{formatNumber(formatUnits(val.amount, tokeninfo.data?.decimals || 18)).toLocaleString()}</TableCell>
                                                <TableCell align="right">{(val.cycle / 86400n).toLocaleString()}</TableCell>
                                                <TableCell align="right">{(val.cycleBps / 100n).toLocaleString()}%</TableCell>
                                                <TableCell align="right">{(val.tgeBps / 100n).toLocaleString()}%</TableCell>
                                                <TableCell align="right">{new Date(Number(val.tgeDate * 1000n)).toLocaleString()}</TableCell>
                                                <TableCell align="right">
                                                    <Link to={`/locker/record/${val.id.toString()}`}>
                                                        View
                                                    </Link>
                                                </TableCell>
                                            </TableRow>)
                                    })
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div >
    );
}

export default LockInfo;
