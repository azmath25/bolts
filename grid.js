const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let n = 10, m = 10;
let cellSize = 40;
const CANVAS_SIZE = 600;
const SCALE = 2; // For crisp rendering on high-DPI displays

function resizeCanvas() {
    cellSize = Math.floor(CANVAS_SIZE / Math.max(n, m));
    canvas.width = m * cellSize * SCALE;
    canvas.height = n * cellSize * SCALE;
    canvas.style.width = (m * cellSize) + 'px';
    canvas.style.height = (n * cellSize) + 'px';
    ctx.scale(SCALE, SCALE);
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw domain cells with vibrant color
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (domainCells.includes(pointKey(i, j))) {
                ctx.fillStyle = '#4ade80'; // Vibrant green
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
    ctx.globalAlpha = 1.0;

    // Grid lines - lighter and cleaner
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= n; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(m * cellSize, i * cellSize);
        ctx.stroke();
    }
    for (let j = 0; j <= m; j++) {
        ctx.beginPath();
        ctx.moveTo(j * cellSize, 0);
        ctx.lineTo(j * cellSize, n * cellSize);
        ctx.stroke();
    }

    // Draw lattice points - smaller and darker for contrast
    ctx.fillStyle = '#6b7280';
    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            ctx.beginPath();
            ctx.arc(j * cellSize, i * cellSize, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Draw bolt edges
    if (boltPoints.length > 1) {
        ctx.strokeStyle = '#3b82f6'; // Bright blue
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        let [i0, j0] = boltPoints[0];
        ctx.moveTo(j0 * cellSize, i0 * cellSize);
        for (let k = 1; k < boltPoints.length; k++) {
            let [i, j] = boltPoints[k];
            ctx.lineTo(j * cellSize, i * cellSize);
        }
        if (boltClosed) {
            ctx.closePath();
        }
        ctx.stroke();
    }

    // Highlight selected edge
    if (selectedEdge !== null && boltPoints.length > 1) {
        let nextIdx = (selectedEdge + 1) % boltPoints.length;
        if (boltClosed || selectedEdge < boltPoints.length - 1) {
            let [i1, j1] = boltPoints[selectedEdge];
            let [i2, j2] = boltPoints[nextIdx];
            
            ctx.strokeStyle = '#f59e0b'; // Bright orange
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(j1 * cellSize, i1 * cellSize);
            ctx.lineTo(j2 * cellSize, i2 * cellSize);
            ctx.stroke();
        }
    }

    // Draw bolt points
    for (let k = 0; k < boltPoints.length; k++) {
        let [i, j] = boltPoints[k];
        let key = pointKey(i, j);
        
        // Color based on sign
        let sign = signs.get(key);
        if (sign === '+') {
            ctx.fillStyle = '#22c55e'; // Bright green
        } else if (sign === '-') {
            ctx.fillStyle = '#ef4444'; // Bright red
        } else {
            ctx.fillStyle = '#3b82f6'; // Bright blue
        }
        
        // Draw outer circle
        ctx.beginPath();
        ctx.arc(j * cellSize, i * cellSize, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw white border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Highlight selected points
        if (selectedPoints.includes(k)) {
            ctx.strokeStyle = '#fbbf24'; // Golden yellow
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(j * cellSize, i * cellSize, 14, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw sign label
        if (sign) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sign, j * cellSize, i * cellSize);
        }
    }
}

function cellFromCoords(x, y) {
    return [Math.floor(y / cellSize), Math.floor(x / cellSize)];
}

function pointFromCoords(x, y) {
    let j = Math.round(x / cellSize);
    let i = Math.round(y / cellSize);
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
    return Math.sqrt(dx * dx + dy * dy) < threshold;
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
        
        let dx = x2 - x1;
        let dy = y2 - y1;
        let len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;
        
        let t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (len * len)));
        let projX = x1 + t * dx;
        let projY = y1 + t * dy;
        
        let dist = Math.sqrt((x - projX) * (x - projX) + (y - projY) * (y - projY));
        if (dist < threshold) {
            return k;
        }
    }
    return -1;
}
