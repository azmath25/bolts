let boltPoints = [];
let boltMode = false;
let signs = new Map();

function addBoltPoint(i,j){
    if (boltPoints.length===0){
        boltPoints.push([i,j]);
        return true;
    }
    let [pi,pj] = boltPoints[boltPoints.length-1];
    // adjacent check
    let di=i-pi, dj=j-pj;
    if (Math.abs(di)+Math.abs(dj)===1 || boltPoints.length===1){
        boltPoints.push([i,j]);
        return true;
    } else if (boltPoints.length>=2){
        let [pi2,pj2]=boltPoints[boltPoints.length-2];
        if (validTurn([pi2,pj2],[pi,pj],[i,j])){
            boltPoints.push([i,j]);
            return true;
        }
    }
    return false;
}

function closeBoltIfNeeded(i,j){
    let [si,sj] = boltPoints[0];
    if (i===si && j===sj && boltPoints.length>2){
        boltMode=false;
        return true;
    }
    return false;
}

function assignSignAt(index, startSign='+'){
    signs = assignAlternatingSigns(boltPoints.slice(index).concat(boltPoints.slice(0,index)), startSign);
}

// placeholder for moveEdge and swapRect
function moveEdge(edgeIndex, direction, steps=1){
    // implement movement logic respecting domain
}
function swapRectangle(a,b,c,d){
    // implement rectangle swap logic respecting signs
}
