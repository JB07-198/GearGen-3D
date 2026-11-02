const fs = require('fs');
const https = require('https');

https.get('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        const fn = new Function('window', 'self', raw + '\nreturn THREE;');
        const THREE = fn({}, {});
        eval(fs.readFileSync('src/js/utils/math-utils.js', 'utf8'));

        function createBevel(gearData) {
            const shape = new THREE.Shape();
            const { teeth, displayPoints } = gearData;
            const toothAngle = 2 * Math.PI / teeth;

            const firstPoint = displayPoints[0];
            shape.moveTo(firstPoint.x, firstPoint.y);

            for (let tooth = 0; tooth < teeth; tooth++) {
                const rotation = tooth * toothAngle;
                for (let i = 0; i < displayPoints.length; i++) {
                    if (tooth === 0 && i === 0) continue;
                    const point = displayPoints[i];
                    const cosR = Math.cos(rotation);
                    const sinR = Math.sin(rotation);
                    const x = point.x * cosR - point.y * sinR;
                    const y = point.x * sinR + point.y * cosR;
                    shape.lineTo(x, y);
                }
            }
            shape.closePath();

            if (gearData.boreDiameter > 0) {
                const boreRadius = gearData.boreDiameter / 2;
                const borePath = new THREE.Path();
                borePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
                shape.holes.push(borePath);
            }

            const delta = gearData.pitchAngle * Math.PI / 180;
            const R = gearData.pitchDiameter / 2;
            const faceWidth = gearData.faceWidth;
            const r = R - faceWidth * Math.sin(delta);
            const taperFactor = r / R;

            const extrudeSettings = {
                depth: faceWidth,
                steps: 4,
                bevelEnabled: true,
                bevelThickness: Math.min(0.2, gearData.module * 0.1),
                bevelSize: Math.min(0.2, gearData.module * 0.1),
                bevelSegments: 2,
                curveSegments: 24
            };

            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const positions = geometry.attributes.position;

            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                const zFactor = z / faceWidth;
                const s = 1.0 - (1.0 - taperFactor) * zFactor;

                positions.setXY(i, x * s, y * s);
            }

            geometry.computeVertexNormals();
            geometry.center();
            geometry.rotateX(Math.PI / 2);
            return geometry;
        }

        for (let z of [20, 21, 22]) {
            for (let fw of [10, 20, 30, 39]) {
                const data = calculateBevelGear(2, z, 20, 45, fw, 10, 5, 'medium');
                const geom = createBevel(data);

                // Let's check the hole at top and bottom of the gear (along Y axis because rotateX(PI/2) turned Z into Y!)
                // The gear axis is now along Y!
                const pos = geom.attributes.position;
                let hitsAxis = 0;
                for (let i = 0; i < pos.count; i += 3) {
                    const ax = pos.getX(i), az = pos.getZ(i);
                    const bx = pos.getX(i + 1), bz = pos.getZ(i + 1);
                    const cx = pos.getX(i + 2), cz = pos.getZ(i + 2);

                    const d1 = (0 - bx) * (az - bz) - (ax - bx) * (0 - bz);
                    const d2 = (0 - cx) * (bz - cz) - (bx - cx) * (0 - cz);
                    const d3 = (0 - ax) * (cz - az) - (cx - ax) * (0 - az);
                    if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) {
                        hitsAxis++;
                    }
                }
                console.log(`Bevel z=${z}, faceWidth=${fw}: triangles crossing central axis = ${hitsAxis}`);
            }
        }
    });
});

