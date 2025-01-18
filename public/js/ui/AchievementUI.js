class AchievementUI {
    constructor(achievementManager) {
        this.achievementManager = achievementManager;
    }

    showAchievementPanel() {
        const panel = document.createElement('div');
        panel.className = 'achievement-panel';
        
        // Create categories
        const shipUnlocks = document.createElement('div');
        shipUnlocks.className = 'achievement-category';
        shipUnlocks.innerHTML = '<h2>Ship Unlocks</h2>';
        
        const generalAchievements = document.createElement('div');
        generalAchievements.className = 'achievement-category';
        generalAchievements.innerHTML = '<h2>Achievements</h2>';
        
        // Populate achievements
        Object.values(this.achievementManager.achievements).forEach(achievement => {
            const achievementElement = this.createAchievementElement(achievement);
            if (achievement.reward.startsWith('ship_')) {
                shipUnlocks.appendChild(achievementElement);
            } else {
                generalAchievements.appendChild(achievementElement);
            }
        });
        
        panel.appendChild(shipUnlocks);
        panel.appendChild(generalAchievements);
        
        return panel;
    }

    createAchievementElement(achievement) {
        const element = document.createElement('div');
        element.className = 'achievement';
        element.innerHTML = `
            <h3>${achievement.title}</h3>
            <p>${achievement.description}</p>
            <span>Reward: ${achievement.reward}</span>
        `;
        return element;
    }

    // ... (more UI methods)
} 