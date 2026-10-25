export default {
  'single-number': {
    explain: 'The 2 appears twice and the 1 once, so the answer is 1. XOR-ing all values works because the pair cancels: `2 ^ 2 ^ 1 = 1`.',
    more: 'The extra-space limit rules out counting with a hash map. Think about an operation that cancels a value with itself.',
  },
  'number-of-1-bits': {
    explain: '11 in binary is `1011`, which has three 1 bits, so the answer is 3.',
    more: 'For example 128 is `10000000`, a single 1 bit. Count every set bit of the 32-bit pattern, including the sign bit for negative inputs.',
  },
  'power-of-two': {
    explain: '1 is 2⁰, so it is a power of two and the answer is `true`.',
    more: 'For example 16 is 2⁴ and returns `true`, while 6 is not a power of two. A power of two has exactly one 1 bit in binary.',
  },
  'missing-number': {
    explain: 'There are 3 numbers, so they come from the range 0 to 3. Of 0, 1, 2 and 3, only 2 is missing, so the answer is 2.',
    more: 'One way to see it: the sum 0 + 1 + … + n is known, so the missing value is that sum minus the sum of `nums`. XOR gives the same result without any risk of overflow.',
  },
  'counting-bits': {
    explain: 'For `n = 2`: 0 is `0` (zero 1 bits), 1 is `1` (one), and 2 is `10` (one). So the answer is `[0,1,1]`.',
    more: 'The answer has one entry per number from 0 to `n` inclusive. Each entry can be built from a smaller one, for example `ans[i] = ans[i >> 1] + (i & 1)`.',
  },
  'reverse-bits': {
    explain: '43261596 is `00000010100101000001111010011100` in 32-bit binary. Reversing the 32 bits gives `00111001011110000010100101000000`, which is 964176192.',
    more: 'Leading zeros count: the input is always treated as exactly 32 bits, so a small number reverses into a large one.',
  },
  'single-number-ii': {
    explain: '2 appears three times and 3 appears once, so the answer is 3. Counting each bit position modulo 3 keeps only the bits of the value that appears once.',
    more: 'XOR alone doesn\'t work here, because a value appearing three times doesn\'t cancel. Count how many times each bit is set and take that count modulo 3.',
  },
  'sum-of-two-integers': {
    explain: '1 is `01` and 2 is `10`. Their XOR is `11` (the sum without carries) and their AND shifted left is `00` (no carries), so the result is 3.',
  },
  'single-number-iii': {
    explain: '1 and 2 each appear twice; 3 and 5 appear once. XOR of everything is `3 ^ 5 = 6` (`110`); splitting the values by its lowest set bit separates 3 from 5. So the answer is `[3,5]`, in either order.',
    more: 'The two single values differ in at least one bit. Using that bit to split `nums` into two groups puts one single value in each group, and each group can then be XOR-ed on its own.',
  },
  'add-binary': {
    explain: '11 in binary is 3 and 1 is 1, so the sum is 4, which is "100" in binary.',
  },
  'bitwise-and-of-numbers-range': {
    explain: '5 = 101, 6 = 110 and 7 = 111. Only the top bit is set in all three, so the AND is 100 in binary, which is 4.',
  },
  'minimum-array-end': {
    explain: 'With x = 4 (100), each element must keep that bit. The smallest three such numbers are 4 (100), 5 (101) and 6 (110), so the last element is 6.',
  },
};
