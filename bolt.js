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
                // Don't turn off boltMode - user can draw another bolt
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
    
    // Rebuild forest after move
    rebuildForestAfterMove(boltIndex);
    
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
    
    // Rebuild forest after move
    rebuildForestAfterMove(boltIndex);
    
    return true;
}

function rebuildForestAfterMove(boltIndex) {
    // This function rebuilds the entire forest after moving an edge
    // Steps:
    // 1. Extract the bolt being modified
    // 2. Find all merged points and handle sign arithmetic
    // 3. Delete points with sign = 0 and reconnect neighbors
    // 4. Find connected components (new bolts)
    // 5. Replace old bolt with new bolts
    
    if (boltIndex < 0 || boltIndex >= bolts.length) return;
    
    let bolt = bolts[boltIndex];
    let hasSign = bolt.signs.size > 0;
    
    // Step 1: Build adjacency structure
    let edges = [];
    for (let k = 0; k < bolt.points.length; k++) {
        let nextIdx = (k + 1) % bolt.points.length;
        if (bolt.closed || k < bolt.points.length - 1) {
            edges.push([k, nextIdx]);
        }
    }
    
    // Step 2: Find merged points (points at same position)
    let mergeGroups = findMergeGroups(bolt.points);
    
    // Step 3: Handle sign arithmetic for merges
    let pointsToDelete = new Set();
    for (let group of mergeGroups) {
        if (group.length > 1 && hasSign) {
            // Calculate combined sign
            let combinedSign = '';
            for (let idx of group) {
                let key = pointKey(bolt.points[idx][0], bolt.points[idx][1]);
                let sign = bolt.signs.get(key) || '';
                combinedSign = addSigns(combinedSign, sign);
            }
            
            // If sign = 0, mark all for deletion
            if (combinedSign === '0') {
                for (let idx of group) {
                    pointsToDelete.add(idx);
                }
            } else {
                // Keep first point with combined sign, delete others
                let keepIdx = group[0];
                let key = pointKey(bolt.points[keepIdx][0], bolt.points[keepIdx][1]);
                bolt.signs.set(key, combinedSign);
                
                for (let i = 1; i < group.length; i++) {
                    pointsToDelete.add(group[i]);
                }
            }
        } else if (group.length > 1) {
            // No signs, just merge (keep first, delete others)
            for (let i = 1; i < group.length; i++) {
                pointsToDelete.add(group[i]);
            }
        }
    }
    
    // Step 4: Build new edge list without deleted points
    let validEdges = [];
    for (let [a, b] of edges) {
        if (!pointsToDelete.has(a) && !pointsToDelete.has(b)) {
            validEdges.push([a, b]);
        }
    }
    
    // Step 5: Reconnect neighbors of deleted points
    for (let delIdx of pointsToDelete) {
        // Find edges connected to this point
        let connectedPoints = [];
        for (let [a, b] of edges) {
            if (a === delIdx) connectedPoints.push(b);
            if (b === delIdx) connectedPoints.push(a);
        }
        
        // Connect its neighbors if both exist and not deleted
        connectedPoints = connectedPoints.filter(p => !pointsToDelete.has(p));
        if (connectedPoints.length === 2) {
            validEdges.push([connectedPoints[0], connectedPoints[1]]);
        }
    }
    
    // Step 6: Remove duplicate edges
    validEdges = removeDuplicateEdges(validEdges);
    
    // Step 7: Find connected components
    let components = findConnectedComponents(bolt.points.length, validEdges, pointsToDelete);
    
    // Step 8: Create new bolts from components
    let newBolts = [];
    for (let component of components) {
        if (component.length < 2) continue; // Skip single points
        
        let newBolt = {
            points: component.map(idx => [...bolt.points[idx]]),
            closed: isComponentClosed(component, validEdges),
            signs: new Map(),
            composite: false
        };
        
        // Copy signs
        if (hasSign) {
            for (let idx of component) {
                let key = pointKey(bolt.points[idx][0], bolt.points[idx][1]);
                if (bolt.signs.has(key)) {
                    newBolt.signs.set(key, bolt.signs.get(key));
                }
            }
        }
        
        newBolt.composite = isComposite(newBolt.points);
        newBolts.push(newBolt);
    }
    
    // Step 9: Replace old bolt with new bolts
    bolts.splice(boltIndex, 1, ...newBolts);
    
    // Update selected index
    if (selectedBoltIndex === boltIndex) {
        selectedBoltIndex = newBolts.length > 0 ? boltIndex : null;
    } else if (selectedBoltIndex > boltIndex) {
        selectedBoltIndex += newBolts.length - 1;
    }
}

function findMergeGroups(points) {
    // Group points by position
    let positionMap = new Map();
    
    for (let i = 0; i < points.length; i++) {
        let key = pointKey(points[i][0], points[i][1]);
        if (!positionMap.has(key)) {
            positionMap.set(key, []);
        }
        positionMap.get(key).push(i);
    }
    
    let groups = [];
    for (let group of positionMap.values()) {
        groups.push(group);
    }
    
    return groups;
}

function removeDuplicateEdges(edges) {
    let seen = new Set();
    let unique = [];
    
    for (let [a, b] of edges) {
        let key1 = `${a}-${b}`;
        let key2 = `${b}-${a}`;
        if (!seen.has(key1) && !seen.has(key2)) {
            seen.add(key1);
            unique.push([a, b]);
        }
    }
    
    return unique;
}

function findConnectedComponents(numPoints, edges, deletedPoints) {
    // Build adjacency list
    let adj = new Map();
    for (let i = 0; i < numPoints; i++) {
        if (!deletedPoints.has(i)) {
            adj.set(i, []);
        }
    }
    
    for (let [a, b] of edges) {
        if (!deletedPoints.has(a) && !deletedPoints.has(b)) {
            adj.get(a).push(b);
            adj.get(b).push(a);
        }
    }
    
    // DFS to find components
    let visited = new Set();
    let components = [];
    
    for (let start of adj.keys()) {
        if (!visited.has(start)) {
            let component = [];
            let stack = [start];
            
            while (stack.length > 0) {
                let node = stack.pop();
                if (visited.has(node)) continue;
                
                visited.add(node);
                component.push(node);
                
                for (let neighbor of adj.get(node)) {
                    if (!visited.has(neighbor)) {
                        stack.push(neighbor);
                    }
                }
            }
            
            components.push(component);
        }
    }
    
    return components;
}

function isComponentClosed(component, edges) {
    // A component is closed if it forms a cycle
    // Check if every vertex has degree 2
    let degree = new Map();
    for (let idx of component) {
        degree.set(idx, 0);
    }
    
    for (let [a, b] of edges) {
        if (component.includes(a) && component.includes(b)) {
            degree.set(a, degree.get(a) + 1);
            degree.set(b, degree.get(b) + 1);
        }
    }
    
    for (let d of degree.values()) {
        if (d !== 2) return false;
    }
    
    return true;
}

function addSigns(sign1, sign2) {
    // Handle empty strings
    if (!sign1 || sign1 === '') return sign2 || '';
    if (!sign2 || sign2 === '') return sign1 || '';
    
    // Handle sign = 0
    if (sign1 === '0') return sign2;
    if (sign2 === '0') return sign1;
    
    // Opposite signs cancel
    if (sign1 === '+' && sign2 === '-') return '0';
    if (sign1 === '-' && sign2 === '+') return '0';
    
    // Same signs stay
    if (sign1 === '+' && sign2 === '+') return '+';
    if (sign1 === '-' && sign2 === '-') return '-';
    
    // Default
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
