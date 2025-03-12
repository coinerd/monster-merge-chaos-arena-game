/**
 * SceneManager handles Three.js scene initialization, camera, lighting, and rendering
 */
class SceneManager {
    constructor(containerElement) {
        this.containerElement = containerElement;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Array of callback functions to be called on each animation frame
        this.updateCallbacks = [];
        
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupRenderer();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Add a grid helper for development
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        this.scene.add(gridHelper);
        
        // Create an arena floor
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x16213e,
            roughness: 0.7,
            metalness: 0.2
        });
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
        this.camera.position.set(0, 6, 8);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLights() {
        // Main directional light with shadows
        this.mainLight = new THREE.DirectionalLight(0xffffff, 1);
        this.mainLight.position.set(5, 10, 5);
        this.mainLight.castShadow = true;
        this.mainLight.shadow.mapSize.width = 2048;
        this.mainLight.shadow.mapSize.height = 2048;
        this.mainLight.shadow.camera.near = 0.5;
        this.mainLight.shadow.camera.far = 50;
        this.mainLight.shadow.camera.left = -10;
        this.mainLight.shadow.camera.right = 10;
        this.mainLight.shadow.camera.top = 10;
        this.mainLight.shadow.camera.bottom = -10;
        this.scene.add(this.mainLight);
        
        // Ambient light for better visibility
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.containerElement.appendChild(this.renderer.domElement);
    }
    
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }
    
    /**
     * Get a raycaster from the camera through a screen position
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {THREE.Raycaster} The raycaster
     */
    getRaycaster(x, y) {
        const mouse = new THREE.Vector2();
        mouse.x = (x / this.width) * 2 - 1;
        mouse.y = -(y / this.height) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        return raycaster;
    }
    
    /**
     * Add a callback function to be called on each animation frame
     * @param {Function} callback - The function to call on each frame, will receive deltaTime parameter
     */
    addUpdateCallback(callback) {
        this.updateCallbacks.push(callback);
    }
    
    /**
     * Remove a callback function from the update loop
     * @param {Function} callback - The function to remove
     */
    removeUpdateCallback(callback) {
        const index = this.updateCallbacks.indexOf(callback);
        if (index !== -1) {
            this.updateCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Start the animation loop
     */
    animate() {
        let lastTime = 0;
        
        const loop = (time) => {
            // Convert time to seconds and calculate delta time
            const timeInSeconds = time * 0.001;
            const deltaTime = timeInSeconds - lastTime;
            lastTime = timeInSeconds;
            
            // Call all update callbacks
            for (const callback of this.updateCallbacks) {
                callback(deltaTime);
            }
            
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(loop);
        };
        
        requestAnimationFrame(loop);
    }
    
    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }
}