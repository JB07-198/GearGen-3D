// ==========================================================================
// GearGen-3D DXF (2D) Exporter
// ASCII DXF R12 with a closed involute gear profile and central bore.
// Uses the shared GearMath utilities; no external dependency.
// ==========================================================================

class DXFExporter {
    constructor() {
        console.log('DXF exporter initialized');
    }

    exportCurrentGear(params = {}) {
        if (params.type && params.type !== 'spur') {
            alert('DXF export is only available for spur gears.');
            return null;
        }

        try {
            const geometry = this.buildSpurGeometry(params);
            const dxf = this.buildDXF(geometry);
            const filename = this.buildFilename(params);

            this.downloadDXF(dxf, filename);
            console.log(`DXF export successful: ${filename}`);
            return filename;
        } catch (error) {
            console.error('DXF export error:', error);
            alert(`Error exporting DXF file: ${error.message}`);
            return null;
        }
    }

    // Build the closed 2D outline (all teeth) and the central bore radius.
    buildSpurGeometry(params) {
        const module = Math.max(0.1, Number(params.module) || 2);
        const teeth = Math.max(3, Math.round(Number(params.teeth) || 20));
        const pressureAngle = Number(params.pressureAngle) || 20;
        const boreDiameter = Math.max(0, Number(params.boreDiameter) || 0);

        const gearData = GearMath.calculateToothProfile(module, teeth, pressureAngle);
        const toothProfile = GearMath.generateCompleteToothProfile(gearData, 'high');

        if (!toothProfile || toothProfile.length === 0) {
            throw new Error('Unable to generate the involute tooth profile.');
        }

        // Replicate one tooth around the gear axis, dropping duplicate joints.
        const pitchAngle = (2 * Math.PI) / teeth;
        const outline = [];

        for (let tooth = 0; tooth < teeth; tooth++) {
            const rotation = tooth * pitchAngle;
            const cosR = Math.cos(rotation);
            const sinR = Math.sin(rotation);

            for (const point of toothProfile) {
                const x = point.x * cosR - point.y * sinR;
                const y = point.x * sinR + point.y * cosR;
                const previous = outline[outline.length - 1];

                if (!previous || Math.hypot(x - previous.x, y - previous.y) > 1e-6) {
                    outline.push({ x, y });
                }
            }
        }

        // The last point of the final tooth coincides with the first point.
        if (outline.length > 1) {
            const first = outline[0];
            const last = outline[outline.length - 1];
            if (Math.hypot(first.x - last.x, first.y - last.y) < 1e-6) {
                outline.pop();
            }
        }

        if (outline.length < 3) {
            throw new Error('The generated gear outline is invalid.');
        }

        const boreRadius = boreDiameter / 2;
        if (boreRadius > 0 && boreRadius >= gearData.rootRadius) {
            throw new Error('Bore diameter must be smaller than the gear root diameter.');
        }

        return {
            outline,
            boreRadius,
            outerRadius: gearData.outerRadius,
            rootRadius: gearData.rootRadius,
            module,
            teeth,
            pressureAngle,
            boreDiameter
        };
    }

    // Minimal, broadly compatible DXF R12 document (millimetres).
    buildDXF(geometry) {
        const lines = [];
        const add = (code, value) => {
            lines.push(String(code));
            lines.push(String(value));
        };
        const fmt = (value) => Number(value).toFixed(6);

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const point of geometry.outline) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }

        // HEADER
        add(0, 'SECTION');
        add(2, 'HEADER');
        add(9, '$ACADVER');
        add(1, 'AC1009');
        add(9, '$INSUNITS');
        add(70, 4); // millimetres
        add(9, '$MEASUREMENT');
        add(70, 1); // metric
        add(9, '$LUNITS');
        add(70, 2); // decimal
        add(9, '$LUPREC');
        add(70, 6);
        add(9, '$EXTMIN');
        add(10, fmt(minX));
        add(20, fmt(minY));
        add(30, '0.0');
        add(9, '$EXTMAX');
        add(10, fmt(maxX));
        add(20, fmt(maxY));
        add(30, '0.0');
        add(0, 'ENDSEC');

        // TABLES: one layer per operation type.
        add(0, 'SECTION');
        add(2, 'TABLES');
        add(0, 'TABLE');
        add(2, 'LAYER');
        add(70, 2);
        this.addLayer(add, 'GEAR_PROFILE', 5);
        this.addLayer(add, 'BORE', 1);
        add(0, 'ENDTAB');
        add(0, 'ENDSEC');

        // BLOCKS (required section, intentionally empty)
        add(0, 'SECTION');
        add(2, 'BLOCKS');
        add(0, 'ENDSEC');

        // ENTITIES
        add(0, 'SECTION');
        add(2, 'ENTITIES');

        // Outer contour as a closed POLYLINE (R12-compatible).
        add(0, 'POLYLINE');
        add(8, 'GEAR_PROFILE');
        add(66, 1); // vertices follow
        add(70, 1); // closed
        add(10, '0.0');
        add(20, '0.0');
        add(30, '0.0');

        for (const point of geometry.outline) {
            add(0, 'VERTEX');
            add(8, 'GEAR_PROFILE');
            add(10, fmt(point.x));
            add(20, fmt(point.y));
            add(30, '0.0');
        }

        add(0, 'SEQEND');
        add(8, 'GEAR_PROFILE');

        // Central bore.
        if (geometry.boreRadius > 0) {
            add(0, 'CIRCLE');
            add(8, 'BORE');
            add(10, '0.0');
            add(20, '0.0');
            add(30, '0.0');
            add(40, fmt(geometry.boreRadius));
        }

        add(0, 'ENDSEC');
        add(0, 'EOF');

        return lines.join('\r\n') + '\r\n';
    }

    addLayer(add, name, color) {
        add(0, 'LAYER');
        add(2, name);
        add(70, 0);
        add(62, color);
        add(6, 'CONTINUOUS');
    }

    buildFilename(params) {
        const module = Number(params.module) || 0;
        const teeth = Number(params.teeth) || 0;
        const bore = Number(params.boreDiameter) || 0;
        return `spurgear_m${module}_Z${teeth}_bore${bore}.dxf`;
    }

    downloadDXF(dxfText, filename) {
        const blob = new Blob([dxfText], { type: 'application/dxf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(link.href), 0);
    }
}
