# UI System Documentation

## Overview

The UI System manages all user interface elements and interactions in Monster Merge Chaos Arena. It handles overlays, health bars, notifications, animations, and user input. The system is designed to be modular, with separate managers for specific UI components.

## Key Components

### UIManager

Located in: `js/UIManager.js`

The UIManager is the main entry point for UI-related operations. It coordinates between the various UI subsystems and provides a simplified API for the rest of the game.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `overlayManager` | `OverlayManager` | Manages modal overlays like the shop and battle results |
| `healthBarManager` | `HealthBarManager` | Manages monster health bars |
| `notificationManager` | `NotificationManager` | Displays notifications to the player |
| `animationManager` | `AnimationManager` | Handles UI animations |
| `domElements` | `Object` | References to DOM elements |

#### Methods

##### `init()`
Initializes the UI system and all its components.

```javascript
uiManager.init();
```

##### `updateMoneyDisplay(amount)`
Updates the money display with the specified amount.

**Parameters:**
- `amount` (Number): The amount of money to display

```javascript
uiManager.updateMoneyDisplay(150);
```

##### `updateWaveDisplay(wave)`
Updates the wave display with the specified wave number.

**Parameters:**
- `wave` (Number): The wave number to display

```javascript
uiManager.updateWaveDisplay(5);
```

##### `showNotification(message, type)`
Shows a notification to the player.

**Parameters:**
- `message` (String): The notification message
- `type` (String, optional): The type of notification ('info', 'success', 'warning', 'error')

```javascript
uiManager.showNotification('Not enough coins!', 'error');
```

##### `showBattleResults(results)`
Shows the battle results overlay.

**Parameters:**
- `results` (Object): The battle results object

```javascript
uiManager.showBattleResults(battleResults);
```

##### `showShop(availableTiers, coins)`
Shows the shop overlay with available monster tiers.

**Parameters:**
- `availableTiers` (Array): Array of available monster tiers
- `coins` (Number): Player's current coin count

```javascript
uiManager.showShop([1, 2, 3, 4, 5], 200);
```

### OverlayManager

Located in: `js/ui/OverlayManager.js`

The OverlayManager handles modal overlays like the shop and battle results.

#### Methods

##### `openShop(availableMonsters, coins)`
Opens the shop overlay with available monsters.

**Parameters:**
- `availableMonsters` (Array): Array of available monster tiers
- `coins` (Number): Player's current coin count

```javascript
overlayManager.openShop([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 300);
```

##### `closeShop()`
Closes the shop overlay.

```javascript
overlayManager.closeShop();
```

##### `showBattleResults(results, rewards)`
Shows the battle results overlay.

**Parameters:**
- `results` (Object): The battle results object
- `rewards` (Object): The rewards object

```javascript
overlayManager.showBattleResults(results, rewards);
```

##### `closeBattleResults()`
Closes the battle results overlay.

```javascript
overlayManager.closeBattleResults();
```

##### `showGameOver(finalWave, finalScore)`
Shows the game over overlay.

**Parameters:**
- `finalWave` (Number): The final wave reached
- `finalScore` (Number): The final score

```javascript
overlayManager.showGameOver(12, 1500);
```

### HealthBarManager

Located in: `js/ui/HealthBarManager.js`

The HealthBarManager creates and updates health bars for monsters.

#### Methods

##### `createHealthBar(monster)`
Creates a health bar for a monster.

**Parameters:**
- `monster` (Object): The monster object

**Returns:**
- `Object`: The health bar object

```javascript
const healthBar = healthBarManager.createHealthBar(monster);
```

##### `updateHealthBar(monster)`
Updates a monster's health bar.

**Parameters:**
- `monster` (Object): The monster object

```javascript
healthBarManager.updateHealthBar(monster);
```

##### `removeHealthBar(monster)`
Removes a monster's health bar.

**Parameters:**
- `monster` (Object): The monster object

```javascript
healthBarManager.removeHealthBar(monster);
```

##### `hideHealthBars()`
Hides all health bars (useful when opening overlays).

```javascript
healthBarManager.hideHealthBars();
```

##### `showHealthBars()`
Shows all health bars (useful when closing overlays).

```javascript
healthBarManager.showHealthBars();
```

### NotificationManager

Located in: `js/ui/NotificationManager.js`

The NotificationManager displays notifications to the player.

#### Methods

##### `showNotification(message, type, duration)`
Shows a notification to the player.

**Parameters:**
- `message` (String): The notification message
- `type` (String, optional): The type of notification ('info', 'success', 'warning', 'error')
- `duration` (Number, optional): Duration in milliseconds to show the notification

```javascript
notificationManager.showNotification('Monster purchased!', 'success', 3000);
```

##### `clearNotifications()`
Clears all active notifications.

```javascript
notificationManager.clearNotifications();
```

### AnimationManager

Located in: `js/ui/AnimationManager.js`

The AnimationManager handles UI animations.

