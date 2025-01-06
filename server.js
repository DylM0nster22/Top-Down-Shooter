const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from public directory
app.use(express.static('public'));

const rooms = new Map();

io.on('connection', socket => {
    socket.on('create_room', () => {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, {
            players: [socket.id],
            gameState: 'waiting'
        });
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
    });

    socket.on('join_room', (roomCode) => {
        const room = rooms.get(roomCode);
        if (room && room.players.length < 2) {
            room.players.push(socket.id);
            socket.join(roomCode);
            io.to(roomCode).emit('game_start');
        }
    });

    socket.on('position_update', (data) => {
        socket.to(data.roomCode).emit('player_moved', {
            id: socket.id,
            x: data.x,
            y: data.y
        });
    });
});

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
