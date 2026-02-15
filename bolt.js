// Bolt forest - FIXED deletion and reconnection logic
let bolts = [];
let selectedBoltIndex = null;
let boltMode = false;
let currentBolt = null;

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
    
    if (!isPointInDomain(i, j)) return false;
    
    if (currentBolt.points.length > 2) {
        let [si, sj] = currentBolt.points[0];
        if (i === si && j === sj) {
            let [pi, pj] = currentBolt.points[currentBolt.points.length - 1];
            if (pi !== i && pj !== j) return false;
            if (pi === i && pj === j) return false;
            
            let [pi2, pj2] = currentBolt.points[currentBolt.points.length - 2];
            if (validTurn([pi2, pj2], [pi, pj], [i, j])) {
                currentBolt.closed = true;
                currentBolt.composite = isComposite(currentBolt.points);
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

function isComposite(points) {
    for (let k = 0; k < points.length - 2; k++) {
        let [i1, j1] = points[k];
        let [i2, j2] = points[k + 1];
        let [i3, j3] = points[k + 2];
        if ((i1 === i2 && i2 === i3) || (j1 === j2 && j2 === j3)) {
            return true;
        }
    }
    return false;
}

function isPointInDomain(i, j) {
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
// FIXED EDGE MOVE WITH PROPER DELETION
//=============================================================================

function moveVerticalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    if (j1 !== j2) return false;
    
    let newJ = j1 + direction;
    
    if (!isPointInDomain(i1, newJ) || !isPointInDomain(i2, newJ)) {
        return false;
    }
    
    bolt.points[edgeIndex][1] = newJ;
    bolt.points[nextIdx][1] = newJ;
    
    rebuildForestAfterMove();
    return true;
}

function moveHorizontalEdge(boltIndex, edgeIndex, direction) {
    if (boltIndex < 0 || boltIndex >= bolts.length) return false;
    
    let bolt = bolts[boltIndex];
    let nextIdx = (edgeIndex + 1) % bolt.points.length;
    if (!bolt.closed && edgeIndex === bolt.points.length - 1) return false;
    
    let [i1, j1] = bolt.points[edgeIndex];
    let [i2, j2] = bolt.points[nextIdx];
    
    if (i1 !== i2) return false;
    
    let newI = i1 + direction;
    
    if (!isPointInDomain(newI, j1) || !isPointInDomain(newI, j2)) {
        return false;
    }
    
    bolt.points[edgeIndex][0] = newI;
    bolt.points[nextIdx][0] = newI;
    
    rebuildForestAfterMove();
    return true;
}

function rebuildForestAfterMove() {
    // Step 1: Find merges
    let mergeMap = findAllMerges();
    
    // Step 2: Process merges and get points to delete
    let toDelete = processMerges(mergeMap);
    
    // Step 3: Build new forest (FIXED VERSION)
    let newBolts = buildNewForestFixed(toDelete);
    
    // Step 4: Reassign signs
    for (let bolt of newBolts) {
        reassignAlternatingSigns(bolt);
    }
    
    // Step 5: Replace
    let oldSel = selectedBoltIndex >= 0 && selectedBoltIndex < bolts.length ? bolts[selectedBoltIndex] : null;
    bolts = newBolts;
    
    if (oldSel && oldSel.points.length > 0) {
        let [ri, rj] = oldSel.points[0];
        for (let b = 0; b < bolts.length; b++) {
            for (let [pi, pj] of bolts[b].points) {
                if (pi === ri && pj === rj) {
                    selectedBoltIndex = b;
                    return;
                }
            }
        }
    }
    selectedBoltIndex = bolts.length > 0 ? 0 : null;
}

function findAllMerges() {
    let mergeMap = new Map();
    
    for (let b = 0; b < bolts.length; b++) {
        for (let p = 0; p < bolts[b].points.length; p++) {
            let [i, j] = bolts[b].points[p];
            let key = pointKey(i, j);
            let sign = bolts[b].signs.get(key) || '';
            
            if (!mergeMap.has(key)) {
                mergeMap.set(key, []);
            }
            mergeMap.get(key).push({b, p, sign});
        }
    }
    
    return mergeMap;
}

function processMerges(mergeMap) {
    let toDelete = new Set();
    
    for (let [key, list] of mergeMap.entries()) {
        if (list.length <= 1) continue;
        
        let combinedSign = '';
        for (let {sign} of list) {
            combinedSign = addSigns(combinedSign, sign);
        }
        
        if (combinedSign === '0') {
            // Delete ALL points at this position
            for (let {b, p} of list) {
                toDelete.add(`${b},${p}`);
            }
        } else {
            // Keep first, delete rest
            for (let i = 0; i < list.length; i++) {
                if (i === 0) {
                    bolts[list[i].b].signs.set(key, combinedSign);
                } else {
                    toDelete.add(`${list[i].b},${list[i].p}`);
                }
            }
        }
    }
    
    return toDelete;
}

function buildNewForestFixed(toDelete) {
    let newBolts = [];
    
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        
        // Create list of remaining points IN ORDER
        let remaining = [];
        for (let p = 0; p < bolt.points.length; p++) {
            if (!toDelete.has(`${b},${p}`)) {
                remaining.push(p);
            }
        }
        
        if (remaining.length < 2) continue;
        
        // Build adjacency from original bolt structure
        let adj = new Map();
        for (let idx of remaining) {
            adj.set(idx, []);
        }
        
        // Add edges between consecutive remaining points
        for (let i = 0; i < bolt.points.length; i++) {
            if (toDelete.has(`${b},${i}`)) continue;
            
            // Find next non-deleted point
            let nextOrig = (i + 1) % bolt.points.length;
            let searchCount = 0;
            
            while (toDelete.has(`${b},${nextOrig}`) && searchCount < bolt.points.length) {
                nextOrig = (nextOrig + 1) % bolt.points.length;
                searchCount++;
            }
            
            // Add edge if we found a valid next
            if (!toDelete.has(`${b},${nextOrig}`) && i !== nextOrig && searchCount < bolt.points.length) {
                if (bolt.closed || nextOrig > i || (nextOrig < i && i === bolt.points.length - 1)) {
                    adj.get(i).push(nextOrig);
                    adj.get(nextOrig).push(i);
                }
            }
        }
        
        // Find connected components
        let visited = new Set();
        
        for (let start of remaining) {
            if (visited.has(start)) continue;
            
            let component = [];
            let queue = [start];
            
            while (queue.length > 0) {
                let curr = queue.shift();
                if (visited.has(curr)) continue;
                
                visited.add(curr);
                component.push(curr);
                
                for (let neighbor of adj.get(curr)) {
                    if (!visited.has(neighbor)) {
                        queue.push(neighbor);
                    }
                }
            }
            
            if (component.length < 2) continue;
            
            // Order component by path
            let ordered = orderByPath(component, adj, bolt.closed);
            
            let newBolt = {
                points: ordered.map(idx => [...bolt.points[idx]]),
                closed: checkIfClosed(ordered, adj),
                signs: new Map(),
                composite: false
            };
            
            newBolt.composite = isComposite(newBolt.points);
            newBolts.push(newBolt);
        }
    }
    
    return newBolts;
}

function orderByPath(component, adj, wasClosed) {
    if (component.length === 0) return [];
    
    // Find endpoint (degree 1) or start anywhere if closed
    let start = component[0];
    for (let node of component) {
        if (adj.get(node).length === 1) {
            start = node;
            break;
        }
    }
    
    // Follow path
    let ordered = [start];
    let visited = new Set([start]);
    let current = start;
    
    while (ordered.length < component.length) {
        let found = false;
        for (let neighbor of adj.get(current)) {
            if (!visited.has(neighbor)) {
                ordered.push(neighbor);
                visited.add(neighbor);
                current = neighbor;
                found = true;
                break;
            }
        }
        if (!found) break;
    }
    
    return ordered;
}

function checkIfClosed(component, adj) {
    if (component.length < 3) return false;
    
    for (let node of component) {
        if (adj.get(node).length !== 2) {
            return false;
        }
    }
    return true;
}

function reassignAlternatingSigns(bolt) {
    bolt.signs.clear();
    let sign = '+';
    for (let [i, j] of bolt.points) {
        bolt.signs.set(pointKey(i, j), sign);
        sign = (sign === '+') ? '-' : '+';
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
        rebuildForestAfterMove();
        return true;
    }
    
    if (sign1 === '+' && !wellOrdered) {
        bolt.points[idx1] = [minI, minJ];
        bolt.points[idx2] = [maxI, maxJ];
        rebuildForestAfterMove();
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
