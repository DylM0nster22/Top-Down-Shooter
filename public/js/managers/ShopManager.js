class ShopManager {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.availableItems = Object.values(ITEMS);
    }

    render() {
        const shopMenu = document.getElementById("shopMenu");
        const shopItems = document.getElementById("shopItems");
        const currencyDisplay = document.getElementById("currency");

        shopItems.innerHTML = "";
        shopItems.className = "shop-grid";

        const statsDisplay = document.createElement("div");
        statsDisplay.className = "stats-display";
        statsDisplay.innerHTML = this.generateStatsHTML();
        shopItems.appendChild(statsDisplay);

        this.renderShopItems(shopItems, currencyDisplay);
        currencyDisplay.textContent = `Currency: ${this.game.player.currency}`;
        shopMenu.classList.add("show");
    }

    generateStatsHTML() {
        return `
            <h3>Player Stats</h3>
            <p>Damage: ${Math.round(this.game.player.stats.damage * 10) / 10}</p>
            <p>Fire Rate: ${Math.round(this.game.player.stats.fireRate * 100)}%</p>
            <p>Move Speed: ${Math.round(this.game.player.stats.moveSpeed * 100)}%</p>
            <p>Bullet Speed: ${Math.round(this.game.player.stats.bulletSpeed)}</p>
            <p>Health: ${Math.round(this.game.player.health)}/${Math.round(this.game.player.maxHealth)}</p>
            <p>Currency Multiplier: ${Math.round(this.game.player.stats.currencyMultiplier * 100)}%</p>
            <p>XP Multiplier: ${Math.round(this.game.player.stats.xpMultiplier * 100)}%</p>
            <p>Crit Chance: ${Math.round((this.game.player.stats.critChance || 0) * 100)}%</p>
            <p>Health Regen: ${Math.round(this.game.player.stats.healthRegen * 100) / 100}/s</p>
        `;
    }

    renderShopItems(shopItems, currencyDisplay) {
        this.availableItems.forEach((item) => {
            const itemElement = document.createElement("div");
            itemElement.className = `shop-item ${
                this.game.player.currency < item.cost ? "disabled" : ""
            }`;
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <p>Cost: ${item.cost}</p>
            `;

            if (this.game.player.currency >= item.cost) {
                itemElement.onclick = () => {
                    this.game.player.currency -= item.cost;
                    item.effect(this.game.player);
                    currencyDisplay.textContent = `Currency: ${this.game.player.currency}`;
                    this.render();
                };
            }

            shopItems.appendChild(itemElement);
        });
    }

    open() {
        this.isOpen = true;
        this.game.state = GameState.PAUSED;
        this.render();
    }

    close() {
        this.isOpen = false;
        document.getElementById("shopMenu").classList.remove("show");
        this.game.resumeGame();
    }
}
