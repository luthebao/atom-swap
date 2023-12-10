import { useState } from 'react'
import {
    Typography,
    Button,
    CircularProgress,
    IconButton,
} from '@material-ui/core'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import { withTheme } from '@material-ui/core/styles'
import { useSearchParams } from 'react-router-dom'
import GlobalStore, { SWAPSTATE, SwapInputType, TXHstatus } from '../../store/gobalStore'
import CurrencyInput from '../CoreComponents/CurrencyInput'
import { useSnapshot } from 'valtio'
import { ContractFunctionExecutionError, TransactionExecutionError, encodePacked, formatUnits, parseAbiItem, parseEther, parseUnits } from 'viem'
import { Address, erc20ABI, useAccount, useChainId, useSignTypedData } from 'wagmi'
import { wagmiCore } from '../../configs/connectors'
import { toast } from 'react-toastify'
import { MdRefresh, MdOutlineSettings, MdSwapCalls } from "react-icons/md";
import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { DEXB } from '../../configs/addresses'
import { ABI_ASSET_ROUTER, ABI_DEXB, ABI_UNISWAP } from '../../configs/abi'
import SwapQuote from './SwapQuote'
import { MAX_UINT256, NATIVE_TOKEN } from '../../configs/utils'
import { FaSpinner } from 'react-icons/fa'

interface ERROR {
    shortMessage: string
}

