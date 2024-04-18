import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";



async function main() {
    const accounts = await hre.ethers.getSigners();
    const account_num = 2
    const confirmnum = 2

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

    const Token = (await ethers.getContractFactory("TestUSD")).connect(account).attach(DEXB[network].Token)
    const IUniswapV2Router02 = await ethers.getContractAt("IUniswapV2Router02", DEXB[network].uniswap)

    await (await Token.connect(account).approve(DEXB[network].uniswap, "115792089237316195423570985008687907853269984665640564039457584007913129639935")).wait(confirmnum)
    console.log(`Token approve IUniswapV2Router02`)


    await (await IUniswapV2Router02.connect(account).addLiquidityETH(
        DEXB[network].Token,
        "2000000000000000000000000",
        0,
        0,
        account.address,
        Math.floor(Date.now() / 1000) + 2 * 60,
        {
            value: "100000000000000000000"
        }
    )).wait(confirmnum)
    console.log(`IUniswapV2Router02 add 100 ETH Liquidity Token`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });