const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const board = [
  { name:"GO", type:"go" },
  { name:"Yamuna Vihar", price:100, color:"brown" },
  { name:"Shahdara", price:120, color:"brown" },
  { name:"Chance", type:"chance" },
  { name:"Income Tax", type:"tax", amount:100 },
  { name:"Rajiv Chowk Metro", type:"metro" },
  { name:"Mayur Vihar", price:140, color:"lightblue" },
  { name:"Laxmi Nagar", price:160, color:"lightblue" },
  { name:"Preet Vihar", price:180, color:"lightblue" },
  { name:"Jail", type:"jail" },

  { name:"Lajpat Nagar", price:200, color:"pink" },
  { name:"Malviya Nagar", price:220, color:"pink" },
  { name:"Saket", price:240, color:"pink" },
  { name:"Kashmere Gate Metro", type:"metro" },
  { name:"Rohini", price:260, color:"orange" },
  { name:"Pitampura", price:280, color:"orange" },
  { name:"Shalimar Bagh", price:300, color:"orange" },
  { name:"Free Parking", type:"free" },

  { name:"Karol Bagh", price:320, color:"red" },
  { name:"Narela", price:340, color:"red" },
  { name:"Punjabi Bagh", price:360, color:"red" },
  { name:"INA Metro", type:"metro" },
  { name:"Janakpuri", price:380, color:"yellow" },
  { name:"Dwarka", price:400, color:"yellow" },
  { name:"Uttam Nagar", price:420, color:"yellow" },
  { name:"Go To Jail", type:"gojail" },

  { name:"Greater Kailash", price:450, color:"green" },
  { name:"South Extension", price:470, color:"green" },
  { name:"Defence Colony", price:500, color:"green" },
  { name:"Central Secretariat Metro", type:"metro" },
  { name:"Chance", type:"chance" },
  { name:"Luxury Tax", type:"tax", amount:150 },
  { name:"Property Tax", type:"tax", amount:100 },
  { name:"Lajpat Nagar Metro", type:"metro" },
  { name:"Chance", type:"chance" },
  { name:"Noida City Centre Metro", type:"metro" },
];

let players = {};
let currentTurn = null;

io.on("connection", socket => {

  socket.on("join", name => {
    if(players[socket.id]) return;

    players[socket.id] = {
      id: socket.id,
      name,
      pos: 0,
      money: 1500,
      properties: [],
      houses:{}
    };

    if(!currentTurn) currentTurn = socket.id;
    io.emit("state", { players, board, currentTurn });
  });

  socket.on("roll", () => {
    if(socket.id !== currentTurn) return;

    const dice = Math.floor(Math.random()*6)+1;
    const player = players[socket.id];
    player.pos = (player.pos + dice) % board.length;

    const tile = board[player.pos];

    if(tile.type === "gojail"){
      player.pos = board.findIndex(t=>t.type==="jail");
    }

    const ids = Object.keys(players);
    currentTurn = ids[(ids.indexOf(socket.id)+1)%ids.length];

    io.emit("rolled", { name:player.name, dice, tile:tile.name });
    io.emit("state", { players, board, currentTurn });
  });

  socket.on("buy", index => {
    const p = players[socket.id];
    const tile = board[index];
    if(!tile.price) return;
    if(p.money < tile.price) return;
    if(tile.owner) return;

    p.money -= tile.price;
    tile.owner = socket.id;
    p.properties.push(index);

    io.emit("state", { players, board, currentTurn });
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    if(currentTurn === socket.id){
      currentTurn = Object.keys(players)[0] || null;
    }
    io.emit("state", { players, board, currentTurn });
  });
});

http.listen(PORT, () => console.log("Running on", PORT));
