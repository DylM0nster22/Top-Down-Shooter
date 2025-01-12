class MultiplayerManager {
    constructor() {
        this.socket = null;
        this.roomCode = null;
        this.selectedSkin = localStorage.getItem("selectedSkin") || "default";
        this.availableSkins = [
            { id: "triangle", shape: "triangle" },
            { id: "diamond", shape: "diamond" },
            { id: "hexagon", shape: "hexagon" },
        ];

        // Fires every few milliseconds to broadcast the local player’s data
        setInterval(() => {
            if (this.socket && game.isMultiplayer) {
                this.socket.emit("player_update", {
                    roomCode: this.roomCode,
                    x: game.player.x,
                    y: game.player.y,
                    rotation: game.player.rotation,
                    direction: game.player.direction,
                });
            }
        }, 100); // or 100ms, whichever

        // Initialize socket
        this.initializeSocket();
    }

    selectSkin(skinId) {
        this.selectedSkin = skinId;
        localStorage.setItem("selectedSkin", skinId);
    }

    updatePlayerState() {
        if (this.socket && this.roomCode) {
            this.socket.emit("player_update", {
                roomCode: this.roomCode,
                x: game.player.x,
                y: game.player.y,
                rotation: game.player.rotation
            });
        }
    }

    initializeSocket() {
        this.socket = io("https://top-down-shooter.onrender.com");
        game.isMultiplayer = true; 
        console.log("Socket initialized");

        this.socket.on("room_created", (roomCode) => {
            this.roomCode = roomCode;
            document.getElementById("roomCodeDisplay").textContent = `Room Code: ${this.roomCode}`;
            document.getElementById("waitingOverlay").classList.add("show");
        });

        this.socket.on("game_start", () => {
            document.getElementById("waitingOverlay").classList.remove("show");
            document.getElementById("multiplayerMenu").classList.remove("show");
            document.getElementById("joinRoomMenu").classList.remove("show");
            game.startGame();

            // Send initial player state when game starts
            if (this.socket) {
                this.socket.emit("player_update", {
                    roomCode: this.roomCode,
                    x: game.player.x,
                    y: game.player.y,
                    rotation: game.player.rotation
                });
            }
        });

        this.socket.on("player_state", (data) => {
            if (data.id !== this.socket.id) {
                if (!game.otherPlayer) {
                    game.otherPlayer = new Player(data.x, data.y, 4, "red");
                }
                game.otherPlayer.x = data.x;
                game.otherPlayer.y = data.y;
                game.otherPlayer.rotation = data.rotation;
                game.otherPlayer.direction = data.direction || { x: 0, y: 0 };
            }
        });

        // Other socket event handlers...
    }

    createRoom() {
        this.socket.emit("create_room");
    }

    joinRoom(code) {
        // Store the room code for the joining player
        this.roomCode = code.toUpperCase();
        this.socket.emit("join_room", this.roomCode);
    }
}
