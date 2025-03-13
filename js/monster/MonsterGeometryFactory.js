/**
 * MonsterGeometryFactory.js - Factory class for creating monster geometries
 * This centralizes all geometry creation code in one place and uses 3D models
 */
class MonsterGeometryFactory {
    constructor(textureManager) {
        // Reference to the monster types
        this.monsterTypes = monsterTypes.types;
        
        // Cache for generated geometries
        this.geometryCache = {};
        this.texturedFallbackCache = {};
        
        // GLTF Loader for loading 3D models
        this.gltfLoader = new THREE.GLTFLoader();
        
        // Optional: Use Draco compression if models are compressed
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Keep track of which models are currently loading
        this.loadingModels = {};
        
        // Create texture manager for monster textures
        this.textureManager = textureManager || new TextureManager();
        
        // Track whether real models are loaded
        this.modelsLoaded = false;
        
        // Preload all monster models
        this.preloadModels();
    }
    
    /**
     * Preload all monster models to avoid delays during gameplay
     */
    preloadModels() {
        for (let tier = 1; tier <= 9; tier++) {
            const modelConfig = monsterModels.getModelForTier(tier);
            this.loadModel(modelConfig.modelPath, tier);
        }
    }
    
    /**
     * Create a geometry for a monster based on its type
     * @param {number} tier - The monster tier (1-9)
     * @returns {THREE.Group} The 3D geometry group for the monster
     */
    createGeometry(tier) {
        // Get the monster type data
        const monsterType = this.monsterTypes[tier];
        const modelConfig = monsterModels.getModelForTier(tier);
        
        // Check if we have the real model loaded and cached
        if (this.geometryCache[tier]) {
            // Return a clone of the cached real model with materials applied
            const clonedModel = this.geometryCache[tier].clone();
            this.applyMaterialsToModel(clonedModel, monsterType, modelConfig);
            return clonedModel;
        }
        
        // If we don't have the real model, return a textured fallback
        // We'll use fallbacks that always have textures applied
        if (this.texturedFallbackCache[tier]) {
            return this.texturedFallbackCache[tier].clone();
        }
        
        // Create a new textured fallback
        const fallbackGeometry = this.createTexturedFallbackGeometry(modelConfig.fallbackGeometry, monsterType);
        
        // Cache it for future use
        this.texturedFallbackCache[tier] = fallbackGeometry.clone();
        
        // Also try to load the real model if it's not already loading
        if (!this.loadingModels[modelConfig.modelPath]) {
            // Set loading flag
            this.loadingModels[modelConfig.modelPath] = true;
            
            // Load model asynchronously
            this.loadModel(modelConfig.modelPath, tier);
        }
        
        return fallbackGeometry;
    }
    
