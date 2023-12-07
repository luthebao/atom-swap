import { Paper } from '@material-ui/core';
import SwapCore from './SwapCore';

function SwapContainer() {
    return (
        <div className="flex justify-center items-center">
            <Paper elevation={0} className="max-w-[550px] w-full p-[12px] flex flex-col">
                <SwapCore />
            </Paper>
        </div>
    )
}

export default SwapContainer
