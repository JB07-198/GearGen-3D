// Scene Manager for 3D preview
class SceneManager {
    constructor() {
        this.scene = null;
        this.currentGear = null;
        this.gridHelper = null;
        this.axisHelper = null;
        
        this.init();
    }
    
    init() {
        console.log('Initializing scene manager...');
        
        // Get Three.js setup
        if (window.threeJSSetup) {
            this.scene = window.threeJSSetup.getScene();
            
            // Add coordinate helpers
            this.addHelpers();
            
            console.log('Scene manager ready');
        } else {
            console.error('Three.js setup not available');
        }
    }
    
    addHelpers() {
        // Add grid helper
        this.gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        this.gridHelper.position.y = -0.1;
        this.scene.add(this.gridHelper);
        
        // Add axes helper
        this.axisHelper = new THREE.AxesHelper(20);
        this.scene.add(this.axisHelper);
    }
    
    toggleGrid() {
        if (this.gridHelper) {
            this.gridHelper.visible = !this.gridHelper.visible;
        }
    }
    
    toggleAxis() {
        if (this.axisHelper) {
            this.axisHelper.visible = !this.axisHelper.visible;
        }
    }
    
    resetCamera() {
        if (window.threeJSSetup && window.threeJSSetup.camera) {
            window.threeJSSetup.camera.position.set(50, 50, 50);
            window.threeJSSetup.camera.lookAt(0, 0, 0);
            
            if (window.threeJSSetup.controls) {
                window.threeJSSetup.controls.update();
            }
        }
    }
    
    addGear(mesh) {
        // Remove existing gear
        if (this.currentGear) {
            this.scene.remove(this.currentGear);
        }
        
        // Add new gear
        this.currentGear = mesh;
        this.scene.add(mesh);
        
        // Center the gear
        mesh.position.set(0, 0, 0);
        
        // Update stats in UI
        this.updateStats(mesh);
    }
    
    updateStats(mesh) {
        if (mesh.geometry) {
            const vertexCount = mesh.geometry.attributes.position.count;
            const faceCount = mesh.geometry.index ? mesh.geometry.index.count / 3 : vertexCount / 3;
            
            // Update UI elements
            const vertexElement = document.getElementById('vertex-count');
            const faceElement = document.getElementById('face-count');
            
            if (vertexElement) {
                vertexElement.textContent = vertexCount.toLocaleString();
            }
            
            if (faceElement) {
                faceElement.textContent = Math.round(faceCount).toLocaleString();
            }
        }
    }
    
    getCurrentGear() {
        return this.currentGear;
    }
}

// Initialize scene manager
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to initialize
    setTimeout(() => {
        window.sceneManager = new SceneManager();
    }, 500);
});