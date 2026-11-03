// UrlStateManager: sync params with URL hash
class UrlStateManager {
    constructor(app) {
        this.app = app;
    }

    updateURL(params, gearType) {
        if (!params || !gearType) return;
        const sp = new URLSearchParams();
        sp.set('type', gearType);
        // encode a compact subset of keys
        const keys = ['module','teeth','pressureAngle','faceWidth','hubDiameter','boreDiameter','helixAngle','pitchAngle','planetTeeth','planetCount','quality','color'];
        keys.forEach(k => {
            if (params[k] !== undefined && params[k] !== null) {
                sp.set(k, params[k]);
            }
        });
        const newHash = '#' + sp.toString();
        try {
            history.replaceState(null, '', newHash);
        } catch (e) {
            window.location.hash = newHash;
        }
    }

    loadFromURL() {
        const hash = window.location.hash ? window.location.hash.substring(1) : '';
        if (!hash) return null;
        const sp = new URLSearchParams(hash);
        const type = sp.get('type');
        if (!type) return null;
        const params = {};
        sp.forEach((v, k) => {
            if (k === 'type') return;
            const num = parseFloat(v);
            params[k] = isNaN(num) ? v : num;
        });
        return { gearType: type, parameters: params };
    }
}
window.UrlStateManager = UrlStateManager;