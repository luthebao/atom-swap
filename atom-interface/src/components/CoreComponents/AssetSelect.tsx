import React, { useState } from 'react';
import {
    TextField,
    Typography,
    InputAdornment,
    MenuItem,
    Dialog,
    CircularProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import GlobalStore, { CurrencyInputType, Pair, Token } from '../../store/gobalStore';
import { uriToHttp, formatNumber } from '../../configs/utils';
import { useAccount, useBalance, useToken } from 'wagmi';
import { useSnapshot } from 'valtio';
import { isAddress } from 'viem';

export default function AssetSelect({
    type, onSelect, assetValue, data, small, loading
}: {
    type: CurrencyInputType
    onSelect: (t: CurrencyInputType, v: Token) => void
    assetValue: Token | null
    data?: Pair[] | Token[]
    small?: boolean
    loading?: boolean
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState<string>('')

    const openSearch = () => {
        setSearch('')
        setOpen(true)
    };

    const onSearchChanged = async (event: any) => {
        setSearch(event.target.value)
    }

    const onLocalSelect = (type: CurrencyInputType, asset: Token) => {
        setSearch('')
        setOpen(false)
        onSelect(type, asset)
    }

    const onClose = () => {
        setSearch('')
        setOpen(false)
    }

    const allTokens = (data || []).filter(
        (val) => search === "" ||
            val.name.toLowerCase().includes(search.toLowerCase()) ||
            val.symbol.toLowerCase().includes(search.toLowerCase()) ||
            val.address.toLowerCase().includes(search.toLowerCase())
    )



    return (
        <React.Fragment>
            <div className={`cursor-pointer flex ${small ? "p-0" : "p-[18px]"}`}>
                <div style={{
                    margin: "auto"
                }}>
                    <div className="relative flex m-auto">
                        {
                            loading ? <div className={`flex border border-solid border-border rounded-[50px] bg-color-component-input m-auto ${small ? "p-[3px]" : "p-[8px]"}`}>
                                <CircularProgress className='w-full h-full' />
                            </div> :
                                <img
                                    className={`border border-solid border-border rounded-[50px] bg-color-component-input m-auto w-full h-full ${small ? "p-[3px]" : "p-[8px]"}`}
                                    alt=""
                                    src={assetValue ? uriToHttp(assetValue.logoURI || assetValue.symbol)[0] : "/tokens/unknown-logo.png?v=006"}
                                    onClick={openSearch}
                                />}
                    </div>
                </div>
            </div>
            <Dialog onClose={onClose} open={true} ref={null}>
                <div className="p-[10px] max-h-[520px] overflow-y-scroll w-[80vw] md:p-[24px] md:w-[450px]">
                    <div className="flex items-center flex-col gap-4">
                        {data && <div className="flex items-center justify-center">
                            <Typography variant='h2'>Please select token</Typography>
                        </div>}
                        <TextField
                            autoFocus
                            variant="outlined"
                            fullWidth
                            placeholder="ETH, USDT, 0x..."
                            value={search}
                            onChange={onSearchChanged}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>),
                            }}
                        />
                    </div>
                    <div className="w-full flex flex-col mt-[12px]">
                        {
                            allTokens.map((asset, idx) => (
                                <RenderAssetOption
                                    key={`${asset.address}-${idx}`}
                                    type={type}
                                    asset={asset}
                                    onSelect={onLocalSelect}
                                />
                            ))
                        }
                        {
                            allTokens.find(val => val.address === search) === undefined && isAddress(search) && <RenderAssetSearch
                                type={type}
                                address={search}
                                onSelect={onLocalSelect}
                            />
                        }
                    </div>
                </div>
            </Dialog>
        </React.Fragment>
    )
}

const RenderAssetOption = ({
    type, asset, onSelect
}: {
    type: CurrencyInputType
    asset: Token
    onSelect: (t: CurrencyInputType, v: Token) => void
}) => {
    const account = useAccount()
    const balance = useBalance({
        token: asset.address as `0x${string}`,
        address: account.address,
        watch: true,
    })

    return (
        <MenuItem onClick={() => onSelect(type, asset)}>
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
            <div className="flex-1 ml-[48px] flex flex-col items-end">
                <Typography variant='h5' className='truncate'>{formatNumber(balance.data?.formatted || "0")}</Typography>
                <Typography variant='subtitle1' color='textSecondary'>balance</Typography>
            </div>
        </MenuItem>
    )
}

const RenderAssetSearch = ({
    type, address, onSelect
}: {
    type: CurrencyInputType
    address: string
    onSelect: (t: CurrencyInputType, v: Token) => void
}) => {
    const account = useAccount()
    const globalstore = useSnapshot(GlobalStore.state)
    const token = useToken({
        address: address as `0x${string}`,
        chainId: globalstore.currentChain.id,
    })
    const balance = useBalance({
        token: address as `0x${string}`,
        chainId: globalstore.currentChain.id,
        address: account.address,
        watch: true
    })

    if (token.data) {
        const asset: Token = {
            name: token.data.name,
            decimals: token.data.decimals,
            symbol: token.data.symbol,
            address: address,
            chainId: globalstore.currentChain.id,
        }
        return (
            <MenuItem onClick={() => onSelect(type, asset)}>
                <div>
                    <div className="relative mr-[12px]">
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
                <div className="flex-1 ml-[48px] flex flex-col items-end">
                    <Typography variant='h5'>{formatNumber(balance.data?.formatted || "0")}</Typography>
                    <Typography variant='subtitle1' color='textSecondary'>balance</Typography>
                </div>
            </MenuItem>
        )
    }
    return null
}