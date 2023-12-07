import { Avatar, Button, Card, CardHeader, FormControlLabel, FormGroup, InputAdornment, Paper, Switch, Table, TableBody, TableCell, TablePagination, TableRow, TextField } from "@material-ui/core";
import { useCallback, useEffect, useState } from "react";
import SearchIcon from '@material-ui/icons/Search';
import { Address, formatEther, formatUnits, isAddress, isAddressEqual, zeroAddress } from "viem";
import { useSnapshot } from "valtio";
import GlobalStore from "../../store/gobalStore";
import { useAccount, useContractRead, useToken } from "wagmi";
import { ABI_LAUNCH_POOL, ABI_LAUNCH_STORAGE } from "../../configs/abi";
import { STORAGE_ADDRESS } from "../../configs/addresses";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { BsDot } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";
import { formatNumber, uriToHttp } from "../../configs/utils";

interface Data {
    owner: Address
    show: boolean
    launch: Address
    sale_token: Address
    buy_rate: bigint
    list_rate: bigint
    buy_min: bigint
    buy_max: bigint
    softcap: bigint
    hardcap: bigint
    liquidity_percent: bigint
    liquidity_lock: bigint
    pool_type: bigint
    presale_start: bigint
    presale_end: bigint
    metadata: string
}

interface Meta {
    "name": string
    "description": string
    "properties": {
        "logo": string
        "website": string
        "twitter": string
        "telegram": string
        "github": string
        "discord": string
        "document": string
        "youtube": string
        "description": string
    },
    "image": string
}

function LaunchCard({ data }: {
    data: Data
}) {
    const globalstore = useSnapshot(GlobalStore.state)
    const tokeninfo = useToken({
        address: data.sale_token,
    })
    const [meta, setMeta] = useState<Meta | null>(null)
    const nativeToken = globalstore.currentChain.nativeCurrency

    const poolStatus = Number(useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: data.launch,
        functionName: "presaleStatus",
        watch: true
    }).data || 0n)

    const getMeta = useCallback(async (ipfs: string) => {
        try {
            const getm: Meta = await (await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfs}/metadata.json`)).json()
            setMeta(getm)
        } catch (error) {
            setMeta(null)
        }
    }, [data])

    useEffect(() => {
        getMeta(data.metadata)
    }, [data])

    return (
        <Card elevation={5} component={Paper} className="border-[1px] border-solid border-[#7e99b033] flex flex-col px-2 py-4">
            <div className="flex items-center px-4">
                <div className="flex-1 flex flex-col px-3">
                    <div className="text-xl text-color-text-title font-bold">
                        {
                            Number(data.pool_type) === 2 ? "Fair Launch" : "Presale"
                            // Number(data.pool_type) === 1 ? "Whitelist sale" : "Public sale"
                        }
                    </div>
                    <div className="text-sm text-color-text-subtitle">{tokeninfo.data?.name} - {tokeninfo.data?.symbol}</div>
                </div>
                <div className="flex-1 flex justify-end">
                    <img src={uriToHttp(meta?.image)[0]} alt="" className="bg-color-component-img rounded-full w-20 h-20 shadow-xl ring-2 ring-color-component-ring" />
                </div>
            </div>
            <div className="flex flex-col gap-4 items-center justify-center px-4 py-8">
                <div className="bg-color-component-input w-full rounded-xl">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Softcap</TableCell>
                                <TableCell align="right">{formatNumber(formatEther(data.softcap))} {nativeToken.symbol}</TableCell>
                            </TableRow>
                            {
                                Number(data.pool_type) !== 2 && <TableRow>
                                    <TableCell>Hardcap</TableCell>
                                    <TableCell align="right">{formatNumber(formatEther(data.hardcap))} {nativeToken.symbol}</TableCell>
                                </TableRow>
                            }
                            <TableRow>
                                <TableCell>Liquidity</TableCell>
                                <TableCell align="right">{Number(data.liquidity_percent)}%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Liquidity lock</TableCell>
                                <TableCell align="right">{Number(data.liquidity_lock)} day(s)</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-color-component-input w-full rounded-xl">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className="truncate">Start time</TableCell>
                                <TableCell align="right" className="">{new Date(Number(data.presale_start) * 1000).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="truncate">End time</TableCell>
                                <TableCell align="right" className="">{new Date(Number(data.presale_end) * 1000).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex items-end h-full px-4">
                <div className="flex w-full h-fit items-center justify-center">
                    <div className="flex-1 flex">
                        {
                            poolStatus === 0 ? <div className="text-center text-color-text-title bg-color-component-input rounded-xl p-2">Incoming</div> :
                                poolStatus === 1 ? <div className="text-center text-color-text-title font-bold bg-color-component-input rounded-xl p-2 flex items-center">
                                    <RxDotFilled className=" text-green-600" /> Sale live
                                </div> :
                                    poolStatus === 2 ? <div className="text-center text-color-text-title bg-color-component-input rounded-xl p-2">Sale ended</div> :
                                        <div className="text-start text-color-text-title bg-color-component-input rounded-xl p-2">Sale ended</div>
                        }
                    </div>
                    <div className="flex-1 flex justify-end">
                        <Link to={`/launchpad/${data.launch}`}>
                            <Button variant="contained" className="shadow-lg">VIEW</Button>
                        </Link>
                    </div>
                </div>


            </div>
        </Card>
    )
}

function Launchpad() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage)
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value)
        setPage(0)
    }

    const [search, setSearch] = useState<Address | undefined>()
    const [mypool, setMyPool] = useState<boolean>(false)
    const globalstate = useSnapshot(GlobalStore.state)

    const account = useAccount()

    const pools: Data[] = (useContractRead({
        abi: ABI_LAUNCH_STORAGE,
        address: STORAGE_ADDRESS[globalstate.currentChain.id],
        functionName: "getAllLaunchpads"
    }).data as Data[] || []).sort((a, b) => Number(b.presale_start) - Number(a.presale_start))
        .filter((x) => {
            if (isAddress(search as Address)) {
                return isAddressEqual(x.sale_token, search as Address)
            } else {
                return true
            }
        })
        .filter((x) => mypool && account.address ? isAddressEqual(x.owner, account.address) : x.show)



    return (
        <div className="w-full flex flex-col justify-center relative px-1 lg:px-28">
            <div className="gap-2 mb-10 flex flex-wrap mt-4">
                <div className="flex-1 md:flex-none order-2 md:order-1">
                    <Link to={"/launchpad/create"}>
                        <Button variant="outlined" className="h-full !bg-color-component-container !text-color-text-btn">
                            <BsFillRocketTakeoffFill className="mr-1" /> <span className="block">Create Pool</span>
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
                <div className="flex-1 md:flex-none order-3">
                    <FormGroup className="flex justify-center items-center h-full rounded-xl bg-color-component-container pl-3">
                        <FormControlLabel control={<Switch checked={mypool} onChange={(e, checked) => setMyPool(checked)} />} label="My pool" />
                    </FormGroup>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {
                        pools
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((val, index) => (
                                <LaunchCard data={val} key={`launchpadcard-${index}`} />
                            ))
                    }
                </div>
                <div className="flex justify-end">
                    <TablePagination
                        rowsPerPageOptions={[15, 30, 100]}
                        component={Paper}
                        elevation={5}
                        count={pools.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </div>

            </div>
        </div>
    );
}

export default Launchpad;
