import { Button, Card, CircularProgress, Dialog, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography } from "@material-ui/core"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Address, ContractFunctionExecutionError, TransactionExecutionError, formatEther, formatUnits, isAddress, parseEther, zeroAddress } from "viem"
import { useAccount, useBalance, useContractEvent, useContractRead, useNetwork, useToken } from "wagmi"
import { ABI_LAUNCH_FACTORY, ABI_LAUNCH_POOL } from "../../configs/abi"
import { useSnapshot } from "valtio"
import GlobalStore, { Ether, TXHstatus } from "../../store/gobalStore"
import { useCallback, useEffect, useState } from "react"
import { formatInputNumber, formatNumber, ipfsClient, uriToHttp } from "../../configs/utils"
import { FaDiscord, FaGithub, FaGlobeAmericas, FaNewspaper, FaTelegram, FaTwitter } from "react-icons/fa";
import { LAUNCHFACTORY_ADDRESS } from "../../configs/addresses"
import { FetchTokenResult, GetAccountResult, GetNetworkResult, Hash, PublicClient } from "@wagmi/core"
import Countdown from "react-countdown"
import { toast } from "react-toastify"
import { wagmiCore } from "../../configs/connectors"
import { MdSwapCalls } from "react-icons/md"
import { InfoOutlined } from "@material-ui/icons"
import { Metadata } from "../../store/poolStore"
import DatePicker from "react-datepicker"

interface Meta {
    "name": string
    "description": string
    "properties": Metadata,
    "image": string
}

interface PoolInfo {
    "buy_rate": bigint
    "list_rate": bigint
    "buy_min": bigint
    "buy_max": bigint
    "softcap": bigint
    "hardcap": bigint
    "isBurnRefund": boolean
    "liquidity_percent": bigint
    "liquidity_lock": bigint
    "pool_start": bigint
    "pool_end": bigint
    "pool_type": number
    "public_time": bigint
    "canceled": boolean
}

interface PoolStatus {
    raised_amount: bigint
    sold_amount: bigint
    token_withdraw: bigint
    base_withdraw: bigint
    num_buyers: bigint
    can_claim: boolean
}

