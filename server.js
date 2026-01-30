const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* 🔥 CRITICAL FIX: ENABLE CORS */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static("public"));

const JAIL_INDEX = 9;

/* ===== BOARD ===== */
const board = [
  {name:"GO", type:"go"},
  {name:"Yamuna Vihar", price:100, color:"brown", owner:null, houses:0},
  {name:"Shahdara", price:120, color:"brown", owner:null, houses:0},
  {name:"Chance", type:"chance"},
  {name:"Income Tax", type:"tax", amount:200},
  {name:"Rajiv Chowk Metro", type:"metro", price:200, owner:null},
  {name:"Mayur Vihar", price:140, color:"lightblue", owner:null, houses:0},
  {name:"Laxmi Nagar", price:160, color:"lightblue", owner:null, houses:0},
  {name:"Preet Vihar", price:180, color:"lightblue", owner:null, houses:0},
  {name:"Jail", type:"jail"},
  {name:"Lajpat Nagar", price:200, color:"pink", owner:null, houses:0},
  {name:"Malviya Nagar", price:220, color:"pink", owner:null, houses:0},
  {name:"Saket", price:240, color:"pink", owner:null, houses:0},
  {name:"Kashmere Gate Metro", type:"metro", price:200, owner:null},
  {name:"Rohini", price:260, color:"orange", owner:null, houses:0},
  {name:"Pitampura", price:280, color:"orange", owner:null, houses:0},
  {name:"Shalimar Bagh", price:300, color:"orange", owner:null, houses:0},
  {name:"Free Parking", type:"free"},
  {name:"Karol Bagh", price:320, color:"red", owner:null, houses:0},
  {name:"Narela", price:340, color:"red", owner:null, houses:0},
  {name:"Punjabi Bagh", price:360, color:"red", owner:null, houses:0},
  {name:"INA Metro", type:"metro", price:200, owner:null},
  {name:"Janakpuri", price:380, color:"yellow", owner:null, houses:0},
  {name:"Dwarka", price:400, color:"yellow", owner:null, houses:0},
  {name:"Uttam Nagar", price:420, color:"yellow", owner:null, houses:0},
  {name:"Go To Jail", type:"gojail"},
  {name:"Greater Kailash", price:450, color:"green", owner:null, houses:0},
  {name:"South Extension", price:470, color:"green", owner:null, houses:0},
  {name:"Defence Colony", price:500, color:"green", owner:null, houses:0},
  {name:"Central Secretariat Metro", type:"metro", price:200, owner:null},
  {name:"Community Chest", type:"community"},
  {name:"Luxury Tax", type:"tax", amount:150},
  {name:"Chanakyapuri", price:550, color:"blue", owner:null, houses:0},
  {name:"Civil Lines", price:580, color:"blue", owner:null, houses:0},
  {name:"GO", type:"go"}
];

let players = [];
let turn = 0;
let awaitingBuy = null;
let message = "";

/* helpers */
function emit(socket=null){
  const payload = { board, players, turn, awaitingBuy, message };
  socket ? socket.emit("state", payload) : io.emit("state", payload);
}

io.on("connection", socket => {
  console.log("CONNECTED:", socket.id);

  emit(socket);

  socket.on("join", name => {
    if (!name || players.find(p => p.id === socket.id)) return;

    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 0,
      lastDice: "-"
    });

    console.log("JOIN:", name);
    emit();
  });

  socket.on("roll", () => {
    const p = players[turn];
    if (!p || p.id !== socket.id || awaitingBuy) return;

    const d1 = Math.floor(Math.random()*6)+1;
    const d2 = Math.floor(Math.random()*6)+1;
    p.lastDice = `${d1}+${d2}`;

    p.position = (p.position + d1 + d2) % board.length;
    message = `${p.name} rolled ${p.lastDice}`;

    turn = (turn + 1) % players.length;
    emit();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (turn >= players.length) turn = 0;
    emit();
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("SERVER RUNNING")
);
