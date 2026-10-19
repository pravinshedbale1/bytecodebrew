class Solution {
    unordered_map<Node*, Node*> copies;
public:
    Node* cloneGraph(Node* node) {
        if (!node) return nullptr;
        if (copies.count(node)) return copies[node];
        Node* c = new Node(node->val);
        copies[node] = c;
        for (auto x : node->neighbors) c->neighbors.push_back(cloneGraph(x));
        return c;
    }
};
