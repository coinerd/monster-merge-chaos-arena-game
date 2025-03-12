/**
 * MergeManager handles merging of monsters and related effects
 */
class MergeManager {
    constructor(scene, monsterManager, gridCellManager) {
        this.scene = scene;
        this.monsterManager = monsterManager;
        this.gridCellManager = gridCellManager;
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
        const newMonster = this.monsterManager.createMonster(newTier);
        
        // Calculate position for the new monster
        const position = this.gridCellManager.getWorldPosition(row, col);
        newMonster.mesh.position.set(position.x, position.y, position.z);
        this.scene.add(newMonster.mesh);
        
        // Animation and effects for merging
        this.playMergeEffect(row, col);
        
        // Trigger any game events related to merging
        if (typeof window.game !== 'undefined') {
            window.game.onMonsterMerged(newTier);
        }
        
        return newMonster;
    }
    
    playMergeEffect(row, col) {
        const position = this.gridCellManager.getWorldPosition(row, col);
        
        // Create a particle effect
        const particles = new THREE.Group();
        const particleCount = 20;
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(position.x, position.y, position.z);
            particles.add(particle);
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.1;
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    0.1 + Math.random() * 0.2,
                    Math.sin(angle) * speed
                ),
                life: 30 + Math.floor(Math.random() * 30)
            };
        }
        
        this.scene.add(particles);
        
        // Animation loop
        const animateParticles = () => {
            let allDead = true;
            
            particles.children.forEach(particle => {
                if (particle.userData.life > 0) {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.y -= 0.005; // Gravity
                    particle.userData.life--;
                    allDead = false;
                } else {
                    particle.visible = false;
                }
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