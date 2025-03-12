/**
 * BattleAnimator handles the animation of battles and visual effects
 */
class BattleAnimator {
    constructor(scene) {
        this.scene = scene;
        this.animationSpeed = 500; // ms per animation step
        this.game = window.game;
        
        // Set up a battle arena position
        this.playerBattlePosition = new THREE.Vector3(-2, 0.5, 0);
        this.enemyBattlePosition = new THREE.Vector3(2, 0.5, 0);
        
        // Debug helpers
        this.debugMode = true;
    }
    
    /**
     * Play battle animations based on the pre-calculated battle results
     * @param {Array} playerTeam - Array of player monsters
     * @param {Array} enemyTeam - Array of enemy monsters
     * @param {Object} result - Battle result data
     * @param {Array} battleLog - Battle log messages
     * @param {Function} onComplete - Callback to run when animations complete
     */
    playBattleAnimations(playerTeam, enemyTeam, result, battleLog, onComplete) {
        // Set flag to indicate battle animations are in progress
        if (this.game) {
            this.game.inBattle = true;
        }
        
        // Store original positions to restore later
        const originalPositions = new Map();
        
        // Move monsters to battle positions
        this.positionMonstersForBattle(playerTeam, enemyTeam, originalPositions);
        
        // Process pre-calculated battle log to create animation queue
        const battleEvents = [...battleLog];
        const attackAnimations = [];
        
        // Parse battle log to create animations
        for (let i = 0; i < battleEvents.length; i++) {
            const event = battleEvents[i];
            
            // Check if it's an attack event
            if (event.includes('attacks') && event.includes('damage')) {
                const isPlayerAttack = event.startsWith('Player');
                
                // Extract monster tiers and damage from log
                const tierMatches = event.match(/Tier (\d+)/g);
                const damageMatch = event.match(/for (\d+) damage/);
                
                if (tierMatches && tierMatches.length === 2 && damageMatch) {
                    const attackerTier = parseInt(tierMatches[0].replace('Tier ', ''));
                    const defenderTier = parseInt(tierMatches[1].replace('Tier ', ''));
                    const damage = parseInt(damageMatch[1]);
                    
                    // Find corresponding monsters
                    const attackingTeam = isPlayerAttack ? playerTeam : enemyTeam;
                    const defendingTeam = isPlayerAttack ? enemyTeam : playerTeam;
                    
                    // Find monsters that match the tiers from the log
                    // This is an approximation since the log doesn't identify specific monsters
                    const attacker = attackingTeam.find(m => m.tier === attackerTier && m.health > 0);
                    const defender = defendingTeam.find(m => m.tier === defenderTier && m.health > 0);
                    
                    if (attacker && defender) {
                        // Add animation to queue
                        attackAnimations.push({
                            attacker,
                            defender,
                            damage
                        });
                    }
                }
            }
        }
        
        // If in debug mode, add debug markers for battle positions
        if (this.debugMode) {
            this.addDebugMarkers();
        }
        
        // Play all animations in sequence
        const playNextAnimation = (index) => {
            if (index >= attackAnimations.length) {
                // All animations done
                if (this.game) {
                    this.game.inBattle = false;
                }
                
                // Restore original positions
                this.restoreOriginalPositions(playerTeam, enemyTeam, originalPositions);
                
                // Clear all health bars for enemy monsters
                if (this.game && this.game.uiManager) {
                    for (const monster of enemyTeam) {
                        this.game.uiManager.removeMonsterHealthBar(monster.id);
                    }
                }
                
                // Remove debug markers if they exist
                if (this.debugMode) {
                    this.removeDebugMarkers();
                }
                
                onComplete();
                return;
            }
            
            const anim = attackAnimations[index];
            this.animateAttack(anim.attacker, anim.defender, anim.damage, () => {
                // Play next animation
                playNextAnimation(index + 1);
            });
        };
        
        // Start playing animations with a small delay for setup
        setTimeout(() => {
            playNextAnimation(0);
        }, 500);
    }
    
    /**
     * Position monsters for battle
     * @param {Array} playerTeam - Player monster team
     * @param {Array} enemyTeam - Enemy monster team
     * @param {Map} originalPositions - Map to store original positions
     */
    positionMonstersForBattle(playerTeam, enemyTeam, originalPositions) {
        // Position player monsters on the left side
        for (let i = 0; i < playerTeam.length; i++) {
            const monster = playerTeam[i];
            if (monster && monster.originalMesh) {
                // Store original position
                originalPositions.set(monster.id, monster.originalMesh.position.clone());
                
                // Position for battle - spread out in a line on left side
                const offset = i * 1.5 - ((playerTeam.length - 1) * 0.75); // Center the line
                monster.originalMesh.position.set(
                    this.playerBattlePosition.x,
                    this.playerBattlePosition.y,
                    this.playerBattlePosition.z + offset
                );
                
                // Ensure the monster is visible
                monster.originalMesh.visible = true;
                monster.originalMesh.traverse(child => {
                    if (child.isMesh) {
                        child.visible = true;
                    }
                });
            }
        }
        
        // Position enemy monsters on the right side
        for (let i = 0; i < enemyTeam.length; i++) {
            const monster = enemyTeam[i];
            if (monster && monster.originalMesh) {
                // Store original position
                originalPositions.set(monster.id, monster.originalMesh.position.clone());
                
                // Position for battle - spread out in a line on right side
                const offset = i * 1.5 - ((enemyTeam.length - 1) * 0.75); // Center the line
                monster.originalMesh.position.set(
                    this.enemyBattlePosition.x,
                    this.enemyBattlePosition.y,
                    this.enemyBattlePosition.z + offset
                );
                
                // Ensure the monster is visible and rotate to face player
                monster.originalMesh.visible = true;
                monster.originalMesh.rotation.y = Math.PI; // Rotate to face player
                monster.originalMesh.traverse(child => {
                    if (child.isMesh) {
                        child.visible = true;
                    }
                });
            }
        }
    }
    
    /**
     * Restore monsters to their original positions
     * @param {Array} playerTeam - Player monster team
     * @param {Array} enemyTeam - Enemy monster team
     * @param {Map} originalPositions - Map with original positions
     */
    restoreOriginalPositions(playerTeam, enemyTeam, originalPositions) {
        for (const monster of [...playerTeam, ...enemyTeam]) {
            if (monster && monster.originalMesh && originalPositions.has(monster.id)) {
                // Only restore if monster survived
                if (monster.health > 0) {
                    monster.originalMesh.position.copy(originalPositions.get(monster.id));
                    monster.originalMesh.rotation.y = 0; // Reset rotation
                }
            }
        }
    }