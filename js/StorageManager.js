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
            unlockedMonsters: [1], // Start with tier 1 unlocked
            shopItems: []
        };
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
            return this.defaultState;
        }
        
        return JSON.parse(savedState);
    }

    /**
     * Reset the game state to default
     */
    resetGame() {
        localStorage.removeItem(this.storageKey);
    }
}