/**
 * AnimationManager handles UI-related animations
 */
class AnimationManager {
    constructor() {
        // Animation properties can be configured here
    }
    
    /**
     * Create an animation for placing a new monster
     * @param {Object} monster - The monster that was placed
     * @param {THREE.Vector3} position - Position where monster was placed
     * @param {Object} tierData - Tier data for the monster
     */
    animateMonsterPlacement(monster, position, tierData) {
        monster.mesh.scale.set(0.1, 0.1, 0.1);
        monster.mesh.position.y += 2;
        
        // Simple animation using requestAnimationFrame
        const startTime = performance.now();
        const duration = 500; // ms
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease in-out
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;
            
            // Scale up from small to target size
            const targetScale = tierData.scale;
            const currentScale = 0.1 + (targetScale - 0.1) * easedProgress;
            monster.mesh.scale.set(currentScale, currentScale, currentScale);
            
            // Drop from above
            monster.mesh.position.y = 0.5 + 2 * (1 - easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Create a scale animation for an object
     * @param {THREE.Object3D} object - The object to animate
     * @param {number} startScale - Starting scale value
     * @param {number} endScale - Ending scale value
     * @param {number} duration - Duration in milliseconds
     * @param {Function} onComplete - Callback to run when animation completes
     */
    animateScale(object, startScale, endScale, duration = 500, onComplete = null) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease in-out
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;
            
            // Calculate current scale
            const currentScale = startScale + (endScale - startScale) * easedProgress;
            object.scale.set(currentScale, currentScale, currentScale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Animate a position change
     * @param {THREE.Object3D} object - The object to animate
     * @param {THREE.Vector3} startPos - Starting position
     * @param {THREE.Vector3} endPos - Ending position
     * @param {number} duration - Duration in milliseconds
     * @param {Function} onComplete - Callback to run when animation completes
     */
    animatePosition(object, startPos, endPos, duration = 500, onComplete = null) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease in-out
            const easedProgress = progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;
            
            // Calculate current position
            object.position.x = startPos.x + (endPos.x - startPos.x) * easedProgress;
            object.position.y = startPos.y + (endPos.y - startPos.y) * easedProgress;
            object.position.z = startPos.z + (endPos.z - startPos.z) * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Show damage text at a given screen position
     * @param {number} damage - Amount of damage to display
     * @param {Object} screenPosition - Screen position {x, y} for the damage text
     */
    showDamageText(damage, screenPosition) {
        // Create damage number element
        const damageElement = document.createElement('div');
        damageElement.className = 'damage-text';
        damageElement.textContent = damage;
        
        // Set initial position
        damageElement.style.left = `${screenPosition.x}px`;
        damageElement.style.top = `${screenPosition.y}px`;
        
        // Add to DOM
        document.body.appendChild(damageElement);
        
        // Animate fade out and rise up
        const startTime = performance.now();
        const duration = 1000; // ms
        
        const animateDamage = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Move up with easing
            damageElement.style.top = `${screenPosition.y - (50 * progress)}px`;
            
            // Fade out
            damageElement.style.opacity = (1 - progress).toString();
            
            if (progress < 1) {
                requestAnimationFrame(animateDamage);
            } else {
                // Remove when animation is complete
                document.body.removeChild(damageElement);
            }
        };
        
        requestAnimationFrame(animateDamage);
    }
}