import GlobalStore, { SWAPSTATE, SwapInputType, Token } from '../../store/gobalStore';
import { useSnapshot } from 'valtio';
import { DEXB } from '../../configs/addresses'
import { FaCaretDown } from "react-icons/fa"
import { Dialog, IconButton, MenuItem, Typography } from '@material-ui/core';
import { TokenList } from '../../configs/tokens';
import { NATIVE_TOKEN, formatInputNumber, uriToHttp } from '../../configs/utils';
import { useState } from 'react';
import { Address, Chain, useAccount, useBalance, useChainId, useNetwork } from 'wagmi';
import { CHAINS_lIST, wagmiCore } from '../../configs/connectors';
import { MdClear } from 'react-icons/md';

const SelectTokenButton = ({
    token
}: {
    token: Token | null
}) => {

    return (
        <div className="flex gap-2 mr-3">
            <div className="hidden md:block">
                <img width={25} height={25} src={token ? `${uriToHttp(token.logoURI || token.symbol)[0]}` : '/tokens/unknown-logo.png'} alt="" />
            </div>
            <div className="text-base">
                {
                    token ? token.symbol : "Select Token"
                }
            </div>
        </div>
    )
}

const SelectNetworkButton = ({
    network
}: {
    network: Chain | null
}) => {

    return (
        <div className="flex gap-2 mr-3">
            <div className="hidden md:block">
                <img width={25} height={25} src={network ? DEXB[network.id].iconUrl : '/tokens/unknown-logo.png'} alt="" />
            </div>
            <div className='text-base'>
                {network ? network.name : "Select network"}
            </div>
        </div>
    )
}

