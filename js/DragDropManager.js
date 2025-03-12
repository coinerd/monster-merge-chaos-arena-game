/**
 * DragDropManager handles drag and drop interactions for monsters on the grid
 */
class DragDropManager {
    constructor(sceneManager, gridManager) {
        this.sceneManager = sceneManager;
        this.gridManager = gridManager;
        this.scene = sceneManager.scene;
        this.camera = sceneManager.camera;
        this.renderer = sceneManager.renderer;
        
        // Raycaster for mouse picking
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // State variables
        this.isDragging = false;
        this.draggedMonster = null;
        this.originalPosition = null;
        this.originalGridPosition = null;
        
        // Plane for drag movement
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Setup event listeners for drag and drop
     */
    setupEventListeners() {
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        canvas.addEventListener('mouseleave', () => this.onMouseLeave());
    }
    
    /**
     * Update mouse coordinates
     * @param {MouseEvent} event - Mouse event
     */
    updateMouseCoordinates(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseDown(event) {
        this.updateMouseCoordinates(event);
        
        // Cast ray from mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections with monster meshes
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        for (const intersect of intersects) {
            const monster = this.findMonsterByMesh(intersect.object);
            if (monster) {
                this.startDragging(monster);
                break;
            }
        }
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseMove(event) {
        this.updateMouseCoordinates(event);
        
        if (this.isDragging && this.draggedMonster) {
            // Update raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Find intersection with drag plane
            const intersection = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.dragPlane, intersection);
            
            // Update monster position
            this.draggedMonster.mesh.position.copy(intersection);
            
            // Update grid cell highlights
            const hoveredCell = this.getHoveredCell(intersection);
            if (hoveredCell) {
                this.gridManager.highlightValidDropCells(this.draggedMonster);
            }
        }
    }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} event - Mouse event
     */
    onMouseUp(event) {
        if (this.isDragging && this.draggedMonster) {
            this.updateMouseCoordinates(event);
            
            // Find intersection with drag plane
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersection = new THREE.Vector3();
            this.raycaster.ray.intersectPlane(this.dragPlane, intersection);
            
            // Get hovered cell
            const hoveredCell = this.getHoveredCell(intersection);
            
            if (hoveredCell) {
                // Try to drop the monster
                const success = this.gridManager.handleMonsterDrop(
                    this.draggedMonster,
                    hoveredCell.row,
                    hoveredCell.col
                );
                
                if (!success) {
                    // Return monster to original position
                    this.returnMonsterToOriginalPosition();
                }
            } else {
                // Return monster to original position
                this.returnMonsterToOriginalPosition();
            }
            
            // Reset highlights
            this.gridManager.resetCellHighlights();
            
            // End dragging
            this.endDragging();
        }
    }
    
    /**
     * Handle mouse leave event
     */
    onMouseLeave() {
        if (this.isDragging) {
            this.returnMonsterToOriginalPosition();
            this.gridManager.resetCellHighlights();
            this.endDragging();
        }
    }
    
    /**
     * Start dragging a monster
     * @param {Object} monster - Monster to drag
     */
    startDragging(monster) {
        this.isDragging = true;
        this.draggedMonster = monster;
        
        // Store original position
        this.originalPosition = monster.mesh.position.clone();
        this.originalGridPosition = this.gridManager.getMonsterGridPosition(monster);
        
        // Remove monster from grid
        if (this.originalGridPosition.row !== null && this.originalGridPosition.col !== null) {
            this.gridManager.removeMonsterFromGrid(
                this.originalGridPosition.row,
                this.originalGridPosition.col
            );
        }
        
        // Update drag plane
        this.dragPlane.constant = -monster.mesh.position.y;
    }
    
    /**
     * End dragging
     */
    endDragging() {
        this.isDragging = false;
        this.draggedMonster = null;
        this.originalPosition = null;
        this.originalGridPosition = null;
    }
    
    /**
     * Return dragged monster to its original position
     */
    returnMonsterToOriginalPosition() {
        if (this.draggedMonster && this.originalPosition && this.originalGridPosition) {
            // Return monster to original position
            this.draggedMonster.mesh.position.copy(this.originalPosition);
            
            // Return monster to grid
            this.gridManager.placeMonsterAt(
                this.draggedMonster,
                this.originalGridPosition.row,
                this.originalGridPosition.col
            );
        }
    }
    
    /**
     * Get grid cell at world position
     * @param {THREE.Vector3} position - World position
     * @returns {Object} Cell coordinates or null if not over grid
     */
    getHoveredCell(position) {
        const gridSize = this.gridManager.gridSize;
        const cellSize = this.gridManager.cellSize;
        
        // Calculate grid bounds
        const gridWidth = gridSize * cellSize;
        const gridStart = -(gridWidth / 2);
        
        // Check if position is within grid bounds
        if (position.x < gridStart || position.x > -gridStart ||
            position.z < gridStart || position.z > -gridStart) {
            return null;
        }
        
        // Calculate grid coordinates
        const x = position.x - gridStart;
        const z = position.z - gridStart;
        
        const row = Math.floor(z / cellSize);
        const col = Math.floor(x / cellSize);
        
        // Validate coordinates
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
            return { row, col };
        }
        
        return null;
    }
    
    /**
     * Find monster by its mesh
     * @param {THREE.Mesh} mesh - Mesh to find monster for
     * @returns {Object} Monster object or null if not found
     */
    findMonsterByMesh(mesh) {
        const monsters = this.gridManager.getMonsters();
        return monsters.find(monster => monster.mesh === mesh) || null;
    }
}