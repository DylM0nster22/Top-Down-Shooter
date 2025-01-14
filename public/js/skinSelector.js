class SkinSelector {
    constructor() {
        this.selectedSkin = localStorage.getItem("selectedSkin") || "default";
        this.availableSkins = [
            { 
                id: "triangle", 
                shape: "triangle",
                name: "Triangle Fighter",
                description: "Classic triangular ship design",
                special: "Balanced handling"
            },
            { 
                id: "diamond", 
                shape: "diamond",
                name: "Diamond Cruiser",
                description: "Diamond-shaped vessel with precise controls",
                special: "Enhanced maneuverability"
            },
            { 
                id: "hexagon", 
                shape: "hexagon",
                name: "Hexagon Battleship",
                description: "Six-sided heavy fighter",
                special: "Increased durability"
            },
        ];
    }

    selectSkin(skinId) {
        this.selectedSkin = skinId;
        localStorage.setItem("selectedSkin", skinId);
        
        // Update visual selection
        document.querySelectorAll('.skin-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.skinId === skinId);
        });
    }

    renderSkinSelector(container) {
        container.innerHTML = `
            <h2>Select Your Ship</h2>
            <div class="skin-grid">
                ${this.availableSkins.map(skin => `
                    <div class="skin-card ${this.selectedSkin === skin.id ? 'selected' : ''}" data-skin-id="${skin.id}">
                        <h3>${skin.name}</h3>
                        <div class="skin-preview">
                            <canvas class="skin-canvas" width="100" height="100"></canvas>
                        </div>
                        <p>${skin.description}</p>
                        <div class="skin-stats">
                            <div class="stat-line">
                                <span>Special:</span>
                                <span class="stat-value">${skin.special}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers
        container.querySelectorAll('.skin-card').forEach(card => {
            card.addEventListener('click', () => this.selectSkin(card.dataset.skinId));
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
        }
    }
}

export default SkinSelector;
