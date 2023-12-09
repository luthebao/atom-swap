import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layout/layout";
import Swap from "./pages/swap";


export default function Router() {

    return (
        <Routes>
            <Route path='/' element={<Layout />}>
                <Route index element={<Navigate to={"/swap"} />} />
                <Route path='*' element={<Swap />} />
            </Route>
        </Routes>
    )
}