export default function CurrencyInput({
    type
}: {
    type: SwapInputType,
}) {
    const account = useAccount()
    const chainid = useChainId()

    const globalStore = useSnapshot(GlobalStore.state)
    // const allTokens = TokenList.tokens.filter(val => val.chainId === (type === SwapInputType.FROM ? (globalStore.currentChain?.id || 0) : (globalStore.toChain?.id || 0)))

    const [showTokens, setShowTokens] = useState(false)
    const [showChains, setShowChains] = useState(false)

    const balance = useBalance({
        token: type === SwapInputType.FROM ? globalStore.fromToken?.address.replace(NATIVE_TOKEN, "") as Address : globalStore.toToken?.address.replace(NATIVE_TOKEN, "") as Address,
        chainId: type === SwapInputType.FROM ? globalStore.currentChain?.id : globalStore.toChain?.id,
        address: account.address,
        watch: true
    })

    const addAsset = async (asset: {
        name: string;
        decimals: number;
        symbol: string;
        address: string;
        chainId: number;
        logoURI: string;
    }) => {
        if (chainid === asset.chainId) {
            (await wagmiCore.getWalletClient())?.watchAsset({
                type: "ERC20",
                options: {
                    address: asset.address,
                    decimals: asset.decimals,
                    symbol: asset.symbol,
                },
            })
        }
    }

    const onChangeInput = (value: string) => {
        if (type === SwapInputType.FROM) {
            const formatted = formatInputNumber(value)
            GlobalStore.setFromAmount(formatted)
        }
    }

    return (
        <div className="relative px-3 pt-2 pb-3">
            <div className="flex justify-between select-none">
                <div>
                    {
                        type === SwapInputType.FROM ? "From" : "To"
                    }
                </div>
                <div>
                    Balance: {balance.data?.formatted || 0}
                </div>
            </div>
            <div className={`flex w-full`}>
                <button className="flex justify-between border !border-r-0 border-[#4a4a4a] p-2 h-[58px] items-center gap-2 md:min-w-[180px] rounded-l-[10px] hover:bg-[#171b21] select-none"
                    onClick={() => setShowChains(true)}
                >
                    <SelectNetworkButton network={type === SwapInputType.FROM ? globalStore.currentChain : globalStore.toChain} />
                    <div className="flex flex-end">
                        <FaCaretDown />
                    </div>
                </button>
                <button className="flex justify-between border border-[#4a4a4a] p-2 h-[58px] items-center gap-2 md:min-w-[200px] hover:bg-[#171b21] select-none" onClick={() => setShowTokens(true)}>
                    <SelectTokenButton token={type === SwapInputType.FROM ? globalStore.fromToken : globalStore.toToken} />
                    <div className="flex flex-end">
                        <FaCaretDown />
                    </div>
                </button>
                <div className='flex flex-grow relative'>
                    <input
                        disabled={type === SwapInputType.TO}
                        className="absolute w-full select-none focus:outline-none justify-between border !border-l-0 border-[#4a4a4a] p-2 h-[58px] items-center gap-2 rounded-r-[10px] bg-transparent" placeholder="Enter amount"
                        value={type === SwapInputType.FROM ? globalStore.fromAmount : globalStore.toAmount}
                        onChange={(e) => {
                            type === SwapInputType.FROM && onChangeInput(e.target.value)
                        }}
                    />
                    {type === SwapInputType.FROM && globalStore.swapstate === SWAPSTATE.SUBMIT && (
                        <div className="absolute h-full flex items-center end-0">
                            <IconButton className="border rounded-[5px] p-1 items-center h-[40px] w-[40px] m-auto" >
                                <MdClear className="text-xl" onClick={() => onChangeInput("0")} />
                            </IconButton>
                        </div>
                    )}
                </div>

            </div>
            <Dialog onClose={() => setShowTokens(false)} open={showTokens} ref={null}>
                <div className="p-[10px] max-h-[520px] overflow-y-scroll w-[80vw] md:p-[24px] md:w-[450px]">
                    <div>
                        {type === SwapInputType.FROM ? globalStore.currentChain?.name : globalStore.toChain?.name}
                    </div>
                    <div className="w-full flex flex-col mt-[12px] gap-1">
                        {
                            TokenList.tokens.filter(val => val.chainId === (type === SwapInputType.FROM ? (globalStore.currentChain?.id || 0) : (globalStore.toChain?.id || 0))).map((asset, idx) => (
                                <div key={asset.address + asset.chainId}
                                    className="flex justify-between hover:bg-[#171b21] px-3 py-2"
                                >
                                    <div className="flex flex-grow cursor-pointer" onClick={() => {
                                        if (type === SwapInputType.FROM) {
                                            GlobalStore.setFromToken(asset)
                                        } else {
                                            GlobalStore.setToToken(asset)
                                        }
                                        setShowTokens(false)
                                    }}>
                                        <div className="flex items-center">
                                            <div className="w-[50px] relative mr-[12px]">
                                                <img
                                                    className="border border-solid border-border rounded-[30px] bg-color-component-input p-[6px]"
                                                    alt={asset.address}
                                                    src={asset ? `${uriToHttp(asset.logoURI || asset.symbol)[0]}` : '/tokens/unknown-logo.png?v=006'}
                                                    width={40}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center w-full">
                                            {/* <Typography variant='h5' className="items-start relative flex">{asset ? asset.symbol : ''}</Typography> */}
                                            <Typography variant='h5' color='textSecondary' className="tracking-wide truncate">{asset ? asset.name : ''} ({asset ? asset.symbol : ''})</Typography>
                                        </div>
                                    </div>
                                    {asset.address !== NATIVE_TOKEN && asset.chainId === chainid && <div className="flex items-center select-none cursor-pointer" onClick={() => {
                                        addAsset(asset)
                                    }}>
                                        Import
                                    </div>}
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Dialog>
            <Dialog onClose={() => setShowChains(false)} open={showChains} ref={null}>
                <div className="p-[10px] max-h-[520px] overflow-y-scroll w-[80vw] md:p-[24px] md:w-[450px]">
                    <div>
                        {type === SwapInputType.FROM ? "From network" : "To network"}
                    </div>
                    <div className="w-full flex flex-col mt-[12px]">
                        {
                            CHAINS_lIST.map(val => (
                                <MenuItem key={val.name} onClick={() => {
                                    if (type === SwapInputType.FROM) {
                                        GlobalStore.setCurrentChain(val)
                                    } else {
                                        GlobalStore.setToChain(val)
                                    }
                                    setShowChains(false)
                                }}>
                                    <div>
                                        <div className="w-[50px] relative mr-[12px]">
                                            <img
                                                className="border border-solid rounded-[30px] bg-color-component-input p-[0px]"
                                                alt={val.name}
                                                src={DEXB[val.id].iconUrl}
                                                width={40}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Typography variant='h5'>{val.name}</Typography>
                                    </div>
                                </MenuItem>
                            ))
                        }
                    </div>
                </div>
            </Dialog>
        </div>
    )
} 