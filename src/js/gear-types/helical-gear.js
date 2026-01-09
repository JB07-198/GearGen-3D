// Helical Gear Generator
class HelicalGear {
    constructor() {
        console.log('Helical gear generator initialized');
    }

    // Generate helical gear geometry data
    generateGeometry(params) {
        const {
            module,
            teeth,
            pressureAngle,
            helixAngle,
            faceWidth,
            hubDiameter,
            boreDiameter,
            quality
        } = params;

        console.log(`Generating helical gear: ${teeth} teeth, helix angle ${helixAngle}°`);

        // Use GearMath to produce a correct involute tooth profile
        const gearData = GearMath.calculateToothProfile(module, teeth, pressureAngle);

        // Generate a complete involute tooth profile
        const toothPoints = GearMath.generateCompleteToothProfile(gearData, quality);

        // Add specific helical parameters
        gearData.helixAngle = helixAngle;
        gearData.faceWidth = faceWidth;
        gearData.hubDiameter = hubDiameter;
        gearData.boreDiameter = boreDiameter;
        gearData.displayPoints = toothPoints;

        return gearData;
    }
}

// Global function to calculate helical gear (similar to calculateSpurGear)
function calculateHelicalGear(module, teeth, pressureAngle, helixAngle, faceWidth, hubDiameter, boreDiameter, quality = 'medium') {
    const generator = new HelicalGear();
    return generator.generateGeometry({
        module,
        teeth,
        pressureAngle,
        helixAngle,
        faceWidth,
        hubDiameter,
        boreDiameter,
        quality
    });
}
