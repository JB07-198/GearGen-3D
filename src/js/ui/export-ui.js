// Export UI Management
class ExportUI {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('Initializing export UI...');
        this.setupEventListeners();
        this.updateExportInfo();
    }
    
    setupEventListeners() {
        // Export format selection
        document.querySelectorAll('.export-format').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateExportOptions(e.target.value);
            });
        });
        
        // File name input
        const fileNameInput = document.getElementById('file-name');
        if (fileNameInput) {
            fileNameInput.addEventListener('input', (e) => {
                this.validateFileName(e.target);
            });
        }
    }
    
    updateExportOptions(format) {
        const qualitySelect = document.getElementById('export-quality');
        const unitsSelect = document.getElementById('export-units');
        
        if (format === 'stl') {
            // STL specific options
            if (qualitySelect) {
                qualitySelect.innerHTML = `
                    <option value="low">Low (Fast, smaller file)</option>
                    <option value="medium" selected>Medium (Good balance)</option>
                    <option value="high">High (Best quality)</option>
                `;
            }
            
            if (unitsSelect) {
                unitsSelect.innerHTML = `
                    <option value="mm" selected>Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="inch">Inches</option>
                `;
            }
        } else if (format === 'step') {
            // STEP specific options
            if (qualitySelect) {
                qualitySelect.innerHTML = `
                    <option value="low">Low (B-Rep, smaller)</option>
                    <option value="high" selected>High (Exact geometry)</option>
                `;
            }
            
            if (unitsSelect) {
                unitsSelect.innerHTML = `
                    <option value="mm" selected>Millimeters (mm)</option>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="inch">Inches</option>
                `;
            }
        }
    }
    
    validateFileName(input) {
        let fileName = input.value.trim();
        
        // Remove invalid characters
        fileName = fileName.replace(/[<>:"/\\|?*]/g, '');
        
        // Add extension if not present
        if (fileName && !fileName.match(/\.[a-z]{3,4}$/i)) {
            const format = document.querySelector('input[name="export-format"]:checked')?.value || 'stl';
            fileName += format === 'stl' ? '.stl' : '.step';
        }
        
        input.value = fileName;
    }
    
    updateExportInfo() {
        // Add file size estimation
        const exportSection = document.querySelector('.export-section');
        if (exportSection && !exportSection.querySelector('.file-size-info')) {
            const sizeInfo = document.createElement('div');
            sizeInfo.className = 'file-size-info';
            sizeInfo.innerHTML = `
                <p><i class="fas fa-info-circle"></i> Estimated file size: <span id="file-size-estimate">~500 KB</span></p>
            `;
            
            exportSection.appendChild(sizeInfo);
            
            // Update file size based on gear complexity
            this.updateFileSizeEstimation();
        }
    }
    
    updateFileSizeEstimation() {
        // Simple estimation based on vertex count
        const vertexCount = parseInt(
            document.getElementById('vertex-count')?.textContent?.replace(/,/g, '') || '0'
        );
        
        if (vertexCount > 0) {
            // Rough estimation: ~72 bytes per triangle for STL binary
            const triangleCount = vertexCount / 3;
            const sizeBytes = triangleCount * 72;
            
            let sizeText;
            if (sizeBytes < 1024) {
                sizeText = `${Math.round(sizeBytes)} bytes`;
            } else if (sizeBytes < 1024 * 1024) {
                sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
            } else {
                sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
            }
            
            const estimateElement = document.getElementById('file-size-estimate');
            if (estimateElement) {
                estimateElement.textContent = sizeText;
            }
        }
    }
    
    showExportProgress(format) {
        // Create progress overlay
        const overlay = document.createElement('div');
        overlay.className = 'export-overlay';
        overlay.innerHTML = `
            <div class="export-progress">
                <div class="progress-spinner">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <h3>Exporting ${format.toUpperCase()}...</h3>
                <p>Please wait while your gear is being exported.</p>
                <div class="progress-bar">
                    <div class="progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .export-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .export-progress {
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                min-width: 300px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            }
            .progress-spinner {
                font-size: 2.5em;
                color: #3498db;
                margin-bottom: 20px;
            }
            .progress-bar {
                width: 100%;
                height: 4px;
                background: #ecf0f1;
                border-radius: 2px;
                margin-top: 20px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                background: #3498db;
                width: 0%;
                animation: progress 2s ease-in-out infinite;
            }
            @keyframes progress {
                0% { width: 0%; }
                50% { width: 100%; }
                100% { width: 0%; }
            }
        `;
        
        document.head.appendChild(style);
        
        return overlay;
    }
    
    hideExportProgress(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
}

// Initialize export UI
document.addEventListener('DOMContentLoaded', () => {
    window.exportUI = new ExportUI();
});