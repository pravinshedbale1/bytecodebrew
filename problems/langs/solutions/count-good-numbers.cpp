class Solution {
    const long long MOD = 1e9 + 7;
    long long power(long long b, long long e) {
        long long r = 1; b %= MOD;
        while (e) { if (e & 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; }
        return r;
    }
public:
    int countGoodNumbers(long long n) {
        return power(5, (n + 1) / 2) * power(4, n / 2) % MOD;
    }
};
