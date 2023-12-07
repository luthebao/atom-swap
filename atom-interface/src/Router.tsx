import { Navigate, Route, Routes, redirect } from "react-router-dom";
import Layout from "./layout/layout";
import Swap from "./pages/swap";
import { useNetwork } from "wagmi";
import { useEffect } from "react";
import GlobalStore from "./store/gobalStore";
import Liquidity from "./pages/liquidity";
import LiquidityDeposit from "./components/Liquidity/deposit/LiquidityDeposit";
import LiquidityWithdraw from "./components/Liquidity/withdraw/LiquidityWithdraw";
import Locker from "./pages/locker";
import LockerCreator from "./pages/locker/create";
import LockInfo from "./pages/locker/token";
import LockRecordInfo from "./pages/locker/record";
import Launchpad from "./pages/launchpad";
import LaunchpadCreator from "./pages/launchpad/create";
import LaunchPool from "./pages/launchpad/pool";


export default function Router() {
    const currentChain = useNetwork()

    useEffect(() => {
        GlobalStore.setCurrentChain(currentChain.chain)
    }, [currentChain.chain])

    useEffect(() => {
        GlobalStore.loadBaseTokens()
    }, [])

    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Navigate to={"/swap"} />} />
                <Route path='swap' element={<Swap />} />

                <Route element={<Liquidity />} >
                    <Route path='liquidity' element={<LiquidityDeposit />} />
                    <Route path='pair' element={<LiquidityWithdraw />}>
                        <Route path=':pairaddress' element={<LiquidityWithdraw />} />
                    </Route>
                </Route>
                <Route path="locker">
                    <Route index element={<Locker />} />
                    <Route path="create" element={<LockerCreator />} />
                    <Route path=":tokenaddress" element={<LockInfo />} />
                    <Route path="record">
                        <Route path=":recordid" element={<LockRecordInfo />} />
                    </Route>
                </Route>
                <Route path="launchpad">
                    <Route index element={<Launchpad />} />
                    <Route path="create" element={<LaunchpadCreator />} />
                    <Route path=":pooladdress" element={<LaunchPool />} />
                </Route>
                <Route path='*' element={<Swap />} />
            </Route>
        </Routes>
    )
}