var countGoodNumbers = function(n) {
    const MOD = 1000000007n;
    const power = (b, e) => { let r = 1n; b %= MOD; while (e > 0n) { if (e & 1n) r = r * b % MOD; b = b * b % MOD; e >>= 1n; } return r; };
    const N = BigInt(n);
    return Number(power(5n, (N + 1n) / 2n) * power(4n, N / 2n) % MOD);
};
