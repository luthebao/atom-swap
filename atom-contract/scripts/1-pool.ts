import { Deployer } from "./helper";
import hre from "hardhat";

interface LAYER0 {
    [name: string]: {
        chainid: number;
        l0endpoint: string;
        uniswap: string
        weth: string
    }
}

const LAYER0ADD: LAYER0 = {
    "goerli": {
        chainid: 10121,
        l0endpoint: "0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23",
        uniswap: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        weth: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
    },
    "baseGoerli": {
        chainid: 10160,
        l0endpoint: "0x6aB5Ae6822647046626e83ee6dB8187151E1d5ab",
        uniswap: "0xe8399bcC8cA1308cE798C2c84eA41b4C5FB51704",
        weth: "0x231401dC8b53338d78c08f83CC4EBc74148196d0"
    }
}

async function main() {


    const accounts = await hre.ethers.getSigners();

    const FeeCollector = await Deployer.deployContract("FeeCollector", [])
    await Deployer.verifyContract(FeeCollector.address, [])

    const FeeHandlerMock = await Deployer.deployContract("FeeHandlerMock", [])
    await Deployer.verifyContract(FeeHandlerMock.address, [])

    const AssetRouter = await Deployer.deployContract("AssetRouter", [
        FeeHandlerMock.address,
        LAYER0ADD[hre.network.name].chainid, // goerli testnet
        FeeCollector.address
    ])
    await Deployer.verifyContract(AssetRouter.address, [
        FeeHandlerMock.address,
        LAYER0ADD[hre.network.name].chainid, // goerli testnet
        FeeCollector.address
    ])

    const Bridge = await Deployer.deployContract("Bridge", [
        LAYER0ADD[hre.network.name].l0endpoint,
        AssetRouter.address
    ])
    await Deployer.verifyContract(Bridge.address, [
        LAYER0ADD[hre.network.name].l0endpoint,
        AssetRouter.address
    ])

    const DEXBAggregatorUniswap = await Deployer.deployContract("DEXBAggregatorUniswap", [])
    await Deployer.verifyContract(DEXBAggregatorUniswap.address, [])

    await DEXBAggregatorUniswap.attach(DEXBAggregatorUniswap.address).initialize(
        AssetRouter.address,
        Bridge.address,
        LAYER0ADD[hre.network.name].uniswap, // uniswap
        LAYER0ADD[hre.network.name].weth, // WETH,
        accounts[0].address
    )


    console.log("//", hre.network.name)
    console.log("// FeeCollector:", FeeCollector.address)
    console.log("// FeeHandlerMock:", FeeHandlerMock.address)
    console.log("// AssetRouter:", AssetRouter.address)
    console.log("// Bridge:", Bridge.address)
    console.log("// DEXBAggregatorUniswap:", DEXBAggregatorUniswap.address)
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