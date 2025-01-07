class DamageIndicator {
    constructor(x, y, damage, color = "#fff") {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.color = color;
        this.life = 1.0;
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2,
        };
    }

    update() {
        this.life -= 0.02;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(${
            this.color === "#ff4444" ? "255, 68, 68" : "255, 255, 255"
        }, ${this.life})`;
        ctx.font = "bold 20px Arial";
        ctx.fillText(this.damage, this.x, this.y);
    }
}
