/**
 * UIManager handles all UI elements and interactions
 */
class UIManager {
    constructor(sceneManager, gameManager, textureManager) {
        this.sceneManager = sceneManager;
        this.gameManager = gameManager;
        this.textureManager = textureManager;
        this.camera = sceneManager.camera;
        this.renderer = sceneManager.renderer;
        
        // UI elements
        this.moneyDisplay = document.getElementById('money-display');
        this.waveDisplay = document.getElementById('wave-display');
        this.shopButton = document.getElementById('shop-button');
        this.battleButton = document.getElementById('battle-button');
        this.restartButton = document.getElementById('restart-button');
        
        // UI managers
        this.overlayManager = new OverlayManager(gameManager);
        this.healthBarManager = new HealthBarManager();
        
        this.setupEventListeners();
        this.applyButtonTextures();
    }
    
    setupEventListeners() {
        this.shopButton.addEventListener('click', () => {
            this.openShop();
        });
        
        this.battleButton.addEventListener('click', () => {
            this.gameManager.startBattle();
        });
        
        this.restartButton.addEventListener('click', () => {
            this.overlayManager.showConfirmation(
                'Restart Game', 
                'Are you sure you want to restart the game? All progress will be lost.',
                () => {
                    this.gameManager.restartGame();
                }
            );
        });
    }
    
    applyButtonTextures() {
        // Get all buttons
        const buttons = document.querySelectorAll('.game-button');
        
        // Apply textures to each button
        buttons.forEach(button => {
            // Get button dimensions
            const rect = button.getBoundingClientRect();
            const width = Math.max(rect.width, 200); // Minimum width of 200px
            const height = Math.max(rect.height, 60); // Minimum height of 60px
            
            // Determine button color based on its function
            let baseColor = '#e94560'; // Default color
            
            if (button.id === 'shop-button') {
                baseColor = '#4ade80'; // Green for shop
            } else if (button.id === 'battle-button') {
                baseColor = '#f97316'; // Orange for combat
            } else if (button.id === 'restart-button') {
                baseColor = '#ef4444'; // Red for restart
            }
            
            // Generate button textures
            const normalTexture = this.textureManager.generateButtonTexture(width, height, baseColor, { state: 'normal' });
            const hoverTexture = this.textureManager.generateButtonTexture(width, height, baseColor, { state: 'hover' });
            const activeTexture = this.textureManager.generateButtonTexture(width, height, baseColor, { state: 'active' });
            
            // Apply textures using CSS background-image
            button.style.backgroundImage = `url(${normalTexture.toDataURL()})`;
            button.style.backgroundSize = 'cover';
            button.style.color = '#ffffff';
            button.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.5)';
            button.style.border = 'none';
            
            // Add hover and active state listeners
            button.addEventListener('mouseenter', () => {
                button.style.backgroundImage = `url(${hoverTexture.toDataURL()})`;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.backgroundImage = `url(${normalTexture.toDataURL()})`;
            });
            
            button.addEventListener('mousedown', () => {
                button.style.backgroundImage = `url(${activeTexture.toDataURL()})`;
            });
            
            button.addEventListener('mouseup', () => {
                button.style.backgroundImage = `url(${hoverTexture.toDataURL()})`;
            });
        });
    }
    
    /**
     * Open the shop overlay
     */
    openShop() {
        if (this.overlayManager) {
            // Get available monsters from the game manager
            const availableMonsters = this.gameManager.getUnlockedTiers();
            this.overlayManager.openShop(availableMonsters);
        }
    }
    
    /**
     * Close the shop overlay
     */
    closeShop() {
        if (this.overlayManager) {
            this.overlayManager.closeShop();
        }
    }
    
    updateMoneyDisplay(money) {
        if (this.moneyDisplay) {
            this.moneyDisplay.textContent = `$${money}`;
        }
    }
    
    updateWaveDisplay(wave) {
        if (this.waveDisplay) {
            this.waveDisplay.textContent = `Wave ${wave}`;
        }
    }
    
    /**
     * Show a notification message to the player
     * @param {string} message - The message to display
     * @param {string} type - The type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            
            // Remove notification after a delay
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 500);
            }, 3000);
        }
    }
    
    /**
     * Update all monster health bars based on their positions in the world
     * @param {Array} monsters - Array of monsters to update health bars for
     */
    updateAllHealthBars(monsters) {
        if (!monsters || !Array.isArray(monsters)) return;
        
        // Use the health bar manager to update all health bars
        this.healthBarManager.updateAllHealthBars(monsters, this.camera, this.renderer);
    }
    
    /**
     * Get the screen position for a world object
     * @param {THREE.Object3D} mesh - The mesh to convert to screen position
     * @returns {Object} Screen position with x and y coordinates
     */
    getScreenPosition(mesh) {
        return this.healthBarManager.getScreenPosition(mesh, this.camera, this.renderer);
    }
    
    /**
     * Show damage text at a monster's position
     * @param {Object} monster - The monster that took damage
     * @param {number} damage - Amount of damage to display
     */
    showDamageText(monster, damage) {
        if (!monster || !monster.mesh) return;
        
        const screenPosition = this.getScreenPosition(monster.mesh);
        if (screenPosition) {
            this.healthBarManager.showDamageText(damage, screenPosition);
        }
    }
    
    /**
     * Clear all health bars
     */
    clearAllHealthBars() {
        this.healthBarManager.clearAllHealthBars();
    }
    
    /**
     * Update a specific monster's health bar
     * @param {Object} monster - The monster to update
     */
    updateMonsterHealthBar(monster) {
        if (!monster || !monster.mesh) return;
        
        const screenPosition = this.getScreenPosition(monster.mesh);
        if (screenPosition) {
            this.healthBarManager.updateMonsterHealthBar(monster, screenPosition);
        }
    }
    
    /**
     * Remove a monster's health bar
     * @param {number} monsterId - ID of the monster
     */
    removeMonsterHealthBar(monsterId) {
        this.healthBarManager.removeMonsterHealthBar(monsterId);
    }
    
    /**
     * Show battle results in the overlay
     * @param {Object} results - Battle results data
     */
    showBattleResults(results) {
        if (this.overlayManager) {
            this.overlayManager.showBattleResults(results);
        }
    }
    
    /**
     * Show game over screen
     * @param {Object} results - Game over results data
     */
    showGameOver(results) {
        if (this.overlayManager) {
            this.overlayManager.showGameOver(results);
        }
    }
    
    /**
     * Animate the placement of a monster on the grid
     * @param {Object} monster - The monster to animate
     */
    animateMonsterPlacement(monster) {
        if (!monster || !monster.mesh) return;
        
        // Store the original position
        const originalPosition = monster.mesh.position.clone();
        const originalScale = monster.mesh.scale.clone();
        
        // Start with a smaller scale
        monster.mesh.scale.set(0.1, 0.1, 0.1);
        
        // Create a simple animation using requestAnimationFrame
        const startTime = Date.now();
        const duration = 500; // milliseconds
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smoother animation
            const eased = this.easeOutBack(progress);
            
            // Update scale
            const scale = originalScale.clone().multiplyScalar(eased);
            monster.mesh.scale.copy(scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Easing function for smooth animations
     * @param {number} x - Progress from 0 to 1
     * @returns {number} Eased value
     */
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
}