export default {
  'find-greatest-common-divisor-of-array': {
    explain: 'The smallest value is 2 and the largest is 10. The largest number dividing both is 2, so the answer is 2.',
    more: 'Only the minimum and maximum matter, not the values in between. Euclid\'s algorithm finds the GCD quickly: `gcd(a, b) = gcd(b, a mod b)`.',
  },
  'palindrome-number': {
    explain: '121 reversed is still 121, so the answer is `true`.',
    more: 'For example -121 reads "121-" backwards, so it is `false`, and 10 reads "01", also `false`. Reversing only the second half of the digits avoids overflow.',
  },
  'count-primes': {
    explain: 'The primes below 10 are 2, 3, 5 and 7, so the answer is 4.',
    more: 'The sieve of Eratosthenes marks the multiples of each prime as composite, starting from its square; whatever stays unmarked is prime.',
  },
  'powx-n': {
    explain: '2¹⁰ = 1024, so the answer is 1024.0. Squaring repeatedly (2, 4, 16, 256) needs only about log₂ 10 multiplications.',
    more: 'For a negative `n`, compute x raised to `|n|` and take the reciprocal. Converting `n` to a 64-bit value first avoids overflow at the most negative 32-bit integer.',
  },
  'reverse-integer': {
    explain: 'The digits of 123 reversed are 321, which fits in a 32-bit integer, so the answer is 321.',
  },
  'factorial-trailing-zeroes': {
    explain: '3! = 6 has no trailing zeros, so the answer is 0.',
    more: 'Every trailing zero comes from a factor of 10 = 2 × 5, and 5s are the rarer factor. So count the multiples of 5, 25, 125, … up to `n`.',
  },
  'count-good-numbers': {
    explain: 'A 1-digit number has a single digit at index 0, an even position, so it must be even: 0, 2, 4, 6 or 8. That is 5 good numbers.',
  },
  'shuffle-an-array': {
    explain: '`shuffle` may return any of the 6 orderings of `[1,2,3]`, each with equal chance; `reset` returns the original order. The example shows one possible run, `[null,[1,3,2],[1,2,3],[2,3,1]]`.',
  },
  'linked-list-random-node': {
    explain: 'Each `getRandom` returns 1, 2 or 3 with equal chance, independently of earlier calls. The example shows one possible run: `[null,2,2,3,1,1]`.',
  },
  'implement-rand10-using-rand7': {
    explain: 'Called once, `rand10` must return a number from 1 to 10, each equally likely. Any such value is accepted; the example shows `[7]`.',
  },
};
