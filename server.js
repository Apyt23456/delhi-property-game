const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static("public"));

/* ---------- BOARD (40 TILES) ---------- */
const board = [
  { name: "GO" },
  { name: "Yamuna Vihar", price: 100, color: "brown", houses: 0 },
  { name: "Shahdara", price: 120, color: "brown", houses: 0 },
  { name: "Chance" },
  { name: "Income Tax", tax: 100 },
  { name: "Rajiv Chowk Metro", price: 200, type: "metro" },
  { name: "Mayur Vihar", price: 140, color: "sky", houses: 0 },
  { name: "Laxmi Nagar", price: 160, color: "sky", houses: 0 },
  { name: "Preet Vihar", price: 180, color: "sky", houses: 0 },
  { name: "Jail" },

  { name: "Lajpat Nagar", price: 200, color: "pink", houses: 0 },
  { name: "Malviya Nagar", price: 220, color: "pink", houses: 0 },
  { name: "Saket", price: 240, color: "pink", houses: 0 },
  { name: "Kashmere Gate Metro", price: 200, type: "metro" },
  { name: "Rohini", price: 260, color: "orange", houses: 0 },
  { name: "Pitampura", price: 280, color: "orange", houses: 0 },
  { name: "Shalimar Bagh", price: 300, color: "orange", houses: 0 },
  { name: "Free Parking" },

  { name: "Karol Bagh", price: 320, color: "red", houses: 0 },
  { name: "Narela", price: 340, color: "red", houses: 0 },
  { name: "Chance" },
  { name: "Punjabi Bagh", price: 360, color: "yellow", houses: 0 },
  { name: "INA Metro", price: 200, type: "metro" },
  { name: "Janakpuri", price: 380, color: "yellow", houses: 0 },
  { name: "Dwarka", price: 400, color: "yellow", houses: 0 },

  { name: "Go To Jail" },
  { name: "Greater Kailash", price: 450, color: "green", houses: 0 },
  { name: "South Extension", price: 470, color: "green", houses: 0 },
  { name: "Defence Colony", price: 500, color: "green", houses: 0 },
  { name: "Central Secretariat Metro", price: 200, type: "metro" },
  { name: "Chance" },
  { name: "Civil Lines", price: 550, color: "blue", houses: 0 },
  { name: "India Gate", price: 580, color: "blue", houses: 0 }
];

const COLOR_GROUPS = {
  brown: 2, sky: 3, pink: 3, orange: 3,
  red: 2, yellow: 3, green: 3, blue: 2
};

let players = [];
let turn = 0;
let awaitingBuy = null;

function emitState() {
  io.emit("state", { players, board, turn, awaitingBuy });
}

function nextTurn() {
  if (players.length === 0) return;
  turn = (turn + 1) % players.length;
}

io.on("connection", socket => {

  socket.on("join", name => {
    if (!name || !name.trim()) return;

    if (players.find(p => p.id === socket.id)) return;

    players.push({
      id: socket.id,
      name: name.trim(),
      money: 1500,
      pos: 0,
      jail: false,
      jailTurns: 0
    });

    if (players.length === 1) turn = 0;
    emitState();
  });

  socket.on("roll", () => {
    if (!players.length) return;
    if (players[turn].id !== socket.id) return;

    const p = players[turn];
    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const move = d1 + d2;

    if (p.jail) {
      if (d1 === d2) {
        p.jail = false;
        p.jailTurns = 0;
      } else {
        p.jailTurns++;
        if (p.jailTurns >= 3) {
          p.money -= 50;
          p.jail = false;
          p.jailTurns = 0;
        } else {
          nextTurn();
          emitState();
          return;
        }
      }
    }

    p.pos = (p.pos + move) % board.length;
    const tile = board[p.pos];

    if (tile.tax) p.money -= tile.tax;

    if (tile.name === "Go To Jail") {
      p.pos = board.findIndex(t => t.name === "Jail");
      p.jail = true;
      nextTurn();
      emitState();
      return;
    }

    if (tile.price && !tile.owner) {
      if (p.money >= tile.price) {
        awaitingBuy = { tileIndex: p.pos, playerId: p.id };
        emitState();
        return;
      }
    }

    nextTurn();
    emitState();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;
    const p = players[turn];
    const tile = board[awaitingBuy.tileIndex];

    if (tile.owner || p.money < tile.price) {
      awaitingBuy = null;
      nextTurn();
      emitState();
      return;
    }

    p.money -= tile.price;
    tile.owner = p.id;

    awaitingBuy = null;
    nextTurn();
    emitState();
  });

  socket.on("skipBuy", () => {
    awaitingBuy = null;
    nextTurn();
    emitState();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    turn = 0;
    emitState();
  });
});

server.listen(process.env.PORT || 3000);
