const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const board = Array.from({ length: 40 }, (_, i) => ({
  name: `Tile ${i + 1}`,
  owner: null
}));

let players = [];
let turn = 0;

io.on("connection", socket => {
  console.log("CONNECTED:", socket.id);

  socket.on("join", name => {
    console.log("JOIN:", name);

    players.push({
      id: socket.id,
      name: name || "Player",
      position: 0,
      money: 1500
    });

    io.emit("state", { board, players, turn });
  });

  socket.on("roll", () => {
    const p = players[turn];
    if (!p || p.id !== socket.id) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    p.position = (p.position + dice) % 40;

    turn = (turn + 1) % players.length;
    io.emit("state", { board, players, turn });
  });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("SERVER RUNNING")
);