export default function LaunchPool() {

    const { pooladdress } = useParams()
    const check = pooladdress && isAddress(pooladdress)
    if (!check) {
        return null
    }
    const globalstore = useSnapshot(GlobalStore.state)
    const [meta, setMeta] = useState<Meta | null>(null)

    const account = useAccount()
    const network = useNetwork()

    const getPoolInfo = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "launch_info",
        watch: true
    }).data

    const poolInfo: PoolInfo | null = getPoolInfo ? {
        "buy_rate": getPoolInfo[0],
        "list_rate": getPoolInfo[1],
        "buy_min": getPoolInfo[2],
        "buy_max": getPoolInfo[3],
        "softcap": getPoolInfo[4],
        "hardcap": getPoolInfo[5],
        "isBurnRefund": getPoolInfo[6],
        "liquidity_percent": getPoolInfo[7],
        "liquidity_lock": getPoolInfo[8],
        "pool_start": getPoolInfo[9],
        "pool_end": getPoolInfo[10],
        "pool_type": getPoolInfo[11],
        "public_time": getPoolInfo[12],
        "canceled": getPoolInfo[13],
    } : null

    const fundFee = useContractRead({
        abi: ABI_LAUNCH_FACTORY,
        address: LAUNCHFACTORY_ADDRESS[globalstore.currentChain.id],
        functionName: "fundFee",
    }).data || 0n

    const getPoolStatus = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "status",
        watch: true
    }).data

    const poolStatus: PoolStatus | null = getPoolStatus ? {
        "raised_amount": getPoolStatus[0],
        "sold_amount": getPoolStatus[1],
        "token_withdraw": getPoolStatus[2],
        "base_withdraw": getPoolStatus[3],
        "num_buyers": getPoolStatus[4],
        "can_claim": getPoolStatus[5]
    } : null

    const poolState = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "presaleStatus",
        watch: true
    }).data || 0n

    const tokenPool = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "sale_token"
    }).data

    const tokenInfo = useToken({
        address: tokenPool
    }).data

    const metaurl = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "metadata",
        watch: true,
    }).data || ""

    const getMeta = useCallback(async (ipfs: string) => {
        try {
            const getm: Meta = await (await fetch(`https://cloudflare-ipfs.com/ipfs/${ipfs}/metadata.json`)).json()
            setMeta(getm)
        } catch (error) {
            setMeta(null)
        }
    }, [metaurl])

    useEffect(() => {
        if (metaurl.length > 0) {
            getMeta(metaurl)
        }
    }, [metaurl])

    const OWNER = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "OWNER_ROLE"
    }).data

    const MODER = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "MODERATOR_ROLE"
    }).data

    const ADMIN = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "DEFAULT_ADMIN_ROLE"
    }).data

    return (
        <div className="w-full grid grid-cols-3 justify-center px-1 lg:px-20 mt-0 lg:mt-10 gap-4">
            {poolInfo && tokenInfo && meta && <LaunchDetail poolInfo={poolInfo} tokenInfo={tokenInfo} meta={meta} fundFee={fundFee} />}
            {poolInfo && tokenInfo && poolStatus && <LaunchContribute
                pooladdress={pooladdress} poolInfo={poolInfo}
                poolStatus={poolStatus} tokenInfo={tokenInfo}
                poolState={poolState}
                account={account.address}
                isConnect={account.address && account.isConnected && network.chain && !network.chain.unsupported}
            />}
            {
                poolInfo && poolStatus && OWNER && MODER && ADMIN && meta && <LaunchControlPanel
                    poolInfo={poolInfo} poolStatus={poolStatus}
                    poolState={poolState} pooladdress={pooladdress}
                    account={account.address} meta={meta}
                    isConnect={account.address && account.isConnected && network.chain && !network.chain.unsupported}
                    OWNER={OWNER} MODER={MODER} ADMIN={ADMIN}
                />
            }
        </div>
    )
}

