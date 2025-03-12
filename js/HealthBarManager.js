/**
 * HealthBarManager handles the creation and updating of health bars and damage text
 */
class HealthBarManager {
    constructor() {
        // Create container for health bars
        this.container = document.createElement('div');
        this.container.id = 'health-bars-container';
        document.body.appendChild(this.container);
        
        // Map to store health bars by monster ID
        this.healthBars = new Map();
        
        // Style the container
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.pointerEvents = 'none';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
    }
    
    /**
     * Create a health bar element
     * @param {Object} monster - Monster to create health bar for
     * @returns {HTMLElement} Health bar element
     */
    createHealthBar(monster) {
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        
        // Create health fill element
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthBar.appendChild(healthFill);
        
        // Style the health bar
        healthBar.style.position = 'absolute';
        healthBar.style.width = '50px';
        healthBar.style.height = '4px';
        healthBar.style.backgroundColor = '#333';
        healthBar.style.border = '1px solid #000';
        healthBar.style.borderRadius = '2px';
        healthBar.style.overflow = 'hidden';
        
        // Style the health fill
        healthFill.style.width = '100%';
        healthFill.style.height = '100%';
        healthFill.style.backgroundColor = '#2ecc71';
        healthFill.style.transition = 'width 0.2s ease-in-out';
        
        // Add to container
        this.container.appendChild(healthBar);
        
        // Store in map
        this.healthBars.set(monster.id, healthBar);
        
        return healthBar;
    }
    
    /**
     * Update a monster's health bar
     * @param {Object} monster - Monster to update health bar for
     * @param {Object} screenPosition - Screen position to place health bar at
     */
    updateMonsterHealthBar(monster, screenPosition) {
        let healthBar = this.healthBars.get(monster.id);
        
        // Create health bar if it doesn't exist
        if (!healthBar) {
            healthBar = this.createHealthBar(monster);
        }
        
        // Update health bar position
        healthBar.style.left = (screenPosition.x - 25) + 'px';
        healthBar.style.top = (screenPosition.y - 30) + 'px';
        
        // Update health fill
        const healthFill = healthBar.querySelector('.health-fill');
        const healthPercent = (monster.health / monster.maxHealth) * 100;
        healthFill.style.width = healthPercent + '%';
        
        // Update color based on health percentage
        if (healthPercent > 50) {
            healthFill.style.backgroundColor = '#2ecc71'; // Green
        } else if (healthPercent > 25) {
            healthFill.style.backgroundColor = '#f1c40f'; // Yellow
        } else {
            healthFill.style.backgroundColor = '#e74c3c'; // Red
        }
    }
    
    /**
     * Update all monster health bars
     * @param {Array} monsters - Array of monsters to update health bars for
     * @param {THREE.Camera} camera - Camera to use for screen position calculation
     * @param {THREE.WebGLRenderer} renderer - Renderer to use for screen position calculation
     */
    updateAllHealthBars(monsters, camera, renderer) {
        monsters.forEach(monster => {
            const screenPosition = this.getScreenPosition(monster.mesh, camera, renderer);
            if (screenPosition) {
                this.updateMonsterHealthBar(monster, screenPosition);
            }
        });
    }
    
    /**
     * Remove a monster's health bar
     * @param {number} monsterId - ID of monster to remove health bar for
     */
    removeMonsterHealthBar(monsterId) {
        const healthBar = this.healthBars.get(monsterId);
        if (healthBar) {
            healthBar.remove();
            this.healthBars.delete(monsterId);
        }
    }
    
    /**
     * Clear all health bars
     */
    clearAllHealthBars() {
        this.healthBars.forEach(healthBar => {
            healthBar.remove();
        });
        this.healthBars.clear();
    }
    
    /**
     * Show damage text at a position
     * @param {number} damage - Amount of damage to show
     * @param {Object} position - Screen position to show damage at
     */
    showDamageText(damage, position) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${damage}`;
        
        // Style the damage text
        damageText.style.position = 'absolute';
        damageText.style.left = position.x + 'px';
        damageText.style.top = (position.y - 20) + 'px';
        damageText.style.color = '#e74c3c';
        damageText.style.fontWeight = 'bold';
        damageText.style.fontSize = '16px';
        damageText.style.textShadow = '1px 1px 1px #000';
        damageText.style.pointerEvents = 'none';
        damageText.style.animation = 'damage-float 1s ease-out forwards';
        
        // Add to container
        this.container.appendChild(damageText);
        
        // Remove after animation
        setTimeout(() => {
            damageText.remove();
        }, 1000);
    }
    
    /**
     * Get screen position for a world object
     * @param {THREE.Object3D} object - Object to get screen position for
     * @param {THREE.Camera} camera - Camera to use for calculation
     * @param {THREE.WebGLRenderer} renderer - Renderer to use for calculation
     * @returns {Object} Screen position with x and y coordinates
     */
    getScreenPosition(object, camera, renderer) {
        const vector = object.position.clone();
        vector.project(camera);
        
        const widthHalf = renderer.domElement.width / 2;
        const heightHalf = renderer.domElement.height / 2;
        
        return {
            x: (vector.x * widthHalf) + widthHalf,
            y: -(vector.y * heightHalf) + heightHalf
        };
    }
}