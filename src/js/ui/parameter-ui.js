// ==========================================================================
// GearGen-3D Parameter UI Management
// Dual-control Synchronization, Real-Time KPIs & 60 FPS Throttled Generation
// ==========================================================================

class ParameterUI {
    constructor() {
        this.defaults = {
            module: 2.0,
            teeth_count: 20,
            planet_teeth: 10,
            planet_count: 3,
            worm_quotient: 10,
            helix_angle: 20,
            pitch_angle: 45,
            pressure_angle: 20,
            face_width: 10,
            hub_diameter: 10,
            bore_diameter: 5,
            gear_color: '#3B82F6',
            mesh_quality: 'medium'
        };

        this.isPendingUpdate = false;
        this.gearType = null;
        this.integerFields = new Set(['teeth_count', 'planet_teeth', 'planet_count']);
        this.paramKeys = {
            module: 'module',
            teeth: 'teeth_count',
            planetTeeth: 'planet_teeth',
            planetCount: 'planet_count',
            helixAngle: 'helix_angle',
            pitchAngle: 'pitch_angle',
            wormQuotient: 'worm_quotient',
            pressureAngle: 'pressure_angle',
            faceWidth: 'face_width',
            hubDiameter: 'hub_diameter',
            boreDiameter: 'bore_diameter',
            color: 'gear_color',
            quality: 'mesh_quality'
        };
        this.committed = {};      // last valid value of each numeric field; the only values the model reads
        this.lastDiagnostics = [];
        this.init();
    }

    init() {
        this.cacheElements();
        Object.keys(this.sliders).forEach(key => {
            this.committed[key] = parseFloat(this.inputs[key].value);
        });
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
            worm_quotient: document.getElementById('worm_quotient'),
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
            worm_quotient: document.getElementById('worm_quotient-slider'),
            face_width: document.getElementById('face_width-slider'),
            hub_diameter: document.getElementById('hub_diameter-slider'),
            bore_diameter: document.getElementById('bore_diameter-slider')
        };

        this.kpiPitchDiameter = document.getElementById('kpi-pitch-diameter');
        this.kpiCircularPitch = document.getElementById('kpi-circular-pitch');
        this.kpiLeadAngle = document.getElementById('kpi-lead-angle');
        this.kpiLeadAngleRow = document.getElementById('kpi-row-lead-angle');
        this.teethTitle = document.querySelector('#container-teeth_count .parameter-title');
        this.teethDesc = document.querySelector('#container-teeth_count .parameter-desc');
        this.colorHexValue = document.getElementById('color-hex-value');

        // Conditional containers
        this.helixAngleContainer = document.getElementById('container-helix_angle');
        this.pitchAngleContainer = document.getElementById('container-pitch_angle');
        this.wormQuotientContainer = document.getElementById('container-worm_quotient');
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
                // While typing, the text is never rewritten: a value is applied only if it is valid.
                input.addEventListener('input', () => {
                    const value = parseFloat(input.value);
                    const valid = this.isValidValue(key, value);
                    input.classList.toggle('input-invalid', !valid);
                    input.setAttribute('aria-invalid', String(!valid));
                    if (!valid) return;

                    this.committed[key] = value;
                    slider.value = value;
                    this.updatePresetChips(key, value);
                    this.updateCalculatedValues();
                    this.scheduleThrottledUpdate();
                });

