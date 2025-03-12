/**
 * GridCellManager handles the creation and management of the grid cells
 */
class GridCellManager {
    constructor(scene, gridSize, cellSize) {
        this.scene = scene;
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.gridOffset = (gridSize * cellSize) / 2 - cellSize / 2;
        
        this.cells = [];
        this.cellMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x283655,
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8 
        });
        
        this.highlightMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4ade80, 
            roughness: 0.8,
            metalness: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        this.setupGrid();
    }
    
    setupGrid() {
        // Create the grid cells
        const cellGeometry = new THREE.BoxGeometry(this.cellSize, 0.1, this.cellSize);
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = new THREE.Mesh(cellGeometry, this.cellMaterial);
                
                // Position the cell
                const position = this.calculateCellPosition(row, col);
                cell.position.set(position.x, position.y, position.z);
                
                cell.receiveShadow = true;
                
                // Store the grid position with the cell
                cell.userData = {
                    row,
                    col,
                    isCell: true,
                    normalMaterial: this.cellMaterial,
                    highlightMaterial: this.highlightMaterial
                };
                
                this.scene.add(cell);
                this.cells.push(cell);
            }
        }
    }
    
    /**
     * Calculate the exact position for a cell at given row and column
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Object} Position object with x, y, z coordinates
     */
    calculateCellPosition(row, col) {
        return {
            x: col * this.cellSize - this.gridOffset,
            y: 0.05, // Slight elevation to avoid z-fighting
            z: row * this.cellSize - this.gridOffset
        };
    }
    
    getWorldPosition(row, col) {
        const position = this.calculateCellPosition(row, col);
        return {
            x: position.x,
            y: 0.5, // Standard height for monsters
            z: position.z
        };
    }
    
    /**
     * Get the cell at a given world position
     * @param {THREE.Vector3} position - World position
     * @returns {Object|null} Cell data with row and col, or null if not found
     */
    getCellAtPosition(position) {
        // Calculate grid coordinates from world position
        const col = Math.round((position.x + this.gridOffset) / this.cellSize);
        const row = Math.round((position.z + this.gridOffset) / this.cellSize);
        
        // Check if the coordinates are within grid bounds
        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
            return { row, col };
        }
        
        return null;
    }
    
    highlightCells(predicate) {
        this.cells.forEach(cell => {
            if (predicate(cell.userData.row, cell.userData.col)) {
                cell.material = cell.userData.highlightMaterial;
            }
        });
    }
    
    resetHighlights() {
        this.cells.forEach(cell => {
            cell.material = cell.userData.normalMaterial;
        });
    }
    
    getCells() {
        return this.cells;
    }
    
    dispose() {
        // Clean up resources
        this.cells.forEach(cell => {
            this.scene.remove(cell);
            if (cell.geometry) cell.geometry.dispose();
            if (cell.material) cell.material.dispose();
        });
        this.cells = [];
    }
}