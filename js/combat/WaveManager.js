/**
 * WaveManager handles generation and management of enemy waves
 */
class WaveManager {
    constructor(scene, monsterManager) {
        this.scene = scene;
        this.monsterManager = monsterManager;
        this.currentWave = 1;
        this.enemyMonsters = [];
        
        // Area where enemies spawn (right side of grid)
        this.enemySpawnArea = {
            x: 4,
            z: 0,
            width: 4,
            depth: 5
        };
    }
    
    /**
     * Generate enemies for the current wave
     */
    generateEnemyWave() {
        this.clearEnemies();
        
        // Determine number of enemies based on wave (2-7 enemies)
        const enemyCount = Math.min(7, 2 + Math.floor(this.currentWave / 2));
        
        // Determine max enemy tier based on wave
        const maxEnemyTier = Math.min(9, 1 + Math.floor(this.currentWave / 2));
        
        console.log(`Generating wave ${this.currentWave} with ${enemyCount} enemies (max tier: ${maxEnemyTier})`);
        
        for (let i = 0; i < enemyCount; i++) {
            // Random tier up to the max for this wave, weighted toward lower tiers
            const tierRoll = Math.random();
            let tier;
            
            if (tierRoll < 0.5) {
                // 50% chance for lowest possible tier for this wave
                tier = Math.max(1, maxEnemyTier - 2);
            } else if (tierRoll < 0.85) {
                // 35% chance for second highest tier
                tier = Math.max(1, maxEnemyTier - 1);
            } else {
                // 15% chance for highest tier
                tier = maxEnemyTier;
            }
            
            // Create the enemy monster
            const enemy = this.monsterManager.createMonster(tier);
            
            // Set properties
            enemy.isPlayer = false;
            enemy.id = `enemy-${Date.now()}-${i}`;
            enemy.maxHealth = this.calculateEnemyHealth(tier, this.currentWave);
            enemy.health = enemy.maxHealth;
            enemy.attack = this.calculateEnemyAttack(tier, this.currentWave);
            enemy.defense = Math.floor(tier * 2 * (1 + (this.currentWave * 0.1)));
            enemy.tier = tier;
            
            // Apply wave scaling - enemies get stronger as waves progress
            const waveScaling = 1 + (this.currentWave - 1) * 0.15;
            enemy.attack = Math.floor(enemy.attack * waveScaling);
            enemy.defense = Math.floor(enemy.defense * waveScaling);
            
            // Store reference for battle animations
            enemy.originalMesh = enemy.mesh;
            
            // Make sure enemy mesh is visible
            enemy.mesh.visible = true;
            enemy.mesh.traverse(child => {
                if (child.isMesh) {
                    child.visible = true;
                }
            });
            
            // Position the enemy in the enemy area
            const x = this.enemySpawnArea.x + Math.random() * this.enemySpawnArea.width;
            const z = this.enemySpawnArea.z + Math.random() * this.enemySpawnArea.depth;
            enemy.mesh.position.set(x, 0.5, z);
            
            // Add to scene if not already added
            if (!this.scene.children.includes(enemy.mesh)) {
                this.scene.add(enemy.mesh);
            }
            
            this.enemyMonsters.push(enemy);
        }
        
        // Log the enemies for debugging
        console.log("Generated enemy monsters:", this.enemyMonsters.map(e => ({
            id: e.id,
            tier: e.tier,
            health: e.health,
            attack: e.attack,
            defense: e.defense,
            position: e.mesh ? e.mesh.position.clone() : 'unknown',
            visible: e.mesh ? e.mesh.visible : 'unknown'
        })));
        
        return this.enemyMonsters;
    }
    
    /**
     * Calculate enemy health based on tier and wave number
     * @param {number} tier - Enemy tier
     * @param {number} waveNumber - Current wave number
     * @returns {number} Calculated health value
     */
    calculateEnemyHealth(tier, waveNumber) {
        const baseHealth = tier * 50;
        const waveScaling = 1 + (waveNumber - 1) * 0.15;
        return Math.floor(baseHealth * waveScaling);
    }
    
    /**
     * Calculate enemy attack based on tier and wave number
     * @param {number} tier - Enemy tier
     * @param {number} waveNumber - Current wave number
     * @returns {number} Calculated attack value
     */
    calculateEnemyAttack(tier, waveNumber) {
        const baseAttack = tier * 10;
        const waveScaling = 1 + (waveNumber - 1) * 0.15;
        return Math.floor(baseAttack * waveScaling);
    }
    
    /**
     * Remove all enemies from the scene
     */
    clearEnemies() {
        this.enemyMonsters.forEach(enemy => {
            if (enemy.mesh && this.scene.children.includes(enemy.mesh)) {
                this.scene.remove(enemy.mesh);
            }
        });
        this.enemyMonsters = [];
    }
    
    /**
     * Preview the upcoming enemy wave
     * @returns {Array} Array of simplified enemy data for display
     */
    previewNextWave() {
        // Generate a temporary wave without adding to the scene
        const tempManager = new MonsterManager(new THREE.Scene());
        const enemyCount = Math.min(7, 2 + Math.floor(this.currentWave / 2));
        const maxEnemyTier = Math.min(9, 1 + Math.floor(this.currentWave / 2));
        
        const enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            const tierRoll = Math.random();
            let tier;
            
            if (tierRoll < 0.5) {
                tier = Math.max(1, maxEnemyTier - 2);
            } else if (tierRoll < 0.85) {
                tier = Math.max(1, maxEnemyTier - 1);
            } else {
                tier = maxEnemyTier;
            }
            
            const enemy = tempManager.createMonster(tier);
            const waveScaling = 1 + (this.currentWave - 1) * 0.15;
            
            enemy.attack = Math.floor(enemy.attack * waveScaling);
            enemy.defense = Math.floor(enemy.defense * waveScaling);
            enemy.health = Math.floor(enemy.maxHealth * waveScaling);
            enemy.maxHealth = enemy.health;
            
            enemies.push({
                tier: enemy.tier,
                attack: enemy.attack,
                defense: enemy.defense,
                health: enemy.health,
                maxHealth: enemy.maxHealth
            });
        }
        
        return enemies;
    }
    
    /**
     * Advance to the next wave
     */
    advanceWave() {
        this.currentWave++;
    }
    
    /**
     * Reset wave progression to wave 1
     * This ensures enemies are reset to easy difficulty
     */
    resetWaveProgression() {
        this.currentWave = 1;
        this.clearEnemies();
    }
}