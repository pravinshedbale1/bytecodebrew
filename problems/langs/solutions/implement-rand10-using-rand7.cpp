class Solution {
public:
    int rand10() {
        int x;
        do { x = (rand7() - 1) * 7 + rand7(); } while (x > 40);
        return x % 10 + 1;
    }
};
