import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre, { ethers } from "hardhat";

async function main() {
    const accounts = await hre.ethers.getSigners();
    const account_num = 1
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

    const WETH = (await ethers.getContractFactory("WETH9")).connect(account).attach(DEXB[network].weth)

    const SwapFactory = await deployer.deployContract("SwapFactory", []) // (await ethers.getContractFactory("SwapFactory")).connect(account).attach("0x1f2ec0479de4bcf4f73681cfded40bc9b367002e") // 
    await deployer.verifyContract(SwapFactory.address, [])
    const SwapRouter = await deployer.deployContract("SwapRouter", [SwapFactory.address, WETH.address])
    await deployer.verifyContract(SwapRouter.address, [SwapFactory.address, WETH.address])
    console.log("SwapRouter:", SwapRouter.address)

    // const TestUSD = await Deployer.deployContract("TestUSD", [])
    // await Deployer.verifyContract(TestUSD.address, [])

    // const TestUSDCA = (await ethers.getContractFactory("TestUSD")).attach("0xCCb999a63386B3afA72caf9F6A7e18E346c3c461")
    // const SwapRouterCA = (await ethers.getContractFactory("SwapRouter")).attach("0xF76A6C9aD46D5ef75D0203c420EE03090e5221A2")

    // await (await SwapRouterCA.swapExactETHForTokens(
    //     0,
    //     [WETH.address, TestUSDCA.address],
    //     account,
    //     Math.floor(Date.now() / 1000) + 2 * 60,
    //     {
    //         value: "10000000000000000"
    //     }
    // )).wait(confirmnum)
    // console.log("swaped")


    // await (await TestUSDCA.approve(SwapRouterCA.address, "115792089237316195423570985008687907853269984665640564039457584007913129639935")).wait(confirmnum)
    // console.log("approved")
    // await (await SwapRouterCA.addLiquidityETH(
    //     TestUSDCA.address,
    //     "10000000000000",
    //     0,
    //     0,
    //     account,
    //     Math.floor(Date.now() / 1000) + 2 * 60,
    //     {
    //         value: "10000000000000000"
    //     }
    // )).wait(confirmnum)
    // console.log("added")


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });