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
        this.socket = new WebSocket('wss://your-vercel-deployment.vercel.app');
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
