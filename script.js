// Initialization
resizeCanvas();
drawGrid(domainCells, boltPoints, signs);

// Status display
function updateStatus(message) {
    let statusDiv = document.getElementById('status');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

canvas.addEventListener('click',(e)=>{
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (domainMode) {
        let [i,j] = cellFromCoords(x,y);
        if (i >= 0 && i < n && j >= 0 && j < m) {
            toggleDomain(i,j);
            updateStatus(`Domain cell (${i},${j}) toggled`);
        }
    } else if (boltMode) {
        if (isNearPoint(x, y)) {
            let [i,j] = pointFromCoords(x, y);
            if (addBoltPoint(i,j)){
                if (boltClosed) {
                    updateStatus('Bolt closed! Use "Assign Sign" to add signs.');
                } else {
                    updateStatus(`Point (${i},${j}) added to bolt`);
                }
            } else {
                updateStatus('Invalid point! Must be adjacent and make 90° turn.');
            }
        }
    } else if (moveMode === 'edge') {
        if (isNearPoint(x, y)) {
            let [i,j] = pointFromCoords(x, y);
            let edgeIdx = findEdgeContainingPoint(i, j);
            if (edgeIdx >= 0) {
                selectedEdge = edgeIdx;
                updateStatus(`Edge selected. Use arrow keys to move (horizontal: ←→, vertical: ↑↓)`);
            }
        }
    } else if (moveMode === 'rect') {
        if (isNearPoint(x, y)) {
            let [i,j] = pointFromCoords(x, y);
            let pointIdx = findPointIndex(i, j);
            if (pointIdx >= 0) {
                if (selectedPoints.includes(pointIdx)) {
                    selectedPoints = selectedPoints.filter(p => p !== pointIdx);
                    updateStatus(`Point deselected`);
                } else {
                    selectedPoints.push(pointIdx);
                    updateStatus(`Point selected. Select another point to swap rectangle.`);
                    
                    if (selectedPoints.length === 2) {
                        if (swapRectangle(selectedPoints[0], selectedPoints[1])) {
                            updateStatus('Rectangle swap successful!');
                            selectedPoints = [];
                            moveMode = null;
                        } else {
                            updateStatus('Invalid rectangle swap. Check conditions.');
                            selectedPoints = [];
                        }
                    }
                }
            }
        }
    }
    
    drawGrid(domainCells, boltPoints, signs);
});

// Keyboard controls for edge movement
document.addEventListener('keydown', (e) => {
    if (moveMode === 'edge' && selectedEdge !== null) {
        let moved = false;
        let nextIdx = (selectedEdge + 1) % boltPoints.length;
        let [i1, j1] = boltPoints[selectedEdge];
        let [i2, j2] = boltPoints[nextIdx];
        
        if (e.key === 'ArrowLeft' && j1 === j2) {
            moved = moveVerticalEdge(selectedEdge, -1);
        } else if (e.key === 'ArrowRight' && j1 === j2) {
            moved = moveVerticalEdge(selectedEdge, 1);
        } else if (e.key === 'ArrowUp' && i1 === i2) {
            moved = moveHorizontalEdge(selectedEdge, -1);
        } else if (e.key === 'ArrowDown' && i1 === i2) {
            moved = moveHorizontalEdge(selectedEdge, 1);
        } else if (e.key === 'Escape') {
            selectedEdge = null;
            updateStatus('Edge deselected');
            drawGrid(domainCells, boltPoints, signs);
            return;
        }
        
        if (moved) {
            updateStatus('Edge moved successfully!');
            drawGrid(domainCells, boltPoints, signs);
        } else if (e.key.startsWith('Arrow')) {
            updateStatus('Cannot move edge: endpoints would leave domain');
        }
    }
});

document.getElementById('setGrid').addEventListener('click', ()=>{
    n = parseInt(document.getElementById('gridN').value);
    m = parseInt(document.getElementById('gridM').value);
    n = Math.max(5, Math.min(20, n));
    m = Math.max(5, Math.min(20, m));
    document.getElementById('gridN').value = n;
    document.getElementById('gridM').value = m;
    resizeCanvas();
    drawGrid(domainCells, boltPoints, signs);
    updateStatus(`Grid set to ${n} x ${m}`);
});

document.getElementById('chooseDomain').addEventListener('click', ()=>{
    domainMode = !domainMode;
    boltMode = false;
    moveMode = null;
    selectedEdge = null;
    selectedPoints = [];
    
    document.getElementById('chooseDomain').textContent = domainMode ? 'Stop Domain' : 'Choose Domain';
    updateStatus(domainMode ? 'Click cells to toggle domain' : 'Domain mode off');
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('drawBolt').addEventListener('click', ()=>{
    domainMode = false;
    boltMode = !boltMode;
    moveMode = null;
    selectedEdge = null;
    selectedPoints = [];
    
    if (boltMode) {
        clearBolt();
    }
    
    document.getElementById('drawBolt').textContent = boltMode ? 'Stop Drawing' : 'Draw Bolt';
    updateStatus(boltMode ? 'Click lattice points to draw bolt (must make 90° turns)' : 'Bolt mode off');
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('assignSign').addEventListener('click', ()=>{
    if (boltPoints.length > 0) {
        let startSign = prompt('Enter starting sign (+ or -):', '+');
        if (startSign === '+' || startSign === '-') {
            assignSignAt(0, startSign);
            updateStatus('Signs assigned to bolt points');
            drawGrid(domainCells, boltPoints, signs);
        }
    } else {
        updateStatus('Draw a bolt first!');
    }
});

document.getElementById('moveEdge').addEventListener('click', ()=>{
    domainMode = false;
    boltMode = false;
    moveMode = moveMode === 'edge' ? null : 'edge';
    selectedEdge = null;
    selectedPoints = [];
    
    document.getElementById('moveEdge').textContent = moveMode === 'edge' ? 'Stop Moving' : 'Move Edge';
    updateStatus(moveMode === 'edge' ? 'Click an edge, then use arrow keys to move it' : 'Edge move mode off');
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('swapRect').addEventListener('click', ()=>{
    if (signs.size === 0) {
        updateStatus('Assign signs first!');
        return;
    }
    
    domainMode = false;
    boltMode = false;
    moveMode = moveMode === 'rect' ? null : 'rect';
    selectedEdge = null;
    selectedPoints = [];
    
    document.getElementById('swapRect').textContent = moveMode === 'rect' ? 'Stop Swapping' : 'Swap Rectangle';
    updateStatus(moveMode === 'rect' ? 'Select two points to swap rectangle' : 'Rectangle swap mode off');
    drawGrid(domainCells, boltPoints, signs);
});

document.getElementById('clearAll').addEventListener('click', ()=>{
    if (confirm('Clear everything?')) {
        clearDomain();
        clearBolt();
        domainMode = false;
        boltMode = false;
        moveMode = null;
        selectedEdge = null;
        selectedPoints = [];
        
        document.getElementById('chooseDomain').textContent = 'Choose Domain';
        document.getElementById('drawBolt').textContent = 'Draw Bolt';
        document.getElementById('moveEdge').textContent = 'Move Edge';
        document.getElementById('swapRect').textContent = 'Swap Rectangle';
        
        updateStatus('All cleared');
        drawGrid(domainCells, boltPoints, signs);
    }
});
