/**
 * HealthBarManager handles the display and management of monster health bars
 */
class HealthBarManager {
    constructor() {
        this.healthBars = {};
        this.offsetY = 50; // Increased offset to position bars better above monsters
        this.offsetX = 30; // Horizontal offset for centering
        
        // Create a container for all health bars to improve performance
        this.containerElement = document.createElement('div');
        this.containerElement.className = 'health-bars-container';
        document.body.appendChild(this.containerElement);
    }
    
    /**
     * Create or update a health bar for a monster
     * @param {Object} monster - The monster object
     * @param {Object} screenPosition - Screen position for the health bar
     */
    updateMonsterHealthBar(monster, screenPosition) {
        if (!monster || !screenPosition) return;
        
        // Skip if monster is off-screen or too far away
        if (screenPosition.x < -100 || screenPosition.x > window.innerWidth + 100 ||
            screenPosition.y < -100 || screenPosition.y > window.innerHeight + 100) {
            // If health bar exists but is off-screen, hide it
            if (this.healthBars[monster.id]) {
                this.healthBars[monster.id].container.style.display = 'none';
            }
            return;
        }
        
        if (!this.healthBars[monster.id]) {
            // Create new health bar element
            const healthBarContainer = document.createElement('div');
            healthBarContainer.className = 'monster-overlay';
            healthBarContainer.dataset.monsterId = monster.id;
            
            const healthBar = document.createElement('div');
            healthBar.className = 'health-bar';
            
            const healthBarFill = document.createElement('div');
            healthBarFill.className = 'health-bar-fill';
            
            healthBar.appendChild(healthBarFill);
            healthBarContainer.appendChild(healthBar);
            this.containerElement.appendChild(healthBarContainer);
            
            this.healthBars[monster.id] = {
                container: healthBarContainer,
                bar: healthBarFill
            };
        }
        
        // Update health bar position
        const healthBarElements = this.healthBars[monster.id];
        healthBarElements.container.style.display = 'block';
        healthBarElements.container.style.left = `${screenPosition.x - this.offsetX}px`;
        healthBarElements.container.style.top = `${screenPosition.y - this.offsetY}px`;
        
        // Update health bar fill
        const healthPercentage = Math.max(0, Math.min(100, (monster.health / monster.maxHealth) * 100));
        healthBarElements.bar.style.width = `${healthPercentage}%`;
        
        // Add color based on health percentage
        if (healthPercentage > 60) {
            healthBarElements.bar.style.backgroundColor = '#4ade80'; // Green
        } else if (healthPercentage > 30) {
            healthBarElements.bar.style.backgroundColor = '#fbbf24'; // Yellow
        } else {
            healthBarElements.bar.style.backgroundColor = '#ef4444'; // Red
        }
    }
    
    /**
     * Remove a monster's health bar
     * @param {number} monsterId - ID of the monster
     */
    removeMonsterHealthBar(monsterId) {
        if (this.healthBars[monsterId]) {
            this.containerElement.removeChild(this.healthBars[monsterId].container);
            delete this.healthBars[monsterId];
        }
    }
    
    /**
     * Show damage text animation at a screen position
     * @param {number} damage - Amount of damage to display
     * @param {Object} screenPosition - Screen position for the damage text
     */
    showDamageText(damage, screenPosition) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `-${damage}`;
        
        damageText.style.left = `${screenPosition.x}px`;
        damageText.style.top = `${screenPosition.y - 30}px`;
        
        this.containerElement.appendChild(damageText);
        
        // Remove element after animation completes
        setTimeout(() => {
            if (this.containerElement.contains(damageText)) {
                this.containerElement.removeChild(damageText);
            }
        }, 1000);
    }
    
    /**
     * Update all monster health bars based on their positions in the world
     * @param {Array} monsters - Array of monsters to update
     * @param {THREE.Camera} camera - Camera for screen position calculations
     * @param {THREE.Renderer} renderer - Renderer for viewport
     */
    updateAllHealthBars(monsters, camera, renderer) {
        if (!monsters || !camera || !renderer) return;
        
        const tempVector = new THREE.Vector3();
        const rendererSize = {
            width: renderer.domElement.clientWidth,
            height: renderer.domElement.clientHeight
        };
        
        // Get all current monster IDs
        const currentMonsterIds = monsters.map(monster => monster.id);
        
        // Remove health bars for monsters that no longer exist
        Object.keys(this.healthBars).forEach(id => {
            if (!currentMonsterIds.includes(id)) {
                this.removeMonsterHealthBar(id);
            }
        });
        
        monsters.forEach(monster => {
            if (!monster || !monster.mesh || monster.health <= 0) return;
            
            // Get screen position
            tempVector.setFromMatrixPosition(monster.mesh.matrixWorld);
            
            // Add a small Y offset to position the health bar above the monster
            tempVector.y += 0.5;
            
            tempVector.project(camera);
            
            // Check if the monster is in front of the camera
            if (tempVector.z > 1) return;
            
            const screenPosition = {
                x: (tempVector.x * 0.5 + 0.5) * rendererSize.width,
                y: (tempVector.y * -0.5 + 0.5) * rendererSize.height
            };
            
            this.updateMonsterHealthBar(monster, screenPosition);
        });
    }
    
    /**
     * Clear all health bars
     */
    clearAllHealthBars() {
        Object.keys(this.healthBars).forEach(id => {
            if (this.containerElement.contains(this.healthBars[id].container)) {
                this.containerElement.removeChild(this.healthBars[id].container);
            }
        });
        
        this.healthBars = {};
    }
    
    /**
     * Get screen position for a world object
     * @param {THREE.Object3D} mesh - The mesh to convert to screen position
     * @param {THREE.Camera} camera - Camera for screen position calculations
     * @param {THREE.Renderer} renderer - Renderer for viewport
     * @returns {Object} Screen position with x and y coordinates
     */
    getScreenPosition(mesh, camera, renderer) {
        if (!mesh || !camera || !renderer) return null;
        
        const tempVector = new THREE.Vector3();
        
        // Get screen position
        tempVector.setFromMatrixPosition(mesh.matrixWorld);
        
        // Add a small Y offset to position the health bar above the monster
        tempVector.y += 0.5;
        
        tempVector.project(camera);
        
        // Check if the point is in front of the camera
        if (tempVector.z > 1) return null;
        
        return {
            x: (tempVector.x * 0.5 + 0.5) * renderer.domElement.clientWidth,
            y: (tempVector.y * -0.5 + 0.5) * renderer.domElement.clientHeight
        };
    }
    
    /**
     * Hide all health bars
     */
    hideAllHealthBars() {
        this.containerElement.style.display = 'none';
    }
    
    /**
     * Show all health bars
     */
    showAllHealthBars() {
        this.containerElement.style.display = 'block';
    }
}