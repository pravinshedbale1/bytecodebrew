var levelOrder = function(root) {
    const out = [];
    let level = root ? [root] : [];
    while (level.length) {
        out.push(level.map((n) => n.val));
        level = level.flatMap((n) => [n.left, n.right]).filter(Boolean);
    }
    return out;
};