function SwapCore() {
    const globalstore = useSnapshot(GlobalStore.state)
    const chainid = useChainId()
    const [loading, setLoading] = useState(false)
    const { openConnectModal } = useConnectModal();
    const { openChainModal } = useChainModal();
    const { signTypedDataAsync } = useSignTypedData({})
    const account = useAccount()

    const fetchQuote = async () => {
        setLoading(true)
        if (globalstore.currentChain !== null && globalstore.toChain !== null && globalstore.fromToken !== null && globalstore.toToken !== null && Number(globalstore.fromAmount) >= 0) {
            try {
                GlobalStore.setToAmount("0")
                GlobalStore.setQuote(null)
                const sendFromAmount0 = parseUnits(globalstore.fromAmount, globalstore.fromToken.decimals)

                let addy0 = globalstore.fromToken.address
                let addy1 = globalstore.toToken.address

                if (globalstore.fromToken.address === NATIVE_TOKEN) {
                    addy0 = DEXB[globalstore.currentChain.id].WETH
                }

                if (globalstore.toToken.address === NATIVE_TOKEN) {
                    addy1 = DEXB[globalstore.toChain.id].WETH
                }

                const result0 = await wagmiCore.readContract({
                    abi: ABI_UNISWAP,
                    address: DEXB[globalstore.currentChain.id].Uniswap,
                    chainId: globalstore.currentChain.id,
                    functionName: "getAmountsOut",
                    args: [
                        sendFromAmount0,
                        [
                            addy0 as Address, DEXB[globalstore.currentChain.id].Token
                        ]
                    ]
                })

                if (result0.length !== 2) {
                    toast("Can not find pair")
                    return
                }

                const sendFromAmount1 = result0[1]

                const result1 = await wagmiCore.readContract({
                    abi: ABI_UNISWAP,
                    address: DEXB[globalstore.toChain.id].Uniswap,
                    chainId: globalstore.toChain.id,
                    functionName: "getAmountsOut",
                    args: [
                        sendFromAmount1,
                        [
                            DEXB[globalstore.toChain.id].Token, addy1 as Address
                        ]
                    ]
                })

                if (result1.length !== 2) {
                    toast("Can not find pair")
                    return
                }

                GlobalStore.setQuote({
                    minHgsAmount: result1[0]
                })
                GlobalStore.setToAmount(formatUnits(result1[1], globalstore.toToken.decimals))
            } catch (error: unknown) {
                console.log(error)
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

    const onSwap = async () => {
        setLoading(true)

        if (globalstore.currentChain === null || globalstore.toChain === null || globalstore.fromToken === null || globalstore.toToken === null || Number(globalstore.fromAmount) <= 0) {
            toast("Invalid Input")
        }
        else if (Number(globalstore.toAmount) <= 0 || globalstore.quote === null) {
            await fetchQuote()
        }
        else {
            try {
                const logs = await wagmiCore.getPublicClient().getLogs({
                    address: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    event: {
                        "anonymous": false,
                        "inputs": [
                            {
                                "indexed": false,
                                "internalType": "bytes32",
                                "name": "id",
                                "type": "bytes32"
                            }
                        ],
                        "name": "NewPendingSwap",
                        "type": "event"
                    },
                    fromBlock: 10184809n,
                    toBlock: 10184897n,
                })

                GlobalStore.setTxQueue([
                    {
                        id: 0,
                        name: `Checking your ${globalstore.fromToken.symbol} allowance`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                    {
                        id: 1,
                        name: `Signing Transaction`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                    {
                        id: 2,
                        name: `Swap ${globalstore.fromAmount} ${globalstore.fromToken.symbol} (${globalstore.currentChain.name}) to ${globalstore.toToken.symbol} (${globalstore.toChain.name})`,
                        status: TXHstatus.WAITING,
                        hash: ""
                    },
                ])


                const sendFromAmount0 = parseUnits(globalstore.fromAmount, globalstore.fromToken.decimals)
                let allowance0: bigint = 0n

                if (sendFromAmount0 > parseEther("0.1")) {
                    GlobalStore.setFromAmount("0")
                    throw {
                        shortMessage: "Swap from amount with maximum 0.1 ETH"
                    }
                }

                if (globalstore.fromToken.address !== NATIVE_TOKEN) {
                    while (true) {
                        allowance0 = await wagmiCore.readContract({
                            abi: erc20ABI,
                            address: globalstore.fromToken.address as Address,
                            functionName: "allowance",
                            args: [account.address as Address, DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap],
                        })
                        if (allowance0 < parseUnits(globalstore.fromAmount, globalstore.fromToken.decimals)) {
                            try {
                                GlobalStore.updateTxQueue(0, TXHstatus.PENDING)
                                const approve0 = await wagmiCore.writeContract({
                                    abi: erc20ABI,
                                    address: globalstore.fromToken.address as Address,
                                    functionName: "approve",
                                    args: [
                                        DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
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

                GlobalStore.updateTxQueue(1, TXHstatus.PENDING)
                const signature = await signTypedDataAsync({
                    domain: {
                        name: "DEXB Swap",
                        version: "0.0.1",
                        chainId: globalstore.currentChain.id,
                        verifyingContract: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    },
                    types: {
                        Parameters: [
                            { name: 'receiver', type: 'address' },
                            { name: 'lwsPoolId', type: 'uint16' },
                            { name: 'hgsPoolId', type: 'uint16' },
                            { name: 'dstToken', type: 'address' },
                            { name: 'minHgsAmount', type: 'uint256' },
                        ]
                    },
                    primaryType: 'Parameters',
                    message: {
                        receiver: account.address as Address,
                        lwsPoolId: 1,
                        hgsPoolId: 1,
                        dstToken: globalstore.toToken.address,
                        minHgsAmount: globalstore.quote.minHgsAmount * 60n / 100n,
                    },
                });
                GlobalStore.updateTxQueue(1, TXHstatus.DONE)

                GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
                const SWAP_PARAMS = {
                    srcToken: globalstore.fromToken.address as Address,
                    srcAmount: sendFromAmount0,
                    lwsPoolId: 1,
                    hgsPoolId: 1,
                    dstToken: globalstore.toToken.address as Address,
                    dstChain: DEXB[globalstore.toChain.id].l0chainid,
                    dstAggregatorAddress: DEXB[globalstore.toChain.id].DEXBAggregatorUniswap,
                    minHgsAmount: globalstore.quote.minHgsAmount * 60n / 100n,
                    signature: signature,
                }

                const payload = encodePacked(
                    ['uint16', 'uint16', 'address', 'uint256', 'address', 'bytes'],
                    [
                        1, 1, globalstore.toToken.address as Address, 0n, account.address as Address, signature
                    ]
                )

                const gas1 = await wagmiCore.getPublicClient().estimateContractGas({
                    abi: ABI_ASSET_ROUTER,
                    address: DEXB[globalstore.currentChain.id].AssetRouter,
                    functionName: "swap",
                    args: [{
                        srcPoolId: 1,
                        dstPoolId: 1,
                        dstChainId: DEXB[globalstore.toChain.id].l0chainid,
                        amount: globalstore.quote.minHgsAmount,
                        minAmount: 0n,
                        refundAddress: account.address as Address,
                        to: DEXB[globalstore.toChain.id].DEXBAggregatorUniswap,
                        payload: payload
                    }],
                    value: sendFromAmount0,
                    account: account.address as Address,
                })

                const gas2 = await wagmiCore.getPublicClient().estimateContractGas({
                    abi: ABI_DEXB,
                    address: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    functionName: "startSwap",
                    args: [
                        SWAP_PARAMS
                    ],
                    value: sendFromAmount0 * 2n,
                    account: account.address as Address,
                })

                let gasPrice = await wagmiCore.getPublicClient().getGasPrice()

                gasPrice = gasPrice < 500000n ? 500000n : gasPrice

                console.log(gasPrice, gas1, gas2, formatUnits((gas1 + gas2) * gasPrice * 100n, 18))

                const write = await wagmiCore.writeContract({
                    abi: ABI_DEXB,
                    address: DEXB[globalstore.currentChain.id].DEXBAggregatorUniswap,
                    functionName: "startSwap",
                    args: [
                        SWAP_PARAMS
                    ],
                    value: sendFromAmount0 + (gas1 + gas2) * gasPrice * 100n
                })

                const hash = write.hash
                const wait2 = await wagmiCore.waitForTransaction({
                    confirmations: globalstore.confirmations,
                    hash: hash
                })

                if (wait2.status === "success") {
                    GlobalStore.updateTxQueue(2, TXHstatus.DONE)
                } else {
                    GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                }
            } catch (error: ERROR | any) {
                console.log(error)
                GlobalStore.updateTxQueue(0, TXHstatus.REJECTED)
                GlobalStore.updateTxQueue(1, TXHstatus.REJECTED)
                GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
                if (error instanceof TransactionExecutionError) {
                    toast(error.shortMessage)
                } else if (error instanceof ContractFunctionExecutionError) {
                    toast(error.shortMessage)
                } else if ("shortMessage" in error) {
                    toast(error.shortMessage)
                } else {
                    toast("Unknown error")
                }
            }
            GlobalStore.setToAmount("0")
        }
        setLoading(false)
    }

    return (
        <div className="flex flex-col w-full">
            <div className='flex flex-row justify-between mb-1 select-none'>
                <div className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md text-lg">Swap</div>

                <div className='flex flex-row'>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md" onClick={fetchQuote} disabled={loading}>
                        <MdRefresh className={`text-2xl`} />
                    </IconButton>
                    <IconButton className="p-2 cursor-pointer !bg-none !hover:bg-color-bg9 !rounded-md">
                        <MdOutlineSettings className={"text-2xl hover:animate-spin"} />
                    </IconButton>
                </div>
            </div>
            <CurrencyInput type={SwapInputType.FROM} />
            <div className="w-full flex items-center justify-center mt-5 mb-4 select-none">
                <div className="bg-color-component-iconbtn rounded-[9px]">
                    <MdSwapCalls className="cursor-pointer p-[6px] !text-[35px] bg-color-component-input m-1 rounded-md" onClick={() => {
                        GlobalStore.setSwapInput()
                    }} />
                </div>
            </div>
            <CurrencyInput type={SwapInputType.TO} />

            <div className="flex flex-col py-5 px-4">
                {
                    openConnectModal ? (
                        <Button
                            variant='contained'
                            size='large'
                            color='primary'
                            className="!bg-[#FFFFFF] !text-[#000000] w-full"
                            onClick={openConnectModal}
                        >
                            <Typography className='!font-bold'>
                                Connect Wallet
                            </Typography>
                        </Button>
                    ) : (openChainModal && chainid !== globalstore.currentChain?.id) ? (
                        <Button
                            variant='contained'
                            size='large'
                            color='primary'
                            className="!bg-[#FFFFFF] !text-[#000000] w-full"
                            onClick={openChainModal}
                        >
                            <Typography className='!font-bold'>
                                Switch Network
                            </Typography>
                        </Button>
                    ) : <Button
                        variant='contained'
                        size='large'
                        color='primary'
                        className="!bg-[#FFFFFF] !text-[#000000]"
                        onClick={onSwap}
                    >

                        {
                            loading ? <FaSpinner className={`text-[19px] animate-spin`} /> :
                                <Typography className='!font-[500]'>
                                    {
                                        globalstore.swapstate === SWAPSTATE.QUOTE ? `Get Quote` : `Swap`
                                    }
                                </Typography>
                        }
                    </Button>
                }
            </div>

            <SwapQuote loading={loading} refresh={fetchQuote} />
        </div>
    )
}

export default withTheme(SwapCore)
