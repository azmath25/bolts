# Grid Bolt Forest Editor

Complete rewrite with bolt forest support, sign arithmetic, and automatic graph splitting.

## Features

✅ **Multiple Bolts** - Create unlimited bolts  
✅ **Bolt Forest** - Bolts can share vertices  
✅ **Sign Arithmetic** - Merging: ++=+, --=-, +-=0  
✅ **Auto Vanishing** - Sign 0 deletes point  
✅ **Forest Splitting** - One bolt becomes many  
✅ **Graph Analysis** - Connected component detection  
✅ **Drag & Drop** - Move edges with mouse  
✅ **Rectangle Swap** - Transform well-ordered ↔ non-well-ordered  

## Quick Start

1. Open `index.html` in browser
2. Click "Choose Domain" → mark green cells
3. Click "Draw New Bolt" → click lattice points
4. Make 90° turns, close by clicking start
5. Keep drawing more bolts!

## Controls

- **Choose Domain** - Click cells to toggle
- **Draw New Bolt** - Start drawing
- **Assign Signs** - Add +/- to selected bolt
- **Drag edges** - Click and drag any edge
- **Rectangle swap** - Click 2 diagonal corners
- **Delete Bolt** - Remove selected bolt

## How It Works

### Domain
Lattice points in domain = corners of green cells

### Bolts
- Must make 90° turns
- Can share vertices with other bolts
- Gray = unselected, Blue = selected

### Signs
- Only show on selected bolt
- Green = +, Red = -
- Alternate along path

### Edge Moves
1. Drag edge → points may merge
2. Add signs: + + = +, - - = -, + - = 0
3. Sign 0 → point vanishes
4. Graph splits into components
5. New bolts created automatically

### Rectangle Swap
**Negative well-ordered** → non-well-ordered  
**Positive non-well-ordered** → well-ordered

## Files

- `index.html` - Interface
- `style.css` - Styling
- `script.js` - Events
- `grid.js` - Rendering
- `bolt.js` - Forest logic
- `domain.js` - Domain
- `utils.js` - Helpers

## Deploy to GitHub Pages

1. Create repository
2. Upload all 8 files
3. Settings → Pages → Enable
4. Access at `username.github.io/repo-name`

## License

MIT
