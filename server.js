const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* ✅ CORS ENABLED */
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST"] }
});

app.use(express.static("public"));

/* ===== BOARD (SIMPLE, STABLE) ===== */
const board = [
  {name:"GO"},
  {name:"Yamuna Vihar", price:100},
  {name:"Shahdara", price:120},
  {name:"Chance"},
  {name:"Income Tax"},
  {name:"Rajiv Chowk Metro", price:200},
  {name:"Mayur Vihar", price:140},
  {name:"Laxmi Nagar", price:160},
  {name:"Preet Vihar", price:180},
  {name:"Jail"},
  {name:"Lajpat Nagar", price:200},
  {name:"Malviya Nagar", price:220},
  {name:"Saket", price:240},
  {name:"Kashmere Gate Metro", price:200},
  {name:"Rohini", price:260},
  {name:"Pitampura", price:280},
  {name:"Shalimar Bagh", price:300},
  {name:"Free Parking"},
  {name:"Karol Bagh", price:320},
  {name:"Narela", price:340},
  {name:"Punjabi Bagh", price:360},
  {name:"INA Metro", price:200},
  {name:"Janakpuri", price:380},
  {name:"Dwarka", price:400},
  {name:"Uttam Nagar", price:420},
  {name:"Go To Jail"},
  {name:"Greater Kailash", price:450},
  {name:"South Extension", price:470},
  {name:"Defence Colony", price:500},
  {name:"Central Secretariat Metro", price:200},
  {name:"Community Chest"},
  {name:"Luxury Tax"},
  {name:"Chanakyapuri", price:550},
  {name:"Civil Lines", price:580},
  {name:"GO"}
];

/* Ownership map */
board.forEach(t => t.owner = null);

let players = [];
let turn = 0;
let awaitingBuy = null;
let message = "";

/* ===== EMIT ===== */
function emit(socket=null){
  const state = { board, players, turn, awaitingBuy, message };
  socket ? socket.emit("state", state) : io.emit("state", state);
}

io.on("connection", socket => {
  console.log("CONNECTED", socket.id);

  emit(socket); // ✅ send board immediately

  socket.on("join", name => {
    if(!name || players.find(p=>p.id===socket.id)) return;

    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 0,
      lastDice: "-"
    });

    message = `${name} joined`;
    emit();
  });

  socket.on("roll", () => {
    const p = players[turn];
    if(!p || p.id !== socket.id || awaitingBuy) return;

    const d = Math.floor(Math.random()*6)+1;
    p.lastDice = d;
    p.position = (p.position + d) % board.length;

    const tile = board[p.position];
    message = `${p.name} rolled ${d} → ${tile.name}`;

    if(tile.price && !tile.owner){
      awaitingBuy = { playerId: p.id, tileIndex: p.position };
      emit();
      return;
    }

    turn = (turn+1) % players.length;
    emit();
  });

  socket.on("buy", () => {
    if(!awaitingBuy) return;

    const p = players.find(x=>x.id===awaitingBuy.playerId);
    const t = board[awaitingBuy.tileIndex];

    if(p.money >= t.price){
      p.money -= t.price;
      t.owner = p.id;
      message = `${p.name} bought ${t.name}`;
    }

    awaitingBuy = null;
    turn = (turn+1) % players.length;
    emit();
  });

  socket.on("skipBuy", () => {
    awaitingBuy = null;
    turn = (turn+1) % players.length;
    emit();
  });

  socket.on("disconnect", () => {
    players = players.filter(p=>p.id!==socket.id);
    if(turn >= players.length) turn = 0;
    emit();
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("SERVER RUNNING")
);
