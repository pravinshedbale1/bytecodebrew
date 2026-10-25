const r = String.raw;

export default {
  'find-greatest-common-divisor-of-array': {
    pattern: 'Euclid\'s algorithm: gcd(a, b) = gcd(b, a mod b)',
    approaches: [
      {
        level: 'Brute force', name: 'Try every divisor from the smallest value down',
        idea: 'Find the minimum and maximum, then test candidates from `min` downwards; the first that divides both is the GCD.',
        steps: [
          'Find `lo = min(nums)` and `hi = max(nums)`.',
          'For `d` from `lo` down to 1: if `lo % d == 0` and `hi % d == 0`, return `d`.',
        ],
        time: 'O(n + min)', space: 'O(1)',
        why: 'One pass for min/max, then up to `min` trial divisions.',
        code: {
          java: r`class Solution {
    public int findGCD(int[] nums) {
        int lo = Integer.MAX_VALUE, hi = Integer.MIN_VALUE;
        for (int x : nums) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
        for (int d = lo; ; d--)
            if (lo % d == 0 && hi % d == 0) return d;
    }
}`,
          cpp: r`class Solution {
public:
    int findGCD(vector<int>& nums) {
        int lo = *min_element(nums.begin(), nums.end()), hi = *max_element(nums.begin(), nums.end());
        for (int d = lo; ; d--)
            if (lo % d == 0 && hi % d == 0) return d;
    }
};`,
          python: r`class Solution:
    def findGCD(self, nums: List[int]) -> int:
        lo, hi = min(nums), max(nums)
        for d in range(lo, 0, -1):
            if lo % d == 0 and hi % d == 0:
                return d`,
          javascript: r`var findGCD = function(nums) {
    const lo = Math.min(...nums), hi = Math.max(...nums);
    for (let d = lo; ; d--) if (lo % d === 0 && hi % d === 0) return d;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Euclid on min and max',
        idea: 'Any common divisor of `a` and `b` also divides `a mod b`, so `gcd(a, b) = gcd(b, a mod b)`, ending when the remainder is 0.',
        steps: [
          'Find `a = max(nums)`, `b = min(nums)`.',
          'While `b != 0`: `(a, b) = (b, a % b)`.',
          'Return `a`.',
        ],
        time: 'O(n + log(min))', space: 'O(1)',
        why: 'The remainders shrink at least as fast as Fibonacci numbers, so Euclid takes O(log) steps.',
        code: {
          java: r`class Solution {
    public int findGCD(int[] nums) {
        int a = Integer.MIN_VALUE, b = Integer.MAX_VALUE;
        for (int x : nums) { a = Math.max(a, x); b = Math.min(b, x); }
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
public:
    int findGCD(vector<int>& nums) {
        int a = *max_element(nums.begin(), nums.end()), b = *min_element(nums.begin(), nums.end());
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
};`,
          python: r`class Solution:
    def findGCD(self, nums: List[int]) -> int:
        a, b = max(nums), min(nums)
        while b:
            a, b = b, a % b
        return a`,
          javascript: r`var findGCD = function(nums) {
    let a = Math.max(...nums), b = Math.min(...nums);
    while (b !== 0) [a, b] = [b, a % b];
    return a;
};`,
        },
      },
    ],
  },

  'palindrome-number': {
    pattern: 'Digit arithmetic: peel digits with % 10 and / 10, reversing only half',
    approaches: [
      {
        level: 'Brute force', name: 'Compare the decimal string with its reverse',
        idea: 'Turn the number into a string and check that it equals its reverse. The minus sign makes every negative number fail automatically.',
        steps: [
          'Convert `x` to a string `s`.',
          'Return whether `s` equals `s` reversed.',
        ],
        time: 'O(d)', space: 'O(d)',
        why: 'd = number of digits (≤ 10); the string costs O(d) memory, which the follow-up wants to avoid.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(int x) {
        String s = String.valueOf(x);
        return new StringBuilder(s).reverse().toString().equals(s);
    }
}`,
          cpp: r`class Solution {
public:
    bool isPalindrome(int x) {
        string s = to_string(x);
        return equal(s.begin(), s.end(), s.rbegin());
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, x: int) -> bool:
        s = str(x)
        return s == s[::-1]`,
          javascript: r`var isPalindrome = function(x) {
    const s = String(x);
    return s === s.split('').reverse().join('');
};`,
        },
      },
      {
        level: 'Better', name: 'Reverse the whole number',
        idea: 'Build the reversed number digit by digit and compare it with the original. Use a 64-bit value, because reversing a large 32-bit number can exceed the 32-bit range.',
        steps: [
          'If `x < 0`, return false.',
          'Pop digits from a copy (`d = n % 10`, `n /= 10`) and push them onto `rev = rev·10 + d`.',
          'Return `rev == x`.',
        ],
        time: 'O(d)', space: 'O(1)',
        why: 'One pass over the digits, but it needs a wider integer type to be safe.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0) return false;
        long rev = 0;
        for (int n = x; n > 0; n /= 10) rev = rev * 10 + n % 10;
        return rev == x;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0) return false;
        long long rev = 0;
        for (int n = x; n > 0; n /= 10) rev = rev * 10 + n % 10;
        return rev == x;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0:
            return False
        rev, n = 0, x
        while n:
            rev, n = rev * 10 + n % 10, n // 10
        return rev == x`,
          javascript: r`var isPalindrome = function(x) {
    if (x < 0) return false;
    let rev = 0;
    for (let n = x; n > 0; n = Math.floor(n / 10)) rev = rev * 10 + (n % 10);
    return rev === x;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Reverse only the second half',
        idea: 'Pop digits from the end into `rev` until `rev` is at least the remaining front part. Then the halves can be compared directly; no overflow is possible because `rev` holds at most half the digits.',
        steps: [
          'Negative numbers, and positive numbers ending in 0, are not palindromes (0 itself is).',
          'While `x > rev`: `rev = rev·10 + x % 10`; `x /= 10`.',
          'Return `x == rev` (even length) or `x == rev / 10` (odd length: drop the middle digit).',
        ],
        time: 'O(d)', space: 'O(1)',
        why: 'Only half the digits are processed, and everything stays inside 32 bits.',
        code: {
          java: r`class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        return x == rev || x == rev / 10;
    }
}`,
          cpp: r`class Solution {
public:
    bool isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) {
            rev = rev * 10 + x % 10;
            x /= 10;
        }
        return x == rev || x == rev / 10;
    }
};`,
          python: r`class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:
            rev = rev * 10 + x % 10
            x //= 10
        return x == rev or x == rev // 10`,
          javascript: r`var isPalindrome = function(x) {
    if (x < 0 || (x % 10 === 0 && x !== 0)) return false;
    let rev = 0;
    while (x > rev) {
        rev = rev * 10 + (x % 10);
        x = Math.floor(x / 10);
    }
    return x === rev || x === Math.floor(rev / 10);
};`,
        },
      },
    ],
  },

  'count-primes': {
    pattern: 'Sieve of Eratosthenes',
    approaches: [
      {
        level: 'Brute force', name: 'Test every number against every smaller divisor',
        idea: 'For each number from 2 to n − 1, check whether any number between 2 and itself divides it.',
        steps: [
          'For each `i` in `[2, n)`: try every `j` in `[2, i)`; `i` is prime if none divides it.',
          'Count the primes.',
        ],
        time: 'O(n²)', space: 'O(1)',
        why: 'Each prime costs a full scan below it. Hopeless at n = 5·10⁶.',
        timesOut: [5, 'generated'],
        code: {
          java: r`class Solution {
    public int countPrimes(int n) {
        int count = 0;
        for (int i = 2; i < n; i++) {
            boolean prime = true;
            for (int j = 2; j < i && prime; j++) if (i % j == 0) prime = false;
            if (prime) count++;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countPrimes(int n) {
        int count = 0;
        for (int i = 2; i < n; i++) {
            bool prime = true;
            for (int j = 2; j < i && prime; j++) if (i % j == 0) prime = false;
            if (prime) count++;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countPrimes(self, n: int) -> int:
        return sum(all(i % j for j in range(2, i)) for i in range(2, n))`,
          javascript: r`var countPrimes = function(n) {
    let count = 0;
    for (let i = 2; i < n; i++) {
        let prime = true;
        for (let j = 2; j < i && prime; j++) if (i % j === 0) prime = false;
        if (prime) count++;
    }
    return count;
};`,
        },
      },
      {
        level: 'Better', name: 'Trial division up to √i',
        idea: 'If `i` has a divisor, it has one no larger than `√i`. So each number only needs divisors up to its square root.',
        steps: [
          'For each `i` in `[2, n)`: try `j` while `j·j ≤ i`.',
          'Count `i` if no such `j` divides it.',
        ],
        time: 'O(n√n)', space: 'O(1)',
        why: 'Each prime costs √i divisions — still around 10⁹ operations for n = 5·10⁶.',
        timesOut: [5],
        code: {
          java: r`class Solution {
    public int countPrimes(int n) {
        int count = 0;
        for (int i = 2; i < n; i++) {
            boolean prime = true;
            for (int j = 2; j * j <= i && prime; j++) if (i % j == 0) prime = false;
            if (prime) count++;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countPrimes(int n) {
        int count = 0;
        for (int i = 2; i < n; i++) {
            bool prime = true;
            for (int j = 2; j * j <= i && prime; j++) if (i % j == 0) prime = false;
            if (prime) count++;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def countPrimes(self, n: int) -> int:
        return sum(all(i % j for j in range(2, isqrt(i) + 1)) for i in range(2, n))`,
          javascript: r`var countPrimes = function(n) {
    let count = 0;
    for (let i = 2; i < n; i++) {
        let prime = true;
        for (let j = 2; j * j <= i && prime; j++) if (i % j === 0) prime = false;
        if (prime) count++;
    }
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Sieve of Eratosthenes',
        idea: 'Instead of testing numbers, cross out multiples. For each prime `p` (found in increasing order), mark `p², p² + p, …` as composite; smaller multiples were already crossed out by smaller primes.',
        steps: [
          'Make a boolean array `composite[0..n)`.',
          'For `p` from 2 while `p·p < n`: if `p` is not composite, mark every multiple from `p·p` with step `p`.',
          'Count the unmarked numbers in `[2, n)`.',
        ],
        time: 'O(n log log n)', space: 'O(n)',
        why: 'The marking work is n·(1/2 + 1/3 + 1/5 + …) over primes, which sums to n log log n.',
        code: {
          java: r`class Solution {
    public int countPrimes(int n) {
        if (n < 3) return 0;
        boolean[] composite = new boolean[n];
        for (int p = 2; (long) p * p < n; p++)
            if (!composite[p])
                for (int m = p * p; m < n; m += p) composite[m] = true;
        int count = 0;
        for (int i = 2; i < n; i++) if (!composite[i]) count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int countPrimes(int n) {
        if (n < 3) return 0;
        vector<bool> composite(n, false);
        for (long long p = 2; p * p < n; p++)
            if (!composite[p])
                for (long long m = p * p; m < n; m += p) composite[m] = true;
        return count(composite.begin() + 2, composite.end(), false);
    }
};`,
          python: r`class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        prime = bytearray([1]) * n
        prime[0] = prime[1] = 0
        for p in range(2, isqrt(n - 1) + 1):
            if prime[p]:
                prime[p * p::p] = bytes(len(range(p * p, n, p)))
        return sum(prime)`,
          javascript: r`var countPrimes = function(n) {
    if (n < 3) return 0;
    const composite = new Uint8Array(n);
    for (let p = 2; p * p < n; p++)
        if (!composite[p])
            for (let m = p * p; m < n; m += p) composite[m] = 1;
    let count = 0;
    for (let i = 2; i < n; i++) if (!composite[i]) count++;
    return count;
};`,
        },
      },
    ],
  },

  'powx-n': {
    pattern: 'Fast exponentiation by squaring',
    approaches: [
      {
        level: 'Brute force', name: 'Multiply |n| times',
        idea: 'Multiply `x` by itself |n| times, and take the reciprocal when `n` is negative.',
        steps: [
          'Let `m = |n|` as a 64-bit value (|−2³¹| does not fit in an int).',
          'Multiply `result` by `x`, m times.',
          'Return `result`, or `1 / result` if `n < 0`.',
        ],
        time: 'O(|n|)', space: 'O(1)',
        why: 'Up to 2.1·10⁹ multiplications for the extreme exponents.',
        timesOut: [3, 'generated'],
        code: {
          java: r`class Solution {
    public double myPow(double x, int n) {
        long m = Math.abs((long) n);
        double result = 1;
        for (long i = 0; i < m; i++) result *= x;
        return n < 0 ? 1 / result : result;
    }
}`,
          cpp: r`class Solution {
public:
    double myPow(double x, int n) {
        long long m = llabs((long long) n);
        double result = 1;
        for (long long i = 0; i < m; i++) result *= x;
        return n < 0 ? 1 / result : result;
    }
};`,
          python: r`class Solution:
    def myPow(self, x: float, n: int) -> float:
        result = 1.0
        for _ in range(abs(n)):
            result *= x
        return 1 / result if n < 0 else result`,
          javascript: r`var myPow = function(x, n) {
    const m = Math.abs(n);
    let result = 1;
    for (let i = 0; i < m; i++) result *= x;
    return n < 0 ? 1 / result : result;
};`,
        },
      },
      {
        level: 'Better', name: 'Recursive halving',
        idea: '`xⁿ = (x^(n/2))²`, times one extra `x` when `n` is odd. Each call halves the exponent.',
        steps: [
          '`power(x, m)`: 1 if `m == 0`.',
          '`half = power(x, m / 2)`; return `half·half`, times `x` if `m` is odd.',
          'Call it with `m = |n|` (64-bit) and take the reciprocal for negative `n`.',
        ],
        time: 'O(log |n|)', space: 'O(log |n|)',
        why: 'About 31 levels of recursion for any 32-bit exponent.',
        code: {
          java: r`class Solution {
    public double myPow(double x, int n) {
        double p = power(x, Math.abs((long) n));
        return n < 0 ? 1 / p : p;
    }

    private double power(double x, long m) {
        if (m == 0) return 1;
        double half = power(x, m / 2);
        return m % 2 == 0 ? half * half : half * half * x;
    }
}`,
          cpp: r`class Solution {
    double power(double x, long long m) {
        if (m == 0) return 1;
        double half = power(x, m / 2);
        return m % 2 == 0 ? half * half : half * half * x;
    }
public:
    double myPow(double x, int n) {
        double p = power(x, llabs((long long) n));
        return n < 0 ? 1 / p : p;
    }
};`,
          python: r`class Solution:
    def myPow(self, x: float, n: int) -> float:
        def power(m):
            if m == 0:
                return 1.0
            half = power(m // 2)
            return half * half * (x if m % 2 else 1)
        p = power(abs(n))
        return 1 / p if n < 0 else p`,
          javascript: r`var myPow = function(x, n) {
    const power = (m) => {
        if (m === 0) return 1;
        const half = power(Math.floor(m / 2));
        return m % 2 === 0 ? half * half : half * half * x;
    };
    const p = power(Math.abs(n));
    return n < 0 ? 1 / p : p;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Iterative binary exponentiation',
        idea: 'Read the exponent in binary: keep squaring a running base, and multiply it into the result whenever the current bit of the exponent is 1.',
        steps: [
          '`m = |n|` (64-bit); `result = 1`, `base = x`.',
          'While `m > 0`: if `m` is odd, `result *= base`; then `base *= base`, `m /= 2`.',
          'Return `result`, or `1 / result` if `n < 0`.',
        ],
        time: 'O(log |n|)', space: 'O(1)',
        why: 'One squaring per bit of the exponent and no recursion.',
        code: {
          java: r`class Solution {
    public double myPow(double x, int n) {
        long m = Math.abs((long) n);
        double result = 1, base = x;
        while (m > 0) {
            if ((m & 1) == 1) result *= base;
            base *= base;
            m >>= 1;
        }
        return n < 0 ? 1 / result : result;
    }
}`,
          cpp: r`class Solution {
public:
    double myPow(double x, int n) {
        long long m = llabs((long long) n);
        double result = 1, base = x;
        while (m > 0) {
            if (m & 1) result *= base;
            base *= base;
            m >>= 1;
        }
        return n < 0 ? 1 / result : result;
    }
};`,
          python: r`class Solution:
    def myPow(self, x: float, n: int) -> float:
        m, result, base = abs(n), 1.0, x
        while m:
            if m & 1:
                result *= base
            base *= base
            m >>= 1
        return 1 / result if n < 0 else result`,
          javascript: r`var myPow = function(x, n) {
    let m = Math.abs(n), result = 1, base = x;
    while (m > 0) {
        if (m % 2 === 1) result *= base;
        base *= base;
        m = Math.floor(m / 2);
    }
    return n < 0 ? 1 / result : result;
};`,
        },
      },
    ],
  },

  'reverse-integer': {
    pattern: 'Digit popping with an overflow check before each push',
    approaches: [
      {
        level: 'Brute force', name: 'Reverse the digit string, check the range',
        idea: 'Reverse the decimal string of |x|, parse it as a 64-bit number, restore the sign, and return 0 if it falls outside the 32-bit range.',
        steps: [
          'Take the digits of |x| as a string (in 64-bit, since |−2³¹| overflows an int) and reverse it.',
          'Parse, apply the sign, and return 0 if the result is outside `[−2³¹, 2³¹ − 1]`.',
        ],
        time: 'O(d)', space: 'O(d)',
        why: 'd ≤ 10 digits. It breaks the "no 64-bit integers" rule, which is what the next approach fixes.',
        code: {
          java: r`class Solution {
    public int reverse(int x) {
        String digits = new StringBuilder(String.valueOf(Math.abs((long) x))).reverse().toString();
        long v = Long.parseLong(digits) * (x < 0 ? -1 : 1);
        return v < Integer.MIN_VALUE || v > Integer.MAX_VALUE ? 0 : (int) v;
    }
}`,
          cpp: r`class Solution {
public:
    int reverse(int x) {
        string digits = to_string(llabs((long long) x));
        std::reverse(digits.begin(), digits.end());
        long long v = stoll(digits) * (x < 0 ? -1 : 1);
        return v < INT_MIN || v > INT_MAX ? 0 : (int) v;
    }
};`,
          python: r`class Solution:
    def reverse(self, x: int) -> int:
        v = int(str(abs(x))[::-1]) * (-1 if x < 0 else 1)
        return v if -2**31 <= v <= 2**31 - 1 else 0`,
          javascript: r`var reverse = function(x) {
    const v = Number(String(Math.abs(x)).split('').reverse().join('')) * (x < 0 ? -1 : 1);
    return v < -(2 ** 31) || v > 2 ** 31 - 1 ? 0 : v;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Pop and push digits, checking before overflow',
        idea: 'Pop the last digit with `% 10` and push it onto `rev` with `rev·10 + d`. Before pushing, check that `rev·10 + d` would still fit — using only 32-bit comparisons against `MAX / 10` and `MIN / 10`.',
        steps: [
          'While `x != 0`: `d = x % 10` (it keeps the sign of `x`); `x /= 10`.',
          'If `rev > MAX/10`, or `rev == MAX/10` and `d > 7`, return 0. Likewise if `rev < MIN/10`, or `rev == MIN/10` and `d < −8`.',
          '`rev = rev·10 + d`. Return `rev` at the end.',
        ],
        time: 'O(d)', space: 'O(1)',
        why: 'One step per digit and never a value outside 32 bits. Python and JavaScript have no 32-bit overflow, so the same checks are done against the explicit limits.',
        code: {
          java: r`class Solution {
    public int reverse(int x) {
        int rev = 0;
        while (x != 0) {
            int d = x % 10;
            x /= 10;
            if (rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && d > 7)) return 0;
            if (rev < Integer.MIN_VALUE / 10 || (rev == Integer.MIN_VALUE / 10 && d < -8)) return 0;
            rev = rev * 10 + d;
        }
        return rev;
    }
}`,
          cpp: r`class Solution {
public:
    int reverse(int x) {
        int rev = 0;
        while (x != 0) {
            int d = x % 10;
            x /= 10;
            if (rev > INT_MAX / 10 || (rev == INT_MAX / 10 && d > 7)) return 0;
            if (rev < INT_MIN / 10 || (rev == INT_MIN / 10 && d < -8)) return 0;
            rev = rev * 10 + d;
        }
        return rev;
    }
};`,
          python: r`class Solution:
    def reverse(self, x: int) -> int:
        MAX, MIN = 2**31 - 1, -2**31
        sign, x, rev = (-1 if x < 0 else 1), abs(x), 0
        while x:
            d, x = x % 10, x // 10
            if sign > 0 and (rev > MAX // 10 or (rev == MAX // 10 and d > 7)):
                return 0
            if sign < 0 and (rev > -(MIN // 10) or (rev == -(MIN // 10) and d > 8)):
                return 0
            rev = rev * 10 + d
        return sign * rev`,
          javascript: r`var reverse = function(x) {
    const MAX = 2 ** 31 - 1, MIN = -(2 ** 31);
    let rev = 0;
    while (x !== 0) {
        const d = x % 10;
        x = Math.trunc(x / 10);
        if (rev > Math.trunc(MAX / 10) || (rev === Math.trunc(MAX / 10) && d > 7)) return 0;
        if (rev < Math.trunc(MIN / 10) || (rev === Math.trunc(MIN / 10) && d < -8)) return 0;
        rev = rev * 10 + d;
    }
    return rev;
};`,
        },
      },
    ],
  },

  'factorial-trailing-zeroes': {
    pattern: 'Legendre\'s formula: count factors of 5 via n/5 + n/25 + n/125 + …',
    approaches: [
      {
        level: 'Brute force', name: 'Compute n! exactly and count zeros',
        idea: 'Build n! as a big integer and count how many times it ends in 0.',
        steps: [
          'Multiply 1 × 2 × … × n with arbitrary-precision arithmetic (C++: an array of base-10⁹ limbs).',
          'Count trailing zero digits.',
        ],
        time: 'O(n²·log n)', space: 'O(n log n)',
        why: 'n! has about n·log₁₀ n digits and every multiplication touches all of them.',
        code: {
          java: r`import java.math.BigInteger;

class Solution {
    public int trailingZeroes(int n) {
        BigInteger f = BigInteger.ONE;
        for (int i = 2; i <= n; i++) f = f.multiply(BigInteger.valueOf(i));
        String s = f.toString();
        int zeros = 0;
        for (int i = s.length() - 1; i >= 0 && s.charAt(i) == '0'; i--) zeros++;
        return zeros;
    }
}`,
          cpp: r`class Solution {
public:
    int trailingZeroes(int n) {
        const uint32_t BASE = 1000000000;
        vector<uint32_t> limbs{1}; // n! in base 10^9, least significant limb first
        for (int i = 2; i <= n; i++) {
            uint64_t carry = 0;
            for (auto& limb : limbs) {
                uint64_t cur = (uint64_t) limb * i + carry;
                limb = cur % BASE;
                carry = cur / BASE;
            }
            while (carry) { limbs.push_back(carry % BASE); carry /= BASE; }
        }
        int zeros = 0;
        size_t k = 0;
        while (limbs[k] == 0) { zeros += 9; k++; }
        for (uint32_t v = limbs[k]; v % 10 == 0; v /= 10) zeros++;
        return zeros;
    }
};`,
          python: r`class Solution:
    def trailingZeroes(self, n: int) -> int:
        f, zeros = factorial(n), 0
        while f % 10 == 0:
            f //= 10
            zeros += 1
        return zeros`,
          javascript: r`var trailingZeroes = function(n) {
    let f = 1n;
    for (let i = 2n; i <= BigInt(n); i++) f *= i;
    const s = f.toString();
    let zeros = 0;
    for (let i = s.length - 1; i >= 0 && s[i] === '0'; i--) zeros++;
    return zeros;
};`,
        },
      },
      {
        level: 'Better', name: 'Count factors of 5 in each number',
        idea: 'Each trailing zero is a factor 10 = 2 × 5, and factors of 2 are always more plentiful. So count how many 5s divide each of 1..n.',
        steps: [
          'For each `i` from 5 to n (step 5): while `i` is divisible by 5, divide and count.',
          'Return the count.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n/5 numbers, each divided by 5 at most log₅ n times — about n/4 divisions in total.',
        code: {
          java: r`class Solution {
    public int trailingZeroes(int n) {
        int count = 0;
        for (int i = 5; i <= n; i += 5)
            for (int x = i; x % 5 == 0; x /= 5) count++;
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int trailingZeroes(int n) {
        int count = 0;
        for (int i = 5; i <= n; i += 5)
            for (int x = i; x % 5 == 0; x /= 5) count++;
        return count;
    }
};`,
          python: r`class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        for i in range(5, n + 1, 5):
            while i % 5 == 0:
                i //= 5
                count += 1
        return count`,
          javascript: r`var trailingZeroes = function(n) {
    let count = 0;
    for (let i = 5; i <= n; i += 5)
        for (let x = i; x % 5 === 0; x /= 5) count++;
    return count;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Count multiples of 5, 25, 125, …',
        idea: '`n / 5` numbers contribute at least one 5, `n / 25` contribute a second, `n / 125` a third, and so on. Summing those counts gives every factor of 5 exactly once.',
        steps: [
          'While `n > 0`: `n /= 5`; add `n` to the count.',
          'Return the count.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'The loop runs log₅ n times. Dividing `n` itself (instead of growing a power of 5) avoids overflow.',
        code: {
          java: r`class Solution {
    public int trailingZeroes(int n) {
        int count = 0;
        while (n > 0) {
            n /= 5;
            count += n;
        }
        return count;
    }
}`,
          cpp: r`class Solution {
public:
    int trailingZeroes(int n) {
        int count = 0;
        while (n > 0) {
            n /= 5;
            count += n;
        }
        return count;
    }
};`,
          python: r`class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        while n:
            n //= 5
            count += n
        return count`,
          javascript: r`var trailingZeroes = function(n) {
    let count = 0;
    while (n > 0) {
        n = Math.floor(n / 5);
        count += n;
    }
    return count;
};`,
        },
      },
    ],
  },

  'count-good-numbers': {
    pattern: 'Counting principle + fast modular exponentiation',
    approaches: [
      {
        level: 'Brute force', name: 'Multiply position by position',
        idea: 'Each even index has 5 choices and each odd index has 4, independently. Multiply them one position at a time, modulo 10⁹ + 7.',
        steps: [
          'For `i` from 0 to n − 1: multiply by 5 if `i` is even, otherwise by 4 (mod 10⁹ + 7).',
          'Return the product.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'n can be 10¹⁵, so a loop over positions is far too slow.',
        timesOut: [4, 'generated'],
        code: {
          java: r`class Solution {
    public int countGoodNumbers(long n) {
        final long MOD = 1_000_000_007;
        long result = 1;
        for (long i = 0; i < n; i++) result = result * (i % 2 == 0 ? 5 : 4) % MOD;
        return (int) result;
    }
}`,
          cpp: r`class Solution {
public:
    int countGoodNumbers(long long n) {
        const long long MOD = 1'000'000'007;
        long long result = 1;
        for (long long i = 0; i < n; i++) result = result * (i % 2 == 0 ? 5 : 4) % MOD;
        return result;
    }
};`,
          python: r`class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        result = 1
        for i in range(n):
            result = result * (5 if i % 2 == 0 else 4) % MOD
        return result`,
          javascript: r`var countGoodNumbers = function(n) {
    const MOD = 1e9 + 7;
    let result = 1;
    for (let i = 0; i < n; i++) result = (result * (i % 2 === 0 ? 5 : 4)) % MOD;
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: '5^⌈n/2⌉ · 4^⌊n/2⌋ with fast power',
        idea: 'There are ⌈n/2⌉ even indices and ⌊n/2⌋ odd ones, so the answer is `5^⌈n/2⌉ · 4^⌊n/2⌋ mod 10⁹ + 7`. Compute each power by repeated squaring.',
        steps: [
          '`power(b, e)`: square-and-multiply on the bits of `e`, reducing mod 10⁹ + 7 each step.',
          'Return `power(5, (n + 1) / 2) · power(4, n / 2) mod 10⁹ + 7`.',
        ],
        time: 'O(log n)', space: 'O(1)',
        why: 'About 50 squarings for n = 10¹⁵. Products of two values below 10⁹ + 7 need 64 bits; JavaScript uses BigInt because they exceed 2⁵³.',
        code: {
          java: r`class Solution {
    private static final long MOD = 1_000_000_007;

    public int countGoodNumbers(long n) {
        return (int) (power(5, (n + 1) / 2) * power(4, n / 2) % MOD);
    }

    private long power(long base, long e) {
        long result = 1;
        base %= MOD;
        while (e > 0) {
            if ((e & 1) == 1) result = result * base % MOD;
            base = base * base % MOD;
            e >>= 1;
        }
        return result;
    }
}`,
          cpp: r`class Solution {
    static const long long MOD = 1'000'000'007;
    long long power(long long base, long long e) {
        long long result = 1;
        base %= MOD;
        while (e > 0) {
            if (e & 1) result = result * base % MOD;
            base = base * base % MOD;
            e >>= 1;
        }
        return result;
    }
public:
    int countGoodNumbers(long long n) {
        return power(5, (n + 1) / 2) * power(4, n / 2) % MOD;
    }
};`,
          python: r`class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD`,
          javascript: r`var countGoodNumbers = function(n) {
    const MOD = 1000000007n;
    const power = (base, e) => {
        let result = 1n;
        base %= MOD;
        while (e > 0n) {
            if (e & 1n) result = (result * base) % MOD;
            base = (base * base) % MOD;
            e >>= 1n;
        }
        return result;
    };
    const big = BigInt(n);
    return Number((power(5n, (big + 1n) / 2n) * power(4n, big / 2n)) % MOD);
};`,
        },
      },
    ],
  },

  'shuffle-an-array': {
    pattern: 'Fisher–Yates shuffle',
    approaches: [
      {
        level: 'Brute force', name: 'Draw from a shrinking pool',
        idea: 'Copy the values into a pool. Repeatedly pick a random element of the pool, append it to the result and remove it. Every order is equally likely, but removing from the middle of a list costs O(n).',
        steps: [
          'Keep the original array for `reset`.',
          '`shuffle`: copy the array into a list; n times, remove a uniformly random index and append that value.',
          '`reset`: return a copy of the original.',
        ],
        time: 'O(n²)', space: 'O(n)',
        why: 'Each shuffle does n removals, each shifting up to n elements.',
        code: {
          java: r`class Solution {
    private final int[] original;
    private final Random rng = new Random();

    public Solution(int[] nums) {
        original = nums.clone();
    }

    public int[] reset() {
        return original.clone();
    }

    public int[] shuffle() {
        List<Integer> pool = new ArrayList<>();
        for (int x : original) pool.add(x);
        int[] result = new int[original.length];
        for (int i = 0; i < result.length; i++) result[i] = pool.remove(rng.nextInt(pool.size()));
        return result;
    }
}`,
          cpp: r`class Solution {
    vector<int> original;
    mt19937 rng{random_device{}()};
public:
    Solution(vector<int>& nums) : original(nums) {}

    vector<int> reset() {
        return original;
    }

    vector<int> shuffle() {
        vector<int> pool = original, result;
        while (!pool.empty()) {
            int i = uniform_int_distribution<int>(0, pool.size() - 1)(rng);
            result.push_back(pool[i]);
            pool.erase(pool.begin() + i);
        }
        return result;
    }
};`,
          python: r`class Solution:
    def __init__(self, nums: List[int]):
        self.original = list(nums)

    def reset(self) -> List[int]:
        return list(self.original)

    def shuffle(self) -> List[int]:
        pool = list(self.original)
        return [pool.pop(random.randrange(len(pool))) for _ in range(len(self.original))]`,
          javascript: r`var Solution = function(nums) {
    this.original = [...nums];
};

Solution.prototype.reset = function() {
    return [...this.original];
};

Solution.prototype.shuffle = function() {
    const pool = [...this.original], result = [];
    while (pool.length) result.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Fisher–Yates (Knuth) shuffle',
        idea: 'Shuffle a copy in place: for `i` from the end down to 1, swap position `i` with a uniformly random position `j` in `[0, i]`. Each value ends up in each slot with equal probability.',
        steps: [
          'Keep the original array for `reset`.',
          '`shuffle`: copy it; for `i` from n − 1 down to 1, pick `j` uniformly in `[0, i]` and swap `a[i]` with `a[j]`.',
          '`reset`: return a copy of the original.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'n − 1 swaps per shuffle. There are n·(n − 1)·…·1 = n! equally likely choice sequences, one per permutation — so it is exactly uniform. (Picking `j` from the whole array instead is a classic bug that biases the result.)',
        code: {
          java: r`class Solution {
    private final int[] original;
    private final Random rng = new Random();

    public Solution(int[] nums) {
        original = nums.clone();
    }

    public int[] reset() {
        return original.clone();
    }

    public int[] shuffle() {
        int[] a = original.clone();
        for (int i = a.length - 1; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
}`,
          cpp: r`class Solution {
    vector<int> original;
    mt19937 rng{random_device{}()};
public:
    Solution(vector<int>& nums) : original(nums) {}

    vector<int> reset() {
        return original;
    }

    vector<int> shuffle() {
        vector<int> a = original;
        for (int i = (int) a.size() - 1; i > 0; i--) {
            int j = uniform_int_distribution<int>(0, i)(rng);
            swap(a[i], a[j]);
        }
        return a;
    }
};`,
          python: r`class Solution:
    def __init__(self, nums: List[int]):
        self.original = list(nums)

    def reset(self) -> List[int]:
        return list(self.original)

    def shuffle(self) -> List[int]:
        a = list(self.original)
        for i in range(len(a) - 1, 0, -1):
            j = random.randint(0, i)
            a[i], a[j] = a[j], a[i]
        return a`,
          javascript: r`var Solution = function(nums) {
    this.original = [...nums];
};

Solution.prototype.reset = function() {
    return [...this.original];
};

Solution.prototype.shuffle = function() {
    const a = [...this.original];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};`,
        },
      },
    ],
  },

  'linked-list-random-node': {
    pattern: 'Reservoir sampling (pick from a stream of unknown length)',
    approaches: [
      {
        level: 'Brute force', name: 'Copy the values into an array',
        idea: 'Store every value in an array once; each call picks a random index.',
        steps: [
          'Constructor: walk the list and append each value to an array.',
          '`getRandom`: return the value at a uniformly random index.',
        ],
        time: 'O(1)', space: 'O(n)',
        why: 'O(n) to build, then O(1) per call — but it keeps a full copy of the list, which the follow-up rules out.',
        code: {
          java: r`class Solution {
    private final List<Integer> values = new ArrayList<>();
    private final Random rng = new Random();

    public Solution(ListNode head) {
        for (ListNode p = head; p != null; p = p.next) values.add(p.val);
    }

    public int getRandom() {
        return values.get(rng.nextInt(values.size()));
    }
}`,
          cpp: r`class Solution {
    vector<int> values;
    mt19937 rng{random_device{}()};
public:
    Solution(ListNode* head) {
        for (ListNode* p = head; p; p = p->next) values.push_back(p->val);
    }

    int getRandom() {
        return values[uniform_int_distribution<int>(0, values.size() - 1)(rng)];
    }
};`,
          python: r`class Solution:
    def __init__(self, head: Optional[ListNode]):
        self.values = []
        while head:
            self.values.append(head.val)
            head = head.next

    def getRandom(self) -> int:
        return random.choice(self.values)`,
          javascript: r`var Solution = function(head) {
    this.values = [];
    for (let p = head; p; p = p.next) this.values.push(p.val);
};

Solution.prototype.getRandom = function() {
    return this.values[Math.floor(Math.random() * this.values.length)];
};`,
        },
      },
      {
        level: 'Better', name: 'Count once, then walk to a random index',
        idea: 'Keep only the head and the length. Each call picks a random index and walks to it.',
        steps: [
          'Constructor: store `head` and count the nodes.',
          '`getRandom`: pick `k` uniformly in `[0, length)` and step `k` times from the head.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'O(n) per call and O(1) extra space — but it needs the length up front, which a true stream does not give you.',
        code: {
          java: r`class Solution {
    private final ListNode head;
    private final int length;
    private final Random rng = new Random();

    public Solution(ListNode head) {
        this.head = head;
        int n = 0;
        for (ListNode p = head; p != null; p = p.next) n++;
        length = n;
    }

    public int getRandom() {
        ListNode p = head;
        for (int k = rng.nextInt(length); k > 0; k--) p = p.next;
        return p.val;
    }
}`,
          cpp: r`class Solution {
    ListNode* head;
    int length = 0;
    mt19937 rng{random_device{}()};
public:
    Solution(ListNode* head) : head(head) {
        for (ListNode* p = head; p; p = p->next) length++;
    }

    int getRandom() {
        ListNode* p = head;
        for (int k = uniform_int_distribution<int>(0, length - 1)(rng); k > 0; k--) p = p->next;
        return p->val;
    }
};`,
          python: r`class Solution:
    def __init__(self, head: Optional[ListNode]):
        self.head, self.length = head, 0
        while head:
            self.length += 1
            head = head.next

    def getRandom(self) -> int:
        p = self.head
        for _ in range(random.randrange(self.length)):
            p = p.next
        return p.val`,
          javascript: r`var Solution = function(head) {
    this.head = head;
    this.length = 0;
    for (let p = head; p; p = p.next) this.length++;
};

Solution.prototype.getRandom = function() {
    let p = this.head;
    for (let k = Math.floor(Math.random() * this.length); k > 0; k--) p = p.next;
    return p.val;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Reservoir sampling',
        idea: 'Walk the list once; when you reach the i-th node (1-based), make it the current pick with probability 1/i. Node i survives the later nodes with probability `i/(i+1) · (i+1)/(i+2) · … · (n−1)/n`, so every node ends up chosen with probability exactly 1/n.',
        steps: [
          'Constructor: store `head` only.',
          '`getRandom`: for `i = 1, 2, …` over the nodes, replace `result` with the node\'s value when `random(0..i−1) == 0`.',
          'Return `result`.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass per call, O(1) memory, and no need to know the length in advance — the setting the follow-up asks about.',
        code: {
          java: r`class Solution {
    private final ListNode head;
    private final Random rng = new Random();

    public Solution(ListNode head) {
        this.head = head;
    }

    public int getRandom() {
        int result = 0, i = 0;
        for (ListNode p = head; p != null; p = p.next)
            if (rng.nextInt(++i) == 0) result = p.val;
        return result;
    }
}`,
          cpp: r`class Solution {
    ListNode* head;
    mt19937 rng{random_device{}()};
public:
    Solution(ListNode* head) : head(head) {}

    int getRandom() {
        int result = 0, i = 0;
        for (ListNode* p = head; p; p = p->next)
            if (uniform_int_distribution<int>(0, i++)(rng) == 0) result = p->val;
        return result;
    }
};`,
          python: r`class Solution:
    def __init__(self, head: Optional[ListNode]):
        self.head = head

    def getRandom(self) -> int:
        result, i, p = 0, 0, self.head
        while p:
            i += 1
            if random.randrange(i) == 0:
                result = p.val
            p = p.next
        return result`,
          javascript: r`var Solution = function(head) {
    this.head = head;
};

Solution.prototype.getRandom = function() {
    let result = 0, i = 0;
    for (let p = this.head; p; p = p.next)
        if (Math.floor(Math.random() * ++i) === 0) result = p.val;
    return result;
};`,
        },
      },
    ],
  },

  'implement-rand10-using-rand7': {
    pattern: 'Rejection sampling (and recycling the rejected randomness)',
    approaches: [
      {
        level: 'Brute force', name: 'A uniform 1..5 and a fair coin',
        idea: 'Reject 6 and 7 to get a uniform 1..5, and reject 7 to get a fair coin from 1..6 (odd/even). Together they give 10 equally likely outcomes.',
        steps: [
          'Repeat `a = rand7()` until `a ≤ 5`.',
          'Repeat `b = rand7()` until `b ≤ 6`.',
          'Return `a` if `b` is odd, else `a + 5`.',
        ],
        time: 'O(1)', space: 'O(1)',
        why: 'Expected calls to rand7: 7/5 + 7/6 ≈ 2.57. The number of calls is unbounded in the worst case, but each retry is independent, so it ends with probability 1.',
        code: {
          java: r`class Solution extends SolBase {
    public int rand10() {
        int a, b;
        do a = rand7(); while (a > 5);
        do b = rand7(); while (b > 6);
        return b % 2 == 1 ? a : a + 5;
    }
}`,
          cpp: r`class Solution {
public:
    int rand10() {
        int a, b;
        do a = rand7(); while (a > 5);
        do b = rand7(); while (b > 6);
        return b % 2 == 1 ? a : a + 5;
    }
};`,
          python: r`class Solution:
    def rand10(self) -> int:
        a = rand7()
        while a > 5:
            a = rand7()
        b = rand7()
        while b > 6:
            b = rand7()
        return a if b % 2 else a + 5`,
          javascript: r`var rand10 = function() {
    let a, b;
    do a = rand7(); while (a > 5);
    do b = rand7(); while (b > 6);
    return b % 2 === 1 ? a : a + 5;
};`,
        },
      },
      {
        level: 'Better', name: '7 × 7 grid, keep the first 40',
        idea: 'Two calls give a uniform number 1..49 via `(rand7() − 1)·7 + rand7()`. Keep 1..40 (four copies of 1..10) and retry on 41..49.',
        steps: [
          '`v = (rand7() − 1)·7 + rand7()`; uniform in 1..49.',
          'If `v > 40`, retry.',
          'Return `(v − 1) % 10 + 1`.',
        ],
        time: 'O(1)', space: 'O(1)',
        why: 'Each try uses 2 calls and succeeds with probability 40/49, so the expected cost is 2·49/40 ≈ 2.45 calls.',
        code: {
          java: r`class Solution extends SolBase {
    public int rand10() {
        int v;
        do v = (rand7() - 1) * 7 + rand7(); while (v > 40);
        return (v - 1) % 10 + 1;
    }
}`,
          cpp: r`class Solution {
public:
    int rand10() {
        int v;
        do v = (rand7() - 1) * 7 + rand7(); while (v > 40);
        return (v - 1) % 10 + 1;
    }
};`,
          python: r`class Solution:
    def rand10(self) -> int:
        while True:
            v = (rand7() - 1) * 7 + rand7()
            if v <= 40:
                return (v - 1) % 10 + 1`,
          javascript: r`var rand10 = function() {
    let v;
    do v = (rand7() - 1) * 7 + rand7(); while (v > 40);
    return ((v - 1) % 10) + 1;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Rejection sampling that recycles the leftover',
        idea: 'A rejected value is still uniform over what was left: 41..49 is a uniform 1..9. Combine it with another rand7 to get 1..63 (keep 60), then the rejected 61..63 is a uniform 1..3; combine again for 1..21 (keep 20). Only 21 restarts from scratch.',
        steps: [
          '`a = (rand7() − 1)·7 + rand7()` in 1..49; if `a ≤ 40`, return `(a − 1) % 10 + 1`.',
          '`b = (a − 41)·7 + rand7()` in 1..63; if `b ≤ 60`, return `(b − 1) % 10 + 1`.',
          '`c = (b − 61)·7 + rand7()` in 1..21; if `c ≤ 20`, return `(c − 1) % 10 + 1`.',
          'Otherwise start again.',
        ],
        time: 'O(1)', space: 'O(1)',
        why: 'Wasting less randomness lowers the expected cost to about 2.19 calls per result — the lowest of these three schemes.',
        code: {
          java: r`class Solution extends SolBase {
    public int rand10() {
        while (true) {
            int a = (rand7() - 1) * 7 + rand7();   // 1..49
            if (a <= 40) return (a - 1) % 10 + 1;
            int b = (a - 41) * 7 + rand7();       // 1..63
            if (b <= 60) return (b - 1) % 10 + 1;
            int c = (b - 61) * 7 + rand7();       // 1..21
            if (c <= 20) return (c - 1) % 10 + 1;
        }
    }
}`,
          cpp: r`class Solution {
public:
    int rand10() {
        while (true) {
            int a = (rand7() - 1) * 7 + rand7();   // 1..49
            if (a <= 40) return (a - 1) % 10 + 1;
            int b = (a - 41) * 7 + rand7();       // 1..63
            if (b <= 60) return (b - 1) % 10 + 1;
            int c = (b - 61) * 7 + rand7();       // 1..21
            if (c <= 20) return (c - 1) % 10 + 1;
        }
    }
};`,
          python: r`class Solution:
    def rand10(self) -> int:
        while True:
            a = (rand7() - 1) * 7 + rand7()   # 1..49
            if a <= 40:
                return (a - 1) % 10 + 1
            b = (a - 41) * 7 + rand7()       # 1..63
            if b <= 60:
                return (b - 1) % 10 + 1
            c = (b - 61) * 7 + rand7()       # 1..21
            if c <= 20:
                return (c - 1) % 10 + 1`,
          javascript: r`var rand10 = function() {
    while (true) {
        const a = (rand7() - 1) * 7 + rand7();   // 1..49
        if (a <= 40) return ((a - 1) % 10) + 1;
        const b = (a - 41) * 7 + rand7();       // 1..63
        if (b <= 60) return ((b - 1) % 10) + 1;
        const c = (b - 61) * 7 + rand7();       // 1..21
        if (c <= 20) return ((c - 1) % 10) + 1;
    }
};`,
        },
      },
    ],
  },
  'plus-one': {
    pattern: 'Grade-school addition with a carry, right to left',
    approaches: [
      {
        level: 'Brute force', name: 'Convert to a number and back',
        idea: 'Turn the digits into an integer, add one, and split the result back into digits.',
        steps: [
          'Build the integer by `value = value · 10 + digit` for each digit.',
          'Add 1 and convert back into a digit array.',
        ],
        time: 'O(n)', space: 'O(n)',
        why: 'It only works while the number fits in a 64-bit integer (about 18 digits). With up to 100 digits it overflows, so it fails the long test in Java, C++ and JavaScript; Python\'s unbounded integers hide the problem, which an interviewer will point out.',
        code: {
          java: r`class Solution {
    public int[] plusOne(int[] digits) {
        long value = 0;
        for (int d : digits) value = value * 10 + d;
        String s = Long.toString(value + 1);
        int[] out = new int[s.length()];
        for (int i = 0; i < out.length; i++) out[i] = s.charAt(i) - '0';
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        long long value = 0;
        for (int d : digits) value = value * 10 + d;
        string s = to_string(value + 1);
        vector<int> out;
        for (char c : s) out.push_back(c - '0');
        return out;
    }
};`,
          python: r`class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        value = int("".join(map(str, digits)))
        return [int(c) for c in str(value + 1)]`,
          javascript: r`var plusOne = function(digits) {
    let value = 0;
    for (const d of digits) value = value * 10 + d;
    return String(value + 1).split("").map(Number);
};`,
        },
        timesOut: [6],
      },
      {
        level: 'Optimal', name: 'Carry from the last digit',
        idea: 'Add one at the end. A digit below 9 absorbs it and you stop; a 9 becomes 0 and the carry moves left.',
        steps: [
          'For `i` from the last index down to 0: if `digits[i] < 9`, increment it and return `digits`.',
          'Otherwise set `digits[i] = 0` and continue left.',
          'If the loop finishes, every digit was 9: return a new array `[1, 0, 0, …, 0]` one longer.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Usually only the last digit changes; the worst case is all 9s, which walks the whole array. Extra space is O(1) except in that one case, where a new array is unavoidable.',
        code: {
          java: r`class Solution {
    public int[] plusOne(int[] digits) {
        for (int i = digits.length - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        int[] out = new int[digits.length + 1];
        out[0] = 1;
        return out;
    }
}`,
          cpp: r`class Solution {
public:
    vector<int> plusOne(vector<int>& digits) {
        for (int i = (int) digits.size() - 1; i >= 0; i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        digits.insert(digits.begin(), 1);
        return digits;
    }
};`,
          python: r`class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits`,
          javascript: r`var plusOne = function(digits) {
    for (let i = digits.length - 1; i >= 0; i--) {
        if (digits[i] < 9) { digits[i]++; return digits; }
        digits[i] = 0;
    }
    return [1, ...digits];
};`,
        },
      },
    ],
  },
  'roman-to-integer': {
    pattern: 'Single pass: subtract a value when the next one is larger',
    approaches: [
      {
        level: 'Better', name: 'Match subtractive pairs first',
        idea: 'At each position, check whether the next two characters form one of the six subtractive pairs; if so take the pair, otherwise take the single symbol.',
        steps: [
          'Keep a map with the seven symbols and the six pairs (IV, IX, XL, XC, CD, CM).',
          'At index `i`, if `s[i..i + 1]` is a pair, add its value and move two places; otherwise add `s[i]`\'s value and move one.',
          'Return the total.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'Each character is consumed once and the tables have a fixed size. It mirrors the rules exactly, at the cost of listing the six pairs.',
        code: {
          java: r`class Solution {
    public int romanToInt(String s) {
        Map<String, Integer> v = Map.ofEntries(
            Map.entry("I", 1), Map.entry("V", 5), Map.entry("X", 10), Map.entry("L", 50), Map.entry("C", 100), Map.entry("D", 500), Map.entry("M", 1000),
            Map.entry("IV", 4), Map.entry("IX", 9), Map.entry("XL", 40), Map.entry("XC", 90), Map.entry("CD", 400), Map.entry("CM", 900));
        int total = 0, i = 0;
        while (i < s.length()) {
            if (i + 1 < s.length() && v.containsKey(s.substring(i, i + 2))) { total += v.get(s.substring(i, i + 2)); i += 2; }
            else { total += v.get(s.substring(i, i + 1)); i++; }
        }
        return total;
    }
}`,
          cpp: r`class Solution {
public:
    int romanToInt(string s) {
        unordered_map<string, int> v = {{"I", 1}, {"V", 5}, {"X", 10}, {"L", 50}, {"C", 100}, {"D", 500}, {"M", 1000},
                                        {"IV", 4}, {"IX", 9}, {"XL", 40}, {"XC", 90}, {"CD", 400}, {"CM", 900}};
        int total = 0;
        size_t i = 0;
        while (i < s.size()) {
            if (i + 1 < s.size() && v.count(s.substr(i, 2))) { total += v[s.substr(i, 2)]; i += 2; }
            else { total += v[s.substr(i, 1)]; i++; }
        }
        return total;
    }
};`,
          python: r`class Solution:
    def romanToInt(self, s: str) -> int:
        v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000,
             'IV': 4, 'IX': 9, 'XL': 40, 'XC': 90, 'CD': 400, 'CM': 900}
        total, i = 0, 0
        while i < len(s):
            if s[i:i + 2] in v and i + 1 < len(s):
                total += v[s[i:i + 2]]
                i += 2
            else:
                total += v[s[i]]
                i += 1
        return total`,
          javascript: r`var romanToInt = function(s) {
    const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000, IV: 4, IX: 9, XL: 40, XC: 90, CD: 400, CM: 900 };
    let total = 0, i = 0;
    while (i < s.length) {
        const pair = s.slice(i, i + 2);
        if (pair.length === 2 && v[pair] !== undefined) { total += v[pair]; i += 2; }
        else { total += v[s[i]]; i++; }
    }
    return total;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Compare with the next symbol',
        idea: 'In a valid numeral, a symbol is subtracted exactly when a larger symbol follows it. So add each value, or subtract it if the next one is bigger.',
        steps: [
          'For each index `i`, look up `v = value(s[i])`.',
          'If `i + 1 < n` and `v < value(s[i + 1])`, subtract `v`; otherwise add it.',
          'Return the total.',
        ],
        time: 'O(n)', space: 'O(1)',
        why: 'One pass with a constant-time lookup per symbol, and no list of special pairs to remember: the six subtractive forms all follow from the single rule.',
        code: {
          java: r`class Solution {
    public int romanToInt(String s) {
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = val(s.charAt(i));
            if (i + 1 < s.length() && v < val(s.charAt(i + 1))) total -= v; else total += v;
        }
        return total;
    }
    private int val(char c) {
        switch (c) {
            case 'I': return 1; case 'V': return 5; case 'X': return 10; case 'L': return 50;
            case 'C': return 100; case 'D': return 500; default: return 1000;
        }
    }
}`,
          cpp: r`class Solution {
    int val(char c) {
        switch (c) {
            case 'I': return 1; case 'V': return 5; case 'X': return 10; case 'L': return 50;
            case 'C': return 100; case 'D': return 500; default: return 1000;
        }
    }
public:
    int romanToInt(string s) {
        int total = 0;
        for (size_t i = 0; i < s.size(); i++) {
            int v = val(s[i]);
            if (i + 1 < s.size() && v < val(s[i + 1])) total -= v; else total += v;
        }
        return total;
    }
};`,
          python: r`class Solution:
    def romanToInt(self, s: str) -> int:
        v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
        total = 0
        for i, c in enumerate(s):
            if i + 1 < len(s) and v[c] < v[s[i + 1]]:
                total -= v[c]
            else:
                total += v[c]
        return total`,
          javascript: r`var romanToInt = function(s) {
    const v = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let total = 0;
    for (let i = 0; i < s.length; i++) {
        if (i + 1 < s.length && v[s[i]] < v[s[i + 1]]) total -= v[s[i]];
        else total += v[s[i]];
    }
    return total;
};`,
        },
      },
    ],
  },
  'excel-sheet-column-title': {
    pattern: 'Bijective base-26 conversion (subtract 1 before each digit)',
    approaches: [
      {
        level: 'Brute force', name: 'Count up through titles',
        idea: 'Start from "A" and increment the title like an odometer (Z rolls over to A with a carry) `columnNumber − 1` times.',
        steps: [
          'Keep the title as a list of letters, starting with ["A"].',
          'To increment, turn trailing Zs into As and bump the letter before them, or add an "A" in front if all were Z.',
          'Repeat `columnNumber − 1` times and return the title.',
        ],
        time: 'O(n · log n)', space: 'O(log n)',
        why: 'n increments, each touching O(log₂₆ n) letters in the worst case. For columnNumber near 2³¹ that is about 2 · 10⁹ steps, so it times out on the large test.',
        code: {
          java: r`class Solution {
    public String convertToTitle(int columnNumber) {
        StringBuilder t = new StringBuilder("A");
        for (int k = 1; k < columnNumber; k++) {
            int i = t.length() - 1;
            while (i >= 0 && t.charAt(i) == 'Z') { t.setCharAt(i, 'A'); i--; }
            if (i < 0) t.insert(0, 'A'); else t.setCharAt(i, (char) (t.charAt(i) + 1));
        }
        return t.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string convertToTitle(int columnNumber) {
        string t = "A";
        for (int k = 1; k < columnNumber; k++) {
            int i = (int) t.size() - 1;
            while (i >= 0 && t[i] == 'Z') { t[i] = 'A'; i--; }
            if (i < 0) t.insert(t.begin(), 'A'); else t[i]++;
        }
        return t;
    }
};`,
          python: r`class Solution:
    def convertToTitle(self, columnNumber: int) -> str:
        t = ['A']
        for _ in range(columnNumber - 1):
            i = len(t) - 1
            while i >= 0 and t[i] == 'Z':
                t[i] = 'A'
                i -= 1
            if i < 0:
                t.insert(0, 'A')
            else:
                t[i] = chr(ord(t[i]) + 1)
        return "".join(t)`,
          javascript: r`var convertToTitle = function(columnNumber) {
    const t = ["A"];
    for (let k = 1; k < columnNumber; k++) {
        let i = t.length - 1;
        while (i >= 0 && t[i] === "Z") { t[i] = "A"; i--; }
        if (i < 0) t.unshift("A"); else t[i] = String.fromCharCode(t[i].charCodeAt(0) + 1);
    }
    return t.join("");
};`,
        },
        timesOut: [6, 'generated'],
      },
      {
        level: 'Optimal', name: 'Repeated (n − 1) % 26',
        idea: 'Titles are base 26 with digits 1..26 instead of 0..25. Subtracting 1 first maps the last letter onto 0..25; then divide and repeat for the next letter.',
        steps: [
          'While `n > 0`: set `n = n − 1`.',
          'Append the letter `"A" + n % 26`, then set `n = n / 26`.',
          'Reverse the letters and return them.',
        ],
        time: 'O(log n)', space: 'O(log n)',
        why: 'One letter per base-26 digit, so at most 7 letters for 2³¹ − 1. Forgetting the "− 1" is the classic bug: 26 would become "A@" instead of "Z".',
        code: {
          java: r`class Solution {
    public String convertToTitle(int columnNumber) {
        StringBuilder sb = new StringBuilder();
        while (columnNumber > 0) {
            columnNumber--;
            sb.append((char) ('A' + columnNumber % 26));
            columnNumber /= 26;
        }
        return sb.reverse().toString();
    }
}`,
          cpp: r`class Solution {
public:
    string convertToTitle(int columnNumber) {
        string s;
        while (columnNumber > 0) {
            columnNumber--;
            s += (char) ('A' + columnNumber % 26);
            columnNumber /= 26;
        }
        reverse(s.begin(), s.end());
        return s;
    }
};`,
          python: r`class Solution:
    def convertToTitle(self, columnNumber: int) -> str:
        out = []
        while columnNumber > 0:
            columnNumber -= 1
            out.append(chr(ord('A') + columnNumber % 26))
            columnNumber //= 26
        return "".join(reversed(out))`,
          javascript: r`var convertToTitle = function(columnNumber) {
    let s = "";
    while (columnNumber > 0) {
        columnNumber--;
        s = String.fromCharCode(65 + (columnNumber % 26)) + s;
        columnNumber = Math.floor(columnNumber / 26);
    }
    return s;
};`,
        },
      },
    ],
  },
  'greatest-common-divisor-of-strings': {
    pattern: 'String periodicity: concatenation check + numeric gcd',
    approaches: [
      {
        level: 'Brute force', name: 'Try every prefix length from longest',
        idea: 'Any common divisor is a prefix of both strings whose length divides both lengths. Try lengths from the shorter length downwards and return the first that divides both.',
        steps: [
          'For `len` from `min(m, n)` down to 1, skip it unless it divides both `m` and `n`.',
          'Let `t = str1[0..len)`; check that repeating `t` gives `str1` and gives `str2`.',
          'Return the first `t` that works, or "".',
        ],
        time: 'O(min(m, n) · (m + n))', space: 'O(m + n)',
        why: 'Up to min(m, n) candidates, each checked in linear time (in practice only divisors of both lengths are checked, which is far fewer).',
        code: {
          java: r`class Solution {
    public String gcdOfStrings(String str1, String str2) {
        int m = str1.length(), n = str2.length();
        for (int len = Math.min(m, n); len >= 1; len--) {
            if (m % len != 0 || n % len != 0) continue;
            String t = str1.substring(0, len);
            if (t.repeat(m / len).equals(str1) && t.repeat(n / len).equals(str2)) return t;
        }
        return "";
    }
}`,
          cpp: r`class Solution {
    bool repeats(const string& s, const string& t) {
        if (s.size() % t.size()) return false;
        for (size_t i = 0; i < s.size(); i++) if (s[i] != t[i % t.size()]) return false;
        return true;
    }
public:
    string gcdOfStrings(string str1, string str2) {
        for (int len = min(str1.size(), str2.size()); len >= 1; len--) {
            string t = str1.substr(0, len);
            if (repeats(str1, t) && repeats(str2, t)) return t;
        }
        return "";
    }
};`,
          python: r`class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        m, n = len(str1), len(str2)
        for length in range(min(m, n), 0, -1):
            if m % length or n % length:
                continue
            t = str1[:length]
            if t * (m // length) == str1 and t * (n // length) == str2:
                return t
        return ""`,
          javascript: r`var gcdOfStrings = function(str1, str2) {
    const m = str1.length, n = str2.length;
    for (let len = Math.min(m, n); len >= 1; len--) {
        if (m % len !== 0 || n % len !== 0) continue;
        const t = str1.slice(0, len);
        if (t.repeat(m / len) === str1 && t.repeat(n / len) === str2) return t;
    }
    return "";
};`,
        },
      },
      {
        level: 'Optimal', name: 'str1 + str2 == str2 + str1, then gcd of lengths',
        idea: 'Both strings are repetitions of one common block exactly when the two concatenations are equal. When they are, the largest such block has length gcd(m, n).',
        steps: [
          'If `str1 + str2 != str2 + str1`, return "".',
          'Compute `g = gcd(m, n)` with Euclid.',
          'Return `str1[0..g)`.',
        ],
        time: 'O(m + n)', space: 'O(m + n)',
        why: 'The concatenation check is linear and Euclid is logarithmic. If both strings are made of a block t, any block whose length divides both lengths works, and the longest such length is gcd(m, n); the concatenation test rules out everything else.',
        code: {
          java: r`class Solution {
    public String gcdOfStrings(String str1, String str2) {
        if (!(str1 + str2).equals(str2 + str1)) return "";
        return str1.substring(0, gcd(str1.length(), str2.length()));
    }
    private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
}`,
          cpp: r`class Solution {
public:
    string gcdOfStrings(string str1, string str2) {
        if (str1 + str2 != str2 + str1) return "";
        return str1.substr(0, gcd(str1.size(), str2.size()));
    }
};`,
          python: r`class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        if str1 + str2 != str2 + str1:
            return ""
        return str1[:gcd(len(str1), len(str2))]`,
          javascript: r`var gcdOfStrings = function(str1, str2) {
    if (str1 + str2 !== str2 + str1) return "";
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    return str1.slice(0, gcd(str1.length, str2.length));
};`,
        },
      },
    ],
  },
  'multiply-strings': {
    pattern: 'Long multiplication into a position array',
    approaches: [
      {
        level: 'Better', name: 'Multiply by each digit, then add the rows',
        idea: 'Do it exactly as on paper: multiply `num1` by one digit of `num2` at a time (shifted), and add each row into a running total with string addition.',
        steps: [
          'For each digit of `num2` from the right, compute `num1 × digit` as a string, followed by the right number of zeros.',
          'Add it to the running result with grade-school string addition.',
          'Strip leading zeros (return "0" if the result is empty).',
        ],
        time: 'O(m · n)', space: 'O(m + n)',
        why: 'n rows, each built and added in O(m + n). It is correct, but creating and adding whole strings for every row does more work and allocation than needed.',
        code: {
          java: r`class Solution {
    public String multiply(String num1, String num2) {
        if (num1.equals("0") || num2.equals("0")) return "0";
        String result = "0";
        for (int j = num2.length() - 1, shift = 0; j >= 0; j--, shift++) {
            int d = num2.charAt(j) - '0', carry = 0;
            StringBuilder row = new StringBuilder();
            for (int k = 0; k < shift; k++) row.append('0');
            for (int i = num1.length() - 1; i >= 0; i--) {
                int p = (num1.charAt(i) - '0') * d + carry;
                row.append(p % 10);
                carry = p / 10;
            }
            if (carry > 0) row.append(carry);
            result = add(result, row.reverse().toString());
        }
        return result;
    }
    private String add(String a, String b) {
        StringBuilder sb = new StringBuilder();
        int i = a.length() - 1, j = b.length() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry > 0) {
            int s = carry + (i >= 0 ? a.charAt(i--) - '0' : 0) + (j >= 0 ? b.charAt(j--) - '0' : 0);
            sb.append(s % 10);
            carry = s / 10;
        }
        return sb.reverse().toString();
    }
}`,
          cpp: r`class Solution {
    string add(const string& a, const string& b) {
        string s;
        int i = (int) a.size() - 1, j = (int) b.size() - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry) {
            int t = carry + (i >= 0 ? a[i--] - '0' : 0) + (j >= 0 ? b[j--] - '0' : 0);
            s += (char) ('0' + t % 10);
            carry = t / 10;
        }
        reverse(s.begin(), s.end());
        return s;
    }
public:
    string multiply(string num1, string num2) {
        if (num1 == "0" || num2 == "0") return "0";
        string result = "0";
        for (int j = (int) num2.size() - 1, shift = 0; j >= 0; j--, shift++) {
            int d = num2[j] - '0', carry = 0;
            string row(shift, '0');
            for (int i = (int) num1.size() - 1; i >= 0; i--) {
                int p = (num1[i] - '0') * d + carry;
                row += (char) ('0' + p % 10);
                carry = p / 10;
            }
            if (carry) row += (char) ('0' + carry);
            reverse(row.begin(), row.end());
            result = add(result, row);
        }
        return result;
    }
};`,
          python: r`class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"
        def add(a, b):
            out, i, j, carry = [], len(a) - 1, len(b) - 1, 0
            while i >= 0 or j >= 0 or carry:
                s = carry + (int(a[i]) if i >= 0 else 0) + (int(b[j]) if j >= 0 else 0)
                out.append(str(s % 10))
                carry = s // 10
                i -= 1
                j -= 1
            return "".join(reversed(out))
        result = "0"
        for shift, ch in enumerate(reversed(num2)):
            d, carry, row = int(ch), 0, ['0'] * shift
            for c in reversed(num1):
                p = int(c) * d + carry
                row.append(str(p % 10))
                carry = p // 10
            if carry:
                row.append(str(carry))
            result = add(result, "".join(reversed(row)))
        return result`,
          javascript: r`var multiply = function(num1, num2) {
    if (num1 === "0" || num2 === "0") return "0";
    const add = (a, b) => {
        let out = "", i = a.length - 1, j = b.length - 1, carry = 0;
        while (i >= 0 || j >= 0 || carry) {
            const s = carry + (i >= 0 ? a.charCodeAt(i--) - 48 : 0) + (j >= 0 ? b.charCodeAt(j--) - 48 : 0);
            out = (s % 10) + out;
            carry = Math.floor(s / 10);
        }
        return out;
    };
    let result = "0";
    for (let j = num2.length - 1, shift = 0; j >= 0; j--, shift++) {
        const d = num2.charCodeAt(j) - 48;
        let carry = 0, row = "0".repeat(shift);
        for (let i = num1.length - 1; i >= 0; i--) {
            const p = (num1.charCodeAt(i) - 48) * d + carry;
            row = (p % 10) + row;
            carry = Math.floor(p / 10);
        }
        if (carry) row = carry + row;
        result = add(result, row);
    }
    return result;
};`,
        },
      },
      {
        level: 'Optimal', name: 'Accumulate into positions i + j and i + j + 1',
        idea: 'Digit `i` of `num1` times digit `j` of `num2` contributes to positions `i + j` (carry) and `i + j + 1` (units) of a result array of length `m + n`. Accumulate every product there directly.',
        steps: [
          'Create `pos` of length `m + n`, all zeros.',
          'For `i` from `m − 1` down and `j` from `n − 1` down: `sum = d1 · d2 + pos[i + j + 1]`; set `pos[i + j + 1] = sum % 10` and add `sum / 10` to `pos[i + j]`.',
          'Join the digits, skipping leading zeros; return "0" if nothing remains.',
        ],
        time: 'O(m · n)', space: 'O(m + n)',
        why: 'Same number of digit multiplications, but no intermediate strings: one integer array of the final size. Processing from the right means each `pos[i + j + 1]` is final before it is read again. The product of an m-digit and an n-digit number has at most m + n digits.',
        code: {
          java: r`class Solution {
    public String multiply(String num1, String num2) {
        int m = num1.length(), n = num2.length();
        int[] pos = new int[m + n];
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                int sum = (num1.charAt(i) - '0') * (num2.charAt(j) - '0') + pos[i + j + 1];
                pos[i + j + 1] = sum % 10;
                pos[i + j] += sum / 10;
            }
        StringBuilder sb = new StringBuilder();
        for (int d : pos) if (sb.length() > 0 || d != 0) sb.append(d);
        return sb.length() == 0 ? "0" : sb.toString();
    }
}`,
          cpp: r`class Solution {
public:
    string multiply(string num1, string num2) {
        int m = num1.size(), n = num2.size();
        vector<int> pos(m + n, 0);
        for (int i = m - 1; i >= 0; i--)
            for (int j = n - 1; j >= 0; j--) {
                int sum = (num1[i] - '0') * (num2[j] - '0') + pos[i + j + 1];
                pos[i + j + 1] = sum % 10;
                pos[i + j] += sum / 10;
            }
        string s;
        for (int d : pos) if (!s.empty() || d != 0) s += (char) ('0' + d);
        return s.empty() ? "0" : s;
    }
};`,
          python: r`class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        m, n = len(num1), len(num2)
        pos = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                total = int(num1[i]) * int(num2[j]) + pos[i + j + 1]
                pos[i + j + 1] = total % 10
                pos[i + j] += total // 10
        s = "".join(map(str, pos)).lstrip('0')
        return s or "0"`,
          javascript: r`var multiply = function(num1, num2) {
    const m = num1.length, n = num2.length, pos = new Array(m + n).fill(0);
    for (let i = m - 1; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--) {
            const sum = (num1.charCodeAt(i) - 48) * (num2.charCodeAt(j) - 48) + pos[i + j + 1];
            pos[i + j + 1] = sum % 10;
            pos[i + j] += Math.floor(sum / 10);
        }
    const s = pos.join("").replace(/^0+/, "");
    return s || "0";
};`,
        },
      },
    ],
  },
};
