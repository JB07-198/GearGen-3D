// ==========================================================================
// GearGen-3D Parameter UI Management
// Dual-control Synchronization, Real-Time KPIs & 60 FPS Throttled Generation
// JSON Spec Compliant
// ==========================================================================

class ParameterUI {
    constructor() {
        this.defaults = {
            module: 2.0,
            teeth_count: 20,
            planet_teeth: 12,
            planet_count: 3,
            helix_angle: 20,
            pitch_angle: 45,
            pressure_angle: 20.0,
            face_width: 10,
            hub_diameter: 10,
            bore_diameter: 5,
            gear_color: '#3B82F6',
            mesh_quality: 'Medium'
        };

        this.rafId = null;
        this.isPendingUpdate = false;
        this.init();
    }

    init() {
        console.log('Initializing CAD Parameter UI...');
        this.cacheElements();
        this.setupEventListeners();
        this.updateCalculatedValues();
    }

    cacheElements() {
        this.inputs = {
            module: document.getElementById('module'),
            teeth_count: document.getElementById('teeth_count'),
            planet_teeth: document.getElementById('planet_teeth'),
            planet_count: document.getElementById('planet_count'),
            helix_angle: document.getElementById('helix_angle'),
            pitch_angle: document.getElementById('pitch_angle'),
            pressure_angle: document.getElementById('pressure_angle'),
            face_width: document.getElementById('face_width'),
            hub_diameter: document.getElementById('hub_diameter'),
            bore_diameter: document.getElementById('bore_diameter'),
            gear_color: document.getElementById('gear_color'),
            mesh_quality: document.getElementById('mesh_quality')
        };

        this.sliders = {
            module: document.getElementById('module-slider'),
            teeth_count: document.getElementById('teeth_count-slider'),
            planet_teeth: document.getElementById('planet_teeth-slider'),
            planet_count: document.getElementById('planet_count-slider'),
            helix_angle: document.getElementById('helix_angle-slider'),
            pitch_angle: document.getElementById('pitch_angle-slider'),
            face_width: document.getElementById('face_width-slider'),
            hub_diameter: document.getElementById('hub_diameter-slider'),
            bore_diameter: document.getElementById('bore_diameter-slider')
        };

        this.kpiPitchDiameter = document.getElementById('kpi-pitch-diameter');
        this.kpiCircularPitch = document.getElementById('kpi-circular-pitch');
        this.colorHexValue = document.getElementById('color-hex-value');

        // Conditional containers
        this.helixAngleContainer = document.getElementById('container-helix_angle');
        this.pitchAngleContainer = document.getElementById('container-pitch_angle');
        this.planetTeethContainer = document.getElementById('container-planet_teeth');
        this.planetCountContainer = document.getElementById('container-planet_count');
        this.hubDiameterContainer = document.getElementById('container-hub_diameter');
        this.boreDiameterContainer = document.getElementById('container-bore_diameter');
    }

