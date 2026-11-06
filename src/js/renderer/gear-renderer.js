// Gear Renderer: builds 3D meshes whose dimensions match the nominal gear data.
// Chamfers only ever remove material, so tip diameter, tooth thickness, bore and
// face width are exact on the body of the teeth.
class GearRenderer {
    createSpurGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.5, gearData.module * 0.2)
            });
            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating gear:', error);
            return null;
        }
    }

    createHelicalGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            // twist = faceWidth * tan(beta) / pitchRadius
            const beta = gearData.helixAngle * Math.PI / 180;
            const twistAngle = (gearData.faceWidth * Math.tan(beta)) / (gearData.pitchDiameter / 2);

            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.5, gearData.module * 0.2),
                steps: quality === 'high' ? 32 : (quality === 'medium' ? 16 : 8),
                deform: this._twist(twistAngle, gearData.faceWidth)
            });
            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating helical gear:', error);
            return null;
        }
    }

    createBevelGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            // Large radius R = pitchDiameter / 2, small radius r = R - faceWidth * sin(delta)
            const delta = gearData.pitchAngle * Math.PI / 180;
            const R = gearData.pitchDiameter / 2;
            const faceWidth = gearData.faceWidth;
            const taperFactor = (R - faceWidth * Math.sin(delta)) / R;

            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.2, gearData.module * 0.1),
                steps: quality === 'high' ? 8 : (quality === 'medium' ? 4 : 2),
                // z = 0 is the large end, z = faceWidth the small end
                deform: (x, y, z) => {
                    const s = 1.0 - (1.0 - taperFactor) * (z / faceWidth);
                    return [x * s, y * s];
                }
            });
            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating bevel gear:', error);
            return null;
        }
    }

    createWormGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            // twist = 2 * faceWidth / (d * tan(gamma)); a zero lead angle gives a straight worm.
            const gamma = gearData.leadAngle * Math.PI / 180;
            const tanGamma = Math.tan(gamma);
            const twistAngle = Math.abs(tanGamma) > 1e-6
                ? (2 * gearData.faceWidth) / (gearData.pitchDiameter * tanGamma)
                : 0;

            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.2, gearData.module * 0.1),
                steps: quality === 'high' ? 64 : (quality === 'medium' ? 32 : 16),
                deform: this._twist(twistAngle, gearData.faceWidth)
            });
            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating worm gear:', error);
            return null;
        }
    }

    createRackGear(gearData, color = '#3498db', quality = 'medium') {
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

            const geometry = new THREE.ExtrudeGeometry(
                shape,
                this._nominalExtrudeSettings(faceWidth, Math.min(0.2, module * 0.1), 12)
            );
            geometry.center();
            geometry.rotateX(Math.PI / 2);

            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating rack gear:', error);
            return null;
        }
    }

    createInternalGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            return this._createInternalMesh(gearData, color, 0x222222);
        } catch (error) {
            console.error('Error creating internal gear:', error);
            return null;
        }
    }

    createPlanetaryGear(assemblyData, color = '#3498db', quality = 'medium') {
        try {
            const group = new THREE.Group();
            const { sun, planet, ring, planetCount, centerDistance } = assemblyData;

            // 1. Sun
            group.add(this._createPlanetarySpurMesh(sun, color));

            // 2. Ring
            group.add(this._createInternalMesh(ring, color));

            // 3. Planets
            const planetColor = new THREE.Color(color).multiplyScalar(0.8);
            for (let i = 0; i < planetCount; i++) {
                const angle = (i / planetCount) * Math.PI * 2;
                const planetMesh = this._createPlanetarySpurMesh(planet, planetColor);

                planetMesh.position.x = centerDistance * Math.cos(angle);
                planetMesh.position.z = centerDistance * Math.sin(angle);

                // Rotation for meshing (rough approximation)
                planetMesh.rotation.y = -angle * (sun.teeth / planet.teeth);

                group.add(planetMesh);
            }

            return group;
        } catch (error) {
            console.error('Error creating planetary gear:', error);
            return null;
        }
    }

    _createPlanetarySpurMesh(gearData, color) {
        const geometry = this._buildGearGeometry(gearData, {
            chamfer: Math.min(0.2, gearData.module * 0.1)
        });
        return this._createMesh(geometry, color, null);
    }

    _createInternalMesh(gearData, color, specular = null) {
        const { displayPoints, rimRadius, module, faceWidth } = gearData;

        // Outer ring (CCW)
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

        // Inner teeth hole: displayPoints from generateFullInternalProfile is already CW
        const teethHole = new THREE.Path();
        displayPoints.forEach((pt, index) => {
            if (index === 0) teethHole.moveTo(pt.x, pt.y);
            else teethHole.lineTo(pt.x, pt.y);
        });
        teethHole.closePath();
        ringShape.holes.push(teethHole);

        const settings = this._nominalExtrudeSettings(faceWidth, Math.min(0.1, module * 0.05), 24);
        const geometry = new THREE.ExtrudeGeometry(ringShape, settings);
        geometry.translate(0, 0, -settings.depth / 2);
        geometry.rotateX(Math.PI / 2);

        return this._createMesh(geometry, color, specular, THREE.DoubleSide);
    }

    _createMesh(geometry, color, specular = 0x222222, side = THREE.FrontSide) {
        const options = { color, shininess: 60, side };
        if (specular !== null) options.specular = specular;
        const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(options));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // ExtrudeGeometry grows the outline by bevelSize and the depth by 2 * bevelThickness.
    // A negative bevelOffset keeps the body on the outline, and a reduced depth keeps the total on faceWidth.
    _nominalExtrudeSettings(faceWidth, chamfer, curveSegments) {
        const c = Math.min(chamfer, faceWidth / 4);
        return {
            depth: faceWidth - 2 * c,
            bevelEnabled: true,
            bevelThickness: c,
            bevelSize: c,
            bevelOffset: -c,
            bevelSegments: 2,
            curveSegments
        };
    }

    _twist(twistAngle, faceWidth) {
        return (x, y, z) => {
            const angle = (z / faceWidth - 0.5) * twistAngle;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            return [x * cosA - y * sinA, x * sinA + y * cosA];
        };
    }

    // Closed outline of all teeth, counter-clockwise, without repeated points.
    _gearContour(gearData) {
        const { teeth, displayPoints } = gearData;
        if (!displayPoints || displayPoints.length === 0) {
            throw new Error('Gear contour: gearData has no displayPoints');
        }

        const toothAngle = 2 * Math.PI / teeth;
        const contour = [];
        const isSame = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 1e-9;

        for (let tooth = 0; tooth < teeth; tooth++) {
            const cosR = Math.cos(tooth * toothAngle);
            const sinR = Math.sin(tooth * toothAngle);
            displayPoints.forEach(pt => {
                const point = { x: pt.x * cosR - pt.y * sinR, y: pt.x * sinR + pt.y * cosR };
                if (contour.length === 0 || !isSame(contour[contour.length - 1], point)) {
                    contour.push(point);
                }
            });
        }
        if (isSame(contour[0], contour[contour.length - 1])) contour.pop();

        return THREE.ShapeUtils.isClockWise(contour) ? contour.reverse() : contour;
    }

    // Builds a closed mesh from rings that share their vertices:
    //   - toothed wall, from z = 0 to z = faceWidth, with a tip chamfer at both ends;
    //   - cylindrical bore through the whole part;
    //   - optional hub on the z < 0 side, of diameter hubDiameter and length faceWidth / 2.
    // `deform` (twist, taper) applies to the toothed wall only: bore and hub stay true cylinders.
    _buildGearGeometry(gearData, { chamfer = 0, steps = 1, deform = null } = {}) {
        const F = gearData.faceWidth;
        const tipR = gearData.outerRadius;
        const positions = [];

        const c = Math.max(0, Math.min(chamfer, F / 4, (tipR - gearData.rootRadius) / 2));

        // A ring is a list of { x, y, z } points.
        const addWall = (lower, upper) => {
            const n = lower.length;
            for (let i = 0; i < n; i++) {
                const j = (i + 1) % n;
                const a = lower[i], b = lower[j], d = upper[j], e = upper[i];
                positions.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
                positions.push(a.x, a.y, a.z, d.x, d.y, d.z, e.x, e.y, e.z);
            }
        };

        const addLid = (outer, hole, faceUp) => {
            const toV2 = ring => ring.map(p => new THREE.Vector2(p.x, p.y));
            const faces = THREE.ShapeUtils.triangulateShape(toV2(outer), hole ? [toV2(hole)] : []);
            const all = hole ? outer.concat(hole) : outer;
            faces.forEach(([i0, i1, i2]) => {
                const a = all[i0], b = all[i1], d = all[i2];
                const isUp = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x) > 0;
                const [p, q, r] = isUp === faceUp ? [a, b, d] : [a, d, b];
                positions.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
            });
        };

        // Clockwise for walls facing the axis (bore), counter-clockwise for walls facing outwards (hub).
        const circle = (radius, z, clockwise) => {
            const segments = 64;
            const ring = [];
            for (let i = 0; i < segments; i++) {
                const a = (i / segments) * Math.PI * 2 * (clockwise ? -1 : 1);
                ring.push({ x: radius * Math.cos(a), y: radius * Math.sin(a), z });
            }
            return ring;
        };

        // Toothed wall: at each end the outline is cut by a smaller tip circle, so flanks stay on profile.
        const contour = this._gearContour(gearData);
        const toothedRing = (z, maxRadius) => contour.map(p => {
            const r = Math.hypot(p.x, p.y);
            const k = r > maxRadius ? maxRadius / r : 1;
            const [x, y] = deform ? deform(p.x * k, p.y * k, z) : [p.x * k, p.y * k];
            return { x, y, z };
        });

        const zLevels = [];
        if (c > 0) zLevels.push({ z: 0, maxRadius: tipR - c });
        for (let i = 0; i <= steps; i++) {
            zLevels.push({ z: c + (F - 2 * c) * (i / steps), maxRadius: tipR });
        }
        if (c > 0) zLevels.push({ z: F, maxRadius: tipR - c });

        const rings = zLevels.map(level => toothedRing(level.z, level.maxRadius));
        for (let i = 0; i < rings.length - 1; i++) addWall(rings[i], rings[i + 1]);

        const bottomRing = rings[0];
        const topRing = rings[rings.length - 1];
        const minRadius = ring => ring.reduce((min, p) => Math.min(min, Math.hypot(p.x, p.y)), Infinity);

        // Bore and hub: the validator reports the values that cannot be built.
        const boreR = (gearData.boreDiameter || 0) / 2;
        const requestedHubR = (gearData.hubDiameter || 0) / 2;
        const hasHub = requestedHubR > boreR && requestedHubR < minRadius(bottomRing);
        const hubLength = F / 2;

        const roomForBoreChamfer = Math.min(minRadius(topRing), hasHub ? requestedHubR : minRadius(bottomRing)) - boreR;
        const boreChamfer = boreR > 0 ? Math.max(0, Math.min(c, roomForBoreChamfer / 4)) : 0;
        const zStart = hasHub ? -hubLength : 0;

        const boreBottom = boreR > 0 ? circle(boreR + boreChamfer, zStart, true) : null;
        const boreTop = boreR > 0 ? circle(boreR + boreChamfer, F, true) : null;

        if (boreR > 0) {
            const lower = circle(boreR, zStart + boreChamfer, true);
            const upper = circle(boreR, F - boreChamfer, true);
            addWall(boreBottom, lower);
            addWall(lower, upper);
            addWall(upper, boreTop);
        }

        addLid(topRing, boreTop, true);

        if (hasHub) {
            const hubChamfer = Math.min(c, (requestedHubR - boreR) / 4, hubLength / 4);
            const hubEnd = circle(requestedHubR - hubChamfer, -hubLength, false);
            const hubBody = circle(requestedHubR, -hubLength + hubChamfer, false);
            const hubBase = circle(requestedHubR, 0, false);
            addWall(hubEnd, hubBody);
            addWall(hubBody, hubBase);
            addLid(hubEnd, boreBottom, false);
            addLid(bottomRing, hubBase, false);
        } else {
            addLid(bottomRing, boreBottom, false);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        // Teeth centred on the origin along the axis, then scene orientation (axis on Y).
        geometry.translate(0, 0, -F / 2);
        geometry.rotateX(Math.PI / 2);
        return geometry;
    }
}
