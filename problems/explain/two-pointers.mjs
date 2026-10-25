export default {
  'valid-palindrome': {
    explain: 'Keeping only letters and digits and lower-casing them gives "amanaplanacanalpanama", which reads the same backwards. So the answer is `true`.',
  },
  'remove-duplicates-from-sorted-array': {
    explain: 'The distinct values are 1 and 2, so k is 2 and the first two slots of `nums` must hold 1, 2. The tests show this as `[2,[1,2]]`: k, then the first k elements.',
  },
  'move-zeroes': {
    explain: 'The non-zero values 1, 3 and 12 keep their order and move to the front, and the two zeros go to the end: `[1,3,12,0,0]`.',
  },
  'squares-of-a-sorted-array': {
    explain: 'The squares are 16, 1, 0, 9 and 100. In ascending order that is `[0,1,9,16,100]`. The largest squares always come from one of the two ends, which is why two pointers work.',
  },
  'two-sum-ii-input-array-is-sorted': {
    explain: '2 + 7 = 9, and 2 and 7 are the first and second numbers. Positions are counted from 1, so the answer is `[1,2]`.',
  },
  'container-with-most-water': {
    explain: 'Use the line of height 8 at index 1 and the line of height 7 at index 8. The water level is the shorter line, 7, and the width is 8 − 1 = 7, so the area is 7 × 7 = 49.',
  },
  '3sum': {
    explain: '-1 + -1 + 2 = 0 and -1 + 0 + 1 = 0. The two -1s let you form the first triplet, but each triplet is listed only once, so the answer is `[[-1,-1,2],[-1,0,1]]`.',
  },
  'sort-colors': {
    explain: 'There are two 0s, two 1s and two 2s, so after sorting in place the array is `[0,0,1,1,2,2]`.',
  },
  'trapping-rain-water': {
    explain: 'One unit sits at index 2, between the bars of height 1 and 2. Between the bars of height 2 and 3 four units collect (1 + 2 + 1 at indices 4 to 6). One more sits at index 9. In total 1 + 4 + 1 = 6.',
    more: 'The water above bar `i` is the smaller of the tallest bar to its left and the tallest bar to its right, minus `height[i]` (or 0 if that is negative).',
  },
  'remove-element': {
    explain: 'Two values in `[3,2,2,3]` are not 3, so k = 2 and the first two slots hold `[2,2]`. The judge prints `[2,[2,2]]`.',
  },
  'reverse-string': {
    explain: 'Swapping the ends of "hello" and moving inwards gives `["o","l","l","e","h"]`: the h and o swap, the e and second l swap, and the middle l stays put.',
  },
  'valid-palindrome-ii': {
    explain: '"aba" already reads the same in both directions, so no deletion is needed and the answer is `true`.',
    more: 'For example "abca" also gives `true`: delete the "c" (or the "b") and "aba" is left.',
  },
  'merge-strings-alternately': {
    explain: 'Taking a letter from each word in turn: a, p, b, q, c, r. The merged string is "apbqcr".',
  },
  'merge-sorted-array': {
    explain: 'The real values are `[1,2,3]` and `[2,5,6]`. Merged in sorted order they give `[1,2,2,3,5,6]`, which fills all six slots of `nums1`.',
  },
  '4sum': {
    explain: 'Sorted, the array is `[-2,-1,0,0,1,2]`. Three different value sets add up to 0: −2 − 1 + 1 + 2, −2 + 0 + 0 + 2 and −1 + 0 + 0 + 1, so the answer is `[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]`.',
  },
  'rotate-array': {
    explain: 'Rotating right by one step three times moves 7, 6 and 5 to the front in turn, giving `[5,6,7,1,2,3,4]`.',
  },
};
