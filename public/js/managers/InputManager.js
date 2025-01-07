class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.lastShotTime = 0;
        this.shotCooldown = 300;
    }

    setupEventListeners() {
        window.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
            if (e.key === "Escape" && this.game.state === GameState.PLAYING) {
                this.game.pauseGame();
            }
            if (e.code === "Space" && this.game.state === GameState.PLAYING) {
                this.game.player.dash();
            }
        });

        window.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });

        window.addEventListener("mousedown", (e) => {
            if (e.button === 0) {
                const now = performance.now();
                if (now - this.lastShotTime > this.shotCooldown / this.game.player.stats.fireRate) {
                    this.game.shoot(e);
                    this.lastShotTime = now;
                }
            }
        });
    }

    getKeys() {
        return this.keys;
    }
}