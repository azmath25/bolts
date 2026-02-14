const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let n = 10, m = 10;
let cellSize = 40;
const CANVAS_SIZE = 600;

let selectedEdge = null; // {boltIndex, edgeIndex}
let selectedPoints = []; // {boltIndex, pointIndex}

function resizeCanvas() {
    cellSize = Math.floor(CANVAS_SIZE / Math.max(n, m));
    canvas.width = m * cellSize;
    canvas.height = n * cellSize;
    
    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw domain cells
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (domainCells.includes(pointKey(i, j))) {
                ctx.fillStyle = '#4ade80';
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
    ctx.globalAlpha = 1.0;

    // Grid lines
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

    // Draw lattice points
    ctx.fillStyle = '#6b7280';
    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
            ctx.beginPath();
            ctx.arc(j * cellSize, i * cellSize, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Draw all bolts
    for (let b = 0; b < bolts.length; b++) {
        drawBolt(b, b === selectedBoltIndex);
    }

    // Draw current bolt being drawn
    if (currentBolt && currentBolt.points.length > 0) {
        drawBoltInProgress(currentBolt);
    }
}

function drawBolt(boltIndex, isSelected) {
    let bolt = bolts[boltIndex];
    if (bolt.points.length < 2) return;

    // Determine bolt color
    let boltColor = isSelected ? '#3b82f6' : '#94a3b8'; // Blue if selected, gray if not
    let lineWidth = isSelected ? 4 : 2;

    // Draw edges
    ctx.strokeStyle = boltColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let [i0, j0] = bolt.points[0];
    ctx.moveTo(j0 * cellSize, i0 * cellSize);
    for (let k = 1; k < bolt.points.length; k++) {
        let [i, j] = bolt.points[k];
        ctx.lineTo(j * cellSize, i * cellSize);
    }
    if (bolt.closed) {
        ctx.closePath();
    }
    ctx.stroke();

    // Highlight selected edge
    if (selectedEdge && selectedEdge.boltIndex === boltIndex) {
        let edgeIdx = selectedEdge.edgeIndex;
        let nextIdx = (edgeIdx + 1) % bolt.points.length;
        if (bolt.closed || edgeIdx < bolt.points.length - 1) {
            let [i1, j1] = bolt.points[edgeIdx];
            let [i2, j2] = bolt.points[nextIdx];
            
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(j1 * cellSize, i1 * cellSize);
            ctx.lineTo(j2 * cellSize, i2 * cellSize);
            ctx.stroke();
        }
    }

    // Draw points (only show signs if selected)
    for (let k = 0; k < bolt.points.length; k++) {
        let [i, j] = bolt.points[k];
        let key = pointKey(i, j);
        
        // Determine color
        let pointColor = boltColor;
        if (isSelected && bolt.signs.has(key)) {
            let sign = bolt.signs.get(key);
            if (sign === '+') pointColor = '#22c55e'; // Green
            else if (sign === '-') pointColor = '#ef4444'; // Red
        }
        
        // Draw point
        ctx.fillStyle = pointColor;
        ctx.beginPath();
        ctx.arc(j * cellSize, i * cellSize, isSelected ? 10 : 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Highlight selected points
        let isPointSelected = selectedPoints.some(sp => sp.boltIndex === boltIndex && sp.pointIndex === k);
        if (isPointSelected) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(j * cellSize, i * cellSize, 14, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
        // Draw sign label (only if selected bolt)
        if (isSelected && bolt.signs.has(key)) {
            let sign = bolt.signs.get(key);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sign, j * cellSize, i * cellSize);
        }
    }
}

function drawBoltInProgress(bolt) {
    if (bolt.points.length === 0) return;

    // Draw edges
    if (bolt.points.length > 1) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        let [i0, j0] = bolt.points[0];
        ctx.moveTo(j0 * cellSize, i0 * cellSize);
        for (let k = 1; k < bolt.points.length; k++) {
            let [i, j] = bolt.points[k];
            ctx.lineTo(j * cellSize, i * cellSize);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Draw points
    for (let [i, j] of bolt.points) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(j * cellSize, i * cellSize, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
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
    // Check all bolts for nearby edges
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        if (bolt.points.length < 2) continue;
        
        for (let k = 0; k < bolt.points.length; k++) {
            let nextIdx = (k + 1) % bolt.points.length;
            if (!bolt.closed && k === bolt.points.length - 1) continue;
            
            let [i1, j1] = bolt.points[k];
            let [i2, j2] = bolt.points[nextIdx];
            
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
                return { boltIndex: b, edgeIndex: k };
            }
        }
    }
    return null;
}

function findPointNear(x, y, threshold = 20) {
    let [i, j] = pointFromCoords(x, y);
    
    // Check all bolts for this point
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        for (let k = 0; k < bolt.points.length; k++) {
            let [pi, pj] = bolt.points[k];
            if (pi === i && pj === j) {
                return { boltIndex: b, pointIndex: k };
            }
        }
    }
    return null;
}
