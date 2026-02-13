const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let n = 10, m = 10;
let cellSize = 40;
const CANVAS_SIZE = 600; // Fixed canvas size

function resizeCanvas() {
    // Calculate cell size to fit canvas
    cellSize = Math.floor(CANVAS_SIZE / Math.max(n, m));
    canvas.width = m * cellSize;
    canvas.height = n * cellSize;
}

function drawGrid(domainCells=[], boltPoints=[], signs=new Map()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw domain cells (slightly transparent)
    ctx.globalAlpha = 0.3;
    for (let i=0;i<n;i++) {
        for (let j=0;j<m;j++) {
            if (domainCells.includes(pointKey(i,j))) {
                ctx.fillStyle = '#90ee90';
                ctx.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
            }
        }
    }
    ctx.globalAlpha = 1.0;

    // Grid lines
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i=0;i<=n;i++){
        ctx.beginPath();
        ctx.moveTo(0, i*cellSize);
        ctx.lineTo(m*cellSize, i*cellSize);
        ctx.stroke();
    }
    for (let j=0;j<=m;j++){
        ctx.beginPath();
        ctx.moveTo(j*cellSize, 0);
        ctx.lineTo(j*cellSize, n*cellSize);
        ctx.stroke();
    }

    // Draw all lattice points
    for (let i=0; i<=n; i++) {
        for (let j=0; j<=m; j++) {
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(j*cellSize, i*cellSize, 2, 0, 2*Math.PI);
            ctx.fill();
        }
    }

    // Draw bolt lines
    if (boltPoints.length>0) {
        ctx.strokeStyle='#0066ff';
        ctx.lineWidth=3;
        ctx.beginPath();
        let [i,j] = boltPoints[0];
        ctx.moveTo(j*cellSize, i*cellSize);
        for (let k=1;k<boltPoints.length;k++){
            let [ni,nj]=boltPoints[k];
            ctx.lineTo(nj*cellSize, ni*cellSize);
        }
        if (boltClosed) {
            ctx.closePath();
        }
        ctx.stroke();

        // Draw bolt points with sign colors
        for (let k=0; k<boltPoints.length; k++){
            let [i,j] = boltPoints[k];
            let key = pointKey(i,j);
            ctx.fillStyle = signs.get(key)==='+'?'#00aa00':signs.get(key)==='-'?'#dd0000':'#0066ff';
            ctx.beginPath();
            ctx.arc(j*cellSize, i*cellSize, 8, 0, 2*Math.PI);
            ctx.fill();
            
            // Highlight selected points
            if (selectedPoints.includes(k)) {
                ctx.strokeStyle = '#ffaa00';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(j*cellSize, i*cellSize, 12, 0, 2*Math.PI);
                ctx.stroke();
            }
            
            // Draw sign labels
            if (signs.get(key)) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(signs.get(key), j*cellSize, i*cellSize);
            }
        }
    }
    
    // Highlight selected edge
    if (selectedEdge !== null && boltPoints.length > 0) {
        let nextIdx = (selectedEdge + 1) % boltPoints.length;
        let [i1, j1] = boltPoints[selectedEdge];
        let [i2, j2] = boltPoints[nextIdx];
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(j1*cellSize, i1*cellSize);
        ctx.lineTo(j2*cellSize, i2*cellSize);
        ctx.stroke();
    }
}

function cellFromCoords(x,y) {
    return [Math.floor(y/cellSize), Math.floor(x/cellSize)];
}

function pointFromCoords(x, y) {
    // Snap to nearest lattice point
    let j = Math.round(x / cellSize);
    let i = Math.round(y / cellSize);
    
    // Clamp to grid bounds
    i = Math.max(0, Math.min(n, i));
    j = Math.max(0, Math.min(m, j));
    
    return [i, j];
}

function isNearPoint(x, y, threshold = 20) {
    let [i, j] = pointFromCoords(x, y);
    let px = j * cellSize;
    let py = i * cellSize;
    
    let dx = x - px;
    let dy = y - py;
    
    return Math.sqrt(dx*dx + dy*dy) < threshold;
}

function findEdgeNear(x, y, threshold = 15) {
    if (boltPoints.length < 2) return -1;
    
    for (let k = 0; k < boltPoints.length; k++) {
        let nextIdx = (k + 1) % boltPoints.length;
        if (!boltClosed && k === boltPoints.length - 1) continue;
        
        let [i1, j1] = boltPoints[k];
        let [i2, j2] = boltPoints[nextIdx];
        
        let x1 = j1 * cellSize;
        let y1 = i1 * cellSize;
        let x2 = j2 * cellSize;
        let y2 = i2 * cellSize;
        
        // Distance from point to line segment
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = Math.sqrt(dx*dx + dy*dy);
        if (len === 0) continue;
        
        let t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (len * len)));
        let projX = x1 + t * dx;
        let projY = y1 + t * dy;
        
        let dist = Math.sqrt((x - projX)**2 + (y - projY)**2);
        if (dist < threshold) {
            return k;
        }
    }
    return -1;
}
