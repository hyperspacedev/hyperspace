import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { HashRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
import {createUserDefaults} from './utilities/settings';
import {refreshUserAccountData} from './utilities/accounts';

createUserDefaults();
refreshUserAccountData(); 

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>, 
document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
