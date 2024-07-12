var num_players = 4

var play_score = []
for(var i=0;i<num_players;i++)play_score.push(100)

const sc = document.querySelector("#score")
const si = document.querySelector("#updatescore")

function update_score(pn){
    sc.innerHTML = ""
    var j = 0
    for(var i=0;i<num_players;i++){
        j = i+1
        sc.innerHTML+=('<div class="col">Score of Team '+pn[i]+' : '+play_score[i]+'</div>')
        
    }
    si.innerHTML = ""
    for(var i=0;i<num_players;i++){
        j = i+1
        si.innerHTML+=('<div class="col"><input class="form-control" type="text" id="res'+i+'" placeholder="Team '+pn[i]+' Result" aria-label="Team'+pn[i]+' Result"></div>')
    }
    
}

// update_score()

// time = 240000;
var time = 120000;

const socket = io();

const tname = "SleepyCyborg";

socket.emit('tname', tname);

socket.on('refreshusers' , (npl) => {
    num_players = npl.numplayers;
    play_score = npl.playerscores;
    update_score(npl.playername);
    console.log(npl);
});

var tb = document.querySelector("#timebtn");
var sub = document.querySelector("#subtn");
var usb = document.querySelector("#usbtn");
usb.onclick = function(){
    timst.disabled= false;
    usb.disabled = true;
    var result = [];
    for(var i=0;i<num_players;i++){
        tempstring = '#res'+i;
        // console.log(tempstring);
        result.push(document.querySelector(tempstring).value);
    }
    // console.log(result);
    socket.emit('playerresults',{result});
};

function countdown(tt){
    sec = tt%60;
    minu = Math.floor(tt/60);
    document.querySelector("#Timer").innerHTML = "<h5>Time Remaining : "+minu+":"+sec+"</h5>";
    if(tt>0){
        setTimeout(()=>{
            countdown(tt-1);
        },1000);
    }
}

const timst = document.querySelector("#timerstart");
timst.onclick = function(){
    socket.emit("timerstart", {time});
    countdown(time/1000);
    console.log("sent")
    timst.disabled= true;
    // setTimeout(()=>{
    //     usb.disabled = false;
    // },time);

    
};

socket.on("allinprec", ()=>{
    console.log("aa gya tera bhai")
    usb.disabled = false;
});

const lgb = document.querySelector("#lgbtn");
const gf = document.querySelector("#formFile");

lgbtn.onclick = function(){
    var gamefile = gf.files[0];
    console.log("karrha load tera bhai");
    console.log(gamefile.name);
    var fname = 'savefiles/'+gamefile.name
    // var tdata = require(jj);
    // import data from jj assert { type: 'JSON' };
    // console.log(tdata);
    socket.emit("loadgame",{fname});
    
}