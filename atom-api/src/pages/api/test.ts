import { DEXB } from '@/utils/config'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const Chain = DEXB[10121]

        const trans = await Chain.client.getTransactionReceipt({
            hash: "0x4563d228cf9d47696e1e2eee4a5353e6eac7583e4f7166f8a93ddb4eee7bf5e0",
        })
        console.log(trans)

        const logs = await Chain.client.getLogs({
            address: "0x71f38672b26497047c118f0ad1655429391e2a83",
            fromBlock: BigInt(10232246)
        })
        console.log(logs)

        res.status(200).json({ trans: "trans" })
    } catch (error) {
        console.log(error)
        res.status(400).json({ name: 'John Doe' })
    }
}

