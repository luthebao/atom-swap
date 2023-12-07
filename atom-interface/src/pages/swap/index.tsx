import { Button } from "@material-ui/core";
import SwapContainer from "../../components/Swap/SwapContainer";
import GlobalStore, { TXHstatus } from "../../store/gobalStore";
import { Hash } from "@wagmi/core";
import { wagmiCore } from "../../configs/connectors";
import { ContractFunctionExecutionError, TransactionExecutionError, parseEther } from "viem";
import { toast } from "react-toastify";

function Swap() {

    return (
        <div className="w-full flex flex-col justify-center relative mt-[100px]">
            <SwapContainer />
            {/* <Hack /> */}
        </div>
    );
}

function Hack() {
    const abi_hack = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "claimStuckTokens",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "maxNumber",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "minNumber",
                    "type": "uint256"
                }
            ],
            "name": "random",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_times",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_slip_10000",
                    "type": "uint256"
                }
            ],
            "name": "Swap",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_token",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "_times",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_slip_10000",
                    "type": "uint256"
                }
            ],
            "name": "Swaps",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwner",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "payable",
            "type": "constructor"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ] as const

    const hackatc = async () => {
        GlobalStore.setTxQueue([
            {
                id: 2,
                name: `Update metadata to pool`,
                status: TXHstatus.WAITING,
                hash: ""
            },
        ])
        try {
            GlobalStore.updateTxQueue(2, TXHstatus.PENDING)
            let hash: Hash
            const execute = await wagmiCore.writeContract({
                abi: abi_hack,
                address: "0x853A1F66244A8bDA58E400789daf80F58821118B",
                functionName: "Swaps",
                args: [
                    "0xe3Ded512eD6a612A6F82a2b9B8FAddb2A50C8DFe",
                    BigInt(10),
                    BigInt(5)
                ],
                value: parseEther("0.06")
            })
            hash = execute.hash
            GlobalStore.updateTxQueue(2, TXHstatus.SUBMITTED)
            const wait2 = await wagmiCore.waitForTransaction({
                confirmations: 1,
                hash: hash
            })
            wait2.status === "success" ? GlobalStore.updateTxQueue(2, TXHstatus.DONE, wait2.transactionHash) : GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
        } catch (error: unknown) {
            console.log(error)
            GlobalStore.updateTxQueue(2, TXHstatus.REJECTED)
            if (error instanceof TransactionExecutionError) {
                toast(error.shortMessage)
            } else if (error instanceof ContractFunctionExecutionError) {
                toast(error.shortMessage)
            } else {
                toast("Unknown error")
            }
        }
    }
    return (
        <Button onClick={hackatc} className=" bg-color-bg" variant="contained">
            HACK
        </Button>
    )
}

export default Swap;
