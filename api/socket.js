import { Server } from 'socket.io';

const rooms = new Map();

export default function SocketHandler(req, res) {
    if (res.socket.server.io) {
        return res.end();
    }

    const io = new Server(res.socket.server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    

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

    return res.end();
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
