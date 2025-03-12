# Game Class Documentation

## Overview

The `Game` class serves as the central controller for Monster Merge Chaos Arena. It coordinates all game systems, manages player state, and handles high-level game functions like starting battles and purchasing monsters.

## Class Definition

Located in: `js/main.js`

```javascript
class Game {
    constructor() {
        // Initialize game systems and state
    }
    
    // Methods...
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `sceneManager` | `SceneManager` | Manages the THREE.js scene, camera, and renderer |
| `storageManager` | `StorageManager` | Handles saving and loading game state |
| `monsterManager` | `MonsterManager` | Creates and manages monster objects |
| `gridManager` | `GridManager` | Manages the game grid and monster placement |
| `combatManager` | `CombatManager` | Handles battle mechanics and enemy waves |
| `uiManager` | `UIManager` | Manages UI elements and user interactions |
| `gameState` | `Object` | Current game state data |
| `coins` | `Number` | Player's current coin count |
| `wave` | `Number` | Current wave number |
| `highestTier` | `Number` | Highest monster tier achieved |
| `unlockedMonsters` | `Array<Number>` | Array of unlocked monster tiers |
| `inBattle` | `Boolean` | Whether a battle is in progress |

## Methods

### Initialization

#### `init()`
Initializes the game and all its components.

```javascript
game.init();
```

#### `loadGameState()`
Loads the saved game state from local storage.

```javascript
game.loadGameState();
```

#### `saveGameState()`
Saves the current game state to local storage.

```javascript
game.saveGameState();
```

### Monster Management

#### `buyMonster(tier)`
Purchases a monster of the specified tier and places it on the grid.

**Parameters:**
- `tier` (Number): The tier of the monster to buy

**Returns:**
- `Boolean`: Whether the purchase was successful

```javascript
const success = game.buyMonster(5); // Buy a tier 5 monster
```

#### `purchaseMonster(tier)`
Alias for `buyMonster()` to maintain compatibility with the OverlayManager.

**Parameters:**
- `tier` (Number): The tier of the monster to buy

**Returns:**
- `Boolean`: Whether the purchase was successful

```javascript
const success = game.purchaseMonster(5); // Buy a tier 5 monster
```

#### `getUnlockedTiers()`
Gets the array of unlocked monster tiers.

**Returns:**
- `Array<Number>`: Array of unlocked monster tiers

```javascript
const tiers = game.getUnlockedTiers(); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
```

### Combat

#### `startBattle()`
Starts a battle with the current monsters on the grid.

```javascript
game.startBattle();
```

#### `removeDefeatedMonsters()`
Removes monsters with zero health from the grid.

```javascript
game.removeDefeatedMonsters();
```

### Game State Management

#### `getCoins()`
Gets the player's current coin count.

**Returns:**
- `Number`: Current coin count

```javascript
const coins = game.getCoins(); // 150
```

#### `addCoins(amount)`
Adds coins to the player's total.

**Parameters:**
- `amount` (Number): Amount of coins to add

```javascript
game.addCoins(50); // Add 50 coins
```

#### `restartGame()`
Resets the game to its initial state.

```javascript
game.restartGame();
```

## Events

The Game class responds to the following events:

- **Window Load**: Initializes the game
- **Window Resize**: Updates the scene dimensions
- **Animation Frame**: Updates the game state and renders the scene

## Usage Example

```javascript
// Initialize the game
const game = new Game();
game.init();

// Buy a monster and place it on the grid
if (game.buyMonster(3)) {
    console.log("Successfully purchased a tier 3 monster!");
}

// Start a battle
game.startBattle();

// Save the game state
game.saveGameState();
```

## Integration with Other Systems

The Game class interacts with all other systems in the game:

- Uses `GridManager` to place and manage monsters on the grid
- Uses `CombatManager` to handle battles and enemy waves
- Uses `UIManager` to update UI elements and display notifications
- Uses `MonsterManager` to create and manage monster objects
- Uses `StorageManager` to save and load game state
- Uses `SceneManager` to manage the THREE.js scene and rendering

## Best Practices

1. Always use the Game class methods to modify game state rather than modifying properties directly
2. Call `saveGameState()` after making significant changes to ensure progress is saved
3. Use the appropriate manager classes for specific functionality rather than implementing it in the Game class
