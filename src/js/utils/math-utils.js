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
            module,
            isInternal
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
        const getTheta = (r) => {
            const effR = Math.max(r, baseRadius);
            const invR = GearMath.getInvoluteVal(effR, baseRadius);

            if (isInternal) {
                // For internal gears, tooth thickness increases with radius
                return halfThickPitch - invAlpha + invR;
            } else {
                // For external gears, tooth thickness decreases with radius
                return halfThickPitch + invAlpha - invR;
            }
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
    },

    // NEW: Generate a single continuous profile for internal gear (all teeth)
    generateFullInternalProfile: (gearData, quality = 'medium') => {
        const {
            teeth,
            baseRadius,
            outerRadius, // Tip radius for internal (smaller)
            rootRadius,  // Root radius for internal (larger)
            pressureAngleRad
        } = gearData;

        // Quality settings
        const qualitySteps = { low: 4, medium: 12, high: 24 };
        const steps = qualitySteps[quality] || qualitySteps.medium;

        const fullProfile = [];
        const pitchAngle = (2 * Math.PI) / teeth;
        const halfThickPitch = Math.PI / (2 * teeth);
        const invAlpha = Math.tan(pressureAngleRad) - pressureAngleRad;

        // Internal half-thickness angle
        const getThetaInternal = (r) => {
            const effR = Math.max(r, baseRadius);
            const invR = GearMath.getInvoluteVal(effR, baseRadius);
            // Thickest at root (large r), thinnest at tip (small r)
            return halfThickPitch - (invAlpha - invR);
        };

        // For a clean CW hole, we process teeth in descending order
        for (let i = teeth; i > 0; i--) {
            const centerAngle = (i - 1) * pitchAngle;

            // 1. Left Flank (Root to Tip) - CW progression
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const r = rootRadius - t * (rootRadius - outerRadius);
                const theta = getThetaInternal(r);
                const angle = centerAngle + theta;
                fullProfile.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
            }

            // 2. Tip Arc (From Left Tip to Right Tip) - CW
            const thetaTip = getThetaInternal(outerRadius);
            for (let j = 1; j <= steps; j++) {
                const t = j / steps;
                const angle = (centerAngle + thetaTip) - t * (2 * thetaTip);
                fullProfile.push({ x: outerRadius * Math.cos(angle), y: outerRadius * Math.sin(angle) });
            }

            // 3. Right Flank (Tip to Root) - CW progression
            for (let j = 1; j <= steps; j++) {
                const t = j / steps;
                const r = outerRadius + t * (rootRadius - outerRadius);
                const theta = -getThetaInternal(r);
                const angle = centerAngle + theta;
                fullProfile.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
            }

            // 4. Root Arc (To next tooth's Left Root) - CW
            const thetaRoot = getThetaInternal(rootRadius);
            const startAngle = centerAngle - thetaRoot;
            const endAngle = (centerAngle - pitchAngle) + thetaRoot;

            for (let j = 1; j <= steps; j++) {
                const t = j / steps;
                const angle = startAngle - t * (startAngle - endAngle);
                fullProfile.push({ x: rootRadius * Math.cos(angle), y: rootRadius * Math.sin(angle) });
            }
        }

        return fullProfile;
    },

    // NEW: Calculate Rack Tooth Profile (Straight-sided)
    calculateRackProfile: (module, pressureAngleDeg, faceWidth) => {
        const p = Math.PI * module; // Circular pitch
        const alpha = pressureAngleDeg * Math.PI / 180;

        const addendum = module;
        const dedendum = module * 1.25;
        const height = addendum + dedendum;

        // At pitch line (y=0), thickness is p/2
        // x coordinates for one tooth centered at x=0
        // Top width = p/2 - 2 * addendum * tan(alpha)
        // Bottom width = p/2 + 2 * dedendum * tan(alpha) (actually base width)

        const tanA = Math.tan(alpha);
        const halfThick = p / 4;

        const profile = [
            { x: -halfThick - dedendum * tanA, y: -dedendum }, // Bottom Left
            { x: -halfThick + addendum * tanA, y: addendum },  // Top Left
            { x: halfThick - addendum * tanA, y: addendum },   // Top Right
            { x: halfThick + dedendum * tanA, y: -dedendum }   // Bottom Right
        ];

        return {
            module,
            pressureAngle: pressureAngleDeg,
            circularPitch: p,
            addendum,
            dedendum,
            height,
            faceWidth,
            displayPoints: profile
        };
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

// Calculate bevel gear dimensions
function calculateBevelGear(module, teeth, pressureAngle, pitchAngle, faceWidth, hubDiameter, boreDiameter, quality = 'medium') {
    const profile = GearMath.calculateToothProfile(module, teeth, pressureAngle);

    // Add additional parameters
    profile.faceWidth = faceWidth;
    profile.hubDiameter = hubDiameter;
    profile.boreDiameter = boreDiameter;
    profile.pitchAngle = pitchAngle;

    // Generate display profile
    profile.displayPoints = GearMath.generateCompleteToothProfile(profile, quality);

    return profile;
}

// Calculate rack gear dimensions
function calculateRackGear(module, teeth, pressureAngle, faceWidth, quality = 'medium') {
    const data = GearMath.calculateRackProfile(module, pressureAngle, faceWidth);
    data.teeth = teeth; // teeth is the number of teeth in the rack
    return data;
}

// Calculate internal gear (ring gear) dimensions
function calculateInternalGear(module, teeth, pressureAngle, faceWidth, quality = 'medium') {
    // For internal gear, we swap addendum and dedendum logic for the tips
    // But GearMath.calculateToothProfile is designed for external.
    // We can use it but we need to interpret the results carefully.

    // Standard involute profile is actually the same, just the boundary is different.
    const profile = GearMath.calculateToothProfile(module, teeth, pressureAngle);

    // For internal gears:
    // tip radius = pitch - addendum
    // root radius = pitch + dedendum
    const pitchRadius = profile.pitchRadius;
    const m = module;

    // Set parameters for generateCompleteToothProfile
    // Internal tooth: root is at large radius, tip is at small radius
    profile.rootRadius = pitchRadius + 1.25 * m;
    profile.outerRadius = pitchRadius - m; // generator's "tip"
    profile.innerRadius = profile.outerRadius;

    // Rim sizing
    profile.rimRadius = profile.rootRadius + 2 * m;
    profile.outerRadiusRim = profile.rimRadius; // For storage

    profile.faceWidth = faceWidth;
    profile.isInternal = true;

    // Generate the FULL internal loop (all teeth as one polygon)
    profile.displayPoints = GearMath.generateFullInternalProfile(profile, quality);

    return profile;
}

// Calculate planetary gear assembly dimensions
function calculatePlanetaryGear(module, sunTeeth, planetTeeth, planetCount, pressureAngle, faceWidth, quality = 'medium') {
    // Ring teeth must satisfy the planetary geometry
    const ringTeeth = sunTeeth + 2 * planetTeeth;

    // Calculate each component
    const sunData = calculateSpurGear(module, sunTeeth, pressureAngle, faceWidth, 0, 0, quality);
    const planetData = calculateSpurGear(module, planetTeeth, pressureAngle, faceWidth, 0, 0, quality);
    const ringData = calculateInternalGear(module, ringTeeth, pressureAngle, faceWidth, quality);

    // Center distance between sun and planets
    const centerDistance = (module * (sunTeeth + planetTeeth)) / 2;

    return {
        sun: sunData,
        planet: planetData,
        ring: ringData,
        planetCount: planetCount,
        centerDistance: centerDistance,
        module: module,
        sunTeeth: sunTeeth,
        planetTeeth: planetTeeth,
        ringTeeth: ringTeeth,
        faceWidth: faceWidth
    };
}

// Calculate worm gear dimensions
function calculateWormGear(module, starts, pressureAngle, leadAngle, faceWidth, hubDiameter, boreDiameter, quality = 'medium') {
    // For a worm, "teeth" is the number of starts
    const profile = GearMath.calculateToothProfile(module, starts, pressureAngle);

    // Add additional parameters
    profile.faceWidth = faceWidth;
    profile.hubDiameter = hubDiameter;
    profile.boreDiameter = boreDiameter;
    profile.leadAngle = leadAngle;
    profile.starts = starts;

    // Generate display profile
    profile.displayPoints = GearMath.generateCompleteToothProfile(profile, quality);

    return profile;
}