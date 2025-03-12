/**
 * Main CombatManager class that handles all battle mechanics
 * This class coordinates WaveManager, BattleSimulator, and BattleAnimator
 */
class CombatManager {
    constructor(scene, monsterManager) {
        this.scene = scene;
        this.monsterManager = monsterManager;
        
        // Create component managers
        this.waveManager = new WaveManager(scene, monsterManager);
        this.battleSimulator = new BattleSimulator(monsterManager);
        this.battleAnimator = new BattleAnimator(scene);
        
        this.isInBattle = false;
    }
    
    /**
     * Start a battle with the current wave of enemies
     * @param {Array} playerMonsters - Array of player's monsters
     * @returns {Promise} Promise that resolves when battle is complete
     */
    startBattle(playerMonsters) {
        if (this.isInBattle) return Promise.reject('Battle already in progress');
        
        this.isInBattle = true;
        this.battleSimulator.clearLog();
        
        // Get the current enemy monsters
        const enemyMonsters = this.waveManager.getEnemyMonsters();
        
        // Show enemy monsters - they're already positioned in the enemy area
        enemyMonsters.forEach(enemy => {
            enemy.mesh.visible = true;
        });
        
        // Clone the player's monsters to avoid modifying originals during preview
        const playerTeam = playerMonsters.map(monster => ({
            ...monster,
            isPlayer: true,
            originalMesh: monster.mesh // Keep reference to original mesh
        }));
        
        const enemyTeam = enemyMonsters.map(monster => ({
            ...monster,
            isPlayer: false,
            originalMesh: monster.mesh // Keep reference to original mesh
        }));
        
        return new Promise((resolve) => {
            // Pre-calculate all battle turns
            this.battleSimulator.simulateBattle(playerTeam, enemyTeam)
                .then(result => {
                    // Animation is done and we have results
                    this.battleAnimator.playBattleAnimations(
                        playerTeam, 
                        enemyTeam, 
                        result, 
                        this.battleSimulator.getLog(),
                        () => {
                            // After animations complete
                            this.isInBattle = false;
                            
                            // Clean up battle field
                            this.waveManager.clearEnemies();
                            
                            resolve({
                                victory: result.victory,
                                remainingMonsters: result.remainingPlayerMonsters,
                                log: this.battleSimulator.getLog(),
                                rewards: this.calculateRewards(
                                    result, 
                                    this.waveManager.getCurrentWave()
                                )
                            });
                        }
                    );
                });
        });
    }
    
    /**
     * Calculate rewards based on battle results
     * @param {Object} result - Battle result data
     * @param {number} currentWave - Current wave number
     * @returns {Object} Rewards object
     */
    calculateRewards(result, currentWave) {
        // Base reward scales with wave number
        const baseReward = 15 * currentWave;
        let coins = baseReward;
        
        // Bonus for remaining player monsters
        const remainingMonsters = result.remainingPlayerMonsters || result.remainingMonsters || [];
        coins += remainingMonsters.length * 10;
        
        // Bonus for victory
        if (result.victory) {
            // Victory bonus increases with wave number
            coins += baseReward * 1.5;
            
            // Extra bonus for higher waves
            if (currentWave > 5) {
                coins += Math.floor(currentWave * 10);
            }
            
            // Mark wave as completed
            return {
                coins: Math.floor(coins),
                waveCompleted: true
            };
        } else {
            // Reduced reward for defeat
            return {
                coins: Math.floor(coins * 0.3),
                waveCompleted: false
            };
        }
    }
    
    /**
     * Generate enemies for the current wave
     */
    generateEnemyWave() {
        this.enemyMonsters = this.waveManager.generateEnemyWave(this.currentWave);
    }
    
    /**
     * Remove all enemies from the scene
     */
    clearEnemies() {
        this.waveManager.clearEnemies();
    }
    
    /**
     * Preview the upcoming enemy wave
     * @returns {Array} Array of simplified enemy data for display
     */
    previewNextWave() {
        return this.waveManager.previewNextWave();
    }
    
    /**
     * Advance to the next wave
     */
    advanceWave() {
        this.waveManager.advanceWave();
    }
    
    /**
     * Get the current wave number
     * @returns {number} Current wave number
     */
    getCurrentWave() {
        return this.waveManager.getCurrentWave();
    }
    
    /**
     * Set the current wave number
     * @param {number} wave - Wave number to set
     */
    setCurrentWave(wave) {
        this.waveManager.setCurrentWave(wave);
    }
    
    /**
     * Check if a battle is currently in progress
     * @returns {boolean} True if a battle is in progress
     */
    isBattleInProgress() {
        return this.isInBattle;
    }
    
    /**
     * Update battle animations
     * @param {number} delta - Time delta for animation
     */
    update(delta) {
        if (this.battleAnimator && this.isInBattle) {
            this.battleAnimator.update(delta);
        }
    }
}