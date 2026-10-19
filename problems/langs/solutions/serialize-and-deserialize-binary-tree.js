var serialize = function(root) {
    const out = [];
    const go = (n) => { if (!n) { out.push('#'); return; } out.push(n.val); go(n.left); go(n.right); };
    go(root);
    return out.join(',');
};

var deserialize = function(data) {
    const vals = data.split(',');
    let i = 0;
    const go = () => {
        const v = vals[i++];
        if (v === '#') return null;
        const n = new TreeNode(Number(v));
        n.left = go();
        n.right = go();
        return n;
    };
    return go();
};
