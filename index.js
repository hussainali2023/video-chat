const express = require("express")
const cors = require("cors")
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const moment = require("moment");
const { pid } = require("process");



const PORT = process.env.PORT || 5000;
const app = express()
app.use(cors());
const server = http.createServer(app)
const io = socketio(server)


app.use(express.static(path.join(__dirname, "public")))

let rooms = {};
let socketroom = {};
let socketname = {};
let micSocket = {};
let videoSocket = {};
let roomBoard = {};

io.on("connect", socket =>{
    socket.on("join room", (roomid, username) =>{
        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        micSocket[socket.id] = "on";
        videoSocket[socket.id]= "on";

        if(rooms[roomid] && rooms[roomid].length > 0){
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit("message", `${username} joined the room.`,"Bot", moment().format("h:mm a") );
            io.to(socket.id).emit(`join room`, rooms[roomid].filter(pid => pid !== socket.id), socketname, micSocket, videoSocket)
        }
        else{
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit("joion romm", null, null, null, null);
        }
    });
    
    socket.on("action", msg =>{
        if(msg === "mute"){

            micSocket[socket.id] = "off";
        }
        else if(msg === "unmute"){

            micSocket[socket.id] = "on";
        }
        else if(msg === 'videoon'){

            videoSocket[socket.id] = "on"
        }
        else if(msg === "videooff"){

            videoSocket[socket.id]="off"
        }
    })
})


app.get("/", (req, res) =>{
    res.send("Server is running successfully")
})

app.listen(PORT, () =>{
    console.log(`Server is running properly on: ${PORT}`);
})