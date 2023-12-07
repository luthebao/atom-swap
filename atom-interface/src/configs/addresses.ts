import { goerli, lineaTestnet, } from "viem/chains"

export type AddressMap = { [chainId: number]: `0x${string}` }
export type DextoolMap = { [chainId: number]: string }

export const DEXTOOLS: DextoolMap = {
    [goerli.id]: "https://www.dextools.io/app/en/ethergoerli/pair-explorer/",
}

export const WETH: AddressMap = {
    [lineaTestnet.id]: "0x2C1b868d6596a18e32E61B901E4060C872647b6C",
}

export const TREASURY_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0x171c36da7e5cFa0426dc6152020e87755A6271b9",
}

export const FACTORY_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0x89048366dA528cd3C54Cef2A2793b67A61c74D69",
}

export const ROUTER_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0x11406be0999feFE2847C30c8dDd067A5d9b7da0e",
}

export const LOCKER_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0xaF1AD1933b2cF4453861D17724133528deFaa83F",
}

export const STORAGE_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0x77FF34392AacB8cf0C416f38C93053b77145E424",
}

export const LAUNCHFACTORY_ADDRESS: AddressMap = {
    [lineaTestnet.id]: "0x152b306F7782c0Cb9E73d248b1283EB90C36ac84",
}