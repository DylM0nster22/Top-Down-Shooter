// game.js

/**
 * Check if two rectangles overlap
 */
function checkCollision(objA, objB) {
    return (
      objA.x < objB.x + objB.width &&
      objA.x + objA.width > objB.x &&
      objA.y < objB.y + objB.height &&
      objA.y + objA.height > objB.y
    );
  }
  
  // Define some states at the top (or inside the Game class):
  const GameState = {
    MAIN_MENU: 'MAIN_MENU',
    GAMEMODE_SELECT: 'GAMEMODE_SELECT',
    PLAYING:   'PLAYING',
    PAUSED:    'PAUSED',
    GAME_OVER: 'GAME_OVER',
    LEVEL_UP: 'LEVEL_UP',
    WAVE_SHOP: 'WAVE_SHOP' , // Add this new state
    MULTIPLAYER_MENU: 'MULTIPLAYER_MENU'

  };
  
  
  class Game {
    constructor(canvas, isMultiplayer = false) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.keys = {};

      this.baseWaveTimer = 15;
  
      // Create a player in the middle of the screen
      this.player = new Player(
        this.canvas.width / 2 - 15,
        this.canvas.height / 2 - 15,
        4,
        'blue'
      );
  
      // Arrays to hold bullets & enemies
      this.bullets = [];
      this.enemyBullets = []; // Add this line
      this.enemies = [];

      this.highScores = JSON.parse(localStorage.getItem('highScores')) || [];
      this.achievements = {
          firstKill: { earned: false, score: 1 },
          survivor: { earned: false, score: 1000 },
          sharpshooter: { earned: false, killCount: 50 }
      };

      this.difficultyLevel = 1;
      this.enemySpawnTime = 1000;
      this.minSpawnTime = 300;
      this.scoreThreshold = 100; // Now difficulty increases every 100 points
  
      // Enemy spawn interval (ms)
      this.enemySpawnTime = 1000;
      this.lastEnemySpawn = 0;
  
      // For handling shooting
      this.lastShotTime = 0;
      this.shotCooldown = 300; // ms between shots

      this.damageIndicators = [];
  
      // Scoring
      this.score = 0;

      this.pendingLevelUps = 0;

      this.currencyDrops = [];

      this.isMultiplayer = isMultiplayer;
      this.otherPlayer = null;
      if (isMultiplayer) {
          this.multiplayerManager = new MultiplayerManager();
          this.multiplayerManager.initializeSocket();
      }

      this.wave = 1;
      this.waveTimer = 15; // seconds per wave
      this.waveTimer = this.baseWaveTimer;
      this.timeLeft = this.waveTimer;
      this.isWaveActive = false;
      this.enemiesPerWave = 10; // base enemies per wave
      this.enemiesSpawned = 0;

      this.shop = {
        isOpen: false,
        availableItems: Object.values(ITEMS)
      };

      
      // Bind event listeners
      window.addEventListener('keydown', (e) => {
        this.keys[e.key] = true;
  
        // If the user presses 'Escape' during PLAYING, we pause.
        if (e.key === 'Escape' && this.state === GameState.PLAYING) {
          this.pauseGame();
        }
        
        // Add Space key for dash
        if (e.code === 'Space' && this.state === GameState.PLAYING) {
            this.player.dash();
        }
      });
      window.addEventListener('keyup', (e) => (this.keys[e.key] = false));
  
      // LEFT-CLICK to shoot in the direction of the mouse
      window.addEventListener('mousedown', (e) => {
        // e.button === 0 => Left mouse button
        if (e.button === 0) {
          const now = performance.now();
          if (now - this.lastShotTime > (this.shotCooldown / this.player.stats.fireRate)) {

            // Determine the direction from player center to the mouse cursor
            this.shoot(e);
            this.lastShotTime = now;
          }
        }
      });
  
      this.state = GameState.MAIN_MENU;  // Start on the main menu
    }

    updateDifficulty() {
        const playerCount = this.isMultiplayer ? 2 : 1;
        this.difficultyLevel = Math.floor(this.player.level * 0.5 * playerCount) + 1;
        this.enemySpawnTime = Math.max(
            this.minSpawnTime,
            1000 - (this.difficultyLevel * 50 * playerCount)
        );
    }
    

    
    levelUpChoice() {
      const availablePerks = Object.values(PERKS)
          .filter(perk => {
              // Check if player has required perk
              if (perk.requires) {
                  return !this.player.perks.includes(perk) && 
                         this.player.perks.some(p => p.id === perk.requires);
              }
              return !this.player.perks.includes(perk);
          })
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
      
      this.showPerkSelection(availablePerks);
  }
  

    
    showPerkSelection(availablePerks) {
      const perkMenu = document.createElement('div');
      perkMenu.className = 'menu-overlay perk-menu show';
  
      const container = document.createElement('div');
      container.className = 'perk-container';
  
      const perkGrid = document.createElement('div');
      perkGrid.className = 'perk-selection';
  
      const statsPanel = document.createElement('div');
      statsPanel.className = 'stats-panel';
      statsPanel.innerHTML = `
          <h2>Current Stats</h2>
          <p>Damage: ${Math.round(this.player.stats.damage)}</p>
          <p>Health: ${Math.round(this.player.health)}/${Math.round(this.player.maxHealth)}</p>
          <p>Move Speed: ${Math.round(this.player.stats.moveSpeed * 100)}%</p>
          <p>Fire Rate: ${Math.round(this.player.stats.fireRate * 100)}%</p>
          <p>Bullet Speed: ${Math.round(this.player.stats.bulletSpeed)}</p>
      `;
  
      availablePerks.forEach(perk => {
          const perkElement = document.createElement('div');
          perkElement.className = 'perk-option';
          perkElement.innerHTML = `
              <h3>${perk.name}</h3>
              <p>${perk.description}</p>
          `;
          perkElement.onclick = () => {
            perk.effect(this.player);
            this.player.perks.push(perk);
            document.body.removeChild(perkMenu);
            
            if (this.pendingLevelUps > 0) {
                this.levelUpChoice();
                this.pendingLevelUps--;
            } else {
                this.wave++;
                this.timeLeft = this.waveTimer;
                this.enemiesSpawned = 0;
                this.enemiesPerWave = Math.floor(this.enemiesPerWave * 1.5);
                this.showWaveMenu();
            }
        };        
          perkGrid.appendChild(perkElement);
      });
  
      container.appendChild(perkGrid);
      container.appendChild(statsPanel);
      perkMenu.appendChild(container);
      document.body.appendChild(perkMenu);
  }
  
  
  renderShop() {
    const shopMenu = document.getElementById('shopMenu');
    const shopItems = document.getElementById('shopItems');
    const currencyDisplay = document.getElementById('currency');

    shopItems.innerHTML = '';
    shopItems.className = 'shop-grid';

    // Add stats display
    const statsDisplay = document.createElement('div');
    statsDisplay.className = 'stats-display';
    statsDisplay.innerHTML = `
    <h3>Player Stats</h3>
    <p>Damage: ${Math.round(this.player.stats.damage * 10) / 10}</p>
    <p>Fire Rate: ${Math.round(this.player.stats.fireRate * 100)}%</p>
    <p>Move Speed: ${Math.round(this.player.stats.moveSpeed * 100)}%</p>
    <p>Bullet Speed: ${Math.round(this.player.stats.bulletSpeed)}</p>
    <p>Health: ${Math.round(this.player.health)}/${Math.round(this.player.maxHealth)}</p>
    <p>Currency Multiplier: ${Math.round(this.player.stats.currencyMultiplier * 100)}%</p>
    <p>XP Multiplier: ${Math.round(this.player.stats.xpMultiplier * 100)}%</p>
    <p>Crit Chance: ${Math.round((this.player.stats.critChance || 0) * 100)}%</p>
    <p>Health Regen: ${Math.round(this.player.stats.healthRegen * 100) / 100}/s</p>
`;
    shopItems.appendChild(statsDisplay);

    this.shop.availableItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `shop-item ${this.player.currency < item.cost ? 'disabled' : ''}`;
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p>Cost: ${item.cost}</p>
        `;

        if (this.player.currency >= item.cost) {
            itemElement.onclick = () => {
                this.player.currency -= item.cost;
                item.effect(this.player);
                currencyDisplay.textContent = `Currency: ${this.player.currency}`;
                this.renderShop(); // Refresh shop display with updated stats
            };
        }

        shopItems.appendChild(itemElement);
    });

    currencyDisplay.textContent = `Currency: ${this.player.currency}`;
    shopMenu.classList.add('show');
}


  openShop() {
    this.shop.isOpen = true;
    this.state = GameState.PAUSED;
    this.renderShop();
}

closeShop() {
  this.shop.isOpen = false;
  document.getElementById('shopMenu').classList.remove('show');
  this.resumeGame();
}
  

    saveHighScore() {
        this.highScores.push({
            score: this.score,
            date: new Date().toISOString()
        });
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5); // Keep top 5
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
    }
  
    update(deltaTime) {
      if (this.state !== GameState.PLAYING) {
        return;
    }
    
        if (this.isWaveActive) {
          this.timeLeft = Math.max(0, this.timeLeft - (deltaTime / 1000));
        
          if (this.timeLeft <= 0 || (this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesPerWave)) {
            this.completeWave();
        }
        
        if (this.enemiesSpawned < this.enemiesPerWave && 
          performance.now() - this.lastEnemySpawn > this.enemySpawnTime) {
          this.spawnEnemy();
          this.enemiesSpawned++;
          this.lastEnemySpawn = performance.now();
      }
  }
    
        // Update the player
        this.player.update(this.keys, this.canvas);

        // Update bullets
        this.bullets.forEach((bullet) => {
          bullet.update(this.canvas);
        });
        // Remove inactive bullets
        this.bullets = this.bullets.filter((b) => b.active);

        this.currencyDrops = this.currencyDrops.filter(drop => drop.active);
        this.currencyDrops.forEach(drop => {
            if (checkCollision(this.player, drop)) {
                this.player.currency += drop.amount;
                drop.active = false;
            }
        });
        // Update enemies (have them track the player)
        this.enemies.forEach((enemy) => {
          enemy.update(this.canvas, this.player, this);  // Pass 'this' as the game reference
        });
        // Remove inactive enemies
        this.enemies = this.enemies.filter((e) => e.active);
            // Check collisions between bullets and enemies
            this.bullets.forEach((bullet) => {
              this.enemies.forEach((enemy) => {
                if (checkCollision(bullet, enemy)) {
                  bullet.active = false;
                  const isCrit = Math.random() < (this.player.stats.critChance || 0);
                  const damage = this.player.stats.damage * (isCrit ? 2 : 1);
                  enemy.takeDamage(damage);
                  
                  // Add vampirism healing here
                  if (this.player.stats.vampirism) {
                      const healAmount = damage * this.player.stats.vampirismAmount;
                      this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
                  }

                  // Add damage indicator
                  this.damageIndicators.push(
                    new DamageIndicator(
                        enemy.x + enemy.width/2,
                        enemy.y,
                        damage
                    )
                  );
                  if (!enemy.active) {
                    this.score += 1;
                    this.currencyDrops.push(enemy.die());
                      // Award XP based on enemy type
                      if (enemy instanceof FastEnemy) {
                          this.player.gainXP(10);
                      } else if (enemy instanceof TankEnemy) {
                          this.player.gainXP(25);
                      } else if (enemy instanceof ShooterEnemy) {
                          this.player.gainXP(20);
                      }
                  }
              }
              });
          });

            // Check collision between player and enemies
            this.enemies.forEach((enemy) => {
              if (checkCollision(this.player, enemy)) {
                // Damage the player
                this.player.takeDamage(1);
                // Deactivate the enemy
                enemy.active = false;
                // Add damage indicator
                this.damageIndicators.push(
                    new DamageIndicator(
                        this.player.x + this.player.width/2,
                        this.player.y,
                        1,
                        '#ff4444' // Red for player damage
                    )
                );

                // Check if player is dead
                if (this.player.health <= 0) {
                  this.endGame();
                }
              }
            });
        // Update enemy bullets
        this.enemyBullets.forEach(bullet => bullet.update(this.canvas));
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
    
        this.enemyBullets.forEach(bullet => {
          if (checkCollision(bullet, this.player)) {
              bullet.active = false;
              this.player.takeDamage(1);
              // Add red damage indicator for enemy bullet hits
              this.damageIndicators.push(
                  new DamageIndicator(
                      this.player.x + this.player.width/2,
                      this.player.y,
                      1,
                      '#ff4444'
                  )
              );
          
              if (this.player.health <= 0) {
                  this.endGame();
              }
          }
      });

      // Update damage indicators
      this.damageIndicators = this.damageIndicators.filter(indicator => indicator.life > 0);
      this.damageIndicators.forEach(indicator => indicator.update());
        // Check collision between player and enemies
        this.enemies.forEach((enemy) => {
            if (checkCollision(this.player, enemy)) {
                // Only show damage indicator for player
                this.damageIndicators.push(
                    new DamageIndicator(
                        this.player.x + this.player.width/2,
                        this.player.y,
                        enemy.damage,
                        '#ff4444' // Red for player damage
                    )
                );

                // Damage the player and deactivate enemy
                this.player.takeDamage(enemy.damage);
                enemy.active = false;

                // Check if player is dead
                if (this.player.health <= 0) {
                    this.endGame();
                }
            }
        });

        if (this.isMultiplayer && this.otherPlayer) {
            // Handle collision with other player
            if (checkCollision(this.player, this.otherPlayer)) {
                resolveCollision(this.player, this.otherPlayer);
            }
            // Send position updates
            this.multiplayerManager.updatePlayerPosition(
                this.player.x,
                this.player.y
            );
        }
      }  

      completeWave() {
        this.isWaveActive = false;
        this.enemies = []; 
        this.currencyDrops = []; 
        
        if (this.pendingLevelUps > 0) {
            this.state = GameState.LEVEL_UP;
            this.levelUpChoice();
            this.pendingLevelUps--;
        } else {
            this.state = GameState.WAVE_SHOP;  // Use new state instead of PAUSED
            this.wave++;
            this.waveTimer = this.baseWaveTimer + (this.wave * 5);
            this.timeLeft = this.waveTimer;
            this.enemiesSpawned = 0;
            this.enemiesPerWave = Math.floor(this.enemiesPerWave * 1.5);
            this.showWaveMenu();
        }
    }
    

    renderWaveShop() {
      const shopItems = document.getElementById('waveShopItems');
      const currencyDisplay = document.getElementById('waveCurrency');
      
      shopItems.innerHTML = '';
      shopItems.className = 'shop-grid';
  
      // Get 5 random items
      const randomItems = Object.values(ITEMS)
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
  
      // Add currency display at top right
      currencyDisplay.style.position = 'absolute';
      currencyDisplay.style.top = '20px';
      currencyDisplay.style.right = '20px';
      currencyDisplay.style.fontSize = '24px';
      currencyDisplay.style.color = '#ffd700';
      currencyDisplay.textContent = `Currency: ${this.player.currency}`;
  
      randomItems.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.className = `shop-item ${this.player.currency < item.cost ? 'disabled' : ''}`;
          itemElement.innerHTML = `
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <p class="cost">Cost: ${item.cost}</p>
          `;
  
          if (this.player.currency >= item.cost) {
              itemElement.onclick = () => {
                  this.player.currency -= item.cost;
                  item.effect(this.player);
                  currencyDisplay.textContent = `Currency: ${this.player.currency}`;
                  this.renderWaveShop();
              };
          }
  
          shopItems.appendChild(itemElement);
      });
  }
    

    showWaveMenu() {
        const waveMenu = document.getElementById('waveMenu');
        const nextWaveNumber = document.getElementById('nextWaveNumber');
        nextWaveNumber.textContent = this.wave;
        this.renderWaveShop();
        waveMenu.classList.add('show');
    }

    startWave() {
        document.getElementById('waveMenu').classList.remove('show');
        this.isWaveActive = true;
        this.enemiesSpawned = 0;
    }

    draw() {
      // Always clear, so the canvas is empty behind the overlays
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      // If you're on the main menu or paused, you could skip drawing the player and enemies
      if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
        // Draw the game world
        this.player.draw(this.ctx);
        this.bullets.forEach((bullet) => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemies.forEach((enemy) => enemy.draw(this.ctx));
        this.currencyDrops.forEach(drop => drop.draw(this.ctx));
        this.drawHUD();
        
        // Draw damage indicators
        this.damageIndicators.forEach(indicator => indicator.draw(this.ctx));
      }
    }
  
    drawHUD() {
        // Increase font sizes and spacing
        this.ctx.font = 'bold 32px Arial';
        
        // Score
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.fillText(`Score: ${this.score}`, 40, 50);
        
        // Health with color based on value
        const healthColor = this.player.health > 2 ? '#4ade80' : this.player.health > 1 ? '#fbbf24' : '#ef4444';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillText(`Health: ${this.player.health}`, 40, 100);
        
        // Dash indicator
        if (this.player.canDash) {
            this.ctx.fillStyle = '#4ade80';
            this.ctx.fillText('DASH READY', 40, 150);
        }
        
        // Level and XP display
        this.ctx.fillStyle = '#9f7aea';
        this.ctx.fillText(`Level: ${this.player.level}`, this.canvas.width - 250, 100);
        this.ctx.fillText(`XP: ${this.player.xp}/${this.player.xpToNextLevel}`, this.canvas.width - 250, 150);
        
        // High Score
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillText(`High Score: ${Math.max(...this.highScores.map(s => s.score), 0)}`, this.canvas.width - 250, 50);

        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText(`Currency: ${this.player.currency}`, 40, 200);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Wave ${this.wave}`, this.canvas.width/2, 50);
        if (this.isWaveActive) {
            this.ctx.fillText(`Time Left: ${Math.ceil(this.timeLeft)}s`, this.canvas.width/2, 90);
        }
        this.ctx.textAlign = 'left';
    }
    
    shoot(e) {
      const now = performance.now();
      if (now - this.lastShotTime > (this.shotCooldown / this.player.stats.fireRate)) {

          // Get player center
          const playerCenterX = this.player.x + this.player.width / 2;
          const playerCenterY = this.player.y + this.player.height / 2;
  
          // Get mouse coords relative to the canvas
          const rect = this.canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
  
          // Calculate base direction vector
          let dx = mouseX - playerCenterX;
          let dy = mouseY - playerCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          // Normalize the direction vector
          if (distance !== 0) {
              dx /= distance;
              dy /= distance;
          }
  
          // Handle multishot
          const shots = 1 + (this.player.stats.multiShot || 0);
          for(let i = 0; i < shots; i++) {
              const spread = (i - (shots-1)/2) * 0.2;
              let adjustedDx = dx * Math.cos(spread) - dy * Math.sin(spread);
              let adjustedDy = dx * Math.sin(spread) + dy * Math.cos(spread);
              
              const isCrit = Math.random() < (this.player.stats.critChance || 0);
              const bulletDamage = this.player.stats.damage * (isCrit ? 2 : 1);
              
              const bullet = new Bullet(
                  playerCenterX,
                  playerCenterY,
                  this.player.stats.bulletSpeed,
                  { x: adjustedDx, y: adjustedDy },
                  'yellow',
                  bulletDamage
              );
              this.bullets.push(bullet);
          }
          this.lastShotTime = now;
      }
  }
  
  spawnEnemy() {
    const roll = Math.random();
    let enemy;
    
    const speedBonus = this.wave * 0.2;
    const healthBonus = Math.floor(this.wave * 0.5);
    const damageBonus = Math.floor(this.wave * 0.25); // Add damage scaling
    
    // Only allow special and elite enemies in later waves
    if (this.wave >= 10 && roll < 0.4) {
        // Elite spawns (Wave 10+)
        const eliteRoll = Math.random();
        if (eliteRoll < 0.25) {
            enemy = new EliteFastEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        } else if (eliteRoll < 0.5) {
            enemy = new EliteTankEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        } else if (eliteRoll < 0.75) {
            enemy = new EliteShooterEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        } else {
            enemy = new PulsarEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        }
    } else if (this.wave >= 5 && roll < 0.3) {
        // Special spawns (Wave 5+)
        const specialRoll = Math.random();
        if (specialRoll < 0.4) {
            enemy = new BomberEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        } else if (specialRoll < 0.7) {
            enemy = new TeleporterEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        } else {
            enemy = new PulsarEnemy(Math.random() * (this.canvas.width - 30), -30, this.player, this);
        }
    } else {
        // Basic spawns (All waves)
        if (roll < 0.4) {
            enemy = new FastEnemy(Math.random() * (this.canvas.width - 30), -30, this.player);
        } else if (roll < 0.7) {
            enemy = new TankEnemy(Math.random() * (this.canvas.width - 30), -30, this.player);
        } else {
            enemy = new ShooterEnemy(Math.random() * (this.canvas.width - 30), -30, this.player);
        }
    }

    enemy.speed += speedBonus;
    enemy.health += healthBonus;
    enemy.maxHealth = enemy.health;
    enemy.damage = 1 + damageBonus; // Scale base damage with wave progression
    this.enemies.push(enemy);
}


  
startGame() {
  this.state = GameState.PLAYING;
  this.wave = 1;
  this.timeLeft = this.waveTimer;
  this.isWaveActive = true;
  this.enemiesSpawned = 0;
}

  
    pauseGame() {
      // Called when user hits "Pause" or Esc
      this.state = GameState.PAUSED;
    }
  
    resumeGame() {
      this.state = GameState.PLAYING;
    }
  
    showMainMenu() {
        this.state = GameState.MAIN_MENU;
        this.resetGame(); // Add this new method
    }

    resetGame() {
      this.score = 0;
      this.player = new Player(
          this.canvas.width / 2 - 15,
          this.canvas.height / 2 - 15,
          4,
          'blue'
      );
      this.bullets = [];
      this.enemyBullets = [];
      this.enemies = [];
      this.currencyDrops = [];
      this.lastEnemySpawn = 0;
      this.lastShotTime = 0;
      this.wave = 1;
      this.timeLeft = this.baseWaveTimer;
      this.isWaveActive = false;
      this.enemiesSpawned = 0;
      this.enemiesPerWave = 10;
      this.pendingLevelUps = 0;
      this.damageIndicators = [];
  }
  
  
    endGame() {
        this.state = GameState.GAME_OVER;
        this.saveHighScore();
        
        const gameOverMenu = document.getElementById('gameOverMenu');
        const finalScore = document.getElementById('finalScore');
        const highScoreList = document.getElementById('highScoreList');
        
        finalScore.textContent = `Score: ${this.score}`;
        
        let highScoresHTML = '<h3>High Scores</h3>';
        this.highScores.slice(0, 5).forEach((score, index) => {
            highScoresHTML += `
                <div class="score-entry">
                    <span class="score-rank">#${index + 1}</span>
                    <span class="score-value">${score.score}</span>
                </div>`;
        });
        highScoreList.innerHTML = highScoresHTML;
        
        gameOverMenu.classList.add('show');
    }
  }
  
  class DamageIndicator {
    constructor(x, y, damage, color = '#fff') {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        this.life = 1.0;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2
        };
    }
  
      update() {
          this.life -= 0.02; // Controls fade speed
          this.x += this.velocity.x;
          this.y += this.velocity.y;
      }
  

      draw(ctx) {
        ctx.fillStyle = `rgba(${this.color === '#ff4444' ? '255, 68, 68' : '255, 255, 255'}, ${this.life})`;
        ctx.font = 'bold 20px Arial';
        ctx.fillText(this.damage, this.x, this.y);
    }
  }

  class CurrencyDrop {
    constructor(x, y, amount) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.amount = amount;
        this.active = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

function showBestiary() {
  this.state = GameState.PAUSED;
  const bestiaryMenu = document.getElementById('bestiaryMenu');
  const content = document.getElementById('bestiaryContent');
  
  const enemies = [
    {
        name: "Fast Enemy",
        description: "Quick and agile enemy that rushes toward the player.",
        health: "1",
        damage: "1",
        special: "20% faster than basic enemies",
        color: "#ff4d4d",
        shape: "triangle"
    },
    {
        name: "Tank Enemy",
        description: "Heavily armored enemy that can absorb more damage.",
        health: "3",
        damage: "1",
        special: "3x health but moves slower",
        color: "#8b0000",
        shape: "hexagon"
    },
    {
        name: "Shooter Enemy",
        description: "Ranged enemy that fires projectiles.",
        health: "2",
        damage: "1",
        special: "Fires bullets every 2 seconds",
        color: "#ff8c00",
        shape: "diamond"
    },
    {
        name: "Elite Fast Enemy",
        description: "Enhanced version with speed trail effects.",
        health: "2",
        damage: "1",
        special: "Leaves damaging trail",
        color: "#ff0000",
        shape: "glowTriangle"
    },
    {
        name: "Elite Tank Enemy",
        description: "Enhanced Tank with protective shield.",
        health: "6",
        damage: "1",
        special: "Has regenerating shield",
        color: "#660000",
        shape: "shieldedHexagon"
    },
    {
        name: "Elite Shooter Enemy",
        description: "Enhanced Shooter with burst capabilities.",
        health: "4",
        damage: "1",
        special: "Fires 3-shot bursts",
        color: "#ff4500",
        shape: "diamondCore"
    },
    {
        name: "Bomber Enemy",
        description: "Explodes on death, damaging nearby enemies.",
        health: "2",
        damage: "2",
        special: "Area explosion on death",
        color: "#ff1493",
        shape: "circle"
    },
    {
        name: "Teleporter Enemy",
        description: "Unpredictable enemy that teleports.",
        health: "2",
        damage: "1",
        special: "Teleports every 3 seconds",
        color: "#9400d3",
        shape: "triangle"
    },
    {
        name: "Pulsar Enemy",
        description: "Emits dangerous pulse waves periodically.",
        health: "3",
        damage: "1",
        special: "Periodic damage pulses",
        color: "#4b0082",
        shape: "pulsar"
    }
];


  content.innerHTML = enemies.map(enemy => `
    <div class="enemy-card">
        <h3>${enemy.name}</h3>
        <div class="enemy-preview">
            <canvas class="enemy-canvas" width="100" height="100"></canvas>
        </div>
        <p>${enemy.description}</p>
        <div class="enemy-stats">
            <div class="stat-line">
                <span>Health:</span>
                <span class="stat-value">${enemy.health}</span>
            </div>
            <div class="stat-line">
                <span>Damage:</span>
                <span class="stat-value">${enemy.damage}</span>
            </div>
            <div class="stat-line">
                <span>Special:</span>
                <span class="stat-value">${enemy.special}</span>
            </div>
        </div>
    </div>
`).join('');

// After creating the cards, add this drawing code:
enemies.forEach((enemy, index) => {
  const canvas = document.querySelectorAll('.enemy-canvas')[index];
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const size = 30;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  switch(enemy.shape) {
      case 'triangle':
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY + size/2);
          ctx.lineTo(centerX - size/2, centerY + size/2);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          break;

      case 'hexagon':
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
              const angle = i * Math.PI / 3;
              const x = centerX + size/2 * Math.cos(angle);
              const y = centerY + size/2 * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = '#cc0000';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;

      case 'diamond':
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY);
          ctx.lineTo(centerX, centerY + size/2);
          ctx.lineTo(centerX - size/2, centerY);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = '#ffa500';
          ctx.stroke();
          // Inner circle for shooter
          ctx.beginPath();
          ctx.arc(centerX, centerY, size/4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffd700';
          ctx.fill();
          break;

      case 'glowTriangle':
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY + size/2);
          ctx.lineTo(centerX - size/2, centerY + size/2);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(centerX, centerY - size/2, centerX, centerY + size/2);
          gradient.addColorStop(0, '#ff0000');
          gradient.addColorStop(1, '#ff4444');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.shadowBlur = 0;
          break;

      case 'shieldedHexagon':
          // Shield
          ctx.beginPath();
          ctx.arc(centerX, centerY, size/1.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#88ccff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#88ccff';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
              const angle = i * Math.PI / 3;
              const x = centerX + size/2 * Math.cos(angle);
              const y = centerY + size/2 * Math.sin(angle);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
          }
          ctx.closePath();
          const tankGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size/2);
          tankGradient.addColorStop(0, '#990000');
          tankGradient.addColorStop(1, '#660000');
          ctx.fillStyle = tankGradient;
          ctx.fill();
          break;

      case 'diamondCore':
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size/2);
          ctx.lineTo(centerX + size/2, centerY);
          ctx.lineTo(centerX, centerY + size/2);
          ctx.lineTo(centerX - size/2, centerY);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          // Enhanced core
          ctx.beginPath();
          ctx.arc(centerX, centerY, size/3, 0, Math.PI * 2);
          ctx.fillStyle = '#ff8c00';
          ctx.fill();
          break;

      case 'circle':
          ctx.beginPath();
          ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = '#ff69b4';
          ctx.stroke();
          break;

      case 'pulsar':
          // Main body
          ctx.beginPath();
          ctx.arc(centerX, centerY, size/2, 0, Math.PI * 2);
          const pulsarGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size/2);
          pulsarGradient.addColorStop(0, '#9400d3');
          pulsarGradient.addColorStop(1, '#4b0082');
          ctx.fillStyle = pulsarGradient;
          ctx.fill();
          
          // Pulse waves
          ctx.beginPath();
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(75, 0, 130, 0.3)';
          ctx.stroke();
          break;
  }
});

bestiaryMenu.classList.add('show');
}

function resolveCollision(playerA, playerB) {
    const dx = playerB.x - playerA.x;
    const dy = playerB.y - playerA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = playerA.width;
    
    if (distance < minDistance) {
        const angle = Math.atan2(dy, dx);
        const pushX = (minDistance - distance) * Math.cos(angle) * 0.5;
        const pushY = (minDistance - distance) * Math.sin(angle) * 0.5;
        
        playerA.x -= pushX;
        playerA.y -= pushY;
        playerB.x += pushX;
        playerB.y += pushY;
    }
}


  