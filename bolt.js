// Bolt forest - support for multiple bolts
let bolts = []; // Array of bolt objects
let selectedBoltIndex = null;
let boltMode = false;
let currentBolt = null; // Bolt being drawn

// Bolt object structure:
// {
//   points: [[i,j], ...],
//   closed: boolean,
//   signs: Map<pointKey, sign>,
//   composite: boolean // true if 3+ points are collinear
// }

function startNewBolt() {
    currentBolt = {
        points: [],
        closed: false,
        signs: new Map(),
        composite: false
    };
}

function addBoltPoint(i, j) {
    if (!currentBolt) return false;
    if (currentBolt.closed) return false;
    
    // Check if point is in domain
    if (!isPointInDomain(i, j)) return false;
    
    // Check if closing the loop
    if (currentBolt.points.length > 2) {
        let [si, sj] = currentBolt.points[0];
        if (i === si && j === sj) {
            let [pi, pj] = currentBolt.points[currentBolt.points.length - 1];
            // Check if edge is horizontal or vertical
            if (pi !== i && pj !== j) return false;
            if (pi === i && pj === j) return false;
            
            let [pi2, pj2] = currentBolt.points[currentBolt.points.length - 2];
            if (validTurn([pi2, pj2], [pi, pj], [i, j])) {
                currentBolt.closed = true;
                currentBolt.composite = isComposite(currentBolt.points);
                bolts.push(currentBolt);
                selectedBoltIndex = bolts.length - 1;
                currentBolt = null;
                boltMode = false;
                return true;
            }
            return false;
        }
    }
    
    if (currentBolt.points.length === 0) {
        currentBolt.points.push([i, j]);
        return true;
    }
    
    let [pi, pj] = currentBolt.points[currentBolt.points.length - 1];
    
    // Check if edge is horizontal or vertical (not diagonal)
    if (pi !== i && pj !== j) return false;
    
    // Can't be the same point
    if (pi === i && pj === j) return false;
    
    // First edge can go anywhere
    if (currentBolt.points.length === 1) {
        currentBolt.points.push([i, j]);
        return true;
    }
    
    // Check 90° turn
    let [pi2, pj2] = currentBolt.points[currentBolt.points.length - 2];
    if (validTurn([pi2, pj2], [pi, pj], [i, j])) {
        currentBolt.points.push([i, j]);
        return true;
    }
    
    return false;
}

function isComposite(points) {
    // Check if 3+ consecutive points are collinear
    for (let k = 0; k < points.length - 2; k++) {
        let [i1, j1] = points[k];
        let [i2, j2] = points[k + 1];
        let [i3, j3] = points[k + 2];
        
        // Check if all on same row or column
        if ((i1 === i2 && i2 === i3) || (j1 === j2 && j2 === j3)) {
            return true;
        }
    }
    return false;
}

function isPointInDomain(i, j) {
    // A lattice point is in domain if it's a corner of any domain cell
    if (domainCells.includes(pointKey(i - 1, j - 1))) return true;
    if (domainCells.includes(pointKey(i - 1, j))) return true;
    if (domainCells.includes(pointKey(i, j - 1))) return true;
    if (domainCells.includes(pointKey(i, j))) return true;
    return false;
}

function assignSignsToBolt(boltIndex, startSign = '+') {
    if (boltIndex < 0 || boltIndex >= bolts.length) return;
    
    let bolt = bolts[boltIndex];
    bolt.signs.clear();
    
    let sign = startSign;
    for (let [i, j] of bolt.points) {
        bolt.signs.set(pointKey(i, j), sign);
        sign = (sign === '+') ? '-' : '+';
    }
}

function selectBolt(i, j) {
    // Find which bolt contains this point
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        for (let [pi, pj] of bolt.points) {
            if (pi === i && pj === j) {
                selectedBoltIndex = b;
                return b;
            }
        }
    }
    return -1;
}

function findPointInBolt(boltIndex, i, j) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return -1;
    
    let bolt = bolts[boltIndex];
    for (let k = 0; k < bolt.points.length; k++) {
        let [pi, pj] = bolt.points[k];
        if (pi === i && pj === j) return k;
    }
    return -1;
}

function moveVerticalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    // Check if edge is vertical
    if (j1 !== j2) return false;
    
    let newJ = j1 + direction;
    
    // Check if both endpoints would be in domain
    if (!isPointInDomain(i1, newJ) || !isPointInDomain(i2, newJ)) {
        return false;
    }
    
    // Move the edge
    bolt.points[edgeIndex][1] = newJ;
    bolt.points[nextIdx][1] = newJ;
    
    // Check for merges and update signs
    handleMergesAfterDrag(boltIndex);
    
    return true;
}

function moveHorizontalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    // Check if edge is horizontal
    if (i1 !== i2) return false;
    
    let newI = i1 + direction;
    
    // Check if both endpoints would be in domain
    if (!isPointInDomain(newI, j1) || !isPointInDomain(newI, j2)) {
        return false;
    }
    
    // Move the edge
    bolt.points[edgeIndex][0] = newI;
    bolt.points[nextIdx][0] = newI;
    
    // Check for merges and update signs
    handleMergesAfterDrag(boltIndex);
    
    return true;
}

