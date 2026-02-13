Need a framework that I can locally host in GitHub for me
with JS, CSS, and HTML only

screen n times m grid, n and m adjustable between 5 and 20 each

One can choose some lattice points in an order, and the program should auto-connect the newly chosen point with the previous

a point is  only allowed to be chosen as next if two consecutive edges make 90 degrees or 270 degrees
If it comes back to the start point, then it is closed, and no more choices are allowed.


The user can also mark some cells in the grid at the beginning to form the domain.

Later user is allowed to assign a sign(+ or -) to one of the vertices of the broken line, then all other points should be marked with a sign, such that signs alternate while moving on the broken line


Now I describe the moves:

1) A  vertical edge can be moved to the left or right if, at the end of this movement, its endpoints stay inside the pre-chosen domain (while this edge moves, the two points are moving and all connected edges shorten or become larger, no connection is lost)
2)  A horizontal  edge can be moved up or down if, at the end of this movement, its endpoints stay inside the pre-chosen domain 
3) If there is a rectangle with all corners
(a,b), (a,d), (c,b), (c,d) inside the pre-chosen domain
such that a<c and b<d
then 
3.1.  If (a,b) and (c,d) are both negatively signed, then one can choose them both and, with one click, can move (a,b) to (a,d) and (c,d) to (c,b)
3.2.  If (a,d) and (c,b) are both positively signed, then one can choose them both and, with one click, can move (a,d) to (a,b) and (c,b) to (c,d)


Thus, on top we need  choose the domain button
draw bolt(broken line) button
Adjust the grid thing



# Grid Bolt Editor

An interactive web application for creating and manipulating broken lines (bolts) on a grid with domain constraints and special movement rules.

## Features

- **Adjustable Grid**: Set grid size from 5x5 to 20x20
- **Domain Selection**: Mark cells to define the allowed region
- **Bolt Drawing**: Create paths with 90° turn constraints
- **Sign Assignment**: Assign alternating + and - signs to vertices
- **Edge Movement**: Move vertical/horizontal edges within domain
- **Rectangle Swapping**: Special swap operations based on sign rules

## How to Deploy on GitHub

1. **Create a new repository on GitHub**
   - Go to github.com and create a new repository
   - Name it something like `grid-bolt-editor`
   - Don't initialize with README (we have one)

2. **Upload files**
   - Upload all the files from this project:
     - `index.html`
     - `style.css`
     - `script.js`
     - `grid.js`
     - `domain.js`
     - `bolt.js`
     - `utils.js`
     - `README.md`

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click Save
   - Your site will be live at: `https://yourusername.github.io/grid-bolt-editor`

## How to Use

### 1. Set Up the Grid
- Adjust grid size using the input fields (5-20 for each dimension)
- Click "Set Grid" to apply changes

### 2. Define the Domain
- Click "Choose Domain" button
- Click on cells to toggle them (green = in domain)
- Click "Choose Domain" again to finish

### 3. Draw a Bolt (Broken Line)
- Click "Draw Bolt" button
- Click on lattice points (grid intersections) to create a path
- Rules:
  - Each new point must be adjacent to the previous one
  - After the first edge, turns must be exactly 90° (perpendicular)
  - Click the starting point again to close the loop
- The bolt appears as a blue line with blue points

### 4. Assign Signs
- After drawing the bolt, click "Assign Sign"
- Enter + or - as the starting sign
- Signs will alternate along the path
- Green points = positive (+)
- Red points = negative (-)

### 5. Move Edges
- Click "Move Edge" button
- Click on any edge of the bolt
- Use arrow keys:
  - **Vertical edges**: ← and → to move left/right
  - **Horizontal edges**: ↑ and ↓ to move up/down
- Press ESC to deselect edge
- Movement only allowed if endpoints stay in domain

### 6. Swap Rectangle
- Click "Swap Rectangle" button
- Select two diagonal points of a rectangle
- Swap rules:
  - If both points (a,b) and (c,d) are negative: swap to (a,d) and (c,b)
  - If both points (a,d) and (c,b) are positive: swap to (a,b) and (c,d)
- All four corners must be in the domain

### 7. Clear All
- Click "Clear All" to reset everything

## Technical Details

### File Structure
```
grid-bolt-editor/
├── index.html      # Main HTML structure
├── style.css       # Styling and layout
├── script.js       # Main application logic and event handlers
├── grid.js         # Canvas drawing and grid management
├── domain.js       # Domain selection functionality
├── bolt.js         # Bolt path and movement logic
├── utils.js        # Helper functions
└── README.md       # This file
```

### Key Algorithms

**90° Turn Validation**: Uses dot product of consecutive edge vectors. Valid if dot product = 0.

**Edge Movement**: 
- Checks edge orientation (vertical/horizontal)
- Validates both endpoints remain in domain after movement
- Updates connected edge lengths automatically

**Rectangle Swap**:
- Validates rectangle corners are in domain
- Checks sign conditions match one of the two allowed patterns
- Updates point positions and sign mappings

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

MIT License - feel free to use and modify!

## Credits

Built with vanilla JavaScript, HTML5 Canvas, and CSS3.



