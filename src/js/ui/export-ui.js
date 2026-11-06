// ==========================================================================
// GearGen-3D Export UI Management
// Modal Export Dialog, Live File Size Estimation & Toast Notifications
// ==========================================================================

class ExportUI {
    constructor() {
        this.init();
    }

    init() {
    }

    getEstimatedSize() {
        const faceCountStr = document.getElementById('face-count')?.textContent?.replace(/,/g, '') || '0';
        const faces = parseInt(faceCountStr, 10) || 0;

        if (faces === 0) return '~0 KB';

        // Precise binary STL size: 84 byte header + 50 bytes per triangle
        const bytes = 84 + (faces * 50);
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `~${(bytes / 1024).toFixed(1)} KB`;
        return `~${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    openModal() {
        if (!window.navigation) return;

        const lang = window.i18n ? window.i18n.getCurrentLanguage() : 'en';
        const hasMesh = !!(window.sceneManager && window.sceneManager.getCurrentGear());
        const estimatedSize = this.getEstimatedSize();

        const params = window.parameterUI ? window.parameterUI.getAllParameters() : {};
        const gearType = window.gearGenApp ? window.gearGenApp.currentGearType : 'spur';

        const titles = {
            en: '<i class="fas fa-download"></i> Export Model',
            fr: '<i class="fas fa-download"></i> Exporter le Modèle',
            ar: '<i class="fas fa-download"></i> تصدير النموذج'
        };

        const dxfCard = gearType === 'spur' ? `
                    <!-- DXF 2D Format Card (spur gears only) -->
                    <div class="export-format-card export-format-card--wide">
                        <div class="format-card-header">
                            <span class="format-name">DXF (2D)</span>
                            <span class="format-badge">Laser / CNC</span>
                        </div>
                        <p class="format-desc" data-i18n="modal.export.dxfDesc">
                            2D involute profile with central bore. Ready for laser cutting and CNC milling.
                        </p>
                        <button class="btn-export btn-dxf" id="modal-export-dxf-btn" ${!hasMesh ? 'disabled' : ''}>
                            <i class="fas fa-scissors"></i> <span data-i18n="modal.export.dxf">Download DXF</span>
                        </button>
                    </div>
        ` : '';

        const modalHtml = `
            <div class="export-dialog-body">
                <div class="export-gear-summary">
                    <div class="summary-item">
                        <span class="summary-label" data-i18n="section.gearType">Gear Type</span>
                        <span class="summary-value" data-summary="type"></span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label" data-i18n="param.module">Module</span>
                        <span class="summary-value" data-summary="module"></span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label" data-i18n="param.teeth">Teeth</span>
                        <span class="summary-value" data-summary="teeth"></span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-label" data-i18n="param.faceWidth">Face Width</span>
                        <span class="summary-value" data-summary="faceWidth"></span>
                    </div>
                </div>

                <div class="export-file-info">
                    <span><i class="fas fa-database"></i> <span data-i18n="modal.export.estimatedSize">Estimated File Size</span>:</span>
                    <span class="file-size-tag" data-summary="size"></span>
                </div>

                <div class="export-formats-grid">
                    <!-- STL Format Card -->
                    <div class="export-format-card">
                        <div class="format-card-header">
                            <span class="format-name">STL (Binary)</span>
                            <span class="format-badge">3D Print</span>
                        </div>
                        <p class="format-desc" data-i18n="modal.export.stlDesc">
                            Binary STL format. Optimal for slicing, Cura, Bambu Studio & 3D printing.
                        </p>
                        <button class="btn-export" id="modal-export-stl-btn" ${!hasMesh ? 'disabled' : ''}>
                            <i class="fas fa-cube"></i> <span data-i18n="modal.export.stl">Download STL</span>
                        </button>
                    </div>

                    <!-- STEP Format Card -->
                    <div class="export-format-card">
                        <div class="format-card-header">
                            <span class="format-name">STEP (AP214)</span>
                            <span class="format-badge">CAD B-Rep</span>
                        </div>
                        <p class="format-desc" data-i18n="modal.export.stepDesc">
                            Faceted B-Rep STEP (AP214). Suitable for SolidWorks, Fusion 360, FreeCAD.
                        </p>
                        <button class="btn-export btn-step" id="modal-export-step-btn" ${!hasMesh ? 'disabled' : ''}>
                            <i class="fas fa-drafting-compass"></i> <span data-i18n="modal.export.step">Download STEP</span>
                        </button>
                    </div>

                    ${dxfCard}
                </div>
            </div>
        `;

        const modal = window.navigation.createModal(
            'export-dialog-modal',
            titles[lang] || titles['en'],
            modalHtml
        );

        // Dynamic values are written as text, never parsed as HTML.
        const summary = {
            type: gearType.toUpperCase(),
            module: `${params.module || 2.0} mm`,
            teeth: String(params.teeth || 20),
            faceWidth: `${params.faceWidth || 10} mm`,
            size: estimatedSize
        };
        Object.keys(summary).forEach(key => {
            const el = modal.querySelector(`[data-summary="${key}"]`);
            if (el) el.textContent = summary[key];
        });

        if (window.i18n) window.i18n.applyLanguage(window.i18n.getCurrentLanguage());

        // Wire download buttons
        const stlBtn = modal.querySelector('#modal-export-stl-btn');
        if (stlBtn) {
            stlBtn.addEventListener('click', () => {
                if (window.gearGenApp) window.gearGenApp.exportSTL();
                modal.querySelector('.modal-close')?.click();
            });
        }

        const stepBtn = modal.querySelector('#modal-export-step-btn');
        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                if (window.gearGenApp) window.gearGenApp.exportSTEP();
                modal.querySelector('.modal-close')?.click();
            });
        }

        const dxfBtn = modal.querySelector('#modal-export-dxf-btn');
        if (dxfBtn) {
            dxfBtn.addEventListener('click', () => {
                if (window.gearGenApp) window.gearGenApp.exportDXF();
                modal.querySelector('.modal-close')?.click();
            });
        }
    }

    showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        const text = document.createElement('span');
        text.textContent = message;
        toast.append(icon, text);
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
}
