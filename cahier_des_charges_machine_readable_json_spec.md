{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "project": {
    "name": "GearGen-3D",
    "version": "1.0.0",
    "description": "3D Gear Generator Web Interface - Technical UI/UX Specification",
    "theme": {
      "mode": "dark",
      "colors": {
        "background_primary": "#0F172A",
        "background_panel": "#1E293B",
        "border": "#334155",
        "accent_primary": "#3B82F6",
        "accent_success": "#10B981",
        "text_primary": "#F8FAFC",
        "text_secondary": "#94A3B8"
      },
      "typography": {
        "ui_font": "Inter, system-ui, sans-serif",
        "mono_font": "JetBrains Mono, monospace"
      }
    },
    "i18n": {
      "supported_languages": ["en", "fr", "ar"],
      "default_language": "en",
      "rtl_languages": ["ar"],
      "persistence": "localStorage"
    }
  },
  "layout_structure": {
    "desktop": {
      "min_width": 1024,
      "type": "three_panel_workspace",
      "panels": [
        { "id": "top_bar", "type": "header", "height": "56px" },
        { "id": "left_sidebar", "type": "gear_selector", "width": "280px" },
        { "id": "center_viewport", "type": "webgl_canvas", "width": "flex-1" },
        { "id": "right_sidebar", "type": "parameter_controls", "width": "340px" }
      ]
    },
    "mobile": {
      "max_width": 1023,
      "type": "bottom_nav_with_drawers",
      "bottom_navigation_items": [
        { "id": "tab_type", "label": "Gear Type", "target": "drawer_left" },
        { "id": "tab_preview", "label": "Preview", "target": "canvas_fullscreen" },
        { "id": "tab_params", "label": "Parameters", "target": "drawer_right" },
        { "id": "tab_export", "label": "Export", "target": "export_modal" }
      ],
      "gestures": {
        "drawer_close": "swipe_down",
        "canvas_touch": ["pinch_zoom", "one_finger_rotate", "two_finger_pan"]
      }
    }
  },
  "functional_inventory": {
    "header": {
      "branding": {
        "logo": true,
        "title": "GearGen-3D",
        "tagline": "Parametric 3D Gear Generator"
      },
      "menu_bar": [
        {
          "menu": "File",
          "items": [
            { "id": "file_reset", "action": "RESET_ALL_PARAMS" },
            { "id": "export_stl", "action": "EXPORT_STL", "requires_mesh": true },
            { "id": "export_step", "action": "EXPORT_STEP", "requires_mesh": true }
          ]
        },
        {
          "menu": "Edit",
          "items": [
            { "id": "reset_basic", "action": "RESET_SECTION", "target": "basic_dimensions" },
            { "id": "reset_body", "action": "RESET_SECTION", "target": "gear_body" },
            { "id": "reset_appearance", "action": "RESET_SECTION", "target": "appearance" }
          ]
        },
        {
          "menu": "View",
          "items": [
            { "id": "view_iso", "action": "SET_CAMERA_VIEW", "param": "isometric" },
            { "id": "view_top", "action": "SET_CAMERA_VIEW", "param": "top" },
            { "id": "view_front", "action": "SET_CAMERA_VIEW", "param": "front" },
            { "id": "view_side", "action": "SET_CAMERA_VIEW", "param": "side" },
            { "id": "view_reset", "action": "RESET_CAMERA" },
            { "id": "toggle_grid", "action": "TOGGLE_HELPER", "target": "grid" },
            { "id": "toggle_axis", "action": "TOGGLE_HELPER", "target": "axis" },
            { "id": "toggle_wireframe", "action": "TOGGLE_RENDER_MODE", "target": "wireframe" }
          ]
        },
        {
          "menu": "Help",
          "items": [
            { "id": "open_help", "action": "OPEN_MODAL", "target": "help" },
            { "id": "open_docs", "action": "OPEN_MODAL", "target": "documentation" },
            { "id": "report_issue", "action": "OPEN_EXTERNAL", "url": "github_issues" },
            { "id": "contact", "action": "OPEN_EXTERNAL", "url": "contact_link" },
            { "id": "github", "action": "OPEN_EXTERNAL", "url": "github_repo" }
          ]
        }
      ],
      "quick_actions": [
        { "type": "language_selector", "options": ["EN", "FR", "AR"] },
        { "type": "help_button", "action": "OPEN_MODAL", "target": "help" },
        { "type": "github_button", "action": "OPEN_EXTERNAL" }
      ]
    },
    "gear_types": [
      { "id": "spur", "label": "Spur Gear", "status": "Available", "icon": "spur_gear.svg" },
      { "id": "helical", "label": "Helical Gear", "status": "Available", "icon": "helical_gear.svg" },
      { "id": "bevel", "label": "Bevel Gear", "status": "Available", "icon": "bevel_gear.svg" },
      { "id": "worm", "label": "Worm Gear", "status": "Available", "icon": "worm_gear.svg" },
      { "id": "rack", "label": "Rack Gear", "status": "Available", "icon": "rack_gear.svg" },
      { "id": "internal", "label": "Internal Gear", "status": "Available", "icon": "internal_gear.svg" },
      { "id": "planetary", "label": "Planetary Gear", "status": "Available", "icon": "planetary_gear.svg" }
    ],
    "viewport_3d": {
      "renderer": "WebGL",
      "library": "Three.js",
      "controls": "OrbitControls",
      "floating_toolbar_buttons": [
        "reset_view", "iso_view", "top_view", "front_view", "side_view",
        "zoom_in", "zoom_out", "toggle_grid", "toggle_axis", "toggle_wireframe"
      ],
      "mesh_statistics_overlay": {
        "position": "bottom-left",
        "metrics": ["vertices_count", "faces_count", "bounding_box_mm"]
      }
    },
    "parameter_controls": {
      "groups": [
        {
          "id": "basic_dimensions",
          "title": "Basic Dimensions",
          "parameters": [
            {
              "id": "module",
              "label": "Module (mm)",
              "type": "slider_with_input",
              "min": 0.5,
              "max": 10.0,
              "step": 0.1,
              "default": 2.0,
              "presets": [1.0, 1.5, 2.0, 2.5, 3.0, 4.0]
            },
            {
              "id": "teeth_count",
              "label": "Number of Teeth",
              "type": "slider_with_input",
              "min": 8,
              "max": 200,
              "step": 1,
              "default": 20
            },
            {
              "id": "planet_teeth",
              "label": "Planet Teeth",
              "type": "slider_with_input",
              "visible_if": { "gear_type": "planetary" }
            },
            {
              "id": "planet_count",
              "label": "Planet Count",
              "type": "slider_with_input",
              "visible_if": { "gear_type": "planetary" }
            },
            {
              "id": "helix_angle",
              "label": "Helix Angle (°)",
              "type": "slider_with_input",
              "visible_if": { "gear_type": ["helical", "worm"] }
            },
            {
              "id": "pitch_angle",
              "label": "Pitch Angle (°)",
              "type": "slider_with_input",
              "visible_if": { "gear_type": "bevel" }
            },
            {
              "id": "pressure_angle",
              "label": "Pressure Angle (°)",
              "type": "select",
              "options": [14.5, 20.0, 25.0],
              "default": 20.0
            }
          ]
        },
        {
          "id": "gear_body",
          "title": "Gear Body",
          "parameters": [
            { "id": "face_width", "label": "Face Width (mm)", "type": "slider_with_input" },
            { "id": "hub_diameter", "label": "Hub Diameter (mm)", "type": "slider_with_input" },
            { "id": "bore_diameter", "label": "Bore Diameter (mm)", "type": "slider_with_input" }
          ]
        },
        {
          "id": "appearance",
          "title": "Appearance",
          "parameters": [
            { "id": "gear_color", "label": "Gear Color", "type": "color_picker" },
            { "id": "mesh_quality", "label": "Mesh Quality", "type": "select", "options": ["Low", "Medium", "High"], "default": "Medium" }
          ]
        }
      ],
      "calculated_values_kpi": [
        { "id": "pitch_diameter", "label": "Pitch Diameter", "formula": "module * teeth_count", "unit": "mm" },
        { "id": "circular_pitch", "label": "Circular Pitch", "formula": "PI * module", "unit": "mm" }
      ]
    },
    "keyboard_shortcuts": {
      "KeyR": "SET_CAMERA_VIEW_ISO",
      "Digit1": "SET_CAMERA_VIEW_TOP",
      "Digit2": "SET_CAMERA_VIEW_FRONT",
      "Digit3": "SET_CAMERA_VIEW_SIDE",
      "Digit0": "RESET_CAMERA",
      "KeyG": "TOGGLE_GRID",
      "KeyA": "TOGGLE_AXIS",
      "KeyW": "TOGGLE_WIREFRAME",
      "NumpadAdd": "ZOOM_IN",
      "NumpadSubtract": "ZOOM_OUT"
    }
  },
  "ai_agent_instructions": {
    "architecture_pattern": "Single Component State Store (e.g. Zustand) feeding React + Three.js Canvas",
    "code_generation_rules": [
      "All UI controls must immediately sync with the 3D model state store.",
      "Always generate clean React JSX / Tailwind CSS components.",
      "Ensure proper RTL CSS layout support when language is set to 'ar'.",
      "Renders must be throttled to maintain 60FPS during slider interactions."
    ]
  }
}
```

eof

---

### Pourquoi ce format est idéal pour un Agent IA :
1. **Zéro ambiguïté syntaxique** : Format `JSON` strict prêt à être injecté directement dans n'importe quel LLM ou agent autonome (comme AutoGPT, Claude, Devin, etc.).
2. **Schéma Typé** : Les champs, types de données (`slider_with_input`, `select`), valeurs par défaut, formules mathématiques et visibilité conditionnelle (`visible_if`) sont clairement explicités.
3. **Prêt pour la génération de code** : Un agent IA peut transformer ce fichier directement en composants React/Tailwind et en un state Zustand/Redux sans poser de questions supplémentaires.