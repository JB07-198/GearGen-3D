// Parameter UI Management
class ParameterUI {
    constructor() {
        this.defaults = {
            module: 2,
            teeth: 20,
            pressureAngle: '20',
            faceWidth: 10,
            hubDiameter: 10,
            boreDiameter: 5,
            color: '#3498db',
            quality: 'medium'
        };
        this.init();
    }

    init() {
        console.log('Initializing premium parameter UI...');
        this.cacheElements();
        this.setupEventListeners();
        this.updateCalculatedValues();
    }

    cacheElements() {
        this.elements = {
            module: document.getElementById('module'),
            teeth: document.getElementById('teeth'),
            pressureAngle: document.getElementById('pressure-angle'),
            faceWidth: document.getElementById('face-width'),
            hubDiameter: document.getElementById('hub-diameter'),
            boreDiameter: document.getElementById('bore-diameter'),
            color: document.getElementById('color'),
            quality: document.getElementById('quality')
        };

        this.sliders = {
            module: document.getElementById('module-slider'),
            teeth: document.getElementById('teeth-slider'),
            faceWidth: document.getElementById('face-width-slider'),
            hubDiameter: document.getElementById('hub-diameter-slider'),
            boreDiameter: document.getElementById('bore-diameter-slider')
        };

        this.calcContainer = document.getElementById('calculated-info-container');
    }

    setupEventListeners() {
        // 1. Dual Control Synchronization (Sliders & Number Inputs)
        Object.keys(this.sliders).forEach(key => {
            const input = this.elements[key];
            const slider = this.sliders[key];

            if (input && slider) {
                // Number input changes -> Update slider
                input.addEventListener('input', (e) => {
                    this.validateInput(e.target);
                    slider.value = e.target.value;
                    this.updateLivePreview();
                    this.updatePresetChips(key, e.target.value);
                });

                // Slider changes -> Update number input
                slider.addEventListener('input', (e) => {
                    input.value = e.target.value;
                    this.updateLivePreview();
                    this.updatePresetChips(key, e.target.value);
                });
            }
        });

        // 2. Step Buttons (+/-)
        document.querySelectorAll('.step-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-target');
                const isPlus = btn.classList.contains('plus');
                this.handleStepAction(targetId, isPlus);
            });
        });

        // 3. Preset Chips
        document.querySelectorAll('.preset-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const targetId = chip.parentElement.getAttribute('data-target');
                const value = chip.getAttribute('data-value');
                this.handlePresetAction(targetId, value, chip);
            });
        });

        // 4. Group Resets
        document.querySelectorAll('.group-reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.getAttribute('data-group');
                this.handleGroupReset(group);
            });
        });

        // 5. Selects and Color
        this.elements.pressureAngle.addEventListener('change', () => this.updateLivePreview());
        this.elements.color.addEventListener('input', () => this.updateLivePreview());
        this.elements.quality.addEventListener('change', () => this.updateLivePreview());
    }

    handleStepAction(id, isPlus) {
        const input = this.elements[id];
        const slider = this.sliders[id];
        if (!input) return;

        const step = parseFloat(input.step) || 1;
        let val = parseFloat(input.value);

        val = isPlus ? val + step : val - step;

        input.value = val;
        this.validateInput(input);
        if (slider) slider.value = input.value;

        this.updateLivePreview();
        this.updatePresetChips(id, input.value);

        // Visual feedback
        input.classList.add('pulse');
        setTimeout(() => input.classList.remove('pulse'), 200);
    }

    handlePresetAction(id, value, chip) {
        const input = this.elements[id];
        const slider = this.sliders[id];
        if (!input) return;

        input.value = value;
        if (slider) slider.value = value;

        // Update active state
        chip.parentElement.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        this.updateLivePreview();
    }

    updatePresetChips(id, value) {
        const container = document.querySelector(`.preset-chips[data-target="${id}"]`);
        if (!container) return;

        container.querySelectorAll('.preset-chip').forEach(chip => {
            if (parseFloat(chip.getAttribute('data-value')) === parseFloat(value)) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    handleGroupReset(group) {
        const groups = {
            basic: ['module', 'teeth', 'pressureAngle'],
            body: ['faceWidth', 'hubDiameter', 'boreDiameter'],
            appearance: ['color', 'quality']
        };

        const keys = groups[group] || [];
        keys.forEach(key => {
            const val = this.defaults[key];
            if (this.elements[key]) this.elements[key].value = val;
            if (this.sliders[key]) this.sliders[key].value = val;
            this.updatePresetChips(key, val);
        });

        this.updateLivePreview();
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

    updateLivePreview() {
        clearTimeout(this.previewTimeout);
        this.previewTimeout = setTimeout(() => {
            if (window.gearGenApp) {
                window.gearGenApp.generateGear();
            }
            this.updateCalculatedValues();
        }, 300);
    }

    updateCalculatedValues() {
        if (!this.elements.module || !this.elements.teeth || !this.calcContainer) return;

        const m = parseFloat(this.elements.module.value);
        const z = parseFloat(this.elements.teeth.value);

        const pitchDia = m * z;
        const circPitch = Math.PI * m;

        this.calcContainer.innerHTML = `
            <div class="calc-row">
                <span class="calc-tag" data-i18n="calc.pitchDiameter">Pitch Diameter</span>
                <span class="calc-val">${pitchDia.toFixed(2)} mm</span>
            </div>
            <div class="calc-row">
                <span class="calc-tag" data-i18n="calc.circularPitch">Circular Pitch</span>
                <span class="calc-val">${circPitch.toFixed(2)} mm</span>
            </div>
        `;

        if (window.i18n) window.i18n.applyLanguage();
    }

    getAllParameters() {
        const params = {};
        for (const [key, el] of Object.entries(this.elements)) {
            if (el) params[key] = (el.type === 'number' || el.type === 'range') ? parseFloat(el.value) : el.value;
        }
        return params;
    }

    setParameters(params) {
        for (const [key, val] of Object.entries(params)) {
            if (this.elements[key]) {
                this.elements[key].value = val;
                if (this.sliders[key]) this.sliders[key].value = val;
                this.updatePresetChips(key, val);
            }
        }
    }
}

// Initialize parameter UI
document.addEventListener('DOMContentLoaded', () => {
    window.parameterUI = new ParameterUI();
});