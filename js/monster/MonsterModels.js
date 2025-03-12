/**
 * MonsterModels.js - Defines the monster model configurations
 * This file maps monster types to their 3D model files and defines how to apply materials
 */
const monsterModels = {
    // Define model configurations for each monster type
    models: {
        "slime": {
            modelPath: "models/monsters/slime.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            // Fallback basic geometry for when model isn't loaded yet
            fallbackGeometry: "sphere",
            // Scale factor to apply to the loaded model
            scale: 1.0
        },
        "impling": {
            modelPath: "models/monsters/impling.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "wings", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "sphere",
            scale: 1.0
        },
        "ogroid": {
            modelPath: "models/monsters/ogroid.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "armor", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "cylinder",
            scale: 1.0
        },
        "wraith": {
            modelPath: "models/monsters/wraith.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary", transparent: true, opacity: 0.8 },
                { meshName: "cloak", materialType: "secondary", transparent: true, opacity: 0.7 },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "cone",
            scale: 1.0
        },
        "drake": {
            modelPath: "models/monsters/drake.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "wings", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "cylinder",
            scale: 1.0
        },
        "demon": {
            modelPath: "models/monsters/demon.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "horns", materialType: "secondary" },
                { meshName: "wings", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "sphere",
            scale: 1.2
        },
        "hydra": {
            modelPath: "models/monsters/hydra.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "spikes", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "cylinder",
            scale: 1.3
        },
        "golem": {
            modelPath: "models/monsters/golem.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "crystals", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "box",
            scale: 1.4
        },
        "dragon": {
            modelPath: "models/monsters/dragon.glb",
            materialMappings: [
                { meshName: "body", materialType: "primary" },
                { meshName: "wings", materialType: "secondary" },
                { meshName: "spikes", materialType: "secondary" },
                { meshName: "eyes", materialType: "eye" }
            ],
            fallbackGeometry: "cylinder",
            scale: 1.5
        }
    },
    
    // Map monster tiers to model types
    tierToModelMap: {
        1: "slime",
        2: "impling",
        3: "ogroid",
        4: "wraith",
        5: "drake",
        6: "demon",
        7: "hydra",
        8: "golem",
        9: "dragon"
    },
    
    // Get model configuration for a specific monster tier
    getModelForTier: function(tier) {
        const modelType = this.tierToModelMap[tier];
        return this.models[modelType];
    }
};