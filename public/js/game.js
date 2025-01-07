class Game {
  constructor(canvas, isMultiplayer = false) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.state = GameState.MAIN_MENU;

      // Initialize managers
      this.inputManager = new InputManager(this);
      this.scoreManager = new ScoreManager();
      this.waveManager = new WaveManager(this);
      this.shopManager = new ShopManager(this);

      // Core game elements
      this.player = new Player(
          this.canvas.width / 2 - 15,
          this.canvas.height / 2 - 15,
          4,
          "blue"
      );
      
      this.bullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.damageIndicators = [];
      this.currencyDrops = [];
      this.pendingLevelUps = 0;

      // Multiplayer setup
      this.isMultiplayer = isMultiplayer;
      this.isHost = false;
      if (isMultiplayer) {
          this.multiplayerManager = new MultiplayerManager();
          this.multiplayerManager.initializeSocket();
          this.isHost = true;
      }

      // Initialize input handling
      this.inputManager.setupEventListeners();
  }

  update(deltaTime) {
      if (this.state === GameState.PLAYING) {
          this.handleMultiplayerUpdates();
          this.waveManager.update(deltaTime);
          this.updateGameElements(deltaTime);
          this.checkCollisions();
      }
  }

  handleMultiplayerUpdates() {
      if (this.isMultiplayer) {
          if (this.isHost) {
              this.enemies.forEach(enemy => {
                  this.multiplayerManager.socket.emit("enemy_update", {
                      roomCode: this.multiplayerManager.roomCode,
                      id: enemy.id,
                      x: enemy.x,
                      y: enemy.y,
                      health: enemy.health,
                  });
              });
          }

          this.multiplayerManager.socket.emit("player_update", {
              roomCode: this.multiplayerManager.roomCode,
              x: this.player.x,
              y: this.player.y,
              rotation: this.player.rotation,
              direction: this.player.direction
          });
      }
  }

  updateGameElements(deltaTime) {
      this.player.update(this.inputManager.getKeys(), this.canvas);
      this.bullets = this.bullets.filter(bullet => {
          bullet.update(this.canvas);
          return bullet.active;
      });
      this.updateCurrencyDrops();
      this.updateEnemies();
      this.updateDamageIndicators();
  }

  updateCurrencyDrops() {
      this.currencyDrops = this.currencyDrops.filter(drop => {
          if (checkCollision(this.player, drop)) {
              this.player.currency += drop.amount;
              return false;
          }
          return drop.active;
      });
  }

  updateEnemies() {
      this.enemies.forEach(enemy => enemy.update(this.canvas, this.player, this));
      this.enemies = this.enemies.filter(e => e.active);
  }

  updateDamageIndicators() {
      this.damageIndicators = this.damageIndicators.filter(indicator => {
          indicator.update();
          return indicator.life > 0;
      });
  }

  draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
          this.player.draw(this.ctx);
          this.bullets.forEach(bullet => bullet.draw(this.ctx));
          this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
          this.enemies.forEach(enemy => enemy.draw(this.ctx));
          this.currencyDrops.forEach(drop => drop.draw(this.ctx));
          this.damageIndicators.forEach(indicator => indicator.draw(this.ctx));
          this.drawHUD();
      }

      if (this.isMultiplayer && this.otherPlayer) {
          this.otherPlayer.draw(this.ctx);
      }
  }

  drawHUD() {
      // HUD drawing implementation
  }

  startGame() {
      this.state = GameState.PLAYING;
      this.waveManager.start();
  }

  pauseGame() {
      this.state = GameState.PAUSED;
  }

  resumeGame() {
      this.state = GameState.PLAYING;
  }

  endGame() {
      this.state = GameState.GAME_OVER;
      this.scoreManager.saveHighScore();
      this.showGameOverScreen();
  }

  resetGame() {
      this.player = new Player(
          this.canvas.width / 2 - 15,
          this.canvas.height / 2 - 15,
          4,
          "blue"
      );
      this.bullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.currencyDrops = [];
      this.damageIndicators = [];
      this.scoreManager.reset();
      this.waveManager.reset();
  }
}
