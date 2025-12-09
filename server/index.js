const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const WORDS = ["REACT", "BUILD", "CODEx", "PIZZA", "WORLD", "GHOST", "ALERT"];

// 🧠 MEMORY: Store active games here
const roomState = {}; 

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    
    // 1. If game is ALREADY running in this room, join immediately!
    if (roomState[room] && roomState[room].word) {
      socket.emit("start_game", { word: roomState[room].word });
    }

    // 2. Otherwise, check if we have 2 players to start a NEW game
    const clients = io.sockets.adapter.rooms.get(room);
    if (clients.size === 2 && (!roomState[room] || !roomState[room].word)) {
      const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      
      // Save to memory
      roomState[room] = { word: randomWord };
      
      // Blast off!
      io.to(room).emit("start_game", { word: randomWord });
    }
  });

  socket.on("update_progress", ({ room, rowColors, currentRow }) => {
    socket.to(room).emit("opponent_update", { rowColors, currentRow });
  });

  socket.on("game_over", ({ room, winner, word }) => {
    io.to(room).emit("game_result", { winner: winner ? socket.id : "opponent", word });
    // Optional: Clear memory after game ends
    // delete roomState[room]; 
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});