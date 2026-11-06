// GearValidator: mechanical & DFM validation
class GearValidator {
    static GEAR_TYPES = ['spur', 'helical', 'bevel', 'worm', 'rack', 'internal', 'planetary'];
    static TYPES_WITH_BORE = ['spur', 'helical', 'bevel', 'worm'];
    static TYPES_WITH_UNDERCUT_CHECK = ['spur', 'helical', 'bevel'];
    static TYPES_WITH_EXTERNAL_TEETH = ['spur', 'helical', 'bevel', 'planetary'];

    static isKnownType(type) {
        return GearValidator.GEAR_TYPES.includes(type);
    }

    // Stricter than Number() or parseFloat(), which accept '', null, true, [5] or '12abc'.
    static parseStrictNumber(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value.trim())) return Number(value);
        return null;
    }

    // Checks untrusted parameters (URL, JSON file, localStorage) against the rules.
    // Returns only known keys with valid values, plus the names of known keys that were refused.
    static sanitizeParameters(raw, rules) {
        const parameters = {};
        const invalid = [];
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
            return { parameters, invalid: ['parameters'] };
        }

        Object.keys(rules).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(raw, key)) return;
            const rule = rules[key];
            let clean = null;

            if (rule.type === 'integer' || rule.type === 'number') {
                const n = GearValidator.parseStrictNumber(raw[key]);
                const inRange = n !== null && n >= rule.min && n <= rule.max;
                if (inRange && (rule.type === 'number' || Number.isInteger(n))) clean = n;
            } else if (rule.type === 'enum') {
                const v = rule.numeric ? GearValidator.parseStrictNumber(raw[key]) : String(raw[key]).toLowerCase();
                if (rule.values.includes(v)) clean = v;
            } else if (rule.type === 'color') {
                if (typeof raw[key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(raw[key])) clean = raw[key];
            }

            if (clean === null) invalid.push(key);
            else parameters[key] = clean;
        });

        return { parameters, invalid };
    }

    static validate(params, gearType) {
        const diagnostics = [];
        if (!params) return diagnostics;

        const module = parseFloat(params.module) || 0;
        const teeth = parseInt(params.teeth) || 0;
        const pressureAngle = parseFloat(params.pressureAngle) || 20;
        const boreDiameter = parseFloat(params.boreDiameter) || 0;
        const hubDiameter = parseFloat(params.hubDiameter) || 0;
        const delta = (parseFloat(params.pitchAngle) || 45) * Math.PI / 180;

        let pitchDiameter = module * teeth;
        let dedendumDiameter = pitchDiameter - 2.5 * module;
        let effectiveTeeth = teeth;     // virtual teeth for tooth shape checks on a cone
        let tipScale = 1;               // size of the small end of a cone relative to its large end

        if (gearType === 'worm') {
            pitchDiameter = module * (parseFloat(params.wormQuotient) || 10);
            dedendumDiameter = pitchDiameter - 2.5 * module;
        } else if (gearType === 'bevel') {
            dedendumDiameter = pitchDiameter - 2.5 * module * Math.cos(delta);
            effectiveTeeth = teeth / Math.cos(delta);
        }

        // 1. Bore collision
        // Rack, internal and planetary have no bore field, so its stored value must not block them.
        if (GearValidator.TYPES_WITH_BORE.includes(gearType) && boreDiameter > 0 && boreDiameter >= dedendumDiameter) {
            diagnostics.push({ level: 'error', code: 'bore_collision', messageKey: 'validation.boreCollision', params: { boreDiameter, dedendumDiameter } });
        }

        if (gearType === 'bevel' && module > 0 && teeth > 0) {
            const coneDistance = (pitchDiameter / 2) / Math.sin(delta);
            const requestedWidth = parseFloat(params.faceWidth) || 0;
            const maxWidth = Math.max(1, coneDistance * 0.9);
            const faceWidth = Math.min(requestedWidth, maxWidth);
            tipScale = 1 - faceWidth / coneDistance;

            if (requestedWidth > maxWidth) {
                diagnostics.push({ level: 'warning', code: 'bevel_face_clamped', messageKey: 'validation.bevelFaceClamped', params: { requestedWidth, maxWidth } });
            } else if (requestedWidth > coneDistance / 3) {
                diagnostics.push({ level: 'warning', code: 'bevel_face_width', messageKey: 'validation.bevelFaceWidth', params: { requestedWidth, limit: coneDistance / 3 } });
            }

            // The cone narrows towards the small end, so that is where the bore has the least room.
            const smallEndRoot = dedendumDiameter * tipScale;
            if (boreDiameter > 0 && boreDiameter < dedendumDiameter && boreDiameter >= smallEndRoot) {
                diagnostics.push({ level: 'error', code: 'bore_collision', messageKey: 'validation.boreCollision', params: { boreDiameter, dedendumDiameter: smallEndRoot } });
            }
        }

        // Hub: values that cannot be built are reported rather than silently ignored.
        if (GearValidator.TYPES_WITH_BORE.includes(gearType) && hubDiameter > 0) {
            if (hubDiameter <= boreDiameter) {
                diagnostics.push({ level: 'warning', code: 'hub_below_bore', messageKey: 'validation.hubBelowBore', params: { hubDiameter, boreDiameter } });
            } else if (hubDiameter >= dedendumDiameter) {
                diagnostics.push({ level: 'warning', code: 'hub_too_large', messageKey: 'validation.hubTooLarge', params: { hubDiameter, dedendumDiameter } });
            }
        }

        // 2. Undercut (helical teeth use the same transverse profile as spur teeth here)
        if (GearValidator.TYPES_WITH_UNDERCUT_CHECK.includes(gearType)) {
            let minTeeth = 17;
            if (pressureAngle <= 14.5) minTeeth = 32;
            else if (pressureAngle >= 25) minTeeth = 12;
            if (teeth > 0 && effectiveTeeth < minTeeth) {
                diagnostics.push({ level: 'warning', code: 'undercut', messageKey: 'validation.undercut', params: { teeth: effectiveTeeth, minTeeth, pressureAngle } });
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

            // Neighbouring planets must not touch: distance between their axes vs. their tip diameter.
            const spacing = module * (sun + planet) * Math.sin(Math.PI / count);
            const tipDiameter = module * planet + 2 * module;
            if (count > 0 && spacing <= tipDiameter) {
                diagnostics.push({ level: 'error', code: 'planets_overlap', messageKey: 'validation.planetsOverlap', params: { count, spacing, tipDiameter } });
            }
        }

        // 4. DFM thin tip
        // approximate top land thickness at outer radius (formula valid for external teeth only)
        if (GearValidator.TYPES_WITH_EXTERNAL_TEETH.includes(gearType) && module > 0 && teeth > 0) {
            const baseRadius = (module * effectiveTeeth * Math.cos(pressureAngle * Math.PI / 180)) / 2;
            const outerRadius = (module * effectiveTeeth) / 2 + module;
            const invR = GearMath.getInvoluteVal(outerRadius, baseRadius);
            const halfThick = Math.PI / (2 * effectiveTeeth);
            const invAlpha = Math.tan(pressureAngle * Math.PI / 180) - (pressureAngle * Math.PI / 180);
            const theta = halfThick + invAlpha - invR;
            const topLand = 2 * outerRadius * Math.sin(theta) * tipScale; // approx linear thickness
            if (topLand < 0.8) {
                diagnostics.push({ level: 'warning', code: 'dfm_thin_tip', messageKey: 'validation.dfmThinTip', params: { topLand } });
            }
        }

        // Info if no issues
        if (diagnostics.length === 0) {
            diagnostics.push({ level: 'info', code: 'valid', messageKey: 'validation.valid', params: {} });
        }

        return diagnostics;
    }
}
window.GearValidator = GearValidator;