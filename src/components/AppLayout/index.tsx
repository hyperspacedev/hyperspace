import { AppLayout } from "./AppLayout";
import { withStyles } from "@material-ui/core";
import { styles } from "./AppLayout.styles";
import { withSnackbar } from "notistack";

export default withStyles(styles)(withSnackbar(AppLayout));
