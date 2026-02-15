let domainCells = [];
let domainMode = false;

function toggleDomain(i, j) {
    let key = pointKey(i, j);
    let idx = domainCells.indexOf(key);
    if (idx >= 0) {
        domainCells.splice(idx, 1);
    } else {
        domainCells.push(key);
    }
}

function clearDomain() {
    domainCells = [];
}

function isPointInDomain(i, j) {
    // Point (i,j) is in domain if it's a corner of any domain cell
    if (domainCells.includes(pointKey(i - 1, j - 1))) return true;
    if (domainCells.includes(pointKey(i - 1, j))) return true;
    if (domainCells.includes(pointKey(i, j - 1))) return true;
    if (domainCells.includes(pointKey(i, j))) return true;
    return false;
}
