class BSTIterator {
    stack<TreeNode*> st;
    void pushLeft(TreeNode* n) { while (n) { st.push(n); n = n->left; } }
public:
    BSTIterator(TreeNode* root) { pushLeft(root); }
    int next() { auto n = st.top(); st.pop(); pushLeft(n->right); return n->val; }
    bool hasNext() { return !st.empty(); }
};
