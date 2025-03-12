# Monster Merge Chaos Arena - Developer Documentation

## Game Overview

Monster Merge Chaos Arena is a grid-based monster merging and battling game. The core gameplay revolves around purchasing monsters, placing them on a 5x5 grid, merging same-tier monsters to create higher-tier creatures, and battling against waves of enemy monsters.

### Key Game Features

1. **Monster Merging System**: Players can merge two monsters of the same tier to create a monster of the next tier.
2. **Grid-Based Gameplay**: Monsters are placed and managed on a 5x5 grid.
3. **Shop System**: Players can purchase monsters of various tiers using coins earned from battles.
4. **Wave-Based Combat**: Players battle against increasingly difficult waves of enemy monsters.
5. **Visual Progression**: Enemies become visually distinct and more challenging as waves progress.
6. **Save System**: Game state is automatically saved to local storage.

## System Architecture

The game is built using JavaScript with THREE.js for 3D rendering. It follows a modular architecture with clear separation of concerns between different game systems.

### High-Level Architecture

```
                   +----------------+
                   |   Game (main)  |
                   +-------+--------+
                           |
           +---------------+---------------+
           |               |               |
+----------v-----+ +-------v-------+ +-----v----------+
| GridManager    | | CombatManager | | UIManager      |
+----------------+ +---------------+ +----------------+
| - Grid cells   | | - Waves       | | - Overlays     |
| - Monster      | | - Battles     | | - Health bars  |
|   placement    | | - Rewards     | | - Notifications|
| - Merging      | | - Enemy       | | - Animations   |
+------+---------+ |   generation  | +------+---------+
       |           +-------+-------+        |
       |                   |                |
+------v---------+ +-------v-------+ +------v---------+
| MergeManager   | | WaveManager   | | OverlayManager |
| DragDropManager| | BattleSimulator| | HealthBarManager|
| GridCellManager| | BattleAnimator| | AnimationManager|
+----------------+ +---------------+ +----------------+
```

### Core Components

1. **Game Class (main.js)**
   - Central controller for the entire game
   - Manages game state, player stats, and coordinates between other managers
   - Handles high-level game functions like starting battles and purchasing monsters

2. **GridManager**
   - Manages the 5x5 game grid and all monsters placed on it
   - Handles grid cell highlighting and monster placement
   - Coordinates with sub-managers for specific functionality:
     - GridCellManager: Handles grid cell creation and positioning
     - MergeManager: Handles monster merging logic
     - DragDropManager: Handles drag and drop interactions

3. **CombatManager**
   - Manages battle mechanics between player monsters and enemy waves
   - Coordinates with sub-managers:
     - WaveManager: Generates enemy waves with appropriate difficulty scaling
     - BattleSimulator: Simulates battle outcomes
     - BattleAnimator: Handles visual battle animations

4. **UIManager**
   - Manages all UI elements and user interactions
   - Coordinates with sub-managers:
     - OverlayManager: Handles modal overlays (shop, battle results)
     - HealthBarManager: Manages monster health bars
     - NotificationManager: Displays notifications to the player
     - AnimationManager: Handles UI animations

5. **MonsterManager**
   - Creates and manages monster objects
   - Handles monster models, properties, and stats
   - Works with:
     - MonsterFactory: Creates monster instances
     - MonsterGeometryFactory: Generates monster 3D models
     - MonsterTypes: Defines monster types and properties

6. **SceneManager**
   - Manages the THREE.js scene, camera, and renderer
   - Handles scene setup, lighting, and rendering loop

7. **StorageManager**
   - Handles saving and loading game state from local storage

### Data Flow

1. **User Interactions** → **UIManager** → **Game** → (Appropriate Manager)
2. **Game State Changes** → **Game** → **StorageManager** → Local Storage
3. **Combat** → **CombatManager** → **BattleSimulator** → **Game** (for rewards) → **UIManager** (for display)
4. **Monster Creation** → **MonsterManager** → **MonsterFactory** → **GridManager** (for placement)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Rendering**: THREE.js
- **Storage**: Browser LocalStorage API
- **Development Server**: Node.js
- **Version Control**: Git

## File Structure

```
monster_merge_chaos_arena/
├── css/
│   └── styles.css
├── js/
│   ├── combat/
│   │   ├── BattleAnimator.js
│   │   ├── BattleSimulator.js
│   │   └── WaveManager.js
│   ├── grid/
│   │   ├── DragDropManager.js
│   │   ├── GridCellManager.js
│   │   └── MergeManager.js
│   ├── monster/
│   │   ├── MonsterFactory.js
│   │   ├── MonsterGeometryFactory.js
│   │   ├── MonsterManager.js
│   │   ├── MonsterModels.js
│   │   └── MonsterTypes.js
│   ├── ui/
│   │   ├── AnimationManager.js
│   │   ├── HealthBarManager.js
│   │   ├── NotificationManager.js
│   │   └── OverlayManager.js
│   ├── CombatManager.js
│   ├── GridManager.js
│   ├── SceneManager.js
│   ├── StorageManager.js
│   ├── UIManager.js
│   └── main.js
├── models/
│   └── monsters/
│       ├── slime.glb
│       ├── impling.glb
│       └── ... (other monster models)
├── index.html
├── server.js
└── package.json
```

## Next Steps for Development

1. **Enhanced Monster Variety**: Add more monster types with unique abilities
2. **Special Abilities**: Implement special abilities for higher-tier monsters
3. **Advanced Battle Mechanics**: Add status effects, elemental damage, etc.
4. **Progression System**: Implement player levels and unlockable content
5. **Multiplayer Features**: Add PvP battles or cooperative gameplay
6. **Mobile Support**: Optimize for mobile devices with touch controls

---

In the following sections, we will provide detailed documentation for each component of the game, including class methods, parameters, and usage examples.
