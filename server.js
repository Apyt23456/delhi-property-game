const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD (DELHI MONOPOLY) ===== */
const board = [
  { name:"GO", type:"go" },

  { name:"Yamuna Vihar", price:100, color:"brown", owner:null },
  { name:"Shahdara", price:120, color:"brown", owner:null },

  { name:"Chance", type:"chance" },
  { name:"Income Tax", type:"tax", amount:200 },

  { name:"Rajiv Chowk Metro", type:"metro", price:200, owner:null },

  { name:"Mayur Vihar", price:140, color:"lightblue", owner:null },
  { name:"Laxmi Nagar", price:160, color:"lightblue", owner:null },
  { name:"Preet Vihar", price:180, color:"lightblue", owner:null },

  { name:"Jail", type:"jail" },

  { name:"Lajpat Nagar", price:200, color:"pink", owner:null },
  { name:"Malviya Nagar", price:220, color:"pink", owner:null },
  { name:"Saket", price:240, color:"pink", owner:null },

  { name:"Kashmere Gate Metro", type:"metro", price:200, owner:null },

  { name:"Rohini", price:260, color:"orange", owner:null },
  { name:"Pitampura", price:280, color:"orange", owner:null },
  { name:"Shalimar Bagh", price:300, color:"orange", owner:null },

  { name:"Free Parking", type:"free" },

  { name:"Karol Bagh", price:320, color:"red", owner:null },
  { name:"Narela", price:340, color:"red", owner:null },
  { name:"Punjabi Bagh", price:360, color:"red", owner:null },

  { name:"INA Metro", type:"metro", price:200, owner:null },

  { name:"Janakpuri", price:380, color:"yellow", owner:null },
  { name:"Dwarka", price:400, color:"yellow", owner:null },
  { name:"Uttam Nagar", price:420, color:"yellow", owner:null },

  { name:"Go To Jail", type:"gojail" },

  { name:"Greater Kailash", price:450, color:"green", owner:null },
  { name:"South Extension", price:470, color:"green", owner:null },
  { name:"Defence Colony", price:500, color:"green", owner:null },

  { name:"Central Secretariat Metro", type:"metro", price:200, owner:null },

  { name:"Chance", type:"chance" },
  { name:"Luxury Tax", type:"tax", amount:150 },

  { name:"Chanakyapuri", price:550, color:"blue", owner:null },
  { name:"Civil Lines", price:580, color:"blue", owner:null },

  { name:"GO", type:"go" }
];

let players = [];
let turnIndex = 0;
let awaitingBuy = null;
let message = "";

/* ===== HELPERS ===== */
function emitState() {
  io.emit("state", {
    board,
    players,
    turnIndex,
    awaitingBuy,
    message
  });
}

io.on("connection", socket => {

  emitState();

  socket.on("join", name => {
    if (!name || !name.trim()) return;

    if (players.find(p => p.id === socket.id)) return;

    players.push({
      id: socket.id,
      name: name.trim(),
      money: 1500,
      position: 0
    });

    message = `${name} joined the game`;
    emitState();
  });

  socket.on("roll", () => {
    const p = players[turnIndex];
    if (!p || p.id !== socket.id || awaitingBuy) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const move = dice1 + dice2;

    p.position += move;
    if (p.position >= board.length) {
      p.position -= board.length;
      p.money += 200;
    }

    const tile = board[p.position];
    message = `${p.name} rolled ${dice1}+${dice2} → ${tile.name}`;

    if (tile.type === "tax") {
      p.money -= tile.amount;
    }

    if (tile.type === "gojail") {
      p.position = board.findIndex(t => t.type === "jail");
    }

    if (tile.price && !tile.owner) {
      awaitingBuy = {
        playerId: p.id,
        tileIndex: p.position
      };
    } else {
      awaitingBuy = null;
      turnIndex = (turnIndex + 1) % players.length;
    }

    emitState();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;

    const { playerId, tileIndex } = awaitingBuy;
    const p = players.find(x => x.id === playerId);
    const tile = board[tileIndex];

    if (p && tile && p.money >= tile.price && !tile.owner) {
      p.money -= tile.price;
      tile.owner = p.id;
      message = `${p.name} bought ${tile.name}`;
    }

    awaitingBuy = null;
    turnIndex = (turnIndex + 1) % players.length;
    emitState();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (turnIndex >= players.length) turnIndex = 0;
    awaitingBuy = null;
    emitState();
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
