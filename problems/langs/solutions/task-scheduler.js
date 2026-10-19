var leastInterval = function(tasks, n) {
    const f = new Array(26).fill(0);
    for (const c of tasks) f[c.charCodeAt(0) - 65]++;
    const mx = Math.max(...f);
    const cnt = f.filter((x) => x === mx).length;
    return Math.max(tasks.length, (mx - 1) * (n + 1) + cnt);
};
