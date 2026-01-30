const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.static("public"));

/* ================= GAME DATA ================= */

const board = [
  { name: "GO" },
  { name: "Yamuna Vihar", price: 100, color: "brown" },
  { name: "Shahdara", price: 120, color: "brown" },
  { name: "Chance" },
  { name: "Income Tax" },
  { name: "Rajiv Chowk Metro", price: 200, type: "metro" },
  { name: "Mayur Vihar", price: 140, color: "lightblue" },
  { name: "Laxmi Nagar", price: 160, color: "lightblue" },
  { name: "Preet Vihar", price: 180, color: "lightblue" },
  { name: "Jail" },
  { name: "Lajpat Nagar", price: 200, color: "pink" },
  { name: "Malviya Nagar", price: 220, color: "pink" },
  { name: "Saket", price: 240, color: "pink" },
  { name: "Kashmere Gate Metro", price: 200, type: "metro" },
  { name: "Rohini", price: 260, color: "orange" },
  { name: "Pitampura", price: 280, color: "orange" },
  { name: "Shalimar Bagh", price: 300, color: "orange" },
  { name: "Free Parking" },
  { name: "Karol Bagh", price: 320, color: "red" },
  { name: "Narela", price: 340, color: "red" },
  { name: "Punjabi Bagh", price: 360, color: "red" },
  { name: "INA Metro", price: 200, type: "metro" },
  { name: "Janakpuri", price: 380, color: "yellow" },
  { name: "Dwarka", price: 400, color: "yellow" },
  { name: "Uttam Nagar", price: 420, color: "yellow" },
  { name: "Go To Jail" },
  { name: "Greater Kailash", price: 450, color: "green" },
  { name: "South Extension", price: 470, color: "green" },
  { name: "Defence Colony", price: 500, color: "green" },
  { name: "Central Secretariat Metro", price: 200, type: "metro" },
  { name: "Chance" },
  { name: "Luxury Tax" },
  { name: "Property Tax" },
  { name: "Lajpat Nagar Metro", price: 200, type: "metro" },
  { name: "Chance" },
  { name: "Noida City Centre Metro", price: 200, type: "metro" },
  { name: "Wealth Tax" },
  { name: "Chanakyapuri", price: 550, color: "blue" },
  { name: "Civil Lines", price: 580, color: "blue" }
];

/* ================= GAME STATE ================= */

let players = [];
let turn = 0;
let awaitingBuy = null;

/* ================= HELPERS ================= */

function getMetroRent(ownerId) {
  const metros = board.filter(
    t => t.type === "metro" && t.owner === ownerId
  ).length;

  if (metros === 1) return 25;
  if (metros === 2) return 50;
  if (metros === 3) return 100;
  if (metros >= 4) return 200;
  return 0;
}

function emitState() {
  io.emit("state", {
    board,
    players,
    turn,
    awaitingBuy
  });
}

/* ================= SOCKET ================= */

io.on("connection", socket => {
  console.log("Connected:", socket.id);

  socket.on("join", name => {
    if (players.find(p => p.id === socket.id)) return;

    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 0,
      inJail: false
    });

    emitState();
  });

  socket.on("roll", () => {
    if (players.length === 0) return;
    if (players[turn].id !== socket.id) return;

    const d1 = Math.ceil(Math.random() * 6);
    const d2 = Math.ceil(Math.random() * 6);
    const steps = d1 + d2;

    const player = players[turn];
    player.position = (player.position + steps) % board.length;

    const tile = board[player.position];

    // Go to Jail
    if (tile.name === "Go To Jail") {
      player.position = board.findIndex(t => t.name === "Jail");
      player.inJail = true;
      turn = (turn + 1) % players.length;
      emitState();
      return;
    }

    // Property logic
    if (tile.price && tile.owner && tile.owner !== player.id) {
      let rent = 0;

      if (tile.type === "metro") {
        rent = getMetroRent(tile.owner);
      } else {
        rent = Math.floor(tile.price * 0.1);
      }

      player.money -= rent;
      const owner = players.find(p => p.id === tile.owner);
      if (owner) owner.money += rent;
    }

    // Buy option
    if (tile.price && !tile.owner) {
      awaitingBuy = {
        playerId: player.id,
        tileIndex: player.position
      };
      emitState();
      return;
    }

    turn = (turn + 1) % players.length;
    emitState();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;

    const player = players.find(p => p.id === socket.id);
    if (!player) return;

    const tile = board[awaitingBuy.tileIndex];
    if (player.money < tile.price) {
      awaitingBuy = null;
      turn = (turn + 1) % players.length;
      emitState();
      return;
    }

    player.money -= tile.price;
    tile.owner = player.id;

    awaitingBuy = null;
    turn = (turn + 1) % players.length;
    emitState();
  });

  socket.on("skipBuy", () => {
    if (!awaitingBuy) return;
    awaitingBuy = null;
    turn = (turn + 1) % players.length;
    emitState();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (turn >= players.length) turn = 0;
    emitState();
  });
});

/* ================= START ================= */

server.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
