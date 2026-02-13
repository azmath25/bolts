// Utilities for points, keys, and 90° checks
function pointKey(i,j) { return `${i},${j}`; }

function pointsEqual(p1,p2) {
    return p1[0]===p2[0] && p1[1]===p2[1];
}

// Check if vector v1 -> v2 makes 90 or 270 deg with prev vector
function validTurn(pPrev2, pPrev1, pNew) {
    let v1 = [pPrev1[0]-pPrev2[0], pPrev1[1]-pPrev2[1]];
    let v2 = [pNew[0]-pPrev1[0], pNew[1]-pPrev1[1]];
    let dot = v1[0]*v2[0] + v1[1]*v2[1];
    return dot===0;
}

// Sign alternation along an array of points
function assignAlternatingSigns(points, startSign='+') {
    let signs = new Map();
    let sign = startSign;
    for (let [i,j] of points) {
        signs.set(pointKey(i,j), sign);
        sign = (sign==='+') ? '-' : '+';
    }
    return signs;
}
