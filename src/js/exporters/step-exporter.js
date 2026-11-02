// STEP (ISO 10303-21) exporter
// Produces a faceted B-Rep STEP file (AP214) from the current Three.js mesh.
class STEPExporter {
    constructor() {
        console.log('STEP exporter initialized');
    }

    exportCurrentGear(params = null) {
        console.log('Exporting current gear as STEP...');

        const gear = window.sceneManager ? window.sceneManager.getCurrentGear() : null;
        if (!gear) {
            alert('No gear to export! Please generate a gear first.');
            return;
        }

        try {
            const meshes = this.collectMeshes(gear);
            const stepText = this.buildStepFile(meshes, params);

            let filename = 'gear.step';
            if (params) {
                const type = params.type || 'gear';
                const m = params.module || 0;
                const z = params.teeth || 0;
                const b = params.faceWidth || 0;
                filename = `${type}gear_m${m}_Z${z}_b${b}.step`;
                if (type === 'helical' && params.helixAngle !== null) filename += `_beta${params.helixAngle}`;
                if (type === 'planetary') filename = `planetary_Zs${params.teeth}_Zp${params.planetTeeth}_N${params.planetCount}_m${m}_b${b}.step`;
            }

            this.downloadSTEP(stepText, filename);
            this.showExportSuccess(filename);
            console.log('STEP export successful');
        } catch (error) {
            console.error('STEP export error:', error);
            alert('Error exporting STEP file. Please check console for details.');
        }
    }

    collectMeshes(root) {
        const meshes = [];
        root.updateMatrixWorld(true);
        root.traverse((obj) => {
            if (obj.isMesh && obj.geometry) {
                meshes.push(obj);
            }
        });
        if (meshes.length === 0 && root.isMesh) meshes.push(root);
        return meshes;
    }

    buildStepFile(meshes, params) {
        const ents = [];
        const add = (s) => { const id = ents.length + 1; ents.push(`#${id}=${s};`); return id; };

        // Collect triangles with world transform applied
        const triangles = [];
        meshes.forEach((mesh) => {
            const geo = mesh.geometry;
            const pos = geo.attributes.position;
            const idx = geo.index;
            const mat = mesh.matrixWorld;
            const v = (i) => {
                const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                const vec = new THREE.Vector3(x, y, z).applyMatrix4(mat);
                return { x: vec.x, y: vec.y, z: vec.z };
            };
            const count = idx ? idx.count : pos.count;
            const step = idx ? 3 : 3;
            for (let i = 0; i < count; i += 3) {
                let a, b, c;
                if (idx) {
                    a = idx.getX(i); b = idx.getX(i + 1); c = idx.getX(i + 2);
                } else {
                    a = i; b = i + 1; c = i + 2;
                }
                const p0 = v(a), p1 = v(b), p2 = v(c);
                // skip degenerate
                const e1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
                const e2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };
                const cross = { x: e1.y * e2.z - e1.z * e2.y, y: e1.z * e2.x - e1.x * e2.z, z: e1.x * e2.y - e1.y * e2.x };
                const len = Math.hypot(cross.x, cross.y, cross.z);
                if (len < 1e-12) continue;
                triangles.push({ p0, p1, p2, n: { x: cross.x / len, y: cross.y / len, z: cross.z / len } });
            }
        });

        const fmt = (n) => Number(n).toFixed(6);

        // Unique points
        const pointMap = new Map();
        const getPointId = (p) => {
            const key = `${fmt(p.x)},${fmt(p.y)},${fmt(p.z)}`;
            if (pointMap.has(key)) return pointMap.get(key);
            const id = add(`CARTESIAN_POINT('',(${fmt(p.x)},${fmt(p.y)},${fmt(p.z)}))`);
            pointMap.set(key, id);
            return id;
        };

        // Unique vertices
        const vertexMap = new Map();
        const getVertexId = (p) => {
            const key = `${fmt(p.x)},${fmt(p.y)},${fmt(p.z)}`;
            if (vertexMap.has(key)) return vertexMap.get(key);
            const pid = getPointId(p);
            const id = add(`VERTEX_POINT('',#${pid})`);
            vertexMap.set(key, id);
            return id;
        };

        // Edge helper: create or reuse not required; create per triangle side
        const edgeIds = [];
        const faceIds = [];

        // Direction helper
        const getDirId = (dx, dy, dz) => {
            const len = Math.hypot(dx, dy, dz) || 1;
            return add(`DIRECTION('',(${fmt(dx / len)},${fmt(dy / len)},${fmt(dz / len)}))`);
        };

