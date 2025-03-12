/**
 * EffectManager handles visual effects in the game
 */
class EffectManager {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.scene = sceneManager.scene;
        
        // Active effects
        this.activeEffects = new Set();
        
        // Particle systems
        this.particleSystems = new Map();
        
        // Clock for timing
        this.clock = new THREE.Clock();
    }
    
    /**
     * Update all active effects
     */
    update() {
        const delta = this.clock.getDelta();
        
        // Update particle systems
        for (const system of this.particleSystems.values()) {
            system.update(delta);
        }
    }
    
    /**
     * Create a hit effect at a position
     * @param {THREE.Vector3} position - Effect position
     * @param {Object} options - Effect options
     */
    createHitEffect(position, options = {}) {
        const {
            color = 0xff0000,
            size = 0.5,
            count = 20,
            speed = 2,
            duration = 0.5
        } = options;
        
        // Create particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];
        
        // Initialize particles in a sphere
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const radius = Math.random() * 0.2;
            
            positions[i * 3] = position.x + (radius * Math.sin(phi) * Math.cos(theta));
            positions[i * 3 + 1] = position.y + (radius * Math.sin(phi) * Math.sin(theta));
            positions[i * 3 + 2] = position.z + (radius * Math.cos(phi));
            
            velocities.push(new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            ));
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            color,
            size: size * 0.1,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update particle positions
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < count; i++) {
                positions[i * 3] += velocities[i].x * 0.016;
                positions[i * 3 + 1] += velocities[i].y * 0.016;
                positions[i * 3 + 2] += velocities[i].z * 0.016;
                
                // Add gravity
                velocities[i].y -= 9.8 * 0.016;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Update opacity
            material.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Cleanup
                this.scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
    
    /**
     * Create a healing effect around a monster
     * @param {Object} monster - Target monster
     * @param {Object} options - Effect options
     */
    createHealEffect(monster, options = {}) {
        const {
            color = 0x00ff00,
            duration = 1,
            particleCount = 30
        } = options;
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const startPositions = [];
        const endPositions = [];
        
        // Calculate monster bounds
        const bounds = new THREE.Box3().setFromObject(monster.mesh);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            // Random start position below monster
            const startPos = new THREE.Vector3(
                center.x + (Math.random() - 0.5) * size.x,
                bounds.min.y - 0.5,
                center.z + (Math.random() - 0.5) * size.z
            );
            
            // End position above monster
            const endPos = new THREE.Vector3(
                startPos.x,
                bounds.max.y + 0.5,
                startPos.z
            );
            
            positions[i * 3] = startPos.x;
            positions[i * 3 + 1] = startPos.y;
            positions[i * 3 + 2] = startPos.z;
            
            startPositions.push(startPos);
            endPositions.push(endPos);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            color,
            size: 0.1,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update particle positions
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                const start = startPositions[i];
                const end = endPositions[i];
                
                // Ease progress for smooth movement
                const ease = Math.sin(progress * Math.PI);
                
                positions[i * 3] = start.x + (end.x - start.x) * ease;
                positions[i * 3 + 1] = start.y + (end.y - start.y) * ease;
                positions[i * 3 + 2] = start.z + (end.z - start.z) * ease;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Update opacity
            material.opacity = 1 - Math.abs(progress - 0.5) * 2;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Cleanup
                this.scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
    
    /**
     * Create a level up effect around a monster
     * @param {Object} monster - Target monster
     * @param {Object} options - Effect options
     */
    createLevelUpEffect(monster, options = {}) {
        const {
            color = 0xffff00,
            duration = 1.5,
            ringCount = 3
        } = options;
        
        const center = monster.mesh.position.clone();
        const rings = [];
        
        // Create rings
        for (let i = 0; i < ringCount; i++) {
            const geometry = new THREE.RingGeometry(0.3, 0.35, 32);
            const material = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                side: THREE.DoubleSide
            });
            
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(center);
            ring.rotation.x = Math.PI / 2;
            
            this.scene.add(ring);
            rings.push(ring);
        }
        
        // Animate rings
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            rings.forEach((ring, index) => {
                // Scale ring
                const scale = 1 + (progress * 2);
                ring.scale.set(scale, scale, 1);
                
                // Move ring up
                ring.position.y = center.y + (progress * 2);
                
                // Rotate ring
                ring.rotation.z = progress * Math.PI * 4;
                
                // Update opacity with offset for each ring
                const ringProgress = (progress + (index * 0.2)) % 1;
                ring.material.opacity = 1 - ringProgress;
            });
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Cleanup
                rings.forEach(ring => {
                    this.scene.remove(ring);
                    ring.geometry.dispose();
                    ring.material.dispose();
                });
            }
        };
        
        animate();
    }
    
    /**
     * Create a merge effect between two monsters
     * @param {Object} monster1 - First monster
     * @param {Object} monster2 - Second monster
     * @param {Object} options - Effect options
     */
    createMergeEffect(monster1, monster2, options = {}) {
        const {
            color = 0xff00ff,
            duration = 1,
            particleCount = 50
        } = options;
        
        // Calculate midpoint between monsters
        const midpoint = new THREE.Vector3().addVectors(
            monster1.mesh.position,
            monster2.mesh.position
        ).multiplyScalar(0.5);
        
        // Create particle system
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = [];
        
        // Initialize particles in a sphere around midpoint
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const radius = Math.random() * 0.5;
            
            positions[i * 3] = midpoint.x + (radius * Math.sin(phi) * Math.cos(theta));
            positions[i * 3 + 1] = midpoint.y + (radius * Math.sin(phi) * Math.sin(theta));
            positions[i * 3 + 2] = midpoint.z + (radius * Math.cos(phi));
            
            // Velocity towards midpoint
            const pos = new THREE.Vector3(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );
            const vel = midpoint.clone().sub(pos).normalize().multiplyScalar(2);
            velocities.push(vel);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            color,
            size: 0.1,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        // Create particle system
        const particles = new THREE.Points(geometry, material);
        this.scene.add(particles);
        
        // Animate particles
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Update particle positions
            const positions = particles.geometry.attributes.position.array;
            
            for (let i = 0; i < particleCount; i++) {
                // Move particles towards midpoint
                positions[i * 3] += velocities[i].x * 0.016;
                positions[i * 3 + 1] += velocities[i].y * 0.016;
                positions[i * 3 + 2] += velocities[i].z * 0.016;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            
            // Update opacity
            material.opacity = 1 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Cleanup
                this.scene.remove(particles);
                geometry.dispose();
                material.dispose();
            }
        };
        
        animate();
    }
}