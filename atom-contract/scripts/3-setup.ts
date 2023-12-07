import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";

interface POOL {
    [name: string]: {
        chainid: number
        chainrpc: number
        FeeCollector: string;
        FeeHandlerMock: string;
        AssetRouter: string
        Bridge: string
        DEXBAggregatorUniswap: string
        Token: string
        AssetV2: string
    }
}

const DEXB: POOL = {
    "goerli": {
        chainid: 10121,
        chainrpc: 5,
        FeeCollector: "0x355b0A841c702389bD69dbEbbFa24d0Bd70B5b9F",
        FeeHandlerMock: "0xf1fc310F6D2B68874bcEf2BA888bDd578A6eEAd6",
        AssetRouter: "0xAf774b5Ef94e74C3552A031dC844BdDebf508f57",
        Bridge: "0xAEC785255E9FC504d9949A7f01B303acDb9E9F41",
        DEXBAggregatorUniswap: "0xF18B5EfCd4d6EfCb5B5585536AadE4CFFB7847Fc",
        Token: "0x2F1Dc3e170afF5dD3AFFc2dBBbF5bC5a4385b2Cc",
        AssetV2: "0x42457E843Cd0F03435062aF0882b80E221645b51"
    },
    "baseGoerli": {
        chainid: 10160,
        chainrpc: 84531,
        FeeCollector: "0xd3deDCf3d07E4E3657C8022a7fdCE2E54ab9803B",
        FeeHandlerMock: "0xb45A16aA48B58Ba3090821184B76e2A9e0EE242A",
        AssetRouter: "0xa2D448B691a97FA5aCC5cFDfe14dD8D5927aa6f2",
        Bridge: "0x5D7448DC945783d7Ea7B0726306ef715bC2486C2",
        DEXBAggregatorUniswap: "0x71803af23F3be02311490A2a6C479c880ef5d48d",
        Token: "0x9f2A50A859Eaded1c80116c4384378d056839ABB",
        AssetV2: "0x737873BC769682533181fF35E3d4C7C132d76d2D",
    }
}

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0].address;
    const network = hre.network.name;
    const confirmnum = 2


    const Token = await ethers.getContractFactory("Token")
    await (await Token.attach(DEXB[network].Token).mint(DEXB[network].AssetV2, "1000000000000000000000000")).wait(confirmnum)
    console.log("mint token to AssetV2", DEXB[network].AssetV2)

    const AssetV2 = await ethers.getContractFactory("AssetV2")
    await (await AssetV2.attach(DEXB[network].AssetV2).grantRole("0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2", DEXB[network].AssetRouter)).wait(confirmnum)
    console.log("AssetV2 grantRole ", DEXB[network].AssetRouter)

    const Bridge = (await ethers.getContractFactory("Bridge")).attach(DEXB[network].Bridge)

    await (await Bridge.grantRole("0x7a05a596cb0ce7fdea8a1e1ec73be300bdb35097c944ce1897202f7a13122eb2", DEXB[network].AssetRouter)).wait(confirmnum)
    console.log("Bridge grantRole AssetRouter", DEXB[network].AssetRouter)

    for (let index = 0; index < Object.values(DEXB).length; index++) {
        const element = Object.values(DEXB)[index];
        await (await Bridge.setGasAmount(element.chainid, 1, 500000)).wait(confirmnum);
        await (await Bridge.setGasAmount(element.chainid, 2, 500000)).wait(confirmnum);
        console.log("setGasAmount for chain:", element.chainid);

        await (await Bridge.setBridge(element.chainid, element.Bridge)).wait(confirmnum);
        console.log("setBridge for chain:", element.chainid);
    }

    const AssetRouter = (await ethers.getContractFactory("AssetRouter")).attach(DEXB[network].AssetRouter)

    await (await AssetRouter.grantRole("0x52ba824bfabc2bcfcdf7f0edbb486ebb05e1836c90e78047efeb949990f72e5f", DEXB[network].Bridge)).wait(confirmnum)
    console.log("AssetRouter grantRole Bridge", DEXB[network].Bridge)

    await (await AssetRouter.setBridge(DEXB[network].Bridge)).wait(confirmnum)
    console.log("AssetRouter setBridge", DEXB[network].Bridge)

    for (let index = 0; index < Object.values(DEXB).length; index++) {
        const element = Object.values(DEXB)[index];
        if (element.chainid === DEXB[network].chainid) {
            await (await AssetRouter.createChainPath(
                1,
                element.chainid,
                1,
                2,
                element.AssetV2
            )).wait(confirmnum)
            console.log("AssetRouter createChainPath native")
        } else {
            await (await AssetRouter.createChainPath(
                1,
                element.chainid,
                1,
                2,
                element.AssetRouter
            )).wait(confirmnum)
            console.log("AssetRouter createChainPath", element.chainid)
        }
    }

    const DEXBAggregatorUniswap = (await ethers.getContractFactory("DEXBAggregatorUniswap")).attach(DEXB[network].DEXBAggregatorUniswap)

    await (await DEXBAggregatorUniswap.grantRole("0x9e7a659985ff60e88bae893a3fd5287022761d563f4077249c341daf2ac6e085", account)).wait(confirmnum)
    console.log("DEXBAggregatorUniswap grantRole Continue")

    await (await DEXBAggregatorUniswap.setAggregatorInfos(
        Object.values(DEXB).map((val) => {
            return {
                srcAggregatorAddress: val.DEXBAggregatorUniswap,
                l0ChainId: val.chainid,
                chainId: val.chainrpc
            }
        })
    )).wait(confirmnum)
    console.log("DEXBAggregatorUniswap setAggregatorInfos")

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// goerli
// FeeCollector: 0x355b0A841c702389bD69dbEbbFa24d0Bd70B5b9F
// FeeHandlerMock: 0xf1fc310F6D2B68874bcEf2BA888bDd578A6eEAd6
// AssetRouter: 0xAf774b5Ef94e74C3552A031dC844BdDebf508f57
// Bridge: 0xAEC785255E9FC504d9949A7f01B303acDb9E9F41
// DEXBAggregatorUniswap: 0xF18B5EfCd4d6EfCb5B5585536AadE4CFFB7847Fc


// baseGoerli
// FeeCollector: 0xd3deDCf3d07E4E3657C8022a7fdCE2E54ab9803B
// FeeHandlerMock: 0xb45A16aA48B58Ba3090821184B76e2A9e0EE242A
// AssetRouter: 0xa2D448B691a97FA5aCC5cFDfe14dD8D5927aa6f2
// Bridge: 0x5D7448DC945783d7Ea7B0726306ef715bC2486C2
// DEXBAggregatorUniswap: 0x71803af23F3be02311490A2a6C479c880ef5d48d