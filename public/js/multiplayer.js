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
  

      // Add skin selector setup
      const skinSelector = document.querySelector(".skin-selector");
      skinSelector.innerHTML = ""; // Clear existing content
      this.availableSkins.forEach((skin) => {
        const skinOption = document.createElement("div");
        skinOption.className = `skin-option ${skin.id} ${
          skin.id === this.selectedSkin ? "selected" : ""
        }`;
        skinOption.setAttribute("data-skin", skin.id);
        skinOption.onclick = () => this.selectSkin(skin.id);
        skinSelector.appendChild(skinOption);
      });
    }  
    selectSkin(skinId) {
      this.selectedSkin = skinId;
      localStorage.setItem("selectedSkin", skinId);
      document.querySelectorAll(".skin-option").forEach((option) => {
        option.classList.toggle(
          "selected",
          option.getAttribute("data-skin") === skinId
        );
      });
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

    

      
    
      this.socket.on("bullet_spawned", (data) => {
          const bullet = new Bullet(
              data.x,
              data.y,
              game.player.stats.bulletSpeed,
              data.direction,
              data.playerId === this.socket.id ? "yellow" : "red" // Color based on player
          );
          game.bullets.push(bullet);
      });
    
      this.socket.on("enemy_spawned", (data) => {
          const enemyClass = window[data.type];
          if (enemyClass) {
            const enemy = new enemyClass(data.x, data.y, game.player);
            enemy.id = data.id;
            enemy.health = data.health;
            game.enemies.push(enemy);
          }
        });
      
  
      this.socket.on("enemy_moved", (data) => {
          const enemy = game.enemies.find((e) => e.id === data.enemyId);
          if (enemy) {
            enemy.x = data.x;
            enemy.y = data.y;
          }
      });

      this.socket.on("enemy_state", (data) => {
          const enemy = game.enemies.find(e => e.id === data.id);
          if (enemy) {
              enemy.x = data.x;
              enemy.y = data.y;
              enemy.health = data.health;
          } else {
              // If enemy does not exist, spawn it
              const enemyClass = window[data.type];
              if (enemyClass) {
                  const newEnemy = new enemyClass(data.x, data.y, game.player);
                  newEnemy.id = data.id;
                  newEnemy.health = data.health;
                  game.enemies.push(newEnemy);
              }
          }
      });
    
      this.socket.on("enemy_died", (enemyId) => {
          game.enemies = game.enemies.filter(e => e.id !== enemyId);
      });

        this.socket.on("wave_timer_update", (data) => {
            console.log(`Received wave timer update: ${data.timeLeft} seconds left`);
        game.waveManager.timeLeft = data.timeLeft;
    });

    this.socket.on("all_players_ready", () => {
        document.getElementById("startWaveBtn").textContent = "Start Wave";
        document.getElementById("startWaveBtn").disabled = false;
    });

    this.socket.on("player_waiting", () => {
        document.getElementById("startWaveBtn").textContent = "Waiting for other player...";
        document.getElementById("startWaveBtn").disabled = true;
    });
      }  
    createRoom() {
    this.initializeSocket();
      this.socket.emit("create_room");
    }
  
    joinRoom(code) {
      this.initializeSocket();
      
      // Store the room code for the joining player
      this.roomCode = code.toUpperCase();
      
      this.socket.emit("join_room", this.roomCode);
  }
  

    setupSocketListeners() {
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "room_created":
            this.roomCode = data.roomCode;
            // Display room code to host
            document.getElementById(
              "roomCodeDisplay"
            ).textContent = `Room Code: ${this.roomCode}`;
            document.getElementById("waitingOverlay").classList.add("show");
            break;
          case "game_start":
            document.getElementById("waitingOverlay").classList.remove("show");
            game.startGame();
            break;
        }
      };
    }  
  }
  