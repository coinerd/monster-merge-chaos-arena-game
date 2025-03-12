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
    
    /**
     * Add debug markers for battle positions
     */
    addDebugMarkers() {
        // Create spheres to mark player and enemy positions
        const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        
        // Player position marker (blue)
        const playerMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        this.playerMarker = new THREE.Mesh(markerGeometry, playerMarkerMaterial);
        this.playerMarker.position.copy(this.playerBattlePosition);
        this.scene.add(this.playerMarker);
        
        // Enemy position marker (red)
        const enemyMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.enemyMarker = new THREE.Mesh(markerGeometry, enemyMarkerMaterial);
        this.enemyMarker.position.copy(this.enemyBattlePosition);
        this.scene.add(this.enemyMarker);
    }
    
    /**
     * Remove debug markers
     */
    removeDebugMarkers() {
        if (this.playerMarker) {
            this.scene.remove(this.playerMarker);
            this.playerMarker = null;
        }
        
        if (this.enemyMarker) {
            this.scene.remove(this.enemyMarker);
            this.enemyMarker = null;
        }
    }
    
    /**
     * Simple attack animation function
     * @param {Object} attacker - Attacking monster
     * @param {Object} defender - Defending monster
     * @param {number} damage - Amount of damage
     * @param {Function} callback - Callback function when animation completes
     */
    animateAttack(attacker, defender, damage, callback) {
        const isPlayerAttacking = attacker.isPlayer;
        const mesh = attacker.originalMesh;
        
        // Store original position
        const originalPosition = mesh.position.clone();
        const targetPosition = defender.originalMesh.position.clone();
        
        // Make sure meshes are visible
        mesh.visible = true;
        defender.originalMesh.visible = true;
        
        // Make sure all child meshes are visible (for GLTF models)
        mesh.traverse(child => {
            if (child.isMesh) {
                child.visible = true;
            }
        });
        
        defender.originalMesh.traverse(child => {
            if (child.isMesh) {
                child.visible = true;
            }
        });
        
        // Move toward target
        const moveToTarget = () => {
            // Calculate direction vector to target
            const direction = new THREE.Vector3().subVectors(targetPosition, originalPosition).normalize();
            
            // Move part way there
            const jumpDistance = 1.0; // How far to jump toward target
            mesh.position.addScaledVector(direction, jumpDistance);
            
            // Raise the monster during attack
            mesh.position.y += 0.5;
            
            // After short delay, return to original position
            setTimeout(() => {
                // Show damage effect on defender
                this.showDamageEffect(defender.originalMesh, damage);
                
                // Update health directly (since the battle is pre-calculated)
                // This ensures health bars update correctly during animation
                if (defender.health > damage) {
                    defender.health -= damage;
                } else {
                    defender.health = 0;
                }
                
                // Show damage number if UI manager exists
                if (this.game && this.game.uiManager) {
                    const defenderPosition = this.getScreenPosition(defender.originalMesh);
                    if (defenderPosition) {
                        this.game.uiManager.showDamageNumber(defenderPosition.x, defenderPosition.y, damage);
                    }
                    
                    // Update health bar if it exists
                    this.game.uiManager.updateMonsterHealthBar(defender.id, defender.health, defender.maxHealth);
                    
                    // If monster is defeated
                    if (defender.health <= 0) {
                        // Mark monster as dead and make invisible
                        defender.isDead = true;
                        defender.originalMesh.visible = false;
                        
                        // Signal death in UI
                        this.game.uiManager.removeMonsterHealthBar(defender.id);
                    }
                }
                
                // Return to original position
                mesh.position.copy(originalPosition);
                
                // After a short delay, continue with next animation
                setTimeout(callback, this.animationSpeed / 2);
            }, this.animationSpeed);
        };
        
        // Start the animation
        moveToTarget();
    }
    
    /**
     * Helper method to get screen position of a mesh
     * @param {THREE.Object3D} mesh - The mesh to get screen position for
     * @returns {Object|null} Screen position {x, y} or null if not possible
     */
    getScreenPosition(mesh) {
        if (!mesh || !this.scene || !this.scene.camera) {
            return null;
        }
        
        // Create a vector at the mesh position
        const vector = new THREE.Vector3();
        mesh.getWorldPosition(vector);
        
        // Project position to screen space
        vector.project(this.scene.camera);
        
        // Convert to screen coordinates
        const widthHalf = window.innerWidth / 2;
        const heightHalf = window.innerHeight / 2;
        
        return {
            x: (vector.x * widthHalf) + widthHalf,
            y: -(vector.y * heightHalf) + heightHalf
        };
    }
    
    /**
     * Show damage effect on a monster
     * @param {THREE.Object3D} mesh - Monster mesh
     * @param {number} damage - Amount of damage
     */
    showDamageEffect(mesh, damage) {
        if (!mesh) return;
        
        // Flash the mesh red
        const flashDuration = 300; // ms
        
        // Store original materials to restore later
        const originalMaterials = [];
        
        // Create temporary red material
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        
        // Apply flash material to all child meshes
        mesh.traverse(child => {
            if (child.isMesh) {
                originalMaterials.push({
                    mesh: child,
                    material: child.material
                });
                child.material = flashMaterial;
            }
        });
        
        // After flash duration, restore original materials
        setTimeout(() => {
            originalMaterials.forEach(item => {
                item.mesh.material = item.material;
            });
        }, flashDuration);
    }
}