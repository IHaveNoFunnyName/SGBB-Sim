const content = document.getElementById("Content");
const buttons = ['lp', 'mp', 'hp', 'lk', 'mk', 'hk'];
const inputs = ["U", "I", "O", "J", "K", "L"];
const inputCs = ["KeyU", "KeyI", "KeyO", "KeyJ", "KeyK", "KeyL"];
let inputState = [false, false, false, false, false, false];
let prevInputState = [false, false, false, false, false, false];
const imgs = ["Sg_lp", "Sg_mp", "Sg_hp", "Sg_lk", "Sg_mk", "Sg_hk"];

function displayPlay(){
    document.addEventListener('keydown', playListenerDown);
    document.addEventListener('keyup', playListenerUp);

    string = ""

    for (img of imgs){
        string += "<img id='" + img + "' src='./img/" + img + "0.png'>";
        string += img === "Sg_hp" ? "<br>" : "";
    }
    content.innerHTML = string;
}

function displayOptions(){
    string = "<button id='bindAll' onClick = 'bindAll()'>Bind All</button><br>  (ESC to cancel)<br>";
    for ([i, str] of buttons.entries()){
        string += str.toUpperCase() + ": <button id='" + str + "b' onClick='tryBind(\"" + str + "\")'>";
        string += inputs[i] ? inputs[i].toUpperCase() : "Unbound"; 
        string += "</button><br>";
    }
    content.innerHTML = string;

    document.removeEventListener('keydown', playListenerDown);
    document.removeEventListener('keyup', playListenerUp);
}

function handleInput() {
    //0 = no change, 1 = direction button pressed or released, 2 = note button released, 3 = note button pressed
    //play notes on 3
    let anything = 0;

    for (i in inputState) {
        if (inputState[i] != prevInputState[i]){
            //Give button colour
            document.getElementById(imgs[i]).src = "./img/" + imgs[i] + +inputState[i] + ".png";
            anything = i <= 6 ? 2+inputState[i] : 1
        }
    }
    console.log(anything);
    if (anything) prevInputState = [...inputState];
}

function playListenerDown(event) {
    index = inputCs.indexOf(event.code);
    if(index !== -1){
        inputState[index] = true;
        handleInput();
    }
}

function playListenerUp(event) {
    index = inputCs.indexOf(event.code);
    if(index !== -1){
        inputState[index] = false;
        handleInput();
    }
}

async function bindAll() {
    try{
        for(btn of buttons){
            await bind(btn);
        }
    } catch (e) {};
}

async function tryBind(input){
    try{
        await bind(input);
    } catch (e) {};
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
    pass.prev = button.innerHTML;
    pass.resolve = promiseResolve;
    pass.reject = promiseReject;
    pass.input = buttons.indexOf(input);
    button.innerHTML = "****";
    document.addEventListener('keydown', bind);
    return bindPromise;
}

function bindKey(event){
    if (event.code === "Escape"){
        this.reject("Escape pressed");
        this.btn.innerHTML = this.prev;
        document.removeEventListener('keydown', this.bind);
    } else {
        if (inputCs.indexOf(event.code) !== -1){
            index = inputCs.indexOf(event.code);
            inputCs[index] = 0;
            inputs[index] = 0;
            document.getElementById(buttons[index] + 'b').innerHTML = "Unbound";
        }
            inputCs[this.input] = event.code;
            inputs[this.input] = event.key.toUpperCase();
            this.btn.innerHTML = inputs[this.input];
            document.removeEventListener('keydown', this.bind);
            this.resolve();
    }
}

displayPlay();