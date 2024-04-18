import { DEXB } from "./config";
import { Deployer } from "./helper";
import hre from "hardhat";

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

    const FeeCollector = await deployer.deployContract("FeeCollector", [])
    await deployer.verifyContract(FeeCollector.address, [])

    const FeeHandlerMock = await deployer.deployContract("FeeHandlerMock", [])
    await deployer.verifyContract(FeeHandlerMock.address, [])

    const AssetRouter = await deployer.deployContract("AssetRouter", [
        FeeHandlerMock.address,
        DEXB[network].chainid,
        FeeCollector.address
    ])
    await deployer.verifyContract(AssetRouter.address, [
        FeeHandlerMock.address,
        DEXB[network].chainid,
        FeeCollector.address
    ])

    const Bridge = await deployer.deployContract("Bridge", [
        DEXB[network].endpoint,
        AssetRouter.address
    ])
    await deployer.verifyContract(Bridge.address, [
        DEXB[network].endpoint,
        AssetRouter.address
    ])

    const AggregatorRouter = await deployer.deployContract("AggregatorRouter", [])
    await deployer.verifyContract(AggregatorRouter.address, [])

    const Token = await deployer.deployContract("TestUSD", [])
    await deployer.verifyContract(Token.address, [])

    const AssetV2 = await deployer.deployContract("AssetV2", [
        Token.address,
        "CSM USD",
        "csmUSD"
    ])
    await deployer.verifyContract(AssetV2.address, [
        Token.address,
        "CSM USD",
        "csmUSD"
    ])

    await AggregatorRouter.connect(account).attach(AggregatorRouter.address).initialize(
        AssetRouter.address,
        Bridge.address,
        DEXB[network].uniswap,
        DEXB[network].weth,
        account.address
    )
    console.log("AggregatorRouter initial")

    console.log("//", hre.network.name)
    console.log("// FeeCollector:", FeeCollector.address)
    console.log("// FeeHandlerMock:", FeeHandlerMock.address)
    console.log("// AssetRouter:", AssetRouter.address)
    console.log("// Bridge:", Bridge.address)
    console.log("// AggregatorRouter:", AggregatorRouter.address)
    console.log("// Token:", Token.address)
    console.log("// AssetV2:", AssetV2.address)

    console.log(
        network,
        {
            FeeCollector: FeeCollector.address,
            FeeHandlerMock: FeeHandlerMock.address,
            AssetRouter: AssetRouter.address,
            Bridge: Bridge.address,
            AggregatorRouter: AggregatorRouter.address,
            Token: Token.address,
            AssetV2: AssetV2.address,
        }
    )
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });