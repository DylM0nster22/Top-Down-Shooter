// bullet.js
class Bullet {
  constructor(x, y, speed, direction, color) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.direction = direction;
      this.color = color;
      this.width = 8;
      this.height = 8;
      this.active = true;
  }
  
  update(canvas) {
    // Move bullet
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;
  
    // Deactivate if it goes off-screen
    if (
      this.x < 0 ||
      this.y < 0 ||
      this.x > canvas.width ||
      this.y > canvas.height
    ) {
      this.active = false;
    }
  }
  
  draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        
      // Different colors for player and enemy bullets
      if (this.color === 'yellow') {
          // Player bullets
          const gradient = ctx.createRadialGradient(
              this.x + this.width/2, this.y + this.height/2, 0,
              this.x + this.width/2, this.y + this.height/2, this.width/2
          );
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(1, '#ffd700');
          ctx.fillStyle = gradient;
      } else {
          // Enemy bullets
          const gradient = ctx.createRadialGradient(
              this.x + this.width/2, this.y + this.height/2, 0,
              this.x + this.width/2, this.y + this.height/2, this.width/2
          );
          gradient.addColorStop(0, '#fff');
          gradient.addColorStop(1, '#ff4d4d');
          ctx.fillStyle = gradient;
      }
        
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
  }
}  