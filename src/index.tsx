import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { HashRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import {createUserDefaults, getUserDefaultBool} from './utilities/settings';
import {refreshUserAccountData} from './utilities/accounts';
import {SnackbarProvider} from 'notistack';

createUserDefaults();
refreshUserAccountData();

ReactDOM.render(
    <HashRouter>
        <SnackbarProvider
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
        >
            <App />
        </SnackbarProvider>
    </HashRouter>, 
document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
