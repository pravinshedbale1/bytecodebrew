export default {
  'longest-common-prefix': {
    explain: 'All three words start with "fl", but the third letters differ ("o" in flower and flow, "i" in flight). So the answer is "fl".',
    more: 'For example `["dog","racecar","car"]` share no first letter, so the answer there is `""`.',
  },
  'implement-trie-prefix-tree': {
    explain: 'After inserting "apple", searching "apple" is true but searching "app" is false, because "app" was never inserted as a whole word; startsWith("app") is true. After inserting "app", searching "app" becomes true. Constructors and inserts return `null`, so the output is `[null,null,true,false,true,null,true]`.',
  },
  'design-add-and-search-words-data-structure': {
    explain: '"pad" was never added, so it is false. "bad" was added. ".ad" matches "bad", "dad" or "mad", and "b.." matches "bad". So the output is `[null,null,null,null,false,true,true,true]`.',
  },
  'replace-words': {
    explain: '"cattle" starts with the root "cat", "rattled" with "rat" and "battery" with "bat", so each is replaced by its root. The other words have no root, giving "the cat was rat by the bat".',
  },
  'search-suggestions-system': {
    explain: 'After typing "m", "mo" and "mou" the matching products in alphabetical order begin with "mobile", "moneypot" and "monitor" for the first two, but only "mouse" and "mousepad" start with "mou". From then on, "mous" and "mouse" still match just those two. Each step lists at most three suggestions.',
  },
  'maximum-xor-of-two-numbers-in-an-array': {
    explain: '5 is 00101 in binary and 25 is 11001. They differ in the top three bits, so 5 XOR 25 = 11100 = 28, the largest of any pair.',
    more: 'Insert the numbers bit by bit into a binary trie, highest bit first. For each number, walk the trie choosing the opposite bit whenever it exists, which builds the best partner greedily.',
  },
  'word-search-ii': {
    explain: '"oath" can be traced from the top-left "o" down and across neighbouring cells, and "eat" can be traced on the right side. "pea" has no "p" on the board, and "rain" cannot be connected, so the answer is `["oath","eat"]`.',
  },
  'extra-characters-in-a-string': {
    explain: 'Take "leet" (indices 0–3) and "code" (indices 5–8). Only the "s" at index 4 is not covered, so the answer is 1.',
  },
};
