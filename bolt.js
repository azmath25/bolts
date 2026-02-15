// BOLT FOREST - CLEAN VERSION
let bolts = [];
let selectedBoltIndex = null;
let boltMode = false;
let currentBolt = null;

function startNewBolt() {
    currentBolt = {
        points: [],
        closed: false,
        signs: new Map()
    };
}

function addBoltPoint(i, j) {
    if (!currentBolt) return false;
    if (currentBolt.closed) return false;
    if (!isPointInDomain(i, j)) return false;
    
    // Check if closing
    if (currentBolt.points.length > 2) {
        let [si, sj] = currentBolt.points[0];
        if (i === si && j === sj) {
            let [pi, pj] = currentBolt.points[currentBolt.points.length - 1];
            if (pi !== i && pj !== j) return false;
            if (pi === i && pj === j) return false;
            
            let [pi2, pj2] = currentBolt.points[currentBolt.points.length - 2];
            if (validTurn([pi2, pj2], [pi, pj], [i, j])) {
                currentBolt.closed = true;
                bolts.push(currentBolt);
                selectedBoltIndex = bolts.length - 1;
                currentBolt = null;
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
    if (pi !== i && pj !== j) return false;
    if (pi === i && pj === j) return false;
    
    if (currentBolt.points.length === 1) {
        currentBolt.points.push([i, j]);
        return true;
    }
    
    let [pi2, pj2] = currentBolt.points[currentBolt.points.length - 2];
    if (validTurn([pi2, pj2], [pi, pj], [i, j])) {
        currentBolt.points.push([i, j]);
        return true;
    }
    
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
    for (let b = 0; b < bolts.length; b++) {
        for (let [pi, pj] of bolts[b].points) {
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
    for (let k = 0; k < bolts[boltIndex].points.length; k++) {
        let [pi, pj] = bolts[boltIndex].points[k];
        if (pi === i && pj === j) return k;
    }
    return -1;
}

//=============================================================================
// EDGE MOVE - COMPLETELY REWRITTEN
//=============================================================================

function moveVerticalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    if (j1 !== j2) return false; // Not vertical
    
    let newJ = j1 + direction;
    
    if (!isPointInDomain(i1, newJ) || !isPointInDomain(i2, newJ)) {
        return false;
    }
    
    bolt.points[edgeIndex][1] = newJ;
    bolt.points[nextIdx][1] = newJ;
    
    rebuildForest();
    return true;
}

function moveHorizontalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    if (i1 !== i2) return false; // Not horizontal
    
    let newI = i1 + direction;
    
    if (!isPointInDomain(newI, j1) || !isPointInDomain(newI, j2)) {
        return false;
    }
    
    bolt.points[edgeIndex][0] = newI;
    bolt.points[nextIdx][0] = newI;
    
    rebuildForest();
    return true;
}

function rebuildForest() {
    // STEP 1: Find all collisions
    let posMap = new Map();
    
    for (let b = 0; b < bolts.length; b++) {
        for (let p = 0; p < bolts[b].points.length; p++) {
            let [i, j] = bolts[b].points[p];
            let key = pointKey(i, j);
            
            if (!posMap.has(key)) {
                posMap.set(key, []);
            }
            
            let sign = bolts[b].signs.get(key) || '';
            posMap.get(key).push({ boltIdx: b, pointIdx: p, sign: sign });
        }
    }
    
    // STEP 2: Process collisions
    let toDelete = new Set();
    
    for (let [key, list] of posMap.entries()) {
        if (list.length === 1) continue;
        
        // Add signs
        let sum = '';
        for (let item of list) {
            sum = addSigns(sum, item.sign);
        }
        
        if (sum === '0') {
            // Delete all
            for (let item of list) {
                toDelete.add(`${item.boltIdx}:${item.pointIdx}`);
            }
        } else {
            // Keep first, delete rest
            for (let i = 1; i < list.length; i++) {
                toDelete.add(`${list[i].boltIdx}:${list[i].pointIdx}`);
            }
        }
    }
    
    // STEP 3: Build new forest
    let newBolts = [];
    
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        
        // Get remaining points IN ORDER
        let keep = [];
        for (let p = 0; p < bolt.points.length; p++) {
            if (!toDelete.has(`${b}:${p}`)) {
                keep.push(p);
            }
        }
        
        if (keep.length < 2) continue;
        
        // Build new bolt with remaining points
        let newPoints = keep.map(idx => [...bolt.points[idx]]);
        
        let newBolt = {
            points: newPoints,
            closed: bolt.closed && keep.length >= 3,
            signs: new Map()
        };
        
        newBolts.push(newBolt);
    }
    
    // STEP 4: Reassign alternating signs
    for (let bolt of newBolts) {
        let sign = '+';
        for (let [i, j] of bolt.points) {
            bolt.signs.set(pointKey(i, j), sign);
            sign = (sign === '+') ? '-' : '+';
        }
    }
    
    // STEP 5: Replace forest
    let oldSel = selectedBoltIndex;
    bolts = newBolts;
    
    if (oldSel >= 0 && oldSel < bolts.length) {
        selectedBoltIndex = oldSel;
    } else if (bolts.length > 0) {
        selectedBoltIndex = 0;
    } else {
        selectedBoltIndex = null;
    }
}

function addSigns(s1, s2) {
    if (!s1 || s1 === '') return s2 || '';
    if (!s2 || s2 === '') return s1 || '';
    if (s1 === '0') return s2;
    if (s2 === '0') return s1;
    if (s1 === '+' && s2 === '-') return '0';
    if (s1 === '-' && s2 === '+') return '0';
    if (s1 === '+' && s2 === '+') return '+';
    if (s1 === '-' && s2 === '-') return '-';
    return s1;
}

//=============================================================================
// RECTANGLE SWAP
//=============================================================================

function swapRectangle(boltIndex, idx1, idx2) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    if (bolt.signs.size === 0) return false;
    
    let [i1, j1] = bolt.points[idx1];
    let [i2, j2] = bolt.points[idx2];
    
    let sign1 = bolt.signs.get(pointKey(i1, j1));
    let sign2 = bolt.signs.get(pointKey(i2, j2));
    
    if (sign1 !== sign2) return false;
    if (i1 === i2 || j1 === j2) return false;
    
    let minI = Math.min(i1, i2);
    let maxI = Math.max(i1, i2);
    let minJ = Math.min(j1, j2);
    let maxJ = Math.max(j1, j2);
    
    if (!isPointInDomain(minI, minJ) || !isPointInDomain(minI, maxJ) ||
        !isPointInDomain(maxI, minJ) || !isPointInDomain(maxI, maxJ)) {
        return false;
    }
    
    let wellOrdered = (i1 < i2 && j1 < j2) || (i1 > i2 && j1 > j2);
    
    if (sign1 === '-' && wellOrdered) {
        bolt.points[idx1] = [i1, j2];
        bolt.points[idx2] = [i2, j1];
        rebuildForest();
        return true;
    }
    
    if (sign1 === '+' && !wellOrdered) {
        bolt.points[idx1] = [minI, minJ];
        bolt.points[idx2] = [maxI, maxJ];
        rebuildForest();
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
