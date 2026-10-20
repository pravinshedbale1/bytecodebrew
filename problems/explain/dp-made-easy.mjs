export default {
  'fibonacci-number': {
    explain: 'F(2) = F(1) + F(0) = 1 + 0 = 1, so the answer is 1.',
  },
  'climbing-stairs': {
    explain: 'With 2 steps you can climb 1 + 1 or take both at once (2), so there are 2 ways.',
    more: 'For example 3 steps can be climbed as 1 + 1 + 1, 1 + 2 or 2 + 1: 3 ways. In general the number of ways to reach step `n` is the sum of the ways to reach steps `n − 1` and `n − 2`.',
  },
  'min-cost-climbing-stairs': {
    explain: 'Start on step 1 (cost 15) and climb two steps straight past the top. Paying 15 is the cheapest route, so the answer is 15.',
  },
  'n-th-tribonacci-number': {
    explain: 'T(3) = 0 + 1 + 1 = 2 and T(4) = 1 + 1 + 2 = 4, so the answer is 4.',
    more: 'Each term is the sum of the three before it: 0, 1, 1, 2, 4, 7, 13, … . Keeping only the last three values is enough.',
  },
};
