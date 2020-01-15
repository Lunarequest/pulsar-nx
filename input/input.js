const {exec} = require("child_process");

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
        const child = exec(command);
        console.log("done");
    }
};