/**
 * StorageManager handles saving and loading game state using localStorage
 */
class StorageManager {
    constructor() {
        this.storageKey = 'monsterMergeChaosArena';
        this.defaultState = {
            grid: Array(5).fill().map(() => Array(5).fill(null)),
            coins: 100,
            wave: 1,
            highestTier: 1,
            unlockedMonsters: [1, 2, 3, 4, 5], // Start with tiers 1-5 unlocked for testing
            shopItems: [] // Will be generated in loadGame
        };
    }

    /**
     * Generate shop items based on unlocked tiers
     * @param {Array} unlockedTiers - Array of unlocked monster tiers
     * @returns {Array} Array of shop items
     */
    generateShopItems(unlockedTiers) {
        if (!unlockedTiers || !Array.isArray(unlockedTiers) || unlockedTiers.length === 0) {
            unlockedTiers = [1]; // Default to tier 1 if no tiers are provided
        }
        
        // Ensure we're only using valid, unique tiers
        const validTiers = [...new Set(unlockedTiers)].filter(tier => tier >= 1 && tier <= 10);
        
        // Create one shop item for each unlocked tier
        return validTiers.map(tier => ({
            tier: tier,
            cost: tier * 10 // Cost based on tier
        }));
    }

    /**
     * Save the current game state to localStorage
     * @param {Object} state - Current game state
     */
    saveGame(state) {
        // Convert grid to serializable format (monster objects aren't directly serializable)
        const serializableState = {
            ...state,
            grid: state.grid.map(row => 
                row.map(cell => 
                    cell ? {
                        tier: cell.tier,
                        attack: cell.attack,
                        defense: cell.defense,
                        health: cell.health,
                        maxHealth: cell.maxHealth,
                        id: cell.id
                    } : null
                )
            )
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(serializableState));
    }

    /**
     * Load the game state from localStorage
     * @returns {Object} The loaded game state
     */
    loadGame() {
        const savedState = localStorage.getItem(this.storageKey);
        
        if (!savedState) {
            const defaultState = { ...this.defaultState };
            // Generate shop items for the default state
            defaultState.shopItems = this.generateShopItems(defaultState.unlockedMonsters);
            return defaultState;
        }
        
        const parsedState = JSON.parse(savedState);
        
        // Ensure unlockedMonsters exists and is an array
        if (!parsedState.unlockedMonsters || !Array.isArray(parsedState.unlockedMonsters)) {
            parsedState.unlockedMonsters = [1, 2, 3, 4, 5]; // Default tiers for testing
        }
        
        // Always regenerate shop items based on current unlocked monsters
        parsedState.shopItems = this.generateShopItems(parsedState.unlockedMonsters);
        
        return parsedState;
    }

    /**
     * Reset the game state to default
     */
    resetGame() {
        localStorage.removeItem(this.storageKey);
    }
}