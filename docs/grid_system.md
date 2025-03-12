# Grid System Documentation

## Overview

The Grid System manages the 5x5 game grid where players place and merge monsters. It handles grid cell creation, monster placement, merging logic, and drag-and-drop interactions. The system is designed to be modular, with separate managers for specific functionality.

## Key Components

### GridManager

Located in: `js/GridManager.js`

The GridManager is the main entry point for grid-related operations. It coordinates between the various grid subsystems and provides a simplified API for the rest of the game.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `gridSize` | `Number` | Size of the grid (5x5) |
| `cellSize` | `Number` | Size of each cell in world units |
| `grid` | `Array<Array>` | 2D array representing the grid state |
| `cellManager` | `GridCellManager` | Manages grid cells and their visual representation |
| `mergeManager` | `MergeManager` | Handles monster merging logic |
| `dragDropManager` | `DragDropManager` | Manages drag-and-drop interactions |

#### Methods

##### `placeMonsterAt(monster, row, col)`
Places a monster at the specified grid position.

**Parameters:**
- `monster` (Object): The monster object to place
- `row` (Number): The row index (0-4)
- `col` (Number): The column index (0-4)

**Returns:**
- `Boolean`: Whether the placement was successful

```javascript
const success = gridManager.placeMonsterAt(monster, 2, 3);
```

##### `findEmptyCell()`
Finds an empty cell on the grid.

**Returns:**
- `Object|null`: Object with row and col properties, or null if no empty cell is found

```javascript
const emptyCell = gridManager.findEmptyCell();
if (emptyCell) {
    console.log(`Empty cell found at row ${emptyCell.row}, col ${emptyCell.col}`);
}
```

##### `getMonsterAt(row, col)`
Gets the monster at the specified grid position.

**Parameters:**
- `row` (Number): The row index (0-4)
- `col` (Number): The column index (0-4)

**Returns:**
- `Object|null`: The monster object at the specified position, or null if the cell is empty

```javascript
const monster = gridManager.getMonsterAt(1, 2);
```

##### `removeMonsterAt(row, col)`
Removes the monster at the specified grid position.

**Parameters:**
- `row` (Number): The row index (0-4)
- `col` (Number): The column index (0-4)

**Returns:**
- `Object|null`: The removed monster object, or null if the cell was already empty

```javascript
const removedMonster = gridManager.removeMonsterAt(3, 4);
```

##### `highlightValidDropCells(monster)`
Highlights cells where the given monster can be dropped (empty cells or cells with same-tier monsters).

**Parameters:**
- `monster` (Object): The monster being dragged

```javascript
gridManager.highlightValidDropCells(monster);
```

##### `resetCellHighlights()`
Resets all cell highlights.

```javascript
gridManager.resetCellHighlights();
```

##### `getAllMonsters()`
Gets all monsters currently on the grid.

**Returns:**
- `Array<Object>`: Array of all monster objects on the grid

```javascript
const allMonsters = gridManager.getAllMonsters();
```

### GridCellManager

Located in: `js/grid/GridCellManager.js`

The GridCellManager creates and manages the visual representation of grid cells.

#### Methods

##### `createGridCells()`
Creates the visual grid cells in the 3D scene.

```javascript
gridCellManager.createGridCells();
```

##### `getWorldPosition(row, col)`
Gets the world position for a grid cell.

**Parameters:**
- `row` (Number): The row index (0-4)
- `col` (Number): The column index (0-4)

**Returns:**
- `THREE.Vector3`: The world position of the cell

```javascript
const position = gridCellManager.getWorldPosition(2, 3);
```

##### `highlightCells(predicate)`
Highlights cells that satisfy the given predicate function.

**Parameters:**
- `predicate` (Function): Function that takes row and col and returns true if the cell should be highlighted

```javascript
gridCellManager.highlightCells((row, col) => row === 2 || col === 2);
```

##### `resetHighlights()`
Resets all cell highlights.

```javascript
gridCellManager.resetHighlights();
```

### MergeManager

Located in: `js/grid/MergeManager.js`

The MergeManager handles the logic for merging monsters of the same tier.

#### Methods

##### `canMergeMonsters(monster1, monster2)`
Checks if two monsters can be merged.

**Parameters:**
- `monster1` (Object): First monster
- `monster2` (Object): Second monster

**Returns:**
- `Boolean`: Whether the monsters can be merged

