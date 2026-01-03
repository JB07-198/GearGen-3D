# GearGen - 3D Gear Generator

A web-based tool for creating custom 3D gear models instantly in your browser.

## Features

- **7+ Gear Types**: Spur, helical, bevel, internal, planetary, rack, and worm gears
- **Real-time 3D Preview**: Interactive visualization using Three.js
- **Parameter Controls**: Adjust module, teeth count, pressure angle, face width, etc.
- **Instant Export**: Download as STL (ready for 3D printing) or STEP (for CAD software)
- **Zero Installation**: Runs entirely in browser, deployable on GitHub Pages
- **Responsive Design**: Works on desktop and tablet devices

## Current Status

⚠️ **Phase 1: Spur Gears Only**

Currently, only **Spur Gears** are fully functional. Other gear types are planned for future releases and are marked with "Coming Soon" badges.

## Getting Started

1. Open `index.html` in a modern web browser
2. Select "Spur Gear" from the gear types
3. Adjust parameters using the sliders and inputs
4. View the 3D preview in real-time
5. Click "Download STL" to export your gear

## Project Structure
gear-generator/
├── index.html # Main entry point
├── README.md # Project documentation
├── .gitignore # Git ignore rules
├── CNAME # For custom domain (optional)
│
├── src/
│ ├── css/ # Stylesheets
│ ├── js/ # JavaScript source code
│ └── assets/ # Images, icons, fonts
│
└── lib/ # External libraries

## Development

All source code is organized in the `src/` directory:

- `src/js/main.js` - Main application controller
- `src/js/gear-types/spur-gear.js` - Spur gear implementation
- `src/js/renderer/` - Three.js rendering system
- `src/js/exporters/stl-exporter.js` - STL export functionality

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Known Limitations

1. Only Spur gears are currently implemented
2. STEP export is not yet available
3. Some advanced gear parameters are simplified

## Roadmap

### Phase 1 (Current)
- ✓ Spur gear implementation
- ✓ Basic 3D preview
- ✓ STL export
- ✓ Responsive UI

### Phase 2 (Next)
- Helical gear support
- Improved tooth profiles
- STEP export using OCCT

### Phase 3
- Bevel and worm gears
- Planetary gear systems
- Advanced parameters
- Material selection

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.