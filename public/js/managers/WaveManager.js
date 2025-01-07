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
        this.isActive = true;
        this.enemiesSpawned = 0;
        document.getElementById("waveMenu").classList.remove("show");
    }

    complete() {
        this.isActive = false;
        this.game.enemies = [];
        this.game.currencyDrops = [];

        if (this.game.pendingLevelUps > 0) {
            this.game.state = GameState.LEVEL_UP;
            this.game.levelUpChoice();
            this.game.pendingLevelUps--;
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
        this.game.renderWaveShop();
        waveMenu.classList.add("show");
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
        if (this.isActive) {
            this.timeLeft = Math.max(0, this.timeLeft - deltaTime / 1000);
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
}
