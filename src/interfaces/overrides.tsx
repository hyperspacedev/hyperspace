import React, { Component } from "react";
import ListItem, { ListItemProps } from "@material-ui/core/ListItem";
import IconButton, { IconButtonProps } from "@material-ui/core/IconButton";
import { Link, Route, Redirect, RouteProps } from "react-router-dom";
import Chip, { ChipProps } from "@material-ui/core/Chip";
import { MenuItemProps } from "@material-ui/core/MenuItem";
import { MenuItem } from "@material-ui/core";
import Button, { ButtonProps } from "@material-ui/core/Button";
import Fab, { FabProps } from "@material-ui/core/Fab";
import Avatar, { AvatarProps } from "@material-ui/core/Avatar";
import { userLoggedIn } from "../utilities/accounts";

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

export interface ILinkableButtonProps extends ButtonProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableFabProps extends FabProps {
    to: string;
    replace?: boolean;
}

export interface ILinkableAvatarProps extends AvatarProps {
    to: string;
    replace?: boolean;
}

export const LinkableListItem = (props: ILinkableListItemProps) => (
    <ListItem {...props} component={Link as any} />
);

export const LinkableIconButton = (props: ILinkableIconButtonProps) => (
    <IconButton {...props} component={Link as any} />
);

export const LinkableChip = (props: ILinkableChipProps) => (
    <Chip {...props} component={Link as any} />
);

export const LinkableMenuItem = (props: ILinkableMenuItemProps) => (
    <MenuItem {...props} component={Link as any} />
);

export const LinkableButton = (props: ILinkableButtonProps) => (
    <Button {...props} component={Link as any} />
);

export const LinkableFab = (props: ILinkableFabProps) => (
    <Fab {...props} component={Link as any} />
);
export const LinkableAvatar = (props: ILinkableAvatarProps) => (
    <Avatar {...props} component={Link as any} />
);

export const ProfileRoute = (rest: any, component: Component) => (
    <Route {...rest} render={props => <Component {...props} />} />
);

export const PrivateRoute = (props: IPrivateRouteProps) => {
    const { component, render, ...rest } = props;
    const redir = (comp: any) =>
        userLoggedIn() ? comp : <Redirect to="/welcome" />;
    return (
        <Route
            {...rest}
            render={(compProps: any) =>
                redir(
                    React.createElement(render ? render : component, compProps)
                )
            }
        />
    );
};

interface IPrivateRouteProps extends RouteProps {
    component?: any;
    render?: any;
}
