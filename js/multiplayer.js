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
        this.socket = new WebSocket('wss://top-down-shooter-99s3gsqh1-dylm0nster22s-projects.vercel.app');
        this.setupSocketListeners();
    }    

    createRoom() {
        this.socket.send(JSON.stringify({
            type: 'create_room',
            skin: this.selectedSkin
        }));
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
                    break;
                case 'game_start':
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
