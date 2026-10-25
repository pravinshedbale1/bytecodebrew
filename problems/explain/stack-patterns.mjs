export default {
  'valid-parentheses': {
    explain: 'The single "(" is closed by the ")" right after it, and nothing is left open, so the answer is `true`.',
  },
  'remove-all-adjacent-duplicates-in-string': {
    explain: 'Removing "bb" leaves "aaca", which now has "aa" next to each other. Removing that leaves "ca", which has no adjacent duplicates.',
  },
  'backspace-string-compare': {
    explain: 'In "ab#c" the "#" deletes the "b", leaving "ac". In "ad#c" it deletes the "d", also leaving "ac". The texts match, so the answer is `true`.',
    more: 'You can simulate each editor with a stack, or walk both strings from the end and skip characters that a later `#` would delete.',
  },
  'evaluate-reverse-polish-notation': {
    explain: 'Push 2 and 1, then "+" replaces them with 3. Push 3, then "*" multiplies the two 3s. This is (2 + 1) × 3, which is 9.',
  },
  'asteroid-collision': {
    explain: 'The -5 moves left and meets the 10 moving right. 10 is bigger, so -5 explodes. 5 and 10 move the same way and never meet, leaving `[5,10]`.',
  },
  'simplify-path': {
    explain: 'The trailing slash is dropped, and there are no "." or ".." parts to resolve, so the canonical path is "/home".',
  },
  'basic-calculator-ii': {
    explain: 'Multiplication comes before addition, so 2*2 is 4 first, then 3 + 4 is 7.',
  },
  'decode-string': {
    explain: '"3[a]" expands to "aaa" and "2[bc]" expands to "bcbc". Joined together they give "aaabcbc".',
  },
  'longest-valid-parentheses': {
    explain: 'The first "(" is never closed, but the last two characters "()" form a matched pair. The longest well-formed piece has length 2.',
    more: 'For example in ")()())" the answer is 4, from "()()". Pieces must be contiguous, so the stray ")" in the middle of a string breaks it into separate runs.',
  },
  'baseball-game': {
    explain: 'Record 5 and 2; "C" removes the 2; "D" records 10; "+" records 5 + 10 = 15. The record is 5, 10, 15, which sums to 30.',
  },
  'car-fleet': {
    explain: 'Solo arrival times are 1 (pos 10), 1 (pos 8), 12 (pos 0), 7 (pos 5) and 3 (pos 3). The cars at 10 and 8 arrive together; the car at 3 catches the one at 5 and they arrive at time 7; the car at 0 arrives alone at 12. That is 3 fleets.',
  },
};
