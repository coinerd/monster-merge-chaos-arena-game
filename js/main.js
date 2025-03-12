/**
 * Main game class that initializes and coordinates all game components
 */
class Game {
    constructor() {
        // Initialize managers in the correct order
        this.initialize();
        
        // Start the animation loop
        this.animate();
    }
    
    initialize() {
        // Get the game canvas element
        this.container = document.getElementById('game-canvas');
        
        // Create a clock for animation timing
        this.clock = new THREE.Clock();
        
        // Initialize the storage manager first
        this.storageManager = new StorageManager();
        this.gameState = this.storageManager.loadGame();
        
        // Initialize the scene manager
        this.sceneManager = new SceneManager(this.container);
        
        // Initialize the monster manager with the new module
        this.monsterManager = new MonsterManager(this.sceneManager.scene);
        
        // Initialize the grid manager
        this.gridManager = new GridManager(this.sceneManager, this.monsterManager);
        
        // Initialize the combat manager
        this.combatManager = new CombatManager(this.sceneManager.scene, this.monsterManager);
        this.combatManager.setCurrentWave(this.gameState.wave);
        
        // Initialize the UI manager with the scene manager and this game instance
        this.uiManager = new UIManager(this.sceneManager, this);
        
        // Load the game state
        this.loadGameState();
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.gameState.coins);
        this.uiManager.updateWaveDisplay(this.gameState.wave);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Get delta time for animations
        const delta = this.clock.getDelta();
        
        // Update all game components
        this.update(delta);
        
