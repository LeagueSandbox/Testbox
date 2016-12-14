'use strict';
const electron = require('electron');

const app = electron.app;

const ipcMain = electron.ipcMain

// prevent window being garbage collected
let mainWindow;

function initialize() {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
}

function createMainWindow() {
    const win = new electron.BrowserWindow({
        width: 1024,
        height: 768
    });

    win.loadURL(`file://${__dirname}/index.html`);
    win.on('closed', onClosed);

    var promptResponse
    ipcMain.on('prompt', function (eventRet, arg) {
        promptResponse = null
        var promptWindow = new electron.BrowserWindow({
            width: 300,
            height: 100,
            show: false,
            resizable: false,
            movable: false,
            alwaysOnTop: true,
            frame: false
        })
        arg.val = arg.val || ''
        const promptHtml = '<label for="val">' + arg.title + '</label>\
    <input id="val" value="' + arg.val + '" autofocus />\
    <button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Ok</button>\
    <button onclick="window.close()">Cancel</button>\
    <style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>'
        promptWindow.loadURL('data:text/html,' + promptHtml)
        promptWindow.show()
        promptWindow.on('closed', function () {
            eventRet.returnValue = promptResponse
            promptWindow = null
        })
    })
    ipcMain.on('prompt-response', function (event, arg) {
        if (arg === '') {
            arg = null
        }
        promptResponse = arg
    })

    return win;
}

app.on('activate', () => {
    initialize();
});

app.on('ready', () => {
    initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function onClosed() {
    // dereference the window
    // for multiple windows store them in an array
    mainWindow = null;
}