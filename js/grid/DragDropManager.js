/**
 * DragDropManager handles dragging and dropping of monsters on the grid
 */
class DragDropManager {
    constructor(sceneManager, gridManager) {
        this.sceneManager = sceneManager;
        this.gridManager = gridManager;
        this.scene = sceneManager.scene;
        
        this.isDragging = false;
        this.draggedMonster = null;
        this.originalPosition = null;
        this.originalGridPos = null;
        this.prevCursorPosition = null;
        
        // Last known touch position for touch events
        this.lastClientX = null;
        this.lastClientY = null;
        
        // Listeners for drag state changes
        this.stateChangeListeners = [];
        
        this.setupEventListeners();
    }
    
    addDragStateChangeListener(callback) {
        this.stateChangeListeners.push(callback);
    }
    
    notifyDragStateChange() {
        const state = {
            isDragging: this.isDragging,
            draggedMonster: this.draggedMonster,
            originalPosition: this.originalPosition,
            originalGridPos: this.originalGridPos,
            prevCursorPosition: this.prevCursorPosition
        };
        
        this.stateChangeListeners.forEach(callback => callback(state));
    }
    
    setupEventListeners() {
        // Event listeners for mouse/touch interactions
        const canvas = this.sceneManager.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onMouseDown({
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onMouseMove({
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            });
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onMouseUp({});
        });
    }
    
    onMouseDown(event) {
        const raycaster = this.sceneManager.getRaycaster(event.clientX, event.clientY);
        // Use recursive true to check all descendants of objects
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        
        // Store last known mouse position for touch events
        this.lastClientX = event.clientX;
        this.lastClientY = event.clientY;
        
        for (const intersect of intersects) {
            const object = intersect.object;
            
            // Check if the object is a monster
            if (object.userData && object.userData.isMonster) {
                const monsterObj = object.userData.monsterObj;
                const { row, col } = this.gridManager.getMonsterGridPosition(monsterObj);
                
                if (row !== null && col !== null) {
                    this.isDragging = true;
                    this.draggedMonster = monsterObj;
                    this.originalPosition = monsterObj.mesh.position.clone();
                    this.originalGridPos = { row, col };
                    
                    // Notify state change
                    this.notifyDragStateChange();
                    
                    // Record the initial mouse position on the floor
                    const floorIntersect = raycaster.intersectObject(this.sceneManager.floor);
                    if (floorIntersect.length > 0) {
                        this.prevCursorPosition = floorIntersect[0].point.clone();
                    }
                    
                    // Remove from grid while dragging
                    this.gridManager.removeMonsterFromGrid(row, col);
                    
                    // Raise the monster slightly while dragging
                    monsterObj.mesh.position.y += 0.5;
                    
                    // Highlight valid cells
                    this.gridManager.highlightValidDropCells(monsterObj);
                    
                    return;
                }
            }
        }
    }
    
    onMouseMove(event) {
        if (!this.isDragging || !this.draggedMonster) return;
        
        // Store last known mouse position for touch events
        this.lastClientX = event.clientX;
        this.lastClientY = event.clientY;
        
        const raycaster = this.sceneManager.getRaycaster(event.clientX, event.clientY);
        const intersect = raycaster.intersectObject(this.sceneManager.floor);
        
        if (intersect.length > 0 && this.prevCursorPosition) {
            const currentCursorPosition = intersect[0].point;
            
            // Calculate movement delta
            const dx = currentCursorPosition.x - this.prevCursorPosition.x;
            const dz = currentCursorPosition.z - this.prevCursorPosition.z;
            
            // Move the monster by the same amount as the cursor moved
            this.draggedMonster.mesh.position.x += dx;
            this.draggedMonster.mesh.position.z += dz;
            
            // Update previous cursor position for next frame
            this.prevCursorPosition.copy(currentCursorPosition);
            
            // Update health bar for the dragged monster
            this.updateDraggedMonsterHealthBar();
        }
    }
    
    updateDraggedMonsterHealthBar() {
        if (!this.draggedMonster) return;
        
        // Only proceed if the game object exists and has a UIManager with updateAllHealthBars
        const game = window.game;
        if (!game || !game.uiManager || typeof game.uiManager.updateAllHealthBars !== 'function') return;
        
        // Create an array with just the dragged monster
        const monsters = [this.draggedMonster];
        
        // Update the health bar for just this monster
        game.uiManager.updateAllHealthBars(
            monsters, 
            this.sceneManager.camera, 
            this.sceneManager.renderer
        );
    }
    
    onMouseUp(event) {
        if (!this.isDragging || !this.draggedMonster) return;
        
        const dropped = this.tryDropMonster(event);
        
        if (!dropped) {
            // Return to original position
            this.draggedMonster.mesh.position.copy(this.originalPosition);
            this.gridManager.placeMonsterAt(this.draggedMonster, this.originalGridPos.row, this.originalGridPos.col);
        }
        
        // Reset dragging state
        this.draggedMonster.mesh.position.y -= 0.5; // Match the same amount we raised it
        this.isDragging = false;
        this.draggedMonster = null;
        this.originalPosition = null;
        this.originalGridPos = null;
        this.prevCursorPosition = null;
        
        // Notify state change
        this.notifyDragStateChange();
        
        // Remove all cell highlights
        this.gridManager.resetCellHighlights();
    }
    
    tryDropMonster(event) {
        if (!event.clientX && !event.clientY) {
            // For touch events that don't provide coordinates on touchend
            const raycaster = this.sceneManager.getRaycaster(
                this.lastClientX || window.innerWidth / 2,
                this.lastClientY || window.innerHeight / 2
            );
            // Use last known position or center of screen as fallback
            return this.findDropCell(raycaster);
        } else {
            const raycaster = this.sceneManager.getRaycaster(event.clientX, event.clientY);
            return this.findDropCell(raycaster);
        }
    }
    
    findDropCell(raycaster) {
        const cells = this.gridManager.getCells();
        // Use recursive false since we only want to detect the cells, not their children
        const intersects = raycaster.intersectObjects(cells, false);
        
        for (const intersect of intersects) {
            const cell = intersect.object;
            
            if (!cell.userData || !cell.userData.isCell) continue;
            
            const { row, col } = cell.userData;
            
            return this.gridManager.handleMonsterDrop(this.draggedMonster, row, col);
        }
        
        return false;
    }
    
    getDraggedMonster() {
        return this.draggedMonster;
    }
    
    isCurrentlyDragging() {
        return this.isDragging;
    }
}