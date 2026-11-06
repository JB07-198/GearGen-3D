# GearGen-3D — 3D Gear Generator

![GearGen Logo](assets/logo_icon.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Web-based](https://img.shields.io/badge/Platform-Web-brightgreen.svg)]()
[![Three.js](https://img.shields.io/badge/Powered%20by-Three.js-orange.svg)]()
[![i18n](https://img.shields.io/badge/Localization-EN%20%7C%20FR%20%7C%20AR-blueviolet.svg)]()

**Live Demo**: https://jb07-198.github.io/GearGen-3D/

GearGen-3D is an interactive, client-side web application for designing 3D gear models directly in the browser. It computes involute tooth profiles and exports files for 3D printing, laser cutting and CAD.

## Features
- 7 gear types: Spur, Helical, Bevel, Worm, Rack, Internal, Planetary.
- Real-time 3D preview with Three.js.
- STL, STEP and DXF export.
- Multilingual interface (English, French, Arabic) with RTL support.
- Parametric controls with mechanical and manufacturability checks.
- Config import/export (JSON) and shareable URL state, both validated on load.

## Getting Started
1. Clone the repository.
2. Open `index.html` in a modern browser, or serve locally:
   ```bash
   python -m http.server 8000
   ```

An internet connection is needed: Three.js and the fonts load from CDNs.

## Gear Models

Tooth proportions use the ISO 53 basic rack: addendum `1 m`, dedendum `1.25 m`.

| Type | Model | Notes |
|---|---|---|
| Spur | `d = m z`, `da = d + 2m`, `df = d - 2.5m` | Bore and hub available |
| Helical | Spur profile twisted by `F tan(β) / (d / 2)` | The module is the transverse module, so `d = m z` |
| Bevel | Virtual gear `zv = z / cos(δ)` on the back cone (Tredgold), `da = d + 2m cos(δ)` | Teeth converge to the cone apex; `F` is measured along the cone |
| Worm | `d1 = q m`, axial pitch `π m`, lead angle `tan(γ) = z1 / q`, thread depth `2.25 m` | `z1` from 1 to 4 threads, `q` from 5 to 20 |
| Rack | Length `z π m`, pitch line on `y = 0` | |
| Internal | Same profile, as a ring | |
| Planetary | Ring `zr = zs + 2 zp`, planets in mesh | `2 (zs + zp) / N` must be an integer, and neighbouring planets must not overlap |

**Hub**: a cylinder on the top side, of length `F / 2`. Set its diameter to 0 for a plain gear.

### Dimensional accuracy
On the body of the teeth, the exported geometry sits on the nominal dimensions. Chamfers only remove material, at the ends of the teeth, of the bore and of the hub. Measured on the exported STL for m = 2, z = 20, F = 10, bore 5: tip diameter 44.000, face width 10.000, bore 5.000, tooth thickness 3.141 (nominal 3.142; the flank is a polyline).

### Known simplifications
- No root fillet, no profile shift and **no backlash**: printed parts may need added clearance.
- Below the base circle, the flank is radial rather than a trochoid.
- The worm has no matching worm wheel.
- These models are not certified to any standard.

## Exports

| Format | Content | Types |
|---|---|---|
| STL (binary) | Closed mesh, gear axis on Z, what is up on screen is `+Z` | All |
| STEP (AP214) | One `MANIFOLD_SOLID_BREP` per part (5 for a 3-planet system), same frame as the STL | All |
| DXF (R12) | 2D profile and bore | Spur only |

STEP files were checked with OpenCASCADE: closed, valid solids with no free edge, whose volume matches the mesh. They have not been tested in commercial CAD software. Their faces are planar facets, not analytic surfaces: a solid can be measured and cut, but a bore is not recognised as a cylinder, and helical gears and worms can reach tens of thousands of faces. Export is refused if a mesh is not closed.

## Usage
- Select a gear type from the left panel.
- Adjust parameters in the right panel. Typing is free: a value applies once valid, and the field settles on leaving it or pressing Enter.
- Preview in the 3D canvas; use view controls and shortcuts.
- Export via the File menu.

## Project Structure
```
GearGen-3D/
├── index.html
├── assets/
├── examples/
└── src/
    ├── css/
    └── js/
        ├── main.js
        ├── gear-types/
        ├── renderer/
        ├── exporters/
        ├── managers/
        ├── validators/
        ├── components/
        ├── ui/
        └── utils/
```

## Technologies
- Vanilla JavaScript (ES6)
- Three.js r128
- CSS3 with design tokens
- No bundler, no backend

## License
[MIT](LICENSE)

![Powered by](assets/images/powered-by.png)
