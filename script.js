// Initialize
resizeCanvas();
drawGrid();

let isDragging = false;
let draggedEdge = null;
let dragStartX, dragStartY;

function updateStatus(message) {
    document.getElementById('status').textContent = message;
}

function updateButtonStates() {
    document.getElementById('chooseDomain').classList.toggle('active', domainMode);
    document.getElementById('drawBolt').classList.toggle('active', boltMode);
}

// Mouse down
canvas.addEventListener('mousedown', (e) => {
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    if (domainMode) {
        let [i, j] = cellFromCoords(x, y);
        if (i >= 0 && i < n && j >= 0 && j < m) {
            toggleDomain(i, j);
            updateStatus(`Domain cell (${i},${j}) toggled`);
            drawGrid();
        }
    } else if (boltMode) {
        if (isNearPoint(x, y)) {
            let [i, j] = pointFromCoords(x, y);
            if (addBoltPoint(i, j)) {
                if (boltClosed) {
                    updateStatus('Bolt closed! Use "Assign Signs" button.');
                    boltMode = false;
                    updateButtonStates();
                } else {
                    updateStatus(`Point (${i},${j}) added`);
                }
                drawGrid();
            } else {
                updateStatus('Invalid! Must be adjacent and make 90° turn');
            }
        }
    } else if (boltPoints.length > 0 && !boltMode) {
        // Check for point selection (rectangle swap)
        if (isNearPoint(x, y) && signs.size > 0) {
            let [i, j] = pointFromCoords(x, y);
            let pointIdx = findPointIndex(i, j);
            if (pointIdx >= 0) {
                if (selectedPoints.includes(pointIdx)) {
                    selectedPoints = selectedPoints.filter(p => p !== pointIdx);
                    updateStatus('Point deselected');
                } else {
                    selectedPoints.push(pointIdx);
                    if (selectedPoints.length === 1) {
                        updateStatus('Select diagonal corner to swap rectangle');
                    } else if (selectedPoints.length === 2) {
                        if (swapRectangle(selectedPoints[0], selectedPoints[1])) {
                            updateStatus('Rectangle swap successful!');
                            selectedPoints = [];
                        } else {
                            updateStatus('Invalid swap - check sign conditions');
                            selectedPoints = [];
                        }
                    }
                }
                drawGrid();
                return;
            }
        }
        
        // Check for edge drag
        let edgeIdx = findEdgeNear(x, y);
        if (edgeIdx >= 0) {
            isDragging = true;
            draggedEdge = edgeIdx;
            dragStartX = x;
            dragStartY = y;
            selectedEdge = edgeIdx;
            canvas.style.cursor = 'grabbing';
            updateStatus('Dragging edge...');
            drawGrid();
        }
    }
});

// Mouse move
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || draggedEdge === null) return;
    
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    let dx = x - dragStartX;
    let dy = y - dragStartY;
    
    let nextIdx = (draggedEdge + 1) % boltPoints.length;
    let [i1, j1] = boltPoints[draggedEdge];
    let [i2, j2] = boltPoints[nextIdx];
    
    if (j1 === j2) {
        // Vertical edge
        let steps = Math.round(dx / cellSize);
        if (steps !== 0) {
            let direction = steps > 0 ? 1 : -1;
            for (let i = 0; i < Math.abs(steps); i++) {
                if (!moveVerticalEdge(draggedEdge, direction)) break;
            }
            dragStartX = x;
            drawGrid();
        }
    } else if (i1 === i2) {
        // Horizontal edge
        let steps = Math.round(dy / cellSize);
        if (steps !== 0) {
            let direction = steps > 0 ? 1 : -1;
            for (let i = 0; i < Math.abs(steps); i++) {
                if (!moveHorizontalEdge(draggedEdge, direction)) break;
            }
            dragStartY = y;
            drawGrid();
        }
    }
});

// Mouse up
canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        draggedEdge = null;
        selectedEdge = null;
        canvas.style.cursor = 'crosshair';
        updateStatus('Edge moved');
        drawGrid();
    }
});

// Mouse leave
canvas.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        draggedEdge = null;
        selectedEdge = null;
        canvas.style.cursor = 'crosshair';
        updateStatus('Drag cancelled');
        drawGrid();
    }
});

// Set grid button
document.getElementById('setGrid').addEventListener('click', () => {
    n = parseInt(document.getElementById('gridN').value);
    m = parseInt(document.getElementById('gridM').value);
    n = Math.max(5, Math.min(20, n));
    m = Math.max(5, Math.min(20, m));
    document.getElementById('gridN').value = n;
    document.getElementById('gridM').value = m;
    resizeCanvas();
    drawGrid();
    updateStatus(`Grid set to ${n} x ${m}`);
});

// Choose domain button
document.getElementById('chooseDomain').addEventListener('click', () => {
    domainMode = !domainMode;
    boltMode = false;
    selectedPoints = [];
    updateButtonStates();
    updateStatus(domainMode ? 'Click cells to toggle domain' : 'Domain mode off');
    drawGrid();
});

// Draw bolt button
document.getElementById('drawBolt').addEventListener('click', () => {
    boltMode = !boltMode;
    domainMode = false;
    selectedPoints = [];
    if (boltMode) {
        clearBolt();
    }
    updateButtonStates();
    updateStatus(boltMode ? 'Click lattice points (90° turns only)' : 'Bolt mode off');
    drawGrid();
});

// Assign signs button
document.getElementById('assignSign').addEventListener('click', () => {
    if (boltPoints.length > 0) {
        let startSign = prompt('Enter starting sign (+ or -):', '+');
        if (startSign === '+' || startSign === '-') {
            assignSignAt(0, startSign);
            updateStatus('Signs assigned');
            drawGrid();
        }
    } else {
        updateStatus('Draw a bolt first!');
    }
});

// Clear all button
document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm('Clear everything?')) {
        clearDomain();
        clearBolt();
        domainMode = false;
        boltMode = false;
        selectedPoints = [];
        isDragging = false;
        draggedEdge = null;
        selectedEdge = null;
        updateButtonStates();
        updateStatus('Cleared');
        drawGrid();
    }
});
