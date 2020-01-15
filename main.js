const electron = require("electron");

function createInputWindow() {
    const win = new electron.BrowserWindow({
        width: 800,
        height: 75,
        frame: false
    });
    win.loadFile("input/index.html");
}

electron.app.on("ready", createInputWindow);