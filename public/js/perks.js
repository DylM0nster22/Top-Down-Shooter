const PERKS = {
    VAMPIRISM: {
        name: "Vampirism",
        effect: (player) => {
            player.stats.vampirism = true;
            player.stats.vampirismAmount = Math.round(0.1 * 10) / 10;
        },
        description: "Heal for 10% of damage dealt",
        id: 'vampirism'
    },
    RICH_GET_RICHER: {
        name: "Rich Get Richer",
        effect: (player) => {
            player.stats.currencyMultiplier = Math.round(player.stats.currencyMultiplier * 1.2 * 10) / 10;
        },
        description: "20% more currency from enemies"
    },
    RAPID_FIRE: {
        name: "Rapid Fire",
        effect: (player) => {
            player.stats.fireRate = Math.round(player.stats.fireRate * 1.25 * 10) / 10;
        },
        description: "Increase fire rate by 25%"
    },
    HEAVY_BULLETS: {
        name: "Heavy Bullets",
        effect: (player) => {
            player.stats.damage = Math.round(player.stats.damage * 1.3 * 10) / 10;
        },
        description: "Increase bullet damage by 30%"
    },
    SWIFT_MOVEMENT: {
        name: "Swift Movement",
        effect: (player) => {
            player.stats.moveSpeed = Math.round(player.stats.moveSpeed * 1.2 * 10) / 10;
        },
        description: "Increase movement speed by 20%"
    },
    BULLET_VELOCITY: {
        name: "Bullet Velocity",
        effect: (player) => {
            player.stats.bulletSpeed = Math.round(player.stats.bulletSpeed * 1.3 * 10) / 10;
        },
        description: "Increase bullet speed by 30%"
    },
    TOUGH_SKIN: {
        name: "Tough Skin",
        effect: (player) => {
            player.maxHealth = Math.round((player.maxHealth + 5) * 10) / 10;
            player.health = Math.round((player.health + 5) * 10) / 10;
        },
        description: "Increase max health by 5"
    },
    DASH_MASTER: {
        name: "Dash Master",
        effect: (player) => {
            player.dashCooldown = Math.round(player.dashCooldown * 0.7 * 10) / 10;
        },
        description: "Reduce dash cooldown by 30%"
    },
    EXTENDED_DASH: {
        name: "Extended Dash",
        effect: (player) => {
            player.dashSpeed = Math.round(player.dashSpeed * 1.4 * 10) / 10;
        },
        description: "Increase dash distance by 40%"
    },
    REGENERATION: {
        name: "Regeneration",
        effect: (player) => {
            const currentRegen = player.stats.healthRegen || 0;
            const nextLevel = Math.min(0.5, Math.round((currentRegen + 0.1) * 10) / 10);
            player.stats.healthRegen = nextLevel;
        },
        description: "Regenerate health over time (Stacks up to level 5)"
    },
    LUCKY_LOOTER: {
        name: "Lucky Looter",
        effect: (player) => {
            player.stats.currencyMultiplier = Math.round(player.stats.currencyMultiplier * 1.5 * 10) / 10;
        },
        description: "50% more currency from all sources"
    },
    XP_BOOST: {
        name: "XP Boost",
        effect: (player) => {
            player.stats.xpMultiplier = Math.round((player.stats.xpMultiplier || 1) * 1.25 * 10) / 10;
        },
        description: "Gain 25% more experience"
    },
    BERSERKER: {
        name: "Berserker",
        effect: (player) => {
            player.stats.damage = Math.round(player.stats.damage * 1.5 * 10) / 10;
            player.maxHealth = Math.round(player.maxHealth * 0.8 * 10) / 10;
            player.health = Math.round(Math.min(player.health, player.maxHealth) * 10) / 10;
        },
        description: "50% more damage but 20% less health"
    },
    TANK: {
        name: "Tank",
        effect: (player) => {
            player.maxHealth = Math.round(player.maxHealth * 1.5 * 10) / 10;
            player.health = Math.round(player.health * 1.5 * 10) / 10;
            player.stats.moveSpeed = Math.round(player.stats.moveSpeed * 0.9 * 10) / 10;
        },
        description: "50% more health but 10% slower movement"
    },
    MULTI_SHOT: {
        name: "Multi Shot",
        effect: (player) => {
            player.stats.multiShot = (player.stats.multiShot || 0) + 1;
        },
        description: "Fire an additional bullet"
    },
    GLASS_CANNON: {
        name: "Glass Cannon",
        effect: (player) => {
            player.stats.damage = Math.round(player.stats.damage * 2.0 * 10) / 10;
            player.maxHealth = Math.round(player.maxHealth * 0.5 * 10) / 10;
            player.health = Math.round(Math.min(player.health, player.maxHealth) * 10) / 10;
        },
        description: "Double damage but half health"
    },
    BOUNTY_HUNTER: {
        name: "Bounty Hunter",
        effect: (player) => {
            player.stats.currencyMultiplier = Math.round(player.stats.currencyMultiplier * 1.3 * 10) / 10;
            player.stats.xpMultiplier = Math.round(player.stats.xpMultiplier * 1.3 * 10) / 10;
        },
        description: "30% more currency and XP"
    },
    DASH_STRIKE: {
        name: "Dash Strike",
        effect: (player) => {
            player.stats.dashDamage = (player.stats.dashDamage || 0) + 2;
        },
        description: "Deal damage to enemies while dashing"
    },
    SHIELD_MASTER: {
        name: "Shield Master",
        effect: (player) => {
            player.stats.shield = (player.stats.shield || 0) + 2;
        },
        description: "Gain 2 shield points that regenerate"
    },
    CRITICAL_STRIKE: {
        name: "Critical Strike",
        effect: (player) => {
            player.stats.critChance = (player.stats.critChance || 0) + 0.15;
        },
        description: "15% chance to deal double damage"
    },
    BULLET_STORM: {
        name: "Bullet Storm",
        effect: (player) => {
            player.stats.fireRate *= 1.4;
            player.stats.damage *= 0.9;
        },
        description: "40% faster fire rate but 10% less damage"
    },
    MOMENTUM_MASTER: {
        name: "Momentum Master",
        effect: (player) => {
            player.dashSpeed *= 1.3;
            player.dashCooldown *= 0.8;
        },
        description: "30% faster dash and 20% lower cooldown"
    },
    VAMPIRIC_AURA: {
        name: "Vampiric Mastery",
        effect: (player) => {
            player.stats.vampirismAmount = Math.round(0.2 * 10) / 10;
        },
        description: "Increase healing to 20% of damage dealt",
        id: 'vampiric_aura',
        requires: 'vampirism'
    },
    BULLET_SPLIT: {
        name: "Bullet Split",
        effect: (player) => {
            player.stats.multiShot = (player.stats.multiShot || 0) + 2;
            player.stats.damage = Math.round(player.stats.damage * 0.8 * 10) / 10;
        },
        description: "Add 2 extra bullets but reduce damage by 20%"
    },
    JUGGERNAUT: {
        name: "Juggernaut",
        effect: (player) => {
            player.maxHealth = Math.round(player.maxHealth * 2 * 10) / 10;
            player.health = Math.round(player.maxHealth * 10) / 10;
            player.stats.moveSpeed = Math.round(player.stats.moveSpeed * 0.7 * 10) / 10;
        },
        description: "Double health but 30% slower movement"
    },
    PHASE_SHIFTER: {
        name: "Phase Shifter",
        effect: (player) => {
            player.dashCooldown = Math.round(player.dashCooldown * 0.5 * 10) / 10;
            player.dashSpeed = Math.round(player.dashSpeed * 1.5 * 10) / 10;
        },
        description: "Halve dash cooldown and increase dash speed by 50%"
    }    
};
