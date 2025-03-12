/**
 * AnimationManager handles all game animations
 */
class AnimationManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        
        // Animation mixers for monsters
        this.mixers = new Map();
        
        // Active animations
        this.activeAnimations = new Set();
        
        // Clock for animation timing
        this.clock = new THREE.Clock();
    }
    
    /**
     * Update all active animations
     */
    update() {
        const delta = this.clock.getDelta();
        
        // Update all animation mixers
        for (const mixer of this.mixers.values()) {
            mixer.update(delta);
        }
    }
    
    /**
     * Add a monster to the animation system
     * @param {Object} monster - Monster object with mesh and animations
     */
    addMonster(monster) {
        if (monster.mesh && monster.animations) {
            // Create animation mixer for monster
            const mixer = new THREE.AnimationMixer(monster.mesh);
            this.mixers.set(monster.id, mixer);
            
            // Create animation actions
            monster.actions = {};
            monster.animations.forEach(animation => {
                const action = mixer.clipAction(animation);
                monster.actions[animation.name] = action;
            });
        }
    }
    
    /**
     * Remove a monster from the animation system
     * @param {Object} monster - Monster to remove
     */
    removeMonster(monster) {
        if (this.mixers.has(monster.id)) {
            const mixer = this.mixers.get(monster.id);
            mixer.stopAllAction();
            this.mixers.delete(monster.id);
        }
    }
    
    /**
     * Play an animation for a monster
     * @param {Object} monster - Monster to animate
     * @param {string} animationName - Name of the animation to play
     * @param {Object} options - Animation options
     */
    playMonsterAnimation(monster, animationName, options = {}) {
        const {
            loop = THREE.LoopOnce,
            clampWhenFinished = true,
            duration = 1,
            weight = 1,
            fadeIn = 0.3,
            fadeOut = 0.3
        } = options;
        
        if (monster.actions && monster.actions[animationName]) {
            const action = monster.actions[animationName];
            
            // Configure animation
            action.loop = loop;
            action.clampWhenFinished = clampWhenFinished;
            action.timeScale = 1 / duration;
            action.weight = weight;
            
            // Reset and play
            action.reset();
            action.fadeIn(fadeIn);
            action.play();
            
            // Add to active animations
            this.activeAnimations.add(action);
            
            // Setup fade out if not looping
            if (loop === THREE.LoopOnce) {
                const mixer = this.mixers.get(monster.id);
                mixer.addEventListener('finished', () => {
                    action.fadeOut(fadeOut);
                    this.activeAnimations.delete(action);
                });
            }
        }
    }
    
    /**
     * Stop all animations for a monster
     * @param {Object} monster - Monster to stop animations for
     */
    stopMonsterAnimations(monster) {
        if (monster.actions) {
            Object.values(monster.actions).forEach(action => {
                action.stop();
                this.activeAnimations.delete(action);
            });
        }
    }
    
    /**
     * Create a floating text animation
     * @param {string} text - Text to display
     * @param {THREE.Vector3} position - Starting position
     * @param {Object} options - Animation options
     */
    createFloatingText(text, position, options = {}) {
        const {
            color = '#ffffff',
            size = 0.5,
            duration = 1,
            rise = 1,
            fadeStart = 0.7
        } = options;
        
        // Create text sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 256;
        canvas.height = 256;
        
        // Draw text
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = color;
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        
        // Create sprite
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        // Set initial position and scale
        sprite.position.copy(position);
        sprite.scale.set(size, size, 1);
        
        // Add to scene
        this.scene.add(sprite);
        
        // Animate
        const startTime = this.clock.getElapsedTime();
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update position
            sprite.position.y = position.y + (rise * progress);
            
            // Update opacity
            if (progress > fadeStart) {
                const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
                spriteMaterial.opacity = 1 - fadeProgress;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(sprite);
                spriteMaterial.dispose();
                texture.dispose();
            }
        };
        
        animate();
    }
    
    /**
     * Create a merge animation between two monsters
     * @param {Object} monster1 - First monster
     * @param {Object} monster2 - Second monster
     * @param {THREE.Vector3} targetPosition - Final position for merged monster
     * @param {Function} onComplete - Callback when animation completes
     */
    createMergeAnimation(monster1, monster2, targetPosition, onComplete) {
        const duration = 0.5;
        const startTime = this.clock.getElapsedTime();
        
        // Store initial positions
        const startPos1 = monster1.mesh.position.clone();
        const startPos2 = monster2.mesh.position.clone();
        
        // Calculate midpoint
        const midpoint = targetPosition.clone();
        midpoint.y += 1;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // First half of animation - move to midpoint
            if (progress <= 0.5) {
                const subProgress = progress * 2;
                
                // Move monsters toward midpoint
                monster1.mesh.position.lerpVectors(startPos1, midpoint, subProgress);
                monster2.mesh.position.lerpVectors(startPos2, midpoint, subProgress);
                
                // Scale monsters
                const scale = 1 + (subProgress * 0.2);
                monster1.mesh.scale.setScalar(scale);
                monster2.mesh.scale.setScalar(scale);
            }
            // Second half - combine and move to target
            else {
                const subProgress = (progress - 0.5) * 2;
                
                // Hide original monsters
                monster1.mesh.visible = false;
                monster2.mesh.visible = false;
                
                // Create merge effect (particles)
                if (subProgress < 0.1) {
                    this.createMergeParticles(midpoint);
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Complete merge
                if (onComplete) {
                    onComplete();
                }
            }
        };
        
        animate();
    }
    
    /**
     * Create particle effect for monster merge
     * @param {THREE.Vector3} position - Position for particle effect
     */
    createMergeParticles(position) {
        const particleCount = 20;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 0.2;
            
            positions[i * 3] = position.x + Math.cos(angle) * radius;
            positions[i * 3 + 1] = position.y;
            positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;
            
            velocities.push(new THREE.Vector3(
                Math.cos(angle) * 0.1,
                0.1,
                Math.sin(angle) * 0.1
            ));
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Create particle material
        const material = new THREE.PointsMaterial({
            color: 0xffff00,
            size: 0.1,
            transparent: true
        });
        
        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = this.clock.getElapsedTime();
        const duration = 0.5;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update particle positions
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i].x;
                positions[i * 3 + 1] += velocities[i].y;
                positions[i * 3 + 2] += velocities[i].z;
                
                // Update velocity (add gravity)
                velocities[i].y -= 0.01;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Update opacity
            material.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove particles
                this.scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
}