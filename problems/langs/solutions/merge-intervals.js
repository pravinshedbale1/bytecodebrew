var merge = function(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const out = [];
    for (const [s, e] of intervals) {
        if (out.length && out[out.length - 1][1] >= s) out[out.length - 1][1] = Math.max(out[out.length - 1][1], e);
        else out.push([s, e]);
    }
    return out;
};
