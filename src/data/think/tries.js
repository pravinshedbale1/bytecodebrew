/** Practice thinking walkthroughs: tries (format: src/data/think/index.js). */

const notHash = (why) => ({ id: 'hashing', why });

export default {
  'longest-common-prefix': {
    free: true,
    aha: 'A prefix shared by every word is one path from the root that no word leaves. Put the words in a trie and walk down while the node has exactly one child and no word has ended there. (Comparing the words column by column gives the same answer with no trie: stop at the first column where they disagree or a word runs out.)',
    asks: {
      read: 'What should you return when the words share nothing?',
      budget: '200 words of 200 letters. How many letters are there in total?',
      observe: 'For ["flower", "flow", "flight"], where do the words first disagree?',
      brute: 'Trying every candidate prefix against every word: how much repeated work?',
      pattern: 'In a trie of the words, what does the common prefix look like?',
      watch: 'Watch the walk follow the single-child chain and stop.',
    },
    read: [
      { phrase: 'Return the longest string that is a prefix of every string in `strs`', says: 'Shared by every word: a single path that nobody branches off.' },
      { phrase: 'If they share no prefix, return `""`', says: 'Stop at the root if the first letters already differ.' },
    ],
    budget: { from: '200 words × 200 letters', rows: [['every prefix × every word', '200 × 200 × 200', 'ok', '8 × 10⁶, fine'], ['one scan of the letters', '4 × 10⁴', 'ok', 'instant']], aim: 'O(total letters)', note: 'Building the trie and scanning columns both touch each letter once.' },
    observe: [
      {
        title: 'They split after "fl"',
        text: '"flower", "flow" and "flight" all start "fl"; the third letter is o, o, i. The answer is "fl".',
        sketch: { kind: 'array', rows: [{ label: 'flower', items: ['f', 'l', 'o'], marks: { 0: 'hit', 1: 'hit', 2: 'dim' } }, { label: 'flight', items: ['f', 'l', 'i'], marks: { 0: 'hit', 1: 'hit', 2: 'bad' } }], caption: '"fl"' },
      },
      {
        title: 'A whole word also stops it',
        text: 'For ["inter", "in", "into"], the word "in" ends after two letters, so the prefix can\'t be longer than "in" even though the others continue together.',
        sketch: { kind: 'array', rows: [{ label: 'in', items: ['i', 'n', '|'], marks: { 0: 'hit', 1: 'hit', 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Take the first word\'s prefixes from longest to shortest and test each against every word.', cost: 'O(L² · n)', waste: 'Each candidate re-checks letters already known to match; one left-to-right comparison is enough.' },
    pattern: {
      pick: 'tries',
      why: 'Insert the words; from the root, follow the only child while there is exactly one and no word ends at the node. O(total letters). For a single question, vertical scanning is equally good; the trie pays off when many questions come.',
      not: [{ id: 'sorting-and-selection', why: 'Sorting and comparing only the first and last word also works (O(n L log n)); it is a neat trick but not faster.' }, { id: 'divide-and-conquer', why: 'LCP of halves, then LCP of the two answers works, with more code for the same cost.' }],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: '["flower", "flow", "flight"]', input: { mode: 'lcp', words: ['flower', 'flow', 'flight'] } }, { label: '["inter", "in", "into"]', input: { mode: 'lcp', words: ['inter', 'in', 'into'] } }] },
    edges: ['Nothing shared: ["dog", "racecar", "car"] → "".', 'One word: ["a"] → "a".', 'Identical words: ["ab", "ab"] → "ab".'],
  },

  'implement-trie-prefix-tree': {
    aha: 'Each node has up to 26 children, one per letter, and a flag saying whether a word ends there. insert walks the letters, creating missing children, and sets the flag on the last node. search walks and needs the path to exist AND the flag set; startsWith only needs the path to exist. Every call costs the length of the word, however many words are stored.',
    asks: {
      read: 'What is the difference between search and startsWith?',
      budget: '10⁵ calls on words up to 2000 letters. What should each call cost?',
      observe: 'After inserting "apple", why is search("app") false but startsWith("app") true?',
      brute: 'Storing the words in a list: what does startsWith cost?',
      pattern: 'How can words that share a beginning share storage and work?',
      watch: 'Watch words share paths, then searches walk them.',
    },
    read: [
      { phrase: '`boolean search(String word)` returns whether exactly that word was inserted', says: 'The path must exist and a word must END at its last node: an end flag.' },
      { phrase: '`boolean startsWith(String prefix)` returns whether any inserted word starts with `prefix`', says: 'Only the path has to exist.' },
    ],
    budget: { from: '≤ 10⁵ calls, words ≤ 2000', rows: [['a list, scanned per call', '10⁵ × 10⁵ × L', 'bad', 'too slow'], ['a trie', '10⁵ × 2000', 'ok', '2 × 10⁸ letter steps at worst']], aim: 'O(L) per call', note: 'A hash set answers search in O(L) but not startsWith.' },
    observe: [
      {
        title: 'Shared beginnings share a path',
        text: '"car", "cat" and "cart" share c → a; "cart" continues from "car". Only four nodes below "ca" are needed.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'a', 'r', 't'], marks: { 2: 'hit', 3: 'hit' } }, { items: ['c', 'a', 't'], marks: { 2: 'hit' } }], caption: 'ringed: a word ends' },
      },
      {
        title: 'A path is not a word',
        text: 'After insert("apple"), the path a → p → p exists, so startsWith("app") is true. But no word ends at that second p: search("app") is false until "app" itself is inserted.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'p', 'l', 'e'], marks: { 2: 'cur', 4: 'hit' } }], caption: 'end flag only on "e"' },
      },
    ],
    brute: { idea: 'Keep the words in a list; search compares with each, startsWith checks each word\'s beginning.', cost: 'O(n · L) per call', waste: 'Words that share a beginning are compared letter by letter again and again; the trie compares each shared letter once.' },
    pattern: {
      pick: 'tries',
      why: 'Node { children[26], isEnd }. insert: walk and create; mark the end. search: walk, then isEnd. startsWith: walk only. O(L) per call, O(total letters) memory.',
      not: [notHash('A HashSet handles search, but startsWith would need every prefix stored too (O(L²) per word).'), { id: 'binary-search', why: 'A sorted list answers startsWith by binary search, but inserts cost O(n) shifts.' }],
    },
    watch: { viz: 'TrieViz', inputs: [{ label: 'car, cat, cart, dog', input: { words: ['car', 'cat', 'cart', 'dog'], queries: [['search', 'car'], ['search', 'ca'], ['prefix', 'ca'], ['search', 'do']] } }, { label: 'apple: search vs startsWith', input: { words: ['apple'], queries: [['search', 'apple'], ['search', 'app'], ['prefix', 'app']] } }] },
    edges: ['search("app") after insert("apple") → false.', 'startsWith("app") after insert("apple") → true.', 'search("app") after also inserting "app" → true.'],
  },

  'design-add-and-search-words-data-structure': {
    aha: 'Store the words in a trie. A normal letter follows its one child. A "." can be any letter, so it tries every child, depth first, and succeeds if any branch reaches the end of the pattern on a node where a word ends. With at most two dots, the branching stays small.',
    asks: {
      read: 'What can a "." match? How many dots can a search have?',
      budget: '4 × 10⁴ calls, words ≤ 25 letters, ≤ 2 dots. How much can a dot cost?',
      observe: 'With "bad", "dad", "mad" stored, which nodes does ".ad" visit?',
      brute: 'Trying all 26 letters for each dot against a hash set: what does that cost?',
      pattern: 'In a trie, what does a dot do at a node?',
      watch: 'Watch dots fan out over every child.',
    },
    read: [
      { phrase: 'each `.` in `word` matches any single letter', says: 'At a dot, try every child of the current node.' },
      { phrase: '`void addWord(String word)` adds a word', says: 'Inserts are a plain trie insert.' },
    ],
    budget: { from: '≤ 4 × 10⁴ calls, L ≤ 25, ≤ 2 dots', rows: [['every letter per dot, hash set', '26² × 25 per search', 'ok', 'fine, but clumsy'], ['trie, dots branch', 'only children that exist', 'ok', 'fast']], aim: 'O(L) per search without dots', note: 'With two dots the trie explores at most the existing children at those two levels.' },
    observe: [
      {
        title: 'A dot tries every child',
        text: '".ad" at the root: the dot tries b, d and m; each continues with a → d. The first branch, b → a → d, already ends on a word.',
        sketch: { kind: 'array', rows: [{ items: ['b', 'd', 'm'], marks: { 0: 'hit' }, tags: { 0: [['.', 'accent']], 1: [['.', 'muted']], 2: [['.', 'muted']] } }], caption: 'true' },
      },
      {
        title: 'Letters still prune',
        text: '"b.." follows b only, then fans out twice under it. "..x" fans out at two levels but no node has an x below it: false.',
        sketch: { kind: 'array', rows: [{ items: ['b', '.', '.'], marks: { 0: 'cur' } }, { items: ['.', '.', 'x'], marks: { 2: 'bad' } }] },
      },
    ],
    brute: { idea: 'Keep a hash set of words; for a pattern with dots, try every letter for each dot and look each candidate up.', cost: 'O(26ᵈ · L) per search', waste: 'Most of the 26 letters lead nowhere; the trie only tries letters that actually continue some word.' },
    pattern: {
      pick: 'tries',
      why: 'match(node, i): if i == len, return node.isEnd; a letter goes to that child (none → false); "." tries every child and returns true if any matches. O(L) without dots.',
      not: [notHash('A set of words needs 26 guesses per dot, most of them useless.'), { id: 'backtracking', why: 'The dot search is backtracking, but over trie children: the trie is what keeps it small.' }],
    },
    watch: { viz: 'TrieViz', inputs: [{ label: 'bad, dad, mad, bat', input: { words: ['bad', 'dad', 'mad', 'bat'], queries: [['wild', '.ad'], ['wild', 'b..'], ['wild', '..x']] } }, { label: 'LeetCode example', input: { words: ['bad', 'dad', 'mad'], queries: [['wild', 'pad'], ['wild', 'bad'], ['wild', '.ad'], ['wild', 'b..']] } }] },
    edges: ['search("pad") with bad, dad, mad → false.', 'search(".ad") → true.', 'A dot must match a letter: search("ba") with only "bad" stored → false, and "bad." → false.'],
  },

  'replace-words': {
    aha: 'Put the roots in a trie. For each word, walk its letters from the root and stop at the FIRST node where a root ends: that is the shortest root the word starts with. If the path breaks first, no root fits and the word stays.',
    asks: {
      read: 'If several roots fit a word, which one wins?',
      budget: 'A sentence up to 10⁶ characters and 1000 roots. Can you test every root against every word?',
      observe: 'With roots "cat" and "ca", what does "cattle" become?',
      brute: 'Checking every root against every word: what is the cost?',
      pattern: 'Walking a word down a trie of roots, which root do you meet first?',
      watch: 'Watch each word walk the root trie until a root ends or the path breaks.',
    },
    read: [
      { phrase: 'replace every word that starts with some root by the shortest such root', says: 'The first root end met on the word\'s path is the shortest: stop there.' },
      { phrase: 'Words that start with no root stay as they are', says: 'A broken path (or no end on it) keeps the word.' },
    ],
    budget: { from: 'sentence ≤ 10⁶, roots ≤ 1000 of ≤ 100', rows: [['every root × every word', '1000 × 10⁶', 'bad', 'too slow'], ['trie walk per word', '10⁶', 'ok', 'fast']], aim: 'O(sentence length + total root letters)', note: 'A hash set of roots, checking each prefix of each word, is O(L²) per word.' },
    observe: [
      {
        title: 'The first root end wins',
        text: 'Roots "cat", "bat", "rat": "cattle" reaches the end of "cat" after three letters and stops. "the" breaks at once and stays.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'a', 't', 't', 'l', 'e'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'dim', 4: 'dim', 5: 'dim' } }], caption: '"cattle" → "cat"' },
      },
      {
        title: 'Shorter beats longer',
        text: 'With roots "cat" and "ca", walking "cattle" meets the end of "ca" first: "ca" wins.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'a', 't'], marks: { 1: 'hit', 2: 'dim' }, tags: { 1: [['ca ends', 'success']] } }] },
      },
    ],
    brute: { idea: 'For every word, test every root with startsWith and keep the shortest that fits.', cost: 'O(words × roots × L)', waste: 'Roots sharing a beginning are compared separately; the trie compares each shared letter once and stops at the first end.' },
    pattern: {
      pick: 'tries',
      why: 'Insert the roots. For each word: walk; the first node with isEnd gives the replacement; a missing child means keep the word. O(total length).',
      not: [notHash('A set of roots works by testing each prefix of each word: O(L²) per word, and still has to stop at the shortest.'), { id: 'string-matching', why: 'Only prefixes matter, not matches anywhere in the word, so a trie walk is all that is needed.' }],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: 'cat, bat, rat', input: { mode: 'replace', roots: ['cat', 'bat', 'rat'], sentence: 'the cattle was rattled by the battery' } }, { label: 'cat, ca, b', input: { mode: 'replace', roots: ['cat', 'ca', 'b'], sentence: 'the cattle ate cabbage' } }] },
    edges: ['["a", "b", "c"], "aadsfasf absbs bbab cadsfafs" → "a a b c".', 'The shortest root wins: ["cat", "ca"], "cattle" → "ca".', 'No root fits: ["xyz"], "hello" → "hello".'],
  },

  'search-suggestions-system': {
    aha: 'Every product that starts with what you have typed lives under one trie node. Visiting children in a..z order meets those products alphabetically, so the first three word ends found are the suggestions. Each new letter moves one node down; once the path breaks, every later prefix has no suggestions either.',
    asks: {
      read: 'How many suggestions, and in what order?',
      budget: '1000 products, a search word up to 1000 letters. How much work per letter?',
      observe: 'For products mob, mouse, money, moon, mop, mount, what is suggested after "m"? After "mou"?',
      brute: 'Filtering and sorting all products after each letter: what does it cost?',
      pattern: 'Where in a trie are all the products that start with the typed prefix?',
      watch: 'Watch each typed letter move one node down and list the first three words below.',
    },
    read: [
      { phrase: 'suggest up to three products from `products` that start with what has been typed so far', says: 'All products below the prefix\'s node; take three.' },
      { phrase: 'pick the three that come first alphabetically', says: 'Visit children a..z: the first three ends found are the right ones.' },
      { phrase: 'You type `searchWord` one character at a time', says: 'Each letter moves one node deeper: no need to restart.' },
    ],
    budget: { from: '≤ 1000 products, search word ≤ 1000', rows: [['filter + sort per letter', '1000 × 1000 · log', 'bad', 'slow'], ['trie, one node per letter', '1000 + build', 'ok', 'fast']], aim: 'O(total product letters + search length)', note: 'Store the first three words at each node while building to make each answer O(1).' },
    observe: [
      {
        title: '"m": three of six',
        text: 'All six products start with "m". Alphabetically: mob, money, moon, mop, mount, mouse. Suggest the first three.',
        sketch: { kind: 'array', rows: [{ items: ['mob', 'money', 'moon', 'mop', 'mount', 'mouse'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'dim', 4: 'dim', 5: 'dim' } }] },
      },
      {
        title: '"mou": the list narrows',
        text: 'Only mount and mouse start with "mou": both are suggested.',
        sketch: { kind: 'array', rows: [{ items: ['mount', 'mouse'], marks: { 0: 'hit', 1: 'hit' } }] },
      },
      {
        title: 'A broken path stays broken',
        text: 'If nothing starts with "apx", nothing starts with "apxy" either: every later list is empty.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'p', 'x?'], marks: { 2: 'bad' } }], caption: '[] from here on' },
      },
    ],
    brute: { idea: 'After each typed letter, filter all products by the prefix, sort the matches, take three.', cost: 'O(m · n · L)', waste: 'Each letter re-filters from scratch, though the new matches are a subset of the previous ones.' },
    pattern: {
      pick: 'tries',
      why: 'Build a trie of products. For each typed letter, move to the child (or stop for good); DFS below it in a..z order and take the first three word ends. O(total letters).',
      not: [{ id: 'binary-search', why: 'Sorting the products and binary-searching each prefix also works well (O(n log n + m log n)); the trie is the more direct model.' }, { id: 'two-pointers', why: 'Narrowing a sorted list with two pointers per letter works too; the trie version extends to "top k by popularity".' }],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: '6 products, "mou"', input: { mode: 'suggest', products: ['mob', 'mouse', 'money', 'moon', 'mop', 'mount'], word: 'mou' } }, { label: 'apple, apply, ape, bat, "apx"', input: { mode: 'suggest', products: ['apple', 'apply', 'ape', 'bat'], word: 'apx' } }] },
    edges: ['One product typed in full: ["havana"], "havana" → ["havana"] after every letter.', 'A letter no product has: ["apple", "apply", "ape", "bat"], "apx" → [ape, apple, apply], [ape, apple, apply], [].', 'More than three matches → only the first three alphabetically.'],
  },

  'maximum-xor-of-two-numbers-in-an-array': {
    aha: 'A higher bit is worth more than all lower bits together, so XOR is maximised greedily from the top: at each bit, try to differ from x. Store the numbers in a trie of bits, highest first; for each x walk down taking the opposite bit whenever that child exists. The leaf reached is x\'s best partner.',
    asks: {
      read: 'May a number pair with itself? What does the statement suggest storing?',
      budget: '2 × 10⁵ numbers. Can you try every pair?',
      observe: 'For [3, 10, 5, 8, 2], which pair gives 15, and why must the partner of 5 start with bit 1?',
      brute: 'Every pair: how many?',
      pattern: 'Why is it safe to choose the top bit first and never revisit it?',
      watch: 'Watch each number walk the bit trie, taking the opposite bit when it can.',
    },
    read: [
      { phrase: 'Return the largest value of `nums[i] XOR nums[j]`', says: 'Best partner per number, then the best overall.' },
      { phrase: 'Insert the numbers bit by bit into a binary trie, highest bit first', says: 'A trie over the bits, two children per node.' },
      { phrase: 'choosing the opposite bit whenever it exists', says: 'Greedy from the top bit: a 1 there beats any combination of lower bits.' },
    ],
    budget: { from: 'n ≤ 2 × 10⁵, values < 2³¹', rows: [['every pair', '2 × 10¹⁰', 'bad', 'too slow'], ['31-bit trie walk per number', '2 × 10⁵ × 31', 'ok', '6 × 10⁶']], aim: 'O(n · 31)', note: 'A prefix-set version builds the answer bit by bit with a hash set, at the same cost.' },
    observe: [
      {
        title: '5 ^ 10 = 15',
        text: '5 = 0101 and 10 = 1010 differ in every bit: 1111 = 15, the most 4 bits can give.',
        sketch: { kind: 'array', rows: [{ label: '5', items: [0, 1, 0, 1] }, { label: '10', items: [1, 0, 1, 0] }, { label: 'xor', items: [1, 1, 1, 1], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }] },
      },
      {
        title: 'The top bit decides first',
        text: 'For x = 5 (0101), any partner starting with 1 gives at least 1000 = 8, more than every partner starting with 0 can give (at most 0111 = 7). So go to the 1 child if it exists, and never look back.',
        sketch: { kind: 'array', rows: [{ items: ['1xxx ≥ 8', '0xxx ≤ 7'], marks: { 0: 'hit', 1: 'dim' } }] },
      },
    ],
    brute: { idea: 'Try every pair and take the largest XOR.', cost: 'O(n²)', waste: 'For each x, most partners are beaten at the very first bit where they could have differed; the trie discards them in one step.' },
    pattern: {
      pick: 'tries',
      why: 'Insert each number\'s 31 bits, highest first. For each x, at every bit take the child with the opposite bit if it exists (that bit of the XOR becomes 1), else the same bit. Track the best x XOR leaf. O(n · 31).',
      not: [{ id: 'bit-manipulation', why: 'The bit-by-bit prefix-set method is a bit trick with the same greedy idea; the trie makes "does an opposite bit exist" a direct lookup.' }, notHash('A set of numbers can\'t answer "the number that differs most from x" without the bit structure.')],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: '[3, 10, 5, 8, 2]', input: { mode: 'maxxor', nums: [3, 10, 5, 8, 2] } }, { label: '[8, 1, 2]', input: { mode: 'maxxor', nums: [8, 1, 2] } }] },
    edges: ['One number: [0] → 0.', 'Equal numbers: [5, 5] → 0.', '[8, 1, 2] → 10 (8 ^ 2).'],
  },

  'word-search-ii': {
    aha: 'Searching each word separately repeats the same board walks. Put all the words in a trie and walk the board once per starting cell: step to a neighbour only if its letter is a child of the current trie node. Hopeless paths stop after one letter, and words that share a prefix are searched together. Mark a word found (unset its end) so it is reported once.',
    asks: {
      read: 'Can a cell be reused within one word? Across different words?',
      budget: '3 × 10⁴ words on a 12 × 12 board. Can you run Word Search once per word?',
      observe: 'On the example board, why can "oath" and "eat" be found but "pea" can\'t even start?',
      brute: 'One DFS per word: what is repeated across words?',
      pattern: 'What structure lets one board walk check many words at once?',
      watch: 'Watch each starting cell walk the board and the trie together.',
    },
    read: [
      { phrase: 'Return every word in `words` that can be spelled by a path of cells', says: 'Many words, one board: search them together.' },
      { phrase: 'without using any cell twice in the same word', says: 'Backtracking: mark a cell on the path, unmark on the way back.' },
    ],
    budget: { from: '12 × 12 board, ≤ 3 × 10⁴ words of ≤ 10', rows: [['one DFS per word', '3 × 10⁴ × 144 × 4 × 3⁹', 'bad', 'far too slow'], ['one DFS per cell, trie-pruned', '144 × 4 × 3⁹ at worst', 'ok', 'fast in practice']], aim: 'O(cells · 4 · 3^(L − 1))', note: 'Removing finished leaves from the trie keeps later searches short.' },
    observe: [
      {
        title: 'Two words found',
        text: '"oath" runs o → a → t → h down the board; "eat" runs e → a → t. "pea" never starts: there is no p on the board.',
        sketch: { kind: 'grid', grid: [['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']], marks: { '0,0': 'hit', '0,1': 'hit', '1,1': 'hit', '2,1': 'hit' }, caption: '"oath"' },
      },
      {
        title: 'The trie prunes',
        text: 'From the e at (1, 0), the trie allows e → a only. Its neighbours o, t and i are not children of "e", so those directions stop at once.',
        sketch: { kind: 'grid', grid: [['o', 'a'], ['e', 't'], ['i', 'h']], marks: { '1,0': 'cur', '0,0': 'wall', '2,0': 'wall', '1,1': 'wall' }, caption: 'no "eo", "ei" or "et" in the trie' },
      },
    ],
    brute: { idea: 'Run the single-word Word Search (DFS from every cell) once for each word.', cost: 'O(words · cells · 4 · 3^(L − 1))', waste: 'Words sharing a prefix redo the same board walk, and every word restarts from every cell.' },
    pattern: {
      pick: 'tries',
      why: 'Build a trie of the words. For each cell, DFS(cell, root child for its letter): record a word when the node ends one (then clear the flag), and move to a neighbour only if its letter is a child. Mark cells on the path. O(cells · 4 · 3^(L − 1)).',
      not: [{ id: 'backtracking', why: 'The board walk is backtracking, but one search per word is too slow; the trie is what lets one walk cover all words.' }, notHash('A set of prefixes can prune too, but needs every prefix of every word stored and hashed at each step.')],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: 'LeetCode board', input: { mode: 'boggle', board: ['oaan', 'etae', 'ihkr', 'iflv'], words: ['oath', 'pea', 'eat', 'rain'] } }, { label: '2 × 2, three words', input: { mode: 'boggle', board: ['ab', 'cd'], words: ['abdc', 'ba', 'acdb'] } }] },
    edges: ['A cell can\'t repeat: [["a","b"],["c","d"]], ["abcb"] → [].', 'One cell: [["a"]], ["a"] → ["a"].', 'LeetCode board → ["eat", "oath"].'],
  },

  'extra-characters-in-a-string': {
    aha: 'best[i] = the fewest extra letters in s from i to the end. Either s[i] is extra (1 + best[i + 1]), or some dictionary word starts at i and you jump past it (best[j + 1]). A trie of the dictionary finds every word starting at i in one walk from s[i], stopping as soon as no word continues. Fill from the right.',
    asks: {
      read: 'Must every character belong to a word?',
      budget: 's and the dictionary are at most 50. Which approach is clean?',
      observe: 'For "leetscode" with ["leet", "code", "leetcode"], which letter is extra?',
      brute: 'Trying every way to cut s into words and leftovers: how many?',
      pattern: 'What is the smallest question about the rest of the string after position i?',
      watch: 'Watch best[i] fill from the right, each with one trie walk.',
    },
    read: [
      { phrase: 'Break `s` into one or more **non-overlapping** substrings so that each substring is a word in `dictionary`', says: 'Choose words left to right without overlap: a DP over start positions.' },
      { phrase: 'Return the minimum possible number of extra characters', says: 'Each position either joins a word or costs 1.' },
    ],
    budget: { from: 's ≤ 50, ≤ 50 words of ≤ 50', rows: [['every split', '2⁵⁰', 'bad', 'impossible'], ['DP with a trie walk per start', '50 × 50', 'ok', 'instant']], aim: 'O(n · L)', note: 'A hash set and every substring is O(n³) with hashing; still fine here, the trie is cleaner.' },
    observe: [
      {
        title: 'One extra letter',
        text: '"leet" + "s" + "code": only the s is left over.',
        sketch: { kind: 'array', rows: [{ items: ['l', 'e', 'e', 't', 's', 'c', 'o', 'd', 'e'], marks: { 4: 'bad' }, tags: { 0: [['leet', 'success']], 5: [['code', 'success']] } }], caption: '1 extra' },
      },
      {
        title: 'Each position: skip it or start a word',
        text: 'At i = 0, skipping "l" costs 1 + best[1]; the word "leet" starting at 0 costs best[4]. Take the smaller.',
        sketch: { kind: 'array', rows: [{ items: ['skip: 1 + best[1]', '"leet": best[4]'], marks: { 1: 'hit' } }] },
      },
      {
        title: 'One trie walk finds every word starting here',
        text: 'From index 5, walking c → o → d → e through the trie finds "code" and stops at the end of s.',
        sketch: { kind: 'array', rows: [{ items: ['c', 'o', 'd', 'e'], marks: { 3: 'hit' } }], caption: 'word end at j = 8 → best[9] = 0' },
      },
    ],
    brute: { idea: 'Recursively, at each position either mark the character extra or try every dictionary word that starts there.', cost: 'O(2ⁿ)', waste: 'The answer for the rest of the string from i is recomputed for every way of reaching i; one value per i is enough.' },
    pattern: {
      pick: 'tries',
      why: 'Trie of the dictionary. For i from n − 1 down to 0: best[i] = 1 + best[i + 1]; walk the trie from s[i], and at each word end j, best[i] = min(best[i], best[j + 1]). Answer best[0]. O(n · L).',
      not: [{ id: 'dp-linear', why: 'It is a 1-D DP, like Word Break; the trie is how each position finds its words quickly.' }, notHash('A set of words works by checking every substring s[i..j]: O(n²) lookups, each hashing a substring.')],
    },
    watch: { viz: 'TrieWalkViz', inputs: [{ label: '"leetscode"', input: { mode: 'extra', s: 'leetscode', dict: ['leet', 'code', 'leetcode'] } }, { label: '"catsxdog"', input: { mode: 'extra', s: 'catsxdog', dict: ['cats', 'dog', 'cat', 'sand'] } }] },
    edges: ['No word fits: "abc", ["x"] → 3.', '"leetscode" → 1.', '"catsxdog", ["cats", "dog", "cat", "sand"] → 1.'],
  },
};
