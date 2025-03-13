/**
 * MergeManager handles merging of monsters and related effects
 */
class MergeManager {
    constructor(scene, monsterManager, gridCellManager, gameManager) {
        this.scene = scene;
        this.monsterManager = monsterManager;
        this.gridCellManager = gridCellManager;
        this.gameManager = gameManager;
        
        // Default Y position for monsters on the grid (slightly above the grid surface)
        this.defaultMonsterY = 0.5;
    }
    
    canMergeMonsters(monster1, monster2) {
        // Monsters can merge if they are the same tier
        return monster1.tier === monster2.tier;
    }
    
    mergeMonsters(monster1, monster2, row, col) {
        // Remove both monsters from the scene
        this.scene.remove(monster1.mesh);
        this.scene.remove(monster2.mesh);
        
        // Create a new monster of the next tier
        const newTier = monster1.tier + 1;
        
        // Calculate bonus stats based on the parents
        const attackBonus = Math.floor((monster1.attack + monster2.attack) * 0.1);
        const defenseBonus = Math.floor((monster1.defense + monster2.defense) * 0.1);
        const healthBonus = Math.floor((monster1.maxHealth + monster2.maxHealth) * 0.1);
        
        // Create the merged monster with boosted stats
        const newMonster = this.monsterManager.createMonster(newTier, {
            attack: monster1.attack + attackBonus,
            defense: monster1.defense + defenseBonus,
            health: monster1.maxHealth + healthBonus,
            maxHealth: monster1.maxHealth + healthBonus
        });
        
        // Calculate position for the new monster
        const position = this.gridCellManager.getWorldPosition(row, col);
        
        // Position the monster with consistent Y height
        newMonster.mesh.position.set(position.x, this.defaultMonsterY, position.z);
        
        // No need to manually set textures here as the MonsterFactory.createMonster
        // method now handles texture application properly
        
        this.scene.add(newMonster.mesh);
        
        // Animation and effects for merging
        this.playMergeEffect(row, col);
        
        // Notify the game about the merge
        if (window.game && typeof window.game.onMonsterMerged === 'function') {
            window.game.onMonsterMerged(newTier);
        }
        
        // Update highest tier if needed and unlock new monster tier
        if (this.gameManager && newTier > this.gameManager.highestTier) {
            this.gameManager.highestTier = newTier;
            
            // Unlock the new tier in the game
            if (!this.gameManager.unlockedMonsters.includes(newTier)) {
                this.gameManager.unlockedMonsters.push(newTier);
                
                // Update shop items to include the new tier
                this.gameManager.shopItems = this.gameManager.storageManager.generateShopItems(
                    this.gameManager.unlockedMonsters
                );
                
                // Refresh shop if it's open
                if (this.gameManager.uiManager && this.gameManager.uiManager.overlayManager) {
                    const shopOverlay = document.getElementById('shop-overlay');
                    if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
                        this.gameManager.uiManager.openShop();
                    }
                }
                
                // Show notification about new monster tier
                if (this.gameManager.uiManager) {
                    this.gameManager.uiManager.showNotification(`Unlocked Tier ${newTier} Monster!`, 'success');
                }
            }
            
            // Save game state
            if (typeof this.gameManager.saveGameState === 'function') {
                this.gameManager.saveGameState();
            }
        }
        
        return newMonster;
    }
    
    playMergeEffect(row, col) {
        const position = this.gridCellManager.getWorldPosition(row, col);
        
        // Create a particle effect
        const particles = new THREE.Group();
        
        // Number of particles
        const particleCount = 20;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xffff00 })
            );
            
            // Random position around the merge point
            particle.position.set(
                position.x + (Math.random() - 0.5) * 0.5,
                position.y + Math.random() * 0.5,
                position.z + (Math.random() - 0.5) * 0.5
            );
            
            particles.add(particle);
            
            // Add velocity to each particle
            particle.velocity = {
                x: (Math.random() - 0.5) * 0.05,
                y: Math.random() * 0.05,
                z: (Math.random() - 0.5) * 0.05
            };
        }
        
        this.scene.add(particles);
        
        // Animation loop
        const animateParticles = () => {
            let allDead = true;
            
            particles.children.forEach(particle => {
                // Move particle
                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;
                particle.position.z += particle.velocity.z;
                
                // Shrink particle
                particle.scale.multiplyScalar(0.95);
                
                // Check if particle is still alive
                if (particle.scale.x > 0.01) allDead = false;
            });
            
            if (!allDead) {
                requestAnimationFrame(animateParticles);
            } else {
                this.scene.remove(particles);
                particles.children.forEach(p => {
                    if (p.geometry) p.geometry.dispose();
                    if (p.material) p.material.dispose();
                });
            }
        };
        
        animateParticles();
    }
}