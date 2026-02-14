# Grid Bolt Forest Editor

Interactive web application for creating and manipulating multiple broken lines (bolts) on a grid - now with full support for bolt forests!

## New Features

- **Multiple Bolts**: Create and manage multiple independent bolts
- **Bolt Forest**: Bolts can share vertices
- **Sign Arithmetic**: Merging points adds signs (+ and - = 0, vanishes)
- **Selective Display**: Signs only show on selected bolt
- **Composite Detection**: Automatically detects composite bolts (3+ collinear points)

## Quick Start

1. Upload all files to GitHub
2. Enable GitHub Pages
3. Access at `https://yourusername.github.io/repo-name`

## Files

- `index.html` - Main interface
- `style.css` - Styling
- `script.js` - Event handlers
- `grid.js` - Multi-bolt rendering
- `bolt.js` - Bolt forest logic
- `domain.js` - Domain management
- `utils.js` - Helper functions

## How to Use

### 1. Set Grid Size
- Adjust rows and columns (5-20)
- Smaller grids = larger cells

### 2. Choose Domain
- Click cells to toggle domain (green)
- Lattice points in domain = corners of domain cells

### 3. Draw Bolts
- Click "Draw New Bolt"
- Click lattice points (must be in domain)
- Must make 90° turns after first edge
- Click starting point to close
- Gray bolts = unselected, Blue bolt = selected

### 4. Select Bolts
- Click any point on a bolt to select it
- Selected bolt shows in blue
- Only selected bolt shows signs

### 5. Assign Signs
- Select a bolt first
- Click "Assign Signs"
- Enter + or - as starting sign
- Signs alternate along bolt
- Green = +, Red = -

### 6. Drag Edges
- Click and drag any edge to move it
- Vertical edges: move left/right
- Horizontal edges: move up/down
- **Merging**: If points merge, signs add:
  - + and - = 0 (point vanishes)
  - + and + = +
  - - and - = -

### 7. Rectangle Swap
- Select a bolt with signs
- Click two diagonal corners
- **Negative well-ordered** → non-well-ordered
- **Positive non-well-ordered** → well-ordered
- Well-ordered = each coordinate of one point larger than other

### 8. Manage Bolts
- **Delete Selected Bolt**: Remove currently selected bolt
- **Show Bolt Info**: See all bolts, their properties
- **Clear All**: Reset everything

## Sign Arithmetic Rules

When dragging edges causes points to merge:
- `+ + = +` (both positive stays positive)
- `- - = -` (both negative stays negative)  
- `+ - = 0` (opposite signs cancel, point vanishes)

When a point vanishes (sign = 0):
- Point is deleted
- Its two neighbors become connected

## Rectangle Swap Rules

### Negative Points (well-ordered → non-well-ordered)
- Given: (i1,j1)⁻ and (i2,j2)⁻ where i1<i2 and j1<j2
- Result: (i1,j2)⁻ and (i2,j1)⁻

### Positive Points (non-well-ordered → well-ordered)
- Given: (i1,j1)⁺ and (i2,j2)⁺ where NOT well-ordered
- Result: Transform to well-ordered positions

## Technical Details

### Bolt Forest Architecture
```javascript
bolts = [
  {
    points: [[i,j], ...],
    closed: boolean,
    signs: Map<pointKey, sign>,
    composite: boolean
  },
  ...
]
```

### Composite Bolts
A bolt is composite if 3+ consecutive points are collinear (on same line parallel to axis). Feature to split composites coming soon!

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT License
