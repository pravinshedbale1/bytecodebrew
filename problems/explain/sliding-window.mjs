export default {
  'maximum-average-subarray-i': {
    explain: 'The windows of 4 elements sum to 2, 51 and 42. The best is `[12,-5,-6,50]` with sum 51, and 51 / 4 = 12.75.',
    more: 'Slide a window of exactly `k` elements across the array, adding the element that enters and subtracting the one that leaves, and keep the largest sum.',
  },
  'longest-substring-without-repeating-characters': {
    explain: 'The longest stretch with no repeated letter is "abc" (also "bca" and "cab"), which has length 3. Any 4 consecutive letters repeat one of them.',
  },
  'minimum-size-subarray-sum': {
    explain: 'The subarray `[4,3]` sums to 7, which reaches the target with just 2 elements. No single element is 7 or more, so the answer is 2.',
    more: 'Because every value is positive, growing a window only increases its sum and shrinking it only decreases it, which is what makes the two-pointer window work.',
  },
  'max-consecutive-ones-iii': {
    explain: 'Flip the zeros at index 5 and index 10. Then indices 5 to 10 are all ones, a run of 6, and no choice of two flips does better. The answer is 6.',
    more: 'Equivalently, find the longest window that contains at most `k` zeros: those zeros are the ones you flip.',
  },
  'longest-repeating-character-replacement': {
    explain: 'Replace both "A"s with "B" (or both "B"s with "A") and the whole string becomes one letter repeated, length 4.',
  },
  'permutation-in-string': {
    explain: 's2 contains "ba" at index 3, and "ba" is a rearrangement of "ab", so the answer is `true`.',
    more: 'Only windows of exactly the length of `s1` can match, so slide a window of that size over `s2` and compare letter counts.',
  },
  'find-all-anagrams-in-a-string': {
    explain: 'The substring starting at index 0 is "cba" and the one at index 6 is "bac"; both are rearrangements of "abc". No other start works, so the answer is `[0,6]`.',
  },
  'minimum-window-substring': {
    explain: 'The window "BANC" near the end contains an A, a B and a C, and it is only 4 characters long. Every other window with all three letters is longer, so the answer is "BANC".',
  },
  'subarrays-with-k-different-integers': {
    explain: 'The subarrays with exactly 2 different values are `[1,2]`, `[2,1]`, `[1,2]`, `[2,3]`, `[1,2,1]`, `[2,1,2]` and `[1,2,1,2]`: 7 in total.',
    more: 'A useful trick: the number with exactly k different values equals the number with at most k minus the number with at most k − 1, and "at most" is easy to count with a sliding window.',
  },
  'contains-duplicate-ii': {
    explain: 'The value 1 sits at indices 0 and 3, which are 3 apart, and k = 3 allows that distance, so the answer is `true`.',
    more: 'For example `[1,2,3,1,2,3]` with k = 2 is `false`: every repeated value is exactly 3 positions after its first copy.',
  },
  'find-k-closest-elements': {
    explain: 'Distances from x = 3 are 2, 1, 0, 1, 2. The four smallest are 0, 1, 1 and one of the 2s; on that tie 1 beats 5 because it is smaller, so the answer is `[1,2,3,4]`.',
  },
};
