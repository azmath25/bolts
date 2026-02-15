// Bolt forest - COMPLETE IMPLEMENTATION
// Result is always a forest where each bolt has alternating signs

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
// COMPLETE EDGE MOVE WITH FOREST REBUILD
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
    // Step 1: Find ALL merges across forest
    let mergeMap = findAllMerges();
    
    // Step 2: Process merges with sign arithmetic
    let toDelete = processMerges(mergeMap);
    
    // Step 3: Build new forest from remaining points
    let newBolts = buildNewForest(toDelete);
    
    // Step 4: Reassign alternating signs to ALL bolts
    for (let bolt of newBolts) {
        reassignAlternatingSigns(bolt);
    }
    
    // Step 5: Replace forest
    let oldSelected = selectedBoltIndex >= 0 && selectedBoltIndex < bolts.length ? bolts[selectedBoltIndex] : null;
    bolts = newBolts;
    
    // Try to maintain selection
    if (oldSelected && oldSelected.points.length > 0) {
        let [ri, rj] = oldSelected.points[0];
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
        
        // Add all signs
        let combinedSign = '';
        for (let {sign} of list) {
            combinedSign = addSigns(combinedSign, sign);
        }
        
        if (combinedSign === '0') {
            // Delete ALL
            for (let {b, p} of list) {
                toDelete.add(`${b},${p}`);
            }
        } else {
            // Keep first, delete rest
            for (let i = 0; i < list.length; i++) {
                if (i === 0) {
                    let {b, p} = list[i];
                    bolts[b].signs.set(key, combinedSign);
                } else {
                    let {b, p} = list[i];
                    toDelete.add(`${b},${p}`);
                }
            }
        }
    }
    
    return toDelete;
}

function buildNewForest(toDelete) {
    let newBolts = [];
    
    for (let b = 0; b < bolts.length; b++) {
        let bolt = bolts[b];
        
        // Build edges
        let edges = [];
        for (let p = 0; p < bolt.points.length; p++) {
            let next = (p + 1) % bolt.points.length;
            if (bolt.closed || p < bolt.points.length - 1) {
                let p1Del = toDelete.has(`${b},${p}`);
                let p2Del = toDelete.has(`${b},${next}`);
                
                if (!p1Del && !p2Del) {
                    edges.push([p, next]);
                } else if (p1Del && !p2Del) {
                    let prev = (p - 1 + bolt.points.length) % bolt.points.length;
                    if (!toDelete.has(`${b},${prev}`) && prev !== next) {
                        edges.push([prev, next]);
                    }
                } else if (!p1Del && p2Del) {
                    let next2 = (next + 1) % bolt.points.length;
                    if (!toDelete.has(`${b},${next2}`) && p !== next2) {
                        edges.push([p, next2]);
                    }
                }
            }
        }
        
        // Find components
        let components = findComponents(bolt.points.length, edges, toDelete, b);
        
        // Create bolts with PROPER PATH ORDER
        for (let comp of components) {
            if (comp.length < 2) continue;
            
            // CRITICAL FIX: Order component by following edges!
            let orderedComp = orderComponentByPath(comp, edges);
            
            let newBolt = {
                points: orderedComp.map(idx => [...bolt.points[idx]]),
                closed: isClosedComponent(comp, edges),
                signs: new Map(),
                composite: false
            };
            
            newBolt.composite = isComposite(newBolt.points);
            newBolts.push(newBolt);
        }
    }
    
    return newBolts;
}

// NEW FUNCTION: Order component indices by following the path
function orderComponentByPath(component, edges) {
    if (component.length === 0) return [];
    if (component.length === 1) return component;
    
    // Build adjacency map for this component
    let adj = new Map();
    for (let v of component) {
        adj.set(v, []);
    }
    
    for (let [a, b] of edges) {
        if (component.includes(a) && component.includes(b)) {
            adj.get(a).push(b);
            adj.get(b).push(a);
        }
    }
    
    // Find starting point (vertex with degree 1 for open path, any vertex for closed)
    let start = component[0];
    
    for (let v of component) {
        if (adj.get(v).length === 1) {
            start = v;
            break;
        }
    }
    
    // Traverse path in order
    let ordered = [];
    let visited = new Set();
    let current = start;
    let prev = null;
    
    while (current !== null && !visited.has(current)) {
        visited.add(current);
        ordered.push(current);
        
        // Find next unvisited neighbor
        let next = null;
        for (let neighbor of adj.get(current)) {
            if (neighbor !== prev && !visited.has(neighbor)) {
                next = neighbor;
                break;
            }
        }
        
        prev = current;
        current = next;
    }
    
    return ordered;
}

function findComponents(n, edges, deleted, boltIdx) {
    let valid = [];
    for (let i = 0; i < n; i++) {
        if (!deleted.has(`${boltIdx},${i}`)) {
            valid.push(i);
        }
    }
    
    if (valid.length === 0) return [];
    
    let adj = new Map();
    for (let v of valid) adj.set(v, []);
    
    for (let [a, b] of edges) {
        if (adj.has(a) && adj.has(b)) {
            adj.get(a).push(b);
            adj.get(b).push(a);
        }
    }
    
    let visited = new Set();
    let components = [];
    
    for (let start of valid) {
        if (visited.has(start)) continue;
        
        let comp = [];
        let stack = [start];
        
        while (stack.length > 0) {
            let node = stack.pop();
            if (visited.has(node)) continue;
            
            visited.add(node);
            comp.push(node);
            
            for (let nb of adj.get(node)) {
                if (!visited.has(nb)) stack.push(nb);
            }
        }
        
        components.push(comp);
    }
    
    return components;
}

function isClosedComponent(comp, edges) {
    let deg = new Map();
    for (let v of comp) deg.set(v, 0);
    
    for (let [a, b] of edges) {
        if (comp.includes(a) && comp.includes(b)) {
            deg.set(a, deg.get(a) + 1);
            deg.set(b, deg.get(b) + 1);
        }
    }
    
    for (let d of deg.values()) {
        if (d !== 2) return false;
    }
    
    return comp.length >= 3;
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
