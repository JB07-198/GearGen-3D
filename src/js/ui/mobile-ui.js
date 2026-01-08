// Mobile UI Management
class MobileUI {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.panels = {
            'left-panel': document.querySelector('.left-panel'),
            'right-panel': document.querySelector('.right-panel'),
            'center-panel': document.querySelector('.center-panel')
        };
        this.overlay = document.querySelector('.mobile-overlay');
        this.init();
    }

    init() {
        if (!this.navItems.length) return;

        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const showId = item.getAttribute('data-show');
                this.switchPanel(showId, item);
            });
        });

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                const previewNav = document.querySelector('.nav-item[data-show="center-panel"]');
                this.switchPanel('center-panel', previewNav);
            });
        }
    }

    switchPanel(panelId, activeNavItem) {
        // Update Nav Items
        this.navItems.forEach(nav => nav.classList.remove('active'));
        activeNavItem.classList.add('active');

        // Close all drawers
        Object.values(this.panels).forEach(panel => {
            if (panel) panel.classList.remove('active');
        });

        // Overlay management
        if (this.overlay) {
            if (panelId !== 'center-panel') {
                this.overlay.classList.add('active');
            } else {
                this.overlay.classList.remove('active');
            }
        }

        // If it's a side panel, slide it in
        if (panelId !== 'center-panel') {
            const targetPanel = this.panels[panelId];
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        }

        // Ensure 3D Canvas updates its size if needed
        if (window.gearGenApp && window.gearGenApp.onWindowResize) {
            setTimeout(() => window.gearGenApp.onWindowResize(), 100);
        }
    }
}

// Initialize on mobile only (or always and it will check for elements)
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUI = new MobileUI();
});
