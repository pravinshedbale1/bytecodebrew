var connect = function(root) {
    for (let level = root; level && level.left; level = level.left)
        for (let n = level; n; n = n.next) {
            n.left.next = n.right;
            if (n.next) n.right.next = n.next.left;
        }
    return root;
};
