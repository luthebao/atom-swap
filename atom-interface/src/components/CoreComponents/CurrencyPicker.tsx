import { TextField, Typography } from "@material-ui/core"
import AssetSelect from "./AssetSelect"
import { CurrencyInputType, Quote, Token } from "../../store/gobalStore"

const CurrencyPicker = ({
    type, assetValue, onAssetSelect, amountValue, amountChanged, quote, list
}: {
    type: CurrencyInputType,
    assetValue: Token | null,
    onAssetSelect: (t: CurrencyInputType, v: Token) => void,
    amountValue: string,
    amountChanged: (v: string) => void
    quote?: Quote
    list?: Token[]
}) => {
    return (
        <div className="mb-[4px] relative">
            <div className="flex flex-wrap rounded-[10px] w-full items-center bg-color-component-input min-h-[50px]">
                <div className="w-[74px] min-h-[50px] h-full">
                    <div className="p-[12px] h-[74px]">
                        <AssetSelect type={type} onSelect={onAssetSelect} assetValue={assetValue} data={list} small />
                    </div>
                </div>
                <div className="flex-1 h-full">
                    <TextField
                        placeholder='0.00'
                        fullWidth
                        value={amountValue}
                        disabled={true}
                        InputProps={{
                            className: "!text-[32px]",
                        }}
                    />
                    <Typography color='textSecondary' className="!text-[10px] !-mt-[5px] !mb-[5px] !truncate">{assetValue?.name} - {assetValue?.symbol}</Typography>
                </div>
            </div>
        </div>
    )
}

export default CurrencyPicker