const content = document.getElementById("Content");
const buttons = ['LP', 'MP', 'HP', 'LK', 'MK', 'HK', "\u2191", "\u2193", "\u2192", "\u2190", "Macro 1", "Macro 2", "RS Assist Up", "RS Assist Down"];
let inputs = ["U", "I", "O", "J", "K", "L", "W", "S", "A", "D", undefined, undefined, undefined, undefined];
let inputCs = ["KeyU", "KeyI", "KeyO", "KeyJ", "KeyK", "KeyL", "KeyW", "KeyS", "KeyA", "KeyD", undefined, undefined, undefined, undefined];
let inputState = [false, false, false, false, false, false, false, false, false, false, false];
let prevInputState = [false, false, false, false, false, false, false, false, false];
let macro1 = [false, false, false, false, false, false];
let macro2 = [false, false, false, false, false, false];
const macro3 = [false, true, false, true, false, false];
const macro4 = [false, false, true, false, true, false];
const imgs = ["Sg_lp", "Sg_mp", "Sg_hp", "Sg_lk", "Sg_mk", "Sg_hk"];
const punch = [undefined, "C0", "F+", "D+", "F0", "D0", "E0", "C+"];
const kick = [undefined, "G0", "B0", "G+", "A+", undefined, "A0"];
const octave = {'1': "+", '0': "0", '-1': "-"};
let timeout, sound, oldsound;
let volume = 100;
let cache = [];
const mstr1 = "</td><td>"
const mstr2 = "<td><input type='checkbox' oninput='updateMacros()' class='macrobox'></td>"
const macroSetStr = "<br><table><tr><td>LP" + mstr1 + "MP" + mstr1 + "HP" + mstr1 + "LK" + mstr1 + "MK" + mstr1 + "HK</td></tr>" + 
"<tr>" + mstr2 + mstr2 + mstr2 + mstr2 + mstr2 + mstr2 + "</tr></table>"

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
    string = "Volume: <input type=\"range\" min=\"0\" max=\"100\" value=\"" + volume + "\" class=\"slider\" id=\"volume\" oninput='updateVolume()'><div id=\"volumeDisplay\">" + volume + "%</div><br>";
    string += "<button id='bindAll' onClick = 'bindAll()'>Bind All</button><br>  (ESC to cancel)<br>";
    for ([i, str] of buttons.entries()){
        string += str + ": <button id='" + str + "b' onClick='tryBind(\"" + str + "\")'>";
        string += inputs[i] ? inputs[i].toUpperCase() : "Unbound"; 
        string += "</button>";
        string += str.startsWith("Macro") ? macroSetStr : "";
        string += "</br>";
    }

    string += "Bugs:<br>-Chrome aggressively unloads sounds after a couple minutes idle. A quick workaround minimized this, but it still happens rarely."
    content.innerHTML = string;

    let boxes = document.querySelectorAll('.macrobox');
    boxes.forEach( (box, i, x) =>{
        if (i <= 5) {
            box.checked = macro1[i];
        } else {
            box.checked = macro2[i-6];
        }
    });

    document.removeEventListener('keydown', playListenerDown);
    document.removeEventListener('keyup', playListenerUp);
}

function updateVolume() {
    volume = document.getElementById('volume').value;
    document.getElementById('volumeDisplay').innerHTML = volume + "%";
    save();
}

function updateMacros() {
    let boxes = document.querySelectorAll('.macrobox');

    boxes.forEach( (box, i, x) =>{
        if (i <= 5) {
            macro1[i] = box.checked;
        } else {
            macro2[i-6] = box.checked;
        }
    });
    save();
}

async function handleInput() {
    //0 = no change, 1 = direction button pressed or released, 2 = note button released, 3 = note button pressed
    //play notes on 3
    let anything = 0;

    let macroInputState = inputState.slice(0,9);

    if (inputState[10]) {
        for (i in macro1){
            macroInputState[i] = macro1[i] ? true : macroInputState[i];
        }
    }
    if (inputState[11]) {
        for (i in macro2){
            macroInputState[i] = macro2[i] ? true : macroInputState[i];
        }
    }
    if (inputState[12]) {
        for (i in macro3){
            macroInputState[i] = macro3[i] ? true : macroInputState[i];
        }
    }
    if (inputState[13]) {
        for (i in macro4){
            macroInputState[i] = macro4[i] ? true : macroInputState[i];
        }
    }

    for (i in macroInputState) {
        if (macroInputState[i] != prevInputState[i]){
            //Give button colour
            if (i < 6) {
                document.getElementById(imgs[i]).src = "./img/" + imgs[i] + +macroInputState[i] + ".png";
            }
            anything = i < 6 ? 2+macroInputState[i] : 1
        }
    }

    if (anything) {
        prevInputState = [...macroInputState];
        if (anything === 3) {
            let note = punch[parseInt("" + +macroInputState[0] + +macroInputState[1] + +macroInputState[2], 2)];
            if (!note) note = kick[parseInt("" + +macroInputState[3] + +macroInputState[4] + +macroInputState[5], 2)]
            if (note) {
                oct = macroInputState[6] - macroInputState[7];
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
        inputs[this.input] = event.key.toUpperCase() === " " ? "SPACE" : event.key.toUpperCase();
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
        volume: volume,
        macro1: macro1,
        macro2: macro2
    }
    localStorage.setItem('options', JSON.stringify(options));
}

function load(){
    options = JSON.parse(localStorage.getItem('options'));
    if(options){
        if (options.inputs) inputs = options.inputs;
        if (options.inputCs) inputCs = options.inputCs;
        if (options.volume) volume = options.volume;
        if (options.macro1) macro1 = options.macro1;
        if (options.macro2) macro2 = options.macro2;
    }
}

async function preLoadAudio(){ //hopefully, who knows
    cache = [];
    for (file of punch.concat(kick)) {
        if(file) {
            for (oct of ["-", "0", "+"]) {
            aud = new Audio('snd/' + oct + file + '.mp3');
            aud.volume = Number.MIN_VALUE;
            try {
                await aud.play();
            } catch (e) {}
            aud.pause();
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