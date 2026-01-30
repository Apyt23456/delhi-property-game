const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

/* ===== BOARD ===== */
const board = [
  { id:1, name:"GO", type:"go" },

  { id:2, name:"Yamuna Vihar", price:100, color:"brown", owner:null, houses:0, hotel:false },
  { id:3, name:"Shahdara", price:120, color:"brown", owner:null, houses:0, hotel:false },

  { id:4, name:"Chance", type:"chance" },
  { id:5, name:"Income Tax", type:"tax", tax:200 },

  { id:6, name:"Rajiv Chowk Metro", type:"metro", price:200, owner:null },

  { id:7, name:"Mayur Vihar", price:140, color:"lightblue", owner:null, houses:0, hotel:false },
  { id:8, name:"Laxmi Nagar", price:160, color:"lightblue", owner:null, houses:0, hotel:false },
  { id:9, name:"Preet Vihar", price:180, color:"lightblue", owner:null, houses:0, hotel:false },

  { id:10, name:"Jail", type:"jail" },

  { id:11, name:"Lajpat Nagar", price:200, color:"pink", owner:null, houses:0, hotel:false },
  { id:12, name:"Malviya Nagar", price:220, color:"pink", owner:null, houses:0, hotel:false },
  { id:13, name:"Saket", price:240, color:"pink", owner:null, houses:0, hotel:false },

  { id:14, name:"Kashmere Gate Metro", type:"metro", price:200, owner:null },

  { id:15, name:"Rohini", price:260, color:"orange", owner:null, houses:0, hotel:false },
  { id:16, name:"Pitampura", price:280, color:"orange", owner:null, houses:0, hotel:false },
  { id:17, name:"Shalimar Bagh", price:300, color:"orange", owner:null, houses:0, hotel:false },

  { id:18, name:"Free Parking", type:"free" },

  { id:19, name:"Karol Bagh", price:320, color:"red", owner:null, houses:0, hotel:false },
  { id:20, name:"Narela", price:340, color:"red", owner:null, houses:0, hotel:false },
  { id:21, name:"Punjabi Bagh", price:360, color:"red", owner:null, houses:0, hotel:false },

  { id:22, name:"INA Metro", type:"metro", price:200, owner:null },

  { id:23, name:"Janakpuri", price:380, color:"yellow", owner:null, houses:0, hotel:false },
  { id:24, name:"Dwarka", price:400, color:"yellow", owner:null, houses:0, hotel:false },
  { id:25, name:"Uttam Nagar", price:420, color:"yellow", owner:null, houses:0, hotel:false },

  { id:26, name:"Go To Jail", type:"go-jail" },

  { id:27, name:"Greater Kailash", price:450, color:"green", owner:null, houses:0, hotel:false },
  { id:28, name:"South Extension", price:470, color:"green", owner:null, houses:0, hotel:false },
  { id:29, name:"Defence Colony", price:500, color:"green", owner:null, houses:0, hotel:false },

  { id:30, name:"Central Secretariat Metro", type:"metro", price:200, owner:null },

  { id:31, name:"Community Chest", type:"community" },
  { id:32, name:"Luxury Tax", type:"tax", tax:150 },
  { id:33, name:"Property Tax", type:"tax", tax:150 },

  { id:34, name:"Lajpat Nagar Metro", type:"metro", price:200, owner:null },
  { id:35, name:"Chance", type:"chance" },
  { id:36, name:"Noida City Centre Metro", type:"metro", price:200, owner:null },

  { id:37, name:"Wealth Tax", type:"tax", tax:100 },

  { id:38, name:"Chanakyapuri", price:550, color:"blue", owner:null, houses:0, hotel:false },
  { id:39, name:"Civil Lines", price:580, color:"blue", owner:null, houses:0, hotel:false },

  { id:40, name:"GO", type:"go" }
];

/* ===== CHANCE & COMMUNITY CARDS ===== */
const chanceCards = [
  { text:"Advance to GO. Collect ₹200.", action:p=>{p.position=1; p.money+=200;} },
  { text:"Go to Jail. Do not collect ₹200.", action:p=>{p.position=10; p.jailTurns=1;} },
  { text:"Bank pays you dividend of ₹100.", action:p=>{p.money+=100;} },
  { text:"Pay poor tax of ₹50.", action:p=>{p.money-=50;} },
  { text:"Advance to Chanakyapuri.", action:p=>{p.position=38;} }
];

const communityCards = [
  { text:"Bank error in your favor. Collect ₹200.", action:p=>{p.money+=200;} },
  { text:"Doctor's fee. Pay ₹50.", action:p=>{p.money-=50;} },
  { text:"Sale of stock. Collect ₹100.", action:p=>{p.money+=100;} },
  { text:"Go to Jail.", action:p=>{p.position=10; p.jailTurns=1;} },
  { text:"Income tax refund. Collect ₹50.", action:p=>{p.money+=50;} }
];

let players = [];
let turnIndex = 0;
let awaitingBuy = null;
let message = "";
let cardPopup = null;

function emit() {
  io.emit("update", {
    board,
    players,
    turnIndex,
    awaitingBuy,
    message,
    cardPopup
  });
}

io.on("connection", socket => {
  emit();

  socket.on("join", name => {
    players.push({
      id:socket.id,
      name,
      money:1500,
      position:1,
      jailTurns:0,
      doubles:0
    });
    message = `${name} joined`;
    emit();
  });

  socket.on("roll", () => {
    const p = players[turnIndex];
    if (!p || p.id !== socket.id || awaitingBuy || cardPopup) return;

    const dice = Math.floor(Math.random()*6)+1 + Math.floor(Math.random()*6)+1;
    p.position += dice;
    if (p.position > 40) {
      p.position -= 40;
      p.money += 200;
    }

    const tile = board[p.position-1];
    message = `${p.name} rolled ${dice} → ${tile.name}`;

    if (tile.type === "chance") {
      const card = chanceCards[Math.floor(Math.random()*chanceCards.length)];
      card.action(p);
      cardPopup = { title:"Chance", text:card.text };
    }

    if (tile.type === "community") {
      const card = communityCards[Math.floor(Math.random()*communityCards.length)];
      card.action(p);
      cardPopup = { title:"Community Chest", text:card.text };
    }

    turnIndex = (turnIndex+1)%players.length;
    emit();
  });

  socket.on("closeCard", () => {
    cardPopup = null;
    emit();
  });
});

server.listen(process.env.PORT || 3000);
