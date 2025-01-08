class LevelManager {
    constructor(game) {
        this.game = game;
        this.pendingLevelUps = 0;
    }

    showPerkSelection(availablePerks) {
        const perkMenu = document.createElement("div");
        perkMenu.className = "menu-overlay perk-menu show";

        const container = document.createElement("div");
        container.className = "perk-container";

        const perkGrid = document.createElement("div");
        perkGrid.className = "perk-selection";

        const statsPanel = this.createStatsPanel();
        
        this.setupPerkOptions(availablePerks, perkGrid, perkMenu);

        container.appendChild(perkGrid);
        container.appendChild(statsPanel);
        perkMenu.appendChild(container);
        document.body.appendChild(perkMenu);
    }

    createStatsPanel() {
        const statsPanel = document.createElement("div");
        statsPanel.className = "stats-panel";
        statsPanel.innerHTML = this.generateStatsHTML();
        return statsPanel;
    }

    generateStatsHTML() {
        return `
            <h2>Current Stats</h2>
            <p>Damage: ${Math.round(this.game.player.stats.damage)}</p>
            <p>Health: ${Math.round(this.game.player.health)}/${Math.round(this.game.player.maxHealth)}</p>
            <p>Move Speed: ${Math.round(this.game.player.stats.moveSpeed * 100)}%</p>
            <p>Fire Rate: ${Math.round(this.game.player.stats.fireRate * 100)}%</p>
            <p>Bullet Speed: ${Math.round(this.game.player.stats.bulletSpeed)}</p>
        `;
    }
    
    levelUpChoice() {
        const availablePerks = Object.values(PERKS)
            .filter((perk) => {
                if (perk.requires) {
                    return (
                        !this.game.player.perks.includes(perk) &&
                        this.game.player.perks.some((p) => p.id === perk.requires)
                    );
                }
                return !this.game.player.perks.includes(perk);
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
    
        this.showPerkSelection(availablePerks);
    }
    
    setupPerkOptions(availablePerks, perkGrid, perkMenu) {
        availablePerks.forEach((perk) => {
            const perkElement = document.createElement("div");
            perkElement.className = "perk-option";
            perkElement.innerHTML = `
                <h3>${perk.name}</h3>
                <p>${perk.description}</p>
            `;
            perkElement.onclick = () => {
                perk.effect(this.game.player);
                this.game.player.perks.push(perk);
                document.body.removeChild(perkMenu);
    
                if (this.pendingLevelUps > 0) {
                    this.levelUpChoice();
                    this.pendingLevelUps--;
                } else {
                    this.game.waveManager.wave++;
                    this.game.waveManager.timeLeft = this.game.waveManager.waveTimer;
                    this.game.waveManager.enemiesSpawned = 0;
                    this.game.waveManager.enemiesPerWave = Math.floor(this.game.waveManager.enemiesPerWave * 1.5);
                    this.game.waveManager.showMenu();
                }
            };
            perkGrid.appendChild(perkElement);
        });
    }
    
}
