class Codec {
    TreeNode* build(stringstream& ss) {
        string t;
        getline(ss, t, ',');
        if (t == "#") return nullptr;
        TreeNode* n = new TreeNode(stoi(t));
        n->left = build(ss);
        n->right = build(ss);
        return n;
    }
public:
    string serialize(TreeNode* root) {
        if (!root) return "#";
        return to_string(root->val) + "," + serialize(root->left) + "," + serialize(root->right);
    }
    TreeNode* deserialize(string data) { stringstream ss(data); return build(ss); }
};
