export default {
  'sort-list': {
    explain: 'The list 4 → 2 → 1 → 3 splits into 4 → 2 and 1 → 3. Sorting each half gives 2 → 4 and 1 → 3, and merging them gives `1 → 2 → 3 → 4`, written as `[1,2,3,4]`.',
  },
  'different-ways-to-add-parentheses': {
    explain: '`2-1-1` can be grouped as `(2-1)-1 = 0` or `2-(1-1) = 2`, so the results are 0 and 2, in any order: `[2,0]` and `[0,2]` are both accepted.',
  },
  'longest-substring-with-at-least-k-repeating-characters': {
    explain: 'In `"aaabb"` with k = 3, the letter b appears only twice in the whole string, so no valid substring can contain it. The longest piece without b is `"aaa"`, where a appears 3 times, so the answer is 3.',
  },
};
