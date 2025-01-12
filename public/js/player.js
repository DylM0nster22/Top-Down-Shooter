// player.js
class Player {
constructor(x, y, speed, skinId, color) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.color = color;
      this.width = 30;
      this.height = 30;
      this.currency = 0;
      this.perks = [];
      this.items = [];
  
      // Health system
      this.health = 10;
      this.maxHealth = 10;
  
      this.direction = { x: 0, y: 0 };
  
      this.dashSpeed = 12;
      this.dashCooldown = 2000;
      this.lastDash = 0;
      this.canDash = true;
  
      this.xp = 0;
      this.level = 1;
      this.xpToNextLevel = 100; // Base XP needed
  
      this.dashParticles = [];
      this.isDashing = false;
  
      this.stats = {
        damage: 1,
        fireRate: 1,
        bulletSpeed: 6,
        moveSpeed: speed,
        healthRegen: 0,
        currencyMultiplier: 1,
        xpMultiplier: 1,
        critChance: 0,
        vampirism: false,
        shield: 0,
        dashDamage: 0,
        multiShot: 0,
        damageReduction: 0,
      };
    }
  
    gainXP(amount) {
      this.xp += amount;
      while (this.xp >= this.xpToNextLevel) {
        this.levelUp();
      }
    }
  
    levelUp() {
      this.level++;
      this.xp -= this.xpToNextLevel;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      this.maxHealth += 2;
      this.health = this.maxHealth;
      this.speed += 0.2;
  
      game.pendingLevelUps++;
    }
  
    drawXPBar(ctx) {
      const barWidth = this.width * 2;
      const barHeight = 6;
      const xpPercent = this.xp / this.xpToNextLevel;
  
      // Background
      ctx.fillStyle = "#333";
      ctx.fillRect(this.x - this.width / 2, this.y - 15, barWidth, barHeight);
  
      // XP progress
      ctx.fillStyle = "#9f7aea";
      ctx.fillRect(
        this.x - this.width / 2,
        this.y - 15,
        barWidth * xpPercent,
        barHeight
      );
    }
  
    dash() {
      if (!this.canDash) return;
  
      this.isDashing = true;
      // Create dash particles
      for (let i = 0; i < 20; i++) {
        this.dashParticles.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          dx: (Math.random() - 0.5) * 8,
          dy: (Math.random() - 0.5) * 8,
          life: 20,
        });
      }
  
      if (this.stats.dashDamage) {
        this.enemies.forEach((enemy) => {
          if (checkCollision(this, enemy)) {
            enemy.takeDamage(this.stats.dashDamage);
          }
        });
      }
  
      // Dash movement
      this.x += this.direction.x * this.dashSpeed * 10;
      this.y += this.direction.y * this.dashSpeed * 10;
  
      this.canDash = false;
      this.lastDash = performance.now();
  
      setTimeout(() => {
        this.isDashing = false;
        this.canDash = true;
      }, this.dashCooldown);
    }
  
    update(keys, canvas) {
      // Calculate direction vector
  
      const currentSpeed = this.stats.moveSpeed;
  
      if (this.stats.healthRegen > 0) {
        this.health = Math.min(
          this.maxHealth,
          Math.round((this.health + this.stats.healthRegen / 60) * 10) / 10
        );
      }
      if (keys["ArrowLeft"] || keys["a"]) {
        this.direction.x = -1;
      } else if (keys["ArrowRight"] || keys["d"]) {
        this.direction.x = 1;
      } else {
        this.direction.x = 0;
      }
  
      if (keys["ArrowUp"] || keys["w"]) {
        this.direction.y = -1;
      } else if (keys["ArrowDown"] || keys["s"]) {
        this.direction.y = 1;
      } else {
        this.direction.y = 0;
      }
  
      // Normalize diagonal movement
      if (this.direction.x !== 0 && this.direction.y !== 0) {
        const length = Math.sqrt(
          this.direction.x * this.direction.x +
            this.direction.y * this.direction.y
        );
        this.direction.x /= length;
        this.direction.y /= length;
      }
  
      this.x += this.direction.x * currentSpeed;
      this.y += this.direction.y * currentSpeed;
  
      // Update rotation
      if (this.direction.x !== 0 || this.direction.y !== 0) {
        this.rotation =
          Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2;
      }
  
      // Add health regeneration
      if (this.stats.shield !== undefined && this.stats.shield < 2) {
        this.stats.shield = Math.min(2, this.stats.shield + 0.001);
      }
  
      // Update dash particles
      this.dashParticles = this.dashParticles.filter(
        (particle) => particle.life > 0
      );
      this.dashParticles.forEach((particle) => {
        particle.life -= 1;
        particle.x += particle.dx;
        particle.y += particle.dy;
      });
  
      // Clamp to canvas boundaries
      if (this.x < 0) this.x = 0;
      if (this.y < 0) this.y = 0;
      if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
      if (this.y + this.height > canvas.height)
        this.y = canvas.height - this.height;
    }
  
    takeDamage(amount) {
      if (this.stats.shield > 0) {
        this.stats.shield = Math.round(this.stats.shield * 10) / 10;
        this.stats.shield -= amount;
        if (this.stats.shield < 0) {
          this.health += this.stats.shield;
          this.stats.shield = 0;
        }
      } else {
        this.health = Math.round((this.health - amount) * 10) / 10;
      }
      if (this.health < 0) this.health = 0;
    }
  
    drawHealthBar(ctx) {
      const barWidth = this.width;
      const barHeight = 8;
      const healthPercent = this.health / this.maxHealth;
  
      // Background
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y - 10, barWidth, barHeight);
  
      // Health remaining
      ctx.fillStyle = "green";
      ctx.fillRect(this.x, this.y - 10, barWidth * healthPercent, barHeight);
    }
  
    draw(ctx) {
      // Draw dash particles
      this.dashParticles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74, 144, 226, ${particle.life / 20})`;
        ctx.fill();
      });
  
      // Draw player
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
  
      // Add glow effect during dash
      if (this.isDashing) {
        ctx.shadowColor = "#4a90e2";
        ctx.shadowBlur = 30;
      }
  
      // Draw player shape relative to origin (0,0)
      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2); // Front point
      ctx.lineTo(this.width / 2, this.height / 2); // Bottom right
      ctx.lineTo(0, this.height / 2 - 5); // Bottom middle indent
      ctx.lineTo(-this.width / 2, this.height / 2); // Bottom left
      ctx.closePath();
  
      const gradient = ctx.createLinearGradient(
        0,
        -this.height / 2,
        0,
        this.height / 2
      );
      gradient.addColorStop(0, "#4a90e2");
      gradient.addColorStop(1, "#357abd");
      ctx.fillStyle = gradient;
      ctx.fill();
  
      ctx.shadowColor = "#4a90e2";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
  
      ctx.restore();
  
      // Draw health bar without rotation
      this.drawHealthBar(ctx);
    }
  }
  