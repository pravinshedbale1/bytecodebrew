class BSTIterator {
    constructor(root) { this.st = []; this.pushLeft(root); }
    pushLeft(n) { while (n) { this.st.push(n); n = n.left; } }
    next() { const n = this.st.pop(); this.pushLeft(n.right); return n.val; }
    hasNext() { return this.st.length > 0; }
}
