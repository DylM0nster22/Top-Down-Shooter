const ITEMS = {
    RAPID_FIRE: {
      name: "Rapid Fire Module",
      cost: 100,
      effect: (player) => {
        player.stats.fireRate = Math.round(player.stats.fireRate * 1.2 * 10) / 10;
      },
      description: "Increases fire rate by 20%",
    },
    POWER_CORE: {
      name: "Power Core",
      cost: 150,
      effect: (player) => {
        player.stats.damage = Math.round(player.stats.damage * 1.3 * 10) / 10;
      },
      description: "Increases damage by 30%",
    },
    SPEED_BOOTS: {
      name: "Speed Boots",
      cost: 120,
      effect: (player) => {
        player.stats.moveSpeed =
          Math.round(player.stats.moveSpeed * 1.15 * 10) / 10;
      },
      description: "Increases movement speed by 15%",
    },
    QUANTUM_CORE: {
      name: "Quantum Core",
      cost: 200,
      effect: (player) => {
        player.stats.bulletSpeed =
          Math.round(player.stats.bulletSpeed * 1.4 * 10) / 10;
        player.stats.fireRate = Math.round(player.stats.fireRate * 1.1 * 10) / 10;
      },
      description: "Increases bullet speed by 40% and fire rate by 10%",
    },
    TITANIUM_PLATING: {
      name: "Titanium Plating",
      cost: 180,
      effect: (player) => {
        player.maxHealth = Math.round((player.maxHealth + 3) * 10) / 10;
        player.health = Math.round((player.health + 3) * 10) / 10;
      },
      description: "Increases max health by 3",
    },
    PLASMA_INJECTOR: {
      name: "Plasma Injector",
      cost: 250,
      effect: (player) => {
        player.stats.damage = Math.round(player.stats.damage * 1.25 * 10) / 10;
        player.stats.bulletSpeed =
          Math.round(player.stats.bulletSpeed * 1.15 * 10) / 10;
      },
      description: "Increases damage by 25% and bullet speed by 15%",
    },
    NANO_BOOSTERS: {
      name: "Nano Boosters",
      cost: 300,
      effect: (player) => {
        player.stats.moveSpeed =
          Math.round(player.stats.moveSpeed * 1.2 * 10) / 10;
        player.dashCooldown = Math.round(player.dashCooldown * 0.9 * 10) / 10;
      },
      description:
        "Increases movement speed by 20% and reduces dash cooldown by 10%",
    },
    SHIELD_GENERATOR: {
      name: "Shield Generator",
      cost: 200,
      effect: (player) => {
        player.stats.shield =
          Math.round((player.stats.shield || 0) + 1 * 10) / 10;
      },
      description: "Adds 1 shield point that regenerates",
    },
    HEALTH_CRYSTAL: {
      name: "Health Crystal",
      cost: 180,
      effect: (player) => {
        player.maxHealth = Math.round((player.maxHealth + 4) * 10) / 10;
        player.health = Math.round((player.health + 4) * 10) / 10;
      },
      description: "Increases max health by 4",
    },
    CRIT_MODULE: {
      name: "Critical Strike Module",
      cost: 250,
      effect: (player) => {
        player.stats.critChance =
          Math.round((player.stats.critChance || 0) + 0.1 * 10) / 10;
      },
      description: "Adds 10% critical strike chance",
    },
    XP_AMPLIFIER: {
      name: "XP Amplifier",
      cost: 300,
      effect: (player) => {
        player.stats.xpMultiplier =
          Math.round(player.stats.xpMultiplier * 1.2 * 10) / 10;
      },
      description: "Increases XP gain by 20%",
    },
    DASH_ENHANCER: {
      name: "Dash Enhancer",
      cost: 200,
      effect: (player) => {
        player.dashCooldown = Math.round(player.dashCooldown * 0.8 * 10) / 10;
      },
      description: "Reduces dash cooldown by 20%",
    },
  };
  