class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> out;
        queue<TreeNode*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            vector<int> level;
            for (int k = q.size(); k > 0; k--) {
                auto n = q.front(); q.pop();
                level.push_back(n->val);
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
            out.push_back(level);
        }
        return out;
    }
};
