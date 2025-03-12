# Monster System Documentation

## Overview

The Monster System is responsible for creating, managing, and rendering all monsters in the game. It handles monster properties, 3D models, and visual enhancements. The system is composed of several classes that work together to provide a complete monster management solution.

## Key Components

### MonsterManager

Located in: `js/monster/MonsterManager.js`

The MonsterManager is the main entry point for monster-related operations. It coordinates between the various monster subsystems and provides a simplified API for the rest of the game.

#### Methods

##### `createMonster(tier)`
Creates a new monster of the specified tier.

**Parameters:**
- `tier` (Number): The tier of the monster to create

**Returns:**
- `Object`: A monster object with mesh, properties, and stats

```javascript
const monster = monsterManager.createMonster(3); // Create a tier 3 monster
```

##### `enhanceMonsterAppearance(monster, waveNumber)`
Enhances a monster's appearance based on the wave number.

**Parameters:**
- `monster` (Object): The monster object to enhance
- `waveNumber` (Number): The current wave number

```javascript
monsterManager.enhanceMonsterAppearance(monster, 5); // Enhance for wave 5
```

##### `getMonsterStats(tier, isEnemy, waveNumber)`
Gets the stats for a monster based on tier, whether it's an enemy, and the wave number.

**Parameters:**
- `tier` (Number): The tier of the monster
- `isEnemy` (Boolean): Whether the monster is an enemy
- `waveNumber` (Number, optional): The current wave number (for enemy scaling)

**Returns:**
- `Object`: Monster stats including health, attack, defense

```javascript
const stats = monsterManager.getMonsterStats(4, true, 7); // Enemy tier 4 stats for wave 7
```

### MonsterFactory

Located in: `js/monster/MonsterFactory.js`

The MonsterFactory creates monster instances with the appropriate properties and 3D models.

#### Methods

##### `createMonster(type, tier, isEnemy, waveNumber)`
Creates a monster with the specified parameters.

**Parameters:**
- `type` (String): The type of monster to create
- `tier` (Number): The tier of the monster
- `isEnemy` (Boolean): Whether the monster is an enemy
- `waveNumber` (Number, optional): The current wave number (for enemy scaling)

**Returns:**
- `Object`: A monster object with mesh, properties, and stats

```javascript
const monster = monsterFactory.createMonster('slime', 2, false); // Create a player tier 2 slime
```

### MonsterGeometryFactory

Located in: `js/monster/MonsterGeometryFactory.js`

The MonsterGeometryFactory creates and manages 3D geometries for monsters.

#### Methods

##### `createMonsterGeometry(type, tier)`
Creates a 3D geometry for a monster based on type and tier.

**Parameters:**
- `type` (String): The type of monster
- `tier` (Number): The tier of the monster

**Returns:**
- `THREE.Geometry`: A THREE.js geometry for the monster

```javascript
const geometry = monsterGeometryFactory.createMonsterGeometry('golem', 5);
```

##### `applyVisualEnhancements(mesh, enhancements)`
Applies visual enhancements to a monster mesh.

**Parameters:**
- `mesh` (THREE.Mesh): The monster mesh to enhance
- `enhancements` (Object): Object containing enhancement parameters

```javascript
monsterGeometryFactory.applyVisualEnhancements(monster.mesh, {
    scale: 1.5,
    color: 0xff0000,
    emissive: 0x330000,
    glow: true
});
```

### MonsterTypes

Located in: `js/monster/MonsterTypes.js`

The MonsterTypes module defines the different types of monsters available in the game and their properties.

#### Monster Type Definition

```javascript
{
    name: 'Slime',
    baseHealth: 50,
    baseAttack: 10,
    baseDefense: 5,
    scaleFactors: {
        health: 1.5,
        attack: 1.3,
        defense: 1.2
    },
    modelPath: 'models/monsters/slime.glb'
}
```

## Monster Properties

Each monster object has the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `String` | Unique identifier for the monster |
| `type` | `String` | The type of monster (e.g., 'slime', 'dragon') |
| `tier` | `Number` | The tier of the monster (1-11) |
| `health` | `Number` | Current health points |
| `maxHealth` | `Number` | Maximum health points |
| `attack` | `Number` | Attack power |
| `defense` | `Number` | Defense power |
| `isEnemy` | `Boolean` | Whether the monster is an enemy |
| `mesh` | `THREE.Mesh` | The 3D mesh representing the monster |

## Visual Enhancement System

As waves progress, enemy monsters receive visual enhancements to indicate their increased power:

1. **Size Scaling**: Monsters grow larger with higher wave numbers
2. **Color Shifts**: Colors become more intense or shift to indicate power
3. **Material Changes**: Materials may become more reflective or transparent
4. **Glow Effects**: Higher-wave monsters may emit light or have glow effects

### Enhancement Parameters

The visual enhancement system accepts the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `scale` | `Number` | Size multiplier for the monster |
| `color` | `Number` | Hex color value for the monster's material |
| `emissive` | `Number` | Hex color value for emissive (glowing) parts |
| `opacity` | `Number` | Transparency level (0-1) |
| `metalness` | `Number` | Metallic appearance level (0-1) |
| `roughness` | `Number` | Surface roughness level (0-1) |
| `glow` | `Boolean` | Whether to add a glow effect |

## Wave Scaling

Enemy monsters scale in power based on the current wave number:

1. **Stat Scaling**: Health, attack, and defense increase with wave number
2. **Tier Scaling**: Higher waves include higher-tier monsters
3. **Count Scaling**: Higher waves may include more monsters

The scaling formula is:

```
scaledStat = baseStat * (1 + (waveNumber - 1) * scaleFactor)
```

## Usage Examples

### Creating a Player Monster

```javascript
// Create a tier 3 monster for the player
const playerMonster = monsterManager.createMonster(3);

// Place it on the grid
gridManager.placeMonsterAt(playerMonster, 2, 2);
```

### Creating Enemy Monsters for a Wave

```javascript
// Generate enemies for wave 5
const enemies = [];
for (let i = 0; i < 3; i++) {
    const tier = Math.min(5, 1 + Math.floor(Math.random() * 3));
    const enemy = monsterManager.createMonster(tier, true, 5);
    enemies.push(enemy);
}
```

### Enhancing Monster Appearance

```javascript
// Enhance a monster's appearance for wave 8
monsterManager.enhanceMonsterAppearance(monster, 8);
```

## Best Practices

1. Always use the MonsterManager for creating and managing monsters
2. Don't modify monster properties directly; use the provided methods
3. When creating enemy monsters, always specify the current wave number to ensure proper scaling
4. Use the enhanceMonsterAppearance method to make enemies visually distinct based on wave number