function LaunchDetail({
    poolInfo, tokenInfo, meta, fundFee
}: {
    poolInfo: PoolInfo
    tokenInfo: FetchTokenResult
    meta: Meta
    fundFee: bigint
}) {
    const navigate = useNavigate()
    const globalstore = useSnapshot(GlobalStore.state)
    const isWhiteListSale = poolInfo.pool_type === 1 ? true : poolInfo.public_time !== 0n ? Number(poolInfo.public_time) * 1000 > Date.now() : false
    return (
        <Card elevation={5} component={Paper} className="col-span-3 lg:col-span-2 border-[1px] border-solid border-[#7e99b033] flex flex-col px-2 py-4 gap-2">
            <div className="flex items-center px-4">
                <div className="flex-1 flex flex-col px-3">
                    <div className="text-xl text-color-text-title font-bold">
                        {
                            poolInfo && (poolInfo.pool_type === 2 ? "Fair Launch" : isWhiteListSale ? "Presale - Whitelist" : "Presale - Public")
                        }
                    </div>
                    <div className="text-sm text-color-text-subtitle">{tokenInfo?.name} - {tokenInfo?.symbol}</div>
                    <div className="text-[10px] text-color-text-subtitle">
                        {
                            meta.properties.website && meta.properties.website.length > 0 && <Link to={meta.properties.website} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaGlobeAmericas className="text-[18px]" />
                                </IconButton>
                            </Link>
                        }
                        {
                            meta.properties.twitter && meta.properties.twitter.length > 0 && <Link to={meta.properties.twitter} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaTwitter className="text-[18px]" />
                                </IconButton>
                            </Link>
                        }
                        {
                            meta.properties.telegram && meta.properties.telegram.length > 0 && <Link to={meta.properties.telegram} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaTelegram className="text-[18px]" />
                                </IconButton>
                            </Link>
                        }
                        {
                            meta.properties.discord && meta.properties.discord.length > 0 && <Link to={meta.properties.discord} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaDiscord className="text-[18px]" />
                                </IconButton>
                            </Link>
                        }
                        {
                            meta.properties.github && meta.properties.github.length > 0 && <Link to={meta.properties.github} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaGithub />
                                </IconButton>
                            </Link>
                        }
                        {
                            meta.properties.document && meta.properties.document.length > 0 && <Link to={meta.properties.document} target="_blank" rel="noopener noreferrer">
                                <IconButton>
                                    <FaNewspaper className="text-[18px]" />
                                </IconButton>
                            </Link>
                        }
                    </div>
                </div>
                <div className="flex-1 flex justify-end">
                    <img src={uriToHttp(meta?.image)[0]} alt="" className="bg-color-component-img rounded-full w-20 h-20 shadow-xl ring-2 ring-color-component-ring" />
                </div>
            </div>
            <div className="flex items-center px-4">
                <div className="flex-1 flex flex-col p-3 bg-color-component-input w-full rounded-xl">
                    {meta?.description}
                </div>
            </div>
            <div className="flex flex-col items-center justify-center px-4">
                <div className="bg-color-component-input w-full rounded-xl">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Information</TableCell>
                                <TableCell align="right">Detail</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow hover className="cursor-pointer" onClick={() => window.open(`${globalstore.currentChain.blockExplorers?.default.url}/search?f=0&q=${tokenInfo?.address}`, "_blank")}>
                                <TableCell>Token</TableCell>
                                <TableCell align="right">{tokenInfo?.name} - {tokenInfo?.symbol}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Token decimals</TableCell>
                                <TableCell align="right">{tokenInfo?.decimals}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Total supply</TableCell>
                                <TableCell align="right">{formatNumber(tokenInfo?.totalSupply.formatted || "0")} {tokenInfo?.symbol}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Token for sale</TableCell>
                                <TableCell align="right">
                                    {
                                        poolInfo && tokenInfo && (poolInfo.pool_type !== 2 ?
                                            formatNumber(formatUnits(poolInfo.buy_rate * poolInfo.hardcap / parseEther("1"), tokenInfo.decimals)) :
                                            formatNumber(formatUnits(poolInfo.buy_rate, tokenInfo.decimals))
                                        )
                                    } {tokenInfo?.symbol}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Token for liquidity</TableCell>
                                <TableCell align="right">
                                    {
                                        poolInfo && tokenInfo && (poolInfo.pool_type !== 2 ?
                                            formatNumber(formatUnits(poolInfo.buy_rate * poolInfo.hardcap * (100n - fundFee) * poolInfo.liquidity_percent / 100n / 100n / parseEther("1"), tokenInfo.decimals)) :
                                            formatNumber(formatUnits(poolInfo.buy_rate * (100n - fundFee) * poolInfo.liquidity_percent / 100n / 100n, tokenInfo.decimals))
                                        )
                                    } {tokenInfo?.symbol}
                                </TableCell>
                            </TableRow>
                            {
                                poolInfo?.pool_type !== 2 && <TableRow>
                                    <TableCell>Unsold tokens</TableCell>
                                    <TableCell align="right">
                                        {poolInfo?.isBurnRefund ? "Burn" : "Refund"}
                                    </TableCell>
                                </TableRow>
                            }
                            <TableRow>
                                <TableCell>Liquidity</TableCell>
                                <TableCell align="right">{Number(poolInfo?.liquidity_percent)}%</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Liquidity lock</TableCell>
                                <TableCell align="right">{Number(poolInfo?.liquidity_lock)} day(s)</TableCell>
                            </TableRow>
                            <TableRow hover className="cursor-pointer" onClick={() => navigate(`/swap?outputCurrency=${tokenInfo.address}`)}>
                                <TableCell>Trading on</TableCell>
                                <TableCell align="right">
                                    zkLine Swap
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

            </div>
        </Card>
    )
}

