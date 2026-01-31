const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

/* ================= BOARD (40 TILES) ================= */
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

board.forEach(t => {
  t.owner = null;
  t.houses = 0;
});

/* ================= GAME STATE ================= */
let players = [];
let turn = 0;
let awaitingBuy = null;

/* ================= HELPERS ================= */
function getPlayerBySocket(socket) {
  return players.find(p => p.id === socket.id);
}

function createPlayer(socket) {
  const p = {
    id: socket.id,
    name: "Player",
    money: 1500,
    pos: 0
  };
  players.push(p);
  return p;
}

function safeTurn() {
  if (players.length === 0) turn = 0;
  if (turn >= players.length) turn = 0;
}

function emitState() {
  safeTurn();
  io.emit("state", { board, players, turn, awaitingBuy });
}

/* ================= SOCKET ================= */
io.on("connection", socket => {

  // Always send state on connect
  socket.emit("state", { board, players, turn, awaitingBuy });

  /* ---------- JOIN (NAME FIXED) ---------- */
  socket.on("join", name => {
    if (typeof name !== "string" || !name.trim()) return;

    let p = getPlayerBySocket(socket);
    if (!p) {
      p = createPlayer(socket);
    }

    // ✅ Update name ONLY here
    p.name = name.trim();

    emitState();
  });

  /* ---------- ROLL (AUTO-CREATE IF NEEDED) ---------- */
  socket.on("roll", () => {
    let p = getPlayerBySocket(socket);
    if (!p) {
      p = createPlayer(socket);
      emitState();
      return;
    }

    safeTurn();
    if (players[turn].id !== socket.id) return;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const steps = d1 + d2;

    p.pos = (p.pos + steps) % board.length;
    const tile = board[p.pos];

    // BUY
    if (tile.price && !tile.owner) {
      awaitingBuy = { tileIndex: p.pos, playerId: p.id };
      emitState();
      return;
    }

    // RENT
    if (tile.owner && tile.owner !== p.id) {
      const owner = players.find(x => x.id === tile.owner);
      if (owner) {
        let rent = 0;

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

  /* ---------- BUY ---------- */
  socket.on("buy", () => {
    if (!awaitingBuy) return;

    const p = getPlayerBySocket(socket);
    if (!p) return;

    const tile = board[awaitingBuy.tileIndex];
    if (!tile.owner && p.money >= tile.price) {
      p.money -= tile.price;
      tile.owner = p.id;
    }

    awaitingBuy = null;
    turn++;
    emitState();
  });

  /* ---------- BUILD HOUSE ---------- */
  socket.on("buildHouse", idx => {
    const p = getPlayerBySocket(socket);
    const tile = board[idx];

    if (!p || !tile || tile.owner !== p.id || !tile.color) return;

    const sameColor = board.filter(b => b.color === tile.color);
    if (!sameColor.every(b => b.owner === p.id)) return;

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

server.listen(3000, () => {
  console.log("SERVER RUNNING");
});
