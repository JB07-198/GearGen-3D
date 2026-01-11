// Worm Gear Generator
class WormGear {
    constructor() {
        console.log('Worm gear generator initialized');
    }

    // Generate worm gear geometry data
    generateGeometry(params) {
        const {
            module,
            teeth, // For worm, teeth = number of starts
            pressureAngle,
            helixAngle, // For worm, helix angle = lead angle
            faceWidth,
            hubDiameter,
            boreDiameter,
            quality
        } = params;

        console.log(`Generating worm gear: ${teeth} starts, module ${module}, lead angle ${helixAngle}`);

        // Calculate gear dimensions
        const gearData = calculateWormGear(
            module,
            teeth,
            pressureAngle,
            helixAngle,
            faceWidth,
            hubDiameter,
            boreDiameter,
            quality
        );

        return gearData;
    }
}
