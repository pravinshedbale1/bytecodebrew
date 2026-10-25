export default [
  {
    slug: 'find-greatest-common-divisor-of-array', title: 'Find Greatest Common Divisor of Array', level: 'Easy',
    summary: 'Return the greatest common divisor of the smallest and the largest values in the array.',
    method: 'findGCD', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 5, 6, 9, 10]], out: 2 },
      { in: [[7, 5, 6, 8, 3]], out: 1 },
      { in: [[3, 3]], out: 3 },
      { in: [[12, 18, 30]] },
      { in: [[1000, 250, 750]] },
    ],
    ref: `class Solution {
    public int findGCD(int[] nums) {
        int lo = Integer.MAX_VALUE, hi = 0;
        for (int x : nums) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
        while (lo != 0) { int t = hi % lo; hi = lo; lo = t; }
        return hi;
    }
}`,
  },
  {
    slug: 'palindrome-number', title: 'Palindrome Number', level: 'Easy',
    summary: 'Return whether the integer reads the same backwards as forwards (negative numbers never do) — without converting it to a string if you can.',
    method: 'isPalindrome', params: [['int', 'x']], returns: 'boolean',
    tests: [
      { in: [121], out: true },
      { in: [-121], out: false },
      { in: [10], out: false },
      { in: [0] },
      { in: [1234321] },
      { in: [2147483647] },
    ],
    ref: `class Solution {
    public boolean isPalindrome(int x) {
        if (x < 0 || (x % 10 == 0 && x != 0)) return false;
        int rev = 0;
        while (x > rev) { rev = rev * 10 + x % 10; x /= 10; }
        return x == rev || x == rev / 10;
    }
}`,
  },
  {
    slug: 'count-primes', title: 'Count Primes', level: 'Medium',
    summary: 'Return how many prime numbers are strictly less than n.',
    method: 'countPrimes', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [10], out: 4 },
      { in: [0], out: 0 },
      { in: [1], out: 0 },
      { in: [2] },
      { in: [3] },
      { in: [5000000] },
    ],
    ref: `class Solution {
    public int countPrimes(int n) {
        if (n < 3) return 0;
        boolean[] composite = new boolean[n];
        int count = 0;
        for (int i = 2; i < n; i++) {
            if (composite[i]) continue;
            count++;
            for (long j = (long) i * i; j < n; j += i) composite[(int) j] = true;
        }
        return count;
    }
}`,
  },
  {
    slug: 'powx-n', title: 'Pow(x, n)', level: 'Medium',
    summary: 'Compute x raised to the integer power n (n may be negative, down to −2^31) in O(log n).',
    method: 'myPow', params: [['double', 'x'], ['int', 'n']], returns: 'double',
    tests: [
      { in: [2.0, 10], out: 1024.0 },
      { in: [2.1, 3], out: 9.261 },
      { in: [2.0, -2], out: 0.25 },
      { in: [1.0, -2147483648] },
      { in: [-2.0, 3] },
      { in: [0.5, 0] },
    ],
    ref: `class Solution {
    public double myPow(double x, int n) {
        long e = n;
        if (e < 0) { x = 1 / x; e = -e; }
        double result = 1;
        while (e > 0) { if ((e & 1) == 1) result *= x; x *= x; e >>= 1; }
        return result;
    }
}`,
  },
  {
    slug: 'reverse-integer', title: 'Reverse Integer', level: 'Medium',
    summary: 'Reverse the digits of a 32-bit signed integer. Return 0 if the result overflows the 32-bit range (and don\'t use 64-bit integers).',
    method: 'reverse', params: [['int', 'x']], returns: 'int',
    tests: [
      { in: [123], out: 321 },
      { in: [-123], out: -321 },
      { in: [120], out: 21 },
      { in: [0] },
      { in: [1534236469] },
      { in: [-2147483412] },
    ],
    ref: `class Solution {
    public int reverse(int x) {
        int rev = 0;
        while (x != 0) {
            int d = x % 10; x /= 10;
            if (rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && d > 7)) return 0;
            if (rev < Integer.MIN_VALUE / 10 || (rev == Integer.MIN_VALUE / 10 && d < -8)) return 0;
            rev = rev * 10 + d;
        }
        return rev;
    }
}`,
  },
  {
    slug: 'factorial-trailing-zeroes', title: 'Factorial Trailing Zeroes', level: 'Medium',
    summary: 'Return the number of trailing zeroes in n! — in O(log n).',
    method: 'trailingZeroes', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [3], out: 0 },
      { in: [5], out: 1 },
      { in: [0], out: 0 },
      { in: [25] },
      { in: [10000] },
    ],
    ref: `class Solution {
    public int trailingZeroes(int n) {
        int z = 0;
        while (n > 0) { n /= 5; z += n; }
        return z;
    }
}`,
  },
  {
    slug: 'count-good-numbers', title: 'Count Good Numbers', level: 'Medium',
    summary: 'A digit string is good if digits at even indices are even and digits at odd indices are prime (2, 3, 5, 7). Return how many good strings of length n exist, modulo 10^9 + 7 (n can be up to 10^15).',
    method: 'countGoodNumbers', params: [['long', 'n']], returns: 'int',
    tests: [
      { in: [1], out: 5 },
      { in: [4], out: 400 },
      { in: [50], out: 564908303 },
      { in: [2] },
      { in: [806166225460393] },
    ],
    ref: `class Solution {
    private static final long MOD = 1_000_000_007;
    public int countGoodNumbers(long n) { return (int) (pow(5, (n + 1) / 2) * pow(4, n / 2) % MOD); }
    private long pow(long b, long e) { long r = 1; b %= MOD; while (e > 0) { if ((e & 1) == 1) r = r * b % MOD; b = b * b % MOD; e >>= 1; } return r; }
}`,
  },
  {
    slug: 'shuffle-an-array', title: 'Shuffle an Array', level: 'Medium',
    summary: 'Solution(nums) supports shuffle(), returning a uniformly random permutation, and reset(), returning the original array. (The judge checks each shuffle is a permutation and each reset is the original.)',
    design: { cls: 'Solution', ctor: [['int[]', 'nums']], methods: [['int[]', 'reset', []], ['int[]', 'shuffle', []]] },
    check: 'custom:shuffle',
    tests: [
      { in: [['Solution', 'shuffle', 'reset', 'shuffle'], [[[1, 2, 3]], [], [], []]] },
      { in: [['Solution', 'reset', 'shuffle', 'shuffle', 'reset'], [[[5]], [], [], [], []]] },
      { in: [['Solution', 'shuffle', 'shuffle', 'reset', 'shuffle'], [[[-6, 10, 184, 0]], [], [], [], []]] },
    ],
    ref: `class Solution {
    private final int[] original;
    private final Random rnd = new Random(7);
    public Solution(int[] nums) { original = nums.clone(); }
    public int[] reset() { return original.clone(); }
    public int[] shuffle() {
        int[] a = original.clone();
        for (int i = a.length - 1; i > 0; i--) { int j = rnd.nextInt(i + 1); int t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }
}`,
  },
  {
    slug: 'linked-list-random-node', title: 'Linked List Random Node', level: 'Medium',
    summary: 'Solution(head) supports getRandom(): a uniformly random node value. Try it in O(1) extra space without knowing the length (reservoir sampling).',
    design: { cls: 'Solution', ctor: [['ListNode', 'head']], methods: [['int', 'getRandom', []]] },
    uses: ['ListNode'],
    check: 'custom:randomNode',
    tests: [
      { in: [['Solution', 'getRandom', 'getRandom', 'getRandom', 'getRandom', 'getRandom'], [[[1, 2, 3]], [], [], [], [], []]] },
      { in: [['Solution', 'getRandom', 'getRandom'], [[[7]], [], []]] },
      { in: [['Solution', 'getRandom', 'getRandom', 'getRandom'], [[[-4, 0, 9, 9]], [], [], []]] },
    ],
    ref: `class Solution {
    private final ListNode head;
    private final Random rnd = new Random(274);
    public Solution(ListNode head) { this.head = head; }
    public int getRandom() {
        int pick = 0, i = 0;
        for (ListNode n = head; n != null; n = n.next) if (rnd.nextInt(++i) == 0) pick = n.val;
        return pick;
    }
}`,
  },
  {
    slug: 'implement-rand10-using-rand7', title: 'Implement Rand10() Using Rand7()', level: 'Medium',
    summary: 'Using only the provided rand7() (uniform 1..7), implement rand10(), uniform 1..10. The judge calls rand10() n times and checks every value is in range.',
    method: 'rand10', params: [['int', 'n']], starterParams: [], returns: 'int',
    uses: ['SolBase'], extends: 'SolBase', check: 'custom:rand10',
    call: 'List<Integer> out = new ArrayList<>(); for (int i = 0; i < BCB.I($0); i++) out.add(s.rand10()); Object r = out;',
    tests: [
      { in: [1] },
      { in: [2] },
      { in: [3] },
      { in: [100] },
    ],
    ref: `class Solution extends SolBase {
    public int rand10() {
        while (true) {
            int v = (rand7() - 1) * 7 + rand7();
            if (v <= 40) return (v - 1) % 10 + 1;
        }
    }
}`,
  },
  {
    slug: 'plus-one', title: 'Plus One', level: 'Easy',
    summary: 'digits holds a non-negative integer, most significant digit first, with no leading zeros. Return the digits of that integer plus one.',
    method: 'plusOne', params: [['int[]', 'digits']], returns: 'int[]',
    tests: [
      { in: [[1, 2, 3]], out: [1, 2, 4] },
      { in: [[4, 3, 2, 1]], out: [4, 3, 2, 2] },
      { in: [[9]], out: [1, 0] },
      { in: [[0]] },
      { in: [[9, 9, 9]] },
      { in: [[1, 9, 9]] },
      { in: [[9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 9, 9, 9]] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'roman-to-integer', title: 'Roman to Integer', level: 'Easy',
    summary: 'Convert a valid Roman numeral (I, V, X, L, C, D, M, with subtractive pairs like IV and CM) to an integer.',
    method: 'romanToInt', params: [['String', 's']], returns: 'int',
    tests: [
      { in: ['III'], out: 3 },
      { in: ['LVIII'], out: 58 },
      { in: ['MCMXCIV'], out: 1994 },
      { in: ['IV'] },
      { in: ['MMMCMXCIX'] },
      { in: ['XLIX'] },
      { in: ['CDXLIV'] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'excel-sheet-column-title', title: 'Excel Sheet Column Title', level: 'Easy',
    summary: 'Return the spreadsheet column title for columnNumber: 1 → "A", 26 → "Z", 27 → "AA", 28 → "AB", and so on.',
    method: 'convertToTitle', params: [['int', 'columnNumber']], returns: 'String',
    tests: [
      { in: [1], out: 'A' },
      { in: [28], out: 'AB' },
      { in: [701], out: 'ZY' },
      { in: [26] },
      { in: [52] },
      { in: [702] },
      { in: [2147483647] },
    ],
    ref: `class Solution {
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
  },
  {
    slug: 'greatest-common-divisor-of-strings', title: 'Greatest Common Divisor of Strings', level: 'Easy',
    summary: 'A string t divides s if s is t repeated one or more times. Return the longest string that divides both str1 and str2 ("" if none).',
    method: 'gcdOfStrings', params: [['String', 'str1'], ['String', 'str2']], returns: 'String',
    tests: [
      { in: ['ABCABC', 'ABC'], out: 'ABC' },
      { in: ['ABABAB', 'ABAB'], out: 'AB' },
      { in: ['LEET', 'CODE'], out: '' },
      { in: ['A', 'A'] },
      { in: ['AAAAAA', 'AAAA'] },
      { in: ['ABCABCABC', 'ABCAB'] },
      { in: ['TAUXXTAUXXTAUXXTAUXXTAUXX', 'TAUXXTAUXXTAUXXTAUXXTAUXXTAUXXTAUXXTAUXXTAUXX'] },
    ],
    ref: `class Solution {
    public String gcdOfStrings(String str1, String str2) {
        if (!(str1 + str2).equals(str2 + str1)) return "";
        return str1.substring(0, gcd(str1.length(), str2.length()));
    }
    private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
}`,
  },
  {
    slug: 'multiply-strings', title: 'Multiply Strings', level: 'Medium',
    summary: 'Multiply two non-negative integers given as decimal strings and return the product as a string, without converting the inputs to built-in big numbers.',
    method: 'multiply', params: [['String', 'num1'], ['String', 'num2']], returns: 'String',
    tests: [
      { in: ['2', '3'], out: '6' },
      { in: ['123', '456'], out: '56088' },
      { in: ['0', '52'] },
      { in: ['9', '9'] },
      { in: ['999', '999'] },
      { in: ['123456789', '987654321'] },
      { in: ['1', '100000000000000000000000000000'] },
      { in: ['31415926535897932384626433832795028841971', '27182818284590452353602874713526624977572'] },
    ],
    ref: `class Solution {
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
  },
];
