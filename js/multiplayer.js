class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.roomCode = null;
        this.selectedSkin = localStorage.getItem('selectedSkin') || 'default';
        this.availableSkins = [
            {id: 'triangle', shape: 'triangle'},
            {id: 'diamond', shape: 'diamond'},
            {id: 'hexagon', shape: 'hexagon'}
        ];
    }

    initializeSocket() {
        const isProduction = window.location.hostname !== 'localhost';
        const socketUrl = isProduction 
            ? window.location.origin  // This will automatically use the correct protocol
            : 'http://localhost:3000';
        
        this.socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            path: '/socket.io'
        });
    }
    
    createRoom() {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'create_room',
                skin: this.selectedSkin
            }));
        } else {
            this.pendingRoom = true;
        }
    }
    

    joinRoom(code) {
        this.socket.send(JSON.stringify({
            type: 'join_room',
            roomCode: code,
            skin: this.selectedSkin
        }));
    }

    setupSocketListeners() {
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch(data.type) {
                case 'room_created':
                    this.roomCode = data.roomCode;
                    // Display room code to host
                    document.getElementById('roomCodeDisplay').textContent = `Room Code: ${this.roomCode}`;
                    document.getElementById('waitingOverlay').classList.add('show');
                    break;
                case 'game_start':
                    document.getElementById('waitingOverlay').classList.remove('show');
                    game.startGame();
                    break;
                case 'player_moved':
                    game.updateOtherPlayerPosition(data.x, data.y);
                    break;
            }
        };
    }
    

    updatePlayerPosition(x, y) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'position_update',
                x: x,
                y: y,
                roomCode: this.roomCode
            }));
        }
    }
}
