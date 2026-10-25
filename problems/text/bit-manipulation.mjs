export default {
  'single-number': {
    statement: `Every value in \`nums\` appears exactly twice, except for one value that appears once. Return that value.

Use O(n) time and O(1) extra space.`,
    constraints: ['1 <= nums.length <= 3e4', '-3e4 <= nums[i] <= 3e4', 'Every value appears twice except one'],
    hints: [
      'A HashSet finds it but uses O(n) space. Which operation cancels a value with itself?',
      'XOR: x ^ x = 0 and x ^ 0 = x, and the order does not matter.',
      'XOR all the values together; the pairs cancel and only the single value remains.',
    ],
  },
  'number-of-1-bits': {
    statement: `Return the number of \`1\` bits in the 32-bit binary representation of \`n\` (its Hamming weight).

Negative inputs are counted by their 32-bit two's-complement pattern, so \`-1\` has 32 set bits.`,
    constraints: ['-2^31 <= n <= 2^31 - 1'],
    hints: [
      'Check the lowest bit with n & 1, then shift. Use >>> (unsigned shift) so a negative number does not loop forever.',
      'A faster trick: n & (n − 1) clears the lowest set bit.',
      'Count how many times you can apply it before n becomes 0. (Integer.bitCount is the library answer.)',
    ],
  },
  'power-of-two': {
    statement: `Return \`true\` if \`n\` is a power of two, meaning \`n == 2^x\` for some integer \`x ≥ 0\`.

Zero and negative numbers are not powers of two.`,
    constraints: ['-2^31 <= n <= 2^31 - 1'],
    hints: [
      'In binary, a power of two has exactly one bit set.',
      'n & (n − 1) clears the lowest set bit. For a power of two, that leaves 0.',
      'So the answer is n > 0 && (n & (n − 1)) == 0. The n > 0 check rules out 0 and −2³¹.',
    ],
  },
  'missing-number': {
    statement: `\`nums\` contains \`n\` distinct numbers taken from the range \`0\` to \`n\`, so exactly one number of that range is missing. Return it.

Use O(n) time and O(1) extra space.`,
    constraints: ['1 <= nums.length <= 1e4', '0 <= nums[i] <= nums.length', 'The values are distinct'],
    hints: [
      'You know which numbers should be there: 0, 1, …, n.',
      'The expected sum is n(n + 1) / 2; subtract the actual sum.',
      'XOR avoids any overflow concern: XOR every index 0 … n with every value, and the pairs cancel, leaving the missing number.',
    ],
  },
  'counting-bits': {
    statement: `Return an array \`ans\` of length \`n + 1\` where \`ans[i]\` is the number of \`1\` bits in the binary representation of \`i\`, for every \`i\` from \`0\` to \`n\`.

Aim for O(n) time.`,
    constraints: ['0 <= n <= 1e5'],
    hints: [
      'Counting the bits of each number from scratch is O(n log n). Reuse earlier answers.',
      'i >> 1 drops the lowest bit, so ans[i] = ans[i >> 1] + (i & 1).',
      'Alternatively ans[i] = ans[i & (i − 1)] + 1, since i & (i − 1) clears one set bit.',
    ],
  },
  'reverse-bits': {
    statement: `Reverse the order of the 32 bits of \`n\`: bit 0 becomes bit 31, bit 1 becomes bit 30, and so on. Return the result as a Java \`int\`, which means it can come out negative when the new top bit is 1.`,
    constraints: ['-2^31 <= n <= 2^31 - 1'],
    hints: [
      'Build the result one bit at a time, 32 times.',
      'Each step: shift the result left by 1, add n & 1, then shift n right with >>>.',
      'Do exactly 32 iterations even if n becomes 0 early, so the bits end up in the right positions.',
    ],
  },
  'single-number-ii': {
    statement: `Every value in \`nums\` appears exactly three times, except for one value that appears exactly once. Return that value.

Use O(n) time and O(1) extra space.`,
    constraints: ['1 <= nums.length <= 3e4', '-2^31 <= nums[i] <= 2^31 - 1', 'Every value appears three times except one'],
    hints: [
      'XOR no longer cancels: three copies leave one behind. Look at each bit position separately.',
      'For each of the 32 bit positions, count how many values have that bit set. Taken modulo 3, the count is that bit of the single value.',
      'A constant-space alternative tracks "seen once" and "seen twice" bit masks: ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones.',
    ],
  },
  'sum-of-two-integers': {
    statement: `Return the sum of the integers \`a\` and \`b\` without using the \`+\` or \`-\` operators anywhere in your solution.

This is a bit-manipulation exercise: think about how a computer adds two numbers in binary.`,
    constraints: ['-1000 <= a, b <= 1000'],
    hints: [
      'Think of binary addition by hand: each column produces a sum bit and maybe a carry.',
      'a ^ b adds the bits without carrying; (a & b) << 1 gives the carries.',
      'Repeat with a = a ^ b and b = carry until there is no carry left. Two\'s complement makes negative numbers work too.',
    ],
  },
  'single-number-iii': {
    statement: `In \`nums\`, exactly two values appear once and every other value appears exactly twice. Return the two values that appear once, in any order.

Use O(n) time and O(1) extra space.`,
    constraints: ['2 <= nums.length <= 3e4', '-2^31 <= nums[i] <= 2^31 - 1', 'Exactly two values appear once; all others appear twice'],
    hints: [
      'XOR of everything gives a ^ b, where a and b are the two singles. Since a ≠ b, some bit of a ^ b is 1.',
      'Pick one such bit (x & −x gives the lowest set bit). a and b differ in it.',
      'Split all values into two groups by that bit and XOR each group: pairs still cancel, and each group leaves one single. Use long or care with −2³¹ when taking the lowest bit.',
    ],
  },
  'add-binary': {
    statement: `\`a\` and \`b\` are binary numbers written as strings of \`0\`s and \`1\`s. Return their sum, also as a binary string.`,
    constraints: ['1 <= a.length, b.length <= 1e4', '`a` and `b` contain only "0" and "1"', 'Neither has leading zeros, except "0" itself'],
    hints: [
      'With up to 10⁴ bits, converting to an int or long overflows. Add digit by digit instead.',
      'Walk both strings from the right with a carry, like grade-school addition in base 2.',
      'Each step: sum = bitA + bitB + carry; write sum % 2 and carry sum / 2. Keep going while either string has digits or the carry is 1, then reverse.',
    ],
  },
  'bitwise-and-of-numbers-range': {
    statement: `Given two integers \`left\` and \`right\` that describe the range \`[left, right]\`, return the bitwise AND of **every** integer in that range, including both ends.`,
    constraints: ['0 <= left <= 2^31 - 1', '0 <= right <= 2^31 - 1', 'left <= right'],
    hints: [
      'ANDing every number one by one can take about 2 · 10⁹ steps.',
      'If a bit position changes anywhere between left and right, some number in the range has a 0 there, so that bit is 0 in the answer.',
      'The answer is the common binary prefix of left and right, followed by zeros. Shift both right until they are equal, then shift back.',
    ],
  },
  'minimum-array-end': {
    statement: `Construct an array \`nums\` of \`n\` positive integers that is **strictly increasing** and whose bitwise AND of all elements equals \`x\`. Return the minimum possible value of \`nums[n − 1]\`.`,
    constraints: ['1 <= n, x <= 1e8'],
    hints: [
      'Every element must contain all the 1-bits of x, so nums[0] = x is the best start.',
      'The bits that are 0 in x are free. The k-th valid number (counting from 0) is x with the binary digits of k written into those free positions, lowest first.',
      'So the answer is x with the bits of n − 1 placed into x\'s zero bits. The result can exceed 2³¹: use a 64-bit value.',
    ],
  },
};
