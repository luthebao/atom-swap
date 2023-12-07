import { Typography } from '@material-ui/core'

export default function SwitchStable({
    stable, setStable
}: {
    stable: boolean,
    setStable: (val: boolean) => void
}) {

    return (
        <div className="mb-[4px] relative ">
            <div className="flex flex-wrap rounded-[10px] w-full items-center bg-color-component-container">
                <div className="w-full grid grid-cols-2 gap-2 p-[4px]">
                    <div className={`p-[20px] rounded-[8px] text-color-text2 hover:!bg-color-component-tab hover:!text-color-btn ${stable && "border-[1px] border-solid border-color-text-btn !bg-color-component-tab !text-color-btn"}`} onClick={() => { setStable(true) }}>
                        <Typography className="text-center">Stable</Typography>
                    </div>
                    <div className={`p-[20px] rounded-[8px] text-color-text2 hover:!bg-color-component-tab hover:!text-color-btn ${!stable && "border-[1px] border-solid border-color-text-btn !bg-color-component-tab !text-color-btn"}`} onClick={() => { setStable(false) }}>
                        <Typography className="text-center">Volatile</Typography>
                    </div>
                </div>
            </div>
        </div>
    )
}