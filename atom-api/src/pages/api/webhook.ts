import { ABI_DEXB } from '@/utils/abis';
import { DEXB, POOL, POOLITEM, account } from '@/utils/config';
import type { NextApiRequest, NextApiResponse } from 'next'
import { Address } from 'viem';

interface ContinueSwap {
    id: Address
    l0chainid: number
    srcChainId: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        let logs!: ContinueSwap
        const array: POOLITEM[] = Object.values(DEXB)
        for (let index = 0; index < array.length; index++) {
            const element = array[index]
            const currentblock = await element.client.getBlockNumber()
            const logs0 = await element.client.getLogs({
                address: element.DEXBAggregatorUniswap,
                event: {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "bytes32",
                            "name": "id",
                            "type": "bytes32"
                        }
                    ],
                    "name": "NewPendingSwap",
                    "type": "event"
                },
                fromBlock: currentblock - BigInt(500),
                toBlock: "latest",
            })

            let continueSwap!: ContinueSwap
            for (let i2 = 0; i2 < logs0.length; i2++) {
                const elm = logs0[i2]
                const ctread = await element.client.readContract({
                    address: element.DEXBAggregatorUniswap,
                    abi: ABI_DEXB,
                    functionName: "pendingSwaps",
                    args: [elm.data]
                })
                const dstChainId = ctread[5]
                const dstELM = DEXB[dstChainId]

                const iscontinuedSwaps = await dstELM.client.readContract({
                    address: dstELM.DEXBAggregatorUniswap,
                    abi: ABI_DEXB,
                    functionName: "continuedSwaps",
                    args: [element.l0chainid, elm.data]
                })
                console.log(iscontinuedSwaps)
                if (!iscontinuedSwaps) {
                    continueSwap = {
                        id: elm.data,
                        l0chainid: dstELM.l0chainid,
                        srcChainId: element.l0chainid
                    }
                    break
                }
            }
            if (continueSwap !== undefined) {
                try {
                    const result = await DEXB[continueSwap.l0chainid].client.simulateContract({
                        address: DEXB[continueSwap.l0chainid].DEXBAggregatorUniswap,
                        abi: ABI_DEXB,
                        functionName: "continueSwap",
                        args: [{
                            srcChainId: logs.srcChainId,
                            id: continueSwap.id
                        }],
                        account: account
                    })
                    await DEXB[logs.l0chainid].wallet.writeContract(result.request)
                    logs = continueSwap
                    break
                } catch (error) {
                    continue
                }
            }
        }
        res.status(200).json({ logs: logs })
    } catch (error) {
        console.log(error)
        res.status(400).json({ name: 'John Doe' })
    }
}

