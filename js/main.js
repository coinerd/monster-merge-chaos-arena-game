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
        this.combatManager.setWave(this.gameState.wave);
        
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
            this.unlockedMonsters = this.gameState.unlockedMonsters || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
            
            // Update combat manager with current wave
            this.combatManager.setWave(this.wave);
        } else {
            // Default values
            this.coins = 100;
            this.wave = 1;
            this.highestTier = 1;
            this.unlockedMonsters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
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
        this.combatManager.setWave(this.wave);
        
        // Generate new enemies for this wave - explicitly pass the current wave number
        this.combatManager.generateEnemyWave(this.wave);
        
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
                        this.combatManager.setWave(this.wave);
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
        this.gridManager.clearGrid();
        
        // Reset game state
        this.coins = 100;
        this.wave = 1;
        this.highestTier = 1;
        this.unlockedMonsters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.updateWaveDisplay(this.wave);
        
        // Save the reset state
        this.saveGameState();
    }
    
    /**
     * Remove defeated monsters from the grid
     */
    removeDefeatedMonsters() {
        const monsters = this.gridManager.getMonsters();
        
        for (const monster of monsters) {
            if (monster.health <= 0) {
                const pos = this.gridManager.getMonsterGridPosition(monster);
                if (pos.row !== null && pos.col !== null) {
                    this.gridManager.removeMonsterFromGrid(pos.row, pos.col);
                    this.uiManager.removeMonsterHealthBar(monster.id);
                }
            }
        }
    }
    
    /**
     * Buy a new monster from the shop
     * @param {number} tier - Tier of the monster to buy
     * @returns {boolean} Whether the purchase was successful
     */
    buyMonster(tier) {
        // Check if monster tier is unlocked
        if (!this.unlockedMonsters.includes(tier)) {
            this.uiManager.showNotification('This monster tier is not unlocked yet!', 'error');
            return false;
        }
        
        // Calculate cost based on tier
        const cost = tier * 10;
        
        // Check if player has enough money
        if (this.coins < cost) {
            this.uiManager.showNotification('Not enough coins!', 'error');
            return false;
        }
        
        // Find an empty cell
        const emptyCell = this.gridManager.findEmptyCell();
        if (!emptyCell) {
            this.uiManager.showNotification('No empty cells available!', 'error');
            return false;
        }
        
        // Create the monster and place it in the grid
        const monster = this.monsterManager.createMonster(tier);
        this.gridManager.placeMonsterInGrid(monster, emptyCell.row, emptyCell.col);
        
        // Deduct cost
        this.coins -= cost;
        this.uiManager.updateMoneyDisplay(this.coins);
        
        // Save game state
        this.saveGameState();
        
        return true;
    }
    
    /**
     * Alias for buyMonster to maintain compatibility with OverlayManager
     * @param {number} tier - Tier of the monster to buy
     * @returns {boolean} Whether the purchase was successful
     */
    purchaseMonster(tier) {
        return this.buyMonster(tier);
    }
    
    /**
     * Handle monster merge event
     * @param {number} newTier - The tier of the newly created monster
     */
    onMonsterMerged(newTier) {
        // Update highest tier if needed
        if (newTier > this.highestTier) {
            this.highestTier = newTier;
            
            // Unlock the next tier if it's not already unlocked
            if (!this.unlockedMonsters.includes(newTier + 1)) {
                this.unlockedMonsters.push(newTier + 1);
                this.uiManager.showNotification(`Unlocked Tier ${newTier + 1} monster!`, 'success');
            }
        }
        
        // Award coins for merging
        const mergeBonus = newTier * 5;
        this.coins += mergeBonus;
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.showNotification(`Merged to Tier ${newTier}! +${mergeBonus} coins`, 'success');
        
        // Save game state
        this.saveGameState();
    }
    
    /**
     * Get the current coins
     * @returns {number} Current coin amount
     */
    getCoins() {
        return this.coins;
    }
    
    /**
     * Get the current wave number
     * @returns {number} Current wave number
     */
    getWave() {
        return this.wave;
    }
    
    /**
     * Get unlocked monster tiers
     * @returns {Array} Array of unlocked monster tiers
     */
    getUnlockedTiers() {
        return this.unlockedMonsters || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    
    /**
     * Restart the game
     */
    restartGame() {
        // Clear the grid
        this.gridManager.clearGrid();
        
        // Reset game state
        this.coins = 100;
        this.wave = 1;
        this.highestTier = 1;
        this.unlockedMonsters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.updateWaveDisplay(this.wave);
        
        // Save the reset state
        this.saveGameState();
        
        // Show notification
        this.uiManager.showNotification('Game restarted!', 'info');
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});