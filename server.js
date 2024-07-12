const path = require('path');
const http = require("http");
const express = require('express');
const socketio = require("socket.io");
const readline = require("readline-sync");
const prompt = require('prompt-sync')({sigint: true});
var fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'/public'));

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/game', (req,res) => {
    res.render('game');
});

app.get('/servercontrol', (req,res)=>{
    res.render('servercontrol');
});

numplayers = 0;
playername = [];
playerscores = []
sids = [];
var controlid;
playcor = [];
playuncor = [];
perbet = [];
rec = 0;

io.on("connection", (socket) =>{
    console.log(socket.id);
    // console.log(io.of("/").adapter);
    socket.on('tname', (tname) =>{
        if(tname!="SleepyCyborg"){
            numplayers+=1;
            playername.push(tname);
            console.log(playername);
            sids.push(socket.id);
            playerscores.push(100);
            
        }
        else{
            controlid = socket.id;
        }
        io.sockets.emit("refreshusers" ,{numplayers,playername,playerscores});
    });

    socket.on("timerstart", (ti)=>{
        playcor = [];
        playuncor = [];
        perbet = [];
        for(let i =1;i<=numplayers;i++){
            jc = [];
            ju = [];
            for(let j=1;j<=numplayers;j++){
                jc.push(0);
                ju.push(0);
            }
            playcor.push(jc);
            playuncor.push(ju);
            perbet.push(false);
        }
        rec = 0;
        io.sockets.emit("starttimers", {ti});
        console.log(perbet);
        console.log(playcor);
        console.log(playuncor);
    });

    

    socket.on("receiveinput", (inp)=>{
        rec+=1;
        console.log(rec);
        console.log(inp);
        for(let i=0;i<numplayers;i++){
            if(i!=(inp.playerno-1)){
                if(inp.cor[i]==true){
                    playcor[i][inp.playerno-1]=Number(inp.bet[i]);
                }
                else{
                    playuncor[i][inp.playerno-1]=Number(inp.bet[i]);
                }
            }
            else{
                perbet[i]=inp.cor[i];
            }
        }
        if(rec==numplayers){
            console.log(perbet);
            console.log(playcor);
            console.log(playuncor);
            io.sockets.emit("allinprec", {});
        };
    });

    socket.on("playerresults", (res)=>{
        for(let i=0;i<numplayers;i++){
            if(res.result[i]=='1'){
                if(perbet[i]==true){
                    playerscores[i]+=100
                }
                else{
                    playerscores[i]+=40
                }
            }
            else{
                if(perbet[i]==true){
                    playerscores[i]-=20;
                }
                else{
                    playerscores[i]+=20;
                }
            }
            for(let j=0;j<numplayers;j++){
                playerscores[i]-=(playcor[j][i]+playuncor[j][i]);
            }
        }
        for(let i=0;i<numplayers;i++){
            let tbet = 0;
            for(let j=0;j<numplayers;j++){
                tbet+=playcor[i][j];
                tbet+=playuncor[i][j];
            }
            if(res.result[i]=='1'){
                let wbet = 0;
                for(let j=0;j<numplayers;j++){
                    wbet+=playcor[i][j];
                }
                if(wbet!=0){
                    for(let j=0;j<numplayers;j++){
                        playerscores[j]+=tbet*playcor[i][j]/wbet;
                    }
                }
                else{
                    playerscores[i]+=tbet;
                }
                console.log("sekai des");
            }
            else{
                let wbet = 0;
                for(let j=0;j<numplayers;j++){
                    wbet+=playuncor[i][j];
                }
                if(wbet!=0){
                    for(let j=0;j<numplayers;j++){
                        playerscores[j]+=tbet*playuncor[i][j]/wbet;
                    }
                }
                else{
                    playerscores[i]+=tbet;
                }
                console.log("sekai ja nai");
            }
        }
        for(let i=0;i<numplayers;i++){
            if(playerscores[i]<0){
                playerscores[i]=0;
            }
        }
        io.sockets.emit("refreshusers" ,{numplayers,playername,playerscores});
        var savefile = {};
        for(let i=0;i<numplayers;i++){
            savefile[playername[i]]=playerscores[i];
        }
        console.log(savefile);
        var sfstring = JSON.stringify(savefile);
        var tdate = new Date();
        tdate = tdate.getTime().toString();
        tdate+='.json'
        fs.writeFile('savefiles/'+tdate, sfstring, function(err, result) {
            if(err) console.log('error', err);
        });
    });

    socket.on("loadgame", (game)=>{
        console.log(game.fname);
        fs.readFile(game.fname, function(err, data) {
      
            // Check for errors
            if (err) throw err;
           
            // Converting to JSON
            var lfile = JSON.parse(data);
            // console.log("kaam chalu");
            for(let i=0;i<numplayers;i++){
                playerscores[i] = lfile[playername[i]];
            }
            io.sockets.emit("refreshusers" ,{numplayers,playername,playerscores});
            // console.log(users); 
            // Print users 
        });
    });
    

    socket.on("disconnect", ()=> {
        if(socket.id!=controlid){
            var ts = [];
            var tp = [];
            var tsc = [];
            for(var i = numplayers-1;i>=0;i--){
                if(sids[i]==socket.id){
                    sids.pop();
                    playername.pop();
                    playerscores.pop();
                    
                    break;
                }
                else{
                    ts.push(sids[i]);
                    sids.pop();
                    tp.push(playername[i]);
                    playername.pop();
                    tsc.push(playerscores[i]);
                    playerscores.pop()
                }
            }
            for(var j=0;j<tp.length;j++){
                sids.push(ts[j]);
                playername.push(tp[j]);
                playerscores.push(tsc[j]);
            }
            numplayers-=1;
            if(numplayers<0)numplayers = 0;
            console.log(playername);
            console.log(numplayers);
            io.sockets.emit("refreshusers" ,{numplayers,playername,playerscores});
        }
        else{
            console.log("Control lost");
        }
    });
    // while(true){
    //     var start = Number(prompt('Enter 1 to start the question'));
    //     if(start==1){
    //         socket.emit('timerstart',{});
    //     }
    // };

});

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

