class Solution {
public:
    vector<double> averageOfLevels(TreeNode* root) {
        vector<double> out;
        queue<TreeNode*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            double sum = 0; int k = q.size();
            for (int i = 0; i < k; i++) {
                auto n = q.front(); q.pop();
                sum += n->val;
                if (n->left) q.push(n->left);
                if (n->right) q.push(n->right);
            }
            out.push_back(sum / k);
        }
        return out;
    }
};
