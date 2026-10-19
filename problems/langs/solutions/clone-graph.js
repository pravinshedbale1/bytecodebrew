var cloneGraph = function(node) {
    const copies = new Map();
    const clone = (n) => {
        if (copies.has(n)) return copies.get(n);
        const c = new _Node(n.val);
        copies.set(n, c);
        c.neighbors = n.neighbors.map(clone);
        return c;
    };
    return node ? clone(node) : null;
};
