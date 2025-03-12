/**
 * GridManager handles the 5x5 game grid and drag-drop interactions
 * This file is now a compatibility wrapper that uses the modular grid components
 */
class GridManager {
    constructor(sceneManager, monsterManager) {
        // Simply create an instance of the modular GridManager implementation
        // This assumes the grid modules are loaded before this file
        this.sceneManager = sceneManager;
        this.monsterManager = monsterManager;
        this.scene = sceneManager.scene;
        
        this.gridSize = 5;
        this.cellSize = 1.5;
        
        // Grid data structure (2D array)
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        // Initialize sub-managers from the modular implementation
        this.cellManager = new GridCellManager(this.scene, this.gridSize, this.cellSize);
        this.mergeManager = new MergeManager(this.scene, this.monsterManager, this.cellManager);
        this.dragDropManager = new DragDropManager(this.sceneManager, this);
    }
    
    // Methods for grid cell handling
    getCells() {
        return this.cellManager.getCells();
    }
    
    highlightValidDropCells(monster) {
        this.cellManager.highlightCells((row, col) => {
            // Highlight empty cells or cells with same-tier monsters
            return this.grid[row][col] === null || 
                  (this.grid[row][col] && this.mergeManager.canMergeMonsters(monster, this.grid[row][col]));
        });
    }
    
    resetCellHighlights() {
        this.cellManager.resetHighlights();
    }
    
    // Methods for monster placement and retrieval
    placeMonsterAt(monster, row, col) {
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            console.error(`Invalid grid position: row=${row}, col=${col}`);
            return false;
        }
        
        // Get the exact world position for this cell
        const position = this.cellManager.getWorldPosition(row, col);
        
        // Position the monster precisely at the cell center
        monster.mesh.position.set(position.x, position.y, position.z);
        
        // Update the grid data structure
        this.grid[row][col] = monster;
        
        // Make sure the monster is in the scene
        if (!this.scene.children.includes(monster.mesh)) {
            this.scene.add(monster.mesh);
        }
        
        // Store the grid position on the monster for easier reference
        monster.gridPosition = { row, col };
        
        return true;
    }
    
    removeMonsterFromGrid(row, col) {
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            console.error(`Invalid grid position: row=${row}, col=${col}`);
            return;
        }
        
        const monster = this.grid[row][col];
        if (monster) {
            // Clear the grid position reference on the monster
            monster.gridPosition = null;
        }
        
        this.grid[row][col] = null;
    }
    
    getMonsterGridPosition(monster) {
        // Check if the monster has a stored grid position
        if (monster.gridPosition) {
            return monster.gridPosition;
        }
        
        // Fall back to searching the grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === monster) {
                    // Store the position for future reference
                    monster.gridPosition = { row, col };
                    return { row, col };
                }
            }
        }
        
        return { row: null, col: null };
    }
    
    getMonsters() {
        const monsters = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    monsters.push(this.grid[row][col]);
                }
            }
        }
        return monsters;
    }
    
    // Handle dropping a monster on the grid
    handleMonsterDrop(monster, row, col) {
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
            console.error(`Invalid grid position for drop: row=${row}, col=${col}`);
            return false;
        }
        
        // If the cell is empty, drop the monster there
        if (this.grid[row][col] === null) {
            return this.placeMonsterAt(monster, row, col);
        } 
        // If there's already a monster, check if they can merge
        else if (this.mergeManager.canMergeMonsters(monster, this.grid[row][col])) {
            const existingMonster = this.grid[row][col];
            const newMonster = this.mergeManager.mergeMonsters(monster, existingMonster, row, col);
            
            // Update the grid with the new merged monster
            this.grid[row][col] = newMonster;
            
            // Store the grid position on the new monster
            newMonster.gridPosition = { row, col };
            
            return true;
        }
        
        return false;
    }
    
    // Find an empty cell on the grid
    findEmptyCell() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    return { row, col };
                }
            }
        }
        return null;
    }
    
    // Game state management
    loadGridState(gridState) {
        // Clear the current grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.scene.remove(this.grid[row][col].mesh);
                    this.grid[row][col] = null;
                }
            }
        }
        
        // Load the saved grid state
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const monsterData = gridState[row][col];
                
                if (monsterData) {
                    const monster = this.monsterManager.createMonster(
                        monsterData.tier,
                        monsterData.health,
                        monsterData.maxHealth,
                        monsterData.attack,
                        monsterData.defense
                    );
                    
                    this.placeMonsterAt(monster, row, col);
                }
            }
        }
    }
    
    getGridState() {
        const gridState = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const monster = this.grid[row][col];
                if (monster) {
                    gridState[row][col] = {
                        tier: monster.tier,
                        health: monster.health,
                        maxHealth: monster.maxHealth,
                        attack: monster.attack,
                        defense: monster.defense
                    };
                }
            }
        }
        
        return gridState;
    }
    
    /**
     * Clear all monsters from the grid
     */
    clearGrid() {
        // Remove all monsters from the scene and clear the grid
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.scene.remove(this.grid[row][col].mesh);
                    this.grid[row][col] = null;
                }
            }
        }
    }
}