import {
    TextField,
    Typography
} from '@material-ui/core';
import { Pair, Token } from '../../store/gobalStore';
import { formatNumber } from '../../configs/utils';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

export default function TokenAmountInput({
    title, assetValue, amountValue, amountChanged, required = true
}: {
    title: string
    assetValue: Pair | Token | null,
    amountValue: string,
    amountChanged: (v: string) => void
    required?: boolean
}) {
    const account = useAccount()
    const balance = useBalance({
        token: assetValue?.address as `0x${string}`,
        address: account.address,
        watch: true
    })

    const isError = balance.data && assetValue !== null && parseUnits(amountValue as `${number}`, assetValue?.decimals || 18) > balance.data.value

    return (
        <div className="mt-[2px] mb-[2px] relative">
            <div className="w-full flex items-center justify-start absolute top-[4px]">
                <div className="flex pl-[12px] cursor-pointer">
                    <Typography className="!font-thin !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap>
                        {title}
                    </Typography>
                </div>
            </div>
            <div className="w-full flex items-center justify-end absolute top-[4px]">
                <div className="flex justify-end pr-[12px] pb-[6px] cursor-pointer">
                    {
                        assetValue && <Typography className="!font-thin !text-[12px] text-color-text2 !mr-[6px] !mt-[6px]" noWrap>
                            Balance: {formatNumber(formatUnits(balance.data?.value || 0n, assetValue.decimals))}
                        </Typography>
                    }
                </div>
            </div>
            <div className={`flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input ${(isError) ? "border-[1px] border-solid border-color-border1" : ""}`}>
                <div className="flex-1 h-full">
                    <TextField
                        required={required}
                        placeholder='0.00'
                        fullWidth
                        error={isError}
                        value={amountValue}
                        onChange={(e) => amountChanged(e.target.value)}
                        InputProps={{
                            className: "!text-[26px] pl-5 pt-5"
                        }}
                    />
                    <Typography color='textSecondary' className="!text-[12px] px-5 !mt-0 !mb-1">{assetValue?.name} - {assetValue?.symbol}</Typography>
                </div>
            </div>
        </div>
    )
} 