const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity (restrict in production)
    methods: ["GET", "POST"],
  },
});

// Simple word list for Multiplayer Random Mode
const WORDS = ["REACT", "BUILD", "CODE", "PIZZA", "WORLD", "GHOST", "ALERT"];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join Room
  socket.on("join_room", (room) => {
    socket.join(room);
    const clients = io.sockets.adapter.rooms.get(room);
    
    // If 2 players, start game
    if (clients.size === 2) {
      const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
      io.to(room).emit("start_game", { word: randomWord });
    }
  });

  // Sync Progress (Send row colors only, not letters, to prevent cheating)
  socket.on("update_progress", ({ room, rowColors, currentRow }) => {
    socket.to(room).emit("opponent_update", { rowColors, currentRow });
  });

  // Handle Win/Loss
  socket.on("game_over", ({ room, winner, word }) => {
    io.to(room).emit("game_result", { winner: winner ? socket.id : "opponent", word });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3001; // Let Render choose the port, or use 3001 locally

server.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});