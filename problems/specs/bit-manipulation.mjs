export default [
  {
    slug: 'single-number', title: 'Single Number', level: 'Easy',
    summary: 'Every value appears twice except one. Return it in O(n) time and O(1) space.',
    method: 'singleNumber', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 2, 1]], out: 1 },
      { in: [[4, 1, 2, 1, 2]], out: 4 },
      { in: [[1]], out: 1 },
      { in: [[-3, 7, 7]] },
    ],
    ref: `class Solution {
    public int singleNumber(int[] nums) { int x = 0; for (int v : nums) x ^= v; return x; }
}`,
  },
  {
    slug: 'number-of-1-bits', title: 'Number of 1 Bits', level: 'Easy',
    summary: 'Return the number of set bits in the binary representation of n (treat negative values as their 32-bit pattern).',
    method: 'hammingWeight', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [11], out: 3 },
      { in: [128], out: 1 },
      { in: [2147483645], out: 30 },
      { in: [0] },
      { in: [-1] },
    ],
    ref: `class Solution {
    public int hammingWeight(int n) { int c = 0; while (n != 0) { n &= n - 1; c++; } return c; }
}`,
  },
  {
    slug: 'power-of-two', title: 'Power of Two', level: 'Easy',
    summary: 'Return whether n is a power of two.',
    method: 'isPowerOfTwo', params: [['int', 'n']], returns: 'boolean',
    tests: [
      { in: [1], out: true },
      { in: [16], out: true },
      { in: [3], out: false },
      { in: [0] },
      { in: [-2147483648] },
      { in: [1073741824] },
    ],
    ref: `class Solution {
    public boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }
}`,
  },
  {
    slug: 'missing-number', title: 'Missing Number', level: 'Easy',
    summary: 'nums holds n distinct values from 0..n. Return the one that is missing, in O(1) extra space.',
    method: 'missingNumber', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[3, 0, 1]], out: 2 },
      { in: [[0, 1]], out: 2 },
      { in: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], out: 8 },
      { in: [[1]] },
    ],
    ref: `class Solution {
    public int missingNumber(int[] nums) { int x = nums.length; for (int i = 0; i < nums.length; i++) x ^= i ^ nums[i]; return x; }
}`,
  },
  {
    slug: 'counting-bits', title: 'Counting Bits', level: 'Easy',
    summary: 'Return an array where element i is the number of 1 bits in i, for every i from 0 to n, in O(n).',
    method: 'countBits', params: [['int', 'n']], returns: 'int[]',
    tests: [
      { in: [2], out: [0, 1, 1] },
      { in: [5], out: [0, 1, 1, 2, 1, 2] },
      { in: [0] },
      { in: [16] },
    ],
    ref: `class Solution {
    public int[] countBits(int n) { int[] a = new int[n + 1]; for (int i = 1; i <= n; i++) a[i] = a[i & (i - 1)] + 1; return a; }
}`,
  },
  {
    slug: 'reverse-bits', title: 'Reverse Bits', level: 'Easy',
    summary: 'Reverse the order of the 32 bits of n and return the result (as a signed Java int).',
    method: 'reverseBits', params: [['int', 'n']], returns: 'int',
    tests: [
      { in: [43261596], out: 964176192 },
      { in: [-3], out: -1073741825 },
      { in: [0] },
      { in: [1] },
    ],
    ref: `class Solution {
    public int reverseBits(int n) { int r = 0; for (int i = 0; i < 32; i++) { r = (r << 1) | (n & 1); n >>>= 1; } return r; }
}`,
  },
  {
    slug: 'single-number-ii', title: 'Single Number II', level: 'Medium',
    summary: 'Every value appears three times except one, which appears once. Return it in O(n) time and O(1) space.',
    method: 'singleNumber', params: [['int[]', 'nums']], returns: 'int',
    tests: [
      { in: [[2, 2, 3, 2]], out: 3 },
      { in: [[0, 1, 0, 1, 0, 1, 99]], out: 99 },
      { in: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]] },
      { in: [[7]] },
    ],
    ref: `class Solution {
    public int singleNumber(int[] nums) {
        int ones = 0, twos = 0;
        for (int x : nums) { ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones; }
        return ones;
    }
}`,
  },
  {
    slug: 'sum-of-two-integers', title: 'Sum of Two Integers', level: 'Medium',
    summary: 'Return a + b without using the + or − operators.',
    method: 'getSum', params: [['int', 'a'], ['int', 'b']], returns: 'int',
    tests: [
      { in: [1, 2], out: 3 },
      { in: [2, 3], out: 5 },
      { in: [-1, 1] },
      { in: [-12, -8] },
      { in: [1000, -999] },
    ],
    ref: `class Solution {
    public int getSum(int a, int b) { while (b != 0) { int carry = (a & b) << 1; a ^= b; b = carry; } return a; }
}`,
  },
  {
    slug: 'single-number-iii', title: 'Single Number III', level: 'Medium',
    summary: 'Exactly two values appear once and all others appear twice. Return the two singles in any order, in O(n) time and O(1) space.',
    method: 'singleNumber', params: [['int[]', 'nums']], returns: 'int[]', check: 'any-order',
    tests: [
      { in: [[1, 2, 1, 3, 2, 5]], out: [3, 5] },
      { in: [[-1, 0]], out: [-1, 0] },
      { in: [[0, 1]], out: [1, 0] },
      { in: [[4, 4, -2147483648, 7, 9, 9]] },
    ],
    ref: `class Solution {
    public int[] singleNumber(int[] nums) {
        int x = 0;
        for (int v : nums) x ^= v;
        int bit = x & -x, a = 0;
        for (int v : nums) if ((v & bit) != 0) a ^= v;
        return new int[] { a, x ^ a };
    }
}`,
  },
];
