/**
 * MonsterManager.js - Main manager class for all monster interactions
 * 
 * This class serves as the primary interface for monster creation and management,
 * using the MonsterFactory for actual monster instantiation and other utility classes
 * for specialized functionality.
 */
class MonsterManager {
    constructor(scene, textureManager, monsterTypes) {
        this.scene = scene;
        
        // Store the texture manager
        this.textureManager = textureManager || new TextureManager();
        
        // Store the monster types
        this.monsterTypes = monsterTypes;
        
        // Initialize the monster factory with the texture manager
        this.monsterFactory = new MonsterFactory(scene, this.textureManager);
        
        // Keep a reference to available monster types for easy access
        this.monsterTypes = this.monsterTypes.types;
    }
    
    /**
     * Create a new monster
     * @param {number} tier - The monster's tier (1-9)
     * @param {Object} options - Optional parameters for the monster
     * @returns {Object} The created monster object
     */
    createMonster(tier, options = {}) {
        // Create options object for the factory
        const monsterOptions = {};
        
        // Only add properties that are actually provided
        if (options.health !== undefined) monsterOptions.health = options.health;
        if (options.maxHealth !== undefined) monsterOptions.maxHealth = options.maxHealth;
        if (options.attack !== undefined) monsterOptions.attack = options.attack;
        if (options.defense !== undefined) monsterOptions.defense = options.defense;
        
        // Create the monster using the factory
        const monster = this.monsterFactory.createMonster(tier, monsterOptions);
        
        // Force an immediate texture update to ensure textures are applied
        const typeData = this.monsterTypes[tier];
        if (typeData) {
            this.monsterFactory.updateMonsterTextures(monster, typeData);
        }
        
        return monster;
    }
    
    /**
     * Add a monster to the scene at the specified position
     * @param {number} tier - The monster's tier (1-9)
     * @param {Object} position - Position {x, y, z} to place the monster
     * @param {Object} options - Optional parameters for the monster
     * @returns {Object} The created monster object
     */
    addMonsterToScene(tier, position, options = {}) {
        const monster = this.createMonster(tier, options);
        
        // Set the monster position
        if (position) {
            monster.mesh.position.set(position.x, position.y, position.z);
        }
        
        // Add to the scene
        this.scene.add(monster.mesh);
        
        return monster;
    }
    
    /**
     * Remove a monster from the scene
     * @param {Object} monster - The monster to remove
     */
    removeMonsterFromScene(monster) {
        if (monster && monster.mesh) {
            this.scene.remove(monster.mesh);
        }
    }
    
    /**
     * Calculate damage for an attack between two monsters
     * @param {Object} attacker - The attacking monster
     * @param {Object} defender - The defending monster
     * @returns {number} The calculated damage
     */
    calculateDamage(attacker, defender) {
        return this.monsterFactory.calculateDamage(attacker, defender);
    }
    
    /**
     * Apply damage to a monster
     * @param {Object} monster - The monster to damage
     * @param {number} damage - Amount of damage to apply
     * @returns {boolean} True if the monster died
     */
    applyDamage(monster, damage) {
        return this.monsterFactory.applyDamage(monster, damage);
    }
    
    /**
     * Heal a monster by a percentage of its max health
     * @param {Object} monster - The monster to heal
     * @param {number} percentage - Percentage of max health to heal (0-1)
     */
    healMonster(monster, percentage) {
        this.monsterFactory.healMonster(monster, percentage);
    }
    
    /**
     * Merge two monsters to create a higher tier monster
     * @param {Object} monster1 - First monster to merge
     * @param {Object} monster2 - Second monster to merge
     * @returns {Object} The new, merged monster or null if merge not possible
     */
    mergeMonsters(monster1, monster2) {
        return this.monsterFactory.mergeMonsters(monster1, monster2);
    }
    
    /**
     * Get an array of all available monster tiers
     * @returns {Array} Array of tier numbers
     */
    getAvailableTiers() {
        return this.monsterFactory.getAvailableTiers();
    }
    
    /**
     * Get monster type data for a specific tier
     * @param {number} tier - The tier to get data for
     * @returns {Object} Type data for the tier
     */
    getMonsterTypeData(tier) {
        return this.monsterFactory.getMonsterTypeData(tier);
    }
    
    /**
     * Create a clone of an existing monster
     * @param {Object} monster - The monster to clone
     * @returns {Object} A new monster with the same properties
     */
    cloneMonster(monster) {
        if (!monster) return null;
        
        return this.monsterFactory.createMonster(monster.tier, {
            attack: monster.attack,
            defense: monster.defense,
            health: monster.health,
            maxHealth: monster.maxHealth
        });
    }
    
    /**
     * Update the monster's appearance based on health percentage
     * @param {Object} monster - The monster to update
     */
    updateMonsterAppearance(monster) {
        if (!monster || !monster.mesh) return;
        
        // Calculate health percentage
        const healthPercent = monster.health / monster.maxHealth;
        
        // Get monster type data
        const typeData = this.monsterTypes[monster.tier];
        if (!typeData) return;
        
        // Apply visual effects based on health
        monster.mesh.traverse(child => {
            if (child.isMesh && child.material) {
                // Clone material if not already cloned to avoid affecting other instances
                if (!child.material._isCloned) {
                    child.material = child.material.clone();
                    child.material._isCloned = true;
                }
                
                // Determine texture type based on monster special properties
                let textureType = 'default';
                if (typeData.special) {
                    if (typeData.special.blobby) textureType = 'slime';
                    if (typeData.special.rocky) textureType = 'rocky';
                    if (typeData.special.ghostly) textureType = 'ghostly';
                    if (typeData.special.wings || typeData.special.tail) textureType = 'scaly';
                }
                
                // Adjust color based on health
                let color = typeData.color;
                if (child.material.name && child.material.name.includes('secondary')) {
                    color = typeData.secondaryColor;
                }
                
                // Convert to hex string
                const colorHex = '#' + color.toString(16).padStart(6, '0');
                
                // Generate new texture based on health
                if (healthPercent < 0.5) {
                    // Generate damaged texture
                    const texture = this.textureManager.generateMonsterTexture(
                        512,
                        colorHex,
                        {
                            tier: monster.tier,
                            textureType: textureType,
                            damaged: true,
                            damageLevel: 1 - healthPercent, // Higher value = more damage
                            roughness: 0.7, // Damaged monsters look rougher
                            metalness: 0.1
                        }
                    );
                    
                    texture.needsUpdate = true;
                    child.material.map = texture;
                    
                    // Darken the monster as health decreases
                    const darkenFactor = 0.5 + (healthPercent * 0.5);
                    child.material.color.multiplyScalar(darkenFactor);
                }
                
                // Update material properties
                child.material.needsUpdate = true;
            }
        });
    }
    
    /**
     * Update animations for all monsters
     * @param {number} delta - Time delta for animation
     */
    updateAnimations(delta) {
        // This is a placeholder for animation updates
        // In a full implementation, this would update any animated monsters
        // For now, we'll just provide the method to avoid errors
    }
}