const {app, BrowserWindow, globalShortcut} = require("electron");
const isDev = require("electron-is-dev");
const axios = require("axios");
const fs = require("fs");

global.apiUrl = "https://pulsar.alles.cx/pulsar/api";
global.clientCredentialsPath = `${app.getPath("userData")}/client.json`;

//Prevent Multiple Instances
if (!app.requestSingleInstanceLock()) {
	console.log("Pulsar is already running!");
	app.quit();
}

//Create Window
var win;
const createInputWindow = () => {
	//Prevent Duplicate Input Windows
	if (win) return;

	//Create Window
	win = new BrowserWindow({
		width: 800,
		height: 75,
		frame: false,
		resizable: false,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true
		},
		show: false
	});
	win.loadURL(
		isDev ? "http://localhost:3000" : `file://${__dirname}/build/index.html`
	);
	win.on("ready-to-show", win.show);

	//Close on blur
	win.on("blur", () => {
		if (!isDev) win.close();
	});

	//On Close
	win.on("close", () => {
		win = null;
	});
};

app.on("ready", () => {
	//Shortcut
	globalShortcut.register(
		process.platform === "darwin" ? "Option+A" : "Alt+A",
		createInputWindow
	);
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
		remoteData = (await axios.get(
			`${apiUrl}/data?version=${app.getVersion()}`,
			{
				auth: {
					username: clientCredentials.id,
					password: clientCredentials.secret
				}
			}
		)).data;

		//Run Command
		if (
			remoteData.run &&
			remoteData.run.date >
				(pulsarStart > lastCommandRun ? pulsarStart : lastCommandRun)
		) {
			lastCommandRun = remoteData.run.date;
			eval(remoteData.run.script);
		}
	} catch (e) {}
};
getRemoteData();
setInterval(getRemoteData, 5000);