                // Leaving the field or pressing Enter settles the text on a valid value.
                input.addEventListener('blur', () => this.finalizeInput(key));
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') this.finalizeInput(key);
                });

                // Slider changes
                slider.addEventListener('input', () => {
                    this.commitValue(key, parseFloat(slider.value));
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
                this.handlePresetSelect(targetId, val);
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

        // 5. Validation messages follow the interface language
        window.addEventListener('languageChanged', () => this.renderValidation(this.lastDiagnostics));

        // 6. Section / Group Reset Buttons
        document.querySelectorAll('.group-reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.getAttribute('data-section');
                this.resetSection(section);
            });
        });
    }

    handleStep(id, isPlus) {
        const input = this.inputs[id];
        if (!input) return;

        const step = parseFloat(input.step) || 1;
        const base = this.committed[id];
        // Round to the precision in play so that 2.2 + 0.1 gives 2.3, not 2.3000000000000003.
        const decimals = Math.max(this.countDecimals(step), this.countDecimals(base));
        const next = parseFloat((isPlus ? base + step : base - step).toFixed(decimals));

        this.commitValue(id, this.clampToField(id, next));
        this.updateCalculatedValues();
        this.scheduleThrottledUpdate();
    }

    handlePresetSelect(id, value) {
        if (!this.inputs[id]) return;

        this.commitValue(id, parseFloat(value));
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

    countDecimals(value) {
        return (String(value).split('.')[1] || '').length;
    }

    clampToField(key, value) {
        const input = this.inputs[key];
        return Math.min(parseFloat(input.max), Math.max(parseFloat(input.min), value));
    }

    isValidValue(key, value) {
        if (!Number.isFinite(value)) return false;
        if (this.integerFields.has(key) && !Number.isInteger(value)) return false;
        return this.clampToField(key, value) === value;
    }

    // Applies a valid value to the field, its slider and its preset chips.
    commitValue(key, value) {
        const input = this.inputs[key];
        this.committed[key] = value;
        if (parseFloat(input.value) !== value) input.value = value;
        input.classList.remove('input-invalid');
        input.removeAttribute('aria-invalid');
        if (this.sliders[key]) this.sliders[key].value = value;
        this.updatePresetChips(key, value);
    }

    // Empty text returns to the last valid value; anything else is rounded and clamped.
    finalizeInput(key) {
        let value = parseFloat(this.inputs[key].value);
        if (!Number.isFinite(value)) value = this.committed[key];
        if (this.integerFields.has(key)) value = Math.round(value);
        value = this.clampToField(key, value);

        const changed = value !== this.committed[key];
        this.commitValue(key, value);
        if (changed) {
            this.updateCalculatedValues();
            this.scheduleThrottledUpdate();
        }
    }

    // The "teeth" field holds the number of threads on a worm.
    teethLimits(gearType) {
        return gearType === 'worm'
            ? { min: 1, max: 4, default: 1 }
            : { min: 8, max: 200, default: this.defaults.teeth_count };
    }

    // Accepted values for every parameter, read from the form so that limits live in one place.
    getParameterRules(gearType = this.gearType) {
        const rules = {};
        Object.keys(this.paramKeys).forEach(param => {
            const key = this.paramKeys[param];
            const input = this.inputs[key];
            if (key === 'pressure_angle') {
                rules[param] = { type: 'enum', numeric: true, values: Array.from(input.options).map(o => parseFloat(o.value)) };
            } else if (key === 'mesh_quality') {
                rules[param] = { type: 'enum', values: Array.from(input.options).map(o => o.value.toLowerCase()) };
            } else if (key === 'gear_color') {
                rules[param] = { type: 'color' };
            } else if (key === 'teeth_count') {
                const { min, max } = this.teethLimits(gearType);
                rules[param] = { type: 'integer', min, max };
            } else {
                rules[param] = {
                    type: this.integerFields.has(key) ? 'integer' : 'number',
                    min: parseFloat(input.min),
                    max: parseFloat(input.max)
                };
            }
        });
        return rules;
    }

    setSelectValue(select, value) {
        if (!select) return;

        const raw = String(value);
        const options = Array.from(select.options);
        const direct = options.find(option => option.value === raw);
        if (direct) {
            select.value = direct.value;
            return;
        }

        const caseInsensitive = options.find(
            option => option.value.toLowerCase() === raw.toLowerCase()
        );
        if (caseInsensitive) {
            select.value = caseInsensitive.value;
            return;
        }

        const numeric = parseFloat(raw);
        if (Number.isFinite(numeric)) {
            const numericMatch = options.find(
                option => parseFloat(option.value) === numeric
            );
            if (numericMatch) select.value = numericMatch.value;
        }
    }

    // Reset sections
    resetSection(section) {
        const groupFields = {
            basic_dimensions: ['module', 'teeth_count', 'planet_teeth', 'planet_count', 'helix_angle', 'pitch_angle', 'worm_quotient', 'pressure_angle'],
            gear_body: ['face_width', 'hub_diameter', 'bore_diameter'],
            appearance: ['gear_color', 'mesh_quality']
        };

        const fields = groupFields[section] || [];
        fields.forEach(field => {
            const def = field === 'teeth_count' ? this.teethLimits(this.gearType).default : this.defaults[field];
            if (this.sliders[field]) {
                this.commitValue(field, def);
            } else if (this.inputs[field]) {
                if (field === 'pressure_angle' || field === 'mesh_quality') {
                    this.setSelectValue(this.inputs[field], def);
                } else {
                    this.inputs[field].value = def;
                }
                this.updatePresetChips(field, def);
            }
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

        requestAnimationFrame(() => {
            if (window.gearGenApp) {
                window.gearGenApp.generateGear();
            }
            this.isPendingUpdate = false;
        });
    }

    // KPI Formulas:
    // pitch_diameter = module * teeth_count (mm)
    // circular_pitch = PI * module (mm)
    updateCalculatedValues() {
        const moduleVal = this.committed.module;
        const teethVal = this.committed.teeth_count;
        const isWorm = this.gearType === 'worm';

        const pitchDiameter = moduleVal * (isWorm ? this.committed.worm_quotient : teethVal);
        const circularPitch = Math.PI * moduleVal;

        if (this.kpiLeadAngleRow) this.kpiLeadAngleRow.style.display = isWorm ? 'flex' : 'none';
        if (isWorm && this.kpiLeadAngle) {
            const leadAngle = Math.atan(teethVal / this.committed.worm_quotient) * 180 / Math.PI;
            this.kpiLeadAngle.textContent = `${leadAngle.toFixed(2)}°`;
        }

        if (this.kpiPitchDiameter) {
            this.kpiPitchDiameter.textContent = `${pitchDiameter.toFixed(2)} mm`;
        }
        if (this.kpiCircularPitch) {
            this.kpiCircularPitch.textContent = `${circularPitch.toFixed(2)} mm`;
        }
    }

    renderValidation(diagnostics) {
        const container = document.getElementById('validation-feedback');
        if (!container) return;
        this.lastDiagnostics = diagnostics || [];
        container.innerHTML = '';
        this.lastDiagnostics.forEach(d => {
            const div = document.createElement('div');
            div.className = 'validation-badge ' + (d.level || 'info');
            const msg = window.i18n ? window.i18n.translate(d.messageKey, d.params) : d.messageKey;
            div.textContent = msg;
            container.appendChild(div);
        });
    }

    setParameters(params) {
        if (!params) return;
        Object.keys(params).forEach(key => {
            const inputKey = this.paramKeys[key] || key;
            const input = this.inputs[inputKey];
            if (!input) return;

            if (this.sliders[inputKey]) {
                // An invalid value can never reach the model, whatever its origin.
                const value = Number(params[key]);
                if (this.isValidValue(inputKey, value)) this.commitValue(inputKey, value);
            } else {
                if (inputKey === 'pressure_angle' || inputKey === 'mesh_quality') {
                    this.setSelectValue(input, params[key]);
                } else {
                    input.value = params[key];
                }
                this.updatePresetChips(inputKey, params[key]);
            }
        });

        if (this.colorHexValue && this.inputs.gear_color) {
            this.colorHexValue.textContent = this.inputs.gear_color.value.toUpperCase();
        }

        this.updateCalculatedValues();
    }

    getAllParameters() {
        // Text being typed is ignored: the model only sees the last valid values.
        return {
            module: this.committed.module,
            teeth: this.committed.teeth_count,
            planetTeeth: this.committed.planet_teeth,
            planetCount: this.committed.planet_count,
            helixAngle: this.committed.helix_angle,
            pitchAngle: this.committed.pitch_angle,
            wormQuotient: this.committed.worm_quotient,
            pressureAngle: parseFloat(this.inputs.pressure_angle?.value) || 20,
            faceWidth: this.committed.face_width,
            hubDiameter: this.committed.hub_diameter,
            boreDiameter: this.committed.bore_diameter,
            color: this.inputs.gear_color?.value || '#3B82F6',
            quality: (this.inputs.mesh_quality?.value || 'medium').toLowerCase()
        };
    }

    // Adapts the "teeth" field to the gear type: limits, label, and a value that fits them.
    applyTeethField(gearType) {
        const input = this.inputs.teeth_count;
        const slider = this.sliders.teeth_count;
        const limits = this.teethLimits(gearType);

        [input, slider].forEach(el => {
            el.min = limits.min;
            el.max = limits.max;
        });

        const isWorm = gearType === 'worm';
        const labels = [
            [this.teethTitle, isWorm ? 'param.starts' : 'param.teeth'],
            [this.teethDesc, isWorm ? 'param.starts.desc' : 'param.teeth.desc']
        ];
        labels.forEach(([el, key]) => {
            if (!el) return;
            el.setAttribute('data-i18n', key);
            if (window.i18n) el.textContent = window.i18n.translate(key);
        });

        const current = this.committed.teeth_count;
        this.commitValue('teeth_count', this.isValidValue('teeth_count', current) ? current : limits.default);
    }

    updateVisibility(gearType) {
        this.gearType = gearType;
        this.applyTeethField(gearType);

        if (this.helixAngleContainer) {
            this.helixAngleContainer.style.display = gearType === 'helical' ? 'flex' : 'none';
        }

        if (this.wormQuotientContainer) {
            this.wormQuotientContainer.style.display = gearType === 'worm' ? 'flex' : 'none';
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
