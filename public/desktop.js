// desktop.js
// Electron script to run Hyperspace as an app
// © 2018 Hyperspace developers. Licensed under Apache 2.0.

const { app, menu, protocol, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Check for any updates to the app
autoUpdater.checkForUpdatesAndNotify();

// Create a container for the window
let mainWindow;

protocol.registerSchemesAsPrivileged([
    { scheme: 'hyperspace', privileges: { standard: true, secure: true } }
])

/**
 * Register the protocol for Hyperspace
 */
function registerProtocol() {
    protocol.registerFileProtocol('hyperspace', (request, callback) => {
        
        // Check to make sure we're doing a GET request
        if (request.method !== "GET") {
            callback({error: -322});
            return null;
        }

        // Check to make sure we're actually working with a hyperspace
        // protocol and that the host is 'hyperspace'
        const parsedUrl = new URL(request.url);
        if (parsedUrl.protocol !== "hyperspace:") {
            callback({error: -302});
            return;
        }
        if (parsedUrl.host !== "hyperspace") {
            callback({error: -105});
            return;
        }

        //
        // Target Checks
        //

        const target = parsedUrl.pathname.split("/");

        //Check that the target isn't something else
        if (target[0] !== "") {
            callback({error: -6});
            return;
        }

        if (target[target.length -1] === "") {
            target[target.length -1] = "index.html";
        }

        let baseDirectory;
        if (target[1] === "app" || target[1] === "oauth") {
            baseDirectory = __dirname + "/../build/";
        } else {
            callback({error: -6});
        }

        baseDirectory = path.normalize(baseDirectory);

        const relTarget = path.normalize(path.join(...target.slice(2)));
        if (relTarget.startsWith('..')) {
            callback({error: -6});
            return;
        }
        const absTarget = path.join(baseDirectory, relTarget);

        callback({
            path: absTarget,
        });
        
    }, (error) => {
        if (error) console.error('Failed to register protocol')
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
            //titleBarStyle: 'hidden',
            webPreferences: {nodeIntegration: true}
        }
    );
    
    mainWindow.loadURL("hyperspace://hyperspace/app/");

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
    //createMenubar();
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
        //registerProtocol();
        createWindow();
        createMenubar();
    }
});