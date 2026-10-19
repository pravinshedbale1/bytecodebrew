var myPow = function(x, n) {
    let e = n;
    if (e < 0) { x = 1 / x; e = -e; }
    let r = 1;
    while (e) { if (e % 2) r *= x; x *= x; e = Math.floor(e / 2); }
    return r;
};
