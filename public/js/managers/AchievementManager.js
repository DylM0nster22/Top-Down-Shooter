class AchievementManager {
    constructor() {
        this.achievements = {
            // Ship Unlock Achievements
            stealthMaster: {
                id: "stealth_master",
                name: "Ghost Protocol",
                description: "Kill 50 enemies without taking damage",
                progress: 0,
                target: 50,
                reward: "stealth",
                completed: false
            },
            survivor: {
                id: "survivor",
                name: "Born Survivor",
                description: "Survive for 5 minutes in a single run",
                progress: 0,
                target: 300, // in seconds
                reward: "juggernaut",
                completed: false
            },
            damageDealer: {
                id: "damage_dealer",
                name: "Maximum Overdrive",
                description: "Deal 1000 damage in a single run",
                progress: 0,
                target: 1000,
                reward: "glass_cannon",
                completed: false
            },
            collector: {
                id: "collector",
                name: "Fortune Hunter",
                description: "Collect 1000 total currency",
                progress: 0,
                target: 1000,
                reward: "vampire",
                completed: false
            },
            
            // General Achievements
            waveMaster: {
                id: "wave_master",
                name: "Wave Master",
                description: "Reach Wave 10",
                progress: 0,
                target: 10,
                reward: "currency_boost",
                completed: false
            },
            eliteHunter: {
                id: "elite_hunter",
                name: "Elite Hunter",
                description: "Defeat 25 elite enemies",
                progress: 0,
                target: 25,
                reward: "damage_boost",
                completed: false
            }
        };
        
        this.loadProgress(); // Load progress on initialization
    }

    loadProgress() {
        const savedProgress = JSON.parse(localStorage.getItem("achievementProgress")) || {};
        for (const achievementId in this.achievements) {
            if (savedProgress[achievementId]) {
                this.achievements[achievementId].progress = savedProgress[achievementId].progress;
                this.achievements[achievementId].completed = savedProgress[achievementId].completed;
            }
        }
    }

    saveProgress() {
        const progressToSave = {};
        for (const achievementId in this.achievements) {
            progressToSave[achievementId] = {
                progress: this.achievements[achievementId].progress,
                completed: this.achievements[achievementId].completed
            };
        }
        localStorage.setItem("achievementProgress", JSON.stringify(progressToSave));
    }

    updateProgress(achievementId, value) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.completed) return;

        achievement.progress = Math.min(achievement.progress + value, achievement.target);
        
        if (achievement.progress >= achievement.target) {
            this.completeAchievement(achievementId);
        }
        
        this.saveProgress();
    }

    completeAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.completed) return;
    
        achievement.completed = true;
        this.saveProgress();
    
        if (achievement.reward.startsWith("ship_")) {
            this.unlockShip(achievement.reward.replace("ship_", ""));
        }
    
        this.showAchievementNotification(achievement);
    }
    

    unlockShip(shipId) {
        const skinSelector = new SkinSelector();
        const ship = skinSelector.availableSkins.find(s => s.id === shipId);
        if (ship) {
            ship.unlocked = true;
            localStorage.setItem("availableSkins", JSON.stringify(skinSelector.availableSkins));
        }
        const skinSelectorContent = document.getElementById("skinSelectorContent");
        if (skinSelectorContent) {
            skinSelector.renderSkinSelector(skinSelectorContent);
        }
    }
    
    showAchievementNotification(achievement) {
        // Logic to show notification for the completed achievement
    }
} 