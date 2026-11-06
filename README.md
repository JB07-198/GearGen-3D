# GearGen-3D — 3D Gear Generator

![GearGen Logo](assets/logo_icon.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Web-based](https://img.shields.io/badge/Platform-Web-brightgreen.svg)]()
[![Three.js](https://img.shields.io/badge/Powered%20by-Three.js-orange.svg)]()
[![i18n](https://img.shields.io/badge/Localization-EN%20%7C%20FR%20%7C%20AR-blueviolet.svg)]()

**Live Demo**: https://jb07-198.github.io/GearGen-3D/

GearGen-3D is an interactive, client-side web application for designing and generating precise 3D gear models directly in the browser. It computes involute tooth profiles and exports ready-to-use files for 3D printing and CAD.

## Features
- 7 gear types: Spur, Helical, Bevel, Worm, Rack, Internal, Planetary.
- Real-time 3D preview with Three.js.
- STL and STEP export.
- Multilingual UI (English, French, Arabic) with RTL support.
- Parametric controls with validation and DFM checks.
- Config import/export (JSON) and shareable URL state.

## Getting Started
1. Clone the repository.
2. Open `index.html` in a modern browser, or serve locally:
   ```bash
   python -m http.server 8000
   ```

## Project Structure
```
GearGen-3D/
├── index.html
├── assets/
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

## Usage
- Select a gear type from the left panel.
- Adjust parameters in the right panel.
- Preview in the 3D canvas; use view controls and shortcuts.
- Export via the File menu (STL/STEP).

## Technologies
- Vanilla JavaScript (ES6)
- Three.js r128
- CSS3 with design tokens
- No bundler, no backend

## License
MIT

![Powered by](assets/images/powered-by.png)