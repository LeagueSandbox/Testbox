
const electron = require('electron');
const protocol = electron.protocol;
const app = electron.app;

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}


//const app = electron.app;

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
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        backgroundColor: 'black',
        show: false,
        titleBarStyle: 'hidden',
        icon:'assets/sandbox-app-icon.png'
    });

    ipcMain.on('async', (event, arg) => {
        // Print 1
        console.log(arg);
        // Reply on async message from renderer process
        event.sender.send('async-reply', 2);
    });

    /*
    win.webContents.invalidate();

    win.webContents.on('dom-ready', ()=>{
        win.show();
    });*/
/*
    win.once('ready-to-show', ()=> {
        setTimeout(function(){win.show();}, 1000);
    });*/

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

    callOnReady();

    return win;
}


app.on('activate', () => {
    initialize();
});

app.on('ready', () => {
    initialize();

    protocol.registerFileProtocol('atom', (request, callback) => {
        const url = request.url.substr(7)
        callback({path: path.normalize(`${__dirname}/${url}`)})
    }, (error) => {
        if (error) console.error('Failed to register protocol')
    })
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

var callOnReady = function() {

    const {dialog} = require('electron')
    var alert = function (text) {
        dialog.showMessageBox({type: 'info', message: text, buttons: ['Okay']}, function (buttonIndex) {
        });
    };

    var os = require('os');
    var autoUpdater = electron.autoUpdater;

    var platform = os.platform() + '_' + os.arch();
    var version = app.getVersion();

    var url = 'http://league.paradigm-network.com:1337/update/' + platform + '/' + version + '/stable';

    autoUpdater.setFeedURL(url);

    autoUpdater.on('checking-for-update', function () {
    });
    autoUpdater.on('update-available', function () {
    });
    autoUpdater.on('update-not-available', function () {
    });
    autoUpdater.on('error', function (err) {
    });

// event handling after download new release
    autoUpdater.on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        //console.log("Update downloaded");
        // confirm install or not to user
        var index = dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: "Update Available",
            message: 'The new version has been downloaded. Please restart the application to apply the updates.',
            detail: releaseName + "\n\n" + releaseNotes
        });

        if (index === 1) {
            return;
        }

        // restart app, then update will be applied
        quitAndUpdate();
    });

    autoUpdater.checkForUpdates();

    var checkRegularly;

    checkRegularly = function() {
        autoUpdater.checkForUpdates();
        setTimeout(checkRegularly, 1000 * 60 * 5);
    }
};






function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts


            spawnUpdate(['--createShortcut', process.execPath]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }
};