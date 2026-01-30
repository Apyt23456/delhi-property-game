const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD ===== */
const board = [
  { id:1, name:"India Gate", type:"GO" },
  { id:2, name:"Yamuna Vihar", price:100, owner:null },
  { id:3, name:"Shahdara", price:120, owner:null },
  { id:4, name:"Chance", type:"chance" },
  { id:5, name:"Income Tax", type:"tax" },
  { id:6, name:"Rajiv Chowk Metro", price:200, type:"metro", owner:null },
  { id:7, name:"Mayur Vihar", price:140, owner:null },
  { id:8, name:"Laxmi Nagar", price:160, owner:null },
  { id:9, name:"Preet Vihar", price:180, owner:null },
  { id:10, name:"Jail", type:"jail" },
  { id:11, name:"Lajpat Nagar", price:200, owner:null },
  { id:12, name:"Malviya Nagar", price:220, owner:null },
  { id:13, name:"Saket", price:240, owner:null },
  { id:14, name:"Kashmere Gate Metro", price:200, type:"metro", owner:null },
  { id:15, name:"Rohini", price:260, owner:null },
  { id:16, name:"Pitampura", price:280, owner:null },
  { id:17, name:"Shalimar Bagh", price:300, owner:null },
  { id:18, name:"Free Parking", type:"free" },
  { id:19, name:"Karol Bagh", price:320, owner:null },
  { id:20, name:"Narela", price:340, owner:null },
  { id:21, name:"Punjabi Bagh", price:360, owner:null },
  { id:22, name:"INA Metro", price:200, type:"metro", owner:null },
  { id:23, name:"Janakpuri", price:380, owner:null },
  { id:24, name:"Dwarka", price:400, owner:null },
  { id:25, name:"Uttam Nagar", price:420, owner:null },
  { id:26, name:"Go To Jail", type:"go-jail" },
  { id:27, name:"Greater Kailash", price:450, owner:null },
  { id:28, name:"South Extension", price:470, owner:null },
  { id:29, name:"Defence Colony", price:500, owner:null },
  { id:30, name:"Central Secretariat Metro", price:200, type:"metro", owner:null },
  { id:31, name:"Chance", type:"chance" },
  { id:32, name:"Luxury Tax", type:"tax" },
  { id:33, name:"Property Tax", type:"tax" },
  { id:34, name:"Lajpat Nagar Metro", price:200, type:"metro", owner:null },
  { id:35, name:"Chance", type:"chance" },
  { id:36, name:"Noida City Centre Metro", price:200, type:"metro", owner:null },
  { id:37, name:"Wealth Tax", type:"tax" },
  { id:38, name:"Chanakyapuri", price:550, owner:null },
  { id:39, name:"Civil Lines", price:580, owner:null },
  { id:40, name:"India Gate", type:"GO" }
];

let players = [];
let turnIndex = 0;
let message = "";
let awaitingBuy = null;

function emit() {
  io.emit("update", { board, players, turnIndex, message, awaitingBuy });
}

io.on("connection", socket => {

  socket.emit("update", { board, players, turnIndex, message, awaitingBuy });

  socket.on("join", name => {
    if (!name) return;
    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 1
    });
    message = `${name} joined the game`;
    emit();
  });

  socket.on("roll", () => {
    const p = players[turnIndex];
    if (!p || p.id !== socket.id || awaitingBuy) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    p.position += dice;

    if (p.position > 40) {
      p.position -= 40;
      p.money += 200;
    }

    const tile = board[p.position - 1];
    message = `${p.name} rolled ${dice} → ${tile.name}`;

    if (tile.price && !tile.owner) {
      awaitingBuy = p.id;
    } else {
      turnIndex = (turnIndex + 1) % players.length;
    }

    emit();
  });

  socket.on("buy", () => {
    if (awaitingBuy !== socket.id) return;

    const p = players[turnIndex];
    const tile = board[p.position - 1];

    if (p.money >= tile.price) {
      p.money -= tile.price;
      tile.owner = p.id;
      message = `${p.name} bought ${tile.name}`;
    }

    awaitingBuy = null;
    turnIndex = (turnIndex + 1) % players.length;
    emit();
  });

  socket.on("skip", () => {
    if (awaitingBuy !== socket.id) return;
    awaitingBuy = null;
    turnIndex = (turnIndex + 1) % players.length;
    emit();
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (turnIndex >= players.length) turnIndex = 0;
    awaitingBuy = null;
    emit();
  });
});

server.listen(process.env.PORT || 3000);
