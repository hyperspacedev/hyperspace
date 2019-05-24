// desktop.js
// Electron script to run Hyperspace as an app
// © 2018 Hyperspace developers. Licensed under Apache 2.0.

const { app, Menu, protocol, BrowserWindow, shell, systemPreferences } = require('electron');
const windowStateKeeper = require('electron-window-state');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Check for any updates to the app
autoUpdater.checkForUpdatesAndNotify();

// Create a container for the window
let mainWindow;

// Register the "hyperspace://" protocol so that it supports
// HTTPS and acts like a standard protocol instead of a fake
// file:// protocol, which is necessary for Mastodon to redirect
// to when authorizing Hyperspace.
protocol.registerSchemesAsPrivileged([
    { scheme: 'hyperspace', privileges: { standard: true, secure: true } }
])

/**
 * Determine whether the desktop app is on macOS
 */
function darwin() {
    return process.platform === "darwin";
}

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

        // Convert the parsed URL to a list of strings.
        const target = parsedUrl.pathname.split("/");

        // Check that the target isn't trying to go somewhere
        // else. If it is, throw a "FILE_NOT_FOUND" error
        if (target[0] !== "") {
            callback({error: -6});
            return;
        }

        // Check if the last target item in the list is empty.
        // If so, replace it with "index.html" so that it can
        // load a page.
        if (target[target.length -1] === "") {
            target[target.length -1] = "index.html";
        }

        // Check the middle target and redirect to the appropriate
        // build files of the desktop app when running.
        let baseDirectory;
        if (target[1] === "app" || target[1] === "oauth") {
            baseDirectory = __dirname + "/../build/";
        } else {
            // If it doesn't match above, throw a "FILE_NOT_FOUND" error.
            callback({error: -6});
        }

        // Create a normalized version of the strring.
        baseDirectory = path.normalize(baseDirectory);

        // Check to make sure the target isn't trying to go out of bounds.
        // If it is, throw a "FILE_NOT_FOUND" error.
        const relTarget = path.normalize(path.join(...target.slice(2)));
        if (relTarget.startsWith('..')) {
            callback({error: -6});
            return;
        }
        
        // Create the absolute target path and return it.
        const absTarget = path.join(baseDirectory, relTarget);
        callback({ path: absTarget });
        
    }, (error) => {
        if (error) console.error('Failed to register protocol');
    });
    
}

/**
 * Create the window and all of its properties
 */
function createWindow() {

    // Create a window state manager that keeps track of the width
    // and height of the main window.
    let mainWindowState = windowStateKeeper({
        defaultHeight: 624,
        defaultWidth: 1024
    });

    // Create a browser window with some settings
    mainWindow = new BrowserWindow(
        { 
            // Use the values from the window state keeper
            // to draw the window exactly as it was left.
            // If not possible, derive it from the default
            // values defined earlier.
            x: mainWindowState.x,
            y: mainWindowState.y,
            width: mainWindowState.width,
            height: mainWindowState.height,
            
            // Set a minimum width to prevent element collisions.
            minWidth: 300,

            // Set important web preferences.
            webPreferences: {nodeIntegration: true},

            // Set some preferences that are specific to macOS.
            titleBarStyle: 'hidden',
            vibrancy: systemPreferences.isDarkMode()? "ultra-dark": "light",
            transparent: darwin(),
            backgroundColor: darwin()? "#80FFFFFF": "#FFF"
        }
    );

    // Set up event listeners to track changes in the window state.
    mainWindowState.manage(mainWindow);
    
    // Load the main app and open the index page.
    mainWindow.loadURL("hyperspace://hyperspace/app/");

    // Watch for a change in macOS's dark mode and reload the window to apply changes
    systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', () => {
        if (mainWindow != null) {
            mainWindow.setVibrancy(systemPreferences.isDarkMode()? "ultra-dark": "light");
            mainWindow.webContents.reload();
        }
    })

    // Delete the window when closed
    mainWindow.on('closed', () => {
        mainWindow = null
    });

    // Hijack any links with a blank target and open them in the default
    // browser instead of a new Electron window
    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });
}

/**
 * Create the menu bar and attach it to a window
 */
function createMenubar() {
    
    // Create an instance of the Menu class
    let menu = Menu;
    
    // Create a menu bar template
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

    // Create the template for the menu and attach it to the application
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
    if (!darwin()) {
        app.quit()
    }
});

// When the app is activated, create the window and menu bar
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
        createMenubar();
    }
});
