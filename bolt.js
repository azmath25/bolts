let boltPoints = [];
let boltMode = false;
let signs = new Map();
let boltClosed = false;
let selectedPoints = [];
let selectedEdge = null;
let moveMode = null; // 'edge' or 'rect'

function addBoltPoint(i,j){
    if (boltClosed) return false;
    
    // Check if closing the loop
    if (boltPoints.length > 2) {
        let [si,sj] = boltPoints[0];
        if (i===si && j===sj) {
            let [pi,pj] = boltPoints[boltPoints.length-1];
            let di=i-pi, dj=j-pj;
            if (Math.abs(di)+Math.abs(dj)===1) {
                let [pi2,pj2]=boltPoints[boltPoints.length-2];
                if (validTurn([pi2,pj2],[pi,pj],[i,j])){
                    boltMode=false;
                    boltClosed=true;
                    return true;
                }
            }
            return false;
        }
    }
    
    if (boltPoints.length===0){
        boltPoints.push([i,j]);
        return true;
    }
    
    let [pi,pj] = boltPoints[boltPoints.length-1];
    let di=i-pi, dj=j-pj;
    
    // Must be adjacent
    if (Math.abs(di)+Math.abs(dj)!==1){
        return false;
    }
    
    // First edge can go anywhere adjacent
    if (boltPoints.length===1){
        boltPoints.push([i,j]);
        return true;
    }
    
    // Check 90° or 270° turn
    let [pi2,pj2]=boltPoints[boltPoints.length-2];
    if (validTurn([pi2,pj2],[pi,pj],[i,j])){
        boltPoints.push([i,j]);
        return true;
    }
    
    return false;
}

function assignSignAt(index, startSign='+'){
    signs = assignAlternatingSigns(boltPoints.slice(index).concat(boltPoints.slice(0,index)), startSign);
}

function isPointInDomain(i, j) {
    return domainCells.includes(pointKey(i, j));
}

function findEdgeContainingPoint(i, j) {
    for (let k = 0; k < boltPoints.length; k++) {
        let [i1, j1] = boltPoints[k];
        if (i1 === i && j1 === j) {
            // Check if this point is part of an edge
            if (k < boltPoints.length - 1) {
                return k;
            }
            if (boltClosed && k === boltPoints.length - 1) {
                return k; // Last point connects to first
            }
        }
    }
    return -1;
}

function findPointIndex(i, j) {
    for (let k = 0; k < boltPoints.length; k++) {
        let [pi, pj] = boltPoints[k];
        if (pi === i && pj === j) {
            return k;
        }
    }
    return -1;
}

function moveVerticalEdge(edgeIndex, direction) {
    let nextIdx = (edgeIndex + 1) % boltPoints.length;
    
    let [i1, j1] = boltPoints[edgeIndex];
    let [i2, j2] = boltPoints[nextIdx];
    
    // Check if edge is vertical
    if (j1 !== j2) return false;
    
    let newJ = j1 + direction;
    
    // Check if both endpoints would be in domain
    if (!isPointInDomain(i1, newJ) || !isPointInDomain(i2, newJ)) {
        return false;
    }
    
    // Move the edge
    boltPoints[edgeIndex][1] = newJ;
    boltPoints[nextIdx][1] = newJ;
    
    return true;
}

function moveHorizontalEdge(edgeIndex, direction) {
    let nextIdx = (edgeIndex + 1) % boltPoints.length;
    
    let [i1, j1] = boltPoints[edgeIndex];
    let [i2, j2] = boltPoints[nextIdx];
    
    // Check if edge is horizontal
    if (i1 !== i2) return false;
    
    let newI = i1 + direction;
    
    // Check if both endpoints would be in domain
    if (!isPointInDomain(newI, j1) || !isPointInDomain(newI, j2)) {
        return false;
    }
    
    // Move the edge
    boltPoints[edgeIndex][0] = newI;
    boltPoints[nextIdx][0] = newI;
    
    return true;
}

function swapRectangle(pointIdx1, pointIdx2) {
    if (signs.size === 0) return false;
    
    let [i1, j1] = boltPoints[pointIdx1];
    let [i2, j2] = boltPoints[pointIdx2];
    
    let sign1 = signs.get(pointKey(i1, j1));
    let sign2 = signs.get(pointKey(i2, j2));
    
    // Determine rectangle corners
    let a = Math.min(i1, i2);
    let c = Math.max(i1, i2);
    let b = Math.min(j1, j2);
    let d = Math.max(j1, j2);
    
    if (a >= c || b >= d) return false;
    
    // Check all corners in domain
    if (!isPointInDomain(a, b) || !isPointInDomain(a, d) || 
        !isPointInDomain(c, b) || !isPointInDomain(c, d)) {
        return false;
    }
    
    // Case 3.1: (a,b) and (c,d) both negative
    if (i1 === a && j1 === b && i2 === c && j2 === d && sign1 === '-' && sign2 === '-') {
        boltPoints[pointIdx1] = [a, d];
        boltPoints[pointIdx2] = [c, b];
        // Update signs
        signs.set(pointKey(a, d), '-');
        signs.set(pointKey(c, b), '-');
        signs.delete(pointKey(a, b));
        signs.delete(pointKey(c, d));
        return true;
    }
    
    // Case 3.2: (a,d) and (c,b) both positive
    if (i1 === a && j1 === d && i2 === c && j2 === b && sign1 === '+' && sign2 === '+') {
        boltPoints[pointIdx1] = [a, b];
        boltPoints[pointIdx2] = [c, d];
        // Update signs
        signs.set(pointKey(a, b), '+');
        signs.set(pointKey(c, d), '+');
        signs.delete(pointKey(a, d));
        signs.delete(pointKey(c, b));
        return true;
    }
    
    return false;
}

function clearBolt() {
    boltPoints = [];
    signs.clear();
    boltClosed = false;
    selectedPoints = [];
    selectedEdge = null;
}
