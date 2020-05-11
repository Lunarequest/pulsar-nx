import React, {useState, useEffect} from "react";
import axios from "axios";
import errors from "./errors";
import Twemoji from "react-twemoji";
import "./style.css";
import "./inter/inter.css";

const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();
const fs = window.require("fs");

var clientCredentials = {
	id: "",
	secret: ""
};
try {
	clientCredentials = JSON.parse(
		fs.readFileSync(electron.remote.getGlobal("clientCredentialsPath"), "utf8")
	);
} catch (e) {}

const version = electron.remote.app.getVersion();
var inputValue;

export default () => {
	const [data, setData] = useState({results: []});
	const [selection, setSelection] = useState(0);

	//Form Input
	const formInput = val => {
		inputValue = val;
		if (!val.trim()) return setData({});

		axios
			.post(
				`${electron.remote.getGlobal("apiUrl")}/input?version=${version}`,
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
							electron.remote.getGlobal("clientCredentialsPath"),
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

		if (data.results) {
			const result = data.results[selection];
			if (result) await doResult(result);
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
			await electron.shell.openExternal(result.url);
		} else if (result.data) {
			try {
				await axios.post(
					`${electron.remote.getGlobal("apiUrl")}/plugin?version=${version}`,
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
					onChange={e => formInput(e.target.value.trim())}
					placeholder="What's up?"
					autoFocus
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
							onClick={async () => {
								await doResult(result);
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
