'use strict';
const electron = require('electron');

const app = electron.app;

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