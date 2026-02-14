let boltPoints = [];
let boltMode = false;
let signs = new Map();
let boltClosed = false;
let selectedPoints = [];
let selectedEdge = null;

function addBoltPoint(i,j){
    if (boltClosed) return false;
    
    // Check if point is in domain
    if (!isPointInDomain(i, j)) return false;
    
    // Check if closing the loop
    if (boltPoints.length > 2) {
        let [si,sj] = boltPoints[0];
        if (i===si && j===sj) {
            let [pi,pj] = boltPoints[boltPoints.length-1];
            // Check if edge is horizontal or vertical
            if (pi !== i && pj !== j) return false; // diagonal not allowed
            if (pi === i && pj === j) return false; // same point
            
            let [pi2,pj2]=boltPoints[boltPoints.length-2];
            if (validTurn([pi2,pj2],[pi,pj],[i,j])){
                boltMode=false;
                boltClosed=true;
                return true;
            }
            return false;
        }
    }
    
    if (boltPoints.length===0){
        boltPoints.push([i,j]);
        return true;
    }
    
    let [pi,pj] = boltPoints[boltPoints.length-1];
    
    // Check if edge is horizontal or vertical (not diagonal)
    if (pi !== i && pj !== j) return false;
    
    // Can't be the same point
    if (pi === i && pj === j) return false;
    
    // First edge can go anywhere (as long as it's horizontal or vertical)
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
    signs = assignAlternatingSigns(boltPoints, startSign);
}

function isPointInDomain(i, j) {
    // A lattice point (i,j) is in domain if it's a corner of any domain cell
    // Check all 4 possible cells that could have (i,j) as a corner:
    // Cell (i-1, j-1) has corners (i-1,j-1), (i-1,j), (i,j-1), (i,j)
    // Cell (i-1, j) has corners (i-1,j), (i-1,j+1), (i,j), (i,j+1)
    // Cell (i, j-1) has corners (i,j-1), (i,j), (i+1,j-1), (i+1,j)
    // Cell (i, j) has corners (i,j), (i,j+1), (i+1,j), (i+1,j+1)
    
    if (domainCells.includes(pointKey(i-1, j-1))) return true;
    if (domainCells.includes(pointKey(i-1, j))) return true;
    if (domainCells.includes(pointKey(i, j-1))) return true;
    if (domainCells.includes(pointKey(i, j))) return true;
    
    return false;
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
    if (!boltClosed && edgeIndex === boltPoints.length - 1) return false;
    
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
    if (!boltClosed && edgeIndex === boltPoints.length - 1) return false;
    
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
    
    // Both must have same sign
    if (sign1 !== sign2) return false;
    
    // Check if points form a rectangle (not on same row or column)
    if (i1 === i2 || j1 === j2) return false;
    
    // Get rectangle bounds
    let minI = Math.min(i1, i2);
    let maxI = Math.max(i1, i2);
    let minJ = Math.min(j1, j2);
    let maxJ = Math.max(j1, j2);
    
    // Check all 4 corners are in domain
    if (!isPointInDomain(minI, minJ) || !isPointInDomain(minI, maxJ) || 
        !isPointInDomain(maxI, minJ) || !isPointInDomain(maxI, maxJ)) {
        return false;
    }
    
    // Check if well-ordered: each coordinate of one point is larger than the other
    let wellOrdered = (i1 < i2 && j1 < j2) || (i1 > i2 && j1 > j2);
    
    // Case 1: Both NEGATIVE and well-ordered
    if (sign1 === '-' && wellOrdered) {
        // Swap (i1,j1) and (i2,j2) to (i1,j2) and (i2,j1)
        let newPoint1 = [i1, j2];
        let newPoint2 = [i2, j1];
        
        // Update points
        boltPoints[pointIdx1] = newPoint1;
        boltPoints[pointIdx2] = newPoint2;
        
        // Update signs
        signs.delete(pointKey(i1, j1));
        signs.delete(pointKey(i2, j2));
        signs.set(pointKey(newPoint1[0], newPoint1[1]), '-');
        signs.set(pointKey(newPoint2[0], newPoint2[1]), '-');
        
        return true;
    }
    
    // Case 2: Both POSITIVE and NOT well-ordered
    if (sign1 === '+' && !wellOrdered) {
        // Swap (i1,j1) and (i2,j2) to make them well-ordered
        // If i1 < i2 and j1 > j2, swap to (i1,j1) -> (minI,minJ) and (i2,j2) -> (maxI,maxJ)
        let newPoint1 = [minI, minJ];
        let newPoint2 = [maxI, maxJ];
        
        // Update points
        boltPoints[pointIdx1] = newPoint1;
        boltPoints[pointIdx2] = newPoint2;
        
        // Update signs
        signs.delete(pointKey(i1, j1));
        signs.delete(pointKey(i2, j2));
        signs.set(pointKey(newPoint1[0], newPoint1[1]), '+');
        signs.set(pointKey(newPoint2[0], newPoint2[1]), '+');
        
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
