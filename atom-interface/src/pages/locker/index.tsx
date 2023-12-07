import { Button, FormControlLabel, FormGroup, InputAdornment, Paper, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField } from "@material-ui/core";
import { useState } from "react";
import SearchIcon from '@material-ui/icons/Search';
import { Address, formatUnits, isAddress, isAddressEqual, zeroAddress } from "viem";
import { useSnapshot } from "valtio";
import GlobalStore from "../../store/gobalStore";
import { useAccount, useContractRead, useToken } from "wagmi";
import { ABI_LOCKER } from "../../configs/abi";
import { LOCKER_ADDRESS } from "../../configs/addresses";
import { GiPadlock } from "react-icons/gi";
import { Link } from "react-router-dom";

interface Data {
    token: Address;
    factory: Address;
    amount: bigint;
}

function ParseToken({
    address
}: {
    address: Address
}) {
    const token = useToken({
        address: address
    })
    if (token && token.data)
        return (
            <div className="flex flex-col">
                <span>{token.data.name}</span>
                <span>{token.data.symbol}</span>
            </div>
        )
    else {
        return (
            <div>Token not found</div>
        )
    }
}

function ParseAmount({
    address, amount
}: {
    address: Address
    amount: bigint
}) {
    const token = useToken({
        address: address
    })
    if (token && token.data)
        return (
            <div>{(formatUnits(amount, token.data.decimals)).toLocaleString()} {token.data.symbol}</div>
        )
    else {
        return (
            <div>Invalid Amount</div>
        )
    }
}

function Locker() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const [search, setSearch] = useState<Address | undefined>()
    const [mylock, setMyLock] = useState<boolean>(false)
    const [lplock, setLpLock] = useState<boolean>(false)
    const globalstate = useSnapshot(GlobalStore.state)

    const account = useAccount()

    const lockCount = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: lplock ? "allLpTokenLockedCount" : "allNormalTokenLockedCount",
        watch: true
    })

    const alllock = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: lplock ? "getCumulativeLpTokenLockInfo" : "getCumulativeNormalTokenLockInfo",
        args: [
            0n,
            lockCount.data || 0n
        ],
        watch: true
    })

    const userlock = useContractRead({
        abi: ABI_LOCKER,
        address: LOCKER_ADDRESS[globalstate.currentChain.id],
        functionName: lplock ? "lpLocksForUser" : "normalLocksForUser",
        args: [account.address || zeroAddress],
        watch: true
    })

    const usertoken: Address[] = userlock.data ? userlock.data.map(val => val.token) : []

    const convertdata = (alllock.data as Data[] || []).filter(x => mylock ? usertoken.includes(x.token) : true)

    const data = [...convertdata].reverse()

    return (
        <div className="w-full flex flex-col justify-center relative px-1 lg:px-28">
            <div className="gap-2 mb-2 flex flex-wrap mt-4">
                <div className="flex-1 md:flex-none order-2 md:order-1">
                    <Link to={"/locker/create"}>
                        <Button variant="contained" className="h-full !bg-color-component-container !text-color-text-btn">
                            <GiPadlock className="mr-1" /> <span className="block">Lock</span>
                        </Button>
                    </Link>
                </div>
                <div className="order-1 md:order-2 w-full md:w-auto md:grow rounded-xl bg-color-component-container">
                    <TextField
                        className="w-full !h-full"
                        variant="outlined"
                        fullWidth
                        placeholder="Search by token address 0x..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value as Address)}
                        error={search && !isAddress(search)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <div className="flex-1 md:flex-none order-3 rounded-xl bg-color-component-container pl-3">
                    <FormGroup className="flex justify-center items-center h-full">
                        <FormControlLabel control={<Switch checked={mylock} onChange={(e, checked) => setMyLock(checked)} />} label="My lock" />
                    </FormGroup>
                </div>
                <div className="flex-1 md:flex-none order-4 rounded-xl bg-color-component-container pl-3">
                    <FormGroup className="flex justify-center items-center h-full">
                        <FormControlLabel control={<Switch checked={lplock} onChange={(e, checked) => setLpLock(checked)} />} label="LP Token" />
                    </FormGroup>
                </div>
            </div>
            <Paper className="border-[1px] border-solid border-[#7e99b033] w-full flex flex-col items-end p-2">
                <TableContainer className="h-[calc(100%-100px)]">
                    <Table stickyHeader>
                        <TableHead className="[border-bottom:1px_solid_#7e99b026!important] [@media(max-width:1000px)]:hidden">
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Token</TableCell>
                                <TableCell>Address</TableCell>
                                <TableCell>Locked</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                data.filter((x) => {
                                    if (isAddress(search as Address)) {
                                        return isAddressEqual(x.token, search as Address)
                                    } else {
                                        return true
                                    }
                                })
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.token}>
                                                <TableCell>#{index + 1}</TableCell>
                                                <TableCell>
                                                    <ParseToken address={row.token} />
                                                </TableCell>
                                                <TableCell className="truncate">
                                                    {row.token}
                                                </TableCell>
                                                <TableCell>
                                                    <ParseAmount address={row.token} amount={row.amount} />
                                                </TableCell>
                                                <TableCell>
                                                    <Link to={`/locker/${row.token}`}>View</Link>
                                                </TableCell>
                                            </TableRow>
                                        );
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
        </div>
    );
}

export default Locker;
