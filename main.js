const electron = require("electron");

var inputWindow;
const createInputWindow = () => {

    //Prevent Duplicate Input Windows
    if (inputWindow) return;

    //Create Window
    inputWindow = new electron.BrowserWindow({
        width: 800,
        height: 75,
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true
        }
    });
    inputWindow.loadFile("input/index.html");

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