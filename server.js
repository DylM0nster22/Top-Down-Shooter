const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files from public directory
app.use(express.static("public"));

const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("create_room", () => {
      const roomCode = generateRoomCode();
      rooms.set(roomCode, {
          players: [socket.id],
          gameState: "waiting",
      });
      socket.join(roomCode);
      socket.emit("room_created", roomCode);
  });

  socket.on("join_room", (roomCode) => {
      const room = rooms.get(roomCode);
      if (room && room.players.length < 2) {
          room.players.push(socket.id);
          socket.join(roomCode);
          io.to(roomCode).emit("game_start");
      }
  });

  socket.on("player_update", (data) => {
    const room = rooms.get(data.roomCode);
    if (room) {
      io.to(data.roomCode).emit("player_state", {
        id: socket.id,
        x: data.x,
        y: data.y,
        rotation: data.rotation,
        direction: data.direction || { x: 0, y: 0 },
      });
    }
  });  
  

socket.on("bullet_fired", (data) => {
    const room = rooms.get(data.roomCode);
    if (room) {
        io.to(data.roomCode).emit("bullet_spawned", {
            x: data.x,
            y: data.y,
            direction: data.direction,
            id: Date.now(),
            playerId: socket.id, // Track which player fired
        });
    }
});


    socket.on("enemy_spawn", (data) => {
        io.to(data.roomCode).emit("enemy_spawned", {
          type: data.type,
          x: data.x,
          y: data.y,
          id: data.id,
          health: data.health
        });
      });
      
    
    
    socket.on("enemy_update", (data) => {
        const room = rooms.get(data.roomCode);
        if (room) {
            io.to(data.roomCode).emit("enemy_state", {
                id: data.id,
                x: data.x,
                y: data.y,
                health: data.health,
            });
        }
    });
    
    socket.on("enemy_killed", (data) => {
        const room = rooms.get(data.roomCode);
        if (room) {
            io.to(data.roomCode).emit("enemy_died", data.id);
        }
    });
  });

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
