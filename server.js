const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

/* ===== BOARD ===== */
const board = [
  { id:1, name:"GO", type:"go" },
  { id:2, name:"Yamuna Vihar", type:"property", price:100 },
  { id:3, name:"Shahdara", type:"property", price:120 },
  { id:4, name:"Chance", type:"chance" },
  { id:5, name:"Income Tax", type:"tax", amount:200 },
  { id:6, name:"Rajiv Chowk Metro", type:"metro" },
  { id:7, name:"Mayur Vihar", type:"property", price:140 },
  { id:8, name:"Laxmi Nagar", type:"property", price:160 },
  { id:9, name:"Preet Vihar", type:"property", price:180 },
  { id:10, name:"Jail", type:"jail" },
  { id:11, name:"Lajpat Nagar", type:"property", price:200 },
  { id:12, name:"Malviya Nagar", type:"property", price:220 },
  { id:13, name:"Saket", type:"property", price:240 },
  { id:14, name:"Kashmere Gate Metro", type:"metro" },
  { id:15, name:"Rohini", type:"property", price:260 },
  { id:16, name:"Pitampura", type:"property", price:280 },
  { id:17, name:"Shalimar Bagh", type:"property", price:300 },
  { id:18, name:"Free Parking", type:"free" },
  { id:19, name:"Karol Bagh", type:"property", price:320 },
  { id:20, name:"Narela", type:"property", price:340 },
  { id:21, name:"Punjabi Bagh", type:"property", price:360 },
  { id:22, name:"INA Metro", type:"metro" },
  { id:23, name:"Janakpuri", type:"property", price:380 },
  { id:24, name:"Dwarka", type:"property", price:400 },
  { id:25, name:"Uttam Nagar", type:"property", price:420 },
  { id:26, name:"Go To Jail", type:"gojail" },
  { id:27, name:"Greater Kailash", type:"property", price:450 },
  { id:28, name:"South Extension", type:"property", price:470 },
  { id:29, name:"Defence Colony", type:"property", price:500 },
  { id:30, name:"Central Secretariat Metro", type:"metro" },
  { id:31, name:"Chance", type:"chance" },
  { id:32, name:"Luxury Tax", type:"tax", amount:150 },
  { id:33, name:"Property Tax", type:"tax", amount:150 },
  { id:34, name:"Lajpat Nagar Metro", type:"metro" },
  { id:35, name:"Chance", type:"chance" },
  { id:36, name:"Noida City Centre Metro", type:"metro" },
  { id:37, name:"Wealth Tax", type:"tax", amount:100 },
  { id:38, name:"Chanakyapuri", type:"property", price:550 },
  { id:39, name:"Civil Lines", type:"property", price:580 },
  { id:40, name:"GO", type:"go" }
];

let game = {
  players: [],
  turn: 0,
  properties: {},
  pendingBuy: null,
  message: ""
};

const baseRent = price => Math.floor(price * 0.1);

function metroCount(ownerId) {
  return Object.entries(game.properties)
    .filter(([id, pid]) =>
      board.find(t => t.id == id && t.type === "metro" && pid === ownerId)
    ).length;
}

function nextTurn() {
  if (game.players.length > 0) {
    game.turn = (game.turn + 1) % game.players.length;
  }
}

function emit() {
  io.emit("update", game);
}

io.on("connection", socket => {

  socket.on("join", name => {
    if (!name) return;
    game.players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 1
    });
    emit();
  });

  socket.on("roll", () => {
    const p = game.players[game.turn];
    if (!p || p.id !== socket.id) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    p.position += dice;
    if (p.position > 40) p.position -= 40;

    const tile = board[p.position - 1];
    game.message = `${p.name} rolled ${dice} and landed on ${tile.name}`;

    if (tile.type === "property") {
      const owner = game.properties[tile.id];
      if (!owner) {
        game.pendingBuy = { tile, playerId: p.id };
        emit(); return;
      }
      if (owner !== p.id) {
        const rent = baseRent(tile.price);
        p.money -= rent;
        game.players.find(x => x.id === owner).money += rent;
      }
    }

    if (tile.type === "metro") {
      const owner = game.properties[tile.id];
      if (!owner) {
        game.pendingBuy = { tile, playerId: p.id };
        emit(); return;
      }
      if (owner !== p.id) {
        const rents = [0,25,50,100,200];
        const r = rents[metroCount(owner)];
        p.money -= r;
        game.players.find(x => x.id === owner).money += r;
      }
    }

    nextTurn();
    emit();
  });

  socket.on("buy", () => {
    const pb = game.pendingBuy;
    if (!pb || pb.playerId !== socket.id) return;

    const p = game.players.find(x => x.id === socket.id);
    const cost = pb.tile.price || 200;

    if (p.money >= cost) {
      p.money -= cost;
      game.properties[pb.tile.id] = p.id;
    }

    game.pendingBuy = null;
    nextTurn();
    emit();
  });

  socket.on("skip", () => {
    game.pendingBuy = null;
    nextTurn();
    emit();
  });
});

server.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
