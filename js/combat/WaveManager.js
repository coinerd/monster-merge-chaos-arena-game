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
     * @param {number} waveNumber - Optional wave number to generate (defaults to currentWave)
     * @returns {Array} Array of generated enemy monsters
     */
    generateEnemyWave(waveNumber) {
        // Use provided wave number or fall back to current wave
        const wave = waveNumber || this.currentWave;
        
        // Update current wave if a wave number was provided
        if (waveNumber) {
            this.currentWave = waveNumber;
        }
        
        this.clearEnemies();
        
        // Determine number of enemies based on wave (starts with 2, increases more aggressively)
        const enemyCount = Math.min(10, 2 + Math.floor(wave * 0.7));
        
        // Determine max enemy tier based on wave (faster tier progression)
        const maxEnemyTier = Math.min(9, 1 + Math.floor(wave * 0.4));
        
        // Minimum tier increases with wave number to ensure stronger enemies
        const minEnemyTier = Math.min(maxEnemyTier, Math.max(1, Math.floor(wave * 0.2)));
        
        console.log(`Generating wave ${wave} with ${enemyCount} enemies (tier range: ${minEnemyTier}-${maxEnemyTier})`);
        
        for (let i = 0; i < enemyCount; i++) {
            // Random tier between min and max for this wave, weighted toward higher tiers as waves progress
            const tierRoll = Math.random();
            let tier;
            
            // As waves progress, shift probability toward higher tiers
            const highTierChance = Math.min(0.7, 0.15 + (wave * 0.05));
            const midTierChance = Math.min(0.8, 0.35 + (wave * 0.03));
            
            if (tierRoll < (1 - midTierChance - highTierChance)) {
                // Low tier chance (decreases as waves progress)
                tier = minEnemyTier;
            } else if (tierRoll < (1 - highTierChance)) {
                // Mid tier chance
                tier = Math.floor(minEnemyTier + ((maxEnemyTier - minEnemyTier) * 0.5));
            } else {
                // High tier chance (increases as waves progress)
                tier = maxEnemyTier;
            }
            
            // Create the enemy monster
            const enemy = this.monsterManager.createMonster(tier);
            
            // Set properties
            enemy.isPlayer = false;
            enemy.id = `enemy-${Date.now()}-${i}`;
            enemy.maxHealth = this.calculateEnemyHealth(tier, wave);
            enemy.health = enemy.maxHealth;
            enemy.attack = this.calculateEnemyAttack(tier, wave);
            enemy.defense = this.calculateEnemyDefense(tier, wave);
            enemy.tier = tier;
            
            // Apply visual enhancements based on wave number
            this.enhanceEnemyAppearance(enemy, wave);
            
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
     * Enhance enemy appearance based on wave number
     * @param {Object} enemy - The enemy monster to enhance
     * @param {number} waveNumber - Current wave number
     */
    enhanceEnemyAppearance(enemy, waveNumber) {
        if (!enemy || !enemy.mesh) return;
        
        // Base scale modifier increases with wave number (up to 50% larger)
        const scaleModifier = 1 + Math.min(0.5, (waveNumber - 1) * 0.05);
        
        // Apply scale to make monsters physically larger in later waves
        enemy.mesh.scale.multiplyScalar(scaleModifier);
        
        // Apply visual effects to all meshes in the monster
        enemy.mesh.traverse(child => {
            if (child.isMesh && child.material) {
                // Clone the material to avoid affecting other monsters
                if (!child.material._isCloned) {
                    child.material = child.material.clone();
                    child.material._isCloned = true;
                }
                
                // Modify color based on wave number to make monsters look more menacing
                if (waveNumber > 1) {
                    // Shift color toward red for higher waves (more menacing)
                    const redShift = Math.min(0.3, (waveNumber - 1) * 0.03);
                    child.material.color.r = Math.min(1, child.material.color.r + redShift);
                    child.material.color.g = Math.max(0, child.material.color.g - redShift * 0.5);
                    child.material.color.b = Math.max(0, child.material.color.b - redShift * 0.5);
                    
                    // Increase emissive intensity for higher waves (glowing effect)
                    if (!child.material.emissive) {
                        child.material.emissive = new THREE.Color(0x330000);
                    } else {
                        child.material.emissive.r = Math.min(0.3, (waveNumber - 1) * 0.03);
                    }
                    
                    // Increase metalness for higher waves (more armored look)
                    if (child.material.metalness !== undefined) {
                        child.material.metalness = Math.min(0.8, child.material.metalness + (waveNumber - 1) * 0.05);
                    }
                    
                    // Add roughness variation
                    if (child.material.roughness !== undefined) {
                        child.material.roughness = Math.max(0.2, child.material.roughness - (waveNumber - 1) * 0.03);
                    }
                }
            }
        });
        
        // Add special effects for higher waves
        if (waveNumber >= 5) {
            // Create a glow effect for high wave enemies
            this.addGlowEffect(enemy, waveNumber);
        }
    }
    
    /**
     * Add a glow effect to high-wave enemies
     * @param {Object} enemy - The enemy monster
     * @param {number} waveNumber - Current wave number
     */
    addGlowEffect(enemy, waveNumber) {
        // Create a point light to make the monster glow
        const intensity = Math.min(0.6, 0.2 + (waveNumber - 5) * 0.05);
        const glowLight = new THREE.PointLight(0xff2200, intensity, 2);
        
        // Position the light at the center of the monster
        glowLight.position.set(0, 0.5, 0);
        
        // Add the light to the monster mesh
        enemy.mesh.add(glowLight);
        
        // Store reference to the light for cleanup
        enemy.glowLight = glowLight;
    }
    
    /**
     * Calculate enemy health based on tier and wave number
     * @param {number} tier - Enemy tier
     * @param {number} waveNumber - Current wave number
     * @returns {number} Calculated health value
     */
    calculateEnemyHealth(tier, waveNumber) {
        const baseHealth = tier * 50;
        // More aggressive health scaling with wave number
        const waveScaling = 1 + (waveNumber - 1) * 0.25;
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
        // More aggressive attack scaling with wave number
        const waveScaling = 1 + (waveNumber - 1) * 0.25;
        return Math.floor(baseAttack * waveScaling);
    }
    
    /**
     * Calculate enemy defense based on tier and wave number
     * @param {number} tier - Enemy tier
     * @param {number} waveNumber - Current wave number
     * @returns {number} Calculated defense value
     */
    calculateEnemyDefense(tier, waveNumber) {
        const baseDefense = Math.floor(tier * 2);
        // More aggressive defense scaling with wave number
        const waveScaling = 1 + (waveNumber - 1) * 0.2;
        return Math.floor(baseDefense * waveScaling);
    }
    
    /**
     * Remove all enemies from the scene
     */
    clearEnemies() {
        this.enemyMonsters.forEach(enemy => {
            if (enemy.mesh && this.scene.children.includes(enemy.mesh)) {
                // Clean up any added effects
                if (enemy.glowLight) {
                    enemy.mesh.remove(enemy.glowLight);
                    enemy.glowLight = null;
                }
                
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
        const enemyCount = Math.min(10, 2 + Math.floor(this.currentWave * 0.7));
        const maxEnemyTier = Math.min(9, 1 + Math.floor(this.currentWave * 0.4));
        const minEnemyTier = Math.min(maxEnemyTier, Math.max(1, Math.floor(this.currentWave * 0.2)));
        
        const enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            const tierRoll = Math.random();
            let tier;
            
            // As waves progress, shift probability toward higher tiers
            const highTierChance = Math.min(0.7, 0.15 + (this.currentWave * 0.05));
            const midTierChance = Math.min(0.8, 0.35 + (this.currentWave * 0.03));
            
            if (tierRoll < (1 - midTierChance - highTierChance)) {
                // Low tier chance (decreases as waves progress)
                tier = minEnemyTier;
            } else if (tierRoll < (1 - highTierChance)) {
                // Mid tier chance
                tier = Math.floor(minEnemyTier + ((maxEnemyTier - minEnemyTier) * 0.5));
            } else {
                // High tier chance (increases as waves progress)
                tier = maxEnemyTier;
            }
            
            const enemy = tempManager.createMonster(tier);
            
            // Apply wave scaling to stats
            enemy.attack = this.calculateEnemyAttack(tier, this.currentWave);
            enemy.defense = this.calculateEnemyDefense(tier, this.currentWave);
            enemy.health = this.calculateEnemyHealth(tier, this.currentWave);
            enemy.maxHealth = enemy.health;
            
            enemies.push({
                tier: enemy.tier,
                attack: enemy.attack,
                defense: enemy.defense,
                health: enemy.health,
                maxHealth: enemy.maxHealth,
                // Add visual indicator for preview
                enhanced: this.currentWave > 1
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
    
    /**
     * Get the current wave number
     * @returns {number} Current wave number
     */
    getCurrentWave() {
        return this.currentWave;
    }
    
    /**
     * Set the current wave number
     * @param {number} wave - Wave number to set
     */
    setCurrentWave(wave) {
        this.currentWave = Math.max(1, wave);
    }
    
    /**
     * Get the current enemy monsters
     * @returns {Array} Array of enemy monsters
     */
    getEnemyMonsters() {
        return this.enemyMonsters;
    }
}