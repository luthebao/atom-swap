import {
    TextField,
    Typography
} from '@material-ui/core';
import { CurrencyInputType, Pair, Quote, Token } from '../../store/gobalStore';
import { formatNumber } from '../../configs/utils';
import AssetSelect from './AssetSelect';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

export default function CurrencyInfor({
    type, assetValue, onAssetSelect, list, loading
}: {
    type: CurrencyInputType,
    assetValue: Pair | Token | null,
    onAssetSelect: (t: CurrencyInputType, v: Token | Pair) => void,
    quote?: Quote
    list?: Token[] | Pair[]
    loading?: boolean
}) {
    const account = useAccount()
    const balance = useBalance({
        token: assetValue?.address as `0x${string}`,
        address: account.address,
        watch: true
    })

    return (
        <div className="mt-[2px] mb-[2px] relative">
            <div className="w-full flex items-center justify-end absolute top-[8px]">
                <div className="flex justify-end pr-[12px] pb-[6px] cursor-pointer">
                    {
                        assetValue && <Typography className="!font-thin !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap>
                            Balance: {formatNumber(formatUnits(balance.data?.value || 0n, assetValue.decimals))}
                        </Typography>
                    }
                </div>
            </div>
            <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-bg`}>
                <div className="w-[124px] [124px] h-full flex">
                    <AssetSelect type={type} onSelect={onAssetSelect} assetValue={assetValue} data={list} loading={loading} />
                </div>
                <div className="flex-1 h-full">
                    <TextField
                        fullWidth
                        value={assetValue?.name || "Please choose token"}
                        disabled={true}
                        InputProps={{
                            className: "!text-[40px] [@media_screen_and(max-width:576px)]:!text-[36px] disabled:text-color-text2"
                        }}
                    />
                    <Typography color='textSecondary' className="!text-[12px] !mt-0 !mb-0">{assetValue?.symbol}</Typography>
                </div>
            </div>
        </div>
    )
} 