const { app, BrowserWindow, ipcMain } = require('electron');
const electron = require('electron')
const url = require('url');
const path = require('path');
const { config } = require('process');
const fs = require('fs');

let storage = {};

let mainWindow;
let configWindow;
let appdata;
let credits;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 325,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        }
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main.html'),
        protocol:'file:',
        slashes:true
    }));

    mainWindow.on('closed', () => {
        app.quit();
    });

    const Menu = electron.Menu.buildFromTemplate(MenuTemplate)

    electron.Menu.setApplicationMenu(Menu);
});

const MenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+W' :
                'ALT + F4',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

ipcMain.on('save:config', (e, config) => {
    storage.config = config;
    mainWindow.webContents.send('save:config', config);
    configWindow.close();
});

ipcMain.on('openWindow:config', e => {
    if (storage.config) {
        configWindow = new BrowserWindow({
            width: 1000,
            height: 500,
            title: 'Configuration Menu',
            webPreferences:{
                nodeIntegration:true,
                contextIsolation: false
            },
            hasShadow: true
        });
        // Load HTML into window
        configWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'configMenu.html'),
            protocol:'file:',
            slashes: true
        })).then(() => {
            configWindow.webContents.send('load:config', storage)
        });
        // Garbage Collection Handle
        mainWindow.on('close', () => {
            configWindow = null;
        });
    } else {
        configWindow = new BrowserWindow({
            width: 1000,
            height: 500,
            title: 'Configuration Menu',
            webPreferences:{
                nodeIntegration:true,
                contextIsolation: false
            },
            hasShadow: true
        });
        // Load HTML into window
        configWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'configMenu.html'),
            protocol:'file:',
            slashes: true
        }));
        // Garbage Collection Handle
        mainWindow.on('close', () => {
            configWindow = null;
        });
    }
});

ipcMain.on('openWindow:appdata', e => {
    appdata = new BrowserWindow({
        width: 1000,
        height: 500,
        title: 'Configuration Menu',
        webPreferences:{
            nodeIntegration:true,
            contextIsolation: false
        },
        hasShadow: true
    });
    // Load HTML into window
    appdata.loadURL(url.format({
        pathname: path.join(__dirname, 'applicationData.html'),
        protocol:'file:',
        slashes: true
    }));
    // Garbage Collection Handle
    mainWindow.on('close', () => {
        appdata = null;
    });
});

var seconds = 0;
var looper = 0;

ipcMain.on('openWindow:credits', e => {
    credits = new BrowserWindow({
        width: 1000,
        height: 425,
        title: 'Credits/Extras',
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false
        },
        hasShadow: true
    });

    credits.loadURL(url.format({
        pathname: path.join(__dirname, 'credits.html'),
        protocol:'file:',
        slashes: true
    }));

    mainWindow.on('close', () => {
        credits = null;
    });
})

ipcMain.on('script:toggle', (e, status) => {

    let obj = {};

    const date = new Date();
    const startHours = date.getHours();
    const startMinutes = date.getMinutes();
    const startTime = (startHours + ' : ' + startMinutes);
    obj.startTime = startTime;
    let runTime = 0;
    let loops = 0;
    let files = 0;

    if (status === 'off') {
        clearInterval(seconds)
        clearInterval(looper)
        console.log('off')
        loops = 0;
        runTime = 0;
    } else {
        seconds = setInterval(sec, 1000);
        looper = setInterval(loop, (storage.config.time * 1000));
    };

    function sec() {
        runTime = runTime + 1
    };

    function loop() {
        const config = storage.config
        loops = loops + 1
        const file = fs.readdirSync(storage.config.mainFolder);
        if (file.length >= 2) {
            const a = config.mainFolder + `/${file[0]}`;
            const b = config.storageFolder + `/${file[0]}`;
            fs.rename(a,b,function (err) {
                if (err) throw err;
                files = files + 1
            })
        };
    };

});