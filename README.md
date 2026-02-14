# Grid Bolt Editor

Interactive web application for creating and manipulating broken lines (bolts) on a grid with domain constraints.

## Quick Start

1. Upload all files to GitHub repository
2. Enable GitHub Pages in Settings → Pages
3. Access at `https://yourusername.github.io/repo-name`

## Files

- `index.html` - Main page
- `style.css` - Styling
- `script.js` - Event handlers
- `grid.js` - Canvas rendering
- `domain.js` - Domain management
- `bolt.js` - Bolt logic
- `utils.js` - Helper functions

## How to Use

### 1. Set Grid Size
- Adjust rows (n) and columns (m) between 5-20
- Click "Apply Grid Size"
- Smaller grids have larger cells

### 2. Choose Domain
- Click "Choose Domain" button (turns green)
- Click cells to toggle them in/out of domain (green cells)
- Click button again to finish

### 3. Draw Bolt
- Click "Draw Bolt" button (turns green)
- Click lattice points (grid intersections) to create path
- Rules:
  - Points must be adjacent (one step away)
  - After first edge, must make 90° turns only
  - Click starting point again to close loop
- Bolt automatically closes when valid

### 4. Assign Signs
- After drawing bolt, click "Assign Signs"
- Enter + or - as starting sign
- Signs alternate along the bolt
- Green points = +, Red points = -

### 5. Move Edges
- Click and drag any edge to move it
- Vertical edges move left/right
- Horizontal edges move up/down
- Movement blocked if endpoints leave domain

### 6. Swap Rectangle
- Click two diagonal corner points
- Must have matching signs:
  - (a,b)⁻ and (c,d)⁻ → swap to (a,d) and (c,b)
  - (a,d)⁺ and (c,b)⁺ → swap to (a,b) and (c,d)
- All corners must be in domain

## Features

✓ Lattice point drawing (not cell centers)
✓ Controls on left, canvas on right
✓ Cells scale larger when grid is smaller
✓ Drag-and-drop edge movement
✓ Automatic rectangle swap detection
✓ Visual feedback for all interactions

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT License
