const content = document.getElementById("Content");
const buttons = ['lp', 'mp', 'hp', 'lk', 'mk', 'hk'];
const inputs = [0, 0, 0, 0, 0, 0];


function displayOptions(){
    string = "<button id='bindAll' onClick = 'bindAll()'>Bind All</button><br>";
    for (str of buttons){
        string += str.toUpperCase() + ": <button id='" + str + "b' onClick='bind(\"" + str + "\")'>Unbound</button><br>"
    }
    content.innerHTML = string;
}

async function bindAll() {
    for(btn of buttons){
        await bind(btn);
    }
}

async function bind(input){
    let pass = {};
    let button =  document.getElementById(input + "b");
    let bind = bindKey.bind(pass);
    let promiseResolve, promiseReject;
    let bindPromise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
    pass.bind = bind;
    pass.btn = button;
    pass.resolve = promiseResolve;
    pass.reject = promiseReject;
    pass.input = buttons.indexOf(input);
    button.innerHTML = "****";
    document.addEventListener('keydown', bind);
    return bindPromise;
}

function bindKey(event){
    if (inputs.indexOf(event.code) !== -1){
        index = inputs.indexOf(event.code);
        inputs[index] = 0;
        document.getElementById(buttons[index] + 'b').innerHTML = "Unbound"
    }
    inputs[this.input] = event.code;
    this.btn.innerHTML = event.key.toUpperCase()
    document.removeEventListener('keydown', this.bind);
    this.resolve();
}