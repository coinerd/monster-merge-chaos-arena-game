/**
 * GridManager handles the 5x5 game grid and drag-drop interactions
 * This class coordinates the various grid sub-managers
 */
class GridManager {
    constructor(sceneManager, monsterManager) {
        this.sceneManager = sceneManager;
        this.monsterManager = monsterManager;
        this.scene = sceneManager.scene;
        
        this.gridSize = 5;
        this.cellSize = 1.5;
        
        // Grid data structure (2D array)
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        
        // Initialize sub-managers
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
        const position = this.cellManager.getWorldPosition(row, col);
        monster.mesh.position.set(position.x, position.y, position.z);
        this.grid[row][col] = monster;
        
        // Make sure the monster is in the scene
        if (!this.scene.children.includes(monster.mesh)) {
            this.scene.add(monster.mesh);
        }
    }
    
    removeMonsterFromGrid(row, col) {
        this.grid[row][col] = null;
    }
    
    getMonsterGridPosition(monster) {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === monster) {
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
        // If the cell is empty, drop the monster there
        if (this.grid[row][col] === null) {
            this.placeMonsterAt(monster, row, col);
            return true;
        } 
        // If there's already a monster, check if they can merge
        else if (this.mergeManager.canMergeMonsters(monster, this.grid[row][col])) {
            const existingMonster = this.grid[row][col];
            const newMonster = this.mergeManager.mergeMonsters(monster, existingMonster, row, col);
            
            // Update the grid with the new merged monster
            this.grid[row][col] = newMonster;
            return true;
        }
        
        return false;
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
    
    // Clean up resources when no longer needed
    dispose() {
        this.cellManager.dispose();
        
        // Remove all monsters from the scene
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.scene.remove(this.grid[row][col].mesh);
                    // Dispose geometries and materials
                    if (this.grid[row][col].mesh.geometry) {
                        this.grid[row][col].mesh.geometry.dispose();
                    }
                    if (this.grid[row][col].mesh.material) {
                        if (Array.isArray(this.grid[row][col].mesh.material)) {
                            this.grid[row][col].mesh.material.forEach(m => m.dispose());
                        } else {
                            this.grid[row][col].mesh.material.dispose();
                        }
                    }
                }
            }
        }
        
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
    }
}