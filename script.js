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
                if (!currentBolt) {
                    // Bolt was just closed, start a new one automatically
                    updateStatus(`Bolt ${selectedBoltIndex + 1} closed! Click to start new bolt.`);
                    startNewBolt(); // Auto-start new bolt
                } else {
                    updateStatus(`Point (${i},${j}) added`);
                }
                drawGrid();
            } else {
                updateStatus('Invalid! Must be in domain, horizontal/vertical, and make 90° turn');
            }
        }
    } else {
        // Check for point selection (for rectangle swap or bolt selection)
        if (isNearPoint(x, y)) {
            let [i, j] = pointFromCoords(x, y);
            let pointInfo = findPointNear(x, y);
            
            if (pointInfo) {
                // Select the bolt
                selectedBoltIndex = pointInfo.boltIndex;
                
                // Check if this is for rectangle swap
                if (bolts[selectedBoltIndex].signs.size > 0) {
                    let existingIdx = selectedPoints.findIndex(
                        sp => sp.boltIndex === pointInfo.boltIndex && sp.pointIndex === pointInfo.pointIndex
                    );
                    
                    if (existingIdx >= 0) {
                        selectedPoints.splice(existingIdx, 1);
                        updateStatus('Point deselected');
                    } else {
                        selectedPoints.push(pointInfo);
                        
                        if (selectedPoints.length === 1) {
                            updateStatus('Select diagonal corner to swap rectangle');
                        } else if (selectedPoints.length === 2) {
                            // Check if both from same bolt
                            if (selectedPoints[0].boltIndex === selectedPoints[1].boltIndex) {
                                if (swapRectangle(
                                    selectedPoints[0].boltIndex,
                                    selectedPoints[0].pointIndex,
                                    selectedPoints[1].pointIndex
                                )) {
                                    updateStatus('Rectangle swap successful!');
                                } else {
                                    updateStatus('Invalid swap - check sign conditions');
                                }
                            } else {
                                updateStatus('Points must be from same bolt');
                            }
                            selectedPoints = [];
                        }
                    }
                } else {
                    updateStatus(`Bolt ${selectedBoltIndex + 1} selected. Use "Assign Signs" button.`);
                }
                
                drawGrid();
                return;
            }
        }
        
        // Check for edge drag
        let edgeInfo = findEdgeNear(x, y);
        if (edgeInfo) {
            isDragging = true;
            draggedEdge = edgeInfo;
            dragStartX = x;
            dragStartY = y;
            selectedEdge = edgeInfo;
            selectedBoltIndex = edgeInfo.boltIndex;
            canvas.style.cursor = 'grabbing';
            updateStatus('Dragging edge...');
            drawGrid();
        }
    }
});

// Mouse move
canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !draggedEdge) return;
    
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    let dx = x - dragStartX;
    let dy = y - dragStartY;
    
    let bolt = bolts[draggedEdge.boltIndex];
    let nextIdx = (draggedEdge.edgeIndex + 1) % bolt.points.length;
    let [i1, j1] = bolt.points[draggedEdge.edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    if (j1 === j2) {
        // Vertical edge
        let steps = Math.round(dx / cellSize);
        if (steps !== 0) {
            let direction = steps > 0 ? 1 : -1;
            for (let i = 0; i < Math.abs(steps); i++) {
                if (!moveVerticalEdge(draggedEdge.boltIndex, draggedEdge.edgeIndex, direction)) break;
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
                if (!moveHorizontalEdge(draggedEdge.boltIndex, draggedEdge.edgeIndex, direction)) break;
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

// Set grid
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

// Choose domain
document.getElementById('chooseDomain').addEventListener('click', () => {
    domainMode = !domainMode;
    boltMode = false;
    selectedPoints = [];
    updateButtonStates();
    updateStatus(domainMode ? 'Click cells to toggle domain' : 'Domain mode off');
    drawGrid();
});

// Draw bolt
document.getElementById('drawBolt').addEventListener('click', () => {
    boltMode = !boltMode;
    domainMode = false;
    selectedPoints = [];
    
    if (boltMode) {
        startNewBolt();
        updateStatus('Click lattice points to draw bolt (90° turns only)');
    } else {
        currentBolt = null;
        updateStatus('Bolt mode off');
    }
    
    updateButtonStates();
    drawGrid();
});

// Assign signs
document.getElementById('assignSign').addEventListener('click', () => {
    if (selectedBoltIndex !== null && selectedBoltIndex >= 0 && selectedBoltIndex < bolts.length) {
        let startSign = prompt('Enter starting sign (+ or -):', '+');
        if (startSign === '+' || startSign === '-') {
            assignSignsToBolt(selectedBoltIndex, startSign);
            updateStatus(`Signs assigned to bolt ${selectedBoltIndex + 1}`);
            drawGrid();
        }
    } else {
        updateStatus('Select a bolt first! Click any point on a bolt.');
    }
});

// Delete bolt
document.getElementById('deleteBolt').addEventListener('click', () => {
    if (selectedBoltIndex !== null && selectedBoltIndex >= 0 && selectedBoltIndex < bolts.length) {
        if (confirm(`Delete bolt ${selectedBoltIndex + 1}?`)) {
            deleteBolt(selectedBoltIndex);
            updateStatus('Bolt deleted');
            drawGrid();
        }
    } else {
        updateStatus('Select a bolt first!');
    }
});

// Clear all
document.getElementById('clearAll').addEventListener('click', () => {
    if (confirm('Clear everything?')) {
        clearDomain();
        clearAllBolts();
        domainMode = false;
        boltMode = false;
        selectedPoints = [];
        selectedEdge = null;
        isDragging = false;
        draggedEdge = null;
        updateButtonStates();
        updateStatus('All cleared');
        drawGrid();
    }
});

// Show bolt info
document.getElementById('boltInfo').addEventListener('click', () => {
    if (bolts.length === 0) {
        updateStatus('No bolts yet');
        return;
    }
    
    let info = `Total bolts: ${bolts.length}\n`;
    for (let i = 0; i < bolts.length; i++) {
        let bolt = bolts[i];
        info += `\nBolt ${i + 1}: ${bolt.points.length} points, `;
        info += bolt.closed ? 'closed' : 'open';
        if (bolt.composite) info += ', composite';
        if (bolt.signs.size > 0) info += `, signed`;
    }
    alert(info);
});
