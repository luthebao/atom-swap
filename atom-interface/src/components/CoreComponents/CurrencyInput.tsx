import {
    TextField,
    Typography
} from '@material-ui/core';
import { CurrencyInputType, LiquidityInputType, Pair, Quote, SwapInputType, Token } from '../../store/gobalStore';
import { formatNumber } from '../../configs/utils';
import AssetSelect from './AssetSelect';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { useEffect } from 'react';

export default function CurrencyInput({
    type, assetValue, onAssetSelect, amountValue, amountChanged, quote, list, loading
}: {
    type: CurrencyInputType,
    assetValue: Pair | Token | null,
    onAssetSelect: (t: CurrencyInputType, v: Token | Pair) => void,
    amountValue: string,
    amountChanged: (v: string) => void
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
    useEffect(() => {
        if (balance.data && assetValue && typeof loading === "boolean") {
            amountChanged(balance.data.formatted)
        }
    }, [balance, loading, assetValue])

    const isError = balance.data && assetValue !== null && parseUnits(amountValue as `${number}`, assetValue?.decimals || 18) > balance.data.value

    return (
        <div className="mt-[2px] mb-[2px] relative">
            <div className="w-full flex items-center justify-end absolute top-[8px]">
                <div className="flex justify-end pr-[12px] pb-[6px] cursor-pointer">
                    {
                        assetValue && <Typography className="!font-thin !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap onClick={() => {
                            if (type === SwapInputType.FROM || type === LiquidityInputType.ASSET0 || type === LiquidityInputType.ASSET1) {
                                balance.data && amountChanged(balance.data.formatted)
                            }
                        }}>
                            Balance: {formatNumber(formatUnits(balance.data?.value || 0n, assetValue.decimals))}
                        </Typography>
                    }
                </div>
            </div>
            <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input ${(isError && type === SwapInputType.FROM) ? "border-[1px] border-solid border-color-border1" : ""}`}>
                <div className="w-[124px] [124px] h-full flex">
                    <AssetSelect type={type} onSelect={onAssetSelect} assetValue={assetValue} data={list} loading={loading} />
                </div>
                <div className="flex-1 h-full">
                    <TextField
                        placeholder='0.00'
                        fullWidth
                        error={isError && type === SwapInputType.FROM}
                        helperText={isError && type === SwapInputType.FROM && "Invalid balance"}
                        value={amountValue}
                        onChange={(e) => amountChanged(e.target.value)}
                        disabled={type === SwapInputType.TO || type === LiquidityInputType.PAIR}
                        InputProps={{
                            className: "!text-[40px] [@media_screen_and(max-width:576px)]:!text-[36px]"
                        }}
                    />
                    <Typography color='textSecondary' className="!text-[12px] !mt-0 !mb-0">{assetValue?.name} - {assetValue?.symbol}</Typography>
                </div>
            </div>
        </div>
    )
} 