// Mathematical utilities for gear calculations
const GearMath = {
    // Convert degrees to radians
    degToRad: (degrees) => degrees * Math.PI / 180,

    // Convert radians to degrees
    radToDeg: (radians) => radians * 180 / Math.PI,

    // Calculate gear tooth profile points with true involute curve
    calculateToothProfile: (module, teeth, pressureAngleDeg, addendumCoeff = 1, dedendumCoeff = 1.25) => {
        const m = module;
        const z = teeth;
        const alpha = pressureAngleDeg * Math.PI / 180; // pressure angle in radians

        // Standard gear formulas (ISO 53:1998)
        const pitchDiameter = m * z;
        const baseDiameter = pitchDiameter * Math.cos(alpha);
        const outerDiameter = pitchDiameter + 2 * m * addendumCoeff;
        const rootDiameter = pitchDiameter - 2 * m * dedendumCoeff;

        // Radii
        const pitchRadius = pitchDiameter / 2;
        const baseRadius = baseDiameter / 2;
        const outerRadius = outerDiameter / 2;
        const rootRadius = rootDiameter / 2;

        // Tooth dimensions
        const addendum = m * addendumCoeff;
        const dedendum = m * dedendumCoeff;
        const wholeDepth = addendum + dedendum;

        // Circular pitch and tooth thickness at pitch circle
        const circularPitch = Math.PI * m;
        const toothThicknessAtPitch = circularPitch / 2;

        // Involute parameters - CORRECTION IMPORTANTE
        // Angle where involute starts on base circle
        const involuteStartAngle = Math.tan(alpha) - alpha; // evolvent angle at pitch circle

        // Maximum involute angle on addendum circle
        const addendumInvoluteAngle = Math.sqrt(
            Math.pow(outerRadius / baseRadius, 2) - 1
        );

        // Pressure angle at addendum circle
        const alphaA = Math.acos(baseRadius / outerRadius);

        return {
            module: m,
            teeth: z,
            pressureAngle: pressureAngleDeg,
            pressureAngleRad: alpha,

            // Diameters
            pitchDiameter,
            baseDiameter,
            outerDiameter,
            rootDiameter,

            // Radii
            pitchRadius,
            baseRadius,
            outerRadius,
            rootRadius,

            // Tooth dimensions
            addendum,
            dedendum,
            wholeDepth,
            circularPitch,
            toothThicknessAtPitch,

            // Involute parameters
            involuteStartAngle,
            addendumInvoluteAngle,
            alphaA,

            // Clearance
            clearance: dedendum - addendum
        };
    },

    // Helper: Calculate involute function value
    // inv(alpha) = tan(alpha) - alpha
    getInvoluteVal: (radius, baseRadius) => {
        if (radius <= baseRadius) return 0;
        // cos(alpha) = Rb / r
        const alpha = Math.acos(baseRadius / radius);
        return Math.tan(alpha) - alpha;
    },

    // Generate complete tooth profile using thickness-at-radius method
    generateCompleteToothProfile: (gearData, quality = 'medium') => {
        const {
            teeth,
            baseRadius,
            outerRadius,
            rootRadius,
            pitchRadius,
            pressureAngleRad,
            module
        } = gearData;

        // Quality settings
        const qualityPoints = {
            low: 3,
            medium: 8,
            high: 16
        };

        const steps = qualityPoints[quality] || qualityPoints.medium;
        const profile = [];

        // Constants for thickness calculation
        // Half tooth angle at pitch circle = (PI*m/2) / Rp = PI / (2*z)
        const halfThickPitch = Math.PI / (2 * teeth);
        const invAlpha = Math.tan(pressureAngleRad) - pressureAngleRad;

        // Function to get angular position of the Left Flank (Upper Y) at radius r
        // Theta(r) = HalfThickPitch + invAlpha - inv(alpha_r)
        const getTheta = (r) => {
            // Constraint: r cannot be less than base radius for involute
            const effR = Math.max(r, baseRadius);
            const invR = GearMath.getInvoluteVal(effR, baseRadius);
            return halfThickPitch + invAlpha - invR;
        };

        // 1. Root to Base (Left Side/Upper)
        // Draw from Root Angle (at -halfPitch) to Start of Involute
        // Actually, let's trace the perimeter CCW: 
        // Start at Root Center (-ThetaPitch).

        const pitchAngle = 2 * Math.PI / teeth;
        const halfPitchAngle = pitchAngle / 2;

        // A. Root Segment (from mid-gap to flank start)
        // Mid-gap is at angle -halfPitchAngle
        // Flank start is at radius (Max(Root, Base)) at angle getTheta(rStart).
        // Actually, Root usually implies a circle segment at rootRadius.
        // We start at angle -halfPitchAngle, radius rootRadius.
        // We go to angle -getTheta(rootRadius or base)?, radius rootRadius.

        // Let's verify: Bottom Flank is at angle -Theta.
        // So Bottom Flank Start is at -getTheta(startR).
        // Root Segment connects -halfPitchAngle to -getTheta(startR).

        // Define range for involute
        const startR = Math.max(baseRadius, rootRadius);
        const endR = outerRadius;

        // Points for One Tooth

        // 1. Root Start (Bottom/Right side of gap)
        profile.push({
            x: rootRadius * Math.cos(-halfPitchAngle),
            y: rootRadius * Math.sin(-halfPitchAngle),
            type: 'root-start'
        });

        // 2. Bottom Root Arc (optional, or straight line to flank base)
        const bottomFlankBaseAngle = -getTheta(startR);
        profile.push({
            x: rootRadius * Math.cos(bottomFlankBaseAngle),
            y: rootRadius * Math.sin(bottomFlankBaseAngle),
            type: 'root-bottom'
        });

        // 3. Bottom Flank (Involute Outwards)
        // From startR to endR
        for (let i = 0; i <= steps; i++) {
            const r = startR + (endR - startR) * (i / steps);
            const theta = -getTheta(r); // Negative for bottom flank
            profile.push({
                x: r * Math.cos(theta),
                y: r * Math.sin(theta),
                type: 'flank-bottom'
            });
        }

        // 4. Tip (Top Flank End)
        // Top Flank ends at endR, angle +getTheta(endR)
        // We just connected to (endR, -Theta).
        // Create arc or line to (endR, +Theta).
        const tipHalfAngle = getTheta(endR);
        const tipSteps = Math.max(2, Math.floor(steps / 2));

        for (let i = 1; i <= tipSteps; i++) {
            const t = i / tipSteps;
            const theta = -tipHalfAngle + t * (2 * tipHalfAngle);
            profile.push({
                x: endR * Math.cos(theta),
                y: endR * Math.sin(theta),
                type: 'tip'
            });
        }

        // 5. Top Flank (Involute Inwards)
        // From endR down to startR
        for (let i = steps - 1; i >= 0; i--) {
            const r = startR + (endR - startR) * (i / steps);
            const theta = getTheta(r); // Positive for top flank
            profile.push({
                x: r * Math.cos(theta),
                y: r * Math.sin(theta),
                type: 'flank-top'
            });
        }

        // 6. Top Root Connector
        const topFlankBaseAngle = getTheta(startR);
        if (rootRadius < startR) {
            // Radial line down to root
            profile.push({
                x: rootRadius * Math.cos(topFlankBaseAngle),
                y: rootRadius * Math.sin(topFlankBaseAngle),
                type: 'root-top-connection'
            });
        }

        // 7. Root End (at +halfPitchAngle)
        profile.push({
            x: rootRadius * Math.cos(halfPitchAngle),
            y: rootRadius * Math.sin(halfPitchAngle),
            type: 'root-end'
        });

        return profile;
    },

    // Alternative: Simplified but correct tooth profile for display
    generateDisplayToothProfile: (gearData) => {
        const { teeth, module, pitchRadius, baseRadius, outerRadius, rootRadius } = gearData;

        const profile = [];
        const toothAngle = 2 * Math.PI / teeth;
        const halfTooth = toothAngle / 2;

        // Standard tooth proportions
        const addendum = module;
        const dedendum = module * 1.25;

        // Create 7 key points per tooth (good balance between accuracy and performance)

        // Point 1: Root start (with small clearance)
        profile.push({
            x: (rootRadius + module * 0.3) * Math.cos(-halfTooth),
            y: (rootRadius + module * 0.3) * Math.sin(-halfTooth),
            type: 'root'
        });

        // Point 2: Start of involute (near base circle)
        const baseAngle = -halfTooth * 0.7;
        profile.push({
            x: baseRadius * Math.cos(baseAngle),
            y: baseRadius * Math.sin(baseAngle),
            type: 'involute-start'
        });

        // Points 3-4: Involute curve (approximated)
        for (let i = 1; i <= 2; i++) {
            const t = i / 3;
            const angle = -halfTooth * 0.3 + t * halfTooth * 0.6;
            const radius = baseRadius + (outerRadius - baseRadius) * t;
            profile.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                type: 'involute'
            });
        }

        // Point 5: Tooth tip (center)
        profile.push({
            x: outerRadius * Math.cos(0),
            y: outerRadius * Math.sin(0),
            type: 'tip'
        });

        // Points 6-7: Other side involute (symmetrical)
        for (let i = 1; i >= 0; i--) {
            const t = i / 3;
            const angle = halfTooth * 0.3 - t * halfTooth * 0.6;
            const radius = baseRadius + (outerRadius - baseRadius) * t;
            profile.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                type: 'involute'
            });
        }

        // Point 8: End of involute
        profile.push({
            x: baseRadius * Math.cos(halfTooth * 0.7),
            y: baseRadius * Math.sin(halfTooth * 0.7),
            type: 'involute-end'
        });

        // Point 9: Root end
        profile.push({
            x: (rootRadius + module * 0.3) * Math.cos(halfTooth),
            y: (rootRadius + module * 0.3) * Math.sin(halfTooth),
            type: 'root'
        });

        return profile;
    }
};

// Calculate spur gear dimensions
function calculateSpurGear(module, teeth, pressureAngle, faceWidth, hubDiameter, boreDiameter, quality = 'medium') {
    const profile = GearMath.calculateToothProfile(module, teeth, pressureAngle);

    // Add additional parameters
    profile.faceWidth = faceWidth;
    profile.hubDiameter = hubDiameter;
    profile.boreDiameter = boreDiameter;

    // Generate display profile (optimized for 3D rendering)
    // Use complete profile for better accuracy and look
    profile.displayPoints = GearMath.generateCompleteToothProfile(profile, quality);

    return profile;
}