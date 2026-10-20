export default {
  'house-robber': {
    explain: 'Robbing the first and third houses gives 1 + 3 = 4, and they are not next to each other. No allowed choice gives more, so the answer is 4.',
    more: 'You can skip as many houses as you like; the only rule is that two robbed houses are never neighbours. The answer can be 0 only if every house is empty.',
  },
  'house-robber-ii': {
    explain: 'The houses form a circle, so the first and last (both 2) are neighbours and can\'t both be robbed. The best is the middle house alone, so the answer is 3.',
  },
  'maximum-subarray': {
    explain: 'The contiguous run `[4,-1,2,1]` sums to 6. No other run is larger, so the answer is 6.',
    more: 'The subarray must be contiguous (consecutive elements) and contain at least one element.',
  },
  'maximum-product-subarray': {
    explain: '`[2,3]` has product 6. Including -2 makes the product negative, and `[4]` alone is only 4, so the answer is 6.',
    more: 'A negative number flips the sign of a product, so the smallest product so far can become the largest after another negative. Track both the largest and the smallest product ending at each position.',
  },
  'decode-ways': {
    explain: '"12" can be read as 1, 2 ("AB") or as 12 ("L"). That is 2 ways.',
  },
  'word-break': {
    explain: '"leetcode" splits into "leet" + "code", both in the dictionary, so the answer is `true`.',
    more: 'The words must cover `s` exactly, with no letters left over and no overlaps between them.',
  },
  'longest-increasing-subsequence': {
    explain: '`[2,3,7,101]` is strictly increasing and keeps the original order (other choices like `[2,5,7,18]` work too). No increasing subsequence has 5 elements, so the answer is 4.',
  },
  'number-of-longest-increasing-subsequence': {
    explain: 'The longest increasing subsequences have length 4: `[1,3,4,7]` and `[1,3,5,7]`. There are 2 of them.',
  },
  'best-time-to-buy-and-sell-stock-with-cooldown': {
    explain: 'Buy at 1 and sell at 2 (+1), rest one day (cooldown), then buy at 0 and sell at 2 (+2). The total profit is 3.',
  },
  'russian-doll-envelopes': {
    explain: '`[2,3]` fits into `[5,4]`, which fits into `[6,7]`: both sides strictly larger each time. `[6,4]` can\'t join because its height equals `[5,4]`\'s. So the answer is 3.',
  },
};
