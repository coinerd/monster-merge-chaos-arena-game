/**
 * MonsterTypes.js - Defines all monster types and their properties
 * This provides a central data model for all monsters in the game
 */
class MonsterTypes {
    constructor() {
        // Monster type definitions with all required properties
        this.types = {
            // Tier 1: Slime
            1: {
                id: 1,
                name: "Slime",
                tier: 1,
                color: 0x4ade80,
                secondaryColor: 0x22c55e,
                eyeColor: 0x000000,
                scale: 0.7,
                baseAttack: 5,
                baseDefense: 2,
                baseHealth: 20,
                geometryType: "slime",
                materialProperties: {
                    roughness: 0.6,
                    metalness: 0.1,
                    transparent: false
                },
                special: {
                    blobby: true
                }
            },
            
            // Tier 2: Impling
            2: {
                id: 2,
                name: "Impling",
                tier: 2,
                color: 0x60a5fa,
                secondaryColor: 0x3b82f6, 
                eyeColor: 0xff0000,
                scale: 0.75,
                baseAttack: 10,
                baseDefense: 4,
                baseHealth: 30,
                geometryType: "impling",
                materialProperties: {
                    roughness: 0.5,
                    metalness: 0.2,
                    transparent: false
                },
                special: {
                    wings: true,
                    scaly: true
                }
            },
            
            // Tier 3: Ogroid
            3: {
                id: 3,
                name: "Ogroid",
                tier: 3,
                color: 0xa78bfa,
                secondaryColor: 0x8b5cf6,
                eyeColor: 0xffff00,
                scale: 0.8,
                baseAttack: 15,
                baseDefense: 8,
                baseHealth: 50,
                geometryType: "ogroid",
                materialProperties: {
                    roughness: 0.8,
                    metalness: 0.1,
                    transparent: false
                },
                special: {
                    rocky: true
                }
            },
            
            // Tier 4: Wraith
            4: {
                id: 4,
                name: "Wraith",
                tier: 4,
                color: 0x818cf8,
                secondaryColor: 0x6366f1,
                eyeColor: 0x00ffff,
                scale: 0.85,
                baseAttack: 25,
                baseDefense: 10,
                baseHealth: 70,
                geometryType: "wraith",
                materialProperties: {
                    roughness: 0.4,
                    metalness: 0.3,
                    transparent: true,
                    opacity: 0.8
                },
                special: {
                    ghostly: true,
                    ethereal: true
                }
            },
            
            // Tier 5: Drake
            5: {
                id: 5,
                name: "Drake",
                tier: 5,
                color: 0xfb7185,
                secondaryColor: 0xf43f5e,
                eyeColor: 0x00ff00,
                scale: 0.9,
                baseAttack: 40,
                baseDefense: 15,
                baseHealth: 100,
                geometryType: "drake",
                materialProperties: {
                    roughness: 0.6,
                    metalness: 0.4,
                    transparent: false
                },
                special: {
                    wings: true,
                    tail: true,
                    scaly: true
                }
            },
            
            // Tier 6: Demon
            6: {
                id: 6,
                name: "Demon",
                tier: 6,
                color: 0xf87171,
                secondaryColor: 0xef4444,
                eyeColor: 0x0000ff,
                scale: 0.95,
                baseAttack: 60,
                baseDefense: 25,
                baseHealth: 150,
                geometryType: "demon",
                materialProperties: {
                    roughness: 0.5,
                    metalness: 0.6,
                    transparent: false
                },
                special: {
                    horns: true,
                    wings: true,
                    demonic: true
                }
            },
            
            // Tier 7: Hydra
            7: {
                id: 7,
                name: "Hydra",
                tier: 7,
                color: 0x34d399,
                secondaryColor: 0x10b981,
                eyeColor: 0xff00ff,
                scale: 1.0,
                baseAttack: 90,
                baseDefense: 35,
                baseHealth: 200,
                geometryType: "hydra",
                materialProperties: {
                    roughness: 0.7,
                    metalness: 0.3,
                    transparent: false
                },
                special: {
                    multipleHeads: 5,
                    scaly: true
                }
            },
            
            // Tier 8: Golem
            8: {
                id: 8,
                name: "Golem",
                tier: 8,
                color: 0x94a3b8,
                secondaryColor: 0x64748b,
                eyeColor: 0xff3300,
                scale: 1.1,
                baseAttack: 130,
                baseDefense: 60,
                baseHealth: 300,
                geometryType: "golem",
                materialProperties: {
                    roughness: 0.9,
                    metalness: 0.7,
                    transparent: false
                },
                special: {
                    rocky: true,
                    heavyArmor: true
                }
            },
            
            // Tier 9: Dragon
            9: {
                id: 9,
                name: "Dragon",
                tier: 9,
                color: 0xfacc15,
                secondaryColor: 0xeab308,
                eyeColor: 0x330066,
                scale: 1.2,
                baseAttack: 200,
                baseDefense: 80,
                baseHealth: 500,
                geometryType: "dragon",
                materialProperties: {
                    roughness: 0.6,
                    metalness: 0.8,
                    transparent: false
                },
                special: {
                    wings: true,
                    tail: true,
                    breathWeapon: "fire",
                    scaly: true
                }
            }
        };
    }
}

// Create a global instance for easy access
const monsterTypes = new MonsterTypes();