    /**
     * Load a 3D model from a file
     * @param {string} modelPath - Path to the model file
     * @param {number} tier - The monster tier associated with this model
     */
    loadModel(modelPath, tier) {
        const monsterType = this.monsterTypes[tier];
        const modelConfig = monsterModels.getModelForTier(tier);
        
        this.gltfLoader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                
                // Apply materials to the model
                this.applyMaterialsToModel(model, monsterType, modelConfig);
                
                // Apply scaling
                model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
                
                // Cache the model for future use
                this.geometryCache[tier] = model;
                
                // Remove from loading models
                delete this.loadingModels[modelConfig.modelPath];
                
                // Set models loaded flag
                this.modelsLoaded = true;
                
                console.log(`Loaded 3D model for tier ${tier}`);
            },
            // Progress callback
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Error callback
            (error) => {
                console.error('Error loading monster model:', error);
                delete this.loadingModels[modelConfig.modelPath];
            }
        );
    }
    
    /**
     * Apply materials to a loaded model based on configuration
     * @param {THREE.Group} model - The model to apply materials to
     * @param {Object} monsterType - Monster type data
     * @param {Object} modelConfig - Model configuration
     */
    applyMaterialsToModel(model, monsterType, modelConfig) {
        model.traverse((node) => {
            if (node.isMesh) {
                // Store the original name for material mapping
                if (!node.userData.originalName) {
                    node.userData.originalName = node.name;
                }
                
                // Find matching material mapping
                for (const mapping of modelConfig.materialMappings) {
                    if (node.userData.originalName.includes(mapping.meshName) || 
                        node.name.includes(mapping.meshName)) {
                        // Apply the appropriate material
                        switch (mapping.materialType) {
                            case 'primary':
                                node.material = this.createMaterial(monsterType, false, mapping);
                                node.material.name = 'primary';
                                break;
                            case 'secondary':
                                node.material = this.createMaterial(monsterType, true, mapping);
                                node.material.name = 'secondary';
                                break;
                            case 'eye':
                                node.material = this.createEyeMaterial(monsterType);
                                node.material.name = 'eye';
                                break;
                        }
                        break;
                    }
                }
            }
        });
    }
    
    /**
     * Create a material based on monster type properties
     * @param {Object} monsterType - The monster type data
     * @param {boolean} useSecondary - Whether to use secondary color
     * @param {Object} options - Additional material options
     * @returns {THREE.MeshStandardMaterial} The created material
     */
    createMaterial(monsterType, useSecondary = false, options = {}) {
        const color = useSecondary ? monsterType.secondaryColor : monsterType.color;
        const props = monsterType.materialProperties || {};
        
        // Convert color to hex string format for TextureManager
        const colorHex = '#' + color.toString(16).padStart(6, '0');
        
        // Determine texture type based on monster special properties
        let textureType = 'default';
        if (monsterType.special) {
            if (monsterType.special.blobby) textureType = 'slime';
            if (monsterType.special.rocky) textureType = 'rocky';
            if (monsterType.special.ghostly) textureType = 'ghostly';
            if (monsterType.special.wings || monsterType.special.tail) textureType = 'scaly';
        }
        
        // Generate texture for the monster
        const texture = this.textureManager.generateMonsterTexture(
            512,
            colorHex,
            {
                tier: monsterType.tier,
                textureType: textureType,
                roughness: props.roughness || 0.5,
                metalness: props.metalness || 0.2
            }
        );
        
        // Ensure texture is properly configured
        texture.needsUpdate = true;
        
        // Create material with the texture
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            color: color,
            roughness: props.roughness || 0.5,
            metalness: props.metalness || 0.2,
            transparent: options.transparent || props.transparent || false,
            opacity: options.opacity || props.opacity || 1.0
        });
        
        return material;
    }
    
    /**
     * Create eye material for a monster
     * @param {Object} monsterType - The monster type data
     * @returns {THREE.MeshStandardMaterial} The eye material
     */
    createEyeMaterial(monsterType) {
        return new THREE.MeshStandardMaterial({
            color: monsterType.eyeColor || 0x000000,
            roughness: 0.1,
            metalness: 0.8,
            emissive: monsterType.eyeColor || 0x000000,
            emissiveIntensity: 0.3
        });
    }
    
    /**
     * Create a textured fallback geometry to use while model is loading
     * @param {string} type - Type of geometry to create
     * @param {Object} monsterType - Monster type data
     * @returns {THREE.Group} The fallback geometry with textures applied
     */
    createTexturedFallbackGeometry(type, monsterType) {
        const group = new THREE.Group();
        const material = this.createMaterial(monsterType);
        let mesh;
        
        switch (type) {
            case 'sphere':
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5, 16, 16),
                    material
                );
                break;
            case 'cylinder':
                mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.5, 0.8, 16),
                    material
                );
                break;
            case 'box':
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 0.7, 0.7),
                    material
                );
                break;
            case 'cone':
                mesh = new THREE.Mesh(
                    new THREE.ConeGeometry(0.5, 1.0, 16),
                    material
                );
                break;
            default:
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    material
                );
        }
        
        // Add eyes to make it look more monster-like
        const eyeSize = 0.1;
        const eyeMaterial = this.createEyeMaterial(monsterType);
        
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(eyeSize, 8, 8),
            eyeMaterial
        );
        leftEye.position.set(0.2, 0.2, 0.4);
        
        const rightEye = new THREE.Mesh(
            new THREE.SphereGeometry(eyeSize, 8, 8),
            eyeMaterial
        );
        rightEye.position.set(-0.2, 0.2, 0.4);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        group.add(mesh);
        group.add(leftEye);
        group.add(rightEye);
        
        return group;
    }
    
    /**
     * Create a simple fallback geometry (deprecated, use createTexturedFallbackGeometry instead)
     */
    createFallbackGeometry(type, monsterType) {
        return this.createTexturedFallbackGeometry(type, monsterType);
    }
}