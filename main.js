const electron = require("electron");

var inputWindow;
const createInputWindow = () => {
    inputWindow = new electron.BrowserWindow({
        width: 800,
        height: 75,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    inputWindow.loadFile("input/index.html");

    inputWindow.on("blur", () => {
        //win.close();
    });
}

electron.app.on("ready", createInputWindow);