function handleMergesAfterDrag(boltIndex) {
    let bolt = bolts[boltIndex];
    let merged = true;
    
    while (merged) {
        merged = false;
        
        // Check for duplicate points
        for (let k = 0; k < bolt.points.length; k++) {
            for (let m = k + 1; m < bolt.points.length; m++) {
                if (pointsEqual(bolt.points[k], bolt.points[m])) {
                    // Merge signs
                    let key = pointKey(bolt.points[k][0], bolt.points[k][1]);
                    let sign1 = bolt.signs.get(key) || '';
                    let sign2 = bolt.signs.get(pointKey(bolt.points[m][0], bolt.points[m][1])) || '';
                    
                    let newSign = addSigns(sign1, sign2);
                    
                    if (newSign === '0') {
                        // Delete point and connect neighbors
                        deletePointAndReconnect(boltIndex, k);
                        merged = true;
                        break;
                    } else {
                        // Keep point with new sign
                        bolt.signs.set(key, newSign);
                        // Remove duplicate
                        bolt.points.splice(m, 1);
                        merged = true;
                        break;
                    }
                }
            }
            if (merged) break;
        }
    }
}

function addSigns(sign1, sign2) {
    if (sign1 === '+' && sign2 === '-') return '0';
    if (sign1 === '-' && sign2 === '+') return '0';
    if (sign1 === '+' && sign2 === '+') return '+';
    if (sign1 === '-' && sign2 === '-') return '-';
    if (sign1 === '') return sign2;
    if (sign2 === '') return sign1;
    return sign1;
}

function deletePointAndReconnect(boltIndex, pointIndex) {
    let bolt = bolts[boltIndex];
    if (bolt.points.length <= 3) return; // Can't delete if too few points
    
    // Remove the point
    let [i, j] = bolt.points[pointIndex];
    bolt.signs.delete(pointKey(i, j));
    bolt.points.splice(pointIndex, 1);
}

function swapRectangle(boltIndex, pointIdx1, pointIdx2) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    if (bolt.signs.size === 0) return false;
    
    let [i1, j1] = bolt.points[pointIdx1];
    let [i2, j2] = bolt.points[pointIdx2];
    
    let sign1 = bolt.signs.get(pointKey(i1, j1));
    let sign2 = bolt.signs.get(pointKey(i2, j2));
    
    // Both must have same sign
    if (sign1 !== sign2) return false;
    
    // Check if points form a rectangle
    if (i1 === i2 || j1 === j2) return false;
    
    // Get rectangle bounds
    let minI = Math.min(i1, i2);
    let maxI = Math.max(i1, i2);
    let minJ = Math.min(j1, j2);
    let maxJ = Math.max(j1, j2);
    
    // Check all 4 corners in domain
    if (!isPointInDomain(minI, minJ) || !isPointInDomain(minI, maxJ) ||
        !isPointInDomain(maxI, minJ) || !isPointInDomain(maxI, maxJ)) {
        return false;
    }
    
    // Check if well-ordered
    let wellOrdered = (i1 < i2 && j1 < j2) || (i1 > i2 && j1 > j2);
    
    // Case 1: Both NEGATIVE and well-ordered → make non-well-ordered
    if (sign1 === '-' && wellOrdered) {
        // Transform: well-ordered to non-well-ordered
        // (i1,j1) and (i2,j2) → (i1,j2) and (i2,j1)
        bolt.points[pointIdx1] = [i1, j2];
        bolt.points[pointIdx2] = [i2, j1];
        
        // Update signs
        bolt.signs.delete(pointKey(i1, j1));
        bolt.signs.delete(pointKey(i2, j2));
        bolt.signs.set(pointKey(i1, j2), '-');
        bolt.signs.set(pointKey(i2, j1), '-');
        
        return true;
    }
    
    // Case 2: Both POSITIVE and NOT well-ordered → make well-ordered
    if (sign1 === '+' && !wellOrdered) {
        // Transform: non-well-ordered to well-ordered
        bolt.points[pointIdx1] = [minI, minJ];
        bolt.points[pointIdx2] = [maxI, maxJ];
        
        // Update signs
        bolt.signs.delete(pointKey(i1, j1));
        bolt.signs.delete(pointKey(i2, j2));
        bolt.signs.set(pointKey(minI, minJ), '+');
        bolt.signs.set(pointKey(maxI, maxJ), '+');
        
        return true;
    }
    
    return false;
}

function clearAllBolts() {
    bolts = [];
    selectedBoltIndex = null;
    currentBolt = null;
}

function deleteBolt(boltIndex) {
    if (boltIndex >= 0 && boltIndex < bolts.length) {
        bolts.splice(boltIndex, 1);
        if (selectedBoltIndex === boltIndex) {
            selectedBoltIndex = null;
        } else if (selectedBoltIndex > boltIndex) {
            selectedBoltIndex--;
        }
    }
}
