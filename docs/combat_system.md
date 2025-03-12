# Combat System Documentation

## Overview

The Combat System manages battles between player monsters and enemy waves. It handles enemy generation, battle mechanics, combat animations, and reward distribution. The system is designed to create progressively challenging waves with visually distinct enemies.

## Key Components

### CombatManager

Located in: `js/CombatManager.js`

The CombatManager is the main entry point for combat-related operations. It coordinates between the various combat subsystems and provides a simplified API for the rest of the game.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentWave` | `Number` | Current wave number |
| `enemies` | `Array<Object>` | Array of current enemy monsters |
| `playerMonsters` | `Array<Object>` | Array of player monsters in combat |
| `inBattle` | `Boolean` | Whether a battle is in progress |
| `battleSimulator` | `BattleSimulator` | Handles battle simulation logic |
| `battleAnimator` | `BattleAnimator` | Handles battle animations |
| `waveManager` | `WaveManager` | Manages wave progression and enemy generation |

#### Methods

##### `startBattle(playerMonsters, wave)`
Starts a battle with the specified player monsters and wave number.

**Parameters:**
- `playerMonsters` (Array): Array of player monster objects
- `wave` (Number): The wave number to battle against

```javascript
combatManager.startBattle(playerMonsters, 5);
```

##### `generateEnemyWave(wave)`
Generates an array of enemy monsters for the specified wave.

**Parameters:**
- `wave` (Number, optional): The wave number to generate enemies for. If not provided, uses the current wave.

**Returns:**
- `Array<Object>`: Array of enemy monster objects

```javascript
const enemies = combatManager.generateEnemyWave(3); // Generate enemies for wave 3
```

##### `advanceWave()`
Advances to the next wave and generates new enemies.

**Returns:**
- `Number`: The new wave number

```javascript
const newWave = combatManager.advanceWave(); // Advance to the next wave
```

##### `setCurrentWave(wave)`
Sets the current wave number.

**Parameters:**
- `wave` (Number): The wave number to set

```javascript
combatManager.setCurrentWave(7); // Set current wave to 7
```

##### `simulateBattle()`
Simulates a battle between player monsters and enemies.

**Returns:**
- `Object`: Battle results including victory status, remaining monsters, and rewards

```javascript
const results = combatManager.simulateBattle();
```

##### `getRewards(battleResults)`
Calculates rewards based on battle results.

**Parameters:**
- `battleResults` (Object): Battle results from simulateBattle

**Returns:**
- `Object`: Rewards including coins, experience, and unlocked tiers

```javascript
const rewards = combatManager.getRewards(battleResults);
```

### BattleSimulator

Located in: `js/combat/BattleSimulator.js`

The BattleSimulator handles the logic for simulating battles between player monsters and enemies.

#### Methods

##### `simulateBattle(playerMonsters, enemies)`
Simulates a battle between player monsters and enemies.

**Parameters:**
- `playerMonsters` (Array): Array of player monster objects
- `enemies` (Array): Array of enemy monster objects

**Returns:**
- `Object`: Battle results including victory status, remaining monsters, and battle log

```javascript
const results = battleSimulator.simulateBattle(playerMonsters, enemies);
```

##### `calculateDamage(attacker, defender)`
Calculates damage for an attack.

**Parameters:**
- `attacker` (Object): The attacking monster
- `defender` (Object): The defending monster

**Returns:**
- `Number`: The calculated damage

```javascript
const damage = battleSimulator.calculateDamage(monster1, monster2);
```

### BattleAnimator

Located in: `js/combat/BattleAnimator.js`

The BattleAnimator handles visual animations during battles.

#### Methods

##### `animateBattle(battleLog)`
Animates a battle based on the battle log.

**Parameters:**
- `battleLog` (Array): Array of battle events from the battle simulation

**Returns:**
- `Promise`: Resolves when the animation is complete

```javascript
await battleAnimator.animateBattle(battleLog);
```

##### `animateAttack(attacker, defender, damage)`
Animates an attack between two monsters.

**Parameters:**
- `attacker` (Object): The attacking monster
- `defender` (Object): The defending monster
- `damage` (Number): The damage dealt

**Returns:**
- `Promise`: Resolves when the animation is complete

```javascript
await battleAnimator.animateAttack(monster1, monster2, 25);
```

##### `animateDefeat(monster)`
Animates a monster being defeated.

**Parameters:**
- `monster` (Object): The defeated monster

**Returns:**
- `Promise`: Resolves when the animation is complete

```javascript
await battleAnimator.animateDefeat(monster);
```

### WaveManager

Located in: `js/combat/WaveManager.js`

The WaveManager handles wave progression and enemy generation.

#### Methods

##### `generateEnemyWave(wave)`
Generates an array of enemy monsters for the specified wave.

**Parameters:**
- `wave` (Number): The wave number to generate enemies for

**Returns:**
- `Array<Object>`: Array of enemy monster objects

```javascript
const enemies = waveManager.generateEnemyWave(5); // Generate enemies for wave 5
```

##### `getWaveDifficulty(wave)`
Gets the difficulty parameters for a wave.

**Parameters:**
- `wave` (Number): The wave number

**Returns:**
- `Object`: Difficulty parameters including enemy count, tier range, and scaling factors

```javascript
const difficulty = waveManager.getWaveDifficulty(8);
```

##### `enhanceEnemyAppearance(enemy, wave)`
Enhances an enemy's appearance based on the wave number.

**Parameters:**
- `enemy` (Object): The enemy monster to enhance
- `wave` (Number): The wave number

```javascript
waveManager.enhanceEnemyAppearance(enemy, 6);
```

## Wave Generation and Scaling

### Enemy Count Scaling

The number of enemies in a wave scales with the wave number:

```javascript
const enemyCount = Math.min(10, 2 + Math.floor(wave * 0.7));
```

This formula ensures that:
- Wave 1 has 2 enemies
- Each subsequent wave adds approximately 0.7 enemies
- The maximum number of enemies is capped at 10

### Enemy Tier Scaling

Enemy tiers scale with the wave number:

```javascript
const minTier = Math.min(10, 1 + Math.floor(wave * 0.3));
const maxTier = Math.min(11, minTier + 2);
const tier = minTier + Math.floor(Math.random() * (maxTier - minTier + 1));
```

This formula ensures that:
- Wave 1 has tier 1-3 enemies
- Each subsequent wave increases the minimum tier by approximately 0.3
- The maximum tier is capped at 11

### Enemy Stat Scaling

Enemy stats (health, attack, defense) scale with the wave number:

```javascript
const scaleFactor = 1 + (wave - 1) * 0.2;
monster.health *= scaleFactor;
monster.attack *= scaleFactor;
monster.defense *= scaleFactor;
```

This formula ensures that:
- Wave 1 enemies have base stats
- Each subsequent wave increases stats by approximately 20%

### Visual Enhancements

Enemies receive visual enhancements based on the wave number:

1. **Size Scaling**: `scale = 1 + (wave - 1) * 0.05` (5% larger per wave)
2. **Color Intensity**: Colors become more intense or shift with higher waves
3. **Material Properties**: Higher waves have more metallic or glowing materials
4. **Glow Effects**: Enemies in higher waves may emit light

## Battle Mechanics

### Turn-Based Combat

Battles are simulated in turns, with each monster taking an action in order of initiative:

1. Player monsters attack first, targeting random enemies
2. Enemies then attack, targeting random player monsters
3. This continues until all monsters on one side are defeated

### Damage Calculation

Damage is calculated using the following formula:

```javascript
const baseDamage = attacker.attack;
const damageReduction = defender.defense / (defender.defense + 50);
const damage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction)));
```

This formula ensures that:
- Higher attack results in more damage
- Higher defense reduces damage, but with diminishing returns
- Minimum damage is 1

### Battle Results

Battle results include:

- **Victory Status**: Whether the player won the battle
- **Remaining Monsters**: Monsters that survived the battle
- **Battle Log**: Detailed log of battle events
- **Rewards**: Coins, experience, and unlocked tiers

## Rewards System

Rewards are calculated based on battle results:

### Coin Rewards

```javascript
const baseReward = wave * 10;
const victoryMultiplier = victory ? 2 : 0.5;
const monsterBonus = remainingPlayerMonsters.length * 5;
const coins = Math.floor((baseReward + monsterBonus) * victoryMultiplier);
```

This formula ensures that:
- Higher waves give more coins
- Victory doubles the reward, defeat halves it
- Each surviving player monster adds a bonus

### Tier Unlocking

New monster tiers are unlocked based on wave progression:

```javascript
const unlockedTier = Math.min(11, 1 + Math.floor(wave / 2));
```

This formula ensures that:
- Tier 1 is unlocked from the start
- Each new tier is unlocked every 2 waves
- Maximum tier is 11

## Integration with Other Systems

The Combat System interacts with several other systems:

- **Game**: The Game class uses the Combat System to start battles and process rewards
- **GridManager**: The Combat System gets player monsters from the grid for battles
- **MonsterManager**: The Combat System uses the MonsterManager to create enemy monsters
- **UIManager**: The Combat System provides battle results to the UI for display

## Best Practices

1. Always use the CombatManager methods to interact with the combat system
2. When generating enemy waves, always specify the wave number to ensure proper scaling
3. Use the BattleAnimator to provide visual feedback during battles
4. Process battle rewards through the Game class to ensure proper state updates