#### Methods

##### `animateCoins(amount, startPosition, endPosition)`
Animates coins flying from one position to another.

**Parameters:**
- `amount` (Number): The amount of coins
- `startPosition` (Object): The starting position {x, y}
- `endPosition` (Object): The ending position {x, y}

**Returns:**
- `Promise`: Resolves when the animation is complete

```javascript
await animationManager.animateCoins(50, {x: 100, y: 200}, {x: 50, y: 50});
```

##### `animateNumber(element, startValue, endValue, duration)`
Animates a number changing from one value to another.

**Parameters:**
- `element` (HTMLElement): The element to animate
- `startValue` (Number): The starting value
- `endValue` (Number): The ending value
- `duration` (Number): Duration in milliseconds

**Returns:**
- `Promise`: Resolves when the animation is complete

```javascript
await animationManager.animateNumber(coinDisplay, 100, 150, 1000);
```

## UI Components

### Shop Overlay

The shop overlay allows players to purchase monsters of different tiers. It displays:

1. **Available Monsters**: Monsters that the player has unlocked
2. **Monster Prices**: The cost of each monster (tier * 10)
3. **Affordability**: Visual indication of which monsters the player can afford

```javascript
// Open the shop with available tiers and current coins
overlayManager.openShop([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 200);

// When a monster is purchased
game.buyMonster(tier);

// Close the shop
overlayManager.closeShop();
```

### Battle Results Overlay

The battle results overlay displays the outcome of a battle. It shows:

1. **Victory/Defeat**: Whether the player won or lost
2. **Rewards**: Coins earned from the battle
3. **Wave Progress**: The current wave number
4. **Surviving Monsters**: How many player monsters survived

```javascript
// Show battle results
overlayManager.showBattleResults({
    victory: true,
    remainingPlayerMonsters: [monster1, monster2],
    battleLog: [...],
}, {
    coins: 100,
    unlockedTier: 5
});

// When continue button is clicked
overlayManager.closeBattleResults();
```

### Health Bars

Health bars display the current health of monsters. They:

1. **Follow Monsters**: Stay positioned above their respective monsters
2. **Update Dynamically**: Reflect changes in monster health
3. **Color Coding**: Change color based on health percentage (green to red)
4. **Hide During Overlays**: Automatically hide when overlays are open

```javascript
// Create a health bar for a monster
healthBarManager.createHealthBar(monster);

// Update a health bar when monster takes damage
healthBarManager.updateHealthBar(monster);

// Remove a health bar when monster is removed
healthBarManager.removeHealthBar(monster);

// Hide all health bars when opening an overlay
healthBarManager.hideHealthBars();

// Show all health bars when closing an overlay
healthBarManager.showHealthBars();
```

### Notifications

Notifications provide feedback to the player about game events. They:

1. **Appear Temporarily**: Show for a limited time then fade out
2. **Color Coding**: Different colors for different types of notifications
3. **Stack**: Multiple notifications can be visible at once

```javascript
// Show a notification
notificationManager.showNotification('Not enough coins!', 'error', 3000);

// Show a success notification
notificationManager.showNotification('Monster purchased!', 'success', 2000);

// Clear all notifications
notificationManager.clearNotifications();
```

## UI Events

The UI System handles various user events:

### Mouse Events

- **Click**: Selecting monsters, buttons, and UI elements
- **Drag**: Moving monsters on the grid
- **Hover**: Highlighting interactive elements

### Touch Events

- **Tap**: Equivalent to click for touch devices
- **Drag**: Equivalent to mouse drag for touch devices

### Keyboard Events

- **Escape**: Close open overlays
- **Space**: Start battle (when not in battle)

## Z-Index Management

The UI System manages z-index values to ensure proper layering of UI elements:

1. **Game World**: Base layer (z-index: 0)
2. **Health Bars**: Above game world (z-index: 10)
3. **Notifications**: Above health bars (z-index: 20)
4. **Overlays**: Highest layer (z-index: 30)

## Responsive Design

The UI System adapts to different screen sizes:

1. **Flexible Layouts**: UI elements resize based on screen dimensions
2. **Touch-Friendly**: Larger hit areas on touch devices
3. **Orientation Support**: Adapts to both landscape and portrait orientations

## Integration with Other Systems

The UI System interacts with several other systems:

- **Game**: The Game class uses the UI System to display game state and handle user input
- **CombatManager**: The UI System displays battle results from the Combat System
- **GridManager**: The UI System provides visual feedback for grid interactions
- **MonsterManager**: The UI System displays monster information and health

## Best Practices

1. Always use the UIManager methods to interact with the UI rather than manipulating DOM elements directly
2. Use the appropriate manager for specific UI functionality (OverlayManager for overlays, etc.)
3. Hide health bars when opening overlays to prevent z-index conflicts
4. Use notifications to provide feedback to the player about game events
5. Ensure UI elements are properly cleaned up when no longer needed to prevent memory leaks
