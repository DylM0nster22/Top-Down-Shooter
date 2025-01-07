// enemy.js
class Enemy {
    constructor(x, y, speed, color = "red", player) {
      this.x = x;
      this.y = y;
      this.width = 30;
      this.height = 30;
      this.speed = speed;
      this.color = color;
      this.active = true;
      this.health = 1;
      this.maxHealth = this.health;
      this.player = player;
      this.damage = 1;
    }
  
    update(canvas, player) {
      // Calculate direction to player (center to center)
      const enemyCenterX = this.x + this.width / 2;
      const enemyCenterY = this.y + this.height / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
  
      let dx = playerCenterX - enemyCenterX;
      let dy = playerCenterY - enemyCenterY;
  
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance !== 0) {
        dx /= distance;
        dy /= distance;
      }
  
      // Move the enemy toward the player
      this.x += dx * this.speed;
      this.y += dy * this.speed;
  
      // Deactivate if it goes way off screen (rare)
      if (
        this.x < -50 ||
        this.x > canvas.width + 50 ||
        this.y < -50 ||
        this.y > canvas.height + 50
      ) {
        this.active = false;
      }
    }
  
    drawHealthBar(ctx) {
      const barWidth = this.width;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
  
      // Background
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
  
      // Health remaining
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      this.drawHealthBar(ctx);
    }
  
    drawHealthBar(ctx) {
      const fixedBarWidth = 40;
      const barHeight = 4;
      const healthPercent = Math.min(1, this.health / this.maxHealth); // Added Math.min to cap at 1
      const barX = this.x + (this.width - fixedBarWidth) / 2;
  
      // Background (red)
      ctx.fillStyle = "red";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth, barHeight);
  
      // Health remaining (green)
      ctx.fillStyle = "lime";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth * healthPercent, barHeight);
    }
  
    takeDamage(amount) {
      this.health -= amount;
      if (this.health <= 0) {
        this.active = false;
        if (this.player.stats.vampirism) {
          const healAmount = amount * 0.2; // 20% of damage dealt
          this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + healAmount
          );
        }
      }
    }
  
    die() {
      this.active = false;
      const baseValue =
        this instanceof FastEnemy
          ? 5
          : this instanceof TankEnemy
          ? 15
          : this instanceof ShooterEnemy
          ? 10
          : this instanceof EliteFastEnemy
          ? 25
          : this instanceof EliteTankEnemy
          ? 35
          : this instanceof EliteShooterEnemy
          ? 30
          : this instanceof BomberEnemy
          ? 20
          : this instanceof TeleporterEnemy
          ? 15
          : this instanceof PulsarEnemy
          ? 25
          : 5;
  
      const currencyAmount = Math.floor(
        baseValue * this.player.stats.currencyMultiplier
      );
      const xpAmount = Math.floor(baseValue * this.player.stats.xpMultiplier);
  
      this.player.gainXP(xpAmount);
      return new CurrencyDrop(this.x, this.y, currencyAmount);
    }
  }
  
  class FastEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 4, "#ff4d4d", player);
      this.width = 20;
      this.height = 20;
      this.health = 1;
    }
  
    draw(ctx) {
      // Triangle shape
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ff9999";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  }
  
  class TankEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 1, "#8b0000", player);
      this.width = 40;
      this.height = 40;
      this.health = 3;
      this.maxHealth = this.health;
    }
  
    draw(ctx) {
      // Hexagon shape
      ctx.beginPath();
      const sides = 6;
      const radius = this.width / 2;
      ctx.moveTo(
        this.x + radius + radius * Math.cos(0),
        this.y + radius + radius * Math.sin(0)
      );
      for (let i = 1; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        ctx.lineTo(
          this.x + radius + radius * Math.cos(angle),
          this.y + radius + radius * Math.sin(angle)
        );
      }
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#cc0000";
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    drawHealthBar(ctx) {
      const fixedBarWidth = 40;
      const barHeight = 4;
      const healthPercent = Math.min(1, this.health / this.maxHealth); // Added Math.min to cap at 1
      const barX = this.x + (this.width - fixedBarWidth) / 2;
  
      ctx.fillStyle = "red";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth, barHeight);
  
      ctx.fillStyle = "lime";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth * healthPercent, barHeight);
    }
  }
  
  class ShooterEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 2, "#ff8c00", player);
      this.lastShot = 0;
      this.shootInterval = 2000;
    }
  
    draw(ctx) {
      // Diamond shape with inner circle
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height / 2);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height / 2);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ffa500";
      ctx.stroke();
      // Inner circle
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#ffd700";
      ctx.fill();
  
      this.drawHealthBar(ctx);
    }
  
    shoot(player, game) {
      // Calculate direction to player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      // Normalize direction
      const direction = {
        x: dx / distance,
        y: dy / distance,
      };
  
      // Create enemy bullet
      const bullet = new Bullet(
        this.x + this.width / 2,
        this.y + this.height / 2,
        4,
        direction,
        "#ff8c00" // Orange bullet
      );
  
      game.enemyBullets.push(bullet);
    }
  
    update(canvas, player, game) {
      super.update(canvas, player);
      if (performance.now() - this.lastShot > this.shootInterval) {
        this.shoot(player, game);
        this.lastShot = performance.now();
      }
    }
  }
  
  class BomberEnemy extends Enemy {
    constructor(x, y, player, game) {
      // Add game parameter
      super(x, y, 2.5, "#ff1493", player);
      this.game = game; // Store game reference
      this.health = 2;
      this.maxHealth = 2;
      this.explosionRadius = 100;
      this.explosionDamage = 2;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ff69b4";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    die() {
      this.explode();
      return super.die();
    }
  
    explode() {
      this.game.enemies.forEach((enemy) => {
        if (enemy !== this) {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < this.explosionRadius) {
            const damage = Math.floor(
              (1 - distance / this.explosionRadius) * this.explosionDamage
            );
            enemy.takeDamage(damage);
  
            // Add explosion visual feedback
            this.game.damageIndicators.push(
              new DamageIndicator(
                enemy.x + enemy.width / 2,
                enemy.y,
                damage,
                "#ff1493"
              )
            );
          }
        }
      });
    }
  }
  
  class TeleporterEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 3, "#9400d3", player);
      this.game = game;
      this.health = 2;
      this.maxHealth = 2;
      this.lastTeleport = 0;
      this.teleportCooldown = 3000;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ba55d3";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player, game) {
      super.update(canvas, player);
      if (performance.now() - this.lastTeleport > this.teleportCooldown) {
        this.teleport(canvas);
        this.lastTeleport = performance.now();
      }
    }
  
    teleport(canvas) {
      this.x = Math.random() * (canvas.width - this.width);
      this.y = Math.random() * (canvas.height - this.height);
    }
  }
  
  class EliteShooterEnemy extends ShooterEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.color = "#ff4500";
      this.health = 4;
      this.maxHealth = 4;
      this.shootInterval = 2500; // Slightly longer interval
      this.burstCount = 2; // Reduced from 3 to 2 bullets per burst
      this.burstDelay = 200;
      this.damage = 1.5;
    }
  
    shoot(player, game) {
      for (let i = 0; i < this.burstCount; i++) {
        setTimeout(() => {
          if (this.active) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const direction = {
              x: dx / distance,
              y: dy / distance,
            };
            const bullet = new Bullet(
              this.x + this.width / 2,
              this.y + this.height / 2,
              4,
              direction,
              "#ff4500"
            );
            game.enemyBullets.push(bullet);
          }
        }, i * this.burstDelay);
      }
    }
  }
  class EliteFastEnemy extends FastEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.game = game;
      this.color = "#ff0000";
      this.speed = 6;
      this.health = 3;
      this.maxHealth = 3;
      this.damage = 2;
      this.trailParticles = [];
    }
  
    draw(ctx) {
      // Draw speed trail
      this.trailParticles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.globalAlpha = particle.life / 20;
        ctx.moveTo(particle.x + this.width / 2, particle.y);
        ctx.lineTo(particle.x + this.width, particle.y + this.height);
        ctx.lineTo(particle.x, particle.y + this.height);
        ctx.closePath();
        ctx.fillStyle = "#ff6666";
        ctx.fill();
        ctx.globalAlpha = 1;
      });
  
      // Enhanced triangle with inner glow
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
  
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, "#ff0000");
      gradient.addColorStop(1, "#ff4444");
      ctx.fillStyle = gradient;
  
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
  
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player) {
      super.update(canvas, player);
  
      // Add trail particle
      this.trailParticles.push({
        x: this.x,
        y: this.y,
        life: 20,
      });
  
      // Update trail particles
      this.trailParticles = this.trailParticles.filter((particle) => {
        particle.life--;
        return particle.life > 0;
      });
    }
  }
  
  class EliteTankEnemy extends TankEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.game = game;
      this.color = "#660000";
      this.health = 6;
      this.maxHealth = 6;
      this.shieldActive = true;
      this.shieldHealth = 2;
    }
  
    draw(ctx) {
      // Enhanced hexagon with shield effect
      if (this.shieldActive) {
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 1.5,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = "#88ccff";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#88ccff";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
  
      ctx.beginPath();
      const sides = 6;
      const radius = this.width / 2;
      const centerX = this.x + radius;
      const centerY = this.y + radius;
  
      for (let i = 0; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 6;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
  
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "#990000");
      gradient.addColorStop(1, "#660000");
      ctx.fillStyle = gradient;
      ctx.fill();
  
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3;
      ctx.stroke();
  
      this.drawHealthBar(ctx);
    }
  
    takeDamage(amount) {
      if (this.shieldActive) {
        this.shieldHealth -= amount;
        if (this.shieldHealth <= 0) {
          this.shieldActive = false;
        }
        return;
      }
      super.takeDamage(amount);
    }
  }
  
  class PulsarEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 2, "#4b0082", player);
      this.game = game;
      this.pulseRadius = 50;
      this.pulseGrowing = true;
      this.maxPulseRadius = 150;
      this.pulseSpeed = 2;
      this.pulseDamage = 1;
    }
  
    draw(ctx) {
      // Pulse wave effect
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.pulseRadius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(75, 0, 130, ${
        0.5 - this.pulseRadius / this.maxPulseRadius / 2
      })`;
      ctx.stroke();
  
      // Enemy body
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      const gradient = ctx.createRadialGradient(
        this.x + this.width / 2,
        this.y + this.height / 2,
        0,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2
      );
      gradient.addColorStop(0, "#9400d3");
      gradient.addColorStop(1, "#4b0082");
      ctx.fillStyle = gradient;
      ctx.fill();
  
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player) {
      super.update(canvas, player);
  
      // Update pulse
      if (this.pulseGrowing) {
        this.pulseRadius += this.pulseSpeed;
        if (this.pulseRadius >= this.maxPulseRadius) {
          this.pulseGrowing = false;
        }
      } else {
        this.pulseRadius -= this.pulseSpeed;
        if (this.pulseRadius <= 50) {
          this.pulseGrowing = true;
          this.damageInPulseRange(player);
        }
      }
    }
  
    damageInPulseRange(player) {
      const dx = player.x + player.width / 2 - (this.x + this.width / 2);
      const dy = player.y + player.height / 2 - (this.y + this.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
  // enemy.js
class Enemy {
    constructor(x, y, speed, color = "red", player) {
      this.x = x;
      this.y = y;
      this.width = 30;
      this.height = 30;
      this.speed = speed;
      this.color = color;
      this.active = true;
      this.health = 1;
      this.maxHealth = this.health;
      this.player = player;
      this.damage = 1;
    }
  
    update(canvas, player) {
      // Calculate direction to player (center to center)
      const enemyCenterX = this.x + this.width / 2;
      const enemyCenterY = this.y + this.height / 2;
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
  
      let dx = playerCenterX - enemyCenterX;
      let dy = playerCenterY - enemyCenterY;
  
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance !== 0) {
        dx /= distance;
        dy /= distance;
      }
  
      // Move the enemy toward the player
      this.x += dx * this.speed;
      this.y += dy * this.speed;
  
      // Deactivate if it goes way off screen (rare)
      if (
        this.x < -50 ||
        this.x > canvas.width + 50 ||
        this.y < -50 ||
        this.y > canvas.height + 50
      ) {
        this.active = false;
      }
    }
  
    drawHealthBar(ctx) {
      const barWidth = this.width;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
  
      // Background
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
  
      // Health remaining
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      this.drawHealthBar(ctx);
    }
  
    drawHealthBar(ctx) {
      const fixedBarWidth = 40;
      const barHeight = 4;
      const healthPercent = Math.min(1, this.health / this.maxHealth); // Added Math.min to cap at 1
      const barX = this.x + (this.width - fixedBarWidth) / 2;
  
      // Background (red)
      ctx.fillStyle = "red";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth, barHeight);
  
      // Health remaining (green)
      ctx.fillStyle = "lime";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth * healthPercent, barHeight);
    }
  
    takeDamage(amount) {
      this.health -= amount;
      if (this.health <= 0) {
        this.active = false;
        if (this.player.stats.vampirism) {
          const healAmount = amount * 0.2; // 20% of damage dealt
          this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + healAmount
          );
        }
      }
    }
  
    die() {
      this.active = false;
      const baseValue =
        this instanceof FastEnemy
          ? 5
          : this instanceof TankEnemy
          ? 15
          : this instanceof ShooterEnemy
          ? 10
          : this instanceof EliteFastEnemy
          ? 25
          : this instanceof EliteTankEnemy
          ? 35
          : this instanceof EliteShooterEnemy
          ? 30
          : this instanceof BomberEnemy
          ? 20
          : this instanceof TeleporterEnemy
          ? 15
          : this instanceof PulsarEnemy
          ? 25
          : 5;
  
      const currencyAmount = Math.floor(
        baseValue * this.player.stats.currencyMultiplier
      );
      const xpAmount = Math.floor(baseValue * this.player.stats.xpMultiplier);
  
      this.player.gainXP(xpAmount);
      return new CurrencyDrop(this.x, this.y, currencyAmount);
    }
  }
  
  class FastEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 4, "#ff4d4d", player);
      this.width = 20;
      this.height = 20;
      this.health = 1;
    }
  
    draw(ctx) {
      // Triangle shape
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ff9999";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  }
  
  class TankEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 1, "#8b0000", player);
      this.width = 40;
      this.height = 40;
      this.health = 3;
      this.maxHealth = this.health;
    }
  
    draw(ctx) {
      // Hexagon shape
      ctx.beginPath();
      const sides = 6;
      const radius = this.width / 2;
      ctx.moveTo(
        this.x + radius + radius * Math.cos(0),
        this.y + radius + radius * Math.sin(0)
      );
      for (let i = 1; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        ctx.lineTo(
          this.x + radius + radius * Math.cos(angle),
          this.y + radius + radius * Math.sin(angle)
        );
      }
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#cc0000";
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    drawHealthBar(ctx) {
      const fixedBarWidth = 40;
      const barHeight = 4;
      const healthPercent = Math.min(1, this.health / this.maxHealth); // Added Math.min to cap at 1
      const barX = this.x + (this.width - fixedBarWidth) / 2;
  
      ctx.fillStyle = "red";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth, barHeight);
  
      ctx.fillStyle = "lime";
      ctx.fillRect(barX, this.y - 8, fixedBarWidth * healthPercent, barHeight);
    }
  }
  
  class ShooterEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 2, "#ff8c00", player);
      this.lastShot = 0;
      this.shootInterval = 2000;
    }
  
    draw(ctx) {
      // Diamond shape with inner circle
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height / 2);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height / 2);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ffa500";
      ctx.stroke();
      // Inner circle
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 4,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "#ffd700";
      ctx.fill();
  
      this.drawHealthBar(ctx);
    }
  
    shoot(player, game) {
      // Calculate direction to player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      // Normalize direction
      const direction = {
        x: dx / distance,
        y: dy / distance,
      };
  
      // Create enemy bullet
      const bullet = new Bullet(
        this.x + this.width / 2,
        this.y + this.height / 2,
        4,
        direction,
        "#ff8c00" // Orange bullet
      );
  
      game.enemyBullets.push(bullet);
    }
  
    update(canvas, player, game) {
      super.update(canvas, player);
      if (performance.now() - this.lastShot > this.shootInterval) {
        this.shoot(player, game);
        this.lastShot = performance.now();
      }
    }
  }
  
  class BomberEnemy extends Enemy {
    constructor(x, y, player, game) {
      // Add game parameter
      super(x, y, 2.5, "#ff1493", player);
      this.game = game; // Store game reference
      this.health = 2;
      this.maxHealth = 2;
      this.explosionRadius = 100;
      this.explosionDamage = 2;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ff69b4";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    die() {
      this.explode();
      return super.die();
    }
  
    explode() {
      this.game.enemies.forEach((enemy) => {
        if (enemy !== this) {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
  
          if (distance < this.explosionRadius) {
            const damage = Math.floor(
              (1 - distance / this.explosionRadius) * this.explosionDamage
            );
            enemy.takeDamage(damage);
  
            // Add explosion visual feedback
            this.game.damageIndicators.push(
              new DamageIndicator(
                enemy.x + enemy.width / 2,
                enemy.y,
                damage,
                "#ff1493"
              )
            );
          }
        }
      });
    }
  }
  
  class TeleporterEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 3, "#9400d3", player);
      this.game = game;
      this.health = 2;
      this.maxHealth = 2;
      this.lastTeleport = 0;
      this.teleportCooldown = 3000;
    }
  
    draw(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.height);
      ctx.lineTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.strokeStyle = "#ba55d3";
      ctx.stroke();
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player, game) {
      super.update(canvas, player);
      if (performance.now() - this.lastTeleport > this.teleportCooldown) {
        this.teleport(canvas);
        this.lastTeleport = performance.now();
      }
    }
  
    teleport(canvas) {
      this.x = Math.random() * (canvas.width - this.width);
      this.y = Math.random() * (canvas.height - this.height);
    }
  }
  
  class EliteShooterEnemy extends ShooterEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.color = "#ff4500";
      this.health = 4;
      this.maxHealth = 4;
      this.shootInterval = 2500; // Slightly longer interval
      this.burstCount = 2; // Reduced from 3 to 2 bullets per burst
      this.burstDelay = 200;
      this.damage = 1.5;
    }
  
    shoot(player, game) {
      for (let i = 0; i < this.burstCount; i++) {
        setTimeout(() => {
          if (this.active) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const direction = {
              x: dx / distance,
              y: dy / distance,
            };
            const bullet = new Bullet(
              this.x + this.width / 2,
              this.y + this.height / 2,
              4,
              direction,
              "#ff4500"
            );
            game.enemyBullets.push(bullet);
          }
        }, i * this.burstDelay);
      }
    }
  }
  class EliteFastEnemy extends FastEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.game = game;
      this.color = "#ff0000";
      this.speed = 6;
      this.health = 3;
      this.maxHealth = 3;
      this.damage = 2;
      this.trailParticles = [];
    }
  
    draw(ctx) {
      // Draw speed trail
      this.trailParticles.forEach((particle, index) => {
        ctx.beginPath();
        ctx.globalAlpha = particle.life / 20;
        ctx.moveTo(particle.x + this.width / 2, particle.y);
        ctx.lineTo(particle.x + this.width, particle.y + this.height);
        ctx.lineTo(particle.x, particle.y + this.height);
        ctx.closePath();
        ctx.fillStyle = "#ff6666";
        ctx.fill();
        ctx.globalAlpha = 1;
      });
  
      // Enhanced triangle with inner glow
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, this.y);
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.lineTo(this.x, this.y + this.height);
      ctx.closePath();
  
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + this.height
      );
      gradient.addColorStop(0, "#ff0000");
      gradient.addColorStop(1, "#ff4444");
      ctx.fillStyle = gradient;
  
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
  
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player) {
      super.update(canvas, player);
  
      // Add trail particle
      this.trailParticles.push({
        x: this.x,
        y: this.y,
        life: 20,
      });
  
      // Update trail particles
      this.trailParticles = this.trailParticles.filter((particle) => {
        particle.life--;
        return particle.life > 0;
      });
    }
  }
  
  class EliteTankEnemy extends TankEnemy {
    constructor(x, y, player) {
      super(x, y, player);
      this.game = game;
      this.color = "#660000";
      this.health = 6;
      this.maxHealth = 6;
      this.shieldActive = true;
      this.shieldHealth = 2;
    }
  
    draw(ctx) {
      // Enhanced hexagon with shield effect
      if (this.shieldActive) {
        ctx.beginPath();
        ctx.arc(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.width / 1.5,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = "#88ccff";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#88ccff";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
  
      ctx.beginPath();
      const sides = 6;
      const radius = this.width / 2;
      const centerX = this.x + radius;
      const centerY = this.y + radius;
  
      for (let i = 0; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 6;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
  
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "#990000");
      gradient.addColorStop(1, "#660000");
      ctx.fillStyle = gradient;
      ctx.fill();
  
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3;
      ctx.stroke();
  
      this.drawHealthBar(ctx);
    }
  
    takeDamage(amount) {
      if (this.shieldActive) {
        this.shieldHealth -= amount;
        if (this.shieldHealth <= 0) {
          this.shieldActive = false;
        }
        return;
      }
      super.takeDamage(amount);
    }
  }
  
  class PulsarEnemy extends Enemy {
    constructor(x, y, player) {
      super(x, y, 2, "#4b0082", player);
      this.game = game;
      this.pulseRadius = 50;
      this.pulseGrowing = true;
      this.maxPulseRadius = 150;
      this.pulseSpeed = 2;
      this.pulseDamage = 1;
    }
  
    draw(ctx) {
      // Pulse wave effect
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.pulseRadius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = `rgba(75, 0, 130, ${
        0.5 - this.pulseRadius / this.maxPulseRadius / 2
      })`;
      ctx.stroke();
  
      // Enemy body
      ctx.beginPath();
      ctx.arc(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        0,
        Math.PI * 2
      );
      const gradient = ctx.createRadialGradient(
        this.x + this.width / 2,
        this.y + this.height / 2,
        0,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2
      );
      gradient.addColorStop(0, "#9400d3");
      gradient.addColorStop(1, "#4b0082");
      ctx.fillStyle = gradient;
      ctx.fill();
  
      this.drawHealthBar(ctx);
    }
  
    update(canvas, player) {
      super.update(canvas, player);
  
      // Update pulse
      if (this.pulseGrowing) {
        this.pulseRadius += this.pulseSpeed;
        if (this.pulseRadius >= this.maxPulseRadius) {
          this.pulseGrowing = false;
        }
      } else {
        this.pulseRadius -= this.pulseSpeed;
        if (this.pulseRadius <= 50) {
          this.pulseGrowing = true;
          this.damageInPulseRange(player);
        }
      }
    }
  
    damageInPulseRange(player) {
      const dx = player.x + player.width / 2 - (this.x + this.width / 2);
      const dy = player.y + player.height / 2 - (this.y + this.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance <= this.maxPulseRadius) {
        player.takeDamage(this.pulseDamage);
        // Add visual feedback
        game.damageIndicators.push(
          new DamageIndicator(
            player.x + player.width / 2,
            player.y,
            this.pulseDamage,
            "#ff4444"
          )
        );
      }
    }
  }
  
      if (distance <= this.maxPulseRadius) {
        player.takeDamage(this.pulseDamage);
        // Add visual feedback
        game.damageIndicators.push(
          new DamageIndicator(
            player.x + player.width / 2,
            player.y,
            this.pulseDamage,
            "#ff4444"
          )
        );
      }
    }
  }
  