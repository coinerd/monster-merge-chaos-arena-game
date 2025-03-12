/**
 * MonsterManager handles monster creation, stats, and animations
 */
class MonsterManager {
    constructor(scene) {
        this.scene = scene;
        this.nextMonsterId = 1;
        
        // Monster stats by tier
        this.monsterTiers = {
            1: { health: 100, attack: 10, defense: 5 },
            2: { health: 200, attack: 20, defense: 10 },
            3: { health: 400, attack: 40, defense: 20 },
            4: { health: 800, attack: 80, defense: 40 },
            5: { health: 1600, attack: 160, defense: 80 }
        };
        
        // Load monster models
        this.loadMonsterModels();
    }
    
    /**
     * Load monster models and store them for reuse
     */
    loadMonsterModels() {
        this.monsterModels = {};
        
        // Create basic geometries for each tier
        const geometry1 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const geometry2 = new THREE.SphereGeometry(0.3, 32, 32);
        const geometry3 = new THREE.ConeGeometry(0.3, 0.6, 32);
        const geometry4 = new THREE.TorusGeometry(0.3, 0.1, 16, 100);
        const geometry5 = new THREE.OctahedronGeometry(0.4);
        
        // Create materials with different colors for each tier
        const material1 = new THREE.MeshPhongMaterial({ color: 0x66ff66 }); // Green
        const material2 = new THREE.MeshPhongMaterial({ color: 0x6666ff }); // Blue
        const material3 = new THREE.MeshPhongMaterial({ color: 0xff6666 }); // Red
        const material4 = new THREE.MeshPhongMaterial({ color: 0xffff66 }); // Yellow
        const material5 = new THREE.MeshPhongMaterial({ color: 0xff66ff }); // Purple
        
        // Store meshes for each tier
        this.monsterModels[1] = { geometry: geometry1, material: material1 };
        this.monsterModels[2] = { geometry: geometry2, material: material2 };
        this.monsterModels[3] = { geometry: geometry3, material: material3 };
        this.monsterModels[4] = { geometry: geometry4, material: material4 };
        this.monsterModels[5] = { geometry: geometry5, material: material5 };
    }
    
    /**
     * Create a new monster of the specified tier
     * @param {number} tier - Monster tier (1-5)
     * @param {number} health - Optional initial health
     * @param {number} maxHealth - Optional max health
     * @param {number} attack - Optional attack value
     * @param {number} defense - Optional defense value
     * @returns {Object} New monster object
     */
    createMonster(tier, health = null, maxHealth = null, attack = null, defense = null) {
        if (!this.monsterModels[tier]) {
            console.error(`Invalid monster tier: ${tier}`);
            return null;
        }
        
        // Get the model for this tier
        const model = this.monsterModels[tier];
        
        // Create a new mesh instance
        const mesh = new THREE.Mesh(model.geometry, model.material.clone());
        
        // Get base stats for this tier
        const baseStats = this.monsterTiers[tier];
        
        // Create the monster object
        const monster = {
            id: this.nextMonsterId++,
            tier: tier,
            mesh: mesh,
            health: health !== null ? health : baseStats.health,
            maxHealth: maxHealth !== null ? maxHealth : baseStats.health,
            attack: attack !== null ? attack : baseStats.attack,
            defense: defense !== null ? defense : baseStats.defense,
            animations: []
        };
        
        // Add idle animation
        this.addIdleAnimation(monster);
        
        return monster;
    }
    
    /**
     * Add idle animation to a monster
     * @param {Object} monster - Monster to animate
     */
    addIdleAnimation(monster) {
        const startY = monster.mesh.position.y;
        const amplitude = 0.1;
        const frequency = 2;
        
        monster.animations.push({
            update: (delta) => {
                const time = Date.now() * 0.001;
                monster.mesh.position.y = startY + Math.sin(time * frequency) * amplitude;
                monster.mesh.rotation.y += delta;
            }
        });
    }
    
    /**
     * Update all monster animations
     * @param {number} delta - Time delta for animation
     */
    updateAnimations(delta) {
        // Get all monsters in the scene
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const monster = this.findMonsterByMesh(object);
                if (monster && monster.animations) {
                    // Update all animations for this monster
                    monster.animations.forEach(animation => {
                        animation.update(delta);
                    });
                }
            }
        });
    }
    
    /**
     * Find a monster by its mesh
     * @param {THREE.Mesh} mesh - Mesh to find monster for
     * @returns {Object} Monster object or null if not found
     */
    findMonsterByMesh(mesh) {
        // Since meshes are unique instances, we can compare them directly
        for (const tier in this.monsterModels) {
            if (mesh.geometry === this.monsterModels[tier].geometry) {
                return {
                    tier: parseInt(tier),
                    mesh: mesh,
                    animations: []
                };
            }
        }
        return null;
    }
    
    /**
     * Calculate damage dealt by attacker to defender
     * @param {Object} attacker - Attacking monster
     * @param {Object} defender - Defending monster
     * @returns {number} Amount of damage dealt
     */
    calculateDamage(attacker, defender) {
        // Basic damage formula: attack - defense/2
        const baseDamage = attacker.attack - (defender.defense / 2);
        
        // Add some randomness (±10%)
        const variance = baseDamage * 0.2;
        const randomFactor = Math.random() * variance - (variance / 2);
        
        // Ensure minimum damage of 1
        return Math.max(1, Math.floor(baseDamage + randomFactor));
    }
    
    /**
     * Apply damage to a monster
     * @param {Object} monster - Monster to damage
     * @param {number} damage - Amount of damage to apply
     * @returns {Object} Updated monster object
     */
    applyDamage(monster, damage) {
        monster.health = Math.max(0, monster.health - damage);
        return monster;
    }
    
    /**
     * Check if a monster is defeated
     * @param {Object} monster - Monster to check
     * @returns {boolean} Whether the monster is defeated
     */
    isDefeated(monster) {
        return monster.health <= 0;
    }
    
    /**
     * Create a merged monster from two monsters of the same tier
     * @param {Object} monster1 - First monster to merge
     * @param {Object} monster2 - Second monster to merge
     * @returns {Object} New merged monster
     */
    mergeMonsters(monster1, monster2) {
        if (monster1.tier !== monster2.tier || monster1.tier >= 5) {
            console.error('Cannot merge monsters of different tiers or max tier monsters');
            return null;
        }
        
        const newTier = monster1.tier + 1;
        const baseStats = this.monsterTiers[newTier];
        
        // Create new monster with improved stats
        return this.createMonster(
            newTier,
            baseStats.health,
            baseStats.health,
            baseStats.attack,
            baseStats.defense
        );
    }
    
    /**
     * Remove a monster from the scene
     * @param {Object} monster - Monster to remove
     */
    removeMonster(monster) {
        if (monster && monster.mesh) {
            this.scene.remove(monster.mesh);
        }
    }
}