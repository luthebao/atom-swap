import { createTheme } from "@material-ui/core/styles";
import coreTheme from "./coreTheme";

// Create a theme instance.
const darkTheme = createTheme({
    ...coreTheme,
    palette: {
        ...coreTheme.palette,
        background: {
            default: "#1d232a",
            paper: "#1d232a"
        },
        primary: {
            main: "#fff"
        },
        text: {
            primary: "#fff",
            secondary: "#fff",
        },
        type: "dark"
    },
    overrides: {
        ...coreTheme.overrides,
        MuiSnackbarContent: {
            root: {
                color: "#fff",
                backgroundColor: "#2A2E3C",
                padding: "0px",
                minWidth: "auto",
                "@media (min-width: 960px)": {
                    minWidth: "400px"
                }
            },
            message: {
                padding: "0px"
            },
            action: {
                marginRight: "0px"
            }
        },
        MuiTooltip: {
            tooltip: {
                background: "#FFF !important",
                border: "1px solid #fff",
                borderRadius: "8px",
                color: "#000",
                fontSize: "13px"
            }
        }
    }
});

export default darkTheme;
