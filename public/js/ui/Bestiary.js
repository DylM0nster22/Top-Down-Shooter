function showBestiary() {
    this.state = GameState.PAUSED;
    const bestiaryMenu = document.getElementById("bestiaryMenu");
    const content = document.getElementById("bestiaryContent");
  
    const enemies = [
      {
        name: "Fast Enemy",
        description: "Quick and agile enemy that rushes toward the player.",
        health: "1",
        damage: "1",
        special: "20% faster than basic enemies",
        color: "#ff4d4d",
        shape: "triangle",
      },
      {
        name: "Tank Enemy",
        description: "Heavily armored enemy that can absorb more damage.",
        health: "3",
        damage: "1",
        special: "3x health but moves slower",
        color: "#8b0000",
        shape: "hexagon",
      },
      {
        name: "Shooter Enemy",
        description: "Ranged enemy that fires projectiles.",
        health: "2",
        damage: "1",
        special: "Fires bullets every 2 seconds",
        color: "#ff8c00",
        shape: "diamond",
      },
      {
        name: "Elite Fast Enemy",
        description: "Enhanced version with speed trail effects.",
        health: "2",
        damage: "1",
        special: "Leaves damaging trail",
        color: "#ff0000",
        shape: "glowTriangle",
      },
      {
        name: "Elite Tank Enemy",
        description: "Enhanced Tank with protective shield.",
        health: "6",
        damage: "1",
        special: "Has regenerating shield",
        color: "#660000",
        shape: "shieldedHexagon",
      },
      {
        name: "Elite Shooter Enemy",
        description: "Enhanced Shooter with burst capabilities.",
        health: "4",
        damage: "1",
        special: "Fires 3-shot bursts",
        color: "#ff4500",
        shape: "diamondCore",
      },
      {
        name: "Bomber Enemy",
        description: "Explodes on death, damaging nearby enemies.",
        health: "2",
        damage: "2",
        special: "Area explosion on death",
        color: "#ff1493",
        shape: "circle",
      },
      {
        name: "Teleporter Enemy",
        description: "Unpredictable enemy that teleports.",
        health: "2",
        damage: "1",
        special: "Teleports every 3 seconds",
        color: "#9400d3",
        shape: "triangle",
      },
      {
        name: "Pulsar Enemy",
        description: "Emits dangerous pulse waves periodically.",
        health: "3",
        damage: "1",
        special: "Periodic damage pulses",
        color: "#4b0082",
        shape: "pulsar",
      },
    ];
  
    content.innerHTML = enemies
      .map(
        (enemy) => `
      <div class="enemy-card">
          <h3>${enemy.name}</h3>
          <div class="enemy-preview">
              <canvas class="enemy-canvas" width="100" height="100"></canvas>
          </div>
          <p>${enemy.description}</p>
          <div class="enemy-stats">
              <div class="stat-line">
                  <span>Health:</span>
                  <span class="stat-value">${enemy.health}</span>
              </div>
              <div class="stat-line">
                  <span>Damage:</span>
                  <span class="stat-value">${enemy.damage}</span>
              </div>
              <div class="stat-line">
                  <span>Special:</span>
                  <span class="stat-value">${enemy.special}</span>
              </div>
          </div>
      </div>
  `
      )
      .join("");
  
    // After creating the cards, add this drawing code:
    enemies.forEach((enemy, index) => {
      const canvas = document.querySelectorAll(".enemy-canvas")[index];
      const ctx = canvas.getContext("2d");
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const size = 30;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      switch (enemy.shape) {
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY + size / 2);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
          break;
  
        case "hexagon":
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = centerX + (size / 2) * Math.cos(angle);
            const y = centerY + (size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = "#cc0000";
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
  
        case "diamond":
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY);
          ctx.lineTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = "#ffa500";
          ctx.stroke();
          // Inner circle for shooter
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 4, 0, Math.PI * 2);
          ctx.fillStyle = "#ffd700";
          ctx.fill();
          break;
  
        case "glowTriangle":
          ctx.shadowColor = "#ff0000";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY + size / 2);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(
            centerX,
            centerY - size / 2,
            centerX,
            centerY + size / 2
          );
          gradient.addColorStop(0, "#ff0000");
          gradient.addColorStop(1, "#ff4444");
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.shadowBlur = 0;
          break;
  
        case "shieldedHexagon":
          // Shield
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 1.5, 0, Math.PI * 2);
          ctx.strokeStyle = "#88ccff";
          ctx.lineWidth = 3;
          ctx.shadowColor = "#88ccff";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
  
          // Hexagon
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = centerX + (size / 2) * Math.cos(angle);
            const y = centerY + (size / 2) * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          const tankGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            size / 2
          );
          tankGradient.addColorStop(0, "#990000");
          tankGradient.addColorStop(1, "#660000");
          ctx.fillStyle = tankGradient;
          ctx.fill();
          break;
  
        case "diamondCore":
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size / 2);
          ctx.lineTo(centerX + size / 2, centerY);
          ctx.lineTo(centerX, centerY + size / 2);
          ctx.lineTo(centerX - size / 2, centerY);
          ctx.closePath();
          ctx.fillStyle = enemy.color;
          ctx.fill();
          // Enhanced core
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 3, 0, Math.PI * 2);
          ctx.fillStyle = "#ff8c00";
          ctx.fill();
          break;
  
        case "circle":
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = enemy.color;
          ctx.fill();
          ctx.strokeStyle = "#ff69b4";
          ctx.stroke();
          break;
  
        case "pulsar":
          // Main body
          ctx.beginPath();
          ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
          const pulsarGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            size / 2
          );
          pulsarGradient.addColorStop(0, "#9400d3");
          pulsarGradient.addColorStop(1, "#4b0082");
          ctx.fillStyle = pulsarGradient;
          ctx.fill();
  
          // Pulse waves
          ctx.beginPath();
          ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(75, 0, 130, 0.3)";
          ctx.stroke();
          break;
      }
    });
  
    bestiaryMenu.classList.add("show");
  }