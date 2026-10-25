export default {
  'two-sum': {
    statement: `Return the indices of the two numbers in \`nums\` that add up to \`target\`.

Each input has exactly one answer, and you may not use the same element twice (but two different elements can hold the same value). Return the two indices in any order.`,
    constraints: ['2 <= nums.length <= 1e4', '-1e9 <= nums[i] <= 1e9', '-1e9 <= target <= 1e9', 'Exactly one answer exists'],
    hints: [
      'Checking every pair works but is O(n²). For each value x, what single number are you looking for?',
      'You need target − x. A hash map from value to index answers "have I seen it?" in O(1).',
      'Scan once: check the map for target − nums[i] before inserting nums[i]. That order also stops you from pairing an element with itself.',
    ],
  },
  'contains-duplicate': {
    statement: `Return \`true\` if any value appears at least twice in \`nums\`, and \`false\` if every value is distinct.`,
    constraints: ['1 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'Sorting brings equal values next to each other (O(n log n)). Can you do better?',
      'Keep a HashSet of the values seen so far.',
      'Set.add returns false if the value was already there, so you can return true the moment it does.',
    ],
  },
  'valid-anagram': {
    statement: `Return \`true\` if \`t\` is an anagram of \`s\`: it uses exactly the same letters, each the same number of times, possibly in a different order. Otherwise return \`false\`.

Both strings contain lowercase English letters only.`,
    constraints: ['1 <= s.length, t.length <= 5e4', '`s` and `t` have only lowercase English letters'],
    hints: [
      'If the lengths differ, the answer is false straight away.',
      'Count the letters. With only 26 lowercase letters, an int[26] is enough.',
      'Add 1 for each letter of s and subtract 1 for each letter of t. They are anagrams exactly when every count ends at 0.',
    ],
  },
  'first-unique-character-in-a-string': {
    statement: `Find the first character in \`s\` that appears exactly once in the whole string and return its index. If every character repeats, return \`-1\`.`,
    constraints: ['1 <= s.length <= 1e5', '`s` has only lowercase English letters'],
    hints: [
      'You need to know each character\'s total count before you can decide which one is first and unique.',
      'Make two passes: first count every character, then scan again from the left.',
      'Return the first index whose character has count 1. Both passes are O(n) with a 26-entry array.',
    ],
  },
  'group-anagrams': {
    statement: `Group together the strings in \`strs\` that are anagrams of each other (the same letters with the same counts).

Return the groups in any order; the strings inside a group may also be in any order. The empty string is an anagram only of itself.`,
    constraints: ['1 <= strs.length <= 1e4', '0 <= strs[i].length <= 100', '`strs[i]` has only lowercase English letters'],
    hints: [
      'Two words are anagrams if they become identical after some transformation. Which one?',
      'Use a map from a canonical key to the list of words. Sorting the letters of a word gives such a key.',
      'For a faster key, count the 26 letters and join the counts into a string (like "1#0#2#…"). That is O(length) per word instead of O(length log length).',
    ],
  },
  'longest-consecutive-sequence': {
    statement: `\`nums\` is unsorted and may contain duplicates. Return the length of the longest sequence of consecutive integers (such as \`4, 5, 6, 7\`) whose values all appear in \`nums\`. The values can be anywhere in the array.

Your solution should run in O(n) time, so sorting is not the intended approach.`,
    constraints: ['0 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'Put all the values in a HashSet so you can ask "is x present?" in O(1).',
      'Only start counting from a value x that begins a sequence, meaning x − 1 is not in the set.',
      'From each start, count x + 1, x + 2, … while they are present. Each value is visited a constant number of times, so the total is O(n). Loop over the set, not the array, to skip duplicates.',
    ],
  },
  'valid-sudoku': {
    statement: `Given a 9 × 9 Sudoku board, decide whether the cells filled so far are valid:

- each row contains the digits 1–9 at most once,
- each column contains the digits 1–9 at most once,
- each of the nine 3 × 3 boxes contains the digits 1–9 at most once.

Empty cells are \`'.'\`. Only check the filled cells; the board does not need to be solvable.`,
    constraints: ['board.length == 9', 'board[i].length == 9', '`board[i][j]` is a digit 1-9 or `.`'],
    hints: [
      'You need to detect a repeated digit in 27 groups: 9 rows, 9 columns and 9 boxes.',
      'Keep a set (or a boolean[9][9]) for each row, each column and each box, and check each filled cell against all three.',
      'The box of cell (r, c) is (r / 3) * 3 + c / 3. One pass over the 81 cells is enough.',
    ],
  },
  'first-missing-positive': {
    statement: `Return the smallest positive integer (1, 2, 3, …) that does not appear in \`nums\`.

The array is unsorted and can contain negatives, zeros and duplicates. Solve it in O(n) time using O(1) extra space; you may change the array.`,
    constraints: ['1 <= nums.length <= 1e5', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: [
      'If the array has n values, the answer is between 1 and n + 1. Values outside 1..n can be ignored.',
      'Use the array itself as the "seen" table: try to place each value v (1 ≤ v ≤ n) at index v − 1 by swapping.',
      'Keep swapping at the same index until its value is out of range or already in its home (watch for duplicates, or you loop forever). Then the first index i with nums[i] != i + 1 gives the answer i + 1.',
    ],
  },
  'concatenation-of-array': {
    statement: `Given \`nums\` of length \`n\`, return an array \`ans\` of length \`2n\` where \`ans[i] == nums[i]\` and \`ans[i + n] == nums[i]\` for every \`i\`. In other words, \`ans\` is \`nums\` written twice in a row.`,
    constraints: ['1 <= nums.length <= 1000', '1 <= nums[i] <= 1000'],
    hints: [
      'The answer has a fixed size, 2n, so you can allocate it up front.',
      'Position i and position i + n both get nums[i].',
      'One loop over i from 0 to n − 1 fills both halves.',
    ],
  },
  'majority-element': {
    statement: `Return the **majority element** of \`nums\`: the value that appears more than \`⌊n / 2⌋\` times. You may assume it always exists.

Follow-up: can you do it in O(n) time and O(1) extra space?`,
    constraints: ['1 <= nums.length <= 5e4', '-1e9 <= nums[i] <= 1e9', 'A majority element always exists'],
    hints: [
      'A hash map of counts finds it in O(n) time but O(n) space. Sorting also works: the middle element of the sorted array must be the majority.',
      'For O(1) space, imagine pairing each majority value with a different value and cancelling both. The majority still has copies left over.',
      'Boyer–Moore voting: keep a candidate and a counter. On a match add 1, otherwise subtract 1; when the counter is 0, the next value becomes the candidate.',
    ],
  },
  'encode-and-decode-strings': {
    statement: `Design a \`Codec\` that sends a list of strings as one string:

- \`encode(strs)\` turns the list into a single string.
- \`decode(s)\` turns that string back into the original list.

The strings can contain **any** character, including whatever separator you might pick, and can be empty. The judge calls \`encode\` on one \`Codec\` and \`decode\` on a different one, so you cannot keep the list in a field. It prints the decoded list, which must equal the input.`,
    constraints: ['0 <= strs.length <= 99', '0 <= strs[i].length <= 199', '`strs[i]` may contain any of the 256 ASCII characters'],
    hints: [
      'Joining with a delimiter like "," breaks as soon as a string contains a comma. Escaping works, but there is a simpler idea.',
      'If the decoder knew each string\'s length, it would not care what characters the string contains.',
      'Write each string as its length, a separator such as "#", then the string itself. To decode, read digits up to the "#", then take exactly that many characters.',
    ],
  },
  'majority-element-ii': {
    statement: `Return every value in \`nums\` that appears more than \`⌊n / 3⌋\` times, in any order.

Follow-up: can you do it in O(n) time and O(1) extra space?`,
    constraints: ['1 <= nums.length <= 5e4', '-1e9 <= nums[i] <= 1e9'],
    hints: [
      'At most two values can each appear more than n / 3 times. Three such values would need more than n elements.',
      'A count map solves it in O(n) space. For O(1), extend Boyer–Moore voting to two candidates with two counters.',
      'A value that matches neither candidate decrements both counters (or replaces a candidate whose counter is 0). The survivors are only candidates: count them again in a second pass before returning them.',
    ],
  },
  'verifying-an-alien-dictionary': {
    statement: `An alien language uses the same 26 lowercase letters, but in a different order: \`order\` lists them from first to last.

Return \`true\` if \`words\` is sorted in this language\'s dictionary order. As in English, compare two words at their first differing letter; if one word is a prefix of the other, the shorter word comes first.`,
    constraints: ['1 <= words.length <= 100', '1 <= words[i].length <= 20', 'order.length == 26', 'All letters are lowercase English letters; `order` contains each letter once'],
    hints: [
      'The list is sorted exactly when every pair of neighbouring words is in order. You don\'t need to compare all pairs.',
      'Store each letter\'s position in order in an int[26] so comparing two letters is O(1).',
      'For two neighbours, find the first differing position and compare the ranks there. If there is none, the first word must not be longer than the second ("apple" before "app" is wrong).',
    ],
  },
};
