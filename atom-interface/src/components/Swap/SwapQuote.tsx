import { useSnapshot } from "valtio"
import GlobalStore from "../../store/gobalStore"
import { parseUnits } from "viem"
import { MdRefresh } from "react-icons/md"
import { IconButton } from "@material-ui/core"



const SwapQuote = ({
    loading, refresh
}: {
    loading: boolean
    refresh: () => void
}) => {

    const glbstore = useSnapshot(GlobalStore.state)

    return (
        <div className="relative px-3 pt-2 pb-3">
            <div className={`flex flex-col w-full gap-2`}>
                <div className="flex justify-between border border-[#4a4a4a] p-2 h-[58px] items-center gap-2 md:min-w-[180px] rounded-[10px] select-none">
                    <div className="flex gap-2 mr-3">
                        <div className='text-base'>
                            Swap rate
                        </div>
                    </div>
                    {glbstore.fromToken && glbstore.toToken && <div className="flex flex-end items-center">
                        <span>1 {glbstore.fromToken.symbol} = {(Number(glbstore.toAmount) / Number(glbstore.fromAmount)).toString()} {glbstore.toToken.symbol} </span>
                        <IconButton className="" onClick={refresh} disabled={loading}>
                            <MdRefresh className={`text-2xl ${loading ? "animate-spin" : ""}`} />
                        </IconButton>
                    </div>}
                </div>
                <div className="flex justify-between border border-[#4a4a4a] p-2 h-[58px] items-center gap-2 md:min-w-[180px] rounded-[10px] select-none">
                    <div className="flex gap-2 mr-3">
                        <div className='text-base'>
                            Swap fee
                        </div>
                    </div>
                    <div className="flex flex-end items-center">
                        <span>0 ETH</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SwapQuote