const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

/* ===== 40 TILE BOARD ===== */
const board = [
  { name:"GO" },
  { name:"Yamuna Vihar", price:100, color:"brown" },
  { name:"Shahdara", price:120, color:"brown" },
  { name:"Chance" },
  { name:"Income Tax" },
  { name:"Rajiv Chowk Metro", price:200, type:"metro" },
  { name:"Mayur Vihar", price:140, color:"lightblue" },
  { name:"Laxmi Nagar", price:160, color:"lightblue" },
  { name:"Preet Vihar", price:180, color:"lightblue" },
  { name:"Jail" },

  { name:"Lajpat Nagar", price:200, color:"pink" },
  { name:"Malviya Nagar", price:220, color:"pink" },
  { name:"Saket", price:240, color:"pink" },
  { name:"Kashmere Gate Metro", price:200, type:"metro" },

  { name:"Rohini", price:260, color:"orange" },
  { name:"Pitampura", price:280, color:"orange" },
  { name:"Shalimar Bagh", price:300, color:"orange" },
  { name:"Free Parking" },

  { name:"Karol Bagh", price:320, color:"red" },
  { name:"Narela", price:340, color:"red" },
  { name:"Punjabi Bagh", price:360, color:"red" },
  { name:"INA Metro", price:200, type:"metro" },

  { name:"Janakpuri", price:380, color:"yellow" },
  { name:"Dwarka", price:400, color:"yellow" },
  { name:"Uttam Nagar", price:420, color:"yellow" },

  { name:"Go To Jail" },

  { name:"Vasant Kunj", price:440, color:"green" },
  { name:"Green Park", price:460, color:"green" },
  { name:"Hauz Khas", price:480, color:"green" },

  { name:"Central Secretariat Metro", price:200, type:"metro" },

  { name:"Civil Lines", price:500, color:"blue" },
  { name:"Greater Kailash", price:550, color:"blue" },
  { name:"Luxury Tax" },
  { name:"Connaught Place", price:600, color:"blue" }
];

board.forEach(t => { t.owner = null; t.houses = 0; });

let players = [];
let turn = 0;
let awaitingBuy = null;

/* ===== HELPERS ===== */
function safeTurn() {
  if (players.length === 0) turn = 0;
  if (turn >= players.length) turn = 0;
}

function emitState() {
  safeTurn();
  io.emit("state", { board, players, turn, awaitingBuy });
}

/* ===== SOCKET ===== */
io.on("connection", socket => {
  // Send current state immediately on connection
socket.emit("state", {
  board,
  players,
  turn,
  awaitingBuy
});
  socket.on("join", name => {
    if (!name || !name.trim()) return;

    // remove ghost of same socket (refresh)
    players = players.filter(p => p.id !== socket.id);

    players.push({
      id: socket.id,
      name: name.trim(),
      money: 1500,
      pos: 0,
      inJail: false
    });

    safeTurn();
    emitState();
    emitState(); // <-- ADD THIS LINE AGAIN
  });

  socket.on("roll", () => {
    if (players.length === 0) return;
    safeTurn();

    const p = players[turn];
    if (!p || p.id !== socket.id) return;

    const dice = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
    p.pos = (p.pos + dice) % board.length;
    const tile = board[p.pos];

    if (tile.name === "Go To Jail") {
      p.pos = 9;
      p.inJail = true;
      turn++;
      emitState();
      return;
    }

    if (tile.price && !tile.owner && p.money >= tile.price) {
      awaitingBuy = { tileIndex: p.pos, playerId: p.id };
      emitState();
      return;
    }

    if (tile.owner && tile.owner !== p.id) {
      const owner = players.find(x => x.id === tile.owner);
      if (owner) {
        let rent;
        if (tile.type === "metro") {
          const metros = board.filter(
            b => b.type === "metro" && b.owner === tile.owner
          ).length;
          rent = [0,25,50,100,200][metros];
        } else {
          rent = Math.floor(tile.price * 0.1) * (1 + tile.houses);
        }
        p.money -= rent;
        owner.money += rent;
      }
    }

    turn++;
    emitState();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;
    const p = players.find(x => x.id === awaitingBuy.playerId);
    if (!p) return;

    const tile = board[awaitingBuy.tileIndex];
    if (p.money >= tile.price && !tile.owner) {
      p.money -= tile.price;
      tile.owner = p.id;
    }

    awaitingBuy = null;
    turn++;
    emitState();
  });

  socket.on("buildHouse", idx => {
    safeTurn();
    const p = players[turn];
    const tile = board[idx];
    if (!p || tile.owner !== p.id || !tile.color) return;

    const same = board.filter(b => b.color === tile.color);
    if (!same.every(b => b.owner === p.id)) return;

    if (tile.houses < 4 && p.money >= 50) {
      p.money -= 50;
      tile.houses++;
    }

    emitState();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    turn = 0;
    awaitingBuy = null;
    emitState();
  });
});

server.listen(3000, () => console.log("SERVER RUNNING"));
