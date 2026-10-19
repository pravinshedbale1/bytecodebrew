class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        int f[26] = {0}, mx = 0, cnt = 0;
        for (char c : tasks) mx = max(mx, ++f[c - 'A']);
        for (int x : f) if (x == mx) cnt++;
        return max((int) tasks.size(), (mx - 1) * (n + 1) + cnt);
    }
};
