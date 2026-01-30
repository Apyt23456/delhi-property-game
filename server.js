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
  { name:"Income Tax", type:"tax", amount:200 },

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

  { name:"Go To Jail", type:"gojail" },

  { name:"Greater Kailash", price:450, color:"green", owner:null },
  { name:"South Extension", price:470, color:"green", owner:null },
  { name:"Defence Colony", price:500, color:"green", owner:null },

  { name:"Central Secretariat Metro", type:"metro", price:200, owner:null },

  { name:"Community Chest", type:"community" },
  { name:"Luxury Tax", type:"tax", amount:150 },

  { name:"Chanakyapuri", price:550, color:"blue", owner:null },
  { name:"Civil Lines", price:580, color:"blue", owner:null },

  { name:"GO", type:"go" }
];

/* ===== CARDS ===== */
const chanceCards = [
  p => ({ title:"Chance", text:"Advance to GO. Collect ₹200.", apply:()=>{p.position=0; p.money+=200;} }),
  p => ({ title:"Chance", text:"Go to Jail.", apply:()=>{p.position=jailIndex(); p.jail=2;} }),
  p => ({ title:"Chance", text:"Pay poor tax ₹50.", apply:()=>{p.money-=50;} }),
  p => ({ title:"Chance", text:"Bank pays you ₹100.", apply:()=>{p.money+=100;} })
];

const communityCards = [
  p => ({ title:"Community Chest", text:"Bank error in your favor. Collect ₹200.", apply:()=>{p.money+=200;} }),
  p => ({ title:"Community Chest", text:"Doctor fee. Pay ₹50.", apply:()=>{p.money-=50;} }),
  p => ({ title:"Community Chest", text:"Go to Jail.", apply:()=>{p.position=jailIndex(); p.jail=2;} })
];

let players = [];
let turn = 0;
let awaitingBuy = null;
let cardPopup = null;
let message = "";

function jailIndex(){
  return board.findIndex(t=>t.type==="jail");
}

function metroCount(ownerId){
  return board.filter(t=>t.type==="metro" && t.owner===ownerId).length;
}

function emit(){
  io.emit("state",{board,players,turn,awaitingBuy,cardPopup,message});
}

io.on("connection", socket => {

  emit();

  socket.on("join", name=>{
    if(!name || players.find(p=>p.id===socket.id)) return;
    players.push({
      id:socket.id,
      name,
      money:1500,
      position:0,
      jail:0,
      doubles:0
    });
    message = `${name} joined`;
    emit();
  });

  socket.on("roll", ()=>{
    const p = players[turn];
    if(!p || p.id!==socket.id || awaitingBuy || cardPopup) return;

    if(p.jail>0){
      p.jail--;
      message = `${p.name} is in Jail`;
      turn=(turn+1)%players.length;
      emit();
      return;
    }

    const d1=Math.floor(Math.random()*6)+1;
    const d2=Math.floor(Math.random()*6)+1;
    const move=d1+d2;

    if(d1===d2) p.doubles++; else p.doubles=0;
    if(p.doubles===3){
      p.position=jailIndex();
      p.jail=2;
      p.doubles=0;
      message=`${p.name} rolled 3 doubles → Jail`;
      turn=(turn+1)%players.length;
      emit();
      return;
    }

    p.position+=move;
    if(p.position>=board.length){p.position-=board.length;p.money+=200;}

    const tile=board[p.position];
    message=`${p.name} rolled ${d1}+${d2} → ${tile.name}`;

    if(tile.type==="tax") p.money-=tile.amount;

    if(tile.type==="gojail"){
      p.position=jailIndex();
      p.jail=2;
    }

    if(tile.type==="chance"){
      const c=chanceCards[Math.floor(Math.random()*chanceCards.length)](p);
      c.apply(); cardPopup=c;
    }

    if(tile.type==="community"){
      const c=communityCards[Math.floor(Math.random()*communityCards.length)](p);
      c.apply(); cardPopup=c;
    }

    if(tile.price && !tile.owner){
      awaitingBuy={playerId:p.id,tileIndex:p.position};
    }else if(tile.owner && tile.owner!==p.id){
      let rent=0;
      if(tile.type==="metro"){
        rent=[0,25,50,100,200][metroCount(tile.owner)];
      }else{
        rent=Math.floor(tile.price*0.1);
      }
      p.money-=rent;
      players.find(x=>x.id===tile.owner).money+=rent;
    }else{
      turn=(turn+1)%players.length;
    }

    emit();
  });

  socket.on("buy", ()=>{
    if(!awaitingBuy) return;
    const p=players.find(x=>x.id===awaitingBuy.playerId);
    const t=board[awaitingBuy.tileIndex];
    if(p && t && p.money>=t.price){
      p.money-=t.price;
      t.owner=p.id;
    }
    awaitingBuy=null;
    turn=(turn+1)%players.length;
    emit();
  });

  socket.on("closeCard", ()=>{
    cardPopup=null;
    turn=(turn+1)%players.length;
    emit();
  });
});

server.listen(process.env.PORT||3000);
