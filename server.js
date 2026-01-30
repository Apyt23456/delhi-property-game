const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD ===== */
const board = [
  { name:"GO", type:"go" },

  { name:"Yamuna Vihar", price:100, color:"brown", owner:null },
  { name:"Shahdara", price:120, color:"brown", owner:null },

  { name:"Chance", type:"chance" },
  { name:"Income Tax", type:"tax", tax:200 },

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

  { name:"Go To Jail", type:"go-jail" },

  { name:"Greater Kailash", price:450, color:"green", owner:null },
  { name:"South Extension", price:470, color:"green", owner:null },
  { name:"Defence Colony", price:500, color:"green", owner:null },

  { name:"Central Secretariat Metro", type:"metro", price:200, owner:null },

  { name:"Community Chest", type:"community" },
  { name:"Luxury Tax", type:"tax", tax:150 },
  { name:"Property Tax", type:"tax", tax:150 },

  { name:"Lajpat Nagar Metro", type:"metro", price:200, owner:null },
  { name:"Chance", type:"chance" },
  { name:"Noida City Centre Metro", type:"metro", price:200, owner:null },

  { name:"Wealth Tax", type:"tax", tax:100 },

  { name:"Chanakyapuri", price:550, color:"blue", owner:null },
  { name:"Civil Lines", price:580, color:"blue", owner:null },

  { name:"GO", type:"go" }
];

/* ===== CARDS ===== */
const chanceCards = [
  p => ({ title:"Chance", text:"Advance to GO. Collect ₹200.", apply:()=>{p.position=0; p.money+=200;} }),
  p => ({ title:"Chance", text:"Go to Jail.", apply:()=>{p.position=9;} }),
  p => ({ title:"Chance", text:"Bank pays you ₹100.", apply:()=>{p.money+=100;} }),
  p => ({ title:"Chance", text:"Pay poor tax ₹50.", apply:()=>{p.money-=50;} })
];

const communityCards = [
  p => ({ title:"Community Chest", text:"Bank error in your favor. Collect ₹200.", apply:()=>{p.money+=200;} }),
  p => ({ title:"Community Chest", text:"Doctor's fee. Pay ₹50.", apply:()=>{p.money-=50;} }),
  p => ({ title:"Community Chest", text:"Sale of stock. Collect ₹100.", apply:()=>{p.money+=100;} }),
  p => ({ title:"Community Chest", text:"Go to Jail.", apply:()=>{p.position=9;} })
];

let players = [];
let turn = 0;
let awaitingBuy = null;
let message = "";
let cardPopup = null;

function emit() {
  io.emit("update", {
    board,
    players,
    turn,
    awaitingBuy,
    message,
    cardPopup
  });
}

io.on("connection", socket => {
  emit();

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
    emit();
  });

  socket.on("roll", () => {
    const p = players[turn];
    if (!p || p.id !== socket.id || awaitingBuy || cardPopup) return;

    const dice = Math.floor(Math.random()*6+1) + Math.floor(Math.random()*6+1);
    p.position = (p.position + dice) % board.length;

    const tile = board[p.position];
    message = `${p.name} rolled ${dice} → ${tile.name}`;

    if (tile.type === "chance") {
      const card = chanceCards[Math.floor(Math.random()*chanceCards.length)](p);
      card.apply();
      cardPopup = card;
    }

    if (tile.type === "community") {
      const card = communityCards[Math.floor(Math.random()*communityCards.length)](p);
      card.apply();
      cardPopup = card;
    }

    if (tile.price && !tile.owner) {
      awaitingBuy = { playerId:p.id, tileIndex:p.position };
    } else {
      turn = (turn + 1) % players.length;
    }

    emit();
  });

  socket.on("buy", () => {
    if (!awaitingBuy) return;

    const { playerId, tileIndex } = awaitingBuy;
    const p = players.find(x => x.id === playerId);
    const tile = board[tileIndex];

    if (p && tile && p.money >= tile.price) {
      p.money -= tile.price;
      tile.owner = p.id;
    }

    awaitingBuy = null;
    turn = (turn + 1) % players.length;
    emit();
  });

  socket.on("closeCard", () => {
    cardPopup = null;
    turn = (turn + 1) % players.length;
    emit();
  });
});

server.listen(process.env.PORT || 3000);
