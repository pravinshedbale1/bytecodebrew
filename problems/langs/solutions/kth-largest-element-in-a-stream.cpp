class KthLargest {
    int k;
    priority_queue<int, vector<int>, greater<int>> pq;
public:
    KthLargest(int k, vector<int>& nums) : k(k) { for (int x : nums) add(x); }
    int add(int val) { pq.push(val); if ((int) pq.size() > k) pq.pop(); return pq.top(); }
};
