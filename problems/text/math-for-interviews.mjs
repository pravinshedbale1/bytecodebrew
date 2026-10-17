export default {
  'find-greatest-common-divisor-of-array': {
    statement: `Return the greatest common divisor of the smallest value and the largest value in \`nums\`: the largest positive integer that divides both of them evenly.`,
    constraints: ['2 <= nums.length <= 1000', '1 <= nums[i] <= 1000'],
    hints: [
      'Find the minimum and the maximum in one pass.',
      'Euclid\'s algorithm: gcd(a, b) = gcd(b, a % b), and gcd(a, 0) = a.',
      'It takes O(log min(a, b)) steps. Writing it iteratively avoids recursion entirely.',
    ],
  },
  'palindrome-number': {
    statement: `Return \`true\` if the integer \`x\` reads the same backwards as forwards. Negative numbers are never palindromes because of the minus sign.

Try to solve it without converting the integer to a string.`,
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    hints: [
      'Reversing the whole number can overflow an int. Reverse only half of it.',
      'Pop digits off the end of x and push them onto a reversed number until the reversed half is at least as large as what remains.',
      'Numbers ending in 0 (other than 0 itself) are never palindromes. At the end compare x == reversed, or x == reversed / 10 for an odd number of digits.',
    ],
  },
  'count-primes': {
    statement: `Return the number of prime numbers that are strictly less than \`n\`.

A prime is an integer greater than 1 whose only divisors are 1 and itself.`,
    constraints: ['0 <= n <= 5e6'],
    hints: [
      'Testing each number for primality separately is too slow for n = 5 × 10⁶.',
      'Sieve of Eratosthenes: mark every multiple of each prime as composite.',
      'Start crossing out at p × p (smaller multiples were already crossed out) and only for p with p × p < n. A boolean array of size n is enough.',
    ],
  },
  'powx-n': {
    statement: `Compute \`x\` raised to the power \`n\`, where \`n\` is an integer that may be negative.

Do it in O(log |n|) multiplications rather than |n|. Answers within \`10^-5\` of the exact value are accepted.`,
    constraints: ['-100 < x < 100', '-2^31 <= n <= 2^31 - 1', 'Either x ≠ 0 or n > 0', 'The result is between −10⁴ and 10⁴'],
    hints: [
      'x¹⁰ = (x⁵)², and x⁵ = x · (x²)². Halving the exponent each step gives O(log n).',
      'Fast exponentiation: while n > 0, multiply the result by x if n is odd, then square x and halve n.',
      'For a negative n, use 1 / x and −n. −2³¹ cannot be negated in an int, so convert n to a long first.',
    ],
  },
  'reverse-integer': {
    statement: `Reverse the decimal digits of the 32-bit signed integer \`x\`, keeping its sign: \`123\` → \`321\`, \`-123\` → \`-321\`, \`120\` → \`21\`.

If the reversed value is outside the 32-bit signed range \`[-2^31, 2^31 − 1]\`, return \`0\`. Assume you cannot store 64-bit integers.`,
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    hints: [
      'Pop the last digit with x % 10 and push it onto the result with result × 10 + digit.',
      'Java\'s % keeps the sign of x, so the same loop works for negative numbers.',
      'Before multiplying by 10, check whether result > MAX / 10 or result < MIN / 10 (the last digit can never push it over, given the input range). Return 0 if so.',
    ],
  },
  'factorial-trailing-zeroes': {
    statement: `Return the number of trailing zeros in \`n!\` (n factorial, \`1 × 2 × … × n\`).

Computing \`n!\` itself overflows almost immediately; aim for O(log n).`,
    constraints: ['0 <= n <= 1e4'],
    hints: [
      'A trailing zero comes from a factor 10 = 2 × 5. There are always more 2s than 5s.',
      'So count the factors of 5 in 1 × 2 × … × n.',
      'Multiples of 5 give one each, multiples of 25 give another, 125 another, and so on: n/5 + n/25 + n/125 + … .',
    ],
  },
  'count-good-numbers': {
    statement: `A digit string is good if the digits at even indices (0, 2, 4, …) are even (0, 2, 4, 6, 8) and the digits at odd indices are prime (2, 3, 5, 7). Leading zeros are allowed.

Return the number of good digit strings of length \`n\`, modulo \`10^9 + 7\`.`,
    constraints: ['1 <= n <= 1e15'],
    hints: [
      'Each position is independent: 5 choices at each even index and 4 at each odd index.',
      'The count is 5^(even positions) × 4^(odd positions), where there are ceil(n / 2) even positions and floor(n / 2) odd ones.',
      'n can be 10¹⁵, so use fast modular exponentiation with long arithmetic.',
    ],
  },
  'shuffle-an-array': {
    statement: `Implement \`Solution\`:

- \`Solution(int[] nums)\` stores the array,
- \`int[] shuffle()\` returns a random permutation of the array; every permutation must be equally likely,
- \`int[] reset()\` returns the array to its original order and returns it.

The judge checks that each shuffle is a permutation of the original values and that each reset returns the original array.`,
    constraints: ['1 ≤ nums.length ≤ 50', '-10⁶ ≤ nums[i] ≤ 10⁶', 'All values are unique', 'At most 10^4 calls in total'],
    hints: [
      'Sorting by random keys or swapping random pairs a few times does not give every permutation the same probability.',
      'Use the Fisher–Yates shuffle: for i from n − 1 down to 1, swap element i with a random index in [0, i].',
      'Keep an untouched copy of the original array for reset, and shuffle a separate copy.',
    ],
  },
  'linked-list-random-node': {
    statement: `Implement \`Solution\`:

- \`Solution(ListNode head)\` stores the list,
- \`int getRandom()\` returns the value of a node chosen uniformly at random.

Can you do it with O(1) extra space, as if the list were too long to know its length in advance? The judge checks that every returned value is in the list.`,
    constraints: ['1 ≤ number of nodes ≤ 10⁴', '-10⁴ ≤ Node.val ≤ 10⁴', 'At most 10^4 calls to getRandom'],
    hints: [
      'Copying the values into an array makes getRandom trivial but uses O(n) space.',
      'Reservoir sampling: walk the list, and replace the chosen value with the i-th node\'s value with probability 1 / i.',
      'Each node ends up chosen with probability exactly 1 / n, and you never need n in advance.',
    ],
  },
  'implement-rand10-using-rand7': {
    statement: `You are given \`rand7()\`, which returns a uniformly random integer from 1 to 7. Using only \`rand7()\` (no other random source), implement \`rand10()\`, which returns a uniformly random integer from 1 to 10.

The judge calls \`rand10()\` \`n\` times and checks that every value is in range.`,
    constraints: ['1 <= n <= 1e5'],
    hints: [
      'Two calls to rand7 give 49 equally likely outcomes: (a − 1) × 7 + b ranges uniformly over 1 … 49.',
      'Use only the first 40 outcomes, which split evenly into 10 groups of 4. Map v to (v − 1) % 10 + 1.',
      'If the outcome is 41–49, reject it and try again (rejection sampling). The expected number of rand7 calls is about 2.45.',
    ],
  },
};
