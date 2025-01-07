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
        ctx.fillStyle = "#4a90e2";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
