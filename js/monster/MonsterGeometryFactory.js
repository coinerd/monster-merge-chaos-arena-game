/**
 * MonsterGeometryFactory.js - Factory class for creating monster geometries
 * This centralizes all geometry creation code in one place and uses 3D models
 */
class MonsterGeometryFactory {
    constructor() {
        // Reference to the monster types
        this.monsterTypes = monsterTypes.types;
        
        // Cache for generated geometries
        this.geometryCache = {};
        
        // GLTF Loader for loading 3D models
        this.gltfLoader = new THREE.GLTFLoader();
        
        // Optional: Use Draco compression if models are compressed
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/libs/draco/');
        this.gltfLoader.setDRACOLoader(dracoLoader);
        
        // Keep track of which models are currently loading
        this.loadingModels = {};
        
        // Preload all monster models
        this.preloadModels();
    }
    
    /**
     * Preload all monster models to avoid delays during gameplay
     */
    preloadModels() {
        for (let tier = 1; tier <= 9; tier++) {
            const modelConfig = monsterModels.getModelForTier(tier);
            this.loadModel(modelConfig.modelPath);
        }
    }
    
    /**
     * Create a geometry for a monster based on its type
     * @param {number} tier - The monster tier (1-9)
     * @returns {THREE.Group} The 3D geometry group for the monster
     */
    createGeometry(tier) {
        // Use cached geometry if available
        if (this.geometryCache[tier]) {
            return this.geometryCache[tier].clone();
        }
        
        // Get the monster type data
        const monsterType = this.monsterTypes[tier];
        const modelConfig = monsterModels.getModelForTier(tier);
        
        // If model is being loaded, use fallback geometry
        if (this.loadingModels[modelConfig.modelPath]) {
            const fallbackGeometry = this.createFallbackGeometry(modelConfig.fallbackGeometry, monsterType);
            return fallbackGeometry;
        }
        
        // Try to load the model
        this.loadingModels[modelConfig.modelPath] = true;
        
        // Load model asynchronously
        this.loadModel(modelConfig.modelPath, (model) => {
            // Apply materials based on mapping
            this.applyMaterialsToModel(model, monsterType, modelConfig);
            
            // Apply scaling
            model.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
            
            // Cache the model for future use
            this.geometryCache[tier] = model;
            
            // Remove from loading models
            delete this.loadingModels[modelConfig.modelPath];
        });
        
        // Return fallback geometry while loading
        const fallbackGeometry = this.createFallbackGeometry(modelConfig.fallbackGeometry, monsterType);
        return fallbackGeometry;
    }
    
    /**
     * Load a 3D model from a file
     * @param {string} modelPath - Path to the model file
     * @param {Function} callback - Function to call when model is loaded
     */
    loadModel(modelPath, callback) {
        this.gltfLoader.load(
            modelPath,
            (gltf) => {
                const model = gltf.scene;
                
                if (callback) {
                    callback(model);
                }
            },
            // Progress callback
            (xhr) => {
                // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Error callback
            (error) => {
                console.error('Error loading monster model:', error);
                delete this.loadingModels[modelPath];
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
                // Find matching material mapping
                for (const mapping of modelConfig.materialMappings) {
                    if (node.name.includes(mapping.meshName)) {
                        // Apply the appropriate material
                        switch (mapping.materialType) {
                            case 'primary':
                                node.material = this.createMaterial(monsterType, false, mapping);
                                break;
                            case 'secondary':
                                node.material = this.createMaterial(monsterType, true, mapping);
                                break;
                            case 'eye':
                                node.material = this.createEyeMaterial(monsterType);
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
        
        return new THREE.MeshStandardMaterial({
            color: color,
            roughness: props.roughness || 0.5,
            metalness: props.metalness || 0.2,
            transparent: options.transparent || props.transparent || false,
            opacity: options.opacity || props.opacity || 1.0
        });
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
     * Create a simple fallback geometry to use while model is loading
     * @param {string} type - Type of geometry to create
     * @param {Object} monsterType - Monster type data
     * @returns {THREE.Group} The fallback geometry
     */
    createFallbackGeometry(type, monsterType) {
        const group = new THREE.Group();
        const material = this.createMaterial(monsterType);
        let mesh;
        
        switch (type) {
            case 'sphere':
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5, 12, 12),
                    material
                );
                break;
            case 'cylinder':
                mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.5, 0.8, 12),
                    material
                );
                break;
            case 'box':
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.7, 0.7, 0.7),
                    material
                );
                break;
            default:
                mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    material
                );
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        return group;
    }
}