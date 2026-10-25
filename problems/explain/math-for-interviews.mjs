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
  'plus-one': {
    explain: 'The digits represent 123, and 123 + 1 = 124, so the answer is `[1,2,4]`.',
    more: 'For example `[9]` becomes `[1,0]`: the carry runs off the front, so the result has one more digit.',
  },
  'roman-to-integer': {
    explain: '"III" is three I symbols, 1 + 1 + 1 = 3.',
    more: 'For example "MCMXCIV" = M (1000) + CM (900) + XC (90) + IV (4) = 1994.',
  },
  'excel-sheet-column-title': {
    explain: 'Column 1 is the very first column of the sheet, so its title is "A".',
    more: 'For example 28 is "AB": after A–Z come AA (27) and AB (28).',
  },
  'greatest-common-divisor-of-strings': {
    explain: '"ABC" repeated twice gives "ABCABC" and once gives "ABC", and no longer string divides both, so the answer is "ABC".',
  },
  'multiply-strings': {
    explain: 'The numbers are 2 and 3, and 2 × 3 = 6, so the answer is "6".',
    more: 'For example "123" × "456" = "56088", with every digit product added into its place.',
  },
};
