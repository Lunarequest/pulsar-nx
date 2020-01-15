import React, {useState, createRef, useEffect} from "react";
import "./style.css";
import "./inter/inter.css";

const {exec} = window.require("child_process");
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();

export default () => {
    const [value, setValue] = useState("");
    const inputElem = createRef();

    const formInput = () => {};
    
    const formSubmit = e => {
        e.preventDefault();
    
        if (value.startsWith(">")) {
            const command = value.replace(">", "");
            if (!command.length);
            exec(command);
        } else {
            electron.shell.openExternal(`https://google.com/search?q=${encodeURIComponent(value)}`);
        }
    
        win.close();
    };

    useEffect(() => {
        inputElem.current.focus();
    }, []);

    return (
        <>
            <form onSubmit={formSubmit}>
                <input
                    ref={inputElem}
                    className={value.startsWith(">") ? "terminal" : ""}
                    onChange={e => {setValue(e.target.value); formInput();}}
                />
            </form>
        </>
    );
};