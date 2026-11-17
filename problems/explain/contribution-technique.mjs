export default {
  'sum-of-all-odd-length-subarrays': {
    explain: 'The odd-length subarrays of `[1,4,2,5,3]` are the five single elements (sum 15), the three of length 3: `[1,4,2]` = 7, `[4,2,5]` = 11, `[2,5,3]` = 10, and the whole array (15). 15 + 7 + 11 + 10 + 15 = `58`.',
  },
  'number-of-zero-filled-subarrays': {
    explain: '`[1,3,0,0,2,0,0,4]` has two blocks of two zeros. Each block holds `[0]` twice and `[0,0]` once: 3 subarrays. Two blocks give `6`.',
  },
  'vowels-of-all-substrings': {
    explain: 'The substrings of "aba" are "a", "b", "a", "ab", "ba" and "aba", with 1, 0, 1, 1, 1 and 2 vowels. The total is `6`.',
  },
  'total-hamming-distance': {
    explain: 'In 4 bits: 4 = 0100, 14 = 1110, 2 = 0010. 4 and 14 differ in 2 positions, 4 and 2 in 2, and 14 and 2 in 2, so the total is `6`.',
  },
  'bitwise-xor-of-all-pairings': {
    explain: 'nums3 = [8,0,7,2, 11,3,4,1, 9,1,6,3] (2, 1 and 3 each XOR-ed with 10, 2, 5 and 0). XOR-ing all twelve gives `13`, the same as XOR-ing 2, 1 and 3 (each appears 4 times, an even number, so they cancel) with 10, 2, 5 and 0 (each appears 3 times).',
  },
  'sum-of-absolute-differences-in-a-sorted-array': {
    explain: 'For 2: |2−2| + |2−3| + |2−5| = 4. For 3: 1 + 0 + 2 = 3. For 5: 3 + 2 + 0 = 5. So the answer is `[4,3,5]`.',
  },
  'sum-of-distances': {
    explain: 'The value 1 sits at indices 0, 2 and 3. For index 0 that is |0−2| + |0−3| = 5, for index 2 it is 2 + 1 = 3, for index 3 it is 3 + 1 = 4. The 3 and the 2 appear once, so they get 0: `[5,0,3,4,0]`.',
  },
  'subarray-product-less-than-k': {
    explain: 'The 8 subarrays with product below 100 are [10], [5], [2], [6], [10,5], [5,2], [2,6] and [5,2,6]. [10,5,2] has product exactly 100, which is not strictly less, so the answer is `8`.',
  },
  'count-subarrays-where-max-element-appears-at-least-k-times': {
    explain: 'The maximum is 3. The subarrays containing at least two 3s are [1,3,2,3], [1,3,2,3,3], [3,2,3], [3,2,3,3], [2,3,3] and [3,3]: `6`.',
  },
  'sum-of-subarray-ranges': {
    explain: 'The subarrays of [1,2,3] are [1], [2], [3] (range 0 each), [1,2] and [2,3] (range 1 each) and [1,2,3] (range 2). The total is 0 + 0 + 0 + 1 + 1 + 2 = `4`.',
  },
  'minimum-fuel-cost-to-report-to-the-capital': {
    explain: 'Cities 1, 2 and 3 are each one road from the capital. Each representative drives straight there in their own car, one litre each, for `3`. Sharing wouldn\'t help: they don\'t pass through each other\'s cities.',
  },
  'sum-of-subsequence-widths': {
    explain: 'The non-empty subsequences of [2,1,3] are [2], [1], [3], [2,1], [2,3], [1,3] and [2,1,3], with widths 0, 0, 0, 1, 1, 2 and 2. Their sum is `6`.',
  },
  'total-appeal-of-a-string': {
    explain: '"abbca" has 15 substrings. Adding their numbers of distinct letters (5 of length 1 with appeal 1, then "ab" 2, "bb" 1, "bc" 2, "ca" 2, "abb" 2, "bbc" 2, "bca" 3, "abbc" 3, "bbca" 3 and "abbca" 3) gives `28`.',
  },
  'count-unique-characters-of-all-substrings-of-a-given-string': {
    explain: 'The substrings of "ABC" are "A", "B", "C", "AB", "BC" and "ABC". Every letter in each of them appears once, so they add 1 + 1 + 1 + 2 + 2 + 3 = `10`.',
  },
  'count-subarrays-with-score-less-than-k': {
    explain: 'The subarrays with score below 10 are [2] (2), [1] (1), [4] (4), [3] (3), [5] (5) and [2,1] ((2 + 1) × 2 = 6). [1,4] already scores 10, so the answer is `6`.',
  },
  'sum-of-total-strength-of-wizards': {
    explain: 'The ten groups of [1,3,1,2] and their min × sum: [1] 1, [3] 9, [1] 1, [2] 4, [1,3] 4, [3,1] 4, [1,2] 3, [1,3,1] 5, [3,1,2] 6, [1,3,1,2] 7. Their total is `44`.',
  },
  'sum-of-distances-in-tree': {
    explain: 'Node 0 is 1 edge from 1 and 2, and 2 edges from 3, 4 and 5: 1 + 1 + 2 + 2 + 2 = 8. Node 2 is 1 from 0, 3, 4 and 5 and 2 from 1: 6. Doing the same for every node gives `[8,12,6,10,10,10]`.',
  },
};