```javascript
const canMerge = mergeManager.canMergeMonsters(monster1, monster2);
```

##### `mergeMonsters(monster1, monster2)`
Merges two monsters to create a higher-tier monster.

**Parameters:**
- `monster1` (Object): First monster
- `monster2` (Object): Second monster

**Returns:**
- `Object`: The newly created merged monster

```javascript
const mergedMonster = mergeManager.mergeMonsters(monster1, monster2);
```

##### `handleMergeAttempt(sourceRow, sourceCol, targetRow, targetCol)`
Attempts to merge monsters at the specified grid positions.

**Parameters:**
- `sourceRow` (Number): Row of the source monster
- `sourceCol` (Number): Column of the source monster
- `targetRow` (Number): Row of the target monster
- `targetCol` (Number): Column of the target monster

**Returns:**
- `Boolean`: Whether the merge was successful

```javascript
const success = mergeManager.handleMergeAttempt(1, 2, 3, 2);
```

### DragDropManager

Located in: `js/grid/DragDropManager.js`

The DragDropManager handles drag-and-drop interactions for monsters on the grid.

#### Methods

##### `enableDragDrop()`
Enables drag-and-drop interactions for monsters on the grid.

```javascript
dragDropManager.enableDragDrop();
```

##### `disableDragDrop()`
Disables drag-and-drop interactions.

```javascript
dragDropManager.disableDragDrop();
```

##### `startDrag(monster, row, col)`
Starts dragging a monster.

**Parameters:**
- `monster` (Object): The monster to drag
- `row` (Number): The row index of the monster
- `col` (Number): The column index of the monster

```javascript
dragDropManager.startDrag(monster, 2, 3);
```

##### `endDrag(targetRow, targetCol)`
Ends dragging and attempts to place or merge the monster.

**Parameters:**
- `targetRow` (Number): The target row index
- `targetCol` (Number): The target column index

**Returns:**
- `Boolean`: Whether the drop was successful

```javascript
const success = dragDropManager.endDrag(1, 4);
```

## Grid Interactions

### Monster Placement

Monsters can be placed on any empty cell on the grid. When a monster is purchased from the shop, the system automatically finds an empty cell and places the monster there.

```javascript
// Find an empty cell
const emptyCell = gridManager.findEmptyCell();
if (emptyCell) {
    // Place the monster
    gridManager.placeMonsterAt(monster, emptyCell.row, emptyCell.col);
}
```

### Monster Merging

Monsters of the same tier can be merged to create a monster of the next tier. Merging can be triggered by dragging one monster onto another of the same tier.

```javascript
// Check if monsters can be merged
if (mergeManager.canMergeMonsters(monster1, monster2)) {
    // Merge the monsters
    const mergedMonster = mergeManager.mergeMonsters(monster1, monster2);
    
    // Place the merged monster
    gridManager.placeMonsterAt(mergedMonster, targetRow, targetCol);
}
```

### Drag and Drop

Players can drag monsters around the grid to rearrange them or merge them. The system highlights valid drop targets during dragging.

```javascript
// Start dragging
dragDropManager.startDrag(monster, sourceRow, sourceCol);

// Highlight valid drop targets
gridManager.highlightValidDropCells(monster);

// End dragging
dragDropManager.endDrag(targetRow, targetCol);

// Reset highlights
gridManager.resetCellHighlights();
```

## Visual Feedback

The Grid System provides visual feedback to help players understand valid interactions:

1. **Cell Highlighting**: Valid drop targets are highlighted during dragging
2. **Monster Elevation**: Dragged monsters are elevated above the grid
3. **Merge Animation**: Visual animation when monsters are merged
4. **Invalid Drop**: Visual feedback when attempting an invalid drop

## Integration with Other Systems

The Grid System interacts with several other systems:

- **Game**: The Game class uses the Grid System to place and manage monsters
- **CombatManager**: The CombatManager uses the Grid System to get all player monsters for battles
- **MonsterManager**: The Grid System uses the MonsterManager to create merged monsters
- **UIManager**: The Grid System provides information to the UI for displaying grid state

## Best Practices

1. Always use the GridManager methods to interact with the grid rather than modifying the grid array directly
2. Use the findEmptyCell method to find a valid placement for new monsters
3. Use the highlightValidDropCells and resetCellHighlights methods to provide visual feedback during drag and drop
4. Use the MergeManager to handle monster merging logic rather than implementing it elsewhere
