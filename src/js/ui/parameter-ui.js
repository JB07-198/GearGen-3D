// Parameter UI Management
class ParameterUI {
    constructor() {
        this.parameters = {};
        this.init();
    }
    
    init() {
        console.log('Initializing parameter UI...');
        this.cacheElements();
        this.setupEventListeners();
        this.updateParameterInfo();
    }
    
    cacheElements() {
        // Cache all parameter inputs
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
    }
    
    setupEventListeners() {
        // Real-time updates for number inputs
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
                this.updateLivePreview();
            });
        });
        
        // Color input updates
        if (this.elements.color) {
            this.elements.color.addEventListener('input', (e) => {
                this.updateLivePreview();
            });
        }
    }
    
    validateInput(input) {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || Infinity;
        let value = parseFloat(input.value);
        
        if (isNaN(value)) {
            value = min;
        }
        
        if (value < min) {
            value = min;
        }
        
        if (value > max) {
            value = max;
        }
        
        input.value = value;
    }
    
    updateLivePreview() {
        // Debounce the preview update
        clearTimeout(this.previewTimeout);
        this.previewTimeout = setTimeout(() => {
            if (window.gearGenApp) {
                window.gearGenApp.generateGear();
            }
        }, 300);
    }
    
    updateParameterInfo() {
        // Add real-time calculation display
        const paramGroups = document.querySelectorAll('.parameter-group');
        
        paramGroups.forEach(group => {
            if (group.querySelector('h3').textContent.includes('Basic Dimensions')) {
                this.addCalculatedInfo(group);
            }
        });
    }
    
    addCalculatedInfo(container) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'calculated-info';
        infoDiv.innerHTML = `
            <div class="calc-item">
                <span class="calc-label">Pitch Diameter:</span>
                <span id="calc-pitch-dia" class="calc-value">40 mm</span>
            </div>
            <div class="calc-item">
                <span class="calc-label">Circular Pitch:</span>
                <span id="calc-circular-pitch" class="calc-value">6.28 mm</span>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .calculated-info {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 10px;
                margin-top: 10px;
                font-size: 0.9em;
            }
            .calc-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            .calc-label {
                color: #666;
            }
            .calc-value {
                font-weight: 600;
                color: #2c3e50;
            }
        `;
        
        container.appendChild(style);
        container.appendChild(infoDiv);
        
        // Update calculated values when parameters change
        this.updateCalculatedValues();
    }
    
    updateCalculatedValues() {
        if (!this.elements.module || !this.elements.teeth) return;
        
        const module = parseFloat(this.elements.module.value);
        const teeth = parseFloat(this.elements.teeth.value);
        
        if (module && teeth) {
            const pitchDiameter = module * teeth;
            const circularPitch = Math.PI * module;
            
            const pitchElement = document.getElementById('calc-pitch-dia');
            const circularElement = document.getElementById('calc-circular-pitch');
            
            if (pitchElement) {
                pitchElement.textContent = `${pitchDiameter.toFixed(2)} mm`;
            }
            
            if (circularElement) {
                circularElement.textContent = `${circularPitch.toFixed(2)} mm`;
            }
        }
    }
    
    getAllParameters() {
        const params = {};
        
        for (const [key, element] of Object.entries(this.elements)) {
            if (element) {
                if (element.type === 'number') {
                    params[key] = parseFloat(element.value);
                } else if (element.type === 'color') {
                    params[key] = element.value;
                } else {
                    params[key] = element.value;
                }
            }
        }
        
        return params;
    }
    
    setParameters(params) {
        for (const [key, value] of Object.entries(params)) {
            if (this.elements[key]) {
                this.elements[key].value = value;
            }
        }
    }
}

// Initialize parameter UI
document.addEventListener('DOMContentLoaded', () => {
    window.parameterUI = new ParameterUI();
});