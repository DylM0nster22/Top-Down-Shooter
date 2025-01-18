class SkinSelector {
    constructor() {
        this.selectedSkin = localStorage.getItem("selectedSkin") || "triangle";
        const savedSkins = JSON.parse(localStorage.getItem("availableSkins"));
        this.availableSkins = savedSkins || [
            // Starter Ships
            { 
                id: "triangle", 
                unlocked: true,
                shape: "triangle",
                name: "Triangle Fighter",
                description: "Classic triangular ship design",
                special: "Balanced handling",
                stats: {
                    speed: 4,
                    health: 10,
                    damage: 1
                }
            },
            { 
                id: "diamond", 
                unlocked: true,
                shape: "diamond",
                name: "Diamond Cruiser",
                description: "Diamond-shaped vessel with precise controls",
                special: "Enhanced maneuverability",
                stats: {
                    speed: 5,
                    health: 8,
                    damage: 1.2
                }
            },
            // Advanced Ships (Unlockable)
            {
                id: "stealth",
                unlocked: false,
                shape: "triangle",
                name: "Stealth Infiltrator",
                description: "Specialized in hit-and-run tactics",
                special: "Temporary invisibility after dash",
                unlockCondition: "Kill 50 enemies without taking damage",
                stats: {
                    speed: 6,
                    health: 6,
                    damage: 1.5
                }
            },
            {
                id: "juggernaut",
                unlocked: false,
                shape: "hexagon",
                name: "Juggernaut",
                description: "Heavy assault vessel",
                special: "Damage reduction when stationary",
                unlockCondition: "Survive for 5 minutes in a single run",
                stats: {
                    speed: 2,
                    health: 20,
                    damage: 0.8
                }
            },
            {
                id: "glass_cannon",
                unlocked: false,
                shape: "star",
                name: "Glass Cannon",
                description: "Extreme damage but very fragile",
                special: "Critical hits deal 3x damage",
                unlockCondition: "Deal 1000 damage in a single run",
                stats: {
                    speed: 4,
                    health: 5,
                    damage: 2.5
                }
            },
            {
                id: "vampire",
                unlocked: false,
                shape: "pentagon",
                name: "Vampire Hunter",
                description: "Sustain through combat",
                special: "Heals for 10% of damage dealt",
                unlockCondition: "Collect 1000 total currency",
                stats: {
                    speed: 3,
                    health: 12,
                    damage: 1.1
                }
            }
            // Add more ships here...
        ];
    }

    selectSkin(skinId) {
        // First verify the skin is unlocked
        const skin = this.availableSkins.find(s => s.id === skinId);
        if (!skin || !skin.unlocked) {
            console.warn('Attempted to select locked skin:', skinId);
            return;
        }

        console.log('Selecting skin:', skinId, 'Shape:', skin.shape); // Debug log

        this.selectedSkin = skinId;
        localStorage.setItem("selectedSkin", skinId);
        
        // Update visual selection
        document.querySelectorAll('.skin-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.skinId === skinId);
        });

        // Force refresh the game player if it exists
        if (window.game && window.game.player) {
            const stats = this.getSkinStats(skinId);
            console.log('Updating player with stats:', stats); // Debug log
            window.game.player.updateSkin(skinId, stats);
        }
    }

    renderSkinSelector(container) {
        container.innerHTML = this.availableSkins.map(skin => `
            <div class="enemy-card skin-card ${this.selectedSkin === skin.id ? 'selected' : ''} ${skin.unlocked ? '' : 'disabled'}" data-skin-id="${skin.id}">
                <h3>${skin.name}</h3>
                <div class="enemy-preview">
                    <canvas class="skin-canvas" width="100" height="100"></canvas>
                </div>
                <p>${skin.description}</p>
                <div class="enemy-stats">
                    <div class="stat-line">
                        <span>Special:</span>
                        <span class="stat-value">${skin.special}</span>
                    </div>
                </div>
                ${!skin.unlocked ? `<p class="unlock-condition">Unlock Condition: ${skin.unlockCondition}</p>` : ''}
            </div>
        `).join('');
    
        // Add click handlers for unlocked skins only
        container.querySelectorAll('.skin-card').forEach(card => {
            if (!card.classList.contains('disabled')) {
                card.addEventListener('click', () => this.selectSkin(card.dataset.skinId));
            }
        });
    
        // Draw ships on canvases
        this.availableSkins.forEach((skin, index) => {
            const canvas = container.querySelectorAll('.skin-canvas')[index];
            this.drawShip(canvas, skin.shape);
        });
    }    

    drawShip(canvas, shape) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 30;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        switch (shape) {
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - size / 2);
                ctx.lineTo(centerX + size / 2, centerY + size / 2);
                ctx.lineTo(centerX - size / 2, centerY + size / 2);
                ctx.closePath();
                ctx.fillStyle = '#4a90e2';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                break;

            case 'diamond':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - size / 2);
                ctx.lineTo(centerX + size / 2, centerY);
                ctx.lineTo(centerX, centerY + size / 2);
                ctx.lineTo(centerX - size / 2, centerY);
                ctx.closePath();
                ctx.fillStyle = '#4a90e2';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                break;

            case 'hexagon':
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI) / 3;
                    const x = centerX + (size / 2) * Math.cos(angle);
                    const y = centerY + (size / 2) * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#4a90e2';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                break;

                case 'star': // For Glass Cannon
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const angle = i * (Math.PI / 5);
                    const radius = i % 2 === 0 ? size / 2 : size / 4;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#4a90e2';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                break;

            case 'pentagon': // For Vampire Hunter
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const x = centerX + (size / 2) * Math.cos(angle);
                    const y = centerY + (size / 2) * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fillStyle = '#4a90e2';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                break;
        }
    }

    getSkinStats(skinId) {
        const skin = this.availableSkins.find(s => s.id === skinId);
        console.log('Getting stats for skin:', skinId, 'Found:', skin); // Debug log
        if (!skin) {
            console.warn('Skin not found:', skinId);
            return this.availableSkins[0].stats;
        }
        return {
            ...skin.stats,
            shape: skin.shape // Explicitly include the shape in stats
        };
    }
}
window.SkinSelector = SkinSelector;

