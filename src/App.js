import React, {useState, createRef, useEffect} from "react";
import axios from "axios";
import errors from "./errors";
import Twemoji from "react-twemoji";
import "./style.css";
import "./inter/inter.css";

const {exec} = window.require("child_process");
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();
const fs = window.require("fs");

const clientCredentialsPath = `${electron.remote.app.getPath(
	"userData"
)}/client.json`;
var clientCredentials = {
	id: "",
	secret: ""
};
try {
	clientCredentials = JSON.parse(
		fs.readFileSync(clientCredentialsPath, "utf8")
	);
} catch (e) {}

const apiUrl = "https://pulsar.alles.cx/pulsar/api";
const version = electron.remote.app.getVersion();
var inputValue;

export default () => {
	const [value, setValue] = useState("");
	const [data, setData] = useState({results: []});
	const [selection, setSelection] = useState(0);
	const inputElem = createRef();

	//Form Input
	const formInput = val => {
		setValue(val);
		inputValue = val;
		if (!val.trim()) return setData({});

		if (val.startsWith(">"))
			return setData({
				banner:
					"Danger! You are running a terminal command. This could damage your computer. Make sure you know what you're doing!"
			});

		axios
			.post(
				`${apiUrl}/input?version=${version}`,
				{
					input: val
				},
				{
					auth: {
						username: clientCredentials.id,
						password: clientCredentials.secret
					}
				}
			)
			.then(res => {
				if (res.data.type === "connect") {
					clientCredentials.id = res.data.id;
					clientCredentials.secret = res.data.secret;
					try {
						fs.writeFileSync(
							clientCredentialsPath,
							JSON.stringify(clientCredentials)
						);
					} catch (e) {}
					setData({
						answer: `Signed in as ${res.data.name}`,
						results: [
							{
								text: "You're ready to use Pulsar!"
							}
						]
					});
				} else {
					if (val !== inputValue) return;
					setData(res.data);
				}
			})
			.catch(error => {
				if (error.response) {
					const {err} = error.response.data;
					setData(errors[err] ? errors[err] : {});
				} else setData({});
			});
	};

	//Form Submit
	const formSubmit = async e => {
		e.preventDefault();

		if (value) {
			if (value.startsWith(">")) {
				const command = value.replace(">", "");
				if (!command.length);
				exec(command);
			} else if (data.results) {
				const result = data.results[selection];
				if (result) await doResult(result);
			}
		}

		win.close();
	};

	//Key Press
	document.onkeydown = e => {
		if (e.key === "Escape") {
			win.close();
		} else if (e.key === "ArrowUp" && data.results) {
			if (selection <= 0) {
				setSelection(data.results.length - 1);
			} else {
				setSelection(selection - 1);
			}
		} else if (e.key === "ArrowDown" && data.results) {
			if (selection >= data.results.length - 1) {
				setSelection(0);
			} else {
				setSelection(selection + 1);
			}
		}
	};

	//Do Result
	const doResult = async result => {
		if (result.url) {
			electron.shell.openExternal(result.url);
		} else if (result.data) {
			try {
				await axios.post(
					`${apiUrl}/plugin?version=${version}`,
					{
						plugin: data.plugin,
						data: result.data
					},
					{
						auth: {
							username: clientCredentials.id,
							password: clientCredentials.secret
						}
					}
				);
			} catch (e) {}
		}
	};

	useEffect(() => {
		//Focus Input
		inputElem.current.focus();
	}, [inputElem]);

	useEffect(() => {
		//Change Window Height
		const h = document.querySelector("#root").getBoundingClientRect().height;
		const w = win.getSize()[0];
		win.setMinimumSize(w, h);
		win.setSize(w, h);

		//Reset Selection
		if (data.results && data.results.length > 0 && !data.results[selection])
			setSelection(0);
	}, [data, selection]);

	return (
		<Twemoji>
			<form onSubmit={formSubmit}>
				<input
					ref={inputElem}
					className={value.startsWith(">") ? "terminal" : ""}
					onChange={e => formInput(e.target.value.trim())}
					placeholder="What's up?"
				/>
			</form>
			{data.banner ? <p className="banner">{data.banner}</p> : <></>}
			{data.answer ? (
				<div className="answer">
					<p>{data.answer}</p>
				</div>
			) : (
				<></>
			)}
			{data.results ? (
				data.results.map((result, i) => {
					return (
						<div
							className={`resultItem ${selection === i ? "selected" : ""}`}
							key={i}
							onMouseOver={() => {
								setSelection(i);
							}}
							onClick={() => {
								doResult(result);
								win.close();
							}}
						>
							<p>{result.text}</p>
						</div>
					);
				})
			) : (
				<></>
			)}
		</Twemoji>
	);
};
