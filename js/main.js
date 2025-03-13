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
        
        // Initialize the texture manager for all game textures
        this.textureManager = new TextureManager();
        
        // Initialize the scene manager
        this.sceneManager = new SceneManager(this.container);
        
        // Initialize the monster manager with the new module and texture manager
        this.monsterManager = new MonsterManager(this.sceneManager.scene, this.textureManager, monsterTypes);
        
        // Initialize the grid manager
        this.gridManager = new GridManager(this.sceneManager, this.monsterManager);
        
        // Initialize the combat manager
        this.combatManager = new CombatManager(this.sceneManager.scene, this.monsterManager);
        this.combatManager.setWave(this.gameState.wave);
        
        // Initialize the merge manager
        this.mergeManager = new MergeManager(this.sceneManager.scene, this.monsterManager, this.gridManager, this);
        
        // Initialize the UI manager with the scene manager, this game instance, and the texture manager
        this.uiManager = new UIManager(this.sceneManager, this, this.textureManager);
        
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
            this.unlockedMonsters = this.gameState.unlockedMonsters || [1];
            this.shopItems = this.gameState.shopItems || [];
            
            // Update combat manager with current wave
            this.combatManager.setWave(this.wave);
        } else {
            // Default values
            this.coins = 100;
            this.wave = 1;
            this.highestTier = 1;
            this.unlockedMonsters = [1];
            this.shopItems = this.storageManager.generateShopItems(this.unlockedMonsters);
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
            unlockedMonsters: this.unlockedMonsters,
            shopItems: this.shopItems
        };
        
        this.storageManager.saveGame(this.gameState);
    }
    
    /**
     * Refresh the shop with new items
     */
    refreshShopItems() {
        // Create a shop item for each unlocked tier
        this.shopItems = this.storageManager.generateShopItems(this.unlockedMonsters);
        
        // Save the updated shop items
        this.saveGameState();
        
        return this.shopItems;
    }
    
    /**
     * Get the current shop items
     * @returns {Array} Array of shop items
     */
    getShopItems() {
        // If no shop items exist, generate new ones
        if (!this.shopItems || this.shopItems.length === 0) {
            return this.refreshShopItems();
        }
        
        return this.shopItems;
    }
    
    /**
     * Buy a monster from the shop
     * @param {number} tier - Tier of the monster to buy
     * @returns {boolean} Whether the purchase was successful
     */
    buyMonster(tier) {
        // Check if the tier is valid
        if (!tier || tier < 1 || tier > 10) {
            this.uiManager.showNotification('Invalid monster tier!', 'error');
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
        this.gridManager.placeMonsterAt(monster, emptyCell.row, emptyCell.col);
        
        // Deduct cost
        this.coins -= cost;
        this.uiManager.updateMoneyDisplay(this.coins);
        
        // Update highest tier if needed
        if (tier > this.highestTier) {
            this.highestTier = tier;
        }
        
        // Ensure this tier is unlocked
        if (!this.unlockedMonsters.includes(tier)) {
            this.unlockedMonsters.push(tier);
        }
        
        // Save game state
        this.saveGameState();
        
        return true;
    }
    
    /**
     * Buy a monster from the shop
     * @param {number} shopItemIndex - Index of the shop item to buy
     * @returns {boolean} Whether the purchase was successful
     */
    buyShopItem(shopItemIndex) {
        // Check if the shop item exists
        if (!this.shopItems || shopItemIndex >= this.shopItems.length) {
            this.uiManager.showNotification('Invalid shop item!', 'error');
            return false;
        }
        
        const shopItem = this.shopItems[shopItemIndex];
        const tier = shopItem.tier;
        const cost = shopItem.cost;
        
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
        this.gridManager.placeMonsterAt(monster, emptyCell.row, emptyCell.col);
        
        // Deduct cost
        this.coins -= cost;
        this.uiManager.updateMoneyDisplay(this.coins);
        
        // Remove the item from the shop
        this.shopItems.splice(shopItemIndex, 1);
        
        // If shop is empty, refresh it
        if (this.shopItems.length === 0) {
            this.refreshShopItems();
        }
        
        // Save game state
        this.saveGameState();
        
        return true;
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
        this.unlockedMonsters = [1];
        this.shopItems = this.storageManager.generateShopItems(this.unlockedMonsters);
        
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
        // Give coins based on the tier
        const coinsEarned = newTier * 5;
        this.coins += coinsEarned;
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.showNotification(`Merged to Tier ${newTier}! +${coinsEarned} coins`, 'success');
        
        // Update highest tier if needed
        if (newTier > this.highestTier) {
            this.highestTier = newTier;
            
            // Unlock the new tier in the game
            if (!this.unlockedMonsters.includes(newTier)) {
                this.unlockedMonsters.push(newTier);
                
                // Update shop items to include the new tier
                this.shopItems = this.storageManager.generateShopItems(this.unlockedMonsters);
                
                // Refresh shop if it's open
                const shopOverlay = document.getElementById('shop-overlay');
                if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
                    this.uiManager.openShop();
                }
            }
        }
        
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
        return this.unlockedMonsters || [1];
    }
    
    /**
     * Get current shop items
     * @returns {Array} Shop items
     */
    getShopItems() {
        return this.shopItems;
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
        this.unlockedMonsters = [1, 2, 3, 4, 5]; // Start with tiers 1-5 unlocked for testing
        
        // Generate new shop items
        this.shopItems = this.storageManager.generateShopItems(this.unlockedMonsters);
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.updateWaveDisplay(this.wave);
        
        // Save the reset state
        this.saveGameState();
        
        // Force refresh of the shop if it's currently open
        if (this.uiManager && this.uiManager.overlayManager) {
            const shopOverlay = document.getElementById('shop-overlay');
            if (shopOverlay && !shopOverlay.classList.contains('hidden')) {
                this.uiManager.overlayManager.closeShop();
                this.uiManager.openShop();
            }
        }
        
        // Show notification
        this.uiManager.showNotification('Game restarted!', 'info');
    }
    
    /**
     * Upgrade to the next wave and give rewards
     */
    upgradeWave() {
        this.wave++;
        
        // Give coins based on the wave
        const coinsEarned = this.wave * 10;
        this.coins += coinsEarned;
        
        // Update unlocked monsters based on wave progress
        // Unlock up to tier 5 gradually as waves progress
        const maxTierToUnlock = Math.min(Math.floor(this.wave / 2) + 1, 5);
        for (let i = 1; i <= maxTierToUnlock; i++) {
            if (!this.unlockedMonsters.includes(i)) {
                this.unlockedMonsters.push(i);
            }
        }
        
        // Update UI
        this.uiManager.updateMoneyDisplay(this.coins);
        this.uiManager.updateWaveDisplay(this.wave);
        
        // Save game state
        this.saveGameState();
        
        return coinsEarned;
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});