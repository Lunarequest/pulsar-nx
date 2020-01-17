import React, {useState, createRef, useEffect} from "react";
import "./style.css";
import "./inter/inter.css";

const {exec} = window.require("child_process");
const electron = window.require("electron");
const win = electron.remote.getCurrentWindow();

export default () => {
    const [value, setValue] = useState("");
    const [results, setResults] = useState([]);
    const [answer, setAnswer] = useState();
    const [selection, setSelection] = useState(0);
    const inputElem = createRef();

    //Form Input
    const formInput = val => {
        setValue(val);
        setResults([]);
        setAnswer();
        if (!val.trim()) return;

        if (val.startsWith(">")) return;
        if (val.toLowerCase().includes("time")) setAnswer("It is 20:10");

        setResults([
            {
                text: "Alles, the Everything Platform"
            },
            {
                text: "AllesHQ on Twitter",
                url: "https://twitter.com/alleshq"
            },
            {
                text: "AllesHQ on GitHub"
            },
            {
                text: "Alles, the startup that picked up over 100 reservations on the first day | TechCrunch"
            },
            {
                text: "Alles on Twitter: \"Only 80 followers left until round 2 of reservations! ▰▰▰▰▰▰▱▱▱▱ 60%\""
            }
        ]);
    };

    //Form Submit
    const formSubmit = e => {
        e.preventDefault();
    
        if (value) {
            if (value.startsWith(">")) {
                const command = value.replace(">", "");
                if (!command.length);
                exec(command);
            } else {
                const result = results[selection];
                if (result) doResult(result);
            }
        }
    
        win.close();
    };

    //Key Press
    document.onkeydown = e => {
        if (e.key === "Escape") {
            win.close();
        } else if (e.key === "ArrowUp") {
            if (selection <= 0) {
                setSelection(results.length - 1);
            } else {
                setSelection(selection - 1);
            }
        } else if (e.key === "ArrowDown") {
            if (selection >= results.length - 1) {
                setSelection(0);
            } else {
                setSelection(selection + 1);
            }
        }
    };

    //Do Result
    const doResult = result => {
        if (result.url) {
            electron.shell.openExternal(result.url);
        }
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
                    onChange={e => formInput(e.target.value.trim())}
                    placeholder="What's up?"
                />
            </form>
            {value.startsWith(">") ? (
                <p className="banner">Danger! You are running a terminal command. This could damage your computer. Make sure you know what you're doing!</p>
            ) : <></>}
            {answer ? (
                <div className="answer">
                    <p>{answer}</p>
                </div>
            ) : <></>}
            {results.map((result, i) => {
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
            })}
        </>
    );
};