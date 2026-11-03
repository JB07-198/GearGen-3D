// GearValidator: mechanical & DFM validation
class GearValidator {
    static validate(params, gearType) {
        const diagnostics = [];
        if (!params) return diagnostics;

        const module = parseFloat(params.module) || 0;
        const teeth = parseInt(params.teeth) || 0;
        const pressureAngle = parseFloat(params.pressureAngle) || 20;
        const boreDiameter = parseFloat(params.boreDiameter) || 0;
        const pitchDiameter = module * teeth;
        const dedendumDiameter = pitchDiameter - 2.5 * module;

        // 1. Bore collision
        if (boreDiameter > 0 && boreDiameter >= dedendumDiameter) {
            diagnostics.push({ level: 'error', code: 'bore_collision', messageKey: 'validation.boreCollision', params: { boreDiameter, dedendumDiameter } });
        }

        // 2. Undercut for spur
        if (gearType === 'spur') {
            let minTeeth = 17;
            if (pressureAngle <= 14.5) minTeeth = 32;
            else if (pressureAngle >= 25) minTeeth = 12;
            if (teeth > 0 && teeth < minTeeth) {
                diagnostics.push({ level: 'warning', code: 'undercut', messageKey: 'validation.undercut', params: { teeth, minTeeth, pressureAngle } });
            }
        }

        // 3. Planetary feasibility
        if (gearType === 'planetary') {
            const sun = parseInt(params.teeth) || 0;
            const planet = parseInt(params.planetTeeth) || 0;
            const ring = sun + 2 * planet;
            const count = parseInt(params.planetCount) || 3;
            if (count > 0 && (sun + ring) % count !== 0) {
                diagnostics.push({ level: 'error', code: 'planetary_equidistance', messageKey: 'validation.planetaryEquidistance', params: { sun, planet, ring, count } });
            }
        }

        // 4. DFM thin tip
        // approximate top land thickness at outer radius
        try {
            if (window.GearMath && module > 0 && teeth > 0) {
                const baseRadius = (module * teeth * Math.cos(pressureAngle * Math.PI / 180)) / 2;
                const outerRadius = (module * teeth) / 2 + module;
                const invR = window.GearMath.getInvoluteVal(outerRadius, baseRadius);
                const halfThick = Math.PI / (2 * teeth);
                const invAlpha = Math.tan(pressureAngle * Math.PI / 180) - (pressureAngle * Math.PI / 180);
                const theta = halfThick + invAlpha - invR;
                const topLand = 2 * outerRadius * Math.sin(theta); // approx linear thickness
                if (topLand < 0.8) {
                    diagnostics.push({ level: 'warning', code: 'dfm_thin_tip', messageKey: 'validation.dfmThinTip', params: { topLand } });
                }
            }
        } catch (e) {
            // ignore
        }

        // Info if no issues
        if (diagnostics.length === 0) {
            diagnostics.push({ level: 'info', code: 'valid', messageKey: 'validation.valid', params: {} });
        }

        return diagnostics;
    }
}
window.GearValidator = GearValidator;