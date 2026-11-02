// ==========================================================================
// GearGen-3D Scene Manager
// Industrial CAD Helpers, Camera Management & Real-Time Stats
// ==========================================================================

class SceneManager {
    constructor() {
        this.scene = null;
        this.currentGear = null;
        this.gridHelper = null;
        this.axisHelper = null;

        this.init();
    }

    init() {
        if (window.threeJSSetup) {
            this.scene = window.threeJSSetup.getScene();
            this.addHelpers();
        } else {
            console.error('ThreeJSSetup not ready for SceneManager.');
        }
    }

    addHelpers() {
        if (!this.scene) return;

        // CAD Grid Helper matching #334155 (primary) and #1E293B (secondary)
        this.gridHelper = new THREE.GridHelper(120, 24, 0x334155, 0x1E293B);
        this.gridHelper.position.y = -0.05;
        this.scene.add(this.gridHelper);

        // Standard 3-Axis Helper
        this.axisHelper = new THREE.AxesHelper(25);
        this.axisHelper.renderOrder = 1;
        this.scene.add(this.axisHelper);
    }

    toggleGrid() {
        if (this.gridHelper) {
            this.gridHelper.visible = !this.gridHelper.visible;
            return this.gridHelper.visible;
        }
        return false;
    }

    toggleAxis() {
        if (this.axisHelper) {
            this.axisHelper.visible = !this.axisHelper.visible;
            return this.axisHelper.visible;
        }
        return false;
    }

    toggleWireframe() {
        if (!this.currentGear) return false;
        let isWire = false;
        this.currentGear.traverse(child => {
            if (child.isMesh && child.material) {
                child.material.wireframe = !child.material.wireframe;
                isWire = child.material.wireframe;
            }
        });
        return isWire;
    }

    setCameraView(mode) {
        if (!window.threeJSSetup || !window.threeJSSetup.camera) return;

        const camera = window.threeJSSetup.camera;
        const controls = window.threeJSSetup.controls;
        const dist = 85;

        switch (mode) {
            case 'top':
                camera.position.set(0, dist, 0.001);
                break;
            case 'front':
                camera.position.set(0, 0, dist);
                break;
            case 'side':
                camera.position.set(dist, 0, 0);
                break;
            case 'isometric':
            case 'iso':
                camera.position.set(dist * 0.7, dist * 0.7, dist * 0.7);
                break;
            case 'reset':
            default:
                camera.position.set(60, 60, 60);
                break;
        }

        camera.lookAt(0, 0, 0);
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.update();
        }
    }

    resetCamera() {
        this.setCameraView('reset');
    }

    zoom(factor) {
        if (!window.threeJSSetup || !window.threeJSSetup.camera) return;
        const camera = window.threeJSSetup.camera;
        const controls = window.threeJSSetup.controls;

        const dir = camera.position.clone().normalize();
        const newDist = Math.max(10, Math.min(500, camera.position.length() * factor));
        camera.position.copy(dir.multiplyScalar(newDist));

        if (controls) controls.update();
    }

    addGear(mesh) {
        if (this.currentGear) {
            this.scene.remove(this.currentGear);
        }

        this.currentGear = mesh;
        this.scene.add(mesh);

        // Center the gear
        mesh.position.set(0, 0, 0);

        // Compute bounding box and update stats
        this.updateStats(mesh);
    }

    updateStats(mesh) {
        let totalVertices = 0;
        let totalFaces = 0;
        const boundingBox = new THREE.Box3().setFromObject(mesh);

        mesh.traverse(child => {
            if (child.isMesh && child.geometry) {
                const geo = child.geometry;
                const pos = geo.attributes.position;
                if (pos) {
                    const verts = pos.count;
                    totalVertices += verts;
                    if (geo.index) {
                        totalFaces += geo.index.count / 3;
                    } else {
                        totalFaces += verts / 3;
                    }
                }
            }
        });

        // Update DOM elements for stats overlay
        const vertEl = document.getElementById('vertex-count');
        const faceEl = document.getElementById('face-count');
        const sizeEl = document.getElementById('gear-size');

        if (vertEl) vertEl.textContent = totalVertices.toLocaleString();
        if (faceEl) faceEl.textContent = Math.round(totalFaces).toLocaleString();

        if (sizeEl && !boundingBox.isEmpty()) {
            const size = boundingBox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            sizeEl.textContent = `${maxDim.toFixed(1)} mm`;
        }
    }

    getCurrentGear() {
        return this.currentGear;
    }
}
