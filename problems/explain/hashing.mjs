export default {
  'two-sum': {
    explain: '`nums[0] + nums[1]` is 2 + 7 = 9, the target, so the answer is `[0,1]`. A hash map from value to index finds the partner of each number in one pass.',
  },
  'contains-duplicate': {
    explain: 'The value 1 appears at index 0 and again at index 3, so the answer is `true`.',
    more: 'For example `[1,2,3,4]` has all distinct values, so the answer there is `false`. A hash set remembers what you\'ve seen in one pass.',
  },
  'valid-anagram': {
    explain: '"anagram" and "nagaram" both have three a\'s, one n, one g, one r and one m. The letters are the same, just rearranged, so the answer is `true`.',
  },
  'first-unique-character-in-a-string': {
    explain: '"l" appears only once in "leetcode" and it is the first character, so the answer is its index, 0.',
    more: 'For example in "loveleetcode" the first unique character is "v", at index 2. Count every character first, then scan from the start for a count of 1.',
  },
  'group-anagrams': {
    explain: '"eat", "tea" and "ate" use the same letters, as do "tan" and "nat"; "bat" has no partner. The groups are `[["eat","tea","ate"],["bat"],["tan","nat"]]`, in any order.',
  },
  'longest-consecutive-sequence': {
    explain: 'The values 1, 2, 3 and 4 form an unbroken run (their order in the array doesn\'t matter). 100 and 200 stand alone, so the longest run has length 4.',
  },
  'valid-sudoku': {
    explain: 'No row, column or 3 × 3 box contains the same digit twice among its filled cells. The board doesn\'t need to be solvable, only valid so far, so the answer is `true`.',
  },
  'first-missing-positive': {
    explain: '1 and 2 are present, so the smallest positive integer missing from `[1,2,0]` is 3.',
  },
  'concatenation-of-array': {
    explain: '`[1,2,1]` written twice in a row is `[1,2,1,1,2,1]`: positions 0–2 and 3–5 hold the same values.',
  },
  'majority-element': {
    explain: '3 appears twice among three values, which is more than ⌊3 / 2⌋ = 1, so the answer is 3.',
  },
  'encode-and-decode-strings': {
    explain: 'With length-prefixing, the list encodes to "4#neet4#code4#love3#you". Decoding reads 4, takes "neet", reads 4, takes "code", and so on, giving back `["neet","code","love","you"]`.',
  },
  'majority-element-ii': {
    explain: 'n = 3, so a value needs more than ⌊3 / 3⌋ = 1 appearance. Only 3 (twice) qualifies, so the answer is `[3]`.',
  },
  'verifying-an-alien-dictionary': {
    explain: 'The words first differ at their first letter, "h" against "l". In this alphabet h comes before l, so the pair is in order and the answer is `true`.',
    more: 'For example `["word","world","row"]` is `false`: "word" and "world" first differ at d against l, and l comes before d in that alphabet.',
  },
};
