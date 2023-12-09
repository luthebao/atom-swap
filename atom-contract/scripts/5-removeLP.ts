import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";



async function main() {
    const accounts = await hre.ethers.getSigners();
    const account = accounts[0].address;
    const network = hre.network.name;
    const confirmnum = 2
    console.log(`Submit transactions with account: ${account} on ${network}`)

    const prompt = require('prompt-sync')();
    const iscontinue = prompt("continue (y/n/_): ")
    if (iscontinue !== "y") {
        console.log("end")
        return
    }

    // const Token = (await ethers.getContractFactory("TestUSD")).attach(DEXB[network].Token)
    // const IUniswapV2Router02 = await ethers.getContractAt("IUniswapV2Router02", DEXB[network].uniswap)
    // const balance = await Token.balanceOf(account)

    // await (await IUniswapV2Router02.swapExactTokensForETH(
    //     balance,
    //     0,
    //     [DEXB[network].Token, DEXB[network].weth],
    //     account,
    //     Math.floor(Date.now() / 1000) + 2 * 60
    // )).wait(confirmnum)
    // console.log(`Sold Token`)

    // const [owner] = await ethers.getSigners()
    // const amount_eth = await owner.getBalance()

    // await owner.sendTransaction({
    //     to: "0x4440e5786FF84737b45da12a0976cE0135e46f99",
    //     value: amount_eth,
    // });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });