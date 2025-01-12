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
    localStorage.getItem("selectedSkin") || "blue", // Set default skin
    "blue" // Default color
);
      
      this.bullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.damageIndicators = [];
      this.currencyDrops = [];
      this.pendingLevelUps = 0;

      this.hud = new HUD(this);
      this.levelManager = new LevelManager(this);

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
    
    // Add this section to update enemy bullets
    this.enemyBullets = this.enemyBullets.filter(bullet => {
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
    this.hud.draw(this.ctx);
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

  shoot(e) {
    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    let dx = mouseX - playerCenterX;
    let dy = mouseY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const direction = {
        x: dx / distance,
        y: dy / distance
    };

    // In multiplayer, only emit the event
    if (this.isMultiplayer) {
        this.multiplayerManager.socket.emit("bullet_fired", {
            roomCode: this.multiplayerManager.roomCode,
            x: playerCenterX,
            y: playerCenterY,
            direction: direction
        });
        return; // Don't create bullet locally
    }

    // Create bullets locally only in single player
    if (distance !== 0) {
        dx /= distance;
        dy /= distance;
    }

    const shots = 1 + (this.player.stats.multiShot || 0);
    for (let i = 0; i < shots; i++) {
        const spread = (i - (shots - 1) / 2) * 0.2;
        let adjustedDx = dx * Math.cos(spread) - dy * Math.sin(spread);
        let adjustedDy = dx * Math.sin(spread) + dy * Math.cos(spread);

        const isCrit = Math.random() < (this.player.stats.critChance || 0);
        const bulletDamage = this.player.stats.damage * (isCrit ? 2 : 1);

        const bullet = new Bullet(
            playerCenterX,
            playerCenterY,
            this.player.stats.bulletSpeed,
            { x: adjustedDx, y: adjustedDy },
            "yellow",
            bulletDamage
        );
        this.bullets.push(bullet);
    }
  }
  checkCollisions() {
    // Player bullets -> enemies
    this.bullets.forEach(bullet => {
        if (!bullet) return; // Add safety check
        
        this.enemies.forEach(enemy => {
            if (!enemy) return; // Add safety check
            
            if (checkCollision(bullet, enemy)) {
                bullet.active = false;
                const isCrit = Math.random() < (this.player.stats.critChance || 0);
                const damage = this.player.stats.damage * (isCrit ? 2 : 1);
                enemy.takeDamage(damage);

                if (this.player.stats.vampirism) {
                    const healAmount = damage * this.player.stats.vampirismAmount;
                    this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                }

                this.damageIndicators.push(
                    new DamageIndicator(enemy.x + enemy.width / 2, enemy.y, damage)
                );

                if (!enemy.active) {
                    this.scoreManager.addScore(1);
                    const currencyDrop = enemy.die();
                    if (currencyDrop) {
                        this.currencyDrops.push(currencyDrop);
                    }
                    this.player.gainXP(enemy.getXPValue());
                }
            }
        });
    });

    // Player <-> enemies collision
    this.enemies.forEach(enemy => {
        if (!enemy) return; // Add safety check
        
        if (checkCollision(this.player, enemy)) {
            this.player.takeDamage(enemy.damage);
            enemy.active = false;

            this.damageIndicators.push(
                new DamageIndicator(
                    this.player.x + this.player.width / 2,
                    this.player.y,
                    enemy.damage,
                    "#ff4444"
                )
            );

            if (this.player.health <= 0) {
                this.endGame();
            }
        }
    });
}
showMainMenu() {
  this.state = GameState.MAIN_MENU;
  updateMenus();
}

}


