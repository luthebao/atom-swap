import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0].address;
    const network = hre.network.name;
    const confirmnum = 1

    console.log(`Submit transactions with account: ${account} on ${network}`)

    const prompt = require('prompt-sync')();
    const iscontinue = prompt("continue (y/n/_): ")
    if (iscontinue !== "y") {
        console.log("end")
        return
    }

    const Token = await ethers.getContractFactory("TestUSD")
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
        await (await AssetRouter.createChainPath(
            1,
            element.chainid,
            1,
            2,
            DEXB[network].AssetV2
        )).wait(confirmnum)
        console.log("AssetRouter createChainPath", element.chainid)
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