import React, {useState, createRef, useEffect} from "react";
import "./style.css";
import "./inter/inter.css";

const {exec} = window.require("child_process");
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();

export default () => {
    const [value, setValue] = useState("");
    const inputElem = createRef();

    //Form Input
    const formInput = () => {};

    //Form Submit
    const formSubmit = e => {
        e.preventDefault();
    
        if (value.trim()) {
            if (value.startsWith(">")) {
                const command = value.replace(">", "");
                if (!command.length);
                exec(command);
            } else {
                electron.shell.openExternal(`https://google.com/search?q=${encodeURIComponent(value)}`);
            }
        }
    
        win.close();
    };

    useEffect(() => {
        //Focus Input
        inputElem.current.focus();
    }, []);

    useEffect(() => {
        //Change Window Height
        const h = document.querySelector("#root").getBoundingClientRect().height;
        const w = win.getSize()[0];
        win.setMinimumSize(w, h);
        win.setSize(w, h);
    });

    return (
        <>
            <form onSubmit={formSubmit}>
                <input
                    ref={inputElem}
                    className={value.startsWith(">") ? "terminal" : ""}
                    onChange={e => {setValue(e.target.value); formInput();}}
                    placeholder="What's up?"
                />
            </form>
            {value.startsWith(">") ? (
                <p className="banner">Danger! You are running a terminal command. This could damage your computer. Make sure you know what you're doing!</p>
            ) : <></>}
        </>
    );
};