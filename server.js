const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

/* ---------- BOARD ---------- */
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
  { name: "Narela", price: 340, color: "red", houses: 0 }
];

const COLOR_GROUPS = {
  brown: 2,
  sky: 3,
  pink: 3,
  orange: 3,
  red: 2
};

/* ---------- GAME STATE ---------- */
let players = [];
let turn = 0;
let awaitingBuy = null;

/* ---------- HELPERS ---------- */
function emitState() {
  io.emit("state", { players, board, turn, awaitingBuy });
}

function nextTurn() {
  turn = (turn + 1) % players.length;
}

/* ---------- SOCKET ---------- */
io.on("connection", socket => {

  socket.on("join", name => {
    if (players.find(p => p.id === socket.id)) return;

    players.push({
      id: socket.id,
      name,
      money: 1500,
      pos: 0,
      jail: false,
      jailTurns: 0
    });

    emitState();
  });

  socket.on("roll", () => {
    if (players[turn]?.id !== socket.id) return;

    const p = players[turn];

    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    const total = d1 + d2;

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

    p.pos = (p.pos + total) % board.length;
    const tile = board[p.pos];

    if (tile.name === "Income Tax") {
      p.money -= tile.tax;
      nextTurn();
      emitState();
      return;
    }

    if (tile.name === "Chance") {
      p.money += 50;
      nextTurn();
      emitState();
      return;
    }

    if (tile.name === "Go To Jail") {
      p.pos = board.findIndex(t => t.name === "Jail");
      p.jail = true;
      nextTurn();
      emitState();
      return;
    }

    if (tile.price && !tile.owner) {
      if (p.money < tile.price) {
        nextTurn();
        emitState();
        return;
      }
      awaitingBuy = { tileIndex: p.pos, playerId: p.id };
      emitState();
      return;
    }

    nextTurn();
    emitState();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;

    const p = players[turn];
    const tile = board[awaitingBuy.tileIndex];

    if (p.money >= tile.price) {
      p.money -= tile.price;
      tile.owner = p.id;
    }

    awaitingBuy = null;
    nextTurn();
    emitState();
  });

  socket.on("skipBuy", () => {
    awaitingBuy = null;
    nextTurn();
    emitState();
  });

  socket.on("buildHouse", index => {
    const tile = board[index];
    const p = players[turn];
    if (tile.owner !== p.id) return;

    const sameColor = board.filter(
      t => t.color === tile.color && t.owner === p.id
    );

    if (sameColor.length !== COLOR_GROUPS[tile.color]) return;
    if (tile.houses >= 4) return;

    p.money -= 50;
    tile.houses++;
    emitState();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    turn = 0;
    emitState();
  });
});

server.listen(process.env.PORT || 3000);
