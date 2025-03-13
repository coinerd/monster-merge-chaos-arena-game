/**
 * OverlayManager handles all game overlays like shop and battle results
 */
class OverlayManager {
    /**
     * Create a new OverlayManager
     * @param {Object} elements - DOM elements for the overlays
     * @param {Game} gameManager - Game manager instance
     */
    constructor(elements, gameManager) {
        this.elements = elements || {};
        this.gameManager = gameManager;
        this.confirmCallback = null;
        
        // Initialize event listeners
        this.initializeEventListeners();
    }
    
    /**
     * Initialize event listeners for the overlay
     */
    initializeEventListeners() {
        // Close button for shop
        const closeShopButton = document.getElementById('close-shop');
        if (closeShopButton) {
            closeShopButton.addEventListener('click', () => this.closeShop());
        }
        
        // Shop items container - use event delegation
        if (this.elements.shopItems) {
            this.elements.shopItems.addEventListener('click', (event) => this.handleShopItemClick(event));
        }
        
        // Close button for battle results
        if (this.elements.battleResultsCloseButton) {
            this.elements.battleResultsCloseButton.addEventListener('click', () => {
                this.closeBattleResults();
            });
        }
        
        // Yes button for confirmation
        if (this.elements.confirmYes) {
            this.elements.confirmYes.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback(true);
                }
                this.closeConfirmation();
            });
        }
        
        // No button for confirmation
        if (this.elements.confirmNo) {
            this.elements.confirmNo.addEventListener('click', () => {
                if (this.confirmCallback) {
                    this.confirmCallback(false);
                }
                this.closeConfirmation();
            });
        }
        
        // Restart button for game over
        if (this.elements.restartGame) {
            this.elements.restartGame.addEventListener('click', () => {
                this.closeGameOver();
                if (this.gameManager) {
                    this.gameManager.restartGame();
                }
            });
        }
    }
    
    /**
     * Handle shop item click
     * @param {Event} event - Click event
     */
    handleShopItemClick(event) {
        // Check if a shop item was clicked
        const shopItem = event.target.closest('.shop-item');
        if (!shopItem || shopItem.classList.contains('disabled')) return;
        
        // Get monster tier
        const tier = parseInt(shopItem.getAttribute('data-tier'));
        if (isNaN(tier)) {
            console.error('Invalid monster tier:', shopItem);
            return;
        }
        
        console.log('Attempting to buy monster tier:', tier);
        
        // Try to buy the monster
        if (this.gameManager && typeof this.gameManager.buyMonster === 'function') {
            const purchased = this.gameManager.buyMonster(tier);
            console.log('Purchase result:', purchased);
            
            // If purchase was successful, update affordability
            if (purchased) {
                setTimeout(() => {
                    const currentCoins = this.gameManager.getCoins();
                    this.updateShopItemAffordability(currentCoins);
                }, 0);
            }
        } else {
            console.error('Game manager or buyMonster method not available');
        }
    }
    
    /**
     * Open the shop overlay
     * @param {Array} shopItems - Items to display in the shop
     * @param {number} coins - Current coins
     */
    openShop(shopItems, coins) {
        if (!this.elements.shopOverlay || !this.elements.shopItems) return;
        
        // Clear existing shop items
        this.elements.shopItems.innerHTML = '';
        
        // Add shop items
        if (shopItems && shopItems.length > 0) {
            shopItems.forEach(item => {
                const tier = item.tier;
                const price = item.cost;
                const canAfford = coins >= price;
                
                const shopItemElement = document.createElement('div');
                shopItemElement.className = 'shop-item' + (canAfford ? '' : ' disabled');
                shopItemElement.setAttribute('data-tier', tier);
                
                const tierElement = document.createElement('div');
                tierElement.className = 'shop-item-tier';
                tierElement.textContent = `Tier ${tier} Monster`;
                
                const priceElement = document.createElement('div');
                priceElement.className = 'shop-item-price';
                priceElement.textContent = `${price} coins`;
                
                shopItemElement.appendChild(tierElement);
                shopItemElement.appendChild(priceElement);
                
                this.elements.shopItems.appendChild(shopItemElement);
            });
        } else {
            // No shop items available
            const noItemsElement = document.createElement('div');
            noItemsElement.className = 'no-shop-items';
            noItemsElement.textContent = 'No items available';
            this.elements.shopItems.appendChild(noItemsElement);
        }
        
        // Show the overlay
        this.elements.shopOverlay.classList.remove('hidden');
    }
    
    /**
     * Update shop item affordability based on current coins
     * @param {number} coins - Current coins
     */
    updateShopItemAffordability(coins) {
        if (!this.elements.shopItems) return;
        
        const shopItemElements = this.elements.shopItems.querySelectorAll('.shop-item');
        shopItemElements.forEach(item => {
            const tier = parseInt(item.getAttribute('data-tier'));
            if (isNaN(tier)) return;
            
            const price = tier * 10;
            const canAfford = coins >= price;
            
            if (canAfford) {
                item.classList.remove('disabled');
            } else {
                item.classList.add('disabled');
            }
        });
    }
    
    /**
     * Close the shop overlay
     */
    closeShop() {
        if (this.elements.shopOverlay) {
            this.elements.shopOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Show battle results
     * @param {Object} results - Battle results object
     */
    showBattleResults(results) {
        if (!this.elements.battleOverlay || !this.elements.battleResults) return;
        
        let content = '';
        
        if (results.victory) {
            content += '<div class="battle-victory">Victory!</div>';
        } else {
            content += '<div class="battle-defeat">Defeat!</div>';
        }
        
        content += `<div class="battle-rewards">Coins earned: ${results.rewards.coins}</div>`;
        
        if (results.rewards.waveCompleted) {
            const nextWave = this.gameManager ? this.gameManager.getWave() + 1 : 1;
            content += `<div class="battle-next-wave">Advancing to Wave ${nextWave}</div>`;
        }
        
        this.elements.battleResults.innerHTML = content;
        this.elements.battleOverlay.classList.remove('hidden');
    }
    
    /**
     * Close the battle results overlay
     */
    closeBattleResults() {
        if (this.elements.battleOverlay) {
            this.elements.battleOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Show a confirmation dialog
     * @param {string} title - The title for the confirmation dialog
     * @param {string} message - The confirmation message
     * @param {Function} onConfirm - Function to call if confirmed
     */
    showConfirmation(title, message, onConfirm) {
        if (!this.elements.confirmationOverlay) return;
        
        this.elements.confirmationTitle.textContent = title;
        this.elements.confirmationMessage.textContent = message;
        this.confirmCallback = onConfirm;
        
        this.elements.confirmationOverlay.classList.remove('hidden');
    }
    
    /**
     * Close the confirmation overlay
     */
    closeConfirmation() {
        if (this.elements.confirmationOverlay) {
            this.elements.confirmationOverlay.classList.add('hidden');
        }
    }
    
    /**
     * Show game over overlay
     * @param {Object} results - Game over results object
     */
    showGameOver(results) {
        if (!this.elements.gameOverOverlay) return;
        
        this.elements.gameOverMessage.textContent = results.message || 'Game Over!';
        this.elements.gameOverWave.textContent = `Reached Wave ${results.wave || 1}`;
        
        this.elements.gameOverOverlay.classList.remove('hidden');
    }
    
    /**
     * Close the game over overlay
     */
    closeGameOver() {
        if (this.elements.gameOverOverlay) {
            this.elements.gameOverOverlay.classList.add('hidden');
        }
    }
}
