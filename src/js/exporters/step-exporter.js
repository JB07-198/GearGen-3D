// STEP (ISO 10303-21, AP214) exporter
// Each closed mesh becomes one MANIFOLD_SOLID_BREP: neighbouring faces reference the same edge
// entity, which is what makes them a solid, and coplanar triangles are merged into one face.
// Surfaces are planar facets, not analytic surfaces.
class STEPExporter {
    exportCurrentGear(params = null) {
        const gear = window.sceneManager ? window.sceneManager.getExportObject() : null;
        if (!gear) {
            alert('No gear to export! Please generate a gear first.');
            return null;
        }

        try {
            const solids = this.collectMeshes(gear).map(mesh => this.buildSolidTopology(mesh));

            // A mesh that is not closed cannot give a valid solid: refuse rather than write a false one.
            const openParts = solids.filter(solid => !solid.isClosed).length;
            if (solids.length === 0 || openParts > 0) {
                alert(window.i18n
                    ? window.i18n.translate('export.stepNotClosed', { count: openParts })
                    : 'STEP export cancelled: the mesh is not closed.');
                return null;
            }

            const stepText = this.buildStepFile(solids);

            let filename = 'gear.step';
            if (params) {
                const type = params.type || 'gear';
                const m = params.module || 0;
                const z = params.teeth || 0;
                const b = params.faceWidth || 0;
                filename = `${type}gear_m${m}_Z${z}_b${b}`;
                if (type === 'helical' && params.helixAngle !== null) filename += `_beta${params.helixAngle}`;
                if (type === 'planetary') filename = `planetary_Zs${params.teeth}_Zp${params.planetTeeth}_N${params.planetCount}_m${m}_b${b}`;
                filename += '.step';
            }

            this.downloadSTEP(stepText, filename);
            return filename;
        } catch (error) {
            console.error('STEP export error:', error);
            alert('Error exporting STEP file. Please check console for details.');
            return null;
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
        return meshes;
    }

    // Number as written in the file. Vertices are welded on this text, so that the topology
    // and the written coordinates can never disagree.
    formatNumber(n) {
        const text = Number(n).toFixed(6);
        return text === '-0.000000' ? '0.000000' : text;
    }

    // Welds the mesh, checks that it is closed, and groups its triangles into planar faces.
    buildSolidTopology(mesh) {
        const fmt = (n) => this.formatNumber(n);
        const geometry = mesh.geometry;
        const position = geometry.attributes.position;
        const index = geometry.index;
        const world = new THREE.Vector3();

        const vertexIds = new Map();
        const points = [];
        const vertexOf = (i) => {
            world.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
            const x = fmt(world.x), y = fmt(world.y), z = fmt(world.z);
            const key = `${x},${y},${z}`;
            let id = vertexIds.get(key);
            if (id === undefined) {
                id = points.length;
                vertexIds.set(key, id);
                points.push([Number(x), Number(y), Number(z)]);
            }
            return id;
        };

        const triangles = [];
        const count = index ? index.count : position.count;
        for (let i = 0; i + 2 < count; i += 3) {
            const a = vertexOf(index ? index.getX(i) : i);
            const b = vertexOf(index ? index.getX(i + 1) : i + 1);
            const c = vertexOf(index ? index.getX(i + 2) : i + 2);
            if (a === b || b === c || a === c) continue;

            const pa = points[a], pb = points[b], pc = points[c];
            const ux = pb[0] - pa[0], uy = pb[1] - pa[1], uz = pb[2] - pa[2];
            const vx = pc[0] - pa[0], vy = pc[1] - pa[1], vz = pc[2] - pa[2];
            const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
            const length = Math.hypot(nx, ny, nz);
            if (length < 1e-10) continue;

            const normal = [nx / length, ny / length, nz / length];
            triangles.push({
                vertices: [a, b, c],
                normal,
                offset: normal[0] * pa[0] + normal[1] * pa[1] + normal[2] * pa[2]
            });
        }

        // A closed mesh has each directed edge exactly once, and its opposite exactly once.
        const size = points.length;
        const edgeKey = (from, to) => from * size + to;
        const owners = new Map();
        let isClosed = triangles.length > 0;
        triangles.forEach((triangle, t) => {
            for (let e = 0; e < 3; e++) {
                const key = edgeKey(triangle.vertices[e], triangle.vertices[(e + 1) % 3]);
                if (owners.has(key)) isClosed = false;
                owners.set(key, t);
            }
        });

        // Coplanar neighbours belong to the same face.
        const parent = triangles.map((_, t) => t);
        const find = (t) => {
            while (parent[t] !== t) {
                parent[t] = parent[parent[t]];
                t = parent[t];
            }
            return t;
        };
        triangles.forEach((triangle, t) => {
            for (let e = 0; e < 3; e++) {
                const neighbour = owners.get(edgeKey(triangle.vertices[(e + 1) % 3], triangle.vertices[e]));
                if (neighbour === undefined) {
                    isClosed = false;
                    continue;
                }
                const other = triangles[neighbour];
                const dot = triangle.normal[0] * other.normal[0] + triangle.normal[1] * other.normal[1] + triangle.normal[2] * other.normal[2];
                if (dot > 1 - 1e-9 && Math.abs(triangle.offset - other.offset) < 2e-5) {
                    parent[find(t)] = find(neighbour);
                }
            }
        });

        const groups = new Map();
        triangles.forEach((_, t) => {
            const root = find(t);
            if (!groups.has(root)) groups.set(root, []);
            groups.get(root).push(t);
        });

        const faces = [];
        if (isClosed) {
            groups.forEach(members => {
                faces.push({
                    normal: triangles[members[0]].normal,
                    loops: this.traceFaceLoops(members, triangles, owners, edgeKey, points)
                });
            });
        }

        return { points, faces, isClosed };
    }

    // Boundary loops of a face, the outer one first.
    traceFaceLoops(members, triangles, owners, edgeKey, points) {
        const inFace = new Set(members);
        const outgoing = new Map();
        members.forEach(t => {
            const v = triangles[t].vertices;
            for (let e = 0; e < 3; e++) {
                const from = v[e], to = v[(e + 1) % 3];
                if (!inFace.has(owners.get(edgeKey(to, from)))) {
                    if (!outgoing.has(from)) outgoing.set(from, []);
                    outgoing.get(from).push(to);
                }
            }
        });

        const loops = [];
        outgoing.forEach((targets, start) => {
            while (targets.length > 0) {
                // Walk the boundary. A vertex met twice closes a sub-loop: holes may touch at a point.
                const path = [start];
                const seen = new Map([[start, 0]]);
                let current = targets.pop();
                while (current !== start) {
                    if (seen.has(current)) {
                        const loop = path.splice(seen.get(current));
                        loop.forEach(vertex => seen.delete(vertex));
                        loops.push(loop);
                    }
                    seen.set(current, path.length);
                    path.push(current);
                    current = outgoing.get(current).pop();
                }
                loops.push(path);
            }
        });

        // Vector area, whose size along the normal gives the largest loop whatever the plane.
        const normal = triangles[members[0]].normal;
        const area = (loop) => {
            let sum = 0;
            loop.forEach((vertex, i) => {
                const p = points[vertex], q = points[loop[(i + 1) % loop.length]];
                sum += normal[0] * (p[1] * q[2] - p[2] * q[1])
                    + normal[1] * (p[2] * q[0] - p[0] * q[2])
                    + normal[2] * (p[0] * q[1] - p[1] * q[0]);
            });
            return Math.abs(sum);
        };
        return loops
            .map(loop => ({ loop, size: area(loop) }))
            .sort((a, b) => b.size - a.size)
            .map(entry => entry.loop);
    }

    buildStepFile(solids) {
        const fmt = (n) => this.formatNumber(n);
        const ents = [];
        const add = (s) => {
            ents.push(`#${ents.length + 1}=${s};`);
            return ents.length;
        };
        const direction = (x, y, z) => add(`DIRECTION('',(${fmt(x)},${fmt(y)},${fmt(z)}))`);

        const solidIds = solids.map((solid, part) => {
            const { points, faces } = solid;
            const size = points.length;

            // Points, vertices and edges exist once; faces share them.
            const pointIds = new Array(size);
            const vertexIds = new Array(size);
            const pointId = (i) => {
                if (pointIds[i] === undefined) {
                    pointIds[i] = add(`CARTESIAN_POINT('',(${fmt(points[i][0])},${fmt(points[i][1])},${fmt(points[i][2])}))`);
                }
                return pointIds[i];
            };
            const vertexId = (i) => {
                if (vertexIds[i] === undefined) vertexIds[i] = add(`VERTEX_POINT('',#${pointId(i)})`);
                return vertexIds[i];
            };

            const edgeIds = new Map();
            const orientedEdge = (a, b) => {
                const low = Math.min(a, b), high = Math.max(a, b);
                const key = low * size + high;
                let edgeId = edgeIds.get(key);
                if (edgeId === undefined) {
                    const p = points[low], q = points[high];
                    const dx = q[0] - p[0], dy = q[1] - p[1], dz = q[2] - p[2];
                    const length = Math.hypot(dx, dy, dz);
                    const vector = add(`VECTOR('',#${direction(dx / length, dy / length, dz / length)},${fmt(length)})`);
                    const line = add(`LINE('',#${pointId(low)},#${vector})`);
                    edgeId = add(`EDGE_CURVE('',#${vertexId(low)},#${vertexId(high)},#${line},.T.)`);
                    edgeIds.set(key, edgeId);
                }
                return add(`ORIENTED_EDGE('',*,*,#${edgeId},${a === low ? '.T.' : '.F.'})`);
            };

            const faceIds = faces.map(face => {
                const bounds = face.loops.map((loop, i) => {
                    const edges = loop.map((vertex, j) => `#${orientedEdge(vertex, loop[(j + 1) % loop.length])}`);
                    const edgeLoop = add(`EDGE_LOOP('',(${edges.join(',')}))`);
                    return add(`${i === 0 ? 'FACE_OUTER_BOUND' : 'FACE_BOUND'}('',#${edgeLoop},.T.)`);
                });

                const n = face.normal;
                const ref = this.perpDir({ x: n[0], y: n[1], z: n[2] });
                const axis = add(`AXIS2_PLACEMENT_3D('',#${pointId(face.loops[0][0])},#${direction(n[0], n[1], n[2])},#${direction(ref.x, ref.y, ref.z)})`);
                const plane = add(`PLANE('',#${axis})`);
                return add(`ADVANCED_FACE('',(${bounds.map(id => `#${id}`).join(',')}),#${plane},.T.)`);
            });

            const shell = add(`CLOSED_SHELL('',(${faceIds.map(id => `#${id}`).join(',')}))`);
            return add(`MANIFOLD_SOLID_BREP('Part ${part + 1}',#${shell})`);
        });

        // Units and representation context
        const lengthUnit = add(`( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) )`);
        const angleUnit = add(`( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) )`);
        const solidAngleUnit = add(`( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() )`);
        const uncertainty = add(`UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-05),#${lengthUnit},'distance_accuracy_value','confusion accuracy')`);
        const context = add(`( GEOMETRIC_REPRESENTATION_CONTEXT(3) GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncertainty})) GLOBAL_UNIT_ASSIGNED_CONTEXT((#${lengthUnit},#${angleUnit},#${solidAngleUnit})) REPRESENTATION_CONTEXT('Context3D','3D') )`);
        const shapeRep = add(`ADVANCED_BREP_SHAPE_REPRESENTATION('',(${solidIds.map(id => `#${id}`).join(',')}),#${context})`);

        // Product definition
        const appContext = add(`APPLICATION_CONTEXT('automotive_design')`);
        add(`APPLICATION_PROTOCOL_DEFINITION('international standard','automotive_design',2000,#${appContext})`);
        const productContext = add(`MECHANICAL_CONTEXT('',#${appContext},'mechanical')`);
        const product = add(`PRODUCT('Gear','Gear','',(#${productContext}))`);
        const formation = add(`PRODUCT_DEFINITION_FORMATION('','',#${product})`);
        const definitionContext = add(`PRODUCT_DEFINITION_CONTEXT('part definition',#${appContext},'design')`);
        const definition = add(`PRODUCT_DEFINITION('design','',#${formation},#${definitionContext})`);
        const definitionShape = add(`PRODUCT_DEFINITION_SHAPE('','',#${definition})`);
        add(`SHAPE_DEFINITION_REPRESENTATION(#${definitionShape},#${shapeRep})`);

        const header = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('GearGen STEP export'),'2;1');
FILE_NAME('gear.step','${new Date().toISOString()}',(''),(''),'GearGen-3D','GearGen-3D','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
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
}
