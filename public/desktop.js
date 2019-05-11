// desktop.js
// Electron script to run Hyperspace as an app
// © 2018 Hyperspace developers. Licensed under Apache 2.0.

const { app, menu, protocol, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Check for any updates to the app
autoUpdater.checkForUpdatesAndNotify();

// Create the protocol to use for Hyperspace in redirect URIs
// Also mark it as secure so that Mastodon is happy
protocol.registerStandardSchemes(['hyperspace'], {secure: true});

// Create a container for the window
let mainWindow;

/**
 * Register the protocol for Hyperspace
 */
function registerProtocol() {
    protocol.registerFileProtocol('hyperspace', (request, callback) => {
        //Throw a METHOD_NOT_SUPPORTED error if it isn't a GET request
        if (request.method !== "GET") {
            callback({error: -322});
            return null;
        }

        // If the URL scheme doesn't contain the protocol, throw an error
        const parsedUrl = new URL(request.url);
        if (parsedUrl.protocol !== "hyperspace") {
            callback({error: -302});
            return;
        }

        if (parsedUrl.host !== "hyperspace") {
            callback({error: -105});
            return;
        }
    }, (error) => {
        if (error) {
            console.error("Failed to register Hyperspace protocol.");
            console.error(error.message);
        }
    });
}

/**
 * Create the window and all of its properties
 */
function createWindow() {
    mainWindow = new BrowserWindow(
        { 
            width: 1000,
            height: 600,
            minWidth: 476, 
            titleBarStyle: 'hidden',
            webPreferences: {nodeIntegration: true}
        }
    );
    
    mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html#/')}`);

    mainWindow.on('closed', () => {
        mainWindow = null
    });
}

/**
 * Create the menu bar and attach it to a window
 */
function createMenubar() {
    const menuBar = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        if (mainWindow == null) {
                            registerProtocol();
                            createWindow();
                        }
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'pasteandmatchstyle' },
                { role: 'delete' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                {
                    label: 'Open Dev Tools',
                    click () {
                        try {
                            mainWindow.webContents.openDevTools({mode: 'undocked'});
                        } catch (err) {
                            console.error("Couldn't open dev tools: " + err);
                        }
                        
                    },
                    accelerator: 'Shift+CmdOrCtrl+I'
                },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Report a Bug',
                    click () { require('electron').shell.openExternal('https://github.com/hyperspacedev/hyperspace/issues') }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        menuBar.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        })

        // Edit menu
        menuBar[2].submenu.push(
            { type: 'separator' },
            {
                label: 'Speech',
                submenu: [
                    { role: 'startspeaking' },
                    { role: 'stopspeaking' }
                ]
            }
        )

        // Window menu
        menuBar[4].submenu = [
            { role: 'close' },
            { role: 'minimize' },
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ]
    }

    const thisMenu = menu.buildFromTemplate(menuBar);
    menu.setApplicationMenu(thisMenu);
}

// When the app is ready, create the window and menu bar
app.on('ready', () => {
    registerProtocol();
    createWindow();
    createMenubar();
});

// Standard quit behavior changes for macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// When the app is activated, create the window and menu bar
app.on('activate', () => {
    if (mainWindow === null) {
        registerProtocol();
        createWindow();
        createMenubar();
    }
});