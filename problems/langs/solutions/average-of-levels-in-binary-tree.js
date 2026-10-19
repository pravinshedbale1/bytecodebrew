var averageOfLevels = function(root) {
    const out = [];
    let level = root ? [root] : [];
    while (level.length) {
        out.push(level.reduce((s, n) => s + n.val, 0) / level.length);
        level = level.flatMap((n) => [n.left, n.right]).filter(Boolean);
    }
    return out;
};
