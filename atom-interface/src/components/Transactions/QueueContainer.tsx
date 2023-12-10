import { Typography, Tooltip, IconButton, Dialog, DialogContent, Badge, CircularProgress } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import { useSnapshot } from 'valtio';
import GlobalStore, { TXHstatus } from '../../store/gobalStore';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import HourglassFullIcon from '@material-ui/icons/HourglassFull';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import PauseIcon from '@material-ui/icons/Pause';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Lottie from "lottie-react";
import successAnim from "../../configs/lottiefiles/successAnim.json";
import { ReceiptOutlined } from '@material-ui/icons';

const TransactionsQueue = () => {
    const global = useSnapshot(GlobalStore.state)

    const isDone = global.txQueue.length > 0 && global.txQueue.filter((tx) => { return [TXHstatus.DONE, TXHstatus.CONFIRMED].includes(tx.status) }).length === global.txQueue.length

    const isPending = global.txQueue.length > 0 && global.txQueue.filter((tx) => { return [TXHstatus.WAITING, TXHstatus.PENDING, TXHstatus.SUBMITTED].includes(tx.status) }).length > 0

    const mapStatusToTootip = (status: TXHstatus) => {
        switch (status) {
            case TXHstatus.WAITING:
                return 'Transaction will be submitted once ready'
            case TXHstatus.PENDING:
                return 'Transaction is pending your approval in your wallet'
            case TXHstatus.SUBMITTED:
                return 'Transaction has been submitted to the blockchain and we are waiting on confirmation.'
            case TXHstatus.CONFIRMED:
                return 'Transaction has been confirmed by the blockchain.'
            case TXHstatus.REJECTED:
                return 'Transaction has been rejected.'
            default:
                return ''
        }
    }

    const mapStatusToIcon = (status: TXHstatus) => {
        switch (status) {
            case TXHstatus.WAITING:
                return <PauseIcon className="!text-color-icon-wait" />
            case TXHstatus.PENDING:
                return <HourglassEmptyIcon className="!text-color-icon-pending" />
            case TXHstatus.SUBMITTED:
                return <HourglassFullIcon className="!text-color-icon-pending" />
            case TXHstatus.CONFIRMED:
                return <CheckCircleIcon className="!text-color-icon-pending" />
            case TXHstatus.REJECTED:
                return <ErrorIcon className="!text-color-icon-reject" />
            case TXHstatus.DONE:
                return <CheckCircleIcon className="!text-color-icon-pending" />
            default:
                return <PauseIcon className="!text-color-icon-wait" />
        }
    }

    return (
        <div>
            {global.txQueue.length > 0 && <div className="!bg-color-component-tab fixed bottom-0 right-0 m-3 rounded-full">
                <IconButton onClick={() => GlobalStore.setOpenQueue(true)}>
                    <Badge badgeContent={global.txQueue.length} color="primary">
                        {isPending ? <CircularProgress size={20} /> : <ReceiptOutlined />}
                    </Badge>
                </IconButton>
            </div>}

            <Dialog
                className="max-w-[640px] m-auto text-center"
                open={global.openQueue}
                onClose={() => GlobalStore.setOpenQueue(false)}
                fullWidth={true}
                maxWidth={"sm"}
            >
                <DialogContent>
                    <IconButton className="!absolute right-[0px] top-[0px]"
                        onClick={() => GlobalStore.setOpenQueue(false)}>
                        <CloseIcon />
                    </IconButton>
                    {
                        isDone ? <div className="max-w-[400px] m-auto text-center !pb-[20px]">
                            <Lottie loop={false} className="w-[130px] m-auto pl-[0] pr-[0] py-[30px]" animationData={successAnim} />
                            <Typography className="!px-[40px] !py-[0] !text-center !ml-[0] !mr-[0] !my-[20px] !text-[22px] !font-[700]">{'Transaction Successful!'}</Typography>
                            <Typography className="!px-[40px] !py-[0] !text-center !leading-[1.5rem] !mb-[40px] !text-white">Transaction has been confirmed by the blockchain.</Typography>
                            {
                                global.txQueue.filter(val => val.hash.length > 0).map((val, index) => (
                                    <Typography className="bg-none !ml-[auto] !mr-[auto] !my-[10px] !text-[14px]" key={`txh-scan-${index}`}>
                                        <a className='!text-color-text-btn hover:!text-white' target="_blank" href={`https://testnet.layerzeroscan.com/tx/${val.hash}`} >{val.name.length > 0 ? val.name : 'View in Explorer'} <OpenInNewIcon className="!text-[15px] -mb-[2px] ml-[3px]" /></a>
                                    </Typography>
                                ))
                            }
                        </div>
                            :
                            <div>
                                <div className="p-[24px]">
                                    <Typography className="!text-[24px] w-full text-center">Pending Transactions</Typography>
                                </div>
                                <div className="rounded-[12px] bg-color-component-input border-[1px] border-solid border-color-border4 p-[24px] mb-[12px]">
                                    {
                                        global.txQueue.map((transaction, idx) => {
                                            return (
                                                <div className="p-[12px] [border-bottom:1px_solid_rgba(108,108,123,0.2)] cursor-pointer hover:bg-color-bg11" key={idx}>
                                                    <div className="flex justify-between items-center">
                                                        <Typography>{transaction.name}</Typography>
                                                        <Tooltip title={mapStatusToTootip(transaction.status)}>
                                                            {mapStatusToIcon(transaction.status)}
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                    }
                </DialogContent>
            </Dialog>
        </div>
    )
}


export default TransactionsQueue