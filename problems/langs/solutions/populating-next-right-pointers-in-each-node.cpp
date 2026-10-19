class Solution {
public:
    Node* connect(Node* root) {
        for (Node* level = root; level && level->left; level = level->left)
            for (Node* n = level; n; n = n->next) {
                n->left->next = n->right;
                if (n->next) n->right->next = n->next->left;
            }
        return root;
    }
};
