const {app, BrowserWindow, globalShortcut, Tray, Menu, shell} = require("electron");
const isDev = require("electron-is-dev");

var inputWindow;
const createInputWindow = () => {
	//Prevent Duplicate Input Windows
	if (inputWindow) return;

	//Create Window
	inputWindow = new BrowserWindow({
		width: 800,
		height: 75,
		frame: false,
		resizable: false,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true
		}
	});
	inputWindow.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/build/index.html`
	);

	//Close on blur
	inputWindow.on("blur", () => {
		if (!isDev) inputWindow.close();
	});

	//On Close
	inputWindow.on("close", () => {
		inputWindow = null;
	});
};

app.on("ready", () => {
	//Shortcut
	globalShortcut.register(
		process.platform === "darwin" ? "Option+A" : "Alt+A",
		createInputWindow
	);

	//Tray
	const tray = new Tray(__dirname + "/a10.png");
	const ctxMenu = Menu.buildFromTemplate([
		{
			type: "normal",
			label: "Pulsar's Secret Control Panel",
			enabled: false
		},
		{
			type: "separator"
		},
		{
			type: "normal",
			label: "Open Pulsar",
			click: createInputWindow
		},
		{
			type: "normal",
			label: "Go to Pulsar's Website",
			click: () => shell.openExternal("https://pulsar.alles.cx")
		}
	]);
	tray.setToolTip("Pulsar's Secret Control Panel");
	tray.setContextMenu(ctxMenu);
});

//Prevent stopping app when windows close
app.on("window-all-closed", e => e.preventDefault());

//Autolaunch
const AutoLaunch = require("auto-launch");
const autoLauncher = new AutoLaunch({
	name: "Pulsar"
});
if (!isDev) autoLauncher.enable();