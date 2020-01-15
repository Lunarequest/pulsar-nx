const electron = require("electron");

const createInputWindow = () => {
    const win = new electron.BrowserWindow({
        width: 800,
        height: 75,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile("input/index.html");
    win.on("blur", () => {
        //win.close();
    });
}

electron.app.on("ready", createInputWindow);