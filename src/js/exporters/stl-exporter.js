// STL Exporter for 3D printing
class STLExporter {
    constructor() {
        console.log('STL exporter initialized');
    }

    exportCurrentGear(params = null) {
        console.log('Exporting current gear as STL...');

        const gear = window.sceneManager ? window.sceneManager.getCurrentGear() : null;

        if (!gear) {
            alert('No gear to export! Please generate a gear first.');
            return;
        }

        try {
            // Clone gear to avoid modifying the scene
            const exportMesh = gear.clone();

            // Remove rotation for export
            exportMesh.rotation.set(0, 0, 0);
            exportMesh.updateMatrixWorld(true);

            // Create exporter
            const exporter = new THREE.STLExporter();

            // Export to binary STL
            const stlData = exporter.parse(exportMesh, { binary: true });

            // Generate dynamic filename
            let filename = 'gear.stl';
            if (params) {
                const type = params.type || 'gear';
                const m = params.module || 0;
                const z = params.teeth || 0;
                const b = params.faceWidth || 0;

                filename = `${type}gear_m${m}_Z${z}_b${b}`;

                if (type === 'helical' && params.helixAngle !== null) {
                    filename += `_beta${params.helixAngle}`;
                }

                if (type === 'planetary') {
                    filename = `${type}_Zs${params.teeth}_Zp${params.planetTeeth}_N${params.planetCount}_m${m}_b${b}`;
                }

                filename += '.stl';
            }

            // Create download link
            this.downloadSTL(stlData, filename);

            console.log('STL export successful');
        } catch (error) {
            console.error('STL export error:', error);
            alert('Error exporting STL file. Please check console for details.');
        }
    }

    downloadSTL(stlData, filename) {
        // Create blob
        const blob = new Blob([stlData], { type: 'application/octet-stream' });

        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Show success message
        this.showExportSuccess(filename);
    }

    showExportSuccess(filename) {
        // Create success notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.2em;"></i>
            <div>
                <strong>Export Successful!</strong><br>
                ${filename} downloaded
            </div>
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);

        // Add CSS animations if not already present
        if (!document.querySelector('#export-animations')) {
            const style = document.createElement('style');
            style.id = 'export-animations';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize STL exporter
document.addEventListener('DOMContentLoaded', () => {
    window.stlExporter = new STLExporter();
});