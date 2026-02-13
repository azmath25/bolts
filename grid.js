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
        ctx.lineWidth=2;
        ctx.beginPath();
        let [i,j] = boltPoints[0];
        ctx.moveTo(j*cellSize + cellSize/2, i*cellSize + cellSize/2);
        for (let k=1;k<boltPoints.length;k++){
            let [ni,nj]=boltPoints[k];
            ctx.lineTo(nj*cellSize + cellSize/2, ni*cellSize + cellSize/2);
        }
        ctx.stroke();

        // Draw points with sign colors
        for (let [i,j] of boltPoints){
            let key = pointKey(i,j);
            ctx.fillStyle = signs.get(key)==='+'?'green':signs.get(key)==='-'?'red':'blue';
            ctx.beginPath();
            ctx.arc(j*cellSize + cellSize/2, i*cellSize + cellSize/2, 6, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}

function cellFromCoords(x,y) {
    return [Math.floor(y/cellSize), Math.floor(x/cellSize)];
}
