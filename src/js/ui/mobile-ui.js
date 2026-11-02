// ==========================================================================
// GearGen-3D Mobile UI Controller
// Bottom Navigation with Drawers & Swipe-Down Gesture (JSON Spec Compliant)
// ==========================================================================

class MobileUI {
    constructor() {
        this.leftDrawer = document.getElementById('left_sidebar');
        this.rightDrawer = document.getElementById('right_sidebar');
        this.overlay = document.querySelector('.mobile-overlay');
        this.navItems = document.querySelectorAll('.mobile-nav .nav-item');

        this.init();
    }

    init() {
        console.log('Initializing CAD Mobile UI controller...');
        this.setupBottomNav();
        this.setupSwipeDownGestures();
        this.setupOverlay();
    }

    setupBottomNav() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                this.handleNavSelect(target, item);
            });
        });
    }

    handleNavSelect(target, activeItem) {
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(8);

        // Update active nav button
        this.navItems.forEach(i => i.classList.remove('active'));
        activeItem.classList.add('active');

        switch (target) {
            case 'drawer_left':
                this.closeDrawer(this.rightDrawer);
                this.openDrawer(this.leftDrawer);
                break;

            case 'drawer_right':
                this.closeDrawer(this.leftDrawer);
                this.openDrawer(this.rightDrawer);
                break;

            case 'canvas_fullscreen':
                this.closeAllDrawers();
                break;

            case 'export_modal':
                this.closeAllDrawers();
                if (window.exportUI) {
                    window.exportUI.openModal();
                }
                break;
        }
    }

    openDrawer(drawer) {
        if (!drawer) return;
        drawer.classList.add('drawer-open');
        if (this.overlay) this.overlay.classList.add('active');
    }

    closeDrawer(drawer) {
        if (!drawer) return;
        drawer.classList.remove('drawer-open');
    }

    closeAllDrawers() {
        if (this.leftDrawer) this.leftDrawer.classList.remove('drawer-open');
        if (this.rightDrawer) this.rightDrawer.classList.remove('drawer-open');
        if (this.overlay) this.overlay.classList.remove('active');

        // Set Preview tab active
        const previewTab = document.querySelector('.mobile-nav .nav-item[data-target="canvas_fullscreen"]');
        if (previewTab) {
            this.navItems.forEach(i => i.classList.remove('active'));
            previewTab.classList.add('active');
        }

        // Trigger Three.js resize
        if (window.threeJSSetup) {
            setTimeout(() => window.threeJSSetup.onWindowResize(), 150);
        }
    }

    setupOverlay() {
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeAllDrawers();
            });
        }

        // Close drawer buttons inside the drawer header
        document.querySelectorAll('.mobile-drawer-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllDrawers();
            });
        });
    }

    setupSwipeDownGestures() {
        const drawers = [this.leftDrawer, this.rightDrawer].filter(Boolean);

        drawers.forEach(drawer => {
            const header = drawer.querySelector('.mobile-drawer-header');
            if (!header) return;

            let startY = 0;
            let currentY = 0;
            let isDragging = false;

            header.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                currentY = startY;
                isDragging = true;
                drawer.style.transition = 'none';
            }, { passive: true });

            header.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
                if (deltaY > 0) {
                    drawer.style.transform = `translateY(${deltaY}px)`;
                }
            }, { passive: true });

            header.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                drawer.style.transition = '';

                const deltaY = currentY - startY;
                if (deltaY > 80) {
                    // Closed by swipe_down
                    this.closeAllDrawers();
                    drawer.style.transform = '';
                } else {
                    drawer.style.transform = '';
                }
            });
        });
    }
}
