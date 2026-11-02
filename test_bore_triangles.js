const fs = require('fs');
const https = require('https');

https.get('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        const fn = new Function('window', 'self', raw + '\nreturn THREE;');
        const THREE = fn({}, {});
        eval(fs.readFileSync('src/js/utils/math-utils.js', 'utf8'));

        function makeShape(teeth, boreDia) {
            const shape = new THREE.Shape();
            const gearData = calculateSpurGear(2, teeth, 20, 10, 10, boreDia, 'medium');
            const { displayPoints } = gearData;
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

            if (boreDia > 0) {
                const boreRadius = boreDia / 2;
                const borePath = new THREE.Path();
                borePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
                shape.holes.push(borePath);
            }
            return { shape, gearData };
        }

        const { shape } = makeShape(21, 5);
        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: 10,
            bevelEnabled: true,
            bevelThickness: 0.4,
            bevelSize: 0.4,
            bevelSegments: 2,
            curveSegments: 24
        });

        const pos = geom.attributes.position;
        // Check Z coordinates of those triangles inside radius < 2.4
        for (let i = 0; i < pos.count; i += 3) {
            const ax = pos.getX(i), ay = pos.getY(i), az = pos.getZ(i);
            const bx = pos.getX(i + 1), by = pos.getY(i + 1), bz = pos.getZ(i + 1);
            const cx = pos.getX(i + 2), cy = pos.getY(i + 2), cz = pos.getZ(i + 2);
            if (Math.hypot(ax, ay) < 2.4 && Math.hypot(bx, by) < 2.4 && Math.hypot(cx, cy) < 2.4) {
                console.log(`Triangle at center: A=(${ax.toFixed(2)},${ay.toFixed(2)},${az.toFixed(2)}) B=(${bx.toFixed(2)},${by.toFixed(2)},${bz.toFixed(2)}) C=(${cx.toFixed(2)},${cy.toFixed(2)},${cz.toFixed(2)})`);
                break;
            }
        }
    });
});