        // Render the scene
        this.sceneManager.renderer.render(this.sceneManager.scene, this.sceneManager.camera);
    }
    
    /**
     * Update all game components
     * @param {number} delta - Time delta for animation
     */
    update(delta) {
        // Update monster animations if the manager exists and has the method
        if (this.monsterManager && typeof this.monsterManager.updateAnimations === 'function') {
            this.monsterManager.updateAnimations(delta);
        }
        
        // Update battle animations if a battle is in progress
        if (this.combatManager && typeof this.combatManager.update === 'function' && 
            this.combatManager.isBattleInProgress && this.combatManager.isBattleInProgress()) {
            this.combatManager.update(delta);
        }
        
        // Update health bars for all monsters on the grid
        if (this.uiManager && this.gridManager) {
            const monsters = this.gridManager.getMonsters();
            if (Array.isArray(monsters)) {
                this.uiManager.updateAllHealthBars(monsters);
            }
        }
    }
    
    /**
     * Load the current game state
     */
    loadGameState() {
        // Load saved game state or use defaults
        if (this.gameState) {
            // Load grid state
            if (this.gameState.grid) {
                this.gridManager.loadGridState(this.gameState.grid);
            }
            
            // Load player stats
            this.coins = this.gameState.coins || 100;
            this.wave = this.gameState.wave || 1;
            this.highestTier = this.gameState.highestTier || 1;
            this.unlockedMonsters = this.gameState.unlockedMonsters || [1, 2, 3];
            
            // Update combat manager with current wave
            this.combatManager.setCurrentWave(this.wave);
        } else {
            // Default values
            this.coins = 100;
            this.wave = 1;
            this.highestTier = 1;
            this.unlockedMonsters = [1, 2, 3];
        }
    }
    
    /**
     * Save the current game state
     */
    saveGameState() {
        this.gameState = {
            grid: this.gridManager.grid,
            coins: this.coins,
            wave: this.wave,
            highestTier: this.highestTier,
            unlockedMonsters: this.unlockedMonsters
        };
        
        this.storageManager.saveGame(this.gameState);
    }
    
    /**
     * Start a battle with the current monsters
     */
    startBattle() {
        if (this.inBattle) {
            this.uiManager.showNotification('Battle already in progress!', 'error');
            return;
        }
        
        // Get all monsters from the grid
        const playerMonsters = this.gridManager.getMonsters();
        
        if (playerMonsters.length === 0) {
            this.uiManager.showNotification('You need at least one monster to battle!', 'error');
            return;
        }
        
        this.inBattle = true;
        
        // Show battle notification
        this.uiManager.showNotification(`Battle against Wave ${this.wave} begins!`, 'info');
        
        // Make sure combat manager has the correct wave
        this.combatManager.setCurrentWave(this.wave);
        
        // Start the battle
        this.combatManager.startBattle(playerMonsters)
            .then(results => {
                this.inBattle = false;
                
                // Add coins based on results
                this.coins += results.rewards.coins;
                this.uiManager.updateMoneyDisplay(this.coins);
                
                // Show notification about coins earned
                this.uiManager.showNotification(`Earned ${results.rewards.coins} coins!`, 'success');
                
                if (results.victory) {
                    // Check if wave was completed
                    if (results.rewards.waveCompleted) {
                        // Advance to next wave
                        this.wave++;
                        this.combatManager.advanceWave();
                        this.uiManager.updateWaveDisplay(this.wave);
                        this.uiManager.showNotification(`Advanced to Wave ${this.wave}!`, 'success');
                    }
                    
                    // Show battle results
                    this.uiManager.showBattleResults(results);
                } else {
                    // Player lost the battle - Game Over
                    this.handleDefeat();
                }
                
                // Save game
                this.saveGameState();
                
                // Remove defeated monsters
                this.removeDefeatedMonsters();
            });
    }
    
    /**
     * Handle player defeat in battle
     */
    handleDefeat() {
        // Show game over screen
        this.uiManager.showGameOver({
            message: "Your monsters were defeated! Game Over!",
            wave: this.wave
        });
        
        // Clear the grid of all monsters
        this.clearAllMonsters();
    }
    
    /**
     * Clear all monsters from the grid
     */
    clearAllMonsters() {
        for (let row = 0; row < this.gridManager.gridSize; row++) {
            for (let col = 0; col < this.gridManager.gridSize; col++) {
                const monster = this.gridManager.grid[row][col];
                if (monster) {
                    // Remove monster from scene
                    this.monsterManager.removeMonsterFromScene(monster);
                    // Remove from grid
                    this.gridManager.removeMonsterFromGrid(row, col);
                    // Remove health bar
                    this.uiManager.removeMonsterHealthBar(monster.id);
                }
            }
        }
    }
    
    /**
     * Called when battle results overlay is closed
     */
    onBattleComplete() {
        this.inBattle = false;
        this.combatManager.clearEnemies();
    }
    
    /**
     * Remove monsters with 0 health from the grid
     */
    removeDefeatedMonsters() {
        for (let row = 0; row < this.gridManager.gridSize; row++) {
            for (let col = 0; col < this.gridManager.gridSize; col++) {
                const monster = this.gridManager.grid[row][col];
                
                if (monster && monster.health <= 0) {
                    this.monsterManager.removeMonsterFromScene(monster);
                    this.gridManager.grid[row][col] = null;
                }
            }
        }
    }
    
    /**
     * Purchase a new monster from the shop
     * @param {number} tier - Tier of monster to purchase
     */
    purchaseMonster(tier) {
        const price = tier * 10;
        
        if (this.coins < price) {
            this.uiManager.showNotification('Not enough coins to purchase this monster!', 'error');
            return;
        }
        
        // Create the new monster
        const monster = this.monsterManager.createMonster(tier);
        
        // Find an empty cell to place the monster
        let placed = false;
        
        for (let row = 0; row < this.gridManager.gridSize; row++) {
            for (let col = 0; col < this.gridManager.gridSize; col++) {
                if (!this.gridManager.grid[row][col]) {
                    this.gridManager.placeMonsterAt(monster, row, col);
                    
                    // Animate the placement
                    this.uiManager.animateMonsterPlacement(monster);
                    
                    placed = true;
                    break;
                }
            }
            
            if (placed) break;
        }
        
        if (!placed) {
            this.uiManager.showNotification('No empty cells available!', 'error');
            return;
        }
        
        // Deduct the price
        this.coins -= price;
        this.uiManager.updateMoneyDisplay(this.coins);
        
        // Update highest tier
        if (tier > this.highestTier) {
            this.highestTier = tier;
        }
        
        // Unlock the purchased tier if not already unlocked
        if (!this.unlockedMonsters.includes(tier)) {
            this.unlockedMonsters.push(tier);
        }
        
        // Save the game
        this.saveGameState();
    }
    
    /**
     * Called when a monster is merged
     * @param {number} newTier - Tier of the resulting monster
     */
    onMonsterMerged(newTier) {
        if (newTier > this.highestTier) {
            this.highestTier = newTier;
            
            // Unlock the next tier if it's not already unlocked
            if (!this.unlockedMonsters.includes(newTier)) {
                this.unlockedMonsters.push(newTier);
                this.saveGameState();
                
                // Reward coins for unlocking a new tier
                const tierUnlockReward = newTier * 20;
                this.coins += tierUnlockReward;
                this.uiManager.updateMoneyDisplay(this.coins);
                
                this.uiManager.showNotification(`Congratulations! You unlocked Tier ${newTier} monsters and earned ${tierUnlockReward} coins!`, 'success');
            }
        }
    }
    
    /**
     * Get the current wave number
     * @returns {number} Current wave number
     */
    getWave() {
        return this.wave;
    }
    
    /**
     * Get the current coin amount
     * @returns {number} Current coins
     */
    getCoins() {
        return this.coins;
    }
    
    /**
     * Get the list of monster tiers that have been unlocked
     * @returns {Array} An array of unlocked tier numbers
     */
    getUnlockedTiers() {
        return this.unlockedMonsters;
    }
    
    /**
     * Get the list of unlocked monster tiers (legacy support)
     * @returns {Array} Array of unlocked tier numbers
     */
    getUnlockedMonsters() {
        return this.unlockedMonsters;
    }
    
    /**
     * Check if a monster tier can be unlocked based on the current highest tier
     * @param {number} tier - Tier to check
     * @returns {boolean} True if the tier can be unlocked
     */
    canUnlockTier(tier) {
        // Tiers 1-3 are always available
        if (tier <= 3) return true;
        
        // Higher tiers are unlocked when the player has reached tier-2
        return tier <= this.highestTier + 2;
    }
    
    /**
     * Reset the game state
     */
    resetGame() {
        // Reset game state
        this.coins = 100;
        this.wave = 1;
        this.highestTier = 1;
        this.unlockedMonsters = [1, 2, 3];
        
        // Clear the grid
        for (let row = 0; row < this.gridManager.gridSize; row++) {
            for (let col = 0; col < this.gridManager.gridSize; col++) {
                const monster = this.gridManager.grid[row][col];
                if (monster) {
                    this.monsterManager.removeMonsterFromScene(monster);
                    this.gridManager.grid[row][col] = null;
                }
            }
        }
        
        // Clear health bars
        this.uiManager.clearAllHealthBars();
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.updateWaveDisplay(this.wave);
        
        // Reset combat manager
        this.combatManager.setCurrentWave(this.wave);
        
        // Clear any existing enemies
        this.combatManager.clearEnemies();
        
        // Reset the wave manager to generate easy wave 1 enemies
        this.combatManager.waveManager.resetWaveProgression();
        
        // Save the reset state
        this.saveGameState();
        
        // Show notification
        this.uiManager.showNotification('Game has been reset!', 'success');
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        this.resetGame();
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});