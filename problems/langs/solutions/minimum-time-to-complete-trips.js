var minimumTime = function(time, totalTrips) {
    let lo = 1, hi = Math.min(...time) * totalTrips;
    while (lo < hi) {
        const m = Math.floor((lo + hi) / 2);
        let trips = 0;
        for (const t of time) { trips += Math.floor(m / t); if (trips >= totalTrips) break; }
        if (trips >= totalTrips) hi = m; else lo = m + 1;
    }
    return lo;
};
