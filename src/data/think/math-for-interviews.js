/** Practice thinking walkthroughs: math-for-interviews (format: src/data/think/index.js). */

const notBrute = (id, why) => ({ id, why });

export default {
  'find-greatest-common-divisor-of-array': {
    free: true,
    aha: 'Only the smallest and largest values matter, so find them in one pass and run Euclid\'s algorithm: gcd(a, b) = gcd(b, a mod b), until the second number is 0. Each step at least halves the larger number every two steps, so it is O(log min).',
    asks: {
      read: 'Which two values does the answer depend on?',
      budget: 'Values up to 1000. Is trying every divisor fine? What is faster?',
      observe: 'For [2, 5, 6, 9, 10], what are min and max, and their gcd?',
      brute: 'Trying every d from min down to 1: what does it cost?',
      pattern: 'Why is gcd(a, b) the same as gcd(b, a mod b)?',
      watch: 'Watch Euclid replace (a, b) with (b, a mod b).',
    },
    read: [
      { phrase: 'Return the greatest common divisor of the smallest value and the largest value in `nums`', says: 'One pass for min and max, then one gcd.' },
      { phrase: '`gcd(a, b) = gcd(b, a mod b)`', says: 'Euclid: repeat until the remainder is 0.' },
    ],
    budget: { from: 'n ≤ 1000, values ≤ 1000', rows: [['try every divisor', '1000', 'ok', 'fine here'], ['Euclid', 'O(log)', 'ok', 'always fast']], aim: 'O(n + log max)', note: 'Euclid matters when values are up to 10⁹ or more.' },
    observe: [
      {
        title: 'Only the ends matter',
        text: '[2, 5, 6, 9, 10]: min 2, max 10. gcd(10, 2): 10 mod 2 = 0, so the answer is 2.',
        sketch: { kind: 'array', rows: [{ items: [2, 5, 6, 9, 10], marks: { 0: 'hit', 4: 'hit', 1: 'dim', 2: 'dim', 3: 'dim' } }], caption: 'gcd(10, 2) = 2' },
      },
      {
        title: 'Euclid shrinks fast',
        text: 'gcd(48, 18) → gcd(18, 12) → gcd(12, 6) → gcd(6, 0) = 6. Any common divisor of a and b also divides a mod b.',
        sketch: { kind: 'array', rows: [{ items: ['48, 18', '18, 12', '12, 6', '6, 0'], marks: { 3: 'hit' } }] },
      },
    ],
    brute: { idea: 'Try every d from min(a, b) down to 1 and return the first that divides both.', cost: 'O(min)', waste: 'Most candidates are hopeless; Euclid jumps straight to smaller numbers with the same gcd.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'a = min, b = max; while (b != 0) { t = a % b; a = b; b = t; } return a. O(n + log max).',
      not: [notBrute('sorting-and-selection', 'Sorting finds min and max but costs O(n log n); one pass is enough.'), notBrute('hashing', 'No lookup is needed.')],
    },
    watch: { viz: 'MathViz', inputs: [{ label: 'gcd(10, 2)', input: { mode: 'gcd', a: 10, b: 2 } }, { label: 'gcd(48, 18)', input: { mode: 'gcd', a: 48, b: 18 } }] },
    edges: ['[2, 5, 6, 9, 10] → 2.', 'Coprime ends: [7, 5, 6, 8, 3] → 1.', 'All equal: [3, 3] → 3.'],
  },

  'palindrome-number': {
    aha: 'Reverse only the second half: move the last digit of x onto rev until rev ≥ x. Then the front half is x and the reversed back half is rev; they must match exactly (even length) or after dropping rev\'s last digit (odd length, the middle digit). Negatives, and numbers ending in 0 other than 0, are never palindromes.',
    asks: {
      read: 'Why is every negative number false?',
      budget: 'Up to 10 digits. Can reversing the whole number overflow?',
      observe: 'For 1221, what are x and rev when they meet?',
      brute: 'Converting to a string: why does the follow-up rule it out?',
      pattern: 'How far do you need to reverse before you can compare?',
      watch: 'Watch digits move from x to rev until the halves meet.',
    },
    read: [
      { phrase: 'Negative numbers are never palindromes because of the minus sign', says: 'Return false for x < 0 at once.' },
      { phrase: 'without converting the integer to a string', says: 'Work with % 10 and / 10.' },
      { phrase: 'Reversing only the second half of the digits avoids overflow', says: 'Stop when rev ≥ x.' },
    ],
    budget: { from: '32-bit x', rows: [['reverse all digits', 'may overflow', 'bad', 'risky'], ['reverse half', '≤ 5 steps', 'ok', 'safe']], aim: 'O(log₁₀ x)', note: 'A trailing 0 (x = 10, 120) breaks the half check, so reject it first.' },
    observe: [
      {
        title: 'Halves meet in the middle',
        text: '1221: move 1 → rev 1, x 122; move 2 → rev 12, x 12. Now rev ≥ x and 12 = 12.',
        sketch: { kind: 'array', rows: [{ label: 'x', items: [1, 2] }, { label: 'rev', items: [1, 2], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'Odd length: drop the middle',
        text: '12321 ends with x = 12, rev = 123. rev / 10 = 12 = x: the 3 was the middle digit.',
        sketch: { kind: 'array', rows: [{ items: ['x 12', 'rev 123', '123 / 10 = 12'], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Convert to a string and compare it with its reverse.', cost: 'O(digits)', waste: 'Same speed, but uses a string the follow-up forbids; full numeric reversal can overflow.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'if (x < 0 || (x % 10 == 0 && x != 0)) false; while (x > rev) { rev = rev·10 + x%10; x /= 10; } return x == rev || x == rev/10. O(log x).',
      not: [notBrute('two-pointers', 'Two pointers on the digit string work, but need the string.'), notBrute('string-matching', 'Nothing is searched for; the number is compared with itself.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '1221', input: { mode: 'palindrome', x: 1221 } }, { label: '12321', input: { mode: 'palindrome', x: 12321 } }] },
    edges: ['−121 → false.', '10 → false.', '0 → true.'],
  },

  'count-primes': {
    aha: 'Sieve of Eratosthenes: start with every number from 2 marked prime. For each number p that is still marked, cross out its multiples starting at p² (smaller multiples were crossed out by smaller primes). Stop once p² ≥ n. Whatever stays marked is prime.',
    asks: {
      read: 'Is n itself counted?',
      budget: 'n up to 5 × 10⁶. Can you trial-divide every number?',
      observe: 'Below 30, why does crossing out for 7 start at 49 and therefore do nothing?',
      brute: 'Testing each number by dividing up to its square root: what does it cost?',
      pattern: 'Instead of testing each number, what can each prime do to its multiples?',
      watch: 'Watch each prime cross out its multiples, starting at its square.',
    },
    read: [
      { phrase: 'strictly less than `n`', says: 'Count 2..n − 1.' },
      { phrase: 'marks the multiples of each prime as composite, starting from its square', says: 'Smaller multiples are already crossed out.' },
    ],
    budget: { from: 'n ≤ 5 × 10⁶', rows: [['trial division', 'n · √n ≈ 10¹⁰', 'bad', 'too slow'], ['sieve', 'n log log n', 'ok', 'fast']], aim: 'O(n log log n)', note: 'A boolean array of n entries: 5 MB.' },
    observe: [
      {
        title: 'Start at p²',
        text: 'For p = 3, the multiples 6 (= 2 · 3) is already crossed out by 2; start at 9.',
        sketch: { kind: 'array', rows: [{ items: [6, 9, 12, 15], marks: { 0: 'dim', 1: 'hit' } }], caption: 'from 3² = 9' },
      },
      {
        title: 'Stop at √n',
        text: 'Below 30, 7² = 49 > 30: every composite below 30 already has a prime factor ≤ 5 and was crossed out.',
        sketch: { kind: 'array', rows: [{ items: [2, 3, 5, '7?'], marks: { 3: 'dim' } }], caption: '10 primes below 30' },
      },
    ],
    brute: { idea: 'For each number below n, test divisibility by every number up to its square root.', cost: 'O(n √n)', waste: 'Each composite is tested over and over; the sieve crosses it out once per prime factor.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'prime[2..n−1] = true; for p with p·p < n: if prime[p], for m = p·p; m < n; m += p: prime[m] = false. Count the trues. O(n log log n).',
      not: [notBrute('dp-linear', 'It fills an array, but each entry is crossed out by primes, not computed from neighbours.'), notBrute('hashing', 'A boolean array indexed by number is all that\'s needed.')],
    },
    watch: { viz: 'MathViz', inputs: [{ label: 'below 30', input: { mode: 'sieve', n: 30 } }, { label: 'below 10', input: { mode: 'sieve', n: 10 } }] },
    edges: ['n = 0 or 1 → 0.', 'n = 2 → 0 (strictly less than 2).', 'n = 10 → 4 (2, 3, 5, 7).'],
  },

  'powx-n': {
    aha: 'Square-and-multiply: x^n = (x^(n/2))² when n is even, and x · x^(n − 1) when it is odd. Reading the bits of n, square the base at every step and multiply it into the result when the bit is 1: O(log n) multiplications. For negative n, compute x^|n| with |n| in a long, then take 1 / result.',
    asks: {
      read: 'What should happen for a negative n?',
      budget: 'n up to 2³¹. Can you multiply n times?',
      observe: 'How many multiplications does 3^13 take by squaring?',
      brute: 'Multiplying x by itself |n| times: what does it cost?',
      pattern: 'How does x^n relate to x^(n/2)?',
      watch: 'Watch the base square while the bits of n decide what to multiply in.',
    },
    read: [
      { phrase: 'in O(log |n|) multiplications rather than |n|', says: 'Halve the exponent each step.' },
      { phrase: 'compute x raised to `|n|` and take the reciprocal', says: 'Negative exponents flip at the end.' },
      { phrase: 'Converting `n` to a 64-bit value first avoids overflow at the most negative 32-bit integer', says: '−(−2³¹) doesn\'t fit in an int: use a long.' },
    ],
    budget: { from: '|n| ≤ 2³¹', rows: [['multiply |n| times', '2 × 10⁹', 'bad', 'too slow'], ['square-and-multiply', '≤ 62', 'ok', 'instant']], aim: 'O(log |n|)', note: 'Doubles lose precision slowly; the answer is accepted within 10⁻⁵.' },
    observe: [
      {
        title: 'Bits of the exponent',
        text: '13 = 1101₂ = 8 + 4 + 1, so 3¹³ = 3⁸ · 3⁴ · 3¹. The powers 3¹, 3², 3⁴, 3⁸ come from squaring.',
        sketch: { kind: 'array', rows: [{ label: 'bit', items: [1, 0, 1, 1] }, { label: 'power', items: ['3⁸', '3⁴', '3²', '3¹'], marks: { 0: 'hit', 1: 'dim', 2: 'hit', 3: 'hit' } }] },
      },
      {
        title: 'Negative exponents',
        text: '2^−2 = 1 / 2² = 0.25. With n = −2³¹, negate it as a long first.',
        sketch: { kind: 'array', rows: [{ items: ['2^−2', '1 / 4', '0.25'], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'Multiply x into the result |n| times.', cost: 'O(|n|)', waste: 'The same partial products are rebuilt; squaring doubles the exponent per step.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'long e = |n|; result = 1; while (e > 0) { if (e & 1) result *= x; x *= x; e >>= 1; } return n < 0 ? 1 / result : result. O(log |n|).',
      not: [notBrute('divide-and-conquer', 'The recursive x^(n/2) form is divide and conquer; the loop version is the same idea.'), notBrute('bit-manipulation', 'Reading the exponent\'s bits is the tool, not the whole idea.')],
    },
    watch: { viz: 'MathViz', inputs: [{ label: '3^13', input: { mode: 'pow', x: 3, n: 13 } }, { label: '2^10', input: { mode: 'pow', x: 2, n: 10 } }] },
    edges: ['n = 0 → 1.', '2.0, n = −2 → 0.25.', 'n = −2³¹ → negate as a long, or it overflows.'],
  },

  'reverse-integer': {
    aha: 'Pop the last digit with x % 10 (which keeps the sign in Java) and push it onto rev with rev · 10 + d. Without 64-bit integers, check before each push: if rev is already beyond 214748364, or equal to it with a last digit above 7 (below −8 for negatives), the result would overflow: return 0.',
    asks: {
      read: 'What should overflow return? What can\'t you use?',
      budget: 'At most 10 digits. What is the real difficulty?',
      observe: 'Why does 1534236469 overflow when reversed?',
      brute: 'Reversing in a long and checking at the end: why is it not allowed?',
      pattern: 'Before rev = rev · 10 + d, how can you tell it would overflow?',
      watch: 'Watch digits move over, with the limit check before each push.',
    },
    read: [
      { phrase: 'If the reversed value is outside the 32-bit signed range', says: 'Return 0 on overflow.' },
      { phrase: 'Assume you cannot store 64-bit integers', says: 'Check before multiplying, against MAX / 10.' },
    ],
    budget: { from: '32-bit x', rows: [['≤ 10 digits', '10 steps', 'ok', 'instant']], aim: 'O(log₁₀ x)', note: 'The whole problem is the overflow check.' },
    observe: [
      {
        title: 'Pop and push',
        text: '−123: pop −3, rev −3; pop −2, rev −32; pop −1, rev −321. The sign rides along with %.',
        sketch: { kind: 'array', rows: [{ items: [-3, -32, -321], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Check before pushing',
        text: 'Reversing 1534236469 reaches rev = 964632435 with a digit still to push: 964632435 > 214748364, so ×10 would overflow → 0.',
        sketch: { kind: 'array', rows: [{ items: ['rev 964632435', '> 214748364', '→ 0'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Reverse the digit string, parse it as a 64-bit number, and compare it with the limits.', cost: 'O(digits)', waste: 'Not slow, but it uses the 64-bit storage the problem forbids.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'while (x != 0) { d = x % 10; x /= 10; if (rev > MAX/10 || (rev == MAX/10 && d > 7)) return 0; if (rev < MIN/10 || (rev == MIN/10 && d < −8)) return 0; rev = rev·10 + d; } return rev.',
      not: [notBrute('string-matching', 'Reversing a string is easy; the overflow rule is what matters.'), notBrute('bit-manipulation', 'The limits are decimal: bit tricks don\'t help.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '−123', input: { mode: 'reverse', x: -123 } }, { label: '1563847412 (overflows)', input: { mode: 'reverse', x: 1563847412 } }] },
    edges: ['120 → 21.', '−123 → −321.', '1534236469 → 0.'],
  },

  'factorial-trailing-zeroes': {
    aha: 'A trailing zero is a factor 10 = 2 × 5, and n! has far more 2s than 5s, so count the 5s. Every multiple of 5 contributes one, every multiple of 25 one more, every multiple of 125 another: zeros = n/5 + n/25 + n/125 + …',
    asks: {
      read: 'Can you compute n! itself?',
      budget: 'n ≤ 10⁴. What overflows, and what doesn\'t need to be computed?',
      observe: 'Why does 25 contribute two zeros to 30!?',
      brute: 'Counting the factors of 5 in every number 1..n: what does it cost?',
      pattern: 'Which prime factor limits the number of 10s?',
      watch: 'Watch the multiples of 5, then of 25, add their factors.',
    },
    read: [
      { phrase: 'Computing `n!` itself overflows almost immediately', says: 'Count factors instead.' },
      { phrase: 'Every trailing zero comes from a factor of 10 = 2 × 5, and 5s are the rarer factor', says: 'Count the 5s in 1..n.' },
      { phrase: 'count the multiples of 5, 25, 125', says: 'n/5 + n/25 + …' },
    ],
    budget: { from: 'n ≤ 10⁴', rows: [['n! as a big number', 'huge', 'bad', 'pointless'], ['count 5s per number', 'O(n log n)', 'ok', 'fine'], ['n/5 + n/25 + …', 'O(log n)', 'ok', 'the answer']], aim: 'O(log₅ n)', note: 'Use p ≤ n / 5 in the loop to avoid overflowing p.' },
    observe: [
      {
        title: 'Multiples of 5',
        text: 'Up to 30: 5, 10, 15, 20, 25, 30 each give one 5: six so far.',
        sketch: { kind: 'array', rows: [{ items: [5, 10, 15, 20, 25, 30], marks: { 4: 'hit' } }], caption: '30 / 5 = 6' },
      },
      {
        title: '25 gives a second 5',
        text: '25 = 5 · 5, so it adds one more: 30 / 25 = 1. Total 7 zeros.',
        sketch: { kind: 'array', rows: [{ items: ['6', '+ 1', '= 7'], marks: { 2: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every number 1..n, count how many times 5 divides it, and add up.', cost: 'O(n log n)', waste: 'It visits every number; grouping by "divisible by 5, by 25, …" counts them in log₅ n divisions.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'zeros = 0; for (p = 5; p ≤ n; p *= 5) zeros += n / p. O(log n).',
      not: [notBrute('contribution-technique', 'Counting each number\'s factors is contribution; the per-power grouping is the shortcut.'), notBrute('dp-linear', 'Nothing depends on smaller answers.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: 'n = 30', input: { mode: 'trailing', n: 30 } }, { label: 'n = 25', input: { mode: 'trailing', n: 25 } }] },
    edges: ['n = 3 → 0.', 'n = 5 → 1.', 'n = 25 → 6.'],
  },

  'count-good-numbers': {
    aha: 'Positions are independent: each even index has 5 choices (0, 2, 4, 6, 8) and each odd index 4 (2, 3, 5, 7). There are ⌈n/2⌉ even and ⌊n/2⌋ odd positions, so the count is 5^⌈n/2⌉ · 4^⌊n/2⌋ mod 10⁹ + 7, using fast modular exponentiation because n reaches 10¹⁵.',
    asks: {
      read: 'Are leading zeros allowed? Which digits go where?',
      budget: 'n up to 10¹⁵. Can you loop over positions?',
      observe: 'For n = 4, how many choices does each position have?',
      brute: 'Generating digit strings: why hopeless?',
      pattern: 'When choices are independent, how do you combine them?',
      watch: 'Watch the choices per position, then the two powers.',
    },
    read: [
      { phrase: 'digits at even indices (0, 2, 4, …) are even', says: '5 choices per even index.' },
      { phrase: 'the digits at odd indices are prime (2, 3, 5, 7)', says: '4 choices per odd index.' },
      { phrase: 'modulo `10^9 + 7`', says: 'Fast power modulo p.' },
    ],
    budget: { from: 'n ≤ 10¹⁵', rows: [['loop over positions', '10¹⁵', 'bad', 'impossible'], ['fast power', '≈ 100 multiplications', 'ok', 'instant']], aim: 'O(log n)', note: 'Multiply in longs and reduce after each step.' },
    observe: [
      {
        title: 'Independent choices multiply',
        text: 'n = 4: positions 0, 2 have 5 choices, positions 1, 3 have 4: 5 · 4 · 5 · 4 = 400.',
        sketch: { kind: 'array', rows: [{ items: ['5', '4', '5', '4'], marks: { 0: 'hit', 2: 'hit' } }], caption: '5² · 4² = 400' },
      },
      {
        title: 'Odd length gets the extra 5',
        text: 'n = 1: only index 0, which is even: 5 strings.',
        sketch: { kind: 'array', rows: [{ items: ['0', '2', '4', '6', '8'] }], caption: '5' },
      },
    ],
    brute: { idea: 'Enumerate all 10ⁿ digit strings and check each.', cost: 'O(10ⁿ · n)', waste: 'Every position is checked separately in every string, though its choices never depend on the others.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'answer = pow(5, (n + 1) / 2) · pow(4, n / 2) mod 10⁹ + 7 with square-and-multiply. O(log n).',
      not: [notBrute('dp-linear', 'A DP over positions is O(n), far too slow for 10¹⁵.'), notBrute('backtracking', 'Generating strings is exponential.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: 'n = 4', input: { mode: 'good', n: 4 } }, { label: 'n = 1', input: { mode: 'good', n: 1 } }] },
    edges: ['n = 1 → 5.', 'n = 4 → 400.', 'n = 50 → 564908303.'],
  },

  'shuffle-an-array': {
    aha: 'Fisher–Yates: for each position i from the left, pick j uniformly from i to the end and swap a[i] with a[j]. Position i then holds a uniformly random choice among the elements not yet placed, so all n! orders are equally likely. reset returns a saved copy.',
    asks: {
      read: 'What does "every permutation equally likely" require?',
      budget: 'n ≤ 50, 10⁴ calls. What should one shuffle cost?',
      observe: 'Why is swapping each i with a random j from the WHOLE array biased?',
      brute: 'Sorting by random keys: what does it cost?',
      pattern: 'How do you build a random order one position at a time?',
      watch: 'Watch the prefix become final while j is drawn from the rest.',
    },
    read: [
      { phrase: 'every permutation must be equally likely', says: 'Uniform over n! orders: Fisher–Yates.' },
      { phrase: 'returns the array to its original order', says: 'Keep a copy of the original.' },
    ],
    budget: { from: 'n ≤ 50, ≤ 10⁴ calls', rows: [['sort by random keys', 'O(n log n)', 'ok', 'works'], ['Fisher–Yates', 'O(n)', 'ok', 'the standard']], aim: 'O(n) per shuffle', note: 'Use one shared Random instance.' },
    observe: [
      {
        title: 'Draw from what is left',
        text: 'At i = 0, j is any of 5 positions; at i = 1, any of the 4 not yet placed; and so on: 5 · 4 · 3 · 2 = 120 = 5! equally likely outcomes.',
        sketch: { kind: 'array', rows: [{ items: [3, 1, 4, 5, 2], marks: { 0: 'hit', 1: 'hit' }, tags: { 2: [['i', 'accent']] } }] },
      },
      {
        title: 'The naive swap is biased',
        text: 'Swapping with j from the whole array gives nⁿ equally likely runs. 3³ = 27 isn\'t divisible by 3! = 6, so some orders must come up more often.',
        sketch: { kind: 'array', rows: [{ items: ['27 runs', '6 orders', 'not even'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Attach a random key to every element and sort by it.', cost: 'O(n log n)', waste: 'Correct (with distinct keys), but sorting does more work than n random swaps.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'for i in 0..n−2: j = i + rand.nextInt(n − i); swap(a[i], a[j]). reset: return a copy of the original. O(n).',
      not: [notBrute('sorting-and-selection', 'Sorting by random keys works but is slower and subtle with equal keys.'), notBrute('backtracking', 'Generating all permutations and picking one is n!.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '[1, 2, 3, 4, 5]', input: { mode: 'shuffle', nums: [1, 2, 3, 4, 5], seed: 7 } }, { label: '[1, 2, 3]', input: { mode: 'shuffle', nums: [1, 2, 3], seed: 11 } }] },
    edges: ['One element → always the same array.', 'reset after shuffles → the original order.', 'Every shuffle → a permutation of the original values.'],
  },

  'linked-list-random-node': {
    aha: 'Reservoir sampling: walk the list once, and at the i-th node replace the current choice with probability 1/i. The first node is kept for sure; node i survives to the end with probability 1/i · i/(i + 1) · … · (n − 1)/n = 1/n. O(1) extra memory, no length needed.',
    asks: {
      read: 'What does the follow-up assume about the list\'s length?',
      budget: 'Storing the values in an array works. What does the follow-up forbid?',
      observe: 'With 3 nodes, what is the chance the first one is still chosen at the end?',
      brute: 'Counting the length, then walking to a random index: what does it cost?',
      pattern: 'How can you keep a fair choice while the list keeps getting longer?',
      watch: 'Watch each node take over with probability 1/i.',
    },
    read: [
      { phrase: 'returns the value of a node chosen uniformly at random', says: 'Every node with probability 1/n.' },
      { phrase: 'as if the list were too long to know its length in advance', says: 'One pass, choosing as you go: reservoir sampling.' },
    ],
    budget: { from: '≤ 10⁴ nodes and calls', rows: [['copy into an array', 'O(n) memory, O(1) per call', 'ok', 'simplest'], ['reservoir', 'O(1) memory, O(n) per call', 'ok', 'the follow-up']], aim: 'O(n) per call, O(1) memory', note: 'Two passes (length, then index) also use O(1) memory.' },
    observe: [
      {
        title: 'Replace with probability 1/i',
        text: 'Node 1 is taken (1/1). Node 2 replaces it with probability 1/2, node 3 with 1/3.',
        sketch: { kind: 'array', rows: [{ items: ['1/1', '1/2', '1/3', '1/4'] }] },
      },
      {
        title: 'Everyone ends at 1/n',
        text: 'Node 1 with 3 nodes: kept with 1 · (1 − 1/2) · (1 − 1/3) = 1/3. Node 3: chosen with 1/3. Fair.',
        sketch: { kind: 'array', rows: [{ items: ['1 · 1/2 · 2/3', '= 1/3'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Count the nodes, pick a random index, and walk to it.', cost: 'O(n) per call, two passes', waste: 'Fine when the length is known; the follow-up wants one pass with no length.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'i = 0; for each node: i++; if (rand.nextInt(i) == 0) chosen = node.val. Return chosen. O(n) per call, O(1) memory.',
      not: [notBrute('linked-list-manipulation', 'The list is only read; the idea is the probability argument.'), notBrute('two-pointers', 'One pointer walks the list once.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '[4, 8, 1, 6, 3]', input: { mode: 'reservoir', nums: [4, 8, 1, 6, 3], seed: 3 } }, { label: '[1, 2, 3]', input: { mode: 'reservoir', nums: [1, 2, 3], seed: 9 } }] },
    edges: ['One node → always that value.', 'Equal values → the value is returned with combined probability.', 'Every call → some value from the list.'],
  },

  'implement-rand10-using-rand7': {
    aha: 'Two calls of rand7 give one of 49 equally likely cells: (r1 − 1) · 7 + r2. 49 isn\'t a multiple of 10, so keep only cells 1..40 (each value 1..10 appears in exactly four of them) and roll again on 41..49. Every accepted cell is equally likely, so every value is.',
    asks: {
      read: 'What is the only source of randomness?',
      budget: 'How many rand7 calls does rand10 need on average?',
      observe: 'Why is rand7() + rand7() − 1 (range 1..13) not uniform?',
      brute: 'Mapping 7 outcomes onto 10 values directly: why is it impossible?',
      pattern: 'How can two rolls produce a bigger uniform range?',
      watch: 'Watch rolls land on a 7 × 7 grid, with 41..49 rejected.',
    },
    read: [
      { phrase: 'returns a uniformly random integer from 1 to 7', says: 'Combine rolls to get a bigger uniform range.' },
      { phrase: 'implement `rand10()`, which returns a uniformly random integer from 1 to 10', says: 'Use a multiple of 10 of the outcomes; reject the rest.' },
    ],
    budget: { from: '≤ 10⁵ calls', rows: [['rejection on 49 cells', '2 × 49/40 ≈ 2.45 rand7 per call', 'ok', 'expected O(1)']], aim: 'Expected O(1) per call', note: 'Reusing rejected cells (9 leftover outcomes) lowers the average further.' },
    observe: [
      {
        title: 'A 7 × 7 grid',
        text: 'Row = first roll, column = second: 49 equally likely cells. Cells 1..40 map to 1..10 four times each.',
        sketch: { kind: 'grid', grid: [['1', '2', '3', '4', '5', '6', '7'], ['8', '9', '10', '1', '2', '3', '4']], marks: { '1,2': 'hit' } },
      },
      {
        title: 'Sums are not uniform',
        text: 'rand7 + rand7 makes 8 in 7 ways but 2 in only 1 way. Indexing a grid keeps every cell at 1/49.',
        sketch: { kind: 'array', rows: [{ items: ['sum 2: 1 way', 'sum 8: 7 ways'], marks: { 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Map rand7\'s 7 outcomes onto 1..10 directly (for example rand7() % 10 + …).', cost: 'O(1)', waste: 'Seven outcomes can\'t be split evenly into ten values; some values come up more often.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'do { idx = (rand7() − 1) · 7 + rand7(); } while (idx > 40); return 1 + (idx − 1) % 10. Expected 2.45 calls.',
      not: [notBrute('bit-manipulation', 'Building bits from rand7 needs its own rejection step.'), notBrute('greedy', 'Nothing to choose: the fairness argument decides.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: 'two rejections first', input: { mode: 'rand10', rolls: [[7, 4], [6, 7], [3, 5], [1, 2]] } }, { label: 'accepted at once', input: { mode: 'rand10', rolls: [[2, 3]] } }] },
    edges: ['Rolls 2, 3 → cell 10 → 10.', 'Rolls 7, 4 → cell 46 → rejected, roll again.', 'Every returned value → in 1..10.'],
  },

  'plus-one': {
    aha: 'Add one at the last digit. A digit below 9 just goes up by one and you are done. A 9 becomes 0 and the carry moves left. If every digit was 9, the result is a 1 followed by zeros, one digit longer.',
    asks: {
      read: 'Can the result be longer than the input?',
      budget: 'Up to 100 digits. Can you convert to a long?',
      observe: 'What happens to [1, 2, 9, 9]?',
      brute: 'Parsing into a number, adding one, and splitting: why does it fail?',
      pattern: 'When does the carry stop?',
      watch: 'Watch the carry move left through the 9s.',
    },
    read: [
      { phrase: 'represents a large non-negative integer', says: 'Too big for any built-in type: work digit by digit.' },
      { phrase: 'the carry runs off the front, so the result has one more digit', says: 'All 9s: a new leading 1.' },
    ],
    budget: { from: '≤ 100 digits', rows: [['parse as a number', 'overflows', 'bad', 'wrong'], ['carry from the right', 'O(n)', 'ok', 'the answer']], aim: 'O(n) worst case, usually O(1)', note: 'Stop at the first digit below 9.' },
    observe: [
      {
        title: 'Carry through the 9s',
        text: '[1, 2, 9, 9]: the two 9s become 0s, then 2 becomes 3: [1, 3, 0, 0].',
        sketch: { kind: 'array', rows: [{ items: [1, 3, 0, 0], marks: { 1: 'hit', 2: 'dim', 3: 'dim' } }] },
      },
      {
        title: 'All 9s',
        text: '[9, 9, 9] → every digit becomes 0 and a 1 is added in front: [1, 0, 0, 0].',
        sketch: { kind: 'array', rows: [{ items: [1, 0, 0, 0], marks: { 0: 'hit' } }] },
      },
    ],
    brute: { idea: 'Turn the digits into a number, add 1, and turn it back.', cost: 'O(n)', waste: 'Breaks past 18 digits (long overflow); the carry only ever touches the trailing 9s.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'for i from the end: if (d[i] < 9) { d[i]++; return d; } d[i] = 0. Return [1, 0, …, 0] of length n + 1.',
      not: [notBrute('two-pointers', 'One index moves right to left.'), notBrute('bit-manipulation', 'The digits are decimal.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '[1, 2, 9, 9]', input: { mode: 'plusone', digits: [1, 2, 9, 9] } }, { label: '[9, 9, 9]', input: { mode: 'plusone', digits: [9, 9, 9] } }] },
    edges: ['[1, 2, 3] → [1, 2, 4].', '[9] → [1, 0].', '[0] → [1].'],
  },

  'roman-to-integer': {
    aha: 'Read left to right and add each symbol\'s value, except when it is smaller than the symbol right after it: then it is the first half of a subtractive pair (IV, IX, XL, XC, CD, CM) and is subtracted instead.',
    asks: {
      read: 'When is a symbol subtracted?',
      budget: 'At most 15 symbols. What matters?',
      observe: 'In MCMXCIV, which symbols are subtracted?',
      brute: 'Matching each of the six pairs explicitly: does it work?',
      pattern: 'What does "a smaller symbol before a larger one" tell you, in one comparison?',
      watch: 'Watch each symbol added or subtracted by comparing with its right neighbour.',
    },
    read: [
      { phrase: 'Symbols are usually written largest to smallest, left to right, and added up', says: 'Default: add.' },
      { phrase: 'a smaller symbol before a larger one is subtracted', says: 'Compare each symbol with the next one.' },
    ],
    budget: { from: '≤ 15 symbols', rows: [['one pass', '15', 'ok', 'instant']], aim: 'O(n)', note: 'A switch or a small array for the values.' },
    observe: [
      {
        title: 'Smaller before larger: subtract',
        text: 'MCMXCIV: C before M, X before C, I before V are subtracted. 1000 − 100 + 1000 − 10 + 100 − 1 + 5 = 1994.',
        sketch: { kind: 'array', rows: [{ items: ['M', 'C', 'M', 'X', 'C', 'I', 'V'], marks: { 1: 'bad', 3: 'bad', 5: 'bad' } }], caption: '1994' },
      },
      {
        title: 'Otherwise add',
        text: 'LVIII: every symbol is at least as big as the next: 50 + 5 + 1 + 1 + 1 = 58.',
        sketch: { kind: 'array', rows: [{ items: ['L', 'V', 'I', 'I', 'I'] }], caption: '58' },
      },
    ],
    brute: { idea: 'Check for each of the six two-letter pairs first, then fall back to single symbols.', cost: 'O(n)', waste: 'Correct; the neighbour comparison just replaces six special cases with one rule.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'for i: v = val(s[i]); if (i + 1 < n && v < val(s[i + 1])) total −= v; else total += v. O(n).',
      not: [notBrute('hashing', 'A map from symbol to value is a lookup table, not the idea.'), notBrute('stack-patterns', 'No nesting: one neighbour comparison is enough.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: 'MCMXCIV', input: { mode: 'roman', s: 'MCMXCIV' } }, { label: 'LVIII', input: { mode: 'roman', s: 'LVIII' } }] },
    edges: ['III → 3.', 'LVIII → 58.', 'MCMXCIV → 1994.'],
  },

  'excel-sheet-column-title': {
    aha: 'It is base 26 with digits A..Z = 1..26 and no zero. Subtract 1 before each step to shift the digits to 0..25; then n % 26 gives the last letter and n / 26 the rest, as in an ordinary base conversion. Letters come out right to left.',
    asks: {
      read: 'Which number is A, and which is Z?',
      budget: 'n up to 2³¹. How many letters at most?',
      observe: 'Why is 26 "Z" and not "A@"?',
      brute: 'Counting titles up from A: what does it cost?',
      pattern: 'Which numbering system has no zero digit, and how do you fix that?',
      watch: 'Watch n shift down by one, then give up a letter.',
    },
    read: [
      { phrase: 'Given `columnNumber` (where `1` is `A`)', says: 'Digits run 1..26: subtract 1 to get 0..25.' },
      { phrase: 'after A–Z come AA (27) and AB (28)', says: 'Like base 26, but without a zero digit.' },
    ],
    budget: { from: 'n ≤ 2³¹ − 1', rows: [['count up from A', '2 × 10⁹', 'bad', 'too slow'], ['base conversion', '≤ 7 letters', 'ok', 'instant']], aim: 'O(log₂₆ n)', note: 'Build in a StringBuilder and reverse.' },
    observe: [
      {
        title: 'Shift, then convert',
        text: '28: 28 − 1 = 27; 27 % 26 = 1 → B; 27 / 26 = 1. Then 1 − 1 = 0 → A. Read backwards: AB.',
        sketch: { kind: 'array', rows: [{ items: ['A', 'B'], marks: { 1: 'hit' } }] },
      },
      {
        title: 'Without the shift',
        text: '26 % 26 = 0 has no letter: the shift makes 26 → 25 → Z.',
        sketch: { kind: 'array', rows: [{ items: ['26 − 1 = 25', '→ Z'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Start at "A" and increment the title n − 1 times, like an odometer.', cost: 'O(n)', waste: 'Every intermediate title is built; the base conversion goes straight to the answer.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'while (n > 0) { n--; sb.append((char) (\'A\' + n % 26)); n /= 26; } return sb.reverse(). O(log n).',
      not: [notBrute('string-matching', 'Nothing is matched; letters are digits.'), notBrute('bit-manipulation', 'The base is 26, not 2.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '701', input: { mode: 'excel', n: 701 } }, { label: '52', input: { mode: 'excel', n: 52 } }] },
    edges: ['1 → "A".', '28 → "AB".', '701 → "ZY".'],
  },

  'greatest-common-divisor-of-strings': {
    aha: 'If both strings are copies of one piece x, then str1 + str2 and str2 + str1 are both copies of x, so they are equal; if they differ, no divisor exists. When they are equal, the largest piece has length gcd(len1, len2), so the answer is that prefix.',
    asks: {
      read: 'What does "t divides s" mean?',
      budget: 'Lengths up to 1000. Can you try every prefix?',
      observe: 'For "ABABAB" and "ABAB", what is the longest common building block?',
      brute: 'Trying every prefix length and checking both strings: what does it cost?',
      pattern: 'Which number theory fact gives the length of the largest common piece?',
      watch: 'Watch the concatenation test, then the gcd-length prefix.',
    },
    read: [
      { phrase: 'if `s` is `t` concatenated with itself one or more times', says: 'Both strings must be repeats of the same piece.' },
      { phrase: 'Return the largest string `x` that divides both', says: 'Its length is gcd of the two lengths.' },
    ],
    budget: { from: 'lengths ≤ 1000', rows: [['every prefix length', '1000 × 2000', 'ok', 'fine'], ['concat test + gcd', '2000', 'ok', 'cleaner']], aim: 'O(m + n)', note: 'The concatenation test is the clever bit.' },
    observe: [
      {
        title: 'The swap test',
        text: '"ABABAB" + "ABAB" = "ABABABABAB" = "ABAB" + "ABABAB": both built from "AB".',
        sketch: { kind: 'array', rows: [{ items: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'The length is a gcd',
        text: 'gcd(6, 4) = 2: the prefix "AB". For "LEET" and "CODE" the swap test fails: "".',
        sketch: { kind: 'array', rows: [{ items: ['gcd(6, 4) = 2', '"AB"'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'For each prefix length from the shorter string\'s length down, check whether it divides both strings.', cost: 'O(min(m, n) · (m + n))', waste: 'Most lengths can\'t divide both lengths; only gcd(m, n) is ever the answer.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'if (!(a + b).equals(b + a)) return ""; return a.substring(0, gcd(a.length(), b.length())). O(m + n).',
      not: [notBrute('string-matching', 'KMP\'s period trick also works, but the swap test is simpler.'), notBrute('two-pointers', 'No pointer search is needed.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '"ABABAB", "ABAB"', input: { mode: 'gcdstr', a: 'ABABAB', b: 'ABAB' } }, { label: '"LEET", "CODE"', input: { mode: 'gcdstr', a: 'LEET', b: 'CODE' } }] },
    edges: ['"ABCABC", "ABC" → "ABC".', '"ABABAB", "ABAB" → "AB".', '"LEET", "CODE" → "".'],
  },

  'multiply-strings': {
    aha: 'Long multiplication with an array of m + n digits: the product of a[i] and b[j] belongs at positions i + j and i + j + 1. Add each digit product into position i + j + 1, keep its last digit there, and carry the tens into position i + j. Strip leading zeros at the end.',
    asks: {
      read: 'What can\'t you use?',
      budget: 'Up to 200 digits each. How many digit products?',
      observe: 'For "123" × "456", where does 3 × 6 = 18 go?',
      brute: 'Adding num1 to itself num2 times: what does it cost?',
      pattern: 'Where does the product of a[i] and b[j] land in the result?',
      watch: 'Watch each digit of num1 add its row into the result digits.',
    },
    read: [
      { phrase: 'Do not use a built-in big-integer library', says: 'Digit-by-digit arithmetic.' },
      { phrase: 'with every digit product added into its place', says: 'a[i] · b[j] goes to positions i + j and i + j + 1.' },
    ],
    budget: { from: '≤ 200 digits each', rows: [['repeated addition', '10²⁰⁰', 'bad', 'impossible'], ['digit products', '200 × 200', 'ok', 'instant']], aim: 'O(m · n)', note: 'The product has at most m + n digits.' },
    observe: [
      {
        title: 'Where a product lands',
        text: '"123" × "456": 3 × 6 = 18 → 8 at position 2 + 2 + 1 = 5, carry 1 to position 4.',
        sketch: { kind: 'array', rows: [{ items: [0, 0, 0, 0, 1, 8], marks: { 4: 'cur', 5: 'hit' } }], caption: 'result positions 0..5' },
      },
      {
        title: 'The final digits',
        text: 'After all nine products and carries: 0 5 6 0 8 8 → strip the leading zero: "56088".',
        sketch: { kind: 'array', rows: [{ items: [0, 5, 6, 0, 8, 8], marks: { 0: 'dim' } }], caption: '"56088"' },
      },
    ],
    brute: { idea: 'Add num1 to an accumulator num2 times, using string addition.', cost: 'O(num2 · m)', waste: 'num2 can be a 200-digit number of additions; long multiplication needs only m · n digit products.' },
    pattern: {
      pick: 'math-for-interviews',
      why: 'res = int[m + n]; for i, j from the right: sum = a[i]·b[j] + res[i + j + 1]; res[i + j + 1] = sum % 10; res[i + j] += sum / 10. Skip leading zeros. O(m · n).',
      not: [notBrute('divide-and-conquer', 'Karatsuba is faster for huge numbers but overkill for 200 digits.'), notBrute('dp-grid', 'The i + j positions look like a grid, but nothing is optimised.')],
    },
    watch: { viz: 'MathWalkViz', inputs: [{ label: '"123" × "456"', input: { mode: 'multiply', a: '123', b: '456' } }, { label: '"99" × "99"', input: { mode: 'multiply', a: '99', b: '99' } }] },
    edges: ['"2" × "3" → "6".', '"0" × "52" → "0".', '"123" × "456" → "56088".'],
  },
};
