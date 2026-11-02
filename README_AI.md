# GearGen-3D — Contexte projet pour IA

> Document de synthèse technique destiné à être fourni à une IA pour comprendre et modifier le projet **GearGen-3D**.  
> Dernière analyse : dépôt local `C:\Users\Toshiba\Documents\GearGen-3D` (branche `main`, commit `4dce7cd`).

---

## 1. Vue d'ensemble

**GearGen-3D** est une application web **100 % client-side** (pas de backend, pas de build) de conception/génération de modèles 3D d'engrenages. Elle calcule des profils de denture développante (involute) et extrude des géométries 3D en temps réel dans le navigateur, avec export STL binaire pour impression 3D/CAO.

- **Type** : SPA statique (HTML/CSS/JS vanilla).
- **Déploiement** : GitHub Pages (`https://jb07-198.github.io/GearGen-3D/`), domaine custom via `CNAME`.
- **Licence** : MIT.
- **Langues UI** : anglais, français, arabe (RTL pour l'arabe, persistance `localStorage`).

---

## 2. Technologies et dépendances

### 2.1 Stack

| Élément | Détail |
|---|---|
| Langage | JavaScript ES6 (classes globales, pas de modules ES / pas de bundler) |
| 3D | Three.js **r128** (global `THREE`), WebGL, `MeshPhongMaterial`, `ExtrudeGeometry` |
| Export CAD | `THREE.STLExporter` (addon Three.js 0.128.0), STL binaire |
| UI | HTML5 + CSS3 (variables CSS, glassmorphism), Font Awesome 6.4.0 |
| Typo | Google Fonts : Inter (300–700), Outfit (400–800) |
| Persistance | `localStorage` (langue uniquement) |
| Build/Tests | **Aucun** (`package.json` vide, pas de scripts, pas de tests) |

### 2.2 Dépendances externes (CDN, chargées dans `index.html`)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/STLExporter.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

⚠️ **Important** : `THREE.OrbitControls` **n'est pas chargé**. `ThreeJSSetup.setupControls()` teste `typeof THREE.OrbitControls` et, absent, désactive le contrôle caméra (orbite/pan/zoom). Seul le reset de caméra fonctionne. C'est une lacune à corriger si on veut l'orbite.

### 2.3 Aucune dépendance npm

`package.json` est vide (0 octet). Tout est chargé par balises `<script>` dans `index.html`, dans un ordre précis (voir §4).

---

## 3. Architecture et structure des fichiers

### 3.1 Arborescence

```
GearGen-3D/
├── index.html                    # Point d'entrée, structure DOM, chargement des scripts
├── README.md                     # Doc utilisateur (FR/EN)
├── CNAME                         # Domaine GitHub Pages
├── package.json                  # Vide
├── README_AI.md                  # Ce document
├── assets/
│   ├── fonts/                    # Logo_font.otf, slogan_font.ttf
│   ├── icons/                    # PNG icônes UI (gear types, params, 3D preview)
│   └── images/                   # Logos, branding
├── docs/                         # Vides (api.md, gear-types.md, user-guide.md)
├── examples/
│   ├── spur-example.json         # Exemple de paramètres (spur)
│   └── helical-example.json      # Vide
└── src/
    ├── css/
    │   ├── main.css              # Layout, panels, animations
    │   ├── theme.css             # Design tokens, variables, dark theme
    │   ├── responsive.css        # Mobile drawers, bottom tabs
    │   ├── parameter-controls.css # Sliders, chips, inputs
    │   ├── modals.css            # Modales help/docs
    │   └── language-switcher.css # Dropdown langue
    └── js/
        ├── main.js               # Contrôleur principal GearGenApp
        ├── gear-types/
        │   ├── spur-gear.js      # classe SpurGear + (pas de calculateSpurGear global ici)
        │   ├── helical-gear.js    # classe HelicalGear + calculateHelicalGear()
        │   ├── bevel-gear.js      # classe BevelGear (délègue à calculateBevelGear)
        │   ├── worm-gear.js      # classe WormGear (délègue à calculateWormGear)
        │   ├── rack-gear.js      # classe RackGear (délègue à calculateRackGear)
        │   ├── internal-gear.js   # classe InternalGear (délègue à calculateInternalGear)
        │   └── planetary-gear.js  # classe PlanetaryGear (délègue à calculatePlanetaryGear)
        ├── renderer/
        │   ├── threejs-setup.js   # ThreeJSSetup (scène, caméra, renderer, lumières)
        │   ├── scene-manager.js   # SceneManager (mesh courant, helpers, stats)
        │   └── gear-renderer.js   # GearRenderer (extrusion, twist, taper, matériaux)
        ├── exporters/
        │   ├── stl-exporter.js    # STLExporter (binaire, téléchargement)
        │   └── step-exporter.js   # Vide (non implémenté)
        └── utils/
            ├── math-utils.js      # GearMath + calculate*Gear (sauf helical)
            ├── i18n.js            # I18n (en/fr/ar, RTL, localStorage)
            ├── validation.js      # Vide
            ├── file-utils.js      # Vide
            └── ui/ (dans src/js/ui/)
                ├── parameter-ui.js   # ParameterUI (sliders, presets, visibilité)
                ├── mobile-ui.js      # MobileUI (drawers, bottom nav)
                ├── export-ui.js      # ExportUI (options, taille fichier, progress)
                ├── preview-panel.js  # Vide
                └── navigation.js     # Navigation (boutons, modales, langue)
```

### 3.2 Organisation logique

- **Couche math** : `utils/math-utils.js` (`GearMath` + fonctions `calculate*Gear`). C'est le cœur du calcul de profil.
- **Couche géométrie 3D** : `renderer/gear-renderer.js` transforme les données math en meshes Three.js.
- **Couche rendu/scène** : `renderer/threejs-setup.js` + `renderer/scene-manager.js`.
- **Couche contrôle** : `main.js` (`GearGenApp`) orchestre calcul → rendu → stats → export.
- **Couche UI** : `ui/*.js` (paramètres, mobile, export, navigation).
- **Couche i18n** : `utils/i18n.js`.
- **Couche export** : `exporters/stl-exporter.js`.

Toutes les instances sont exposées en globales `window.*` (pas d'injection de dépendances).

---

## 4. Ordre de chargement des scripts et initialisation

Ordre dans `index.html` (important, car dépendances globales) :

1. `utils/math-utils.js` → définit `GearMath` + `calculateSpurGear`, `calculateBevelGear`, `calculateRackGear`, `calculateInternalGear`, `calculatePlanetaryGear`, `calculateWormGear`.
2. `utils/i18n.js` → `window.i18n = new I18n()` (applique la langue au chargement).
3. `gear-types/*.js` → classes `SpurGear`, `HelicalGear`, … (pas d'instances globales ; `HelicalGear` apporte aussi `calculateHelicalGear`).
4. `renderer/threejs-setup.js` → `window.threeJSSetup = new ThreeJSSetup()` sur `DOMContentLoaded`.
5. `renderer/scene-manager.js` → `window.sceneManager = new SceneManager()` après timeout 500 ms.
6. `renderer/gear-renderer.js` → `window.gearRenderer = new GearRenderer()` sur `DOMContentLoaded`.
7. `exporters/stl-exporter.js` → `window.stlExporter = new STLExporter()` sur `DOMContentLoaded`.
8. `ui/mobile-ui.js` → `window.mobileUI`.
9. `ui/parameter-ui.js` → `window.parameterUI`.
10. `ui/preview-panel.js` → vide.
11. `ui/export-ui.js` → `window.exportUI`.
12. `ui/navigation.js` → `window.navigation`.
13. `main.js` → `window.gearGenApp = new GearGenApp()` sur `DOMContentLoaded` (en dernier).

### 4.1 Séquence de démarrage de `GearGenApp`

```
DOMContentLoaded
  └─ new GearGenApp()
       ├─ gearParameters = {module:2, teeth:20, pressureAngle:20, faceWidth:10, hubDiameter:10, boreDiameter:5, color:'#3498db', quality:'medium'}
       ├─ init()
       │    ├─ initUI()          (no-op)
       │    ├─ init3D()          (no-op)
       │    ├─ initEventListeners()  (gear cards, export, preview toggles)
       │    └─ generateGear()
       │         ├─ sync params ← parameterUI.getAllParameters()
       │         ├─ update pitchDiameter display
       │         ├─ exportUI.updateFileSizeEstimation()
       │         └─ switch(currentGearType) → generateSpurGear() (défaut)
       │              ├─ calculateSpurGear(...)
       │              ├─ gearRenderer.createSpurGear(gearData, color, quality)
       │              │    └─ sceneManager.addGear(mesh)  (retire l'ancien)
       │              └─ updateGearStats(mesh)
```

### 4.2 Boucle de rendu

`ThreeJSSetup.animate()` appelle `requestAnimationFrame` → met à jour `OrbitControls` (si présent) → `renderer.render(scene, camera)`. Fond noir `0x1a1a1a`.

### 4.3 Mise à jour en direct

`ParameterUI` attache des listeners sur sliders/inputs/selects/couleur/qualité. Tout changement déclenche `updateLivePreview()` qui debounce 300 ms puis appelle `gearGenApp.generateGear()` et `updateCalculatedValues()`.

---

## 5. Classes et fonctions principales

### 5.1 `GearGenApp` (`main.js`)

| Membre | Rôle |
|---|---|
| `currentGearType` | Type actif (`'spur'` par défaut) |
| `gearParameters` | Paramètres courants (module, teeth, pressureAngle, faceWidth, hubDiameter, boreDiameter, color, quality + helixAngle/pitchAngle/planet* selon type) |
| `init()` | Bootstrap |
| `setGearType(type)` | Met à jour la carte active, appelle `parameterUI.updateVisibility(type)`, régénère |
| `updateParameter(param, value)` | Mappe IDs kebab-case → camelCase, convertit en nombre |
| `generateGear()` | Sync UI → dispatch par type |
| `generateSpurGear/Helical/Bevel/Worm/Rack/Internal/PlanetaryGear()` | Calcul + rendu + stats |
| `updateGearStats(mesh)` | Vertices, faces, bounding box size |
| `exportSTL()` | Appelle `stlExporter.exportCurrentGear(params)` |
| `showComingSoonMessage(feature)` | Alerte (non utilisé car tous les types sont câblés) |

### 5.2 `GearMath` (`utils/math-utils.js`)

| Méthode | Rôle |
|---|---|
| `degToRad / radToDeg` | Conversions |
| `calculateToothProfile(module, teeth, pressureAngleDeg, addendumCoeff=1, dedendumCoeff=1.25)` | Profil de base : diamètres/rayons (pitch, base, outer, root), pas circulaire, épaisseur, paramètres involute (`involuteStartAngle`, `addendumInvoluteAngle`, `alphaA`). Standard ISO 53:1998. |
| `getInvoluteVal(radius, baseRadius)` | Fonction involute `inv(α)=tan(α)-α` à un rayon donné |
| `generateCompleteToothProfile(gearData, quality)` | Profil complet d'une dent (racine → flanc bas → tête → flanc haut → racine), qualité low/medium/high (3/8/16 pas). Utilise l'épaisseur à un rayon donné. Gère `isInternal`. |
| `generateDisplayToothProfile(gearData)` | Profil simplifié 9 points (non utilisé en production) |
| `generateFullInternalProfile(gearData, quality)` | Boucle fermée CW de toutes les dents d'un engrenage interne (pour `THREE.Path` trou) |
| `calculateRackProfile(module, pressureAngleDeg, faceWidth)` | Profil d'une dent de crémaillère (trapèze) |

### 5.3 Fonctions de calcul globales

| Fonction | Fichier | Rôle |
|---|---|---|
| `calculateSpurGear(m, z, α, b, hub, bore, quality)` | math-utils.js | `calculateToothProfile` + faceWidth/hub/bore + `displayPoints` |
| `calculateBevelGear(m, z, α, pitchAngle, b, hub, bore, quality)` | math-utils.js | Idem + `pitchAngle` |
| `calculateRackGear(m, z, α, b, quality)` | math-utils.js | `calculateRackProfile` + `teeth` |
| `calculateInternalGear(m, z, α, b, quality)` | math-utils.js | Inverse addendum/dedendum (rootRadius = pitch + 1.25m, outerRadius = pitch - m), `isInternal=true`, `rimRadius`, profil complet |
| `calculatePlanetaryGear(m, sunZ, planetZ, planetCount, α, b, quality)` | math-utils.js | `ringZ = sunZ + 2*planetZ`, calcule sun/planet/ring, `centerDistance = m*(sunZ+planetZ)/2` |
| `calculateWormGear(m, starts, α, leadAngle, b, hub, bore, quality)` | math-utils.js | Comme spur + `leadAngle`, `starts` |
| `calculateHelicalGear(m, z, α, helixAngle, b, hub, bore, quality)` | helical-gear.js | `calculateToothProfile` + paramètres hélicoïdaux + `displayPoints` |

### 5.4 Classes d'engrenages (`gear-types/*.js`)

Classes légères (`SpurGear`, `HelicalGear`, `BevelGear`, `WormGear`, `RackGear`, `InternalGear`, `PlanetaryGear`) avec `constructor()` (log) et `generateGeometry(params)` qui délègue aux fonctions `calculate*Gear`. Peu utilisées directement (le flux passe par `GearGenApp` → fonctions globales). `SpurGear` contient du code mort (`extrudeProfile` simplifié).

### 5.5 Rendu 3D

#### `ThreeJSSetup` (`renderer/threejs-setup.js`)
- `scene` (fond `0x1a1a1a`), `PerspectiveCamera(45, aspect, 0.1, 1000)` position `(50,50,50)`.
- `WebGLRenderer` antialias, ombres `PCFSoftShadowMap`.
- Lumières : `AmbientLight` 0.6, `DirectionalLight` 0.8 (ombres), `HemisphereLight` 0.3.
- `setupControls()` : `OrbitControls` si disponible (sinon warning).
- `animate()` : boucle de rendu.
- `onWindowResize()`.

#### `SceneManager` (`renderer/scene-manager.js`)
- `scene`, `currentGear`, `gridHelper` (100×20), `axisHelper` (20).
- `addGear(mesh)` : retire l'ancien mesh, ajoute le nouveau, centre, met à jour les stats.
- `toggleGrid()`, `toggleAxis()`, `resetCamera()`.
- `updateStats(mesh)`.

#### `GearRenderer` (`renderer/gear-renderer.js`) — méthodes principales

| Méthode | Rôle |
|---|---|
| `createSpurGear(gearData, color, quality)` | `ExtrudeGeometry` du profil (`createCorrectedGearShape`), bevel, centre, rotateX(π/2), matériau Phong, ombres, ajoute à la scène |
| `createHelicalGear(...)` | Comme spur + calcul `twistAngle = faceWidth*tan(β)/pitchRadius`, rotation des vertices par Z, recalcul des normales |
| `createBevelGear(...)` | Taper linéaire des vertices selon Z (`s = 1 - (1-taperFactor)*zFactor`), `taperFactor = r/R` |
| `createWormGear(...)` | Twist élevé (`twistAngle = 2*faceWidth/(d*tan(γ))`), 16–64 steps |
| `createRackGear(...)` | Extrusion d'un `THREE.Shape` linéaire (N dents), corps de base |
| `createInternalGear(...)` | Anneau externe (120 segments) + trou denté (`displayPoints` CW) |
| `createPlanetaryGear(assemblyData, color, quality)` | `THREE.Group` : sun + ring + N planets positionnés à `centerDistance`, rotation approximative |
| `createCorrectedGearShape(gearData, quality)` | Construit un `THREE.Shape` en dupliquant/rotant le profil de dent (`displayPoints`) pour toutes les dents, ajoute trou d'alésage (arc CW) |
| `createSimpleGearShape(gearData)` | Fallback simplifié (non utilisé par défaut) |
| `createRobustGear(gearData, color)` | Fallback `LatheGeometry` (qualité médiocre) |
| `_createRawGearMesh / _createRawInternalMesh` | Helpers pour l'assemblage planétaire (pas d'ajout scène) |

### 5.6 UI

#### `ParameterUI` (`ui/parameter-ui.js`)
- `defaults` : valeurs par défaut (module 2, teeth 20, pressureAngle '20', faceWidth 10, hub 10, bore 5, helix 20, pitch 45, color, quality, planetTeeth 12, planetCount 3).
- `cacheElements()` : références inputs/sliders/containers.
- `setupEventListeners()` : sync slider↔input, boutons ±, chips préréglés, reset par groupe, selects/couleur.
- `handleStepAction`, `handlePresetAction`, `handleGroupReset`, `validateInput`.
- `updateLivePreview()` : debounce 300 ms → `gearGenApp.generateGear()` + `updateCalculatedValues()`.
- `updateCalculatedValues()` : affiche pitch diameter et pas circulaire.
- `getAllParameters()` : retourne un objet (nombres pour number/range, sinon chaînes).
- `setParameters(params)`.
- `updateVisibility(gearType)` : affiche/masque helix, pitch, planet teeth/count, hub/bore ; met à jour les labels (dents → "Number of Starts" pour worm, "Sun Teeth" pour planetary ; helix → "Lead Angle" pour worm).

#### `MobileUI` (`ui/mobile-ui.js`)
- Gestion des drawers (left/right/export) et bottom nav, overlay, swipe down, indicateur animé, resize.

#### `ExportUI` (`ui/export-ui.js`)
- `updateExportOptions(format)` (stl/step), `validateFileName`, `updateExportInfo`, `updateFileSizeEstimation()` (84 + 50 octets/triangle), `showExportProgress/hideExportProgress` (non appelés).

#### `Navigation` (`ui/navigation.js`)
- Boutons GitHub/Help, liens doc/report/contact, switcher de langue, modales help/documentation (contenu i18n en/en/fr/ar), fermeture ESC/overlay.

#### `I18n` (`utils/i18n.js`)
- `translations` : dictionnaires `en`, `fr`, `ar` (~clés UI).
- `currentLanguage` depuis `localStorage('geargen-language')` ou `'en'`.
- `applyLanguage(lang)` : attributs `dir`/`lang`, remplace `[data-i18n]`, placeholders, titles, dispatch `languageChanged`.
- `translate(key)`, `switchLanguage(lang)`, `getCurrentLanguage()`.

#### `STLExporter` (`exporters/stl-exporter.js`)
- `exportCurrentGear(params)` : clone du mesh courant, `STLExporter.parse(..., {binary:true})`, nom de fichier dynamique, téléchargement, toast de succès.
- `downloadSTL(stlData, filename)` : Blob + lien `<a download>`.
- `showExportSuccess(filename)` : notification animée.

---

## 6. Mathématiques et algorithmes clés

### 6.1 Profil involute

Pour chaque rayon `r` :
- angle de pression au rayon `r` : `θ_r = acos(Rb / r)` (Rb = rayon de base).
- fonction involute : `inv(θ_r) = tan(θ_r) - θ_r`.
- demi-épaisseur angulaire à rayon `r` : `ψ_r = π/(2Z) + inv(α) - inv(θ_r)` (externe) ; pour interne, `ψ_r = π/(2Z) - (inv(α) - inv(θ_r))`.

Diamètres standard (ISO 53:1998) :
- `d_pitch = m·Z`
- `d_base = d_pitch·cos(α)`
- `d_outer = d_pitch + 2·m·addendumCoeff` (addendumCoeff=1)
- `d_root = d_pitch - 2·m·dedendumCoeff` (dedendumCoeff=1.25)

### 6.2 Opérations géométriques par type

- **Hélicoïdal** : twist total `θ_twist = faceWidth·tan(β)/R_pitch`, appliqué par vertex selon Z (interpolation linéaire).
- **Conique** : taper linéaire `s(z) = 1 - (1 - r_small/R_large)·(z/faceWidth)`, `r_small = R - faceWidth·sin(δ)`.
- **Vis sans fin** : twist élevé `θ = 2·faceWidth/(d·tan(γ))` (γ = angle d'avance).
- **Planétaire** : `d_center = m·(Z_sun + Z_planet)/2`, `Z_ring = Z_sun + 2·Z_planet`.
- **Crémaillère** : profil trapézoïdal droit, N dents linéaires.
- **Interne** : anneau avec denture inversée (racine grand rayon, tête petit rayon).

### 6.3 Qualité de maillage

| Niveau | Pas involute par dent | Usage |
|---|---|---|
| low | 3 | tablettes/rapide |
| medium | 8 (défaut) | équilibré |
| high | 16 | rendu final |

Qualité worm : 16/32/64 steps d'extrusion. Hélicoïdal : 8/16/32. Conique : 2/4/8.

---

## 7. Flux d'exécution principal et E/S 3D/CAD

### 7.1 Entrées (paramètres utilisateur)

Depuis le panneau droit (`index.html`) :
- **Basic Dimensions** : module (0.5–20), teeth (8–200), planetTeeth (8–100, planetary), planetCount (2–12, planetary), helixAngle (0–45, helical/worm), pitchAngle (10–80, bevel), pressureAngle (14.5/20/25).
- **Gear Body** : faceWidth (1–100), hubDiameter (0–50), boreDiameter (0–20).
- **Appearance** : color (color picker), quality (low/medium/high).

Sélection du type d'engrenage via cartes `.gear-type-card` (data-type). Tous les 7 types sont câblés dans `GearGenApp.initEventListeners` et `generateGear`.

### 7.2 Traitement

```
Paramètres UI
  → ParameterUI.getAllParameters()
  → GearGenApp.gearParameters
  → calculate*Gear(...)  [math-utils.js]
  → gearData {module, teeth, ..., displayPoints[], faceWidth, ...}
  → GearRenderer.create*Gear(gearData, color, quality)
       → THREE.ExtrudeGeometry(shape, settings)
       → transformations (twist/taper/rotation)
       → MeshPhongMaterial
       → sceneManager.addGear(mesh)
  → stats (vertices, faces, size)
```

### 7.3 Sorties

- **Visuel** : canvas WebGL (`#preview-canvas`), grille/axes toggle, wireframe toggle, reset vue.
- **Stats** : `#vertex-count`, `#face-count`, `#gear-size` (mm).
- **Export** : bouton `#export-stl` → `STLExporter.exportCurrentGear(params)` → fichier `*.stl` binaire téléchargé.
  - Nommage : `{type}gear_m{m}_Z{z}_b{b}.stl` ; hélicoïdal ajoute `_beta{angle}` ; planétaire `{type}_Zs{sun}_Zp{planet}_N{count}_m{m}_b{b}.stl`.
- **Calculés** : pitch diameter, circular pitch (panneau calculé).

### 7.4 Objet `gearData` (contrat entre math et renderer)

Champs communs : `module`, `teeth`, `pressureAngle`, `pressureAngleRad`, `pitchDiameter`, `baseDiameter`, `outerDiameter`, `rootDiameter`, `pitchRadius`, `baseRadius`, `outerRadius`, `rootRadius`, `addendum`, `dedendum`, `wholeDepth`, `circularPitch`, `toothThicknessAtPitch`, `faceWidth`, `displayPoints` (array `{x,y}` ou `{x,y,type}`).

Champs conditionnels : `hubDiameter`, `boreDiameter` (spur/helical/bevel/worm), `helixAngle` (helical/worm), `pitchAngle` (bevel), `isInternal`, `rimRadius`, `outerRadiusRim` (internal), `leadAngle`, `starts` (worm), `centerDistance`, `planetCount`, `sun/planet/ring` (planetary), `teeth` pour rack = nombre de dents de la crémaillère.

---

## 8. Fonctionnalités implémentées

- ✅ 7 types d'engrenages générés et rendus : droit (spur), hélicoïdal, conique (bevel), vis sans fin (worm), crémaillère (rack), interne (internal), planétaire.
- ✅ Profils involute mathématiques (ISO 53:1998), angles de pression 14.5/20/25°.
- ✅ Extrusion 3D avec bevel, ombres, matériau Phong.
- ✅ Twist hélicoïdal et conique (taper) par vertex.
- ✅ Assemblage planétaire (sun + planets + ring).
- ✅ Aperçu temps réel, orbite/pan/zoom caméra (OrbitControls), grille/axes/wireframe, reset caméra, stats vertices/faces/taille.
- ✅ Export STL binaire avec nom de fichier dynamique.
- ✅ Export STEP (AP214 facetté) avec nom de fichier dynamique.
- ✅ i18n complet en/en/fr/ar + RTL automatique + persistance localStorage.
- ✅ UI responsive : drawers mobiles, bottom nav, indicateurs.
- ✅ Sliders + inputs numériques synchronisés, boutons ±, chips préréglés, reset par groupe.
- ✅ Modales Aide et Documentation (contenu multilingue).
- ✅ Calculs affichés : pitch diameter, circular pitch.
- ✅ Estimation de taille de fichier STL.

---

## 9. À développer / lacunes / bugs connus

### 9.1 Non implémenté (fichiers vides)

- ~~`src/js/exporters/step-exporter.js`~~ : **Implémenté** — `STEPExporter` génère un fichier STEP AP214 (B-Rep facetté) depuis le mesh courant ; bouton `#export-step` dans l'UI.
- `src/js/utils/validation.js` : vide. La validation se limite à `ParameterUI.validateInput` (min/max HTML) ; pas de validation métier (ex. bore < pitch, cohérence planétaire).
- `src/js/utils/file-utils.js` : vide.
- `src/js/ui/preview-panel.js` : vide.
- `docs/*.md` : vides.

### 9.2 Lacunes fonctionnelles

- ~~OrbitControls non chargé~~ → **Corrigé** : script CDN OrbitControls ajouté dans `index.html` ; `ThreeJSSetup.setupControls()` l'active automatiquement.
- **`package.json` vide** → pas de scripts, pas de dépendances déclarées, pas de build.
- **Pas de tests** automatisés.
- **Planetary filename bug** : `exportSTL()` construit `params` sans `planetTeeth` ni `planetCount`, donc le nom contient `Zpundefined`/`Nundefined`. À corriger.
- **`info.notice` flash** : le HTML statique dit "only Spur available" puis i18n remplace au chargement.
- **Fallback `createRobustGear`** : utilise `LatheGeometry` avec tous les points à angle 0 → géométrie incorrecte (cylindre), pas un engrenage.
- **`createAdvancedGear` / `createSimpleGearShape` / `generateDisplayToothProfile`** : code mort.
- **`SpurGear.extrudeProfile`** : code mort/simplifié.
- **`scene-manager.js` init** : timeout 500 ms fragile (race avec ThreeJSSetup).
- **`getAllParameters()`** : retourne des chaînes pour les selects (pressureAngle) et la couleur ; conversion partielle dans `GearGenApp.updateParameter` mais `generateGear` utilise directement les valeurs UI. Les fonctions math tolèrent les chaînes numériques, mais `pressureAngle` reste string dans `gearParameters`.
- **Rendu conique** : pas de décalage le long de l'axe du cône (apex), seulement taper linéaire ; acceptable pour l'affichage mais géométriquement approximatif.
- **Rotation planétaire** : positions/rotations approximatives, pas de vrai calcul de phase d'engrènement.
- **Pas de sauvegarde/chargement** de configurations (exemples JSON non câblés).
- **Pas d'export de paramètres** ni d'import.

### 9.3 Incohérences doc/code

- Le `README.md` utilisateur mentionne "Currently only Spur Gears are available" dans une ancienne section, mais l'app supporte 7 types.
- `docs/` vides alors que le footer promet une documentation.

---

## 10. Conventions et pièges pour une IA qui modifie le projet

1. **Pas de modules** : tout est global. Ajouter un fichier = ajouter une balise `<script>` dans `index.html` au bon endroit, et exposer via `window.*` si besoin d'un singleton.
2. **Ordre de chargement** : `math-utils.js` doit précéder les `gear-types` (qui appellent `calculate*Gear`), et `main.js` en dernier.
3. **Three.js r128** : API ancienne (pas de `BufferGeometry` helpers modernes ; `ExtrudeGeometry` accepte `THREE.Shape`). Ne pas utiliser d'API Three.js > r128.
4. **Profil de dent** : le renderer dépend de `gearData.displayPoints`. Toute nouvelle fonction `calculate*Gear` doit renseigner `displayPoints` (via `generateCompleteToothProfile` ou `generateFullInternalProfile`).
5. **Enroulement des trous** : dans Three.js, les trous (`THREE.Path`) doivent être tracés en sens inverse (CW) par rapport au contour (CCW). `generateFullInternalProfile` produit déjà une boucle CW.
6. **Alésage** : ajouté dans `createCorrectedGearShape` via `absarc(..., true)` (CW) ; ne pas dupliquer dans les données math.
7. **Planétaire** : utilise `_createRaw*Mesh` (pas d'ajout scène) pour éviter de polluer le `SceneManager` ; l'assemblage est ajouté comme un seul `Group`.
8. **Stats** : `SceneManager.addGear` met à jour les compteurs ; pour un `Group` (planétaire), `updateGearStats` lit `geometry` du Group (undefined) → les stats restent à 0 pour l'assemblage. À améliorer si besoin.
9. **i18n** : ajouter une clé dans les 3 langues (`en`, `fr`, `ar`) et utiliser `data-i18n`. Les caractères accentués sont parfois encodés de façon corrompue dans le dépôt (mojibake) ; vérifier l'encodage UTF-8.
10. **CSS** : thème via variables dans `theme.css` ; responsive géré par `responsive.css` + `MobileUI`.
11. **Performance** : la régénération est débouncée 300 ms ; éviter des calculs synchrones lourds au-delà.

---

## 11. Points d'extension recommandés (roadmap courte)

1. Implémenter `step-exporter.js` (ou supprimer la référence) et un sélecteur de format.
4. Câbler la sauvegarde/chargement JSON (exemples).
5. Corriger le nom de fichier planétaire (`planetTeeth`/`planetCount`).
6. Ajouter des tests unitaires sur `GearMath` (profil involute, diamètres).
8. Remplir `docs/` et supprimer les incohérences du README.

---

*Fin du document.*