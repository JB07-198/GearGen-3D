// Gear Renderer for creating 3D meshes with corrected tooth profile
class GearRenderer {
    constructor() {
        console.log('Gear renderer initialized');
    }

    createSpurGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating spur gear with corrected profile...', gearData);

        try {
            // Create gear shape with corrected tooth profile
            const gearShape = this.createCorrectedGearShape(gearData, quality);

            // Create gear geometry
            const extrudeSettings = {
                depth: gearData.faceWidth,
                bevelEnabled: true,
                bevelThickness: Math.min(0.5, gearData.module * 0.2),
                bevelSize: Math.min(0.5, gearData.module * 0.2),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);

            // Center and orient correctly
            geometry.center();
            geometry.rotateX(Math.PI / 2);

            // Create material
            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x222222,
                flatShading: false
            });

            // Create mesh
            const gearMesh = new THREE.Mesh(geometry, material);
            gearMesh.castShadow = true;
            gearMesh.receiveShadow = true;

            // Add to scene
            if (window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
            }

            console.log('Gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createCorrectedGearShape(gearData, quality) {
        const shape = new THREE.Shape();
        const { teeth, displayPoints } = gearData;
        const toothAngle = 2 * Math.PI / teeth;

        if (!displayPoints || displayPoints.length === 0) {
            console.warn('No display points, using fallback');
            return this.createSimpleGearShape(gearData);
        }

        // Start at first point
        const firstPoint = displayPoints[0];
        shape.moveTo(firstPoint.x, firstPoint.y);

        // Create teeth by duplicating and rotating the profile
        for (let tooth = 0; tooth < teeth; tooth++) {
            const rotation = tooth * toothAngle;

            // Add points for this tooth
            for (let i = 0; i < displayPoints.length; i++) {
                const point = displayPoints[i];

                // Skip the very first point of the first tooth as we already moved there
                if (tooth === 0 && i === 0) continue;

                // Rotate point
                const cosR = Math.cos(rotation);
                const sinR = Math.sin(rotation);
                const x = point.x * cosR - point.y * sinR;
                const y = point.x * sinR + point.y * cosR;

                // Use lineTo for simplicity (smoother than trying curves)
                shape.lineTo(x, y);
            }
        }

        // Close the shape
        shape.closePath();

        // Add bore hole if specified
        if (gearData.boreDiameter > 0) {
            const boreRadius = gearData.boreDiameter / 2;
            const borePath = new THREE.Path();
            // True for clockwise winding (opposite to shape) which is required for holes in Three.js
            borePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
            shape.holes.push(borePath);
        }

        return shape;
    }

    createSimpleGearShape(gearData) {
        const shape = new THREE.Shape();
        const { teeth, module, pitchRadius, outerRadius, rootRadius } = gearData;
        const toothAngle = 2 * Math.PI / teeth;

        // Create points for one tooth (simplified but correct shape)
        const toothPoints = [];
        const halfTooth = toothAngle / 2;

        // Use 5 points per tooth for good shape
        const angles = [
            -halfTooth * 0.9,          // Root start
            -halfTooth * 0.4,          // Flank start
            0,                         // Tip center
            halfTooth * 0.4,           // Flank end
            halfTooth * 0.9            // Root end
        ];

        const radii = [
            rootRadius + module * 0.3, // Root with fillet
            pitchRadius * 0.9,         // Lower flank
            outerRadius,               // Tip
            pitchRadius * 0.9,         // Upper flank
            rootRadius + module * 0.3  // Root with fillet
        ];

        // Create shape
        for (let tooth = 0; tooth <= teeth; tooth++) {
            const baseRotation = tooth * toothAngle;

            angles.forEach((angle, index) => {
                const totalAngle = angle + baseRotation;
                const radius = radii[index];

                const x = radius * Math.cos(totalAngle);
                const y = radius * Math.sin(totalAngle);

                if (tooth === 0 && index === 0) {
                    shape.moveTo(x, y);
                } else {
                    shape.lineTo(x, y);
                }
            });
        }

        return shape;
    }

    // Robust fallback that always works
    createRobustGear(gearData, color) {
        console.log('Using robust gear generation');

        const { teeth, module, faceWidth } = gearData;
        const pitchRadius = module * teeth / 2;
        const outerRadius = pitchRadius + module;
        const rootRadius = pitchRadius - module * 1.25;

        // Create gear using parametric equation
        const points = [];
        const segments = teeth * 8;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            // Sine wave modulation for teeth
            const toothWave = Math.sin(angle * teeth / 2);
            // Cubic shaping for better tooth form
            const toothShape = Math.pow(toothWave, 3);
            const radius = rootRadius + (outerRadius - rootRadius) * (0.5 + 0.5 * toothShape);

            points.push(new THREE.Vector2(radius, 0));
        }

        // Create lathe geometry
        const geometry = new THREE.LatheGeometry(points, teeth * 6);

        // Scale to correct thickness
        const scale = faceWidth / (outerRadius * 0.5);
        geometry.scale(1, scale, 1);

        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 40
        });

        const gear = new THREE.Mesh(geometry, material);
        gear.rotation.x = Math.PI / 2;

        if (window.sceneManager) {
            window.sceneManager.addGear(gear);
        }

        return gear;
    }

    // Alternative: Gear with proper tooth profile using extrusion along path
    createAdvancedGear(gearData, color) {
        const { teeth, module, faceWidth } = gearData;

        // Create tooth profile shape
        const toothShape = new THREE.Shape();
        const addendum = module;
        const dedendum = module * 1.25;
        const pitchRadius = module * teeth / 2;

        // Tooth profile points (simplified but correct)
        toothShape.moveTo(0, pitchRadius - dedendum * 0.8);
        toothShape.quadraticCurveTo(
            module * 0.5, pitchRadius - dedendum * 0.3,
            module * 1.2, pitchRadius
        );
        toothShape.quadraticCurveTo(
            module * 0.8, pitchRadius + addendum * 0.8,
            0, pitchRadius + addendum
        );
        toothShape.quadraticCurveTo(
            -module * 0.8, pitchRadius + addendum * 0.8,
            -module * 1.2, pitchRadius
        );
        toothShape.quadraticCurveTo(
            -module * 0.5, pitchRadius - dedendum * 0.3,
            0, pitchRadius - dedendum * 0.8
        );
        toothShape.closePath();

        // Create circular path for extrusion
        const path = new THREE.CircleCurve(0, 0, 1, 0, Math.PI * 2);

        // Extrude along path
        const extrudeSettings = {
            steps: teeth * 2,
            bevelEnabled: false,
            extrudePath: path,
            curveSegments: 32
        };

        const geometry = new THREE.ExtrudeGeometry(toothShape, extrudeSettings);
        geometry.scale(pitchRadius, pitchRadius, faceWidth / (Math.PI * 2));

        const material = new THREE.MeshPhongMaterial({ color: color });
        return new THREE.Mesh(geometry, material);
    }
}

// Initialize gear renderer
document.addEventListener('DOMContentLoaded', () => {
    window.gearRenderer = new GearRenderer();
});