        triangles.forEach((tri) => {
            const va = getVertexId(tri.p0);
            const vb = getVertexId(tri.p1);
            const vc = getVertexId(tri.p2);
            const pa = getPointId(tri.p0);
            const pb = getPointId(tri.p1);
            const pc = getPointId(tri.p2);

            // edges
            const makeEdge = (v1, v2, pA, pB) => {
                const dx = (triangles.length ? 0 : 0);
                const dir = getDirId(pB.x - pA.x, pB.y - pA.y, pB.z - pA.z);
                const lineId = add(`LINE('',#${pA},#${dir})`);
                return add(`EDGE_CURVE('',#${v1},#${v2},#${lineId},.T.)`);
            };

            // Need point objects for direction; use tri points
            const e01 = makeEdge(va, vb, tri.p0, tri.p1);
            const e12 = makeEdge(vb, vc, tri.p1, tri.p2);
            const e20 = makeEdge(vc, va, tri.p2, tri.p0);

            // oriented edges
            const oe01 = add(`ORIENTED_EDGE('',*,*,#${e01},.T.)`);
            const oe12 = add(`ORIENTED_EDGE('',*,*,#${e12},.T.)`);
            const oe20 = add(`ORIENTED_EDGE('',*,*,#${e20},.T.)`);

            const loopId = add(`EDGE_LOOP('',(#${oe01},#${oe12},#${oe20}))`);
            const boundId = add(`FACE_BOUND('',#${loopId},.T.)`);

            // plane
            const ref = this.perpDir(tri.n);
            const axisId = add(`AXIS2_PLACEMENT_3D('',#${pa},#${add(`DIRECTION('',(${fmt(tri.n.x)},${fmt(tri.n.y)},${fmt(tri.n.z)}))`)},#${add(`DIRECTION('',(${fmt(ref.x)},${fmt(ref.y)},${fmt(ref.z)}))`)})`);
            const planeId = add(`PLANE('',#${axisId})`);

            const faceId = add(`ADVANCED_FACE('',(#${boundId}),#${planeId},.T.)`);
            faceIds.push(faceId);
        });

        const shellId = add(`CLOSED_SHELL('',(${faceIds.map((id) => `#${id}`).join(',')}))`);
        const brepId = add(`FACETED_BREP('',#${shellId})`);

        // Product / representation context
        const unitsId = add(`( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) )`);
        // uncertainty
        const uncId = add(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(0.001),#${add(`GLOBAL_UNIT_ASSIGNED_CONTEXT((#${unitsId})) GLOBAL_CONTEXT('',ANY) REPRESENTATION_CONTEXT('3D','3D')`)},'distance accuracy')`);
        // representation context
        const repCtxId = add(`( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncId})) GLOBAL_UNIT_ASSIGNED_CONTEXT((#${unitsId})) REPRESENTATION_CONTEXT('','3D') )`);

        const shapeRepId = add(`ADVANCED_BREP_SHAPE_REPRESENTATION('',(#${brepId}),#${repCtxId})`);

        const prodId = add(`PRODUCT('Gear','Gear','',(#${add(`PRODUCT_CONTEXT('',#${add(`APPLICATION_CONTEXT('managed model based 3d engineering')`)}, 'mechanical')`)})`);
        const pdfId = add(`PRODUCT_DEFINITION_FORMATION('','',#${prodId})`);
        const pdId = add(`PRODUCT_DEFINITION('design','',#${pdfId},#${add(`PRODUCT_DEFINITION_CONTEXT('part definition',#${add(`APPLICATION_CONTEXT('managed model based 3d engineering')`)},'design')`)})`);
        const pdsId = add(`PRODUCT_DEFINITION_SHAPE('','',#${pdId})`);
        add(`SHAPE_DEFINITION_REPRESENTATION(#${pdsId},#${shapeRepId})`);

        const header = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('GearGen STEP export'),'2;1');
FILE_NAME('gear.step','${new Date().toISOString()}',(''),(''),'GearGen-3D','GearGen-3D','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 3 1 1 }'));
ENDSEC;
DATA;
`;
        const footer = `ENDSEC;
END-ISO-10303-21;
`;
        return header + ents.join('\n') + '\n' + footer;
    }

    perpDir(n) {
        // return a vector perpendicular to n
        let ref = { x: 0, y: 0, z: 1 };
        if (Math.abs(n.z) > 0.9) ref = { x: 0, y: 1, z: 0 };
        // cross n x ref
        const c = {
            x: n.y * ref.z - n.z * ref.y,
            y: n.z * ref.x - n.x * ref.z,
            z: n.x * ref.y - n.y * ref.x
        };
        const len = Math.hypot(c.x, c.y, c.z) || 1;
        return { x: c.x / len, y: c.y / len, z: c.z / len };
    }

    downloadSTEP(stepText, filename) {
        const blob = new Blob([stepText], { type: 'application/step' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showExportSuccess(filename) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle" style="font-size: 1.2em;"></i><div><strong>Export Successful!</strong><br>${filename} downloaded</div>`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.stepExporter = new STEPExporter();
});
