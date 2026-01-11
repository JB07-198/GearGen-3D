// Planetary Gear Generator
class PlanetaryGear {
    constructor() {
        console.log('Planetary gear generator initialized');
    }

    // Generate planetary assembly geometry data
    generateGeometry(params) {
        const {
            module,
            teeth, // Treat main 'teeth' as Sun Teeth
            planetTeeth = 10,
            planetCount = 3,
            pressureAngle,
            faceWidth,
            quality
        } = params;

        console.log(`Generating planetary system: Sun=${teeth}, Planets=${planetTeeth} x ${planetCount}`);

        // Calculate assembly data
        const assemblyData = calculatePlanetaryGear(
            module,
            teeth,
            planetTeeth,
            planetCount,
            pressureAngle,
            faceWidth,
            quality
        );

        return assemblyData;
    }
}
