const fs = require('fs');
const https = require('https');

https.get('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        const fn = new Function('window', 'self', raw + '\nreturn THREE;');
        const THREE = fn({}, {});
        eval(fs.readFileSync('src/js/utils/math-utils.js', 'utf8'));

        for (const quality of ['low', 'medium', 'high']) {
            for (const curveSegments of [12, 24, 32]) {
                for (let z = 18; z <= 24; z++) {
                    const shape = new THREE.Shape();
                    const gearData = calculateSpurGear(2, z, 20, 10, 10, 5, quality);
                    const { displayPoints } = gearData;
                    const toothAngle = 2 * Math.PI / z;

                    const firstPoint = displayPoints[0];
                    shape.moveTo(firstPoint.x, firstPoint.y);

                    for (let tooth = 0; tooth < z; tooth++) {
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

                    const boreRadius = 2.5;
                    const borePath = new THREE.Path();
                    borePath.absarc(0, 0, boreRadius, 0, Math.PI * 2, true);
                    shape.holes.push(borePath);

                    const geom = new THREE.ExtrudeGeometry(shape, {
                        depth: 10,
                        bevelEnabled: true,
                        bevelThickness: 0.4,
                        bevelSize: 0.4,
                        bevelSegments: 2,
                        curveSegments: curveSegments
                    });

                    const pos = geom.attributes.position;
                    let hitsCenter = 0;
                    for (let i = 0; i < pos.count; i += 3) {
                        const ax = pos.getX(i), ay = pos.getY(i);
                        const bx = pos.getX(i+1), by = pos.getY(i+1);
                        const cx = pos.getX(i+2), cy = pos.getY(i+2);
                        const d1 = (0 - bx) * (ay - by) - (ax - bx) * (0 - by);
                        const d2 = (0 - cx) * (by - cy) - (bx - cx) * (0 - cy);
                        const d3 = (0 - ax) * (cy - ay) - (cx - ax) * (0 - ay);
                        if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) {
                            hitsCenter++;
                        }
                    }
                    if (hitsCenter > 0) {
                        console.log(`FAIL! Quality=${quality}, curveSegments=${curveSegments}, z=${z}: hitsCenter=${hitsCenter} (HOLE DISAPPEARED!)`);
                    }
                }
            }
        }
        console.log('Done scanning.');
    });
});

