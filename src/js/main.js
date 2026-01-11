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

    onWindowResize() {
        if (window.threeJSSetup) {
            window.threeJSSetup.onWindowResize();
        }
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
                if (type === 'spur' || type === 'helical' || type === 'bevel' || type === 'worm' || type === 'rack' || type === 'internal' || type === 'planetary') {
                    this.setGearType(type);
                } else {
                    this.showComingSoonMessage(type);
                }
            });
        });

        // Export buttons
        document.getElementById('export-stl').addEventListener('click', () => {
            this.exportSTL();
        });

        // Preview controls - Floating & Desktop
        ['reset-view', 'reset-view-desktop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (window.sceneManager) {
                        window.sceneManager.resetCamera();
                    }
                });
            }
        });

        ['toggle-grid', 'toggle-grid-desktop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    if (window.sceneManager) {
                        window.sceneManager.toggleGrid();
                        const currentBtn = e.currentTarget;
                        currentBtn.classList.toggle('active');
                        // Sync with other button
                        const otherId = id.includes('-desktop') ? id.replace('-desktop', '') : id + '-desktop';
                        const otherBtn = document.getElementById(otherId);
                        if (otherBtn) otherBtn.classList.toggle('active');
                    }
                });
            }
        });

        ['toggle-axis', 'toggle-axis-desktop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    if (window.sceneManager) {
                        window.sceneManager.toggleAxis();
                        const currentBtn = e.currentTarget;
                        currentBtn.classList.toggle('active');
                        // Sync with other button
                        const otherId = id.includes('-desktop') ? id.replace('-desktop', '') : id + '-desktop';
                        const otherBtn = document.getElementById(otherId);
                        if (otherBtn) otherBtn.classList.toggle('active');
                    }
                });
            }
        });

        ['toggle-wireframe', 'toggle-wireframe-desktop'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    if (window.sceneManager && window.sceneManager.currentGear) {
                        const gear = window.sceneManager.currentGear;
                        gear.material.wireframe = !gear.material.wireframe;
                        const currentBtn = e.currentTarget;
                        currentBtn.classList.toggle('active');
                        // Sync with other button
                        const otherId = id.includes('-desktop') ? id.replace('-desktop', '') : id + '-desktop';
                        const otherBtn = document.getElementById(otherId);
                        if (otherBtn) otherBtn.classList.toggle('active');
                    }
                });
            }
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

        // Update UI visibility for parameters
        if (window.parameterUI) {
            window.parameterUI.updateVisibility(type);
        }

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
        if (['module', 'teeth', 'faceWidth', 'hubDiameter', 'boreDiameter', 'pressureAngle', 'pitchAngle'].includes(key)) {
            value = parseFloat(value);
        }

        this.gearParameters[key] = value;
    }

    generateGear() {
        // Sync parameters with UI if available
        if (window.parameterUI) {
            this.gearParameters = window.parameterUI.getAllParameters();
        }

        console.log('Generating gear with parameters:', this.gearParameters);

        // Update stats display
        const pitchDiameter = this.gearParameters.module * this.gearParameters.teeth;
        if (document.getElementById('gear-size')) {
            document.getElementById('gear-size').textContent = `${pitchDiameter.toFixed(1)} mm`;
        }

        // Update orientation/stats in export UI
        if (window.exportUI) {
            window.exportUI.updateFileSizeEstimation();
        }

        // Generate gear geometry based on type
        switch (this.currentGearType) {
            case 'spur':
                this.generateSpurGear();
                break;
            case 'helical':
                this.generateHelicalGear();
                break;
            case 'bevel':
                this.generateBevelGear();
                break;
            case 'worm':
                this.generateWormGear();
                break;
            case 'rack':
                this.generateRackGear();
                break;
            case 'internal':
                this.generateInternalGear();
                break;
            case 'planetary':
                this.generatePlanetaryGear();
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

            // Calculate accurate face count
            // If indexed, faceCount = index.count / 3
            // If not indexed, faceCount = vertexCount / 3
            let faceCount = 0;
            if (gearMesh.geometry.index) {
                faceCount = gearMesh.geometry.index.count / 3;
            } else {
                faceCount = vertexCount / 3;
            }

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
            const params = {
                type: this.currentGearType,
                module: this.gearParameters.module,
                teeth: this.gearParameters.teeth,
                faceWidth: this.gearParameters.faceWidth,
                helixAngle: (this.currentGearType === 'helical' || this.currentGearType === 'worm') ? this.gearParameters.helixAngle : null,
                pitchAngle: this.currentGearType === 'bevel' ? this.gearParameters.pitchAngle : null
            };
            window.stlExporter.exportCurrentGear(params);
        } else {
            alert('STL exporter not available. Please check console for errors.');
        }
    }

    generateHelicalGear() {
        console.log('Generating helical gear...');
        const params = this.gearParameters;

        const gearData = calculateHelicalGear(
            params.module,
            params.teeth,
            params.pressureAngle,
            params.helixAngle,
            params.faceWidth,
            params.hubDiameter,
            params.boreDiameter,
            params.quality
        );

        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createHelicalGear(gearData, params.color, params.quality);
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    generateBevelGear() {
        console.log('Generating bevel gear...');
        const params = this.gearParameters;

        const gearData = calculateBevelGear(
            params.module,
            params.teeth,
            params.pressureAngle,
            params.pitchAngle,
            params.faceWidth,
            params.hubDiameter,
            params.boreDiameter,
            params.quality
        );

        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createBevelGear(gearData, params.color, params.quality);
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    generateWormGear() {
        console.log('Generating worm gear...');
        const params = this.gearParameters;

        const gearData = calculateWormGear(
            params.module,
            params.teeth, // starts
            params.pressureAngle,
            params.helixAngle, // lead angle
            params.faceWidth,
            params.hubDiameter,
            params.boreDiameter,
            params.quality
        );

        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createWormGear(gearData, params.color, params.quality);
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    generateRackGear() {
        console.log('Generating rack gear...');
        const params = this.gearParameters;

        const gearData = calculateRackGear(
            params.module,
            params.teeth,
            params.pressureAngle,
            params.faceWidth,
            params.quality
        );

        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createRackGear(gearData, params.color, params.quality);
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    generateInternalGear() {
        console.log('Generating internal gear...');
        const params = this.gearParameters;

        const gearData = calculateInternalGear(
            params.module,
            params.teeth,
            params.pressureAngle,
            params.faceWidth,
            params.quality
        );

        if (window.gearRenderer) {
            const gearMesh = window.gearRenderer.createInternalGear(gearData, params.color, params.quality);
            if (gearMesh) {
                this.updateGearStats(gearMesh);
            }
        }
    }

    generatePlanetaryGear() {
        console.log('Generating planetary assembly...');
        const params = this.gearParameters;

        const assemblyData = calculatePlanetaryGear(
            params.module,
            params.teeth, // Sun
            params.planetTeeth,
            params.planetCount,
            params.pressureAngle,
            params.faceWidth,
            params.quality
        );

        if (window.gearRenderer) {
            const assemblyGroup = window.gearRenderer.createPlanetaryGear(assemblyData, params.color, params.quality);
            if (assemblyGroup) {
                this.updateGearStats(assemblyGroup);
            }
        }
    }

    showComingSoonMessage(feature) {
        // Use i18n and system logic if available, otherwise fallback
        const message = window.i18n ? window.i18n.translate('status.comingSoon') : 'Coming Soon';
        alert(`🚧 ${feature}: ${message}`);

        // Highlight the feature as coming soon
        const element = document.querySelector(`[data-type="${feature}"]`);
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