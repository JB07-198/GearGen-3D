// ==========================================================================
// GearGen-3D Main Application Controller
// Front-End & Three.js Engineering Orchestrator (JSON Spec Compliant)
// ==========================================================================

class GearGenApp {
    constructor() {
        this.currentGearType = 'spur';
        this.hasGeneratedMesh = false;
        this.init();
    }

    init() {
        console.log('GearGen-3D Application Initializing...');

        // 1. Initialize Core 3D Engine
        window.threeJSSetup = new ThreeJSSetup();
        window.sceneManager = new SceneManager();
        window.gearRenderer = new GearRenderer();

        // 2. Initialize Exporters
        window.stlExporter = new STLExporter();
        window.stepExporter = new STEPExporter();

        // 3. Initialize UI Components
        window.parameterUI = new ParameterUI();
        window.navigation = new Navigation();
        window.exportUI = new ExportUI();
        window.mobileUI = new MobileUI();

        // 4. Setup Event Listeners & Shortcuts
        this.setupGearTypeSelector();
        this.setupFloatingToolbar();
        this.setupKeyboardShortcuts();

        // 5. Generate Initial Gear
        this.setGearType('spur');
    }

    setupGearTypeSelector() {
        const cards = document.querySelectorAll('.gear-type-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const type = card.getAttribute('data-type');
                if (type) {
                    this.setGearType(type);
                }
            });
        });
    }

    setGearType(type) {
        console.log(`Setting active gear type: ${type}`);
        this.currentGearType = type;

        // Update card active states
        document.querySelectorAll('.gear-type-card').forEach(card => {
            const cardType = card.getAttribute('data-type');
            card.classList.toggle('active', cardType === type);
        });

        // Update parameter visibility based on type
        if (window.parameterUI) {
            window.parameterUI.updateVisibility(type);
        }

        // Generate geometry
        this.generateGear();
    }

    generateGear() {
        if (!window.parameterUI || !window.gearRenderer) return;

        const params = window.parameterUI.getAllParameters();
        console.log(`Generating 3D gear [${this.currentGearType}] with parameters:`, params);

        let gearMesh = null;

        try {
            switch (this.currentGearType) {
                case 'spur': {
                    const data = calculateSpurGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.faceWidth, params.hubDiameter, params.boreDiameter, params.quality
                    );
                    gearMesh = window.gearRenderer.createSpurGear(data, params.color, params.quality);
                    break;
                }
                case 'helical': {
                    const data = calculateHelicalGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.helixAngle, params.faceWidth, params.hubDiameter, params.boreDiameter, params.quality
                    );
                    gearMesh = window.gearRenderer.createHelicalGear(data, params.color, params.quality);
                    break;
                }
                case 'bevel': {
                    const data = calculateBevelGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.pitchAngle, params.faceWidth, params.hubDiameter, params.boreDiameter, params.quality
                    );
                    gearMesh = window.gearRenderer.createBevelGear(data, params.color, params.quality);
                    break;
                }
                case 'worm': {
                    const data = calculateWormGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.helixAngle, params.faceWidth, params.hubDiameter, params.boreDiameter, params.quality
                    );
                    gearMesh = window.gearRenderer.createWormGear(data, params.color, params.quality);
                    break;
                }
                case 'rack': {
                    const data = calculateRackGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.faceWidth, params.quality
                    );
                    gearMesh = window.gearRenderer.createRackGear(data, params.color, params.quality);
                    break;
                }
                case 'internal': {
                    const data = calculateInternalGear(
                        params.module, params.teeth, params.pressureAngle,
                        params.faceWidth, params.quality
                    );
                    gearMesh = window.gearRenderer.createInternalGear(data, params.color, params.quality);
                    break;
                }
                case 'planetary': {
                    const data = calculatePlanetaryGear(
                        params.module, params.teeth, params.planetTeeth,
                        params.planetCount, params.pressureAngle, params.faceWidth, params.quality
                    );
                    gearMesh = window.gearRenderer.createPlanetaryGear(data, params.color, params.quality);
                    break;
                }
                default:
                    console.warn(`Gear type "${this.currentGearType}" not handled.`);
            }

            if (gearMesh && window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
                this.updateExportStatus(true);
            } else {
                this.updateExportStatus(false);
            }
        } catch (error) {
            console.error('Error during gear generation:', error);
            this.updateExportStatus(false);
        }
    }

    updateExportStatus(hasValidMesh) {
        this.hasGeneratedMesh = hasValidMesh;

        // Dynamically toggle File -> Export STL and STEP
        const exportStlItem = document.getElementById('export_stl');
        const exportStepItem = document.getElementById('export_step');

        if (exportStlItem) exportStlItem.disabled = !hasValidMesh;
        if (exportStepItem) exportStepItem.disabled = !hasValidMesh;
    }

    setupFloatingToolbar() {
        const toolbarActions = {
            reset_view: () => window.sceneManager?.resetCamera(),
            iso_view: () => window.sceneManager?.setCameraView('isometric'),
            top_view: () => window.sceneManager?.setCameraView('top'),
            front_view: () => window.sceneManager?.setCameraView('front'),
            side_view: () => window.sceneManager?.setCameraView('side'),
            zoom_in: () => window.sceneManager?.zoom(0.8),
            zoom_out: () => window.sceneManager?.zoom(1.25),
            toggle_grid: (btn) => {
                const active = window.sceneManager?.toggleGrid();
                btn.classList.toggle('active', !!active);
            },
            toggle_axis: (btn) => {
                const active = window.sceneManager?.toggleAxis();
                btn.classList.toggle('active', !!active);
            },
            toggle_wireframe: (btn) => {
                const active = window.sceneManager?.toggleWireframe();
                btn.classList.toggle('active', !!active);
            }
        };

        Object.keys(toolbarActions).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toolbarActions[id](btn);
                });
            }
        });
    }

    setupKeyboardShortcuts() {
        // Keyboard Shortcuts mapping exactly as defined in JSON spec
        document.addEventListener('keydown', (e) => {
            // Do not fire shortcuts while typing in inputs
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;

            const code = e.code;
            const key = e.key;

            if (code === 'KeyR' || key === 'r' || key === 'R') {
                window.sceneManager?.setCameraView('isometric');
            } else if (code === 'Digit1' || code === 'Numpad1') {
                window.sceneManager?.setCameraView('top');
            } else if (code === 'Digit2' || code === 'Numpad2') {
                window.sceneManager?.setCameraView('front');
            } else if (code === 'Digit3' || code === 'Numpad3') {
                window.sceneManager?.setCameraView('side');
            } else if (code === 'Digit0' || code === 'Numpad0') {
                window.sceneManager?.resetCamera();
            } else if (code === 'KeyG' || key === 'g' || key === 'G') {
                const active = window.sceneManager?.toggleGrid();
                document.getElementById('toggle_grid')?.classList.toggle('active', !!active);
            } else if (code === 'KeyA' || key === 'a' || key === 'A') {
                const active = window.sceneManager?.toggleAxis();
                document.getElementById('toggle_axis')?.classList.toggle('active', !!active);
            } else if (code === 'KeyW' || key === 'w' || key === 'W') {
                const active = window.sceneManager?.toggleWireframe();
                document.getElementById('toggle_wireframe')?.classList.toggle('active', !!active);
            } else if (code === 'NumpadAdd' || key === '+' || key === '=') {
                window.sceneManager?.zoom(0.8);
            } else if (code === 'NumpadSubtract' || key === '-') {
                window.sceneManager?.zoom(1.25);
            }
        });
    }

    exportSTL() {
        if (!this.hasGeneratedMesh) {
            alert(window.i18n ? window.i18n.translate('modal.export.noMesh') : 'No gear mesh available.');
            return;
        }

        const params = window.parameterUI ? window.parameterUI.getAllParameters() : {};
        params.type = this.currentGearType;

        if (window.stlExporter) {
            window.stlExporter.exportCurrentGear(params);
            if (window.exportUI) {
                const name = `${params.type}gear_m${params.module}_Z${params.teeth}.stl`;
                const msg = `${window.i18n ? window.i18n.translate('export.success') : 'Downloaded'} ${name}`;
                window.exportUI.showToast(msg);
            }
        }
    }

    exportSTEP() {
        if (!this.hasGeneratedMesh) {
            alert(window.i18n ? window.i18n.translate('modal.export.noMesh') : 'No gear mesh available.');
            return;
        }

        const params = window.parameterUI ? window.parameterUI.getAllParameters() : {};
        params.type = this.currentGearType;

        if (window.stepExporter) {
            window.stepExporter.exportCurrentGear(params);
            if (window.exportUI) {
                const name = `${params.type}gear_m${params.module}_Z${params.teeth}.step`;
                const msg = `${window.i18n ? window.i18n.translate('export.success') : 'Downloaded'} ${name}`;
                window.exportUI.showToast(msg);
            }
        }
    }
}

// Bootstrap Application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.gearGenApp = new GearGenApp();
});
