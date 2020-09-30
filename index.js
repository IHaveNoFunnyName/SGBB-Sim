const content = document.getElementById("Content");
const buttons = ['lp', 'mp', 'hp', 'lk', 'mk', 'hk', "\u2191", "\u2193", "\u2192", "\u2190"];
let inputs = ["U", "I", "O", "J", "K", "L", "W", "S", "A", "D"];
let inputCs = ["KeyU", "KeyI", "KeyO", "KeyJ", "KeyK", "KeyL", "KeyW", "KeyS", "KeyA", "KeyD"];
let inputState = [false, false, false, false, false, false, false, false, false];
let prevInputState = [false, false, false, false, false, false, false, false, false];
const imgs = ["Sg_lp", "Sg_mp", "Sg_hp", "Sg_lk", "Sg_mk", "Sg_hk"];
const punch = [undefined, "C0", "F+", "D+", "F0", "D0", "E0", "C+"];
const kick = [undefined, "G0", "B0", "G+", "A+", undefined, "A0"];
const octave = {'1': "+", '0': "0", '-1': "-"};
let timeout, sound, oldsound;
let volume = 100;
let cache = [];

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
        string += str + ": <button id='" + str + "b' onClick='tryBind(\"" + str + "\")'>";
        string += inputs[i] ? inputs[i].toUpperCase() : "Unbound"; 
        string += "</button><br>";
    }

    string += "Volume: <input type=\"range\" min=\"0\" max=\"100\" value=\"" + volume + "\" class=\"slider\" id=\"volume\" oninput='updateVolume()'><div id=\"volumeDisplay\">100</div>";
    content.innerHTML = string;

    updateVolume();

    document.removeEventListener('keydown', playListenerDown);
    document.removeEventListener('keyup', playListenerUp);
}

function updateVolume() {
    volume = document.getElementById('volume').value;
    document.getElementById('volumeDisplay').innerHTML = volume + "%";
    save();
}

async function handleInput() {
    //0 = no change, 1 = direction button pressed or released, 2 = note button released, 3 = note button pressed
    //play notes on 3
    let anything = 0;

    for (i in inputState) {
        if (inputState[i] != prevInputState[i]){
            //Give button colour
            if (i < 6) document.getElementById(imgs[i]).src = "./img/" + imgs[i] + +inputState[i] + ".png";
            anything = i < 6 ? 2+inputState[i] : 1
        }
    }

    if (anything) {
        prevInputState = [...inputState];
        if (anything === 3) {
            let note = punch[parseInt("" + +inputState[0] + +inputState[1] + +inputState[2], 2)];
            if (!note) note = kick[parseInt("" + +inputState[3] + +inputState[4] + +inputState[5], 2)]
            if (note) {
                oct = inputState[6] - inputState[7];
                oldsound = sound;
                stop(oldsound);
                play('snd/' + octave[oct] + note + '.mp3');
            }
        }
    }
}

function play(path) {
    let s = new Audio(path);
    sound = s;
    sound.volume = volume/100;
    timeout = setTimeout( () => {
        sound.play();
    }, 16);
}

function stop(old) {
    clearTimeout(timeout);
    $(old).animate({volume: 0}, 160);
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
    
    blurAll();
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
        save();
    }
}

function save(){
    options = {
        inputs: inputs,
        inputCs: inputCs,
        volume: volume
    }
    localStorage.setItem('options', JSON.stringify(options));
}

function load(){
    options = JSON.parse(localStorage.getItem('options'));
    if(options){
        inputs = options.inputs;
        inputCs = options.inputCs;
        volume = options.volume;
    }
}

function preLoadAudio(){ //hopefully, who knows
    cache = [];
    for (file of punch.concat(kick)) {
        if(file) {
            for (oct of ["-", "0", "+"]) {
            cache.push(new Audio('snd/' + oct + file + '.mp3'));
            }
        }
    }
    for (file of imgs) {
        for (i of [0, 1]) {
            img = new Image();
            img.src = "./img/" + file + i + ".png"
            cache.push(img);
        }
    }
    setTimeout(preLoadAudio, 300000);
}

function blurAll(){
    var tmp = document.createElement("input");
    document.body.appendChild(tmp);
    tmp.focus();
    document.body.removeChild(tmp);
}

displayPlay();
load();
preLoadAudio();