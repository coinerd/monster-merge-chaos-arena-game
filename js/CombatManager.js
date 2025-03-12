/**
 * CombatManager handles battle mechanics between player monsters and enemy waves
 * This file is a compatibility wrapper that uses the modular components in the combat/ directory
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
        this.battleLog = [];
        this.currentWave = 1;
        this.enemyMonsters = [];
    }
    
    /**
     * Start a battle with the current wave of enemies
     * @param {Array} playerMonsters - Array of player's monsters
     * @returns {Promise} Promise that resolves when battle is complete
     */
    startBattle(playerMonsters) {
        return new Promise((resolve) => {
            if (this.isInBattle) {
                resolve({ error: "Already in battle" });
                return;
            }
            
            // Mark as in battle
            this.isInBattle = true;
            
            // Generate enemy wave if needed
            if (this.enemyMonsters.length === 0) {
                this.generateEnemyWave();
            }
            
            // Prepare teams for battle
            const playerTeam = playerMonsters.map(monster => {
                // Make sure player monsters are visible
                monster.mesh.visible = true;
                
                // If it's a GLTF model, make sure all child meshes are visible too
                if (monster.mesh.children && monster.mesh.children.length > 0) {
                    monster.mesh.children.forEach(child => {
                        if (child.isMesh) {
                            child.visible = true;
                        }
                    });
                }
                
                // Add to scene if not already there
                if (!monster.mesh.parent) {
                    this.scene.add(monster.mesh);
                }
                
                // Return a battle-ready copy with player flag
                return {
                    ...monster,
                    isPlayer: true
                };
            });
            
            const enemyTeam = this.enemyMonsters.map(monster => {
                // Make sure enemy monsters are visible
                monster.mesh.visible = true;
                
                // If it's a GLTF model, make sure all child meshes are visible too
                if (monster.mesh.children && monster.mesh.children.length > 0) {
                    monster.mesh.children.forEach(child => {
                        if (child.isMesh) {
                            child.visible = true;
                        }
                    });
                }
                
                // Add to scene if not already there
                if (!monster.mesh.parent) {
                    this.scene.add(monster.mesh);
                }
                
                // Return a battle-ready copy with enemy flag
                return {
                    ...monster,
                    isPlayer: false
                };
            });
            
            // Pre-calculate all battle turns
            this.battleSimulator.simulateBattle(playerTeam, enemyTeam)
                .then(result => {
                    console.log("Battle simulation complete:", result);
                    
                    // Update battle log from the result object
                    if (result.battleLog && result.battleLog.length > 0) {
                        this.battleLog = result.battleLog;
                        console.log(`Using battle log from simulator with ${this.battleLog.length} entries`);
                    } else {
                        // Fallback if no battle log in result
                        console.warn("Battle log is empty, generating fallback log");
                        this.generateFallbackBattleLog(playerTeam, enemyTeam, result);
                    }
                    
                    // Animation is done and we have results
                    this.battleAnimator.playBattleAnimations(
                        playerTeam, 
                        enemyTeam, 
                        result, 
                        this.battleLog,
                        () => {
                            // After animations complete
                            this.isInBattle = false;
                            
                            // Clean up battle field
                            this.clearEnemies();
                            
                            // Return the final results
                            resolve({
                                victory: result.victory,
                                remainingMonsters: result.remainingPlayerMonsters || result.remainingMonsters || [], 
                                log: this.battleLog,
                                rewards: this.calculateRewards(result)
                            });
                        }
                    );
                });
        });
    }
    
    /**
     * Generate a fallback battle log in case the main log is empty
     * @param {Array} playerTeam - Player's monster team
     * @param {Array} enemyTeam - Enemy monster team
     * @param {Object} result - Battle result data
     */
    generateFallbackBattleLog(playerTeam, enemyTeam, result) {
        this.battleLog = ["Battle begins!"];
        
        // Add basic battle summary
        const playerMonsterCount = playerTeam.length;
        const enemyMonsterCount = enemyTeam.length;
        
        this.battleLog.push(`Player team: ${playerMonsterCount} monsters`);
        this.battleLog.push(`Enemy team: ${enemyMonsterCount} monsters`);
        
        // Add some generic battle events
        this.battleLog.push("The battle was fierce!");
        
        // Add outcome
        if (result.victory) {
            this.battleLog.push("Your monsters were victorious!");
            const remainingCount = (result.remainingPlayerMonsters || result.remainingMonsters || []).length;
            this.battleLog.push(`${remainingCount} of your monsters survived.`);
        } else {
            this.battleLog.push("Your monsters were defeated.");
        }
        
        // Add damage summary if available
        if (result.playerDamageDealt) {
            this.battleLog.push(`Your team dealt ${result.playerDamageDealt} total damage.`);
        }
        if (result.enemyDamageDealt) {
            this.battleLog.push(`Enemy team dealt ${result.enemyDamageDealt} total damage.`);
        }
        
        this.battleLog.push("Battle ends!");
    }
    
    /**
     * Calculate rewards based on battle results
     * @param {Object} result - Battle result data
     * @returns {Object} Rewards object
     */
    calculateRewards(result) {
        return this.battleSimulator.calculateRewards(result, this.currentWave);
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
        this.enemyMonsters.forEach(enemy => {
            if (enemy.mesh && enemy.mesh.parent) {
                enemy.mesh.parent.remove(enemy.mesh);
            }
        });
        this.enemyMonsters = [];
    }
    
    /**
     * Set the current wave number
     * @param {number} wave - Wave number
     */
    setWave(wave) {
        this.currentWave = wave;
    }
    
    /**
     * Get the current wave number
     * @returns {number} Current wave number
     */
    getWave() {
        return this.currentWave;
    }
}