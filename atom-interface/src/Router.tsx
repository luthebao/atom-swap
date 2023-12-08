import { Navigate, Route, Routes, redirect } from "react-router-dom";
import Layout from "./layout/layout";
import Swap from "./pages/swap";
import { useNetwork } from "wagmi";
import { useEffect } from "react";
import GlobalStore from "./store/gobalStore";


export default function Router() {
    const currentChain = useNetwork()

    useEffect(() => {
        GlobalStore.setCurrentChain(currentChain.chain)
    }, [currentChain.chain])

    useEffect(() => {
    }, [])

    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Navigate to={"/swap"} />} />
                <Route path='*' element={<Swap />} />
            </Route>
        </Routes>
    )
}