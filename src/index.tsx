import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { HashRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import { createUserDefaults, getConfig } from "./utilities/settings";
import { collectEmojisFromServer } from "./utilities/emojis";
import { SnackbarProvider } from "notistack";
import { userLoggedIn, refreshUserAccountData } from "./utilities/accounts";

getConfig()
    .then((config: any) => {
        document.title = config.branding.name || "Hyperspace";
    })
    .catch((err: Error) => {
        console.error(err);
    });

createUserDefaults();
if (userLoggedIn()) {
    collectEmojisFromServer();
    refreshUserAccountData();
}

window.onstorage = (event: any) => {
    if (event.key == "account") {
        window.location.reload();
    }
};

ReactDOM.render(
    <HashRouter>
        <SnackbarProvider
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
            }}
        >
            <App />
        </SnackbarProvider>
    </HashRouter>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
