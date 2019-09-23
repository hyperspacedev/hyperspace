import * as React from "react";
import webShare, { WebShareInterface } from "react-web-share-api";
import { MenuItem } from "@material-ui/core";

export interface OwnProps {
    style: object;
}

const ShareMenu: React.FunctionComponent<WebShareInterface & OwnProps> = ({
    share,
    isSupported,
    style
}) =>
    isSupported ? (
        <MenuItem onClick={share} style={style}>
            Share
        </MenuItem>
    ) : null;

export default webShare<OwnProps>()(ShareMenu);
