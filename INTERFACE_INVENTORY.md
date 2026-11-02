# Inventaire fonctionnel de l'interface web GearGen-3D

> Document listant l'ensemble des éléments et fonctionnalités présents dans l'interface web, sans mention du design visuel.

## 1. Barre supérieure / en-tête
- Logo du projet (image + titre + slogan).
- Sélecteur de langue (English, Français, العربية) avec persistance locale.
- Bouton Aide.
- Bouton GitHub.
- Barre de menu type CAO : File, Edit, View, Help.

## 2. Menu File
- Reset Parameters.
- Export STL... (activé après génération).
- Export STEP... (activé après génération).
- Séparateur.

## 3. Menu Edit
- Reset Basic Dimensions.
- Reset Gear Body.
- Reset Appearance.

## 4. Menu View
- Isometric View.
- Top View.
- Front View.
- Side View.
- Reset View.
- Toggle Grid.
- Toggle Axis.
- Toggle Wireframe.

## 5. Menu Help
- Help.
- Documentation.
- Report Issue.
- Contact.
- GitHub.

## 6. Panneau gauche — Sélection du type d'engrenage
- Cartes cliquables pour 7 types :
  - Spur Gear
  - Helical Gear
  - Bevel Gear
  - Worm Gear
  - Rack Gear
  - Internal Gear
  - Planetary Gear
- Badge de statut (Available) par carte.

## 7. Zone centrale — Aperçu 3D
- Canvas WebGL de prévisualisation.
- Contrôles flottants :
  - Reset View
  - Isometric View
  - Top View
  - Front View
  - Side View
  - Zoom In
  - Zoom Out
  - Toggle Grid
  - Toggle Axis
  - Toggle Wireframe
- Statistiques affichées :
  - Vertices
  - Faces
  - Size (mm)

## 8. Panneau droit — Paramètres
### Dimensions de base
- Module (mm) : slider + input numérique + boutons +/- + chips préréglés (1.0, 1.5, 2.0, 2.5, 3.0, 4.0).
- Number of Teeth : slider + input + boutons +/-.
- Planet Teeth (planétaire) : slider + input + boutons +/-.
- Planet Count (planétaire) : slider + input + boutons +/-.
- Helix Angle (°) (hélicoïdal/vis) : slider + input + boutons +/-.
- Pitch Angle (°) (conique) : slider + input + boutons +/-.
- Pressure Angle (°) : liste déroulante (20°, 14.5°, 25°).

### Corps de l'engrenage
- Face Width (mm) : slider + input + boutons +/-.
- Hub Diameter (mm) : slider + input + boutons +/-.
- Bore Diameter (mm) : slider + input + boutons +/-.

### Apparence
- Gear Color : sélecteur de couleur.
- Mesh Quality : liste déroulante (Low, Medium, High).

### Valeurs calculées
- Pitch Diameter.
- Circular Pitch.

### Réinitialisations
- Reset par groupe : Basic Dimensions, Gear Body, Appearance.

## 9. Informations et notices
- Notice d'information : disponibilité des 7 types d'engrenages.
- Estimation de taille de fichier exporté (affichée via ExportUI).

## 10. Navigation mobile
- Barre de navigation inférieure :
  - Gear Type
  - Preview
  - Parameters
  - Export
- Drawers latéraux pour panneaux.
- Overlay de fermeture.
- Gestion tactile (swipe down pour fermer).
- Indicateur animé de navigation.

## 11. Modales
- Modale Aide (contenu multilingue).
- Modale Documentation (contenu multilingue).
- Fermeture par bouton, overlay ou touche Échap.

## 12. Export
- Export STL binaire (via menu File).
- Export STEP (via menu File).
- Téléchargement automatique avec nom de fichier dynamique.
- Notification de succès (toast).

## 13. Internationalisation
- Langues : Anglais, Français, Arabe.
- Basculement automatique RTL pour l'arabe.
- Persistance de la langue dans le navigateur.

## 14. Raccourcis clavier
- R : vue isométrique.
- 1 : vue de dessus.
- 2 : vue de face.
- 3 : vue de côté.
- 0 : reset vue.
- G : grille.
- A : axes.
- W : wireframe.
- + / - : zoom.

## 15. Fonctionnalités 3D
- Orbite / pan / zoom caméra (OrbitControls).
- Grille et axes toggle.
- Wireframe toggle.
- Ombres et éclairage.
- Statistiques géométriques (vertices, faces, taille).

## 16. Types d'engrenages supportés
- Spur
- Helical
- Bevel
- Worm
- Rack
- Internal
- Planetary