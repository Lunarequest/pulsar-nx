const {exec} = require("child_process");
const electron = require("electron");
const win = electron.remote.getCurrentWindow();

const form = document.querySelector("form");
const input = form.querySelector("input");
input.focus();

input.oninput = () => {
    if (input.value.startsWith(">")) {
        input.classList.add("terminal");
    } else {
        input.classList.remove("terminal");
    }
};

form.onsubmit = e => {
    e.preventDefault();

    if (input.value.startsWith(">")) {
        const command = input.value.replace(">", "");
        if (!command.length);
        exec(command);
    } else {
        electron.shell.openExternal(`https://google.com/search?q=${encodeURIComponent(input.value)}`);
    }

    win.close();
};