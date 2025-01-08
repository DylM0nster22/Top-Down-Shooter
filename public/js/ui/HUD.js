class HUD {
    constructor(game) {
        this.game = game;
    }

    draw(ctx) {
        ctx.font = "bold 32px Arial";

        // Score
        ctx.fillStyle = "#4a90e2";
        ctx.fillText(`Score: ${this.game.scoreManager.getScore()}`, 40, 50);

        // Health
        const healthColor = this.game.player.health > 2 ? "#4ade80" : 
                          this.game.player.health > 1 ? "#fbbf24" : "#ef4444";
        ctx.fillStyle = healthColor;
        ctx.fillText(`Health: ${this.game.player.health}`, 40, 100);

        // Dash indicator
        if (this.game.player.canDash) {
            ctx.fillStyle = "#4ade80";
            ctx.fillText("DASH READY", 40, 150);
        }

        // Level and XP
        ctx.fillStyle = "#9f7aea";
        ctx.fillText(`Level: ${this.game.player.level}`, this.game.canvas.width - 250, 100);
        ctx.fillText(`XP: ${this.game.player.xp}/${this.game.player.xpToNextLevel}`, 
                    this.game.canvas.width - 250, 150);

        // High Score
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`High Score: ${Math.max(...this.game.scoreManager.getHighScores().map(s => s.score), 0)}`,
                    this.game.canvas.width - 250, 50);

        // Currency
        ctx.fillStyle = "#ffd700";
        ctx.fillText(`Currency: ${this.game.player.currency}`, 40, 200);

        // Wave info
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(`Wave ${this.game.waveManager.wave}`, this.game.canvas.width / 2, 50);
        if (this.game.waveManager.isActive) {
            ctx.fillText(`Time Left: ${Math.ceil(this.game.waveManager.timeLeft)}s`, 
                        this.game.canvas.width / 2, 90);
        }
        ctx.textAlign = "left";
    }
}
