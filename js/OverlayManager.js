/**
 * OverlayManager handles all game overlays and UI interactions
 */
class OverlayManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Create overlay container
        this.container = document.createElement('div');
        this.container.id = 'overlay-container';
        document.body.appendChild(this.container);
        
        // Style the container
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'none';
        this.container.style.justifyContent = 'center';
        this.container.style.alignItems = 'center';
        this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.container.style.zIndex = '1000';
    }
    
    /**
     * Show the shop overlay
     * @param {Array} availableMonsters - List of available monster tiers
     */
    openShop(availableMonsters) {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create shop panel
        const shopPanel = document.createElement('div');
        shopPanel.className = 'shop-panel';
        shopPanel.style.backgroundColor = '#fff';
        shopPanel.style.padding = '20px';
        shopPanel.style.borderRadius = '10px';
        shopPanel.style.maxWidth = '80%';
        shopPanel.style.maxHeight = '80%';
        shopPanel.style.overflow = 'auto';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Monster Shop';
        title.style.textAlign = 'center';
        title.style.marginBottom = '20px';
        shopPanel.appendChild(title);
        
        // Create monster grid
        const monsterGrid = document.createElement('div');
        monsterGrid.style.display = 'grid';
        monsterGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
        monsterGrid.style.gap = '20px';
        monsterGrid.style.marginBottom = '20px';
        
        // Add monster options
        availableMonsters.forEach(tier => {
            const monsterCard = this.createMonsterCard(tier);
            monsterGrid.appendChild(monsterCard);
        });
        
        shopPanel.appendChild(monsterGrid);
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.className = 'shop-button';
        closeButton.style.display = 'block';
        closeButton.style.margin = '0 auto';
        closeButton.addEventListener('click', () => this.closeShop());
        shopPanel.appendChild(closeButton);
        
        // Show the overlay
        this.container.appendChild(shopPanel);
        this.container.style.display = 'flex';
    }
    
    /**
     * Create a monster card for the shop
     * @param {number} tier - Monster tier
     * @returns {HTMLElement} Monster card element
     */
    createMonsterCard(tier) {
        const card = document.createElement('div');
        card.className = 'monster-card';
        card.style.backgroundColor = '#f5f5f5';
        card.style.padding = '15px';
        card.style.borderRadius = '5px';
        card.style.textAlign = 'center';
        
        // Add monster icon (placeholder)
        const icon = document.createElement('div');
        icon.style.width = '50px';
        icon.style.height = '50px';
        icon.style.margin = '0 auto 10px';
        icon.style.backgroundColor = this.getTierColor(tier);
        icon.style.borderRadius = '5px';
        card.appendChild(icon);
        
        // Add tier text
        const tierText = document.createElement('div');
        tierText.textContent = `Tier ${tier}`;
        tierText.style.marginBottom = '10px';
        card.appendChild(tierText);
        
        // Add stats
        const stats = document.createElement('div');
        stats.style.fontSize = '12px';
        stats.style.marginBottom = '10px';
        stats.innerHTML = `
            Health: ${100 * Math.pow(2, tier - 1)}<br>
            Attack: ${10 * Math.pow(2, tier - 1)}<br>
            Defense: ${5 * Math.pow(2, tier - 1)}
        `;
        card.appendChild(stats);
        
        // Add price
        const price = document.createElement('div');
        price.textContent = `${tier * 50} coins`;
        price.style.marginBottom = '10px';
        card.appendChild(price);
        
        // Add buy button
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy';
        buyButton.className = 'shop-button';
        buyButton.addEventListener('click', () => {
            if (this.gameManager.buyMonster(tier)) {
                this.closeShop();
            }
        });
        card.appendChild(buyButton);
        
        return card;
    }
    
    /**
     * Get color for monster tier
     * @param {number} tier - Monster tier
     * @returns {string} Color hex code
     */
    getTierColor(tier) {
        const colors = {
            1: '#66ff66', // Green
            2: '#6666ff', // Blue
            3: '#ff6666', // Red
            4: '#ffff66', // Yellow
            5: '#ff66ff'  // Purple
        };
        return colors[tier] || '#ffffff';
    }
    
    /**
     * Close the shop overlay
     */
    closeShop() {
        this.container.style.display = 'none';
        this.container.innerHTML = '';
    }
    
    /**
     * Show battle results overlay
     * @param {Object} results - Battle results data
     */
    showBattleResults(results) {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create results panel
        const resultsPanel = document.createElement('div');
        resultsPanel.className = 'results-panel';
        resultsPanel.style.backgroundColor = '#fff';
        resultsPanel.style.padding = '20px';
        resultsPanel.style.borderRadius = '10px';
        resultsPanel.style.textAlign = 'center';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Battle Results';
        title.style.marginBottom = '20px';
        resultsPanel.appendChild(title);
        
        // Add results content
        const content = document.createElement('div');
        content.innerHTML = `
            <p>Victory!</p>
            <p>Coins earned: ${results.rewards.coins}</p>
            ${results.rewards.waveCompleted ? '<p>Wave completed!</p>' : ''}
        `;
        resultsPanel.appendChild(content);
        
        // Add continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.className = 'shop-button';
        continueButton.style.marginTop = '20px';
        continueButton.addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        resultsPanel.appendChild(continueButton);
        
        // Show the overlay
        this.container.appendChild(resultsPanel);
        this.container.style.display = 'flex';
    }
    
    /**
     * Show game over overlay
     * @param {Object} results - Game over results data
     */
    showGameOver(results) {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create game over panel
        const gameOverPanel = document.createElement('div');
        gameOverPanel.className = 'game-over-panel';
        gameOverPanel.style.backgroundColor = '#fff';
        gameOverPanel.style.padding = '20px';
        gameOverPanel.style.borderRadius = '10px';
        gameOverPanel.style.textAlign = 'center';
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = 'Game Over';
        title.style.marginBottom = '20px';
        gameOverPanel.appendChild(title);
        
        // Add results content
        const content = document.createElement('div');
        content.innerHTML = `
            <p>${results.message}</p>
            <p>You reached Wave ${results.wave}</p>
        `;
        gameOverPanel.appendChild(content);
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart Game';
        restartButton.className = 'shop-button';
        restartButton.style.marginTop = '20px';
        restartButton.addEventListener('click', () => {
            this.container.style.display = 'none';
            this.gameManager.restartGame();
        });
        gameOverPanel.appendChild(restartButton);
        
        // Show the overlay
        this.container.appendChild(gameOverPanel);
        this.container.style.display = 'flex';
    }
    
    /**
     * Show confirmation dialog
     * @param {string} title - Dialog title
     * @param {string} message - Dialog message
     * @param {Function} onConfirm - Callback for confirm button
     */
    showConfirmation(title, message, onConfirm) {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create confirmation panel
        const confirmPanel = document.createElement('div');
        confirmPanel.className = 'confirm-panel';
        confirmPanel.style.backgroundColor = '#fff';
        confirmPanel.style.padding = '20px';
        confirmPanel.style.borderRadius = '10px';
        confirmPanel.style.textAlign = 'center';
        
        // Add title
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.marginBottom = '20px';
        confirmPanel.appendChild(titleElement);
        
        // Add message
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.style.marginBottom = '20px';
        confirmPanel.appendChild(messageElement);
        
        // Add buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '10px';
        
        // Add confirm button
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.className = 'shop-button';
        confirmButton.addEventListener('click', () => {
            this.container.style.display = 'none';
            onConfirm();
        });
        buttonsContainer.appendChild(confirmButton);
        
        // Add cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'shop-button';
        cancelButton.addEventListener('click', () => {
            this.container.style.display = 'none';
        });
        buttonsContainer.appendChild(cancelButton);
        
        confirmPanel.appendChild(buttonsContainer);
        
        // Show the overlay
        this.container.appendChild(confirmPanel);
        this.container.style.display = 'flex';
    }
}