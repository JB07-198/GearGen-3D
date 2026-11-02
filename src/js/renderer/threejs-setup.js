// ==========================================================================
// Three.js Setup and WebGL Initialization
// Industrial CAD Dark Theme Integration (#0F172A)
// ==========================================================================

class ThreeJSSetup {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;

        this.init();
    }

    init() {
        console.log('Initializing Three.js WebGL engine...');

        this.container = document.getElementById('preview-canvas');
        if (!this.container) {
            console.error('Preview canvas container (#preview-canvas) not found!');
            return;
        }

        // 1. Scene with JSON Spec background color (#0F172A)
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0F172A);

        // 2. Camera Setup
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 600;
        const aspect = width / height;

        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
        this.camera.position.set(60, 60, 60);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Clear previous canvas if any
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // 4. Lights
        this.setupLights();

        // 5. OrbitControls (touch: pinch_zoom, one_finger_rotate, two_finger_pan)
        this.setupControls();

        // 6. Window and Container Resize
        window.addEventListener('resize', () => this.onWindowResize());

        // 7. Render Loop
        this.animate();

        console.log('Three.js setup successfully initialized.');
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
        dirLight.position.set(60, 120, 60);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 10;
        dirLight.shadow.camera.far = 300;
        dirLight.shadow.bias = -0.001;
        this.scene.add(dirLight);

        const fillLight = new THREE.DirectionalLight(0x60A5FA, 0.4);
        fillLight.position.set(-60, -30, -60);
        this.scene.add(fillLight);
    }

    setupControls() {
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = true;
            this.controls.minDistance = 5;
            this.controls.maxDistance = 600;
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        } else {
            console.warn('OrbitControls library not found.');
        }
    }

    onWindowResize() {
        if (!this.container || !this.camera || !this.renderer) return;

        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    getScene() {
        return this.scene;
    }

    getCamera() {
        return this.camera;
    }

    getControls() {
        return this.controls;
    }
}
