const electron = require('electron');
const app = electron.app;
const menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const {autoUpdater} = require('electron-updater');

const path = require('path');
autoUpdater.checkForUpdatesAndNotify();

let mainWindow;

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

function createMenubar() {
    const menuBar = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Window',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        if (mainWindow == null)
                            createWindow();
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

app.on('ready', () => {
    createWindow();
    createMenubar();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
        createMenubar()
    }
});