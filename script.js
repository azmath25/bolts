// Initialization
resizeCanvas();
drawGrid(domainCells, boltPoints, signs);

canvas.addEventListener('click',(e)=>{
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let [i,j] = cellFromCoords(x,y);

    if (domainMode) toggleDomain(i,j);
    else if (boltMode) {
        if (addBoltPoint(i,j)){
            closeBoltIfNeeded(i,j);
        }
    }
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('setGrid').addEventListener('click', ()=>{
    n = parseInt(document.getElementById('gridN').value);
    m = parseInt(document.getElementById('gridM').value);
    resizeCanvas();
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('chooseDomain').addEventListener('click', ()=>{
    domainMode=true;
    boltMode=false;
});

document.getElementById('drawBolt').addEventListener('click', ()=>{
    domainMode=false;
    boltMode=true;
    boltPoints=[];
    signs.clear();
});

document.getElementById('assignSign').addEventListener('click', ()=>{
    if (boltPoints.length>0) assignSignAt(0,'+');
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('moveEdge').addEventListener('click', ()=>{
    // open prompt or predefined move
});

document.getElementById('swapRect').addEventListener('click', ()=>{
    // placeholder: swap rectangle logic
});
