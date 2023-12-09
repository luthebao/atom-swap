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

    const Token = (await ethers.getContractFactory("Token")).attach(DEXB[network].Token)

    await (await Token.approve(DEXB[network].AssetRouter, "115792089237316195423570985008687907853269984665640564039457584007913129639935")).wait(confirmnum)
    console.log("Token approve AssetRouter")

    const AssetRouter = (await ethers.getContractFactory("AssetRouter")).attach(DEXB[network].AssetRouter)

    await (await AssetRouter.deposit(
        account,
        1,
        "2000000000000000000000000000000"
    )).wait(confirmnum)
    console.log("AssetRouter deposit 1")

    for (let index = 0; index < Object.values(DEXB).length; index++) {
        const element = Object.values(DEXB)[index];
        await (await AssetRouter.activateChainPath(
            1,
            element.chainid,
            1
        )).wait(confirmnum)
        console.log("AssetRouter activateChainPath", element.chainid)

        if (element.chainid !== DEXB[network].chainid) {
            await (await AssetRouter.sendVouchers(
                1,
                element.chainid,
                1,
                account,
                {
                    value: "10000000000000000"
                }
            )).wait(confirmnum)
            console.log("AssetRouter deposit 1")
        }
    }


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