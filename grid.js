const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

let n = 10, m = 10;
let cellSize = 40;

function resizeCanvas() {
    canvas.width = m * cellSize + 1;
    canvas.height = n * cellSize + 1;
}

function drawGrid(domainCells=[], boltPoints=[], signs=new Map()) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw domain
    for (let i=0;i<n;i++) {
        for (let j=0;j<m;j++) {
            if (domainCells.includes(pointKey(i,j))) {
                ctx.fillStyle = '#d0f0d0';
                ctx.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
            }
        }
    }

    // Grid lines
    ctx.strokeStyle = '#aaa';
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

    // Draw bolt lines
    if (boltPoints.length>0) {
        ctx.strokeStyle='blue';
        ctx.lineWidth=3;
        ctx.beginPath();
        let [i,j] = boltPoints[0];
        ctx.moveTo(j*cellSize + cellSize/2, i*cellSize + cellSize/2);
        for (let k=1;k<boltPoints.length;k++){
            let [ni,nj]=boltPoints[k];
            ctx.lineTo(nj*cellSize + cellSize/2, ni*cellSize + cellSize/2);
        }
        if (boltClosed) {
            ctx.closePath();
        }
        ctx.stroke();

        // Draw points with sign colors
        for (let k=0; k<boltPoints.length; k++){
            let [i,j] = boltPoints[k];
            let key = pointKey(i,j);
            ctx.fillStyle = signs.get(key)==='+'?'#00aa00':signs.get(key)==='-'?'#dd0000':'#0000dd';
            ctx.beginPath();
            ctx.arc(j*cellSize + cellSize/2, i*cellSize + cellSize/2, 7, 0, 2*Math.PI);
            ctx.fill();
            
            // Highlight selected points
            if (selectedPoints.includes(k)) {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(j*cellSize + cellSize/2, i*cellSize + cellSize/2, 10, 0, 2*Math.PI);
                ctx.stroke();
            }
            
            // Draw sign labels
            if (signs.get(key)) {
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(signs.get(key), j*cellSize + cellSize/2, i*cellSize + cellSize/2);
            }
        }
    }
    
    // Highlight selected edge
    if (selectedEdge !== null && boltPoints.length > 0) {
        let nextIdx = (selectedEdge + 1) % boltPoints.length;
        let [i1, j1] = boltPoints[selectedEdge];
        let [i2, j2] = boltPoints[nextIdx];
        
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(j1*cellSize + cellSize/2, i1*cellSize + cellSize/2);
        ctx.lineTo(j2*cellSize + cellSize/2, i2*cellSize + cellSize/2);
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

function isNearPoint(x, y, threshold = 15) {
    let [i, j] = pointFromCoords(x, y);
    let px = j * cellSize;
    let py = i * cellSize;
    
    let dx = x - px;
    let dy = y - py;
    
    return Math.sqrt(dx*dx + dy*dy) < threshold;
}
