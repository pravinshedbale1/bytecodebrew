// Pattern: Math for Interviews. Run: java dsa-java/math/MathTopics.java
import java.math.BigInteger;
import java.util.*;

public class MathTopics {
    static final int MOD = 1_000_000_007;

    public static void main(String[] args) {
        var rnd = new Random(3);
        // gcd / lcm
        for (int t = 0; t < 20_000; t++) {
            int a = rnd.nextInt(10_000), b = rnd.nextInt(10_000);
            Check.that(gcd(a, b) == BigInteger.valueOf(a).gcd(BigInteger.valueOf(b)).intValue(), "gcd");
            if (a > 0 && b > 0) Check.that(lcm(a, b) == (long) a * b / gcd(a, b) && lcm(a, b) % a == 0 && lcm(a, b) % b == 0, "lcm");
        }
        // primes
        boolean[] composite = sieve(100_000);
        for (int n = 0; n <= 100_000; n++) {
            boolean p = n >= 2 && !composite[n];
            Check.that(isPrime(n) == p && p == BigInteger.valueOf(n).isProbablePrime(30), "sieve / isPrime");
        }
        Check.that(countPrimes(10) == 4 && countPrimes(100) == 25 && countPrimes(2) == 0, "countPrimes");
        for (int t = 0; t < 5_000; t++) {
            int n = 2 + rnd.nextInt(1_000_000);
            long prod = 1;
            for (int f : primeFactors(n)) { Check.that(isPrime(f), "factor is prime"); prod *= f; }
            Check.that(prod == n, "factors multiply back");
        }
        // fast power, inverse, nCr
        for (int t = 0; t < 20_000; t++) {
            long base = rnd.nextInt(Integer.MAX_VALUE), exp = rnd.nextInt(Integer.MAX_VALUE);
            Check.that(modPow(base, exp, MOD) == BigInteger.valueOf(base).modPow(BigInteger.valueOf(exp), BigInteger.valueOf(MOD)).longValue(), "modPow");
            long a = 1 + rnd.nextInt(MOD - 1);
            Check.that(a * modInverse(a) % MOD == 1, "modInverse");
        }
        Binomial bin = new Binomial(1000);
        for (int n = 0; n <= 60; n++)
            for (int r = 0; r <= n; r++)
                Check.that(bin.nCr(n, r) == binomBig(n, r).mod(BigInteger.valueOf(MOD)).longValue(), "nCr");
        for (int t = 0; t < 2_000; t++) {
            int n = rnd.nextInt(1001), r = rnd.nextInt(n + 1);
            Check.that(bin.nCr(n, r) == binomBig(n, r).mod(BigInteger.valueOf(MOD)).longValue(), "nCr large");
        }
        for (int t = 0; t < 20_000; t++) {
            double x = (rnd.nextDouble() - 0.5) * 4;
            int n = rnd.nextInt(41) - 20;
            if (x == 0 && n < 0) continue;
            double exp = Math.pow(x, n);
            Check.that(Math.abs(myPow(x, n) - exp) <= 1e-9 * Math.max(1, Math.abs(exp)), "myPow");
        }
        Check.that(myPow(2.0, Integer.MIN_VALUE) == 0.0 && myPow(1.0, Integer.MIN_VALUE) == 1.0, "myPow MIN_VALUE");
        // overflow-safe reverse
        for (int t = 0; t < 50_000; t++) {
            int x = rnd.nextInt();
            String s = new StringBuilder(Long.toString(Math.abs((long) x))).reverse().toString();
            long exp = Long.parseLong(s) * (x < 0 ? -1 : 1);
            Check.that(reverse(x) == (exp > Integer.MAX_VALUE || exp < Integer.MIN_VALUE ? 0 : (int) exp), "reverse");
        }
        // trailing zeros of n!
        BigInteger f = BigInteger.ONE;
        for (int n = 1; n <= 300; n++) {
            f = f.multiply(BigInteger.valueOf(n));
            String s = f.toString();
            int z = 0;
            for (int i = s.length() - 1; s.charAt(i) == '0'; i--) z++;
            Check.that(trailingZeroes(n) == z, "trailingZeroes");
        }
        // shuffle and reservoir sampling are uniform
        int[] perms = new int[6];
        for (int t = 0; t < 60_000; t++) {
            int[] a = { 0, 1, 2 };
            shuffle(a, rnd);
            perms[a[0] * 2 + (a[1] > a[2] ? 1 : 0)]++;
        }
        for (int c : perms) Check.that(Math.abs(c - 10_000) < 500, "shuffle uniform");
        int[] picked = new int[10];
        for (int t = 0; t < 100_000; t++) picked[reservoir(List.of(0, 1, 2, 3, 4, 5, 6, 7, 8, 9).iterator(), rnd)]++;
        for (int c : picked) Check.that(Math.abs(c - 10_000) < 500, "reservoir uniform");
        Check.done("math");
    }

