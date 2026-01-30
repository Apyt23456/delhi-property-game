const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD WITH COLOR GROUPS ===== */
const board = [
  { id:1, name:"GO", type:"go" },

  { id:2, name:"Yamuna Vihar", price:100, color:"brown", owner:null, houses:0 },
  { id:3, name:"Shahdara", price:120, color:"brown", owner:null, houses:0 },

  { id:4, name:"Chance", type:"chance" },
  { id:5, name:"Income Tax", type:"tax", tax:200 },

  { id:6, name:"Rajiv Chowk Metro", type:"metro", price:200, owner:null },

  { id:7, name:"Mayur Vihar", price:140, color:"lightblue", owner:null, houses:0 },
  { id:8, name:"Laxmi Nagar", price:160, color:"lightblue", owner:null, houses:0 },
  { id:9, name:"Preet Vihar", price:180, color:"lightblue", owner:null, houses:0 },

  { id:10, name:"Jail", type:"jail" },

  { id:11, name:"Lajpat Nagar", price:200, color:"pink", owner:null, houses:0 },
  { id:12, name:"Malviya Nagar", price:220, color:"pink", owner:null, houses:0 },
  { id:13, name:"Saket", price:240, color:"pink", owner:null, houses:0 },

  { id:14, name:"Kashmere Gate Metro", type:"metro", price:200, owner:null },

  { id:15, name:"Rohini", price:260, color:"orange", owner:null, houses:0 },
  { id:16, name:"Pitampura", price:280, color:"orange", owner:null, houses:0 },
  { id:17, name:"Shalimar Bagh", price:300, color:"orange", owner:null, houses:0 },

  { id:18, name:"Free Parking", type:"free" },

  { id:19, name:"Karol Bagh", price:320, color:"red", owner:null, houses:0 },
  { id:20, name:"Narela", price:340, color:"red", owner:null, houses:0 },
  { id:21, name:"Punjabi Bagh", price:360, color:"red", owner:null, houses:0 },

  { id:22, name:"INA Metro", type:"metro", price:200, owner:null },

  { id:23, name:"Janakpuri", price:380, color:"yellow", owner:null, houses:0 },
  { id:24, name:"Dwarka", price:400, color:"yellow", owner:null, houses:0 },
  { id:25, name:"Uttam Nagar", price:420, color:"yellow", owner:null, houses:0 },

  { id:26, name:"Go To Jail", type:"go-jail" },

  { id:27, name:"Greater Kailash", price:450, color:"green", owner:null, houses:0 },
  { id:28, name:"South Extension", price:470, color:"green", owner:null, houses:0 },
  { id:29, name:"Defence Colony", price:500, color:"green", owner:null, houses:0 },

  { id:30, name:"Central Secretariat Metro", type:"metro", price:200, owner:null },

  { id:31, name:"Chance", type:"chance" },
  { id:32, name:"Luxury Tax", type:"tax", tax:150 },
  { id:33, name:"Property Tax", type:"tax", tax:150 },

  { id:34, name:"Lajpat Nagar Metro", type:"metro", price:200, owner:null },

  { id:35, name:"Chance", type:"chance" },

  { id:36, name:"Noida City Centre Metro", type:"metro", price:200, owner:null },

  { id:37, name:"Wealth Tax", type:"tax", tax:100 },

  { id:38, name:"Chanakyapuri", price:550, color:"blue", owner:null, houses:0 },
  { id:39, name:"Civil Lines", price:580, color:"blue", owner:null, houses:0 },

  { id:40, name:"GO", type:"go" }
];

let players = [];
let turnIndex = 0;
let awaitingBuy = null;
let message = "";

/* ===== HELPERS ===== */
const baseRent = price => Math.floor(price * 0.1);

function metroCount(owner) {
  return board.filter(t => t.type === "metro" && t.owner === owner).length;
}

function ownsFullColor(playerId, color) {
  return board
    .filter(t => t.color === color)
    .every(t => t.owner === playerId);
}

function emit() {
  io.emit("update", { board, players, turnIndex, awaitingBuy, message });
}

/* ===== SOCKET ===== */
io.on("connection", socket => {
  emit();

  socket.on("join", name => {
    players.push({
      id: socket.id,
      name,
      money: 1500,
      position: 1
    });
    message = `${name} joined`;
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

    if (tile.type === "tax") {
      p.money -= tile.tax;
    }

    if (tile.price && tile.owner && tile.owner !== p.id) {
      if (tile.type === "metro") {
        const rents = [0,25,50,100,200];
        const r = rents[metroCount(tile.owner)];
        p.money -= r;
        players.find(x => x.id === tile.owner).money += r;
      } else {
        const r = baseRent(tile.price) + tile.houses * baseRent(tile.price) * 0.5;
        p.money -= r;
        players.find(x => x.id === tile.owner).money += r;
      }
    }

    if (tile.price && !tile.owner) {
      awaitingBuy = p.id;
    } else {
      turnIndex = (turnIndex + 1) % players.length;
    }

    emit();
  });

  socket.on("buy", () => {
    const p = players[turnIndex];
    const tile = board[p.position - 1];
    if (awaitingBuy !== socket.id || p.money < tile.price) return;

    p.money -= tile.price;
    tile.owner = p.id;
    awaitingBuy = null;
    turnIndex = (turnIndex + 1) % players.length;
    message = `${p.name} bought ${tile.name}`;
    emit();
  });

  socket.on("buildHouse", tileId => {
    const p = players[turnIndex];
    const tile = board.find(t => t.id === tileId);
    if (!tile || tile.owner !== p.id || tile.houses >= 4) return;
    if (!ownsFullColor(p.id, tile.color)) return;

    const cost = Math.floor(tile.price * 0.5);
    if (p.money < cost) return;

    p.money -= cost;
    tile.houses++;
    message = `${p.name} built a house on ${tile.name}`;
    emit();
  });

  socket.on("skip", () => {
    awaitingBuy = null;
    turnIndex = (turnIndex + 1) % players.length;
    emit();
  });
});

server.listen(process.env.PORT || 3000);
