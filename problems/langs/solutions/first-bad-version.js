var solution = function(isBadVersion) {
    return function(n) {
        let lo = 1, hi = n;
        while (lo < hi) {
            const m = lo + Math.floor((hi - lo) / 2);
            if (isBadVersion(m)) hi = m; else lo = m + 1;
        }
        return lo;
    };
};