    /** Euclid: gcd(a, b) = gcd(b, a mod b). O(log min(a, b)). */
    static int gcd(int a, int b) {
        while (b != 0) { int t = a % b; a = b; b = t; }
        return a;
    }

    static long lcm(int a, int b) { return (long) a / gcd(a, b) * b; }   // divide first: avoids overflow

    /** Trial division up to √n. */
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; (long) d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }

    /** Sieve of Eratosthenes: composite[i] for 0..n. O(n log log n). */
    static boolean[] sieve(int n) {
        boolean[] composite = new boolean[n + 1];
        for (int p = 2; (long) p * p <= n; p++)
            if (!composite[p])
                for (int m = p * p; m <= n; m += p) composite[m] = true;   // smaller multiples were crossed out already
        return composite;
    }

    static int countPrimes(int n) {                    // primes strictly below n
        if (n < 3) return 0;
        boolean[] composite = sieve(n - 1);
        int count = 0;
        for (int i = 2; i < n; i++) if (!composite[i]) count++;
        return count;
    }

    static List<Integer> primeFactors(int n) {
        List<Integer> out = new ArrayList<>();
        for (int d = 2; (long) d * d <= n; d++)
            while (n % d == 0) { out.add(d); n /= d; }
        if (n > 1) out.add(n);                         // what remains is a prime bigger than √(original)
        return out;
    }

    /** Fast exponentiation by squaring: O(log exp) multiplications, everything kept mod m. */
    static long modPow(long base, long exp, long m) {
        long result = 1;
        base %= m;
        while (exp > 0) {
            if ((exp & 1) == 1) result = result * base % m;
            base = base * base % m;
            exp >>= 1;
        }
        return result;
    }

    /** Fermat: a^(p−2) is a's inverse mod a prime p (a not divisible by p). */
    static long modInverse(long a) { return modPow(a, MOD - 2, MOD); }

    /** n choose r mod p in O(1) per query after O(n) precomputation. */
    static class Binomial {
        final long[] fact, inv;
        Binomial(int n) {
            fact = new long[n + 1];
            inv = new long[n + 1];
            fact[0] = 1;
            for (int i = 1; i <= n; i++) fact[i] = fact[i - 1] * i % MOD;
            inv[n] = modInverse(fact[n]);
            for (int i = n; i > 0; i--) inv[i - 1] = inv[i] * i % MOD;       // 1/(i−1)! = i / i!
        }
        long nCr(int n, int r) {
            if (r < 0 || r > n) return 0;
            return fact[n] * inv[r] % MOD * inv[n - r] % MOD;
        }
    }

    /** x^n for doubles, including negative n. Use a long: −Integer.MIN_VALUE overflows an int. */
    static double myPow(double x, int n) {
        long e = n;
        if (e < 0) { x = 1 / x; e = -e; }
        double result = 1;
        while (e > 0) {
            if ((e & 1) == 1) result *= x;
            x *= x;
            e >>= 1;
        }
        return result;
    }

    /** Reverse the digits; return 0 if the result doesn't fit in an int. Checks before multiplying. */
    static int reverse(int x) {
        int r = 0;
        while (x != 0) {
            int d = x % 10;                            // negative for negative x: the sign carries through
            if (r > Integer.MAX_VALUE / 10 || (r == Integer.MAX_VALUE / 10 && d > 7)) return 0;
            if (r < Integer.MIN_VALUE / 10 || (r == Integer.MIN_VALUE / 10 && d < -8)) return 0;
            r = r * 10 + d;
            x /= 10;
        }
        return r;
    }

    /** Zeros at the end of n! = number of factor-5s (there are always more 2s). */
    static int trailingZeroes(int n) {
        int count = 0;
        for (long p = 5; p <= n; p *= 5) count += n / p;   // multiples of 5, of 25 (a second 5), of 125…
        return count;
    }

    /** Fisher–Yates: each of the n! orders is equally likely. */
    static void shuffle(int[] a, Random rnd) {
        for (int i = a.length - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);                // 0..i inclusive — not 0..n−1
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
    }

    /** Pick one item uniformly from a stream of unknown length, in O(1) memory. */
    static int reservoir(Iterator<Integer> stream, Random rnd) {
        int chosen = -1, seen = 0;
        while (stream.hasNext()) {
            int x = stream.next();
            seen++;
            if (rnd.nextInt(seen) == 0) chosen = x;    // keep the new item with probability 1/seen
        }
        return chosen;
    }

    static BigInteger binomBig(int n, int r) {
        BigInteger b = BigInteger.ONE;
        for (int i = 0; i < r; i++) b = b.multiply(BigInteger.valueOf(n - i)).divide(BigInteger.valueOf(i + 1));
        return b;
    }
}

final class Check {
    private static int passed;
    static void that(boolean cond, String what) { if (!cond) throw new AssertionError("FAILED: " + what); passed++; }
    static void done(String name) { System.out.println("✓ " + name + ": " + passed + " checks passed"); }
}
