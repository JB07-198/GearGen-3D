// WelcomeModal: initial gear type selector
class WelcomeModal {
    constructor(app) {
        this.app = app;
        this.root = null;
    }

    shouldShow() {
        try {
            const pref = localStorage.getItem('geargen-show-welcome');
            if (pref === 'false') return false;
        } catch (e) {}
        // Show only if no hash and no stored config? We'll let caller decide.
        return true;
    }

    show() {
        if (this.root) return;
        const types = [
            { id: 'spur', label: 'Spur Gear', icon: 'fa-cog' },
            { id: 'helical', label: 'Helical Gear', icon: 'fa-sync' },
            { id: 'bevel', label: 'Bevel Gear', icon: 'fa-project-diagram' },
            { id: 'worm', label: 'Worm Gear', icon: 'fa-wrench' },
            { id: 'rack', label: 'Rack Gear', icon: 'fa-grip-lines' },
            { id: 'internal', label: 'Internal Gear', icon: 'fa-circle-notch' },
            { id: 'planetary', label: 'Planetary Gear', icon: 'fa-atom' }
        ];

        const hasStored = !!(this.app.configManager && this.app.configManager.loadFromLocalStorage());

        const overlay = document.createElement('div');
        overlay.className = 'welcome-modal-overlay';
        overlay.innerHTML = `
            <div class="welcome-modal">
                <h2>Choose a gear type to start</h2>
                <div class="welcome-grid">
                    ${types.map(t => `
                        <button class="welcome-card" data-type="${t.id}">
                            <i class="fas ${t.icon}"></i>
                            <span>${t.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="welcome-actions">
                    <button class="btn btn-secondary" id="welcome-restore" ${hasStored ? '' : 'disabled'}>Restore last project</button>
                    <label class="welcome-hide"><input type="checkbox" id="welcome-hide"> Don't show at startup</label>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.root = overlay;

        overlay.querySelectorAll('.welcome-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                if (this.app) this.app.setGearType(type);
                this.close(true);
            });
        });

        const restoreBtn = overlay.querySelector('#welcome-restore');
        if (restoreBtn && hasStored) {
            restoreBtn.addEventListener('click', () => {
                const data = this.app.configManager.loadFromLocalStorage();
                if (data && data.gearType) {
                    this.app.setGearType(data.gearType);
                    if (data.parameters && window.parameterUI) {
                        window.parameterUI.setParameters(data.parameters);
                        this.app.generateGear();
                    }
                }
                this.close(true);
            });
        }

        const hideCb = overlay.querySelector('#welcome-hide');
        if (hideCb) {
            hideCb.addEventListener('change', () => {
                try {
                    localStorage.setItem('geargen-show-welcome', hideCb.checked ? 'false' : 'true');
                } catch (e) {}
            });
        }

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.close(false);
        });
    }

    close(updateUrl) {
        if (!this.root) return;
        if (updateUrl && this.app && this.app.currentGearType && this.app.urlStateManager) {
            const params = window.parameterUI ? window.parameterUI.getAllParameters() : {};
            this.app.urlStateManager.updateURL(params, this.app.currentGearType);
        }
        this.root.remove();
        this.root = null;
    }
}
window.WelcomeModal = WelcomeModal;