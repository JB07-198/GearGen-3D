const fs = require('fs');
const https = require('https');

https.get('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', (res) => {
    let raw = '';
    res.on('data', d => raw += d);
    res.on('end', () => {
        const fn = new Function('window', 'self', raw + '\nreturn THREE;');
        const THREE = fn({}, {});
        eval(fs.readFileSync('src/js/utils/math-utils.js', 'utf8'));

        function testZ(z) {
            const shape = new THREE.Shape();
            const gearData = calculateSpurGear(2, z, 20, 10, 10, 5, 'medium');
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

            // Now let's test Three.js Shape.extractPoints and triangulate
            const points = shape.extractPoints(12);
            const outer = points.shape;
            const hole = points.holes[0];
            
            const triangles = THREE.ShapeUtils.triangulateShape(outer, [hole]);
            
            // Check if hole vertices are referenced in triangles!
            // In ShapeUtils.triangulateShape:
            // vertices are [outer..., hole...]
            // outer indices are 0 to outer.length - 1
            // hole indices are outer.length to outer.length + hole.length - 1
            const holeStartIndex = outer.length;
            let holeUsed = 0;
            for (const tri of triangles) {
                if (tri[0] >= holeStartIndex || tri[1] >= holeStartIndex || tri[2] >= holeStartIndex) {
                    holeUsed++;
                }
            }
            console.log(`z=${z}: outer=${outer.length}, hole=${hole.length}, triangles=${triangles.length}, triangles with hole=${holeUsed}`);
        }

        for (let z = 15; z <= 25; z++) {
            testZ(z);
        }
    });
});

