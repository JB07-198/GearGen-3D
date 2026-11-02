setTimeout(() => {
    function testGear(gearType, teeth, faceWidth) {
        window.gearGenApp.setGearType(gearType);
        document.getElementById('teeth_count').value = teeth;
        window.parameterUI.inputs.teeth_count.value = teeth;
        if (faceWidth) {
            document.getElementById('face_width').value = faceWidth;
            window.parameterUI.inputs.face_width.value = faceWidth;
        }
        window.gearGenApp.generateGear();

        const gear = window.sceneManager.getCurrentGear();
        if (!gear || !gear.geometry) return { gearType, teeth, error: 'no geometry' };

        const pos = gear.geometry.attributes.position;
        // Bounding box
        gear.geometry.computeBoundingBox();
        const bb = gear.geometry.boundingBox;

        // Check triangles covering the axis
        // In the scene, gear is rotated: geometry.rotateX(PI/2)
        // So the gear axis is along Y!
        let trianglesCoveringCenter = 0;
        let minRadiusXZ = 999999;
        for (let i = 0; i < pos.count; i += 3) {
            const ax = pos.getX(i), az = pos.getZ(i);
            const bx = pos.getX(i+1), bz = pos.getZ(i+1);
            const cx = pos.getX(i+2), cz = pos.getZ(i+2);

            const r1 = Math.hypot(ax, az);
            const r2 = Math.hypot(bx, bz);
            const r3 = Math.hypot(cx, cz);
            if (r1 < minRadiusXZ) minRadiusXZ = r1;
            if (r2 < minRadiusXZ) minRadiusXZ = r2;
            if (r3 < minRadiusXZ) minRadiusXZ = r3;

            // Check if triangle covers (0,0) in X-Z
            const d1 = (0 - bx) * (az - bz) - (ax - bx) * (0 - bz);
            const d2 = (0 - cx) * (bz - cz) - (bx - cx) * (0 - cz);
            const d3 = (0 - ax) * (cz - az) - (cx - ax) * (0 - az);
            if (!((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))) {
                trianglesCoveringCenter++;
            }
        }

        return {
            gearType,
            teeth,
            faceWidth: faceWidth || document.getElementById('face_width').value,
            boreDiameter: document.getElementById('bore_diameter').value,
            vertexCount: pos.count,
            minRadiusXZ: minRadiusXZ.toFixed(3),
            trianglesCoveringCenter,
            holePresent: trianglesCoveringCenter === 0 && minRadiusXZ > 1.0
        };
    }

    const report = [
        testGear('spur', 20, 10),
        testGear('spur', 21, 10),
        testGear('bevel', 20, 10),
        testGear('bevel', 21, 10),
        testGear('bevel', 20, 39),
        testGear('bevel', 21, 39)
    ];

    fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report, null, 2)
    });
}, 1000);
