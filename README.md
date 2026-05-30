# ⚙️ GearGen — 3D Gear Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Web-based](https://img.shields.io/badge/Platform-Web-brightgreen.svg)]()
[![Three.js](https://img.shields.io/badge/Powered%20by-Three.js-orange.svg)]()
[![i18n](https://img.shields.io/badge/Localization-EN%20%7C%20FR%20%7C%20AR-blueviolet.svg)]()

🚀 **Live Demo**: [https://jb07-198.github.io/GearGen-3D/](https://jb07-198.github.io/GearGen-3D/)

A state-of-the-art, interactive, web-based tool for designing and generating highly accurate 3D gear models directly in your browser. With **zero installation** or server-side dependencies, GearGen calculates mathematically precise involute tooth profiles (ISO 53:1998 standards) and generates 3D geometries in real-time, ready to download for 3D printing (STL) or mechanical assemblies.

---

## 🇫🇷 Résumé en Français

**GearGen** est un outil web interactif de pointe pour concevoir et générer des modèles d'engrenages en 3D précis directement dans le navigateur. Il calcule les profils de denture développante conformes aux normes industrielles (ISO 53:1998) et génère des géométries 3D en temps réel, prêtes pour l'impression 3D ou l'intégration CAO (export STL).

🚀 **Démo en Ligne** : [https://jb07-198.github.io/GearGen-3D/](https://jb07-198.github.io/GearGen-3D/)

*   **7+ Types d'Engrenages** : Droits, Hélicoïdaux, Coniques, Vis sans fin, Crémaillères, Engrenages Intérieurs et Systèmes Planétaires.
*   **Calculs Physiques Réels** : Diamètres primitifs, pas circulaires, nombre de sommets/faces actualisés à chaque modification.
*   **Interface Multilingue (i18n)** : Support complet de l'anglais, du français et de l'arabe (avec orientation de page RTL automatique).
*   **Zéro Installation** : Fonctionne entièrement côté client via Three.js (ouvrez simplement `index.html` ou accédez directement à la démo en ligne).

---

## 🌟 Key Features

### 1. ⚙️ Seven Support Gear Types (All Fully Functional)
Unlike older versions, GearGen now supports the complete library of mechanical gears:
*   **Spur Gears (Droit)**: Classic straight teeth parallel to the rotational axis.
*   **Helical Gears (Hélicoïdal)**: Smooth-running angled teeth for high-speed, quiet operations.
*   **Bevel Gears (Conique)**: Conical tooth layouts for transmitting power at $90^\circ$ intersections.
*   **Worm Gears (Vis sans Fin)**: High-reduction screw gears for tremendous torque transmission.
*   **Rack Gears (Crémaillère)**: Linear tooth rails to convert rotary motion into linear motion.
*   **Internal Gears (Intérieur)**: Inward-facing teeth on a ring gear layout.
*   **Planetary Gear Systems (Planétaire)**: Full assembly combining a Sun gear, Planets, and an outer Ring gear.

### 2. 🧮 Mathematical Involute Profiles
*   Gear profiles are plotted using standard involute geometry calculations:
    $$\text{inv}(\alpha) = \tan(\alpha) - \alpha$$
*   Supports customizable standard pressure angles ($20^\circ$, $14.5^\circ$, and high-load $25^\circ$).
*   Automatic tooth thickness, addendum, dedendum, and root clearance adjustments.

### 3. 🖥️ Interactive 3D Canvas
*   Real-time lighting, shadows, and smooth materials powered by **Three.js**.
*   **Viewport controls**: Orbit/Pan/Zoom with responsive desktop/tablet layouts.
*   **Helper grids**: Toggleable coordinate axis visualization, ground helper grids, and wireframe views.
*   **Live statistics**: Real-time vertex count, face count, and calculated pitch diameter.

### 4. 🌍 Localization (i18n) & Accessibility
*   Full support for **English**, **Français**, and **العربية** (Arabic).
*   Automatic text translation and RTL (Right-to-Left) layout switching when selecting Arabic.
*   Persistent language preference stored directly in your browser's local storage.

### 5. 💾 High-Performance Exporting
*   Instant export to **STL Binary** format.
*   Intelligent file naming convention containing the gear specifications (e.g. `spurgear_m2_Z20_b10.stl`).
*   Built-in CSS-animated success toasts with visual confirmations.

---

## 🚀 Getting Started

GearGen is built with modern, ultra-fast vanilla JavaScript and Three.js. It runs entirely on the client-side.

### 🌐 Try it Live!
No installation needed! You can access the fully functional app hosted directly on GitHub Pages:
👉 **[https://jb07-198.github.io/GearGen-3D/](https://jb07-198.github.io/GearGen-3D/)**

### 💻 Running Locally
If you prefer to download and run the project locally on your machine:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/GearGen-3D.git
    cd GearGen-3D
    ```
2.  **Launch the App**:
    *   Simply double-click `index.html` to open it in any modern browser.
    *   *Alternatively*, serve it locally with python, node, or VS Code Live Server:
        ```bash
        # Python 3
        python -m http.server 8000
        # Then visit http://localhost:8000 in your browser.
        ```

---

## 🛠️ Architecture & Codebase Structure

The project has been organized with clean, modular object-oriented files in `/src`:

```text
GearGen-3D/
├── index.html                  # Main application HTML structure
├── README.md                   # Project documentation
├── CNAME                       # For GitHub Pages custom domain
├── assets/                     # Graphic resources
│   ├── icons/                  # SVG and PNG icons for UI cards
│   └── images/                 # Theme logos and branding images
└── src/
    ├── css/                    # Modular Style Sheets
    │   ├── main.css            # Global structures, panels, and animations
    │   ├── theme.css           # Design tokens, variables & Dark Theme values
    │   ├── responsive.css      # Handlers for Mobile Drawers & Bottom Tabs
    │   ├── parameter-controls.css # Styling for sliders, chipsets & inputs
    │   ├── modals.css          # Help and modal layouts
    │   └── language-switcher.css # Dropdown components for locale settings
    └── js/                     # Modular JavaScript
        ├── main.js             # Main App controller, coordinates generation
        ├── gear-types/         # Algorithms for specific tooth layouts
        │   ├── spur-gear.js
        │   ├── helical-gear.js
        │   ├── bevel-gear.js
        │   ├── worm-gear.js
        │   ├── rack-gear.js
        │   ├── internal-gear.js
        │   └── planetary-gear.js
        ├── renderer/           # Three.js viewport management
        │   ├── threejs-setup.js # Instantiates canvas, lighting, shadow mapping
        │   ├── scene-manager.js # Registers active meshes & resets views
        │   └── gear-renderer.js # Extrudes shapes, applies helix twists/tapering
        ├── exporters/          # Output file engines
        │   ├── stl-exporter.js  # Compiles binary STL models
        │   └── step-exporter.js # Skeleton for STEP exporting logic
        └── utils/              # Calculation helpers & tools
            ├── math-utils.js   # Complete involute mathematics & calculators
            ├── i18n.js         # Multilingual translation dictionaries (EN/FR/AR)
            └── validation.js   # Input checking and parameters safety limits
```

---

## 🧮 Mathematical Mechanics

Gears in GearGen are built by mathematical formulas evaluated in `src/js/utils/math-utils.js`.

### 1. Involute Generation
At the core is the calculation of involute tooth profiles. For each point along the curve at radius $r$:
1.  Compute pressure angle at radius $r$:
    $$\theta_r = \arccos\left(\frac{r_b}{r}\right)$$
2.  Compute involute function:
    $$\text{inv}(\theta_r) = \tan(\theta_r) - \theta_r$$
3.  Compute angular thickness at radius $r$:
    $$\psi_r = \frac{\pi}{2 \cdot Z} + \text{inv}(\alpha) - \text{inv}(\theta_r)$$
    *(where $Z$ is teeth count, and $\alpha$ is standard pressure angle at pitch radius).*

### 2. Geometry Operations
*   **Helical Gears**: Extrusion is split into steps, rotating vertices around the axis as $Z$ advances:
    $$\theta_{\text{twist}} = \frac{Z_z \cdot \tan(\beta)}{r_{\text{pitch}}}$$
*   **Bevel Gears**: Vertices are tapered linearly based on the pitch cone angle:
    $$s(z) = 1.0 - \left(1.0 - \frac{r_{\text{small}}}{R_{\text{large}}}\right) \cdot \frac{z}{\text{width}}$$
*   **Planetary Assembly**: Computes exact pitch diameter configurations to align gear centers:
    $$d_{\text{center}} = \frac{m \cdot (Z_{\text{sun}} + Z_{\text{planet}})}{2}$$
    and automatically calculates the Ring gear teeth count to ensure high precision meshing:
    $$Z_{\text{ring}} = Z_{\text{sun}} + 2 \cdot Z_{\text{planet}}$$

---

## 🎨 Interactive Controls & UI Customization

*   **Mesh Quality Adjustments**:
    *   `Low`: 3 subdivisions per tooth (fast, optimal for low-end tablets).
    *   `Medium`: 8-12 subdivisions (recommended, crisp looks and fast calculation).
    *   `High`: 16-24 subdivisions (ultra-detailed, best for final rendering and smooth prints).
*   **Sleek Glassmorphic Palette**:
    Built using modern CSS custom properties (`var()`). Fully responsive with dedicated mobile gestures, drawer drawers, and tab navigation.
*   **Live Color Pickers**: Custom CSS transitions live-update the mesh color instantly.

---

## 🤝 Contribution Guidelines

We highly encourage mechanical designers, software engineers, and translation contributors to join us!

1.  **Adding New Gear Math**: Update `src/js/utils/math-utils.js` and add a corresponding handler class inside `src/js/gear-types/`.
2.  **Adding UI Translation Elements**: Add key-value translation tokens inside the `translations` object inside `src/js/utils/i18n.js` under the corresponding language key (`en`, `fr`, or `ar`).
3.  **Extending 3D Rendering**: Add new vertex shaders or post-processing layers in `src/js/renderer/threejs-setup.js`.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for personal, educational, or commercial purposes.