class ScoreManager {
    constructor() {
        this.score = 0;
        this.highScores = JSON.parse(localStorage.getItem("highScores")) || [];
        this.achievements = {
            firstKill: { earned: false, score: 1 },
            survivor: { earned: false, score: 1000 },
            sharpshooter: { earned: false, killCount: 50 },
        };
    }

    addScore(points) {
        this.score += points;
    }

    saveHighScore() {
        this.highScores.push({
            score: this.score,
            date: new Date().toISOString(),
        });
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 5);
        localStorage.setItem("highScores", JSON.stringify(this.highScores));
    }

    getScore() {
        return this.score;
    }

    getHighScores() {
        return this.highScores;
    }

    reset() {
        this.score = 0;
    }
}