    setupEventListeners() {
        // 1. Dual Control Sync: Number Input <-> Slider
        Object.keys(this.sliders).forEach(key => {
            const input = this.inputs[key];
            const slider = this.sliders[key];

            if (input && slider) {
                // Number input changes
                input.addEventListener('input', () => {
                    this.validateInput(input);
                    slider.value = input.value;
                    this.updatePresetChips(key, input.value);
                    this.updateCalculatedValues();
                    this.scheduleThrottledUpdate();
                });

                // Slider changes
                slider.addEventListener('input', () => {
                    input.value = slider.value;
                    this.updatePresetChips(key, slider.value);
                    this.updateCalculatedValues();
                    this.scheduleThrottledUpdate();
                });
            }
        });

        // 2. Step Buttons (+ / -)
        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const isPlus = btn.classList.contains('plus');
                this.handleStep(targetId, isPlus);
            });
        });

        // 3. Preset Chips (e.g. Module presets: 1.0, 1.5, 2.0, 2.5, 3.0, 4.0)
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const targetId = chip.parentElement.getAttribute('data-target');
                const val = chip.getAttribute('data-value');
                this.handlePresetSelect(targetId, val, chip);
            });
        });

        // 4. Selects & Color Picker
        if (this.inputs.pressure_angle) {
            this.inputs.pressure_angle.addEventListener('change', () => {
                this.updateCalculatedValues();
                this.scheduleThrottledUpdate();
            });
        }

        if (this.inputs.mesh_quality) {
            this.inputs.mesh_quality.addEventListener('change', () => {
                this.scheduleThrottledUpdate();
            });
        }

        if (this.inputs.gear_color) {
            this.inputs.gear_color.addEventListener('input', (e) => {
                if (this.colorHexValue) this.colorHexValue.textContent = e.target.value.toUpperCase();
                this.scheduleThrottledUpdate();
            });
        }

        // 5. Section / Group Reset Buttons
        document.querySelectorAll('.group-reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.resetSection(section);
            });
        });
    }

    handleStep(id, isPlus) {
        const input = this.inputs[id];
        const slider = this.sliders[id];
        if (!input) return;

        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value) || 0;
        val = isPlus ? val + step : val - step;

        input.value = val;
        this.validateInput(input);
        if (slider) slider.value = input.value;

        this.updatePresetChips(id, input.value);
        this.updateCalculatedValues();
        this.scheduleThrottledUpdate();
    }

    handlePresetSelect(id, value, activeChip) {
        const input = this.inputs[id];
        const slider = this.sliders[id];
        if (!input) return;

        input.value = value;
        if (slider) slider.value = value;

        activeChip.parentElement.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        activeChip.classList.add('active');

        this.updateCalculatedValues();
        this.scheduleThrottledUpdate();
    }

    updatePresetChips(id, value) {
        const container = document.querySelector(`.preset-chips[data-target="${id}"]`);
        if (!container) return;

        const numVal = parseFloat(value);
        container.querySelectorAll('.preset-chip').forEach(chip => {
            const chipVal = parseFloat(chip.getAttribute('data-value'));
            if (chipVal === numVal) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    validateInput(input) {
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        let val = parseFloat(input.value);

        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;

        input.value = val;
    }

    // Reset sections based on JSON spec functional inventory
    resetSection(section) {
        const groupFields = {
            basic_dimensions: ['module', 'teeth_count', 'planet_teeth', 'planet_count', 'helix_angle', 'pitch_angle', 'pressure_angle'],
            gear_body: ['face_width', 'hub_diameter', 'bore_diameter'],
            appearance: ['gear_color', 'mesh_quality']
        };

        const fields = groupFields[section] || [];
        fields.forEach(field => {
            const def = this.defaults[field];
            if (this.inputs[field]) this.inputs[field].value = def;
            if (this.sliders[field]) this.sliders[field].value = def;
            this.updatePresetChips(field, def);
        });

        if (section === 'appearance' && this.colorHexValue && this.inputs.gear_color) {
            this.colorHexValue.textContent = this.inputs.gear_color.value.toUpperCase();
        }

        this.updateCalculatedValues();
        this.scheduleThrottledUpdate();
    }

    resetAll() {
        this.resetSection('basic_dimensions');
        this.resetSection('gear_body');
        this.resetSection('appearance');
    }

    // 60 FPS Throttled Mesh Regeneration
    scheduleThrottledUpdate() {
        if (this.isPendingUpdate) return;
        this.isPendingUpdate = true;

        this.rafId = requestAnimationFrame(() => {
            if (window.gearGenApp) {
                window.gearGenApp.generateGear();
            }
            this.isPendingUpdate = false;
        });
    }

    // KPI Formulas as specified in JSON:
    // pitch_diameter = module * teeth_count (mm)
    // circular_pitch = PI * module (mm)
    updateCalculatedValues() {
        const moduleVal = parseFloat(this.inputs.module?.value) || 2.0;
        const teethVal = parseFloat(this.inputs.teeth_count?.value) || 20;

        const pitchDiameter = moduleVal * teethVal;
        const circularPitch = Math.PI * moduleVal;

        if (this.kpiPitchDiameter) {
            this.kpiPitchDiameter.textContent = `${pitchDiameter.toFixed(2)} mm`;
        }
        if (this.kpiCircularPitch) {
            this.kpiCircularPitch.textContent = `${circularPitch.toFixed(2)} mm`;
        }
    }

    getAllParameters() {
        return {
            module: parseFloat(this.inputs.module?.value) || 2.0,
            teeth: parseFloat(this.inputs.teeth_count?.value) || 20,
            planetTeeth: parseFloat(this.inputs.planet_teeth?.value) || 12,
            planetCount: parseFloat(this.inputs.planet_count?.value) || 3,
            helixAngle: parseFloat(this.inputs.helix_angle?.value) || 20,
            pitchAngle: parseFloat(this.inputs.pitch_angle?.value) || 45,
            pressureAngle: parseFloat(this.inputs.pressure_angle?.value) || 20.0,
            faceWidth: parseFloat(this.inputs.face_width?.value) || 10,
            hubDiameter: parseFloat(this.inputs.hub_diameter?.value) || 10,
            boreDiameter: parseFloat(this.inputs.bore_diameter?.value) || 5,
            color: this.inputs.gear_color?.value || '#3B82F6',
            quality: (this.inputs.mesh_quality?.value || 'Medium').toLowerCase()
        };
    }

    updateVisibility(gearType) {
        if (this.helixAngleContainer) {
            this.helixAngleContainer.style.display = (gearType === 'helical' || gearType === 'worm') ? 'flex' : 'none';
        }

        if (this.pitchAngleContainer) {
            this.pitchAngleContainer.style.display = gearType === 'bevel' ? 'flex' : 'none';
        }

        if (this.planetTeethContainer) {
            this.planetTeethContainer.style.display = gearType === 'planetary' ? 'flex' : 'none';
        }

        if (this.planetCountContainer) {
            this.planetCountContainer.style.display = gearType === 'planetary' ? 'flex' : 'none';
        }

        // Hide Hub and Bore for Rack, Internal and Planetary
        const hideBody = (gearType === 'rack' || gearType === 'internal' || gearType === 'planetary');
        if (this.hubDiameterContainer) this.hubDiameterContainer.style.display = hideBody ? 'none' : 'flex';
        if (this.boreDiameterContainer) this.boreDiameterContainer.style.display = hideBody ? 'none' : 'flex';

        this.updateCalculatedValues();
    }
}
