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

    const Token = (await ethers.getContractFactory("TestUSD")).attach(DEXB[network].Token)

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
            console.log("AssetRouter sendVouchers 2")
        }
    }


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });