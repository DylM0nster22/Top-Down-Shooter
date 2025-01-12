class WaveManager {
    constructor(game) {
        this.game = game;
        this.wave = 1;
        this.baseWaveTimer = 15;
        this.waveTimer = this.baseWaveTimer;
        this.timeLeft = this.waveTimer;
        this.isActive = false;
        this.enemiesPerWave = 10;
        this.enemiesSpawned = 0;
        this.difficultyLevel = 1;
        this.enemySpawnTime = 1000;
        this.minSpawnTime = 300;
        this.lastEnemySpawn = 0;
    }

    start() {
        this.startWave();
    }

    complete() {
        this.isActive = false;
        this.game.enemies = [];
        this.game.currencyDrops = [];
    
        if (this.game.levelManager.pendingLevelUps > 0) {
            this.game.state = GameState.LEVEL_UP;
            this.game.levelManager.levelUpChoice();
            this.game.levelManager.pendingLevelUps--;
        } else {
            this.game.state = GameState.WAVE_SHOP;
            this.wave++;
            this.waveTimer = this.baseWaveTimer + this.wave * 5;
            this.timeLeft = this.waveTimer;
            this.enemiesSpawned = 0;
            this.enemiesPerWave = Math.floor(this.enemiesPerWave * 1.5);
            this.showMenu();
        }
    }    

    showMenu() {
        const waveMenu = document.getElementById("waveMenu");
        const nextWaveNumber = document.getElementById("nextWaveNumber");
        nextWaveNumber.textContent = this.wave;
        this.game.shopManager.renderWaveShop();
        waveMenu.classList.add("show");

        // Add event listener for start wave button
        const startWaveBtn = document.getElementById("startWaveBtn");
        startWaveBtn.onclick = () => {
            this.startWave();
            waveMenu.classList.remove("show");
        };

        if (this.game.isMultiplayer) {
            startWaveBtn.textContent = "Ready";
            this.game.multiplayerManager.socket.emit("player_ready", {
                roomCode: this.game.multiplayerManager.roomCode
            });
        }
    }

    startWave() {
        this.isActive = true;
        this.enemiesSpawned = 0;
        this.timeLeft = this.waveTimer;
        this.game.state = GameState.PLAYING;
    }
    

    updateDifficulty() {
        const playerCount = this.game.isMultiplayer ? 2 : 1;
        this.difficultyLevel = Math.floor(this.game.player.level * 0.5 * playerCount) + 1;
        this.enemySpawnTime = Math.max(
            this.minSpawnTime,
            1000 - this.difficultyLevel * 50 * playerCount
        );
    }

    update(deltaTime) {
        if (this.game.isMultiplayer && this.game.isHost) {
            this.timeLeft -= deltaTime / 1000; 
            this.game.multiplayerManager.socket.emit("wave_timer_sync", {
                roomCode: this.game.multiplayerManager.roomCode,
                timeLeft: this.timeLeft
            });
        }
        // If singleplayer or host, do the usual wave logic
        if (this.isActive) {
        this.timeLeft = Math.max(0, this.timeLeft - deltaTime / 1000);
        console.log(`Wave timer updated: ${this.timeLeft} seconds left`);
            
            // Spawn enemies
            if (this.enemiesSpawned < this.enemiesPerWave && 
                performance.now() - this.lastEnemySpawn > this.enemySpawnTime) {
                this.spawnEnemy();
                this.enemiesSpawned++;
                this.lastEnemySpawn = performance.now();
            }
    
            // Check wave completion
            if (this.timeLeft <= 0 || 
                (this.game.enemies.length === 0 && this.enemiesSpawned >= this.enemiesPerWave)) {
                this.complete();
            }
        }
    }
    

    reset() {
        this.wave = 1;
        this.timeLeft = this.waveTimer;
        this.isActive = false;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 10;
    }

    createBasicEnemy(roll) {
        if (roll < 0.4) {
            return new FastEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player
            );
        } else if (roll < 0.7) {
            return new TankEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player
            );
        } else {
            return new ShooterEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player
            );
        }
    }
    
    createEliteEnemy() {
        const eliteRoll = Math.random();
        if (eliteRoll < 0.25) {
            return new EliteFastEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        } else if (eliteRoll < 0.5) {
            return new EliteTankEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        } else if (eliteRoll < 0.75) {
            return new EliteShooterEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        } else {
            return new PulsarEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        }
    }
    
    createSpecialEnemy() {
        const specialRoll = Math.random();
        if (specialRoll < 0.4) {
            return new BomberEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        } else if (specialRoll < 0.7) {
            return new TeleporterEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        } else {
            return new PulsarEnemy(
                Math.random() * (this.game.canvas.width - 30),
                -30,
                this.game.player,
                this.game
            );
        }
    }
    

    // Add this method to the WaveManager class
spawnEnemy() {
    // Only host spawns enemies in multiplayer
    if (this.game.isMultiplayer && !this.game.isHost) return;

    const roll = Math.random();
    let enemy;

    const speedBonus = this.wave * 0.2;
    const healthBonus = Math.floor(this.wave * 0.5);
    const damageBonus = Math.floor(this.wave * 0.25);

    // Elite enemies (wave 10+)
    if (this.wave >= 10 && roll < 0.4) {
        enemy = this.createEliteEnemy();
    } 
    // Special enemies (wave 5+)
    else if (this.wave >= 5 && roll < 0.3) {
        enemy = this.createSpecialEnemy();
    } 
    // Basic enemies
    else {
        enemy = this.createBasicEnemy(roll);
    }

    enemy.id = Date.now() + Math.random();

    this.game.enemies.push(enemy);

    enemy.speed += speedBonus;
    enemy.health += healthBonus;
    enemy.maxHealth = enemy.health;
    enemy.damage = 1 + damageBonus;

    if (this.game.isMultiplayer) {
        this.game.multiplayerManager.socket.emit("enemy_spawn", {
            roomCode: this.game.multiplayerManager.roomCode,
            type: enemy.constructor.name,
            x: enemy.x,
            y: enemy.y,
            id: enemy.id,
            health: enemy.health,
            maxHealth: enemy.maxHealth,
            speed: enemy.speed
        });
    }

    this.game.enemies.push(enemy);
    }
}
