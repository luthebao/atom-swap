import "./style/index.css"
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import darkTheme from './theme/dark'
import { ToastContainer } from 'react-toastify'
import Router from './Router'
import TransactionsQueue from "./components/Transactions/QueueContainer";

import { registerLocale } from "react-datepicker";
import { enUS } from "date-fns/locale";
registerLocale('enUS', enUS)

export function App() {

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
                className={"mt-[80px]"}
            />
            <Router />
            <TransactionsQueue />
        </ThemeProvider>
    )
}
