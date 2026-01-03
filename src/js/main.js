// Main Application Controller
class GearGenApp {
    constructor() {
        this.currentGearType = 'spur';
        this.gearParameters = {
            module: 2,
            teeth: 20,
            pressureAngle: 20,
            faceWidth: 10,
            hubDiameter: 10,
            boreDiameter: 5,
            color: '#3498db',
            quality: 'medium'
        };

        this.init();
    }

    init() {
        console.log('GearGen App Initializing...');

        // Initialize components
        this.initUI();
        this.init3D();
        this.initEventListeners();

        // Generate initial gear
        this.generateGear();
    }

    initUI() {
        console.log('Initializing UI components...');
        // UI components will be initialized by their respective modules
    }

    init3D() {
        console.log('Initializing 3D renderer...');
        // 3D renderer will be initialized by Three.js setup
    }

    initEventListeners() {
        console.log('Setting up event listeners...');

        // Gear type selection
        document.querySelectorAll('.gear-type-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = card.dataset.type;
                if (type === 'spur') {
                    this.setGearType(type);
                } else {
                    this.showComingSoonMessage(type);
                }
            });
        });

        // Parameter inputs
        document.querySelectorAll('.parameter input, .parameter select').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateParameter(e.target.id, e.target.value);
                this.generateGear();
            });
        });

        // Export buttons
        document.getElementById('export-stl').addEventListener('click', () => {
            this.exportSTL();
        });

        document.getElementById('export-step').addEventListener('click', () => {
            this.showComingSoonMessage('STEP export');
        });

        // Preview controls
        document.getElementById('reset-view').addEventListener('click', () => {
            if (window.sceneManager) {
                window.sceneManager.resetCamera();
            }
        });

        document.getElementById('toggle-grid').addEventListener('click', (e) => {
            if (window.sceneManager) {
                window.sceneManager.toggleGrid();
                e.target.classList.toggle('active');
            }
        });

        document.getElementById('toggle-axis').addEventListener('click', (e) => {
            if (window.sceneManager) {
                window.sceneManager.toggleAxis();
                e.target.classList.toggle('active');
            }
        });

        // Wireframe toggle
        document.getElementById('toggle-wireframe').addEventListener('click', (e) => {
            if (window.sceneManager && window.sceneManager.currentGear) {
                const gear = window.sceneManager.currentGear;
                gear.material.wireframe = !gear.material.wireframe;
                e.target.classList.toggle('active');
            }
        });

        // Info buttons
        document.getElementById('help-btn').addEventListener('click', () => {
            alert('Help documentation will be available soon!\n\nCurrently only Spur Gears are functional. Other gear types are coming in future updates.');
        });

        document.getElementById('github-btn').addEventListener('click', () => {
            window.open('https://github.com', '_blank');
        });
    }

    setGearType(type) {
        console.log(`Setting gear type to: ${type}`);

        // Update active card
        document.querySelectorAll('.gear-type-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        this.currentGearType = type;
        this.generateGear();
    }

    updateParameter(param, value) {
        // Map HTML IDs (kebab-case) to internal properties (camelCase)
        const paramMap = {
            'face-width': 'faceWidth',
            'hub-diameter': 'hubDiameter',
            'bore-diameter': 'boreDiameter',
            'pressure-angle': 'pressureAngle'
        };

        const key = paramMap[param] || param;
        console.log(`Updating parameter ${key} (from ${param}): ${value}`);

        // Convert numeric values
        if (['module', 'teeth', 'faceWidth', 'hubDiameter', 'boreDiameter', 'pressureAngle'].includes(key)) {
            value = parseFloat(value);
        }

        this.gearParameters[key] = value;
    }

    generateGear() {
        console.log('Generating gear with parameters:', this.gearParameters);

        // Update stats display
        const pitchDiameter = this.gearParameters.module * this.gearParameters.teeth;
        document.getElementById('gear-size').textContent = `${pitchDiameter.toFixed(1)} mm`;

        // Generate gear geometry based on type
        switch (this.currentGearType) {
            case 'spur':
                this.generateSpurGear();
                break;
            default:
                console.warn(`Gear type ${this.currentGearType} not implemented yet`);
                break;
        }
    }

    generateSpurGear() {
        console.log('Generating spur gear...');

        // Get gear parameters
        const params = this.gearParameters;

        // Calculate gear dimensions
        const gearData = calculateSpurGear(
            params.module,
            params.teeth,
            params.pressureAngle,
            params.faceWidth,
            params.hubDiameter,
            params.boreDiameter,
            params.quality
        );

        console.log('Calculated gear data:', gearData);

        // Create 3D model
        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createSpurGear(gearData, params.color, params.quality);

            // Update stats
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    updateGearStats(gearMesh) {
        if (gearMesh.geometry) {
            const vertexCount = gearMesh.geometry.attributes.position?.count || 0;
            document.getElementById('vertex-count').textContent =
                vertexCount.toLocaleString();

            // Calculate approximate face count
            const faceCount = vertexCount / 3;
            document.getElementById('face-count').textContent =
                Math.round(faceCount).toLocaleString();

            // Update size display
            if (gearMesh.geometry.boundingBox) {
                const size = gearMesh.geometry.boundingBox.getSize(new THREE.Vector3());
                const maxSize = Math.max(size.x, size.y, size.z);
                document.getElementById('gear-size').textContent =
                    `${maxSize.toFixed(1)} mm`;
            }
        }
    }

    exportSTL() {
        console.log('Exporting as STL...');

        if (window.stlExporter) {
            window.stlExporter.exportCurrentGear();
        } else {
            alert('STL exporter not available. Please check console for errors.');
        }
    }

    showComingSoonMessage(feature) {
        alert(`🚧 ${feature} is coming soon!\n\nCurrently only Spur Gears are available for generation and export. Other gear types and STEP export will be implemented in future updates.`);

        // Highlight the feature as coming soon
        const element = document.querySelector(`[data-type="${feature}"]`) ||
            document.getElementById(`export-${feature}`);
        if (element) {
            element.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gearGenApp = new GearGenApp();
});