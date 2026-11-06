// STL Exporter for 3D printing
class STLExporter {
    exportCurrentGear(params = null) {
        const gear = window.sceneManager ? window.sceneManager.getExportObject() : null;

        if (!gear) {
            alert('No gear to export! Please generate a gear first.');
            return null;
        }

        try {
            // Create exporter
            const exporter = new THREE.STLExporter();

            // Export to binary STL
            const stlData = exporter.parse(gear, { binary: true });

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
            return filename;
        } catch (error) {
            console.error('STL export error:', error);
            alert('Error exporting STL file. Please check console for details.');
            return null;
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
    }
}