function LaunchContribute({
    poolInfo, tokenInfo, poolState, poolStatus, pooladdress, account, isConnect
}: {
    poolInfo: PoolInfo
    poolStatus: PoolStatus
    tokenInfo: FetchTokenResult
    poolState: bigint
    pooladdress: Address
    account?: Address
    isConnect?: boolean
}) {
    const globalstore = useSnapshot(GlobalStore.state)
    const current = poolStatus.raised_amount
    const maximum = poolInfo.pool_type === 2 ? poolInfo.softcap : poolInfo.hardcap
    const percentage = current * 100n / maximum

    const contribution = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "buyers",
        args: [
            account || zeroAddress
        ],
        watch: true
    }).data

    const [amount, setAmount] = useState<Ether>("0")

    const balance = useBalance({
        address: account
    }).data

    const [loading, setLoading] = useState<boolean>(false)

    const contribute = async () => {
        setLoading(true)
        if (account && isConnect && parseEther(amount) > 0n) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Contribute ${amount} ${globalstore.currentChain.nativeCurrency.symbol}`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const contri = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "userContribute",
                    value: parseEther(amount)
                })
                hash = contri.hash
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
        setLoading(false)
    }

    const withdrawETH = async () => {
        setLoading(true)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Withdraw fund`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const contri = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "userWithdrawETH"
                })
                hash = contri.hash
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
        setLoading(false)
    }

    const claimToken = async () => {
        setLoading(true)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Claim token`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const contri = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "userWithdrawTokens"
                })
                hash = contri.hash
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
        setLoading(false)
    }

    const checkWL = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "whitelistInfo",
        args: [account || zeroAddress]
    }).data

    const isWhiteListSale = poolInfo.pool_type === 1 ? true : poolInfo.public_time !== 0n ? Number(poolInfo.public_time) * 1000 > Date.now() : false

    return (
        <Card elevation={5} component={Paper} className="col-span-3 lg:col-span-1 border-[1px] border-solid border-[#7e99b033] flex flex-col px-2 py-4 gap-2">
            <div className="flex items-center px-4">
                <div className="flex-1 flex flex-col p-3 bg-color-component-input w-full rounded-xl justify-center items-center font-bold">
                    DYOR BEFORE JOINING ANY LAUNCH !!
                </div>
            </div>
            <div className="flex items-center px-4">
                {
                    poolState === 0n ?
                        (<div className="flex flex-col p-3 w-full justify-center items-center gap-4">
                            <div className="font-bold">Pool start in</div>
                            <Countdown
                                key={"poolstartin"}
                                date={Number(poolInfo.pool_start) * 1000}
                                renderer={({ days, hours, minutes, seconds, completed }) => (
                                    <div className="flex gap-4">
                                        <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{days}</div>
                                        <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{hours}</div>
                                        <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{minutes}</div>
                                        <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{seconds}</div>
                                    </div>
                                )}
                            />
                        </div>) :
                        poolState === 1n ?
                            (<div className="flex flex-col p-3 w-full justify-center items-center gap-4">
                                <div className="font-bold">Pool end in</div>
                                <Countdown
                                    key={"poolendin"}
                                    date={Number(poolInfo.pool_end) * 1000}
                                    renderer={({ days, hours, minutes, seconds, completed }) => (
                                        <div className="flex gap-4">
                                            <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{days}</div>
                                            <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{hours}</div>
                                            <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{minutes}</div>
                                            <div className="bg-color-component-input p-2 font-bold rounded w-[35px] text-center">{seconds}</div>
                                        </div>
                                    )}
                                />
                            </div>)
                            : (<div className="flex flex-col p-3 w-full justify-center items-center gap-4">
                                <div className="font-bold">Pool ended</div>
                            </div>)
                }
            </div>
            <div className="flex flex-col px-4 gap-1">
                <div className="relative w-full h-8 shadow-lg rounded-xl">
                    <div className="w-full h-8 rounded-xl border-[1px] border-solid border-color-bg bg-color-component-input !mb-0 absolute"></div>
                    <div
                        className="h-8 rounded-xl border-[1px] border-solid border-color-bg6 bg-color-bg6 !mb-0 absolute text-white text-end pr-2 flex items-center justify-end"
                        style={{
                            width: percentage >= 100n ? "100%" : `${percentage}%`
                        }}
                    >
                        {
                            percentage >= 15n && `${percentage.toString()}%`
                        }
                    </div>
                </div>
                <div className="flex justify-between">
                    <div>{formatNumber(formatEther(current))} {globalstore.currentChain.nativeCurrency.symbol}</div>
                    <div>{formatNumber(formatEther(maximum))} {globalstore.currentChain.nativeCurrency.symbol}</div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-center px-4 gap-2">
                <div className="bg-color-component-input w-full rounded-xl">
                    <Table className="">
                        <TableBody>
                            <TableRow>
                                <TableCell className="truncate">Softcap</TableCell>
                                <TableCell align="right">{formatNumber(formatEther(poolInfo.softcap))} {globalstore.currentChain.nativeCurrency.symbol}</TableCell>
                            </TableRow>
                            {
                                poolInfo.pool_type !== 2 && <TableRow>
                                    <TableCell>Hardcap</TableCell>
                                    <TableCell align="right">{formatNumber(formatEther(poolInfo.hardcap))} {globalstore.currentChain.nativeCurrency.symbol}</TableCell>
                                </TableRow>
                            }
                            <TableRow>
                                <TableCell>Price rate</TableCell>
                                <TableCell align="right">1 {globalstore.currentChain.nativeCurrency.symbol} = {
                                    poolInfo.pool_type !== 2 ? formatNumber(formatUnits(poolInfo.buy_rate, tokenInfo.decimals))
                                        :
                                        formatNumber(formatUnits(poolStatus.raised_amount > 0n ? poolInfo.buy_rate * parseEther("1") / poolStatus.raised_amount : 0n, tokenInfo.decimals))
                                } {tokenInfo.symbol}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Contributors</TableCell>
                                <TableCell align="right">{Number(poolStatus.num_buyers)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-color-component-input w-full rounded-xl">
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Min buy</TableCell>
                                <TableCell align="right">{formatNumber(formatEther(poolInfo.buy_min))} {globalstore.currentChain.nativeCurrency.symbol}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Max buy</TableCell>
                                <TableCell align="right">
                                    {
                                        poolInfo.buy_max > 0n ?
                                            `${formatNumber(formatEther(poolInfo.buy_max))} ${globalstore.currentChain.nativeCurrency.symbol}`
                                            : "Not set"
                                    }
                                </TableCell>
                            </TableRow>
                            {
                                contribution && isConnect && <TableRow>
                                    <TableCell>My Contribution</TableCell>
                                    <TableCell align="right">
                                        {formatNumber(formatEther(contribution[0]))} {globalstore.currentChain.nativeCurrency.symbol}
                                    </TableCell>
                                </TableRow>
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
            {
                // <= 1n
                poolState <= 1n && (<div className="flex flex-col px-4 gap-1">
                    {poolInfo.pool_type !== 2 && isWhiteListSale && account && isConnect && <div className="flex-1 flex flex-col p-3 bg-color-component-input w-full rounded-xl justify-center items-center font-bold">
                        You are {checkWL ? "whitelisted" : "not whitelisted"}
                    </div>}
                    <div className="grow">
                        <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                            <div className="w-full h-full px-4 py-2">
                                <TextField
                                    required
                                    focused
                                    label="Amount"
                                    fullWidth
                                    error={(balance?.value || 0n) <= parseEther(amount)}
                                    helperText={(balance?.value || 0n) <= parseEther(amount) && "Invalid balance"}
                                    value={amount}
                                    onChange={(e) => setAmount(formatInputNumber(e.target.value) as Ether)}
                                    InputProps={{
                                        className: "!text-[16px]"
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={contribute} disabled={!isConnect || loading} className="!bg-color-component-input !text-white disabled:!bg-color-bg5 !flex !gap-2" variant="contained">
                            <span>Contribute</span>
                            <div>
                                {loading && <CircularProgress size={10} />}
                            </div>
                        </Button>
                        {contribution && contribution[0] > 0n && isConnect && <Button onClick={withdrawETH} disabled={!isConnect || loading} className="!bg-color-component-input !text-white disabled:!bg-color-bg5 !flex !gap-2" variant="contained">
                            <span>Emergency Withdraw</span>
                            <div>
                                {loading && <CircularProgress size={10} />}
                            </div>
                        </Button>}
                    </div>
                </div>)
            }
            {
                contribution && contribution[0] > 0n && isConnect && poolState == 2n && (
                    <div className="flex flex-col px-4 gap-1">
                        <div className="grow">
                            <Button onClick={claimToken} disabled={!isConnect || loading || !poolStatus.can_claim} className="!bg-color-component-input !text-white disabled:!bg-color-bg5 !flex !gap-2 w-full" variant="contained">
                                <span>Claim Token</span>
                                <div>
                                    {loading && <CircularProgress size={10} />}
                                </div>
                            </Button>
                        </div>
                    </div>
                )
            }
            {
                contribution && contribution[0] > 0n && isConnect && poolState >= 3n && (
                    <div className="flex flex-col px-4 gap-1">
                        <div className="grow">
                            <Button onClick={withdrawETH} disabled={!isConnect || loading} className="!bg-color-component-input !text-white disabled:!bg-color-bg5 !flex !gap-2 w-full" variant="contained">
                                <span>Withdraw Fund</span>
                                <div>
                                    {loading && <CircularProgress size={10} />}
                                </div>
                            </Button>
                        </div>
                    </div>
                )
            }
        </Card>
    )
}

function LaunchControlPanel({
    poolInfo, poolStatus, poolState, pooladdress, account, isConnect,
    OWNER, MODER, ADMIN, meta
}: {
    poolInfo: PoolInfo
    poolStatus: PoolStatus
    poolState: bigint
    pooladdress: Address
    meta: Meta
    account?: Address
    isConnect?: boolean
    OWNER: Address
    MODER: Address
    ADMIN: Address
}) {
    const globalstore = useSnapshot(GlobalStore.state)
    const [loading, setLoading] = useState<boolean>(false)

    const [metadata, setMetadata] = useState<Metadata>(meta.properties)

    const [editMeta, setEditMeta] = useState<boolean>(false)
    const [isAddWL, setIsAddWL] = useState<boolean>(false)
    const [isRemWL, setIsRemWL] = useState<boolean>(false)
    const [isSetType, setIsSetType] = useState<boolean>(false)

    const [addresses, setAddresses] = useState<string>("")
    const [publicTime, setPublicTime] = useState<number>(Math.floor(Math.floor((Date.now() / 1000) / 3600 + 1) * 3600))

    const isOwner = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "hasRole",
        args: [
            OWNER, account || zeroAddress
        ]
    }).data

    const isModer = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "hasRole",
        args: [
            MODER, account || zeroAddress
        ]
    }).data

    const isAdmin = useContractRead({
        abi: ABI_LAUNCH_POOL,
        address: pooladdress,
        functionName: "hasRole",
        args: [
            ADMIN, account || zeroAddress
        ]
    }).data

    const finalize = async () => {
        setLoading(true)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Finalize this launch, token will be listed on our DEX`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const execute = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "owner_finalize"
                })
                hash = execute.hash
                GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
            } catch (error: unknown) {
                console.log(error)
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

    const cancelpool = async () => {
        setLoading(true)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Cancel pool, everyone can get refund without fee`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const execute = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "setCancel"
                })
                hash = execute.hash
                GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
            } catch (error: unknown) {
                console.log(error)
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

    const updatemeta = async () => {
        setLoading(true)
        setEditMeta(false)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 1,
                    name: `Upload metadata to IPFS`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
                {
                    id: 2,
                    name: `Update metadata to pool`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(1, TXHstatus.PENDING)
                const logo = await fetch(metadata.logo)
                const logo_blob = await logo.blob()
                GlobalStore.updateTxQueue(1, TXHstatus.SUBMITTED)
                const ipfs = await ipfsClient.store({
                    name: meta.name,
                    description: metadata.description,
                    image: logo_blob,
                    properties: metadata
                })
                GlobalStore.updateTxQueue(1, TXHstatus.DONE)
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const execute = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "updateMetadata",
                    args: [
                        ipfs.ipnft
                    ]
                })
                hash = execute.hash
                GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })
                wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
            } catch (error: unknown) {
                console.log(error)
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

    const editWhitelist = async (isAdd: boolean) => {
        setLoading(true)
        setIsAddWL(false)
        setIsRemWL(false)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: isAdd ? `Add whitelists to pool` : `Remove whitelists from pool`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const execute = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: isAdd ? "setWhitelistInfo" : "deleteWhitelistInfo",
                    args: [
                        addresses.split("\n").filter(val => isAddress(val)) as Address[]
                    ]
                })
                hash = execute.hash
                setAddresses("")
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
        setLoading(false)
    }

    const updatePresaleType = async (publictime: bigint = 0n) => {
        setLoading(true)
        setIsSetType(false)
        if (account && isConnect) {
            GlobalStore.setTxQueue([
                {
                    id: 2,
                    name: `Update presale info`,
                    status: TXHstatus.WAITING,
                    hash: ""
                },
            ])
            try {
                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                let hash: Hash
                const execute = await wagmiCore.writeContract({
                    abi: ABI_LAUNCH_POOL,
                    address: pooladdress,
                    functionName: "setPresaleType",
                    args: [
                        publictime
                    ]
                })
                hash = execute.hash
                setAddresses("")
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
        setLoading(false)
    }

    const isWhiteListSale = poolInfo.pool_type === 1 ? true : poolInfo.public_time !== 0n ? Number(poolInfo.public_time) * 1000 > Date.now() : false

    if (isOwner || isModer || isAdmin) {
        return (
            <Card elevation={5} component={Paper} className="col-span-3 border-[1px] border-solid border-[#7e99b033] flex flex-col px-2 py-4 gap-2">
                <div className="flex items-center px-4">
                    <div className="flex-1 flex flex-col p-3 bg-color-component-input w-full rounded-xl justify-center items-center font-bold">
                        OWNER CONTROL PANEL
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 px-4 gap-2">
                    <div className="flex flex-col gap-2 bg-color-component-input rounded-lg p-2">
                        <div className="text-center">
                            1. Launch Info
                        </div>
                        {isOwner && <Button onClick={() => setEditMeta(true)} disabled={loading || editMeta} variant="outlined" className="w-full disabled:!bg-color-component-disabled">Edit Metadata {loading && <CircularProgress size={10} />}</Button>}
                        {isOwner && poolInfo.pool_type !== 2 && <Button onClick={() => setIsAddWL(true)} disabled={loading || isAddWL} variant="outlined" className="w-full disabled:!bg-color-component-disabled">Add Whitelist {loading && <CircularProgress size={10} />}</Button>}
                        {isOwner && poolInfo.pool_type !== 2 && <Button onClick={() => setIsRemWL(true)} disabled={loading || isRemWL} variant="outlined" className="w-full disabled:!bg-color-component-disabled">Remove Whitelist {loading && <CircularProgress size={10} />}</Button>}
                    </div>
                    <div className="flex flex-col gap-2 bg-color-component-input rounded-lg p-2">
                        <div className="text-center">
                            2. Launch Process
                        </div>
                        {isOwner && poolInfo.pool_type !== 2 && !isWhiteListSale && <Button onClick={() => updatePresaleType(0n)} disabled={loading || isSetType} variant="outlined" className="w-full disabled:!bg-color-component-disabled">CHANGE TO WHITELIST SALE {loading && <CircularProgress size={10} />}</Button>}
                        {isOwner && poolInfo.pool_type !== 2 && isWhiteListSale && <Button onClick={() => updatePresaleType(1n)} disabled={loading || isSetType} variant="outlined" className="w-full disabled:!bg-color-component-disabled">CHANGE TO PUBLIC SALE {loading && <CircularProgress size={10} />}</Button>}
                        {isOwner && poolInfo.pool_type !== 2 && isWhiteListSale && <Button onClick={() => setIsSetType(true)} disabled={loading || isSetType} variant="outlined" className="w-full disabled:!bg-color-component-disabled">CHANGE PUBLIC TIME {loading && <CircularProgress size={10} />}</Button>}
                        {isOwner && <Button variant="outlined" onClick={cancelpool} disabled={poolStatus.can_claim || loading} className="w-full disabled:!bg-color-component-disabled">Cancel pool {loading && <CircularProgress size={10} />}</Button>}
                    </div>
                    <div className="flex flex-col gap-2 bg-color-component-input rounded-lg p-2">
                        <div className="text-center">
                            3. Launch Final
                        </div>
                        {isOwner && <Button onClick={finalize} disabled={!(poolState === 2n && !poolStatus.can_claim) || loading} variant="outlined" className="w-full disabled:!bg-color-component-disabled">
                            Finalize {loading && <CircularProgress size={10} />}
                        </Button>}
                    </div>
                </div>
                <Dialog onClose={() => setEditMeta(false)} open={editMeta}>
                    <div className="p-[10px] md:p-[24px] w-full md:w-[600px]">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            updatemeta()
                        }} className="grid grid-cols-4 gap-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
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
                                        <div className="flex-1 h-full px-4 pt-6 pb-2">
                                            <TextField
                                                fullWidth
                                                type={"url"}
                                                multiline
                                                minRows={2}
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
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                >
                                    Update {(loading) && <CircularProgress size={10} />}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
                <Dialog onClose={() => {
                    setIsRemWL(false)
                    setIsAddWL(false)
                }} open={isAddWL || isRemWL}>
                    <div className="p-[10px] md:p-[24px] w-full md:w-[600px]">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            if (isAddWL) {
                                editWhitelist(true)
                            } else if (isRemWL) {
                                editWhitelist(false)
                            }
                        }} className="grid grid-cols-4 gap-2">
                            <div className="col-span-4">
                                <div className="mt-[2px] mb-[2px] relative">
                                    <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                                        <div className="flex-1 h-full px-4 pt-4 pb-2">
                                            <TextField
                                                fullWidth
                                                type="string"
                                                focused
                                                label="Addresses"
                                                helperText="Each address in 1 line"
                                                multiline
                                                minRows={8}
                                                maxRows={10}
                                                value={addresses}
                                                onChange={(e) => setAddresses(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 flex w-full mt-[10px] gap-2">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                >
                                    Update {(loading) && <CircularProgress size={10} />}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
                <Dialog onClose={() => {
                    setIsSetType(false)
                }} open={isSetType}>
                    <div className="p-[10px] md:p-[24px] w-[300px] md:w-[600px] h-fit">
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            updatePresaleType(BigInt(publicTime))
                        }} className="grid grid-cols-4 gap-2">
                            <div className="col-span-4">
                                <div className="mt-[2px] mb-[2px] h-[300px]">
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
                                                customInput={<TextField fullWidth autoComplete='off' label="Public Time" />}
                                                selected={new Date(publicTime * 1000)}
                                                onChange={(date: Date) => {
                                                    setPublicTime(Number(date.getTime() / 1000))
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 flex w-full mt-[10px] gap-2">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    color="primary"
                                    className="!bg-color-component-tab !text-color-text-btn w-full !font-[700] disabled:!bg-color-component-disabled disabled:!text-color-text-btn -disabled"
                                >
                                    Update {(loading) && <CircularProgress size={10} />}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </Card>
        )
    }
    return null
}