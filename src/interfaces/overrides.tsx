import React, { Component } from 'react';
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import { Link, Route } from "react-router-dom";
import Chip, { ChipProps } from '@material-ui/core/Chip';
import { MenuItemProps } from '@material-ui/core/MenuItem';
import { MenuItem } from '@material-ui/core';

export interface ILinkableListItemProps extends ListItemProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableIconButtonProps extends IconButtonProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableChipProps extends ChipProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableMenuItemProps extends MenuItemProps {
    to: string;
    replace?: boolean;
}

export const LinkableListItem = (props: ILinkableListItemProps) => (
    <ListItem {...props} component={Link as any}/>
  )
  
export const LinkableIconButton = (props: ILinkableIconButtonProps) => (
    <IconButton {...props} component={Link as any}/>
)

export const LinkableChip = (props: ILinkableChipProps) => (
    <Chip {...props} component={Link as any}/>
)

export const LinkableMenuItem = (props: ILinkableMenuItemProps) => (
    <MenuItem {...props} component={Link as any}/>
  )

export const ProfileRoute = (rest: any, component: Component) => (
    <Route {...rest} render={props => (
        <Component {...props}/>
    )}/>
  )