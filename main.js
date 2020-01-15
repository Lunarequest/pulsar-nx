const electron = require("electron");
const isDev = require("electron-is-dev");

var inputWindow;
const createInputWindow = () => {

    //Prevent Duplicate Input Windows
    if (inputWindow) return;

    //Create Window
    inputWindow = new electron.BrowserWindow({
        width: 800,
        height: 300,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    inputWindow.loadURL(isDev ? "http://localhost:3000" : `file://${__dirname}/../build/index.html`);

    //Close on blur
    inputWindow.on("blur", () => {
        //win.close();
    });

    inputWindow.on("close", () => {
        inputWindow = null;
    });
}

electron.app.on("ready", () => {
    //Keyboard Shortcut
    electron.globalShortcut.register("CommandOrControl+Shift+A", createInputWindow);
});

//Prevent stopping app when windows close
electron.app.on("window-all-closed", e => e.preventDefault());