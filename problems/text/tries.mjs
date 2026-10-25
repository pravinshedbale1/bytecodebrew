export default {
  'longest-common-prefix': {
    statement: `Return the longest string that is a prefix of every string in \`strs\`. If they share no prefix, return \`""\`.`,
    constraints: ['1 <= strs.length <= 200', '0 <= strs[i].length <= 200', '`strs[i]` has only lowercase English letters'],
    hints: [
      'The common prefix can be no longer than the shortest string.',
      'Compare column by column: check the character at position i in every string, and stop at the first mismatch or the end of any string.',
      'Alternatively, start with the first string as the prefix and shorten it until every other string starts with it.',
    ],
  },
  'implement-trie-prefix-tree': {
    statement: `Implement a trie (prefix tree) for lowercase words:

- \`Trie()\` creates an empty trie,
- \`void insert(String word)\` adds a word,
- \`boolean search(String word)\` returns whether exactly that word was inserted,
- \`boolean startsWith(String prefix)\` returns whether any inserted word starts with \`prefix\`.

The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ word.length, prefix.length ≤ 2000', 'Words and prefixes have only lowercase English letters', 'At most 10^5 calls in total'],
    hints: [
      'Each node represents a prefix; its children are the possible next letters.',
      'Give each node a Node[26] children array and a boolean marking whether a word ends there.',
      'search and startsWith both walk down letter by letter; the only difference is that search also requires the end-of-word mark.',
    ],
  },
  'design-add-and-search-words-data-structure': {
    statement: `Design \`WordDictionary\`:

- \`void addWord(String word)\` adds a word,
- \`boolean search(String word)\` returns whether some added word matches \`word\`, where each \`.\` in \`word\` matches any single letter.

The tests call the class with a list of operations and their arguments.`,
    constraints: ['1 ≤ word.length ≤ 25', 'Added words have only lowercase letters', 'Search words have lowercase letters and at most 2 dots', 'At most 4 × 10^4 calls in total'],
    hints: [
      'Store the words in a trie, as in "Implement Trie".',
      'Searching a normal letter follows one child. A "." can match any child, so you must try each of them.',
      'Write search recursively over (node, index). For ".", return true if any child succeeds; at the end of the word, check the end-of-word mark.',
    ],
  },
  'replace-words': {
    statement: `A root is a word that can be followed by more letters to form a longer word (\`"cat"\` + \`"tle"\` = \`"cattle"\`). Given the roots in \`dictionary\` and a \`sentence\` of words separated by single spaces, replace every word that starts with some root by the shortest such root.

Words that start with no root stay as they are. Return the new sentence.`,
    constraints: ['1 <= dictionary.length <= 1000', '1 <= dictionary[i].length <= 100', '1 <= sentence.length <= 1e6', 'All text is lowercase; sentence words are separated by single spaces'],
    hints: [
      'For each word you need the shortest root that is a prefix of it.',
      'Put the roots in a trie. Walk each word down the trie letter by letter.',
      'Stop at the first node that ends a root and use that prefix; if you fall off the trie first, keep the whole word. Build the result with a StringBuilder.',
    ],
  },
  'search-suggestions-system': {
    statement: `You type \`searchWord\` one character at a time. After each character, suggest up to three products from \`products\` that start with what has been typed so far. If more than three match, pick the three that come first alphabetically.

Return a list with the suggestions after each character.`,
    constraints: ['1 <= products.length <= 1000', '1 <= products[i].length <= 3000', '1 <= searchWord.length <= 1000', 'All strings are lowercase'],
    hints: [
      'Sorting the products puts every set of words with a common prefix into one contiguous block, already in alphabetical order.',
      'For each prefix, binary-search the first product ≥ prefix and take up to three that still start with it.',
      'A trie where each node keeps its three smallest words also works.',
    ],
  },
  'maximum-xor-of-two-numbers-in-an-array': {
    statement: `Return the largest value of \`nums[i] XOR nums[j]\` over all pairs \`0 ≤ i ≤ j < n\` (so pairing a number with itself, which gives 0, is allowed).

Trying every pair is O(n²); aim for O(n · 31).`,
    constraints: ['1 <= nums.length <= 2e5', '0 <= nums[i] <= 2^31 - 1'],
    hints: [
      'To make the XOR large, you want the highest bits to differ.',
      'Insert every number into a binary trie, from bit 30 down to bit 0.',
      'For each number, walk the trie preferring the opposite bit at every level. Each time you can take it, that bit is set in the XOR. Keep the best result.',
    ],
  },
  'word-search-ii': {
    statement: `\`board\` is a grid of lowercase letters. Return every word in \`words\` that can be spelled by a path of cells, moving up, down, left or right, without using any cell twice in the same word.

The words are distinct. Return them in any order.`,
    constraints: ['1 <= board.length <= 12', '1 <= board[0].length <= 12', '1 <= words.length <= 3e4', '1 <= words[i].length <= 10', 'All letters are lowercase'],
    hints: [
      'Running "Word Search" once per word repeats almost the same DFS thousands of times.',
      'Put all the words in a trie and run one DFS from each cell, following the trie as you go. Stop as soon as the path is not a prefix of any word.',
      'Store the full word at its end node, record it when you reach it and clear it so it is not reported twice. Pruning leaves you have finished makes it much faster.',
    ],
  },
  'extra-characters-in-a-string': {
    statement: `Break \`s\` into one or more **non-overlapping** substrings so that each substring is a word in \`dictionary\`. Some characters of \`s\` may not belong to any chosen substring; these are **extra** characters.

Return the minimum possible number of extra characters.`,
    constraints: ['1 <= s.length <= 50', '1 <= dictionary.length <= 50', '1 <= dictionary[i].length <= 50', '`s` and `dictionary[i]` have only lowercase English letters', '`dictionary` contains distinct words'],
    hints: [
      'At each position i you either leave s[i] as an extra character, or start a dictionary word there. That suggests a recursion f(i) = fewest extras in s[i..].',
      'f(i) = min(1 + f(i + 1), f(j) for every dictionary word s[i..j)). Memoise it, or fill dp from the end of the string backwards.',
      'Checking every substring against a hash set costs O(n³) overall. Walking a trie from position i finds every word that starts at i in one pass, giving O(n² + total dictionary length).',
    ],
  },
};
