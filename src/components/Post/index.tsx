import { Post } from "./Post";
import { withStyles } from "@material-ui/core";
import { styles } from "./Post.styles";
import { withSnackbar } from "notistack";

export default withStyles(styles)(withSnackbar(Post));
