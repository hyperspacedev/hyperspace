import React from 'react';
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import { Link } from "react-router-dom";

export interface ILinkableListItemProps extends ListItemProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableIconButtonProps extends IconButtonProps {
    to: string;
    replace?: boolean;
}

export const LinkableListItem = (props: ILinkableListItemProps) => (
    <ListItem {...props} component={Link as any}/>
  )
  
export const LinkableIconButton = (props: ILinkableIconButtonProps) => (
    <IconButton {...props} component={Link as any}/>
)