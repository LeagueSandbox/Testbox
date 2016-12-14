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

console.log("Auto updater: " + electron.autoUpdater);

var os = require('os');
var autoUpdater = electron.autoUpdater;

var platform = os.platform() + '_' + os.arch();
var version = app.getVersion();

autoUpdater.setFeedURL('http://league.paradigm-network.com:1337/update/'+platform+'/'+version);
console.log('URL: ' + 'http://league.paradigm-network.com:1337/update/'+platform+'/'+version);

autoUpdater.on('checking-for-update', function() {
    console.log("Checking for update");
});
autoUpdater.on('update-available', function() {
    console.log("Update available");
});
autoUpdater.on('update-not-available', function() {
    console.log("Update not available");
});
autoUpdater.on('error', function(err) {
    console.log("Update error: " + err);
});

// event handling after download new release
autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    console.log("Update downloaded");
    // confirm install or not to user
    var index = dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: [i18n.__('Restart'), i18n.__('Later')],
        title: "Typetalk",
        message: i18n.__('The new version has been downloaded. Please restart the application to apply the updates.'),
        detail: releaseName + "\n\n" + releaseNotes
    });

    if (index === 1) {
        return;
    }

    // restart app, then update will be applied
    quitAndUpdate();
});

autoUpdater.checkForUpdates();