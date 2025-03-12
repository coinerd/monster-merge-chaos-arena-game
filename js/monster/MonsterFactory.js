/**
 * MonsterFactory.js - Factory for creating monsters based on their type
 * 
 * This centralizes monster creation and provides a clean API for creating,
 * modifying, and querying monsters for the game.
 */
class MonsterFactory {
    constructor(scene) {
        this.scene = scene;
        this.nextMonsterId = 1;
        
        // Initialize the geometry factory
        this.geometryFactory = new MonsterGeometryFactory();
        
        // Cache for fast access
        this.monsterTypes = monsterTypes.types;
        
        // Prepare geometry cache
        this.initializeGeometryCache();
    }
    
    /**
     * Initialize the geometry cache for all monster types
     */
    initializeGeometryCache() {
        // Pre-create geometries for all tiers
        for (let tier = 1; tier <= 9; tier++) {
            this.geometryFactory.createGeometry(tier);
        }
    }
    
    /**
     * Create a new monster with the given tier
     * @param {number} tier - The monster's tier (1-9)
     * @param {Object} options - Additional options for monster creation
     * @returns {Object} The created monster object
     */
    createMonster(tier, options = {}) {
        // Clamp tier between 1 and 9
        tier = Math.max(1, Math.min(9, tier));
        
        // Get the monster type data
        const typeData = this.monsterTypes[tier];
        
        // Create the monster's mesh by cloning from the factory
        const monsterMesh = this.geometryFactory.createGeometry(tier);
        
        // Apply scale from type data
        monsterMesh.scale.set(typeData.scale, typeData.scale, typeData.scale);
        monsterMesh.castShadow = true;
        monsterMesh.receiveShadow = true;
        
        // Use provided values or defaults from the type data
        const monsterId = options.id || this.nextMonsterId++;
        const attack = options.attack || typeData.baseAttack;
        const defense = options.defense || typeData.baseDefense;
        const health = options.health || typeData.baseHealth;
        const maxHealth = options.maxHealth || typeData.baseHealth;
        
        // Create and store monster data
        const monster = {
            id: monsterId,
            tier: tier,
            type: typeData.name,
            attack: attack,
            defense: defense,
            health: health,
            maxHealth: maxHealth,
            mesh: monsterMesh,
            special: { ...typeData.special } // Copy any special properties
        };
        
        // Set userData for raycasting and drag-drop
        monsterMesh.userData.isMonster = true;
        monsterMesh.userData.monsterObj = monster;
        
        // Make sure ALL child meshes have the isMonster flag
        monsterMesh.traverse(child => {
            if (child.isMesh) {
                child.userData.isMonster = true;
                child.userData.monsterObj = monster;
            }
        });
        
        return monster;
    }
    
    /**
     * Calculate damage from attacker to defender
     * @param {Object} attacker - The attacking monster
     * @param {Object} defender - The defending monster
     * @returns {number} The calculated damage
     */
    calculateDamage(attacker, defender) {
        // Base damage is attacker's attack value
        let damage = attacker.attack;
        
        // Reduce damage based on defender's defense (with diminishing returns formula)
        const damageReduction = defender.defense / (defender.defense + 50);
        damage = Math.max(1, Math.floor(damage * (1 - damageReduction)));
        
        // Add a small random factor (±10%)
        const randomFactor = 0.9 + Math.random() * 0.2;
        damage = Math.max(1, Math.floor(damage * randomFactor));
        
        // Apply any special effects based on monster types
        damage = this.applySpecialEffectsToAttack(attacker, defender, damage);
        
        return damage;
    }
    
    /**
     * Apply any special effects to attack damage calculation
     * @param {Object} attacker - The attacking monster
     * @param {Object} defender - The defending monster
     * @param {number} baseDamage - The initial calculated damage
     * @returns {number} The modified damage
     */
    applySpecialEffectsToAttack(attacker, defender, baseDamage) {
        let damage = baseDamage;
        
        // Example special effects based on monster types
        // These can be expanded based on game mechanics
        
        // Dragons deal more damage to all targets
        if (attacker.special && attacker.special.breathWeapon === "fire") {
            damage = Math.floor(damage * 1.2); // 20% more damage
        }
        
        // Golems take reduced damage from all sources
        if (defender.special && defender.special.heavyArmor) {
            damage = Math.floor(damage * 0.8); // 20% less damage
        }
        
        return damage;
    }
    
    /**
     * Apply damage to a monster
     * @param {Object} monster - The monster to damage
     * @param {number} damage - Amount of damage to apply
     * @returns {boolean} True if the monster died
     */
    applyDamage(monster, damage) {
        monster.health = Math.max(0, monster.health - damage);
        return monster.health <= 0;
    }
    
    /**
     * Heal a monster by a percentage of its max health
     * @param {Object} monster - The monster to heal
     * @param {number} percentage - Percentage of max health to heal (0-1)
     */
    healMonster(monster, percentage) {
        const healAmount = Math.floor(monster.maxHealth * percentage);
        monster.health = Math.min(monster.maxHealth, monster.health + healAmount);
    }
    
    /**
     * Merge two monsters to create a higher tier monster
     * @param {Object} monster1 - First monster to merge
     * @param {Object} monster2 - Second monster to merge
     * @returns {Object} The new, merged monster or null if merge not possible
     */
    mergeMonsters(monster1, monster2) {
        // Can only merge monsters of the same tier
        if (monster1.tier !== monster2.tier) {
            return null;
        }
        
        // Can't merge max tier monsters
        if (monster1.tier >= 9) {
            return null;
        }
        
        // Create a new monster of the next tier
        const newTier = monster1.tier + 1;
        
        // Calculate bonus stats based on the parents
        const attackBonus = Math.floor((monster1.attack + monster2.attack) * 0.1);
        const defenseBonus = Math.floor((monster1.defense + monster2.defense) * 0.1);
        const healthBonus = Math.floor((monster1.maxHealth + monster2.maxHealth) * 0.1);
        
        // Get base stats for the new tier
        const typeData = this.monsterTypes[newTier];
        
        // Create the merged monster with boosted stats
        return this.createMonster(newTier, {
            attack: typeData.baseAttack + attackBonus,
            defense: typeData.baseDefense + defenseBonus,
            health: typeData.baseHealth + healthBonus,
            maxHealth: typeData.baseHealth + healthBonus
        });
    }
    
    /**
     * Get a list of all available monster tiers
     * @returns {Array} Array of tier numbers
     */
    getAvailableTiers() {
        return Object.keys(this.monsterTypes).map(tier => parseInt(tier));
    }
}