const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD DATA (40 TILES) ===== */
const board = [
  { id: 1, name: "India Gate", type: "GO" },
  { id: 2, name: "Yamuna Vihar", price: 100 },
  { id: 3, name: "Shahdara", price: 120 },
  { id: 4, name: "Chance", type: "chance" },
  { id: 5, name: "Income Tax", type: "tax" },
  { id: 6, name: "Rajiv Chowk Metro", type: "metro", price: 200 },
  { id: 7, name: "Mayur Vihar", price: 140 },
  { id: 8, name: "Laxmi Nagar", price: 160 },
  { id: 9, name: "Preet Vihar", price: 180 },
  { id: 10, name: "Jail", type: "jail" },

  { id: 11, name: "Lajpat Nagar", price: 200 },
  { id: 12, name: "Malviya Nagar", price: 220 },
  { id: 13, name: "Saket", price: 240 },
  { id: 14, name: "Kashmere Gate Metro", type: "metro", price: 200 },
  { id: 15, name: "Rohini", price: 260 },
  { id: 16, name: "Pitampura", price: 280 },
  { id: 17, name: "Shalimar Bagh", price: 300 },
  { id: 18, name: "Free Parking", type: "free" },
  { id: 19, name: "Karol Bagh", price: 320 },
  { id: 20, name: "Narela", price: 340 },

  { id: 21, name: "Punjabi Bagh", price: 360 },
  { id: 22, name: "INA Metro", type: "metro", price: 200 },
  { id: 23, name: "Janakpuri", price: 380 },
  { id: 24, name: "Dwarka", price: 400 },
  { id: 25, name: "Uttam Nagar", price: 420 },
  { id: 26, name: "Go To Jail", type: "go-jail" },
  { id: 27, name: "Greater Kailash", price: 450 },
  { id: 28, name: "South Extension", price: 470 },
  { id: 29, name: "Defence Colony", price: 500 },
  { id: 30, name: "Central Secretariat Metro", type: "metro", price: 200 },

  { id: 31, name: "Chance", type: "chance" },
  { id: 32, name: "Luxury Tax", type: "tax" },
  { id: 33, name: "Property Tax", type: "tax" },
  { id: 34, name: "Lajpat Nagar Metro", type: "metro", price: 200 },
  { id: 35, name: "Chance", type: "chance" },
  { id: 36, name: "Noida City Centre Metro", type: "metro", price: 200 },
  { id: 37, name: "Wealth Tax", type: "tax" },
  { id: 38, name: "Chanakyapuri", price: 550 },
  { id: 39, name: "Civil Lines", price: 580 },
  { id: 40, name: "India Gate", type: "GO" }
];

/* ===== GAME STATE ===== */
let players = [];
let turnIndex = 0;
let message = "";

/* ===== SOCKET LOGIC ===== */
io.on("connection", socket => {

  socket.on("join", name => {
    if (!name) return;

    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 1
    });

    message = `${name} joined the game`;
    io.emit("update", { board, players, turnIndex, message });
  });

  socket.on("roll", () => {
    if (players.length === 0) return;

    const player = players[turnIndex];
    if (player.id !== socket.id) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    player.position += dice;

    if (player.position > 40) {
      player.position -= 40;
      player.money += 200; // pass GO
    }

    const tile = board[player.position - 1];
    message = `${player.name} rolled ${dice} and landed on ${tile.name}`;

    turnIndex = (turnIndex + 1) % players.length;
    io.emit("update", { board, players, turnIndex, message });
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (turnIndex >= players.length) turnIndex = 0;

    io.emit("update", { board, players, turnIndex, message: "Player left" });
  });
});

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
