import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account_num = 2
    const confirmnum = 3

    const account = accounts[account_num];
    const network = hre.network.name
    console.log(`Submit transactions with account: ${account.address} on ${network}`)

    const deployer = new Deployer(account_num, confirmnum)

    const prompt = require('prompt-sync')();
    const iscontinue = prompt("continue (y/n/_): ")
    if (iscontinue !== "y") {
        console.log("end")
        return
    }

    // const Token = (await ethers.getContractFactory("TestUSD")).connect(account).attach(DEXB[network].Token)

    // await (await Token.approve(DEXB[network].AssetRouter, "115792089237316195423570985008687907853269984665640564039457584007913129639935")).wait(confirmnum)
    console.log("Token approve AssetRouter")

    const AssetRouter = (await ethers.getContractFactory("AssetRouter")).connect(account).attach(DEXB[network].AssetRouter)

    // await (await AssetRouter.deposit(
    //     account.address,
    //     1,
    //     "2000000000000000000000000000000"
    // )).wait(confirmnum)
    // console.log("AssetRouter deposit 1")

    for (let index = 0; index < Object.values(DEXB).length; index++) {
        const element = Object.values(DEXB)[index];
        try {
            await (await AssetRouter.activateChainPath(
                1,
                element.chainid,
                1
            )).wait(confirmnum)
            console.log("AssetRouter activateChainPath", element.chainid)
        } catch (error) {
            console.log("err AssetRouter activateChainPath", element.chainid, error)
        }


        if (element.chainid !== DEXB[network].chainid) {
            try {
                await (await AssetRouter.sendVouchers(
                    1,
                    element.chainid,
                    1,
                    account.address,
                    {
                        value: "10000000000000000"
                    }
                )).wait(confirmnum)
                console.log("AssetRouter sendVouchers 2")
            } catch (error) {
                console.log("err AssetRouter sendVouchers 2", error)
            }

        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });