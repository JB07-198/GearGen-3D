// ==========================================================================
// GearGen-3D Main Application Controller
// Front-End & Three.js Engineering Orchestrator (JSON Spec Compliant)
// ==========================================================================

class GearGenApp {
    constructor() {
        this.currentGearType = null;
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
        window.dxfExporter = new DXFExporter();

        // 3. Initialize UI Components
        window.parameterUI = new ParameterUI();
        window.navigation = new Navigation();
        window.exportUI = new ExportUI();
        window.mobileUI = new MobileUI();

        // Managers
        this.configManager = new ConfigManager(this);
        this.urlStateManager = new UrlStateManager(this);
        window.configManager = this.configManager;
        window.urlStateManager = this.urlStateManager;

        // 4. Setup Event Listeners & Shortcuts
        this.setupGearTypeSelector();
        this.setupFloatingToolbar();
        this.setupKeyboardShortcuts();
        this.setupMenuDelegation();

        // 5. Restore state or show welcome modal
        const urlState = this.urlStateManager ? this.urlStateManager.loadFromURL() : null;
        const stored = (!urlState && this.configManager) ? this.configManager.loadFromLocalStorage() : null;
        const restored = urlState || stored;

        if (restored && restored.gearType) {
            this.setGearType(restored.gearType, { generate: false });
            if (restored.parameters && window.parameterUI) {
                window.parameterUI.setParameters(restored.parameters);
            }
            this.generateGear();
        } else {
            // default fallback
            let showWelcome = true;
            try {
                if (localStorage.getItem('geargen-show-welcome') === 'false') showWelcome = false;
            } catch (e) {}
            if (showWelcome && window.WelcomeModal) {
                const modal = new WelcomeModal(this);
                modal.show();
            } else {
                this.setGearType('spur');
            }
        }
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

    setGearType(type, { generate = true } = {}) {
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

        // Generate geometry unless the caller is restoring parameters first.
        if (generate) {
            this.generateGear();
        }
    }

    generateGear() {
        if (!this.currentGearType) {
            this.updateExportStatus(false);
            return;
        }
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
            }

            const diagnostics = (window.GearValidator && params) ? window.GearValidator.validate(params, this.currentGearType) : [];
            if (window.parameterUI && typeof window.parameterUI.renderValidation === 'function') {
                window.parameterUI.renderValidation(diagnostics);
            }
            const hasErrors = diagnostics.some(d => d.level === 'error');
            this.updateExportStatus(!!gearMesh && !hasErrors);

            if (this.urlStateManager) this.urlStateManager.updateURL(params, this.currentGearType);
            if (this.configManager) {
                clearTimeout(this._saveTimer);
                this._saveTimer = setTimeout(() => this.configManager.saveToLocalStorage(), 300);
            }
        } catch (error) {
            console.error('Error during gear generation:', error);
            this.updateExportStatus(false);
        }
    }

    updateExportStatus(hasValidMesh) {
        this.hasGeneratedMesh = hasValidMesh;

        // Dynamically toggle File -> Export STL, STEP and DXF
        const exportStlItem = document.getElementById('export_stl');
        const exportStepItem = document.getElementById('export_step');
        const exportDxfItem = document.getElementById('export_dxf');

        if (exportStlItem) exportStlItem.disabled = !hasValidMesh;
        if (exportStepItem) exportStepItem.disabled = !hasValidMesh;
        if (exportDxfItem) exportDxfItem.disabled = !hasValidMesh || this.currentGearType !== 'spur';
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

    closeTopMenus() {
        document.querySelectorAll('.menu-dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.menu-btn').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }

    setFloatingButtonState(buttonId, isActive) {
        const button = document.getElementById(buttonId);
        if (button) button.classList.toggle('active', !!isActive);
    }

    handleTopMenuAction(action, target, item, param) {
        switch (action) {
            case 'RESET_ALL_PARAMS':
                if (window.parameterUI) {
                    window.parameterUI.resetAll();
                }
                break;
            case 'RESET_SECTION':
                if (window.parameterUI && target) {
                    window.parameterUI.resetSection(target);
                }
                break;
            case 'EXPORT_STL':
                this.exportSTL();
                break;
            case 'EXPORT_STEP':
                this.exportSTEP();
                break;
            case 'EXPORT_DXF':
                this.exportDXF();
                break;
            case 'EXPORT_CONFIG':
                if (this.configManager) this.configManager.exportJSON();
                break;
            case 'IMPORT_CONFIG': {
                const input = document.getElementById('config-file-input');
                if (input) {
                    input.onchange = async (e) => {
                        const file = e.target.files && e.target.files[0];
                        if (file && this.configManager) await this.configManager.importJSON(file);
                        e.target.value = '';
                    };
                    input.click();
                }
                break;
            }
            case 'SET_CAMERA_VIEW':
                if (param && window.sceneManager) window.sceneManager.setCameraView(param);
                break;
            case 'RESET_CAMERA':
                if (window.sceneManager) window.sceneManager.resetCamera();
                break;
            case 'TOGGLE_HELPER':
                if (target === 'grid' && window.sceneManager) {
                    const v = window.sceneManager.toggleGrid();
                    if (item) item.classList.toggle('active', !!v);
                    this.setFloatingButtonState('toggle_grid', v);
                } else if (target === 'axis' && window.sceneManager) {
                    const v = window.sceneManager.toggleAxis();
                    if (item) item.classList.toggle('active', !!v);
                    this.setFloatingButtonState('toggle_axis', v);
                }
                break;
            case 'TOGGLE_RENDER_MODE':
                if (target === 'wireframe' && window.sceneManager) {
                    const v = window.sceneManager.toggleWireframe();
                    if (item) item.classList.toggle('active', !!v);
                    this.setFloatingButtonState('toggle_wireframe', v);
                }
                break;
            case 'OPEN_MODAL':
                if (target === 'help' && window.navigation) window.navigation.showHelpModal();
                else if (target === 'documentation' && window.navigation) window.navigation.showDocumentationModal();
                break;
            case 'OPEN_EXTERNAL': {
                const urlMap = {
                    github_repo: 'https://github.com/JB07-198/GearGen-3D',
                    github_issues: 'https://github.com/JB07-198/GearGen-3D/issues',
                    contact_link: 'mailto:contacte.baiha@gmail.com'
                };
                const u = urlMap[item.dataset.url];
                if (u) {
                    if (u.startsWith('mailto')) window.location.href = u;
                    else window.open(u, '_blank');
                }
                break;
            }
        }
    }

    setupMenuDelegation() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.menu-btn');
            if (btn) {
                const menuId = 'menu-' + btn.dataset.menu;
                const dropdown = document.getElementById(menuId);
                const isOpen = dropdown && dropdown.classList.contains('open');
                this.closeTopMenus();
                if (dropdown && !isOpen) {
                    dropdown.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
                return;
            }

            const item = e.target.closest('.menu-item');
            if (item) {
                if (item.disabled) {
                    this.closeTopMenus();
                    return;
                }
                const action = item.dataset.action;
                const target = item.dataset.target;
                this.handleTopMenuAction(action, target, item, item.dataset.param);
                this.closeTopMenus();
                return;
            }

            if (!e.target.closest('.menu-group')) {
                this.closeTopMenus();
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

    exportDXF() {
        if (this.currentGearType !== 'spur') {
            alert(window.i18n ? window.i18n.translate('export.dxfSpurOnly') : 'DXF export is only available for spur gears.');
            return;
        }

        if (!this.hasGeneratedMesh) {
            alert(window.i18n ? window.i18n.translate('modal.export.noMesh') : 'No gear mesh available.');
            return;
        }

        const params = window.parameterUI ? window.parameterUI.getAllParameters() : {};
        params.type = this.currentGearType;

        if (window.dxfExporter) {
            const filename = window.dxfExporter.exportCurrentGear(params);
            if (filename && window.exportUI) {
                const msg = `${window.i18n ? window.i18n.translate('export.success') : 'Downloaded'} ${filename}`;
                window.exportUI.showToast(msg);
            }
        }
    }
}

// Bootstrap Application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.gearGenApp = new GearGenApp();
});
