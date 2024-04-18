
interface POOL {
    [name: string]: {
        endpoint: string
        chainid: number
        chainrpc: number
        FeeCollector: string
        FeeHandlerMock: string
        AssetRouter: string
        Bridge: string
        AggregatorRouter: string
        Token: string
        AssetV2: string
        uniswap: string
        weth: string
    }
}

export const DEXB: POOL = {
    "goerli": {
        endpoint: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
        chainid: 10121,
        chainrpc: 5,
        FeeCollector: '0x6dDa5B2Cb04eA1d362dF1b45330B41c2F2145701',
        FeeHandlerMock: '0x01e18bfEd51C7DA8F4b70821b5dACD2D58353495',
        AssetRouter: '0xfDdbA0D0f73F7F4D4E288075258F10213A4f7cEE',
        Bridge: '0x9E053Db580C02375D4d4e5962e16A091Ac3FCaB4',
        AggregatorRouter: '0xEB646b2485262f6fc4ebE85D380ff048f9464688',
        Token: '0x2E296ecc1fcC91b9e7A1E8AAFBbC983B11FDFCd4',
        AssetV2: '0xB50D7F1213b2bEcc2f7841B8f685b557439B6023',
        uniswap: "0x43EBC66e9855E04326ADaFE6d24E4d0c3A45e926",
        weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    },
    "baseGoerli": {
        endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
        chainid: 10160,
        chainrpc: 84531,
        FeeCollector: '0x6dDa5B2Cb04eA1d362dF1b45330B41c2F2145701',
        FeeHandlerMock: '0x01e18bfEd51C7DA8F4b70821b5dACD2D58353495',
        AssetRouter: '0xfDdbA0D0f73F7F4D4E288075258F10213A4f7cEE',
        Bridge: '0x9E053Db580C02375D4d4e5962e16A091Ac3FCaB4',
        AggregatorRouter: '0xEB646b2485262f6fc4ebE85D380ff048f9464688',
        Token: '0x2E296ecc1fcC91b9e7A1E8AAFBbC983B11FDFCd4',
        AssetV2: '0xB50D7F1213b2bEcc2f7841B8f685b557439B6023',
        uniswap: "0x43EBC66e9855E04326ADaFE6d24E4d0c3A45e926",
        weth: "0x4200000000000000000000000000000000000006",
    },
    "lineaGoerli": {
        endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
        chainid: 10157,
        chainrpc: 59140,
        FeeCollector: '0x6dDa5B2Cb04eA1d362dF1b45330B41c2F2145701',
        FeeHandlerMock: '0x01e18bfEd51C7DA8F4b70821b5dACD2D58353495',
        AssetRouter: '0xfDdbA0D0f73F7F4D4E288075258F10213A4f7cEE',
        Bridge: '0x9E053Db580C02375D4d4e5962e16A091Ac3FCaB4',
        AggregatorRouter: '0xEB646b2485262f6fc4ebE85D380ff048f9464688',
        Token: '0x2E296ecc1fcC91b9e7A1E8AAFBbC983B11FDFCd4',
        AssetV2: '0xB50D7F1213b2bEcc2f7841B8f685b557439B6023',
        uniswap: "0x7db76d3F000e4dc82D5a17aAB854b53810374823",
        weth: "0x2C1b868d6596a18e32E61B901E4060C872647b6C",
    },
    "zkEVMtestnet": {
        endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
        chainid: 10158,
        chainrpc: 1442,
        FeeCollector: '0x6dDa5B2Cb04eA1d362dF1b45330B41c2F2145701',
        FeeHandlerMock: '0x01e18bfEd51C7DA8F4b70821b5dACD2D58353495',
        AssetRouter: '0xfDdbA0D0f73F7F4D4E288075258F10213A4f7cEE',
        Bridge: '0x9E053Db580C02375D4d4e5962e16A091Ac3FCaB4',
        AggregatorRouter: '0xEB646b2485262f6fc4ebE85D380ff048f9464688',
        Token: '0x2E296ecc1fcC91b9e7A1E8AAFBbC983B11FDFCd4',
        AssetV2: '0xB50D7F1213b2bEcc2f7841B8f685b557439B6023',
        uniswap: "0x43EBC66e9855E04326ADaFE6d24E4d0c3A45e926",
        weth: "0x2ad78787CCaf7FA8FAe8953FD78ab9163f81DcC8",
    },
    "opGoerli": {
        endpoint: "0xae92d5aD7583AD66E49A0c67BAd18F6ba52dDDc1",
        chainid: 10132,
        chainrpc: 420,
        FeeCollector: '0x6dDa5B2Cb04eA1d362dF1b45330B41c2F2145701',
        FeeHandlerMock: '0x01e18bfEd51C7DA8F4b70821b5dACD2D58353495',
        AssetRouter: '0xfDdbA0D0f73F7F4D4E288075258F10213A4f7cEE',
        Bridge: '0x9E053Db580C02375D4d4e5962e16A091Ac3FCaB4',
        AggregatorRouter: '0xEB646b2485262f6fc4ebE85D380ff048f9464688',
        Token: '0x2E296ecc1fcC91b9e7A1E8AAFBbC983B11FDFCd4',
        AssetV2: '0xB50D7F1213b2bEcc2f7841B8f685b557439B6023',
        uniswap: "0x43EBC66e9855E04326ADaFE6d24E4d0c3A45e926",
        weth: "0x4200000000000000000000000000000000000006",
    },
}