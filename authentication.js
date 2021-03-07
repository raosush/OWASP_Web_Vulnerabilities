function authenticaterole(role) {
    if(role==='admin'){
        return 1;
    }
    else{
        return -1;
    }
}

module.exports = {
    authenticaterole
}