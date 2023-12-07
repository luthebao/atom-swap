import { Paper, Grid, Typography } from '@material-ui/core'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function Liquidity() {

    const router = useNavigate();
    const location = useLocation()

    const onBack = () => {
        router('/liquidity')
    }

    const toggleDeposit = () => {
        router('/liquidity')
    }

    const toggleWithdraw = () => {
        router('/pair')
    }


    return (
        <div className="relative mt-[50px]">
            <Paper elevation={0} className="flex flex-col items-start m-auto max-w-[485px]">
                <div className="flex flex-col w-full rounded-tl-[9px] rounded-br-[0] rounded-tr-[9px] rounded-bl-[0] !bg-color-component-tab !text-color-text">
                    <Grid container spacing={0}>
                        <Grid item lg={6} md={6} sm={6} xs={6}>
                            <Paper className={`${location.pathname.includes("liquidity") ? "!bg-none !text-color-text" : "!rounded-none flex-[1] !transition-none opacity-100 !bg-color-component-tab"} !rounded-tl-[8px] !rounded-br-[0] !rounded-tr-[8px] !rounded-bl-[0] w-full min-h-[50px] flex items-center justify-center !shadow-none [box-shadow:none!important] cursor-pointer`} onClick={toggleDeposit} >
                                <Typography variant='h5'>Deposit</Typography>
                            </Paper>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={6}>
                            <Paper className={`${location.pathname.includes("pair") ? "!bg-none !text-color-text" : "!rounded-none flex-[1] !transition-none opacity-100 !bg-color-component-tab"} !rounded-tl-[8px] !rounded-br-[0] !rounded-tr-[8px] !rounded-bl-[0] w-full min-h-[50px] flex items-center justify-center [box-shadow:none!important] cursor-pointer`} onClick={toggleWithdraw}>
                                <Typography variant='h5'>Manage</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
                <Outlet />
            </Paper>
        </div>
    );
}