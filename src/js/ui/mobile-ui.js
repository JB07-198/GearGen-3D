// Mobile UI Management
class MobileUI {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.panels = {
            'left-panel': document.querySelector('.left-panel'),
            'right-panel': document.querySelector('.right-panel'),
            'export-panel': document.querySelector('.export-panel'),
            'center-panel': document.querySelector('.center-panel')
        };
        this.overlay = document.querySelector('.mobile-overlay');
        this.closeButtons = document.querySelectorAll('.mobile-drawer-close');
        this.drawerHandles = document.querySelectorAll('.mobile-drawer-handle');
        this.navIndicator = document.querySelector('.nav-indicator');

        this.init();
    }

    // New method for handling window resize
    onWindowResize() {
        if (window.threeJSSetup) {
            window.threeJSSetup.onWindowResize();
        }
    }

    // Renamed from init() to initUI()
    init() {
        if (!this.navItems.length) return;

        // Initialize indicator position
        setTimeout(() => {
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) this.updateIndicator(activeNav);
        }, 100);

        // Window Resize handling for indicator
        window.addEventListener('resize', () => {
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav) this.updateIndicator(activeNav);
            this.onWindowResize();
        });

        // Navigation item clicks
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const showId = item.getAttribute('data-show');

                // Haptic feedback if supported
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }

                this.switchPanel(showId, item);
            });
        });

        // Close buttons
        this.closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllDrawers();
            });
        });

        // Drawer handles (click to close for now, or could add swipe logic)
        this.drawerHandles.forEach(handle => {
            handle.addEventListener('click', () => {
                this.closeAllDrawers();
            });

            // Basic swipe down logic
            let touchStartY = 0;
            handle.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });

            handle.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const diff = touchY - touchStartY;
                if (diff > 50) {
                    this.closeAllDrawers();
                }
            }, { passive: true });
        });

        // Close on overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeAllDrawers();
            });
        }
    }

    closeAllDrawers() {
        const previewNav = document.querySelector('.nav-item[data-show="center-panel"]');
        this.switchPanel('center-panel', previewNav);
    }

    switchPanel(panelId, activeNavItem) {
        if (!activeNavItem) return;

        // Update Nav Items
        this.navItems.forEach(nav => {
            nav.classList.remove('active');
            nav.style.transform = 'scale(1)';
        });
        activeNavItem.classList.add('active');
        activeNavItem.style.transform = 'scale(1.1)';

        setTimeout(() => {
            activeNavItem.style.transform = 'scale(1)';
        }, 200);

        // Close all drawers first
        Object.entries(this.panels).forEach(([id, panel]) => {
            if (panel && id !== 'center-panel') {
                panel.classList.remove('active');
            }
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

        // Update indicator position
        this.updateIndicator(activeNavItem);

        // Ensure 3D Canvas updates its size if needed
        if (window.threeJSSetup && window.threeJSSetup.onWindowResize) {
            setTimeout(() => window.threeJSSetup.onWindowResize(), 100);
        } else if (window.gearGenApp && window.gearGenApp.onWindowResize) {
            setTimeout(() => window.gearGenApp.onWindowResize(), 100);
        }

        // Dispatch event for other components if needed
        window.dispatchEvent(new CustomEvent('panelChanged', { detail: { panelId } }));
    }

    updateIndicator(activeItem) {
        if (!this.navIndicator || !activeItem) return;

        const nav = document.querySelector('.mobile-nav');
        if (!nav) return;

        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();

        // Calculate position relative to nav container
        const left = itemRect.left - navRect.left;
        const width = itemRect.width;

        this.navIndicator.style.width = `${width - 20}px`; // Padding for pill look
        this.navIndicator.style.left = `${left + 10}px`;
    }
}

// Initialize on mobile only (or always and it will check for elements)
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUI = new MobileUI();
});
