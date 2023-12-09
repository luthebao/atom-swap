import { Deployer } from "./helper";
import hre from "hardhat";

interface LAYER0 {
    [name: string]: {
        chainid: number;
        chainrpc: number;
        l0endpoint: string;
        uniswap: string
        weth: string
    }
}

const LAYER0ADD: LAYER0 = {
    "goerli": {
        chainid: 10121,
        chainrpc: 5,
        l0endpoint: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
        uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
    },
    "baseGoerli": {
        chainid: 10160,
        chainrpc: 84531,
        l0endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
        uniswap: "0x48e62E03D4683D9193797209EC3fA8aA3Bc90BC6",
        weth: "0x4200000000000000000000000000000000000006"
    }
}

async function main() {
    const accounts = await hre.ethers.getSigners();
    const network = hre.network.name

    const FeeCollector = await Deployer.deployContract("FeeCollector", [])
    await Deployer.verifyContract(FeeCollector.address, [])

    const FeeHandlerMock = await Deployer.deployContract("FeeHandlerMock", [])
    await Deployer.verifyContract(FeeHandlerMock.address, [])

    const AssetRouter = await Deployer.deployContract("AssetRouter", [
        FeeHandlerMock.address,
        LAYER0ADD[network].chainid, // goerli testnet
        FeeCollector.address
    ])
    await Deployer.verifyContract(AssetRouter.address, [
        FeeHandlerMock.address,
        LAYER0ADD[network].chainid, // goerli testnet
        FeeCollector.address
    ])

    const Bridge = await Deployer.deployContract("Bridge", [
        LAYER0ADD[network].l0endpoint,
        AssetRouter.address
    ])
    await Deployer.verifyContract(Bridge.address, [
        LAYER0ADD[network].l0endpoint,
        AssetRouter.address
    ])

    const DEXBAggregatorUniswap = await Deployer.deployContract("DEXBAggregatorUniswap", [])
    await Deployer.verifyContract(DEXBAggregatorUniswap.address, [])

    const Token = await Deployer.deployContract("Token", [])
    await Deployer.verifyContract(Token.address, [])

    const AssetV2 = await Deployer.deployContract("AssetV2", [
        Token.address,
        "CSM USD",
        "csmUSD"
    ])
    await Deployer.verifyContract(AssetV2.address, [
        Token.address,
        "CSM USD",
        "csmUSD"
    ])

    await DEXBAggregatorUniswap.attach(DEXBAggregatorUniswap.address).initialize(
        AssetRouter.address,
        Bridge.address,
        LAYER0ADD[network].uniswap, // uniswap
        LAYER0ADD[network].weth, // WETH,
        accounts[0].address
    )


    console.log("//", hre.network.name)
    console.log("// FeeCollector:", FeeCollector.address)
    console.log("// FeeHandlerMock:", FeeHandlerMock.address)
    console.log("// AssetRouter:", AssetRouter.address)
    console.log("// Bridge:", Bridge.address)
    console.log("// DEXBAggregatorUniswap:", DEXBAggregatorUniswap.address)
    console.log("// Token:", Token.address)
    console.log("// AssetV2:", AssetV2.address)

    console.log(
        network,
        {
            chainid: LAYER0ADD[network].chainid,
            chainrpc: LAYER0ADD[network].chainrpc,
            FeeCollector: FeeCollector.address,
            FeeHandlerMock: FeeHandlerMock.address,
            AssetRouter: AssetRouter.address,
            Bridge: Bridge.address,
            DEXBAggregatorUniswap: DEXBAggregatorUniswap.address,
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