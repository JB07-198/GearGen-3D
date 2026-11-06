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
            const { coneDistance, apexDistance, faceWidth } = gearData;
            const steps = quality === 'high' ? 8 : (quality === 'medium' ? 4 : 2);

            // Every point of the large end moves in a straight line towards the apex of the cone.
            const contour = this._gearContour(gearData);
            const rings = [];
            for (let i = 0; i <= steps; i++) {
                const s = 1 - (faceWidth / coneDistance) * (i / steps);
                rings.push(contour.map(p => ({
                    x: p.x * s,
                    y: p.y * s,
                    z: apexDistance + s * (p.z - apexDistance)
                })));
            }

            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.2, gearData.module * 0.1),
                rings
            });
            return this._createMesh(geometry, color);
        } catch (error) {
            console.error('Error creating bevel gear:', error);
            return null;
        }
    }

    createWormGear(gearData, color = '#3498db', quality = 'medium') {
        try {
            // The section of a thread is the same all along the axis, turned by one revolution per lead.
            const twistAngle = 2 * Math.PI * gearData.faceWidth / gearData.lead;
            const stepsPerTurn = quality === 'high' ? 144 : (quality === 'medium' ? 72 : 36);
            const steps = Math.min(2000, Math.max(8, Math.ceil((twistAngle / (2 * Math.PI)) * stepsPerTurn)));

            const geometry = this._buildGearGeometry(gearData, {
                chamfer: Math.min(0.2, gearData.module * 0.1),
                steps,
                deform: this._twist(twistAngle, gearData.faceWidth),
                splitAlongTwist: true
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
            const endX = startX + teeth * p;
            const rootY = -gearData.dedendum;
            const baseY = rootY - module * 2; // Extra depth for the rack body

            // Body, with a root land at each end so that the length is exactly teeth * pitch
            shape.moveTo(startX, baseY);
            shape.lineTo(startX, rootY);

            for (let i = 0; i < teeth; i++) {
                const offsetX = startX + i * p + p / 2;
                displayPoints.forEach(pt => shape.lineTo(offsetX + pt.x, pt.y));
            }

            shape.lineTo(endX, rootY);
            shape.lineTo(endX, baseY);
            shape.closePath();

            const settings = this._nominalExtrudeSettings(faceWidth, Math.min(0.2, module * 0.1), 12);
            const geometry = new THREE.ExtrudeGeometry(shape, settings);

            // Pitch line kept on y = 0, so that a mating gear sits at its pitch radius from it.
            geometry.translate(0, 0, -settings.depth / 2);
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
            const { sun, planet, ring, planetCount, centerDistance, sunTeeth, planetTeeth, ringTeeth } = assemblyData;

            // 1. Sun
            group.add(this._createPlanetarySpurMesh(sun, color));

            // 2. Ring: it has a tooth on the first planet's axis, where a planet with an odd tooth count has one too.
            const ringMesh = this._createInternalMesh(ring, color);
            if (planetTeeth % 2 === 1) ringMesh.rotation.y = -Math.PI / ringTeeth;
            group.add(ringMesh);

            // 3. Planets
            const planetColor = new THREE.Color(color).multiplyScalar(0.8);
            for (let i = 0; i < planetCount; i++) {
                const angle = (i / planetCount) * Math.PI * 2;
                const planetMesh = this._createPlanetarySpurMesh(planet, planetColor);

                planetMesh.position.x = centerDistance * Math.cos(angle);
                planetMesh.position.z = centerDistance * Math.sin(angle);

                // Phase: a space faces the sun tooth at the first planet, then the planet rolls around the sun.
                const phase = Math.PI - Math.PI / planetTeeth + angle * (1 + sunTeeth / planetTeeth);
                planetMesh.rotation.y = -phase;

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
        return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial(options));
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
                const point = { x: pt.x * cosR - pt.y * sinR, y: pt.x * sinR + pt.y * cosR, z: pt.z || 0 };
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
    // `deform` (twist) and `rings` (ready-made toothed wall, ends not necessarily flat) concern the
    // teeth only: bore and hub stay true cylinders. `splitAlongTwist` follows a steep helix in the mesh.
    _buildGearGeometry(gearData, { chamfer = 0, steps = 1, deform = null, rings: presetRings = null, splitAlongTwist = false } = {}) {
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
                if (splitAlongTwist) {
                    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, e.x, e.y, e.z);
                    positions.push(b.x, b.y, b.z, d.x, d.y, d.z, e.x, e.y, e.z);
                } else {
                    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, d.x, d.y, d.z);
                    positions.push(a.x, a.y, a.z, d.x, d.y, d.z, e.x, e.y, e.z);
                }
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
        const circle = (radius, z, clockwise, segments = 64) => {
            const ring = [];
            for (let i = 0; i < segments; i++) {
                const a = (i / segments) * Math.PI * 2 * (clockwise ? -1 : 1);
                ring.push({ x: radius * Math.cos(a), y: radius * Math.sin(a), z });
            }
            return ring;
        };

        // Toothed wall: at each end the outline is cut by a smaller tip circle, so flanks stay on profile.
        let rings = presetRings;
        if (!rings) {
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

            rings = zLevels.map(level => toothedRing(level.z, level.maxRadius));
        }
        for (let i = 0; i < rings.length - 1; i++) addWall(rings[i], rings[i + 1]);

        const bottomRing = rings[0];
        const topRing = rings[rings.length - 1];
        const minRadius = ring => ring.reduce((min, p) => Math.min(min, Math.hypot(p.x, p.y)), Infinity);

        // The flat part of an end is at the height of its lowest point (the tooth root on a cone).
        const flatLevel = ring => ring.reduce((min, p) => Math.min(min, p.z), Infinity);
        const bottomLevel = flatLevel(bottomRing);
        const topLevel = flatLevel(topRing);

        // On a conical end, the teeth are closed down to a circle under their root, then flat to the hole.
        const addEnd = (ring, hole, faceUp) => {
            const level = flatLevel(ring);
            const isFlat = ring.every(p => Math.abs(p.z - level) < 1e-9);
            const holeRadius = hole ? Math.hypot(hole[0].x, hole[0].y) : 0;
            const innerRadius = minRadius(ring) * Math.cos(Math.PI / gearData.teeth) * 0.995;
            if (isFlat || innerRadius <= holeRadius) {
                addLid(ring, hole, faceUp);
                return;
            }
            const inner = circle(innerRadius, level, true, Math.max(64, 4 * gearData.teeth));
            addLid(ring, inner, faceUp);
            addLid(inner, hole, faceUp);
        };

        // Bore and hub: the validator reports the values that cannot be built.
        const boreR = (gearData.boreDiameter || 0) / 2;
        const requestedHubR = (gearData.hubDiameter || 0) / 2;
        const hasHub = requestedHubR > boreR && requestedHubR < minRadius(bottomRing);
        const hubLength = F / 2;

        const roomForBoreChamfer = Math.min(minRadius(topRing), hasHub ? requestedHubR : minRadius(bottomRing)) - boreR;
        const boreChamfer = boreR > 0 ? Math.max(0, Math.min(c, roomForBoreChamfer / 4)) : 0;
        const zStart = hasHub ? bottomLevel - hubLength : bottomLevel;

        const boreBottom = boreR > 0 ? circle(boreR + boreChamfer, zStart, true) : null;
        const boreTop = boreR > 0 ? circle(boreR + boreChamfer, topLevel, true) : null;

        if (boreR > 0) {
            const lower = circle(boreR, zStart + boreChamfer, true);
            const upper = circle(boreR, topLevel - boreChamfer, true);
            addWall(boreBottom, lower);
            addWall(lower, upper);
            addWall(upper, boreTop);
        }

        addEnd(topRing, boreTop, true);

        if (hasHub) {
            const hubChamfer = Math.min(c, (requestedHubR - boreR) / 4, hubLength / 4);
            const hubEnd = circle(requestedHubR - hubChamfer, zStart, false);
            const hubBody = circle(requestedHubR, zStart + hubChamfer, false);
            const hubBase = circle(requestedHubR, bottomLevel, false);
            addWall(hubEnd, hubBody);
            addWall(hubBody, hubBase);
            addLid(hubEnd, boreBottom, false);
            addEnd(bottomRing, hubBase, false);
        } else {
            addEnd(bottomRing, boreBottom, false);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        // Teeth centred on the origin along the axis, then scene orientation (axis on Y).
        geometry.translate(0, 0, -(bottomLevel + topLevel) / 2);
        geometry.rotateX(Math.PI / 2);
        return geometry;
    }
}
