let domainCells = [];
let domainMode = false;

function toggleDomain(i,j){
    let key = pointKey(i,j);
    let idx = domainCells.indexOf(key);
    if (idx>=0) domainCells.splice(idx,1);
    else domainCells.push(key);
}
