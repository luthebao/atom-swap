import GlobalStore, { SwapInputType, Token } from '../../store/gobalStore';
import { useSnapshot } from 'valtio';
import { DEXB } from '../../configs/addresses'
import { FaCaretDown } from "react-icons/fa"
import { Dialog, MenuItem, Typography } from '@material-ui/core';
import { TokenList } from '../../configs/tokens';
import { uriToHttp } from '../../configs/utils';
import { useState } from 'react';
import { useNetwork } from 'wagmi';

const SelectTokenButton = ({
    token
}: {
    token: Token | null
}) => {

    return (
        <div className="flex gap-2 mr-3">
            <div>
                <img width={25} height={25} src={token ? `${uriToHttp(token.logoURI || token.symbol)[0]}` : '/tokens/unknown-logo.png'} alt="" />
            </div>
            <div className='text-base'>
                {
                    token ? token.name : "Select Token"
                }
            </div>
        </div>
    )
}

export default function CurrencyInput({
    type
}: {
    type: SwapInputType,
}) {
    const network = useNetwork()
    const globalStore = useSnapshot(GlobalStore.state)
    const allTokens = TokenList.tokens.filter(val => val.chainId === (type === SwapInputType.FROM ? globalStore.currentChain.id : globalStore.toChain.id))

    const [showTokens, setShowTokens] = useState(false)
    const [showChains, setShowChains] = useState(false)

    return (
        <div className="mt-[2px] mb-[2px] relative px-3 py-10">
            <div className="flex justify-between">
                <div>
                    {
                        type === SwapInputType.FROM ? "From" : "To"
                    }
                </div>
                <div>
                    Balance: 0
                </div>
            </div>
            <div className={`flex w-full`}>
                <button className="flex justify-between border !border-r-0 border-[#4a4a4a] p-2 h-[58px] items-center gap-2 min-w-[180px] rounded-l-[10px] hover:bg-[#171b21]"
                    onClick={() => setShowChains(true)}
                >
                    <div className="flex gap-2 mr-3">
                        <div>
                            <img width={25} height={25} src={type === SwapInputType.FROM ? DEXB[globalStore.currentChain.id].iconUrl : DEXB[globalStore.toChain.id].iconUrl} alt="" />
                        </div>
                        <div className='text-base'>
                            {type === SwapInputType.FROM ? globalStore.currentChain.name : globalStore.toChain.name}
                        </div>
                    </div>
                    <div className="flex flex-end">
                        <FaCaretDown />
                    </div>
                </button>
                <button className="flex justify-between border !border-r-0 border-[#4a4a4a] p-2 h-[58px] items-center gap-2 min-w-[200px] hover:bg-[#171b21]" onClick={() => setShowTokens(true)}>
                    <SelectTokenButton token={type === SwapInputType.FROM ? globalStore.fromToken : globalStore.toToken} />
                    <div className="flex flex-end">
                        <FaCaretDown />
                    </div>
                </button>
                <Dialog onClose={() => setShowTokens(false)} open={showTokens} ref={null}>
                    <div className="p-[10px] max-h-[520px] overflow-y-scroll w-[80vw] md:p-[24px] md:w-[450px]">
                        <div>
                            {type === SwapInputType.FROM ? globalStore.currentChain.name : globalStore.toChain.name}
                        </div>
                        <div className="w-full flex flex-col mt-[12px]">
                            {
                                allTokens.map((asset, idx) => (
                                    <MenuItem key={asset.address + asset.chainId} onClick={() => {
                                        if (type === SwapInputType.FROM) {
                                            GlobalStore.setFromToken(asset)
                                        } else {
                                            GlobalStore.setToToken(asset)
                                        }
                                        setShowTokens(false)
                                    }}>
                                        <div>
                                            <div className="w-[50px] relative mr-[12px]">
                                                <img
                                                    className="border border-solid border-border rounded-[30px] bg-color-component-input p-[6px]"
                                                    alt={asset.address}
                                                    src={asset ? `${uriToHttp(asset.logoURI || asset.symbol)[0]}` : '/tokens/unknown-logo.png?v=006'}
                                                    width={40}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Typography variant='h5'>{asset ? asset.symbol : ''}</Typography>
                                            <Typography variant='subtitle1' color='textSecondary'>{asset ? asset.name : ''}</Typography>
                                        </div>
                                    </MenuItem>
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
                                network.chains.map(val => (
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
                <input
                    disabled={type === SwapInputType.TO}
                    className="flex flex-grow focus:outline-none justify-between border border-[#4a4a4a] p-2 h-[58px] items-center gap-2 rounded-r-[10px] bg-transparent" placeholder="Enter amount"
                    value={type === SwapInputType.FROM ? globalStore.fromAmount : globalStore.toAmount}
                    onChange={(e) => {
                        type === SwapInputType.FROM && GlobalStore.setFromAmount(e.target.value)
                    }}

                />
            </div>
        </div>
    )
} 