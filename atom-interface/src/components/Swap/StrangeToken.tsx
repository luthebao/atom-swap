import {
    CircularProgress,
    Dialog,
} from '@material-ui/core';
import GlobalStore from '../../store/gobalStore';
import { useToken } from 'wagmi';
import { useSnapshot } from 'valtio';
import { isAddress } from 'viem';
import { useSearchParams } from 'react-router-dom';
import { FileCopyOutlined } from '@material-ui/icons';
import { toast } from 'react-toastify';
import { PROJECT_LOGO } from '../../configs/projects';

export default function StrangeToken({
    show,
}: {
    show: boolean
}) {

    const [searchParams, setSearchParams] = useSearchParams()
    const globalstore = useSnapshot(GlobalStore.state)

    const outputCurrency = searchParams.get("outputCurrency")

    const token = useToken({
        address: outputCurrency && isAddress(outputCurrency) ? searchParams.get("outputCurrency") as `0x${string}` : undefined,
        chainId: globalstore.currentChain.id
    })

    return (
        <Dialog onClose={() => { }} open={show} ref={null}>
            <div className="p-[24px]">
                <div className="flex flex-col w-[390px] items-center">
                    <div className='border-none px-4 py-2 rounded-xl bg-color-bg5 text-color-text3 font-bold tracking-wide'>
                        Warning ⚠️
                    </div>
                    <div className="text-center text-xl mt-5">
                        This token isn't traded on leading U.S. centralized exchanges or frequently swapped on {PROJECT_LOGO.alt}. Always conduct your own research before trading.
                    </div>
                    {
                        token.isLoading || token.isFetching ? <div className='mt-5 p-2' >
                            <div className="flex items-center justify-center">
                                <CircularProgress size={20} />
                            </div>
                        </div> : token.data ? <div className='mt-5 p-2 bg-color-bg6 rounded-lg flex flex-row w-full text-color-text4 '>
                            <a className='truncate hover:text-color-text5 m-auto' href={`${globalstore.currentChain.blockExplorers?.default.url}/search?f=0&q=${token.data.address}`} target='_blank' >{globalstore.currentChain.blockExplorers?.default.url}/search?f=0&q={token.data.address}</a>
                            <button className='hover:text-color-text5' onClick={() => {
                                token.data && navigator.clipboard.writeText(token.data.address);
                                toast("Copied to clipboard", {
                                    autoClose: 300,
                                    theme: "colored",
                                })
                            }}>
                                <FileCopyOutlined />
                            </button>
                        </div> : <div className='mt-5 p-2 bg-color-bg8 rounded-lg flex flex-row  text-color-text6 font-bold' >
                            UNKNOWN TOKEN
                        </div>
                    }
                    <div className="mt-5 w-full flex flex-col justify-center">
                        <button className="bg-color-text4 hover:bg-color-bg7 w-full font-bold text-2xl p-3 rounded-2xl"
                            onClick={() => {
                                if (token.data) {
                                    GlobalStore.setBaseTokens({
                                        name: token.data.name,
                                        decimals: token.data.decimals,
                                        symbol: token.data.symbol,
                                        address: token.data.address,
                                        chainId: globalstore.currentChain.id,
                                    })
                                } else {
                                    setSearchParams()
                                }
                            }}
                        >I understand</button>
                        <button className="mt-5 hover:text-white" onClick={() => { setSearchParams() }}>Cancel</button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}