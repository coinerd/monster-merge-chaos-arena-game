/**
 * BattleSimulator handles the simulation of battles between player and enemy teams
 */
class BattleSimulator {
    constructor(monsterManager) {
        this.monsterManager = monsterManager;
        this.battleLog = [];
    }
    
    /**
     * Clear the battle log
     */
    clearLog() {
        this.battleLog = [];
    }
    
    /**
     * Get the battle log
     * @returns {Array} Array of battle log messages
     */
    getLog() {
        return this.battleLog;
    }
    
    /**
     * Add an event to the battle log
     * @param {string} message - The battle event message
     */
    logBattleEvent(message) {
        this.battleLog.push(message);
        console.log("Battle Event:", message); // Debug log to see if events are being recorded
    }
    
    /**
     * Simulate a battle between player and enemy teams
     * @param {Array} playerTeam - Array of player monsters
     * @param {Array} enemyTeam - Array of enemy monsters
     * @returns {Promise} Promise that resolves when simulation is complete
     */
    simulateBattle(playerTeam, enemyTeam) {
        // Clear previous battle log
        this.clearLog();
        
        this.logBattleEvent("Battle begins!");
        
        return new Promise((resolve) => {
            let currentTurn = 0;
            const maxTurns = 100; // Prevent infinite loops
            
            // Track damage dealt by each team for results
            let playerDamageDealt = 0;
            let enemyDamageDealt = 0;
            
            const simulateTurn = () => {
                currentTurn++;
                this.logBattleEvent(`Turn ${currentTurn} begins`);
                
                // Check if battle is over
                if (playerTeam.every(m => m.health <= 0) || 
                    enemyTeam.every(m => m.health <= 0) || 
                    currentTurn > maxTurns) {
                    // Battle is over, determine outcome
                    const victory = enemyTeam.every(m => m.health <= 0);
                    const remainingPlayerMonsters = playerTeam.filter(m => m.health > 0);
                    
                    if (currentTurn > maxTurns) {
                        this.logBattleEvent("Battle timed out! It's a draw.");
                    } else if (victory) {
                        this.logBattleEvent("Victory! Your monsters have defeated the enemies!");
                    } else {
                        this.logBattleEvent("Defeat! Your monsters were overcome by the enemies!");
                    }
                    
                    // Calculate final results with battle log
                    const results = {
                        victory,
                        remainingPlayerMonsters, // Keep this property name consistent
                        remainingMonsters: remainingPlayerMonsters, // Add this for backwards compatibility
                        playerDamageDealt,
                        enemyDamageDealt,
                        battleLog: this.getLog()  // Include the battle log in the results
                    };
                    
                    // Log the battle log length for debugging
                    console.log(`Battle complete. Battle log has ${results.battleLog.length} entries.`);
                    
                    resolve(results);
                    return;
                }
                
                // Player team attacks
                this.logBattleEvent("Player's turn:");
                playerDamageDealt += this.simulateTeamAttack(playerTeam, enemyTeam);
                
                // Check if enemy team is defeated
                if (enemyTeam.every(m => m.health <= 0)) {
                    simulateTurn(); // Skip to end condition check
                    return;
                }
                
                // Enemy team attacks
                this.logBattleEvent("Enemy's turn:");
                enemyDamageDealt += this.simulateTeamAttack(enemyTeam, playerTeam);
                
                // Schedule next turn with a small delay (for animation purposes)
                setTimeout(simulateTurn, 50);
            };
            
            // Start simulation
            simulateTurn();
        });
    }
    
    /**
     * Simulate attack phase for one team
     * @param {Array} attackers - Team that's attacking
     * @param {Array} defenders - Team that's defending
     * @returns {number} Total damage dealt in this attack phase
     */
    simulateTeamAttack(attackers, defenders) {
        let totalDamageDealt = 0;
        
        // Each alive monster in attacking team gets to attack
        attackers.filter(m => m.health > 0).forEach(attacker => {
            // Find alive defenders
            const aliveDefenders = defenders.filter(m => m.health > 0);
            if (aliveDefenders.length === 0) return;
            
            // Select a random defender
            const defender = aliveDefenders[Math.floor(Math.random() * aliveDefenders.length)];
            
            // Calculate and apply damage
            const damage = this.calculateDamage(attacker, defender);
            totalDamageDealt += damage;
            
            // Apply damage to defender
            defender.health = Math.max(0, defender.health - damage);
            const killed = defender.health <= 0;
            
            // Log the attack
            const attackerType = attacker.isPlayer ? "Player" : "Enemy";
            const defenderType = defender.isPlayer ? "Player" : "Enemy";
            
            this.logBattleEvent(
                `${attackerType} Tier ${attacker.tier} monster attacks ${defenderType} Tier ${defender.tier} monster for ${damage} damage!`
            );
            
            if (killed) {
                this.logBattleEvent(`${defenderType} Tier ${defender.tier} monster is defeated!`);
            }
        });
        
        return totalDamageDealt;
    }
    
    /**
     * Calculate damage for an attack
     * @param {Object} attacker - Attacking monster
     * @param {Object} defender - Defending monster
     * @returns {number} Amount of damage dealt
     */
    calculateDamage(attacker, defender) {
        // Basic damage formula
        const baseDamage = attacker.attack;
        const defenseValue = defender.defense || 0;
        
        // Apply random variance (80-120%)
        const variance = 0.8 + (Math.random() * 0.4);
        
        // Calculate final damage with minimum of 1
        let damage = Math.max(1, Math.floor((baseDamage - defenseValue * 0.5) * variance));
        
        return damage;
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
        }
        
        return {
            coins: Math.floor(coins)
        };
    }
}