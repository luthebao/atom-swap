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


    console.log("//", hre.network.name)
    console.log("// Token:", Token.address)
    console.log("// AssetV2:", AssetV2.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


// goerli
// Token: 0x2F1Dc3e170afF5dD3AFFc2dBBbF5bC5a4385b2Cc
// AssetV2: 0x42457E843Cd0F03435062aF0882b80E221645b51


// baseGoerli
// Token: 0x9f2A50A859Eaded1c80116c4384378d056839ABB
// AssetV2: 0x737873BC769682533181fF35E3d4C7C132d76d2D