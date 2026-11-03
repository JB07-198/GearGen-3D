// ConfigManager: JSON import/export + localStorage persistence
class ConfigManager {
    constructor(app) {
        this.app = app;
    }

    exportJSON() {
        if (!this.app || !this.app.currentGearType) return;
        const params = window.parameterUI ? window.parameterUI.getAllParameters() : this.app.gearParameters;
        const payload = {
            schema_version: '1.0',
            timestamp: new Date().toISOString(),
            gearType: this.app.currentGearType,
            parameters: params
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `geargen-${this.app.currentGearType}-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async importJSON(file) {
        if (!file) return false;
        const text = await file.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            alert('Invalid JSON file.');
            return false;
        }
        if (!data || data.schema_version !== '1.0' || !data.gearType || !data.parameters) {
            alert('Unsupported or invalid config schema.');
            return false;
        }
        if (this.app && typeof this.app.setGearType === 'function') {
            this.app.setGearType(data.gearType);
        }
        if (window.parameterUI && typeof window.parameterUI.setParameters === 'function') {
            window.parameterUI.setParameters(data.parameters);
        }
        if (this.app && typeof this.app.generateGear === 'function') {
            this.app.generateGear();
        }
        return true;
    }

    saveToLocalStorage() {
        if (!this.app || !this.app.currentGearType) return;
        const params = window.parameterUI ? window.parameterUI.getAllParameters() : this.app.gearParameters;
        const payload = {
            schema_version: '1.0',
            gearType: this.app.currentGearType,
            parameters: params,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem('geargen-last-config', JSON.stringify(payload));
        } catch (e) {
            console.warn('localStorage save failed', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const raw = localStorage.getItem('geargen-last-config');
            if (!raw) return null;
            const data = JSON.parse(raw);
            if (!data || data.schema_version !== '1.0' || !data.gearType || !data.parameters) return null;
            return data;
        } catch (e) {
            return null;
        }
    }
}
window.ConfigManager = ConfigManager;