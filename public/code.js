var playerno = 2
var num_players = 4

const pn = document.querySelector("#playnum")
const sc = document.querySelector('#Score')
const ent = document.querySelector("#entbet")

var query = window.location.search.substring(1);
// console.log(query);
var vars = query.split('=');
var names = vars[1];
var dupli = names.split('+');
// console.log(dupli);
var tname = "";
for(var i = 0; i<dupli.length;i++){
    tname+=dupli[i];
    if(i!=(dupli.length-1)){
        tname+=" ";
    }
}
// console.log(tname);


var score = 100
var minbet = score/20
minbet = Math.floor(minbet)
maxbet = score;

pn.innerHTML+=('<h2>Player Number '+ playerno +'</h2>')

function update_score(){
    sc.innerHTML = ("<h5>Current Score : "+score+"</h5>")
}

function update_players(npl,pnames){
    ent.innerHTML='';
    num_players = npl;
    minbet = Math.floor(score/20);
    maxbet = Math.floor(score-minbet*(num_players-2));
    for(var i=1;i<=num_players;i++){
        if(pnames[i-1]!=tname){
            ent.innerHTML+=('<h4>Bet on Team '+pnames[i-1]+'</h4>')
            // ent.innerHTML+=('<div class="container">')
            ent.innerHTML+=('<div class="form-check"> <input class="form-check-input" type="radio" name="team'+i+'" id="team'+i+'correct"> <label class="form-check-label" for="team'+i+'correct"> Correct </label> </div> <div class="form-check"> <input class="form-check-input" type="radio" name="team'+i+'" id="team'+i+'correct2" checked> <label class="form-check-label" for="team'+i+'correct2"> Not Correct </label> </div>')
            ent.innerHTML+=("<div class='range'><input class='range__amount' id='amount"+i+"' onchange='restrictbet("+i+")' type='number' step='1'  max='"+maxbet+"' min='"+minbet+"'> </div> ")
            // ent.innerHTML+=('</div')
            ent.innerHTML+='<br>'
        }
        else{
            playerno = i;
            pn.innerHTML=('<h2>Player Number '+ playerno +'</h2>')
        }
    }
    
};

update_score()




// backend code


const socket = io();

socket.emit('tname', tname);

socket.on('refreshusers' , (npl) => {
    score = npl.playerscores[playerno-1];
    update_players(npl.numplayers,npl.playername);
    
    update_score();
    // restrictbet();
    console.log(npl);
});

var time = 10000

var timer;

var bsb = document.querySelector("#betsub");

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

socket.on('starttimers',(ti)=>{
    // time = ti.time;
    time = ti.ti.time;
    console.log("start");
    bsb.disabled = false;
    countdown(time/1000);
    timer = setTimeout(()=>{
        senddata();
    },time);
});

bsb.onclick = function(){
    clearTimeout(timer);
    senddata();

};

function restrictbet(j){
    j = Number(j);
        
    if(Number(document.querySelector("#amount"+j).value)>Number(document.querySelector("#amount"+j).max)){
        document.querySelector("#amount"+j).value=Number(document.querySelector("#amount"+j).max);
        console.log("jojo");
    }
    if(Number(document.querySelector("#amount"+j).value)<Number(document.querySelector("#amount"+j).min)){
        document.querySelector("#amount"+j).value=Number(document.querySelector("#amount"+j).min);
        console.log("dio");
    }
    
    console.log("restricting");
    let totalbet = 0;
    for(let i=1;i<=num_players;i++){
        if(i!=playerno)totalbet+=Number(document.querySelector("#amount"+i).value);
    }
    let available = score-totalbet;
    for(let i=1;i<=num_players;i++){
        if(i!=playerno){
            let cur = available+Number(document.querySelector("#amount"+i).value);
            document.querySelector("#amount"+i).max = cur;
        }
    }

};

function senddata(){
    // restrictbet();
    for(let i=1;i<=num_players;i++){
        if(i!=playerno)restrictbet(i);
    }
    bsb.disabled = true;
    cor = []
    bet = []
    for(let i=1;i<=num_players;i++){
        if(i!=playerno){
            cor.push(document.querySelector("#team"+i+"correct").checked);
            bet.push(document.querySelector("#amount"+i).value);
        }
        else{
            cor.push(document.querySelector("#ownteamcorrect").checked);
            bet.push(0);
        }
    }
    console.log(cor)
    console.log(bet)
    socket.emit('receiveinput', {playerno,cor,bet});
    
};