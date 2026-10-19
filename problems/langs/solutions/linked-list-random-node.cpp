class Solution {
    vector<int> vals;
public:
    Solution(ListNode* head) { for (; head; head = head->next) vals.push_back(head->val); }
    int getRandom() { return vals[rand() % vals.size()]; }
};
