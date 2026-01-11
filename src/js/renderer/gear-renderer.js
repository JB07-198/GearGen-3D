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

    createHelicalGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating helical gear with helical twist...', gearData);

        try {
            const gearShape = this.createCorrectedGearShape(gearData, quality);

            // Calculate total twist angle (in radians)
            // helixAngle is beta
            // twist = faceWidth * tan(beta) / pitchRadius
            const beta = gearData.helixAngle * Math.PI / 180;
            const twistAngle = (gearData.faceWidth * Math.tan(beta)) / (gearData.pitchDiameter / 2);

            // Create gear geometry with multiple steps for smooth twist
            const steps = quality === 'high' ? 32 : (quality === 'medium' ? 16 : 8);
            const extrudeSettings = {
                depth: gearData.faceWidth,
                steps: steps,
                bevelEnabled: true,
                bevelThickness: Math.min(0.5, gearData.module * 0.2),
                bevelSize: Math.min(0.5, gearData.module * 0.2),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);

            // Center geometry first
            geometry.center();

            // Apply helical twist by rotating vertices
            const positions = geometry.attributes.position;
            const faceWidth = gearData.faceWidth;

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                // Calculate twist for this Z position
                // Z is centered, so it goes from -faceWidth/2 to +faceWidth/2
                const angle = (z / faceWidth) * twistAngle;

                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);

                const newX = x * cosA - y * sinA;
                const newY = x * sinA + y * cosA;

                positions.setXY(i, newX, newY);
            }

            // Normals need to be recalculated after vertex manipulation
            geometry.computeVertexNormals();

            // Orient correctly (Three.js extrudes along Z, but we want gear axis to be vertical in our scene or as per spur gear)
            // Spur gear uses geometry.rotateX(Math.PI / 2); Let's stay consistent.
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

            console.log('Helical gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating helical gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createBevelGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating bevel gear with conical taper...', gearData);

        try {
            const gearShape = this.createCorrectedGearShape(gearData, quality);

            // Calculate taper factor
            // delta is pitchAngle
            // Large radius R = pitchDiameter / 2
            // Small radius r = R - faceWidth * sin(delta)
            // Taper factor at small end = r / R
            const delta = gearData.pitchAngle * Math.PI / 180;
            const R = gearData.pitchDiameter / 2;
            const faceWidth = gearData.faceWidth;
            const r = R - faceWidth * Math.sin(delta);
            const taperFactor = r / R;

            // Offset the gear for conical alignment
            // The apex of the cone should be at (0, 0, Z_apex)
            // Z_apex = R / tan(delta)
            const zApex = R / Math.tan(delta);

            const steps = quality === 'high' ? 8 : (quality === 'medium' ? 4 : 2);
            const extrudeSettings = {
                depth: faceWidth,
                steps: steps,
                bevelEnabled: true,
                bevelThickness: Math.min(0.2, gearData.module * 0.1),
                bevelSize: Math.min(0.2, gearData.module * 0.1),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);

            // We want to taper towards the apex. 
            // In Three.js, extrude is from Z=0 to Z=depth.
            // Let's assume Z=0 is the LARGE end and Z=faceWidth is the SMALL end.
            const positions = geometry.attributes.position;

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                // Normalizing z factor: 0 at large end, 1 at small end
                const zFactor = z / faceWidth;

                // Current scale at this Z
                const s = 1.0 - (1.0 - taperFactor) * zFactor;

                positions.setXY(i, x * s, y * s);

                // We could also adjust Z to follow the cone angle strictly if needed,
                // but linear interpolation between planes is usually fine for display.
            }

            geometry.computeVertexNormals();
            geometry.center();
            geometry.rotateX(Math.PI / 2);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x222222,
                flatShading: false
            });

            const gearMesh = new THREE.Mesh(geometry, material);
            gearMesh.castShadow = true;
            gearMesh.receiveShadow = true;

            if (window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
            }

            console.log('Bevel gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating bevel gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createWormGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating worm gear with high twist...', gearData);

        try {
            const gearShape = this.createCorrectedGearShape(gearData, quality);

            // Calculate total twist angle (in radians)
            // leadAngle is gamma
            // Lead L = PI * d * tan(gamma)
            // Twist angle for faceWidth = (faceWidth / L) * 2 * PI
            // twist = (faceWidth / (PI * d * tan(gamma))) * 2 * PI = 2 * faceWidth / (d * tan(gamma))
            const gamma = gearData.leadAngle * Math.PI / 180;
            const d = gearData.pitchDiameter;
            const twistAngle = (2 * gearData.faceWidth) / (d * Math.tan(gamma));

            const steps = quality === 'high' ? 64 : (quality === 'medium' ? 32 : 16);
            const extrudeSettings = {
                depth: gearData.faceWidth,
                steps: steps,
                bevelEnabled: true,
                bevelThickness: Math.min(0.2, gearData.module * 0.1),
                bevelSize: Math.min(0.2, gearData.module * 0.1),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(gearShape, extrudeSettings);
            geometry.center();

            // Apply helical twist
            const positions = geometry.attributes.position;
            const faceWidth = gearData.faceWidth;

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                const angle = (z / faceWidth) * twistAngle;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);

                const newX = x * cosA - y * sinA;
                const newY = x * sinA + y * cosA;

                positions.setXY(i, newX, newY);
            }

            geometry.computeVertexNormals();
            geometry.rotateX(Math.PI / 2);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x222222,
                flatShading: false
            });

            const gearMesh = new THREE.Mesh(geometry, material);
            gearMesh.castShadow = true;
            gearMesh.receiveShadow = true;

            if (window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
            }

            console.log('Worm gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating worm gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createRackGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating rack gear with linear layout...', gearData);

        try {
            const { teeth, displayPoints, module, circularPitch, faceWidth } = gearData;
            const shape = new THREE.Shape();

            // Create linear teeth layout
            // Centering: start at - (teeth * p) / 2
            const p = circularPitch;
            const startX = -(teeth * p) / 2;

            // Start at bottom left of first tooth
            const firstPt = displayPoints[0];
            shape.moveTo(startX + firstPt.x, firstPt.y);

            for (let i = 0; i < teeth; i++) {
                const offsetX = startX + i * p + p / 2;

                displayPoints.forEach((pt, index) => {
                    // Skip first point of first tooth
                    if (i === 0 && index === 0) return;
                    shape.lineTo(offsetX + pt.x, pt.y);
                });
            }

            // Add back and bottom to close the rack body
            const endX = startX + teeth * p;
            const baseDepth = module * 2; // Extra depth for the rack body
            const rootY = -gearData.dedendum;

            shape.lineTo(endX, rootY - baseDepth);
            shape.lineTo(startX, rootY - baseDepth);
            shape.closePath();

            const extrudeSettings = {
                depth: faceWidth,
                bevelEnabled: true,
                bevelThickness: Math.min(0.2, module * 0.1),
                bevelSize: Math.min(0.2, module * 0.1),
                bevelSegments: 2,
                curveSegments: 12
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geometry.center();
            geometry.rotateX(Math.PI / 2);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x222222
            });

            const gearMesh = new THREE.Mesh(geometry, material);
            gearMesh.castShadow = true;
            gearMesh.receiveShadow = true;

            if (window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
            }

            console.log('Rack gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating rack gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createInternalGear(gearData, color = '#3498db', quality = 'medium') {
        console.log('Creating internal gear (ring) from constructive loop...', gearData);

        try {
            const { displayPoints, rimRadius, module, faceWidth } = gearData;

            // Outer ring (CCW)
            const ringShape = new THREE.Shape();
            const outerR = rimRadius || (gearData.rootRadius + 2 * module);

            const segments = 120; // Smoother outer ring
            for (let i = 0; i < segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                const x = outerR * Math.cos(theta);
                const y = outerR * Math.sin(theta);
                if (i === 0) ringShape.moveTo(x, y);
                else ringShape.lineTo(x, y);
            }
            ringShape.closePath();

            // Inner teeth hole (CW)
            // The displayPoints provided by generateFullInternalProfile is already CW
            const teethHole = new THREE.Path();
            if (displayPoints.length > 0) {
                teethHole.moveTo(displayPoints[0].x, displayPoints[0].y);
                for (let i = 1; i < displayPoints.length; i++) {
                    teethHole.lineTo(displayPoints[i].x, displayPoints[i].y);
                }
                teethHole.closePath();
            }

            ringShape.holes.push(teethHole);

            const extrudeSettings = {
                depth: faceWidth,
                bevelEnabled: true,
                bevelThickness: Math.min(0.1, module * 0.05),
                bevelSize: Math.min(0.1, module * 0.05),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
            geometry.center();
            geometry.rotateX(Math.PI / 2);

            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 60,
                specular: 0x222222,
                side: THREE.DoubleSide
            });

            const gearMesh = new THREE.Mesh(geometry, material);
            gearMesh.castShadow = true;
            gearMesh.receiveShadow = true;

            if (window.sceneManager) {
                window.sceneManager.addGear(gearMesh);
            }

            console.log('Internal gear created successfully');
            return gearMesh;

        } catch (error) {
            console.error('Error creating internal gear:', error);
            return this.createRobustGear(gearData, color);
        }
    }

    createPlanetaryGear(assemblyData, color = '#3498db', quality = 'medium') {
        console.log('Assembling planetary system...', assemblyData);

        try {
            const group = new THREE.Group();
            const { sun, planet, ring, planetCount, centerDistance } = assemblyData;

            // 1. Create Sun Mesh
            // We use a internal helper to avoid adding to scene immediately
            const sunMesh = this._createRawGearMesh(sun, color, quality);
            group.add(sunMesh);

            // 2. Create Ring Mesh
            const ringMesh = this._createRawInternalMesh(ring, color, quality);
            group.add(ringMesh);

            // 3. Create Planet Meshes
            const planetColor = new THREE.Color(color).multiplyScalar(0.8);
            for (let i = 0; i < planetCount; i++) {
                const angle = (i / planetCount) * Math.PI * 2;
                const planetMesh = this._createRawGearMesh(planet, planetColor, quality);

                planetMesh.position.x = centerDistance * Math.cos(angle);
                planetMesh.position.z = centerDistance * Math.sin(angle);

                // Rotation for meshing (rough approximation)
                planetMesh.rotation.y = -angle * (sun.teeth / planet.teeth);

                group.add(planetMesh);
            }

            if (window.sceneManager) {
                window.sceneManager.addGear(group);
            }

            console.log('Planetary assembly created successfully');
            return group;

        } catch (error) {
            console.error('Error creating planetary gear:', error);
            return null;
        }
    }

    // Raw mesh creation helpers (don't add to scene manager automatically)
    _createRawGearMesh(gearData, color, quality) {
        const shape = this.createCorrectedGearShape(gearData, quality);
        const extrudeSettings = {
            depth: gearData.faceWidth,
            bevelEnabled: true,
            bevelThickness: Math.min(0.2, gearData.module * 0.1),
            bevelSize: Math.min(0.2, gearData.module * 0.1),
            bevelSegments: 2,
            curveSegments: 12
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshPhongMaterial({ color, shininess: 60 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    _createRawInternalMesh(gearData, color, quality) {
        const { displayPoints, rimRadius, module, faceWidth } = gearData;
        const ringShape = new THREE.Shape();
        const outerR = rimRadius || (gearData.rootRadius + 2 * module);
        const segments = 120;
        for (let i = 0; i < segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const x = outerR * Math.cos(theta);
            const y = outerR * Math.sin(theta);
            if (i === 0) ringShape.moveTo(x, y);
            else ringShape.lineTo(x, y);
        }
        ringShape.closePath();
        const teethHole = new THREE.Path();
        displayPoints.forEach((pt, index) => {
            if (index === 0) teethHole.moveTo(pt.x, pt.y);
            else teethHole.lineTo(pt.x, pt.y);
        });
        teethHole.closePath();
        ringShape.holes.push(teethHole);
        const extrudeSettings = {
            depth: faceWidth,
            bevelEnabled: true,
            bevelThickness: Math.min(0.1, module * 0.05),
            bevelSize: Math.min(0.1, module * 0.05),
            bevelSegments: 2,
            curveSegments: 24
        };
        const geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
        geometry.center();
        geometry.rotateX(Math.PI / 2);
        const material = new THREE.MeshPhongMaterial({ color, shininess: 60, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
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