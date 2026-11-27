/** Practice thinking walkthroughs: string-matching (format: src/data/think/index.js). */

export default {
  'find-the-index-of-the-first-occurrence-in-a-string': {
    free: true,
    aha: 'Checking every start position is O(n · m) because a mismatch throws away everything matched so far. KMP precomputes, for each prefix of the needle, its longest border (a prefix that is also a suffix). On a mismatch the needle slides so that border lines up with the text already matched, and the text pointer never moves back: O(n + m).',
    asks: {
      read: 'What should you return if the needle isn\'t there?',
      budget: 'Both strings up to 10⁴. What does checking every start cost in the worst case?',
      observe: 'Searching "aab" in "aaaab": after "aa" matches and "b" fails, what do you already know?',
      brute: 'Comparing the needle at every start: when is it slow?',
      pattern: 'After a mismatch, how much of the matched part can be reused?',
      watch: 'Watch the needle slide by its failure table, never moving back in the text.',
    },
    read: [
      {
        phrase: 'Return the index of the first place where `needle` occurs',
        says: 'Only the first match is wanted, so the search can stop the moment needle has fully matched.',
      },
      { phrase: 'or `-1` if it does not occur at all', says: 'If the search reaches the end of haystack without a full match, return −1.' },
      { phrase: 'KMP or a rolling hash brings it down to O(n + m)', says: 'Reuse matched characters instead of restarting.' },
    ],
    budget: {
      from: 'n, m ≤ 10⁴',
      rows: [['every start position', 'n · m = 10⁸', 'bad', 'slow at worst'], ['KMP', 'n + m', 'ok', 'linear']],
      aim: 'O(n + m)',
      note: 'The simple check is often fine in practice; say why KMP is worst-case safe.',
    },
    observe: [
      {
        title: 'A match, the easy case',
        text: '"sad" in "sadbutsad": it matches at 0, so return 0 (the second match at 6 doesn\'t matter).',
        sketch: {
          kind: 'array',
          rows: [{ items: ['s', 'a', 'd', 'b', 'u', 't', 's', 'a', 'd'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }],
          caption: '0',
        },
      },
      {
        title: 'Don\'t re-read the text',
        text: 'Needle "aab" against "aaa…": "aa" matched, then the third letter fails. "a" (a border of "aa") is still matched, so the needle shifts by one and continues from the same text position.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'text', items: ['a', 'a', 'a', 'a', 'b'] }, { label: 'needle', items: ['', 'a', 'a', 'b', ''], marks: { '1': 'hit' } }],
        },
      },
    ],
    brute: {
      idea: 'For each start i, compare the needle with haystack[i..] letter by letter.',
      cost: 'O(n · m)',
      waste: 'After a partial match fails, the letters just compared are compared again from the next start.',
    },
    pattern: {
      pick: 'string-matching',
      why: 'Build lps for the needle; scan the haystack with j = matched length: on mismatch j = lps[j − 1], on match j++; when j == m return i − m + 1. O(n + m).',
      not: [
        {
          id: 'two-pointers',
          why: 'Two indices walk the strings, but plain two pointers restart on mismatch; the failure table is what avoids that.',
        },
        { id: 'hashing', why: 'A rolling hash (Rabin–Karp) also works in O(n + m) on average, with collision checks.' },
      ],
    },
    watch: {
      viz: 'KmpViz',
      inputs: [
        { label: '"sad" in "sadbutsad"', input: { mode: 'search', p: 'sad', t: 'sadbutsad' } },
        { label: '"aab" in "aaaab"', input: { mode: 'search', p: 'aab', t: 'aaaab' } },
      ],
    },
    edges: ['"sad" in "sadbutsad" → 0.', '"leeto" in "leetcode" → −1.', 'Needle equals haystack → 0.'],
  },

  'rotate-string': {
    aha: 'Every rotation of s is a window of s + s: the shifts wrap around, and doubling s lays every wrap-around out in a straight line. So goal is a rotation of s exactly when the lengths match and goal appears inside s + s, one substring search.',
    asks: {
      read: 'Why must the lengths be equal?',
      budget: 'Lengths ≤ 100. Is trying every shift fine? What is the one-line test?',
      observe: 'Where does "cdeab" appear in "abcdeabcde"?',
      brute: 'Building each of the n rotations and comparing: what does it cost?',
      pattern: 'Which string contains every rotation of s?',
      watch: 'Watch the search for goal inside s + s.',
    },
    read: [
      { phrase: 'A shift moves the first character of `s` to the end', says: 'Rotations: every one is a window of s + s.' },
      {
        phrase: '`goal` is a rotation of `s` exactly when the two have the same length and `goal` appears inside `s + s`',
        says: 'One length check and one substring search.',
      },
    ],
    budget: {
      from: 'lengths ≤ 100',
      rows: [['try every shift', 'n²', 'ok', '10⁴'], ['search in s + s', 'O(n) with KMP', 'ok', 'cleanest']],
      aim: 'O(n) with KMP',
      note: 'Without the length check, "ab" would wrongly match goal "a".',
    },
    observe: [
      {
        title: 'Doubling lays out every rotation',
        text: '"abcde" + "abcde" = "abcdeabcde" contains every rotation of "abcde" as a 5-letter window. "cdeab" starts at index 2, so it is a rotation (shift by 2).',
        sketch: {
          kind: 'array',
          rows: [{ items: ['a', 'b', 'c', 'd', 'e', 'a', 'b', 'c', 'd', 'e'], marks: { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit' } }],
        },
      },
      {
        title: 'Same letters, not a rotation',
        text: '"abced" has the same letters, but no window of "abcdeabcde" spells it: false.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'e', 'd'], marks: { '3': 'bad', '4': 'bad' } }] },
      },
    ],
    brute: {
      idea: 'Generate all n rotations of s and compare each with goal.',
      cost: 'O(n²)',
      waste: 'Each rotation is rebuilt; they all already sit inside s + s.',
    },
    pattern: {
      pick: 'string-matching',
      why: 'return s.length() == goal.length() && (s + s).contains(goal). O(n) with KMP for contains.',
      not: [
        { id: 'two-pointers', why: 'Comparing with an offset modulo n works, but needs a loop over every offset.' },
        { id: 'hashing', why: 'Counting letters can\'t tell rotations from other rearrangements.' },
      ],
    },
    watch: {
      viz: 'KmpViz',
      inputs: [
        { label: '"cdeab" in "abcdeabcde"', input: { mode: 'search', p: 'cdeab', t: 'abcdeabcde' } },
        { label: '"abced" in "abcdeabcde"', input: { mode: 'search', p: 'abced', t: 'abcdeabcde' } },
      ],
    },
    edges: ['"abcde", "cdeab" → true.', '"abcde", "abced" → false.', 'Different lengths → false.'],
  },

  'repeated-substring-pattern': {
    aha: 'If s is a piece repeated k ≥ 2 times, then the longest border of s (its longest proper prefix that is also a suffix) is s minus one piece. So build the KMP failure table: with L = lps[n − 1], the piece length is n − L, and s is a repetition exactly when L > 0 and n is a multiple of n − L.',
    asks: {
      read: 'How many copies are needed at least?',
      budget: 'n ≤ 10⁴. Is trying every divisor of n fine? What does KMP give in one pass?',
      observe: 'For "abcabc", what is the longest prefix that is also a suffix?',
      brute: 'Trying every piece length that divides n: what does it cost?',
      pattern: 'How does a repeated string\'s longest border relate to its piece?',
      watch: 'Watch the failure table; its last value gives the piece length.',
    },
    read: [
      { phrase: 'repeating it two or more times', says: 'The piece is a proper prefix, and n is a multiple of its length.' },
      { phrase: 'no piece repeats a whole number of times to fill it exactly', says: 'Check divisibility, not just overlap: "abcabcab" fails.' },
    ],
    budget: {
      from: 'n ≤ 10⁴',
      rows: [['try each divisor of n', 'O(n · divisors)', 'ok', 'fine'], ['KMP table', 'O(n)', 'ok', 'one pass']],
      aim: 'O(n)',
      note: 'Another one-liner: s is in (s + s) with the first and last letters removed.',
    },
    observe: [
      {
        title: 'The border is s minus one piece',
        text: '"abcabc": the longest border is "abc" (length 3). n − 3 = 3, and 6 % 3 = 0: piece "abc".',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c'], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }], caption: 'lps[5] = 3' },
      },
      {
        title: 'A border that doesn\'t divide',
        text: '"abcabcab": the border is "abcab" (5). n − 5 = 3, but 8 % 3 ≠ 0: not a repetition.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c', 'a', 'b'], marks: { '6': 'bad', '7': 'bad' } }], caption: '8 % 3 = 2' },
      },
    ],
    brute: {
      idea: 'For each length d dividing n with d < n, check whether s is s[0..d) repeated n / d times.',
      cost: 'O(n · number of divisors)',
      waste: 'Most candidate lengths fail early; the border tells you the only length worth trying.',
    },
    pattern: {
      pick: 'string-matching',
      why: 'Build lps; L = lps[n − 1]; return L > 0 && n % (n − L) == 0. O(n).',
      not: [
        { id: 'math-for-interviews', why: 'Divisors of n narrow the search, but the border finds the period directly.' },
        { id: 'two-pointers', why: 'Comparing s with itself shifted is the brute force in another form.' },
      ],
    },
    watch: {
      viz: 'KmpViz',
      inputs: [{ label: '"abcabc"', input: { mode: 'table', p: 'abcabc' } }, { label: '"abcabcab"', input: { mode: 'table', p: 'abcabcab' } }],
    },
    edges: ['"abab" → true.', '"aba" → false.', 'One letter: "a" → false (needs two copies).'],
    why: 'Build the KMP lps array. L = lps[n − 1] is the longest border, so the smallest period is n − L. s repeats a block exactly when L > 0 and that period divides n. O(n).',
  },

  'repeated-string-match': {
    aha: 'The repeated string must be at least as long as b, so start with k = ⌈|b| / |a|⌉ copies. b might begin partway into a copy and spill into one more, so k + 1 copies is the last count worth trying: any match in more copies already appears in k + 1. Two substring searches decide it.',
    asks: {
      read: 'What does repeating "abc" twice give?',
      budget: 'Lengths up to 10⁴. How many copy counts are worth trying?',
      observe: 'For a = "abcd", b = "cdabcdab", why do 2 copies fail but 3 work?',
      brute: 'Trying k = 1, 2, 3, … until it fits: when do you stop?',
      pattern: 'What is the smallest and the largest number of copies that can matter?',
      watch: 'Watch k and k + 1 copies tried in turn.',
    },
    read: [
      {
        phrase: 'Return the minimum number of times you must repeat string `a`',
        says: 'Count copies: start from the smallest count that is long enough.',
      },
      { phrase: 'If no number of repetitions works, return `-1`', says: 'Bound the search: k and k + 1 copies.' },
    ],
    budget: {
      from: 'lengths ≤ 10⁴',
      rows: [['try counts without a bound', 'may never stop', 'bad', 'needs a limit'], ['k and k + 1 copies', '2 searches', 'ok', 'O(|a| + |b|) with KMP']],
      aim: 'O(|a| + |b|)',
      note: 'A quick reject: b uses a letter a doesn\'t have.',
    },
    observe: [
      {
        title: 'Starting partway into a copy',
        text: '"cdabcdab" has 8 letters, so try ⌈8 / 4⌉ = 2 copies: "abcdabcd" doesn\'t contain it, because b starts at "cd". 3 copies: "abcdabcdabcd" contains it at index 2.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['a', 'b', 'c', 'd', 'a', 'b', 'c', 'd', 'a', 'b', 'c', 'd'],
              marks: { '2': 'hit', '3': 'hit', '4': 'hit', '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit', '9': 'hit' },
            },
          ],
          caption: '3 copies',
        },
      },
      {
        title: 'Never possible',
        text: 'a = "abc", b = "acb": no window of any number of copies spells "acb": −1 after k and k + 1 fail.',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', 'c', 'a', 'b', 'c'] }], caption: '−1' },
      },
    ],
    brute: {
      idea: 'Keep appending a and checking whether b is inside, up to some generous limit.',
      cost: 'O(limit · |b|)',
      waste: 'Without the bound (about len(b) / len(a) + 2 copies), the loop doesn\'t know when to give up; and each check restarts the search from scratch.',
    },
    pattern: {
      pick: 'string-matching',
      why: 'k = ceil(|b| / |a|); if b in a·k return k; if b in a·(k + 1) return k + 1; return −1. Use KMP for "in": O(|a| + |b|).',
      not: [
        { id: 'math-for-interviews', why: 'The ceiling gives the first count, but the k + 1 argument is what makes it correct.' },
        { id: 'two-pointers', why: 'Matching b against a cyclically is possible, but the copy argument is simpler.' },
      ],
    },
    watch: {
      viz: 'StrWalkViz',
      inputs: [
        { label: '"abcd", "cdabcdab"', input: { mode: 'repmatch', a: 'abcd', b: 'cdabcdab' } },
        { label: '"abc", "acb"', input: { mode: 'repmatch', a: 'abc', b: 'acb' } },
      ],
    },
    edges: ['"a", "aa" → 2.', '"abcd", "cdabcdab" → 3.', '"abc", "acb" → −1.'],
  },

  'repeated-dna-sequences': {
    aha: 'Slide a 10-letter window along s, keeping a set of windows already seen. A window seen a second time is a repeat; a second set reports each repeat once. Encoding A, C, G, T as 2 bits makes each window a 20-bit number that rolls in O(1).',
    asks: {
      read: 'How long is each sequence, and should repeats be listed twice?',
      budget: 's up to 10⁵. How many windows?',
      observe: 'In the example, which window appears twice?',
      brute: 'Comparing every window with every other: what does it cost?',
      pattern: 'How do you notice "I have seen this window before" quickly?',
      watch: 'Watch windows enter the seen set, and repeats get reported.',
    },
    read: [
      { phrase: 'Return every 10-letter-long substring that occurs more than once', says: 'Fixed-length windows; a set of seen ones.' },
      {
        phrase: 'Return each such substring once',
        says: 'A window seen three times must still appear once in the answer, so collect answers in a second set (or add only on the second sighting).',
      },
      { phrase: 'remember the windows you have already seen', says: 'Hash set of windows (or their 20-bit codes).' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [
        ['compare all window pairs', 'n² / 2', 'bad', 'too slow'],
        ['set of windows', 'O(10n)', 'ok', 'fast'],
        ['2-bit rolling code', 'O(n)', 'ok', 'fastest'],
      ],
      aim: 'O(n)',
      note: 'The step-through uses short windows so the row fits; the idea is identical with 10.',
    },
    observe: [
      {
        title: 'A window seen before',
        text: 'Windows of 4 in "ACGTTACGTACGT": "ACGT" appears at 0, 5 and 9; "TACG" at 4 and 8.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['A', 'C', 'G', 'T', 'T', 'A', 'C', 'G', 'T', 'A', 'C', 'G', 'T'], marks: { '5': 'hit', '6': 'hit', '7': 'hit', '8': 'hit' } }],
        },
      },
      {
        title: 'Report once',
        text: '"ACGT" is seen a third time at 9; the repeated set already has it, so it isn\'t added again.',
        sketch: { kind: 'array', rows: [{ label: 'repeated', items: ['ACGT', 'TACG'] }] },
      },
    ],
    brute: {
      idea: 'For each window, scan all later windows for an equal one.',
      cost: 'O(n² · 10)',
      waste: 'Each window is compared with every other; a hash set answers "seen?" in O(1).',
    },
    pattern: {
      pick: 'string-matching',
      why: 'seen, repeated = sets; for i in 0..n − 10: w = s[i, i + 10); if (!seen.add(w)) repeated.add(w). Return repeated. O(n · 10), or O(n) with a rolling 2-bit code.',
      not: [
        { id: 'sliding-window', why: 'The window slides, but it never grows or shrinks: the work is the set lookup.' },
        { id: 'tries', why: 'A trie of windows works but costs more memory than a set of 20-bit codes.' },
      ],
    },
    watch: {
      viz: 'StrWalkViz',
      inputs: [
        { label: '"ACGTTACGTACGT", windows of 4', input: { mode: 'dna', s: 'ACGTTACGTACGT', k: 4 } },
        { label: '"AAAAAA", windows of 3', input: { mode: 'dna', s: 'AAAAAA', k: 3 } },
      ],
    },
    edges: ['Shorter than 10 → [].', '"AAAAAAAAAAAAA" (13 As) → ["AAAAAAAAAA"].', 'Overlapping windows count: "AAAAAA" with windows of 3 → ["AAA"].'],
  },

  'longest-happy-prefix': {
    aha: 'A happy prefix is a border of s: a proper prefix that is also a suffix. The KMP failure table stores exactly that for every prefix, so the answer is s.substring(0, lps[n − 1]), built in one linear pass.',
    asks: {
      read: 'May the prefix and the suffix overlap?',
      budget: 'n ≤ 10⁵. Can you compare every prefix with its suffix?',
      observe: 'For "ababab", what is the longest prefix that is also a suffix?',
      brute: 'Checking each length from n − 1 down: what does it cost?',
      pattern: 'Which table already stores the longest border of every prefix?',
      watch: 'Watch the failure table; the answer is its last value.',
    },
    read: [
      {
        phrase: 'a non-empty prefix of `s` that is also a suffix of `s`, not counting `s` itself',
        says: 'A prefix that is also a suffix, but not the whole string: in KMP terms, the longest proper border.',
      },
      { phrase: 'This is exactly the last value of the KMP failure (prefix) function', says: 'Build lps; read the last entry.' },
    ],
    budget: {
      from: 'n ≤ 10⁵',
      rows: [['every length', 'n² = 10¹⁰', 'bad', 'too slow'], ['KMP table', 'O(n)', 'ok', 'linear']],
      aim: 'O(n)',
      note: 'Rolling hashes of prefixes and suffixes also work in O(n).',
    },
    observe: [
      {
        title: 'Overlap is allowed',
        text: '"ababab": "abab" is both a prefix and a suffix (they overlap in the middle). Nothing longer is.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['a', 'b', 'a', 'b', 'a', 'b'], marks: { '0': 'hit', '1': 'hit', '2': 'hit', '3': 'hit' } }],
          caption: 'lps[5] = 4',
        },
      },
      {
        title: 'Short borders',
        text: '"level": "l" is both a prefix and a suffix. "le" vs "el", "lev" vs "vel", "leve" vs "evel" all differ. So the answer is "l".',
        sketch: { kind: 'array', rows: [{ items: ['l', 'e', 'v', 'e', 'l'], marks: { '0': 'hit', '4': 'hit' } }], caption: '"l"' },
      },
    ],
    brute: {
      idea: 'For each length L from n − 1 down to 1, compare the prefix and suffix of length L.',
      cost: 'O(n²)',
      waste: 'Each length re-compares letters; the failure table reuses borders of shorter prefixes.',
    },
    pattern: {
      pick: 'string-matching',
      why: 'Build lps in O(n) (fall back with len = lps[len − 1] on mismatch); return s.substring(0, lps[n − 1]).',
      not: [
        { id: 'hashing', why: 'Prefix and suffix hashes give O(n) too, with collision risk.' },
        { id: 'two-pointers', why: 'A single pair of pointers can\'t find the longest border without the table\'s fallbacks.' },
      ],
    },
    watch: {
      viz: 'KmpViz',
      inputs: [{ label: '"ababab"', input: { mode: 'table', p: 'ababab' } }, { label: '"level"', input: { mode: 'table', p: 'level' } }],
    },
    edges: ['"level" → "l".', '"ababab" → "abab".', 'No border: "abc" → "".'],
  },

  'shortest-palindrome': {
    aha: 'Adding letters only in front, the part of s kept as the centre must be a palindrome that starts s. So find the longest palindromic prefix P; the answer is reverse(rest) + s. A prefix of s is a palindrome exactly when it equals a suffix of reverse(s), so it is the longest border of s + "#" + reverse(s): the last value of its KMP failure table. The "#" stops a border from crossing the middle.',
    asks: {
      read: 'Where are you allowed to add letters?',
      budget: 's up to 5 × 10⁴. Can you test every prefix for being a palindrome?',
      observe: 'For "abcd", what is the longest palindromic prefix, and what must go in front?',
      brute: 'Checking each prefix from the longest: what does it cost?',
      pattern: 'How can a palindromic prefix of s be found as a border of some string?',
      watch: 'Watch the failure table of s + "#" + reverse(s) build up.',
    },
    read: [
      { phrase: 'You may add characters only in front of `s`', says: 'Keep the longest palindromic prefix; mirror the rest in front.' },
      {
        phrase: 'Finding the longest palindromic prefix quickly is the heart of the problem',
        says: 'Run KMP\'s prefix function on s + "#" + reverse(s): its last value is the length of the longest prefix of s that is a palindrome. The "#" stops a match from running across the middle.',
      },
    ],
    budget: {
      from: 'n ≤ 5 × 10⁴',
      rows: [['test every prefix', 'n² = 2.5 × 10⁹', 'bad', 'too slow'], ['KMP on s#rev', 'O(n)', 'ok', 'linear']],
      aim: 'O(n)',
      note: 'Manacher\'s algorithm also finds palindromic prefixes in O(n).',
    },
    observe: [
      {
        title: 'Keep the palindromic prefix',
        text: '"abcd": the longest palindromic prefix is "a". Mirror the rest, "bcd", in front: "dcb" + "abcd" = "dcbabcd".',
        sketch: { kind: 'array', rows: [{ items: ['d', 'c', 'b', 'a', 'b', 'c', 'd'], marks: { '0': 'cur', '1': 'cur', '2': 'cur', '3': 'hit' } }] },
      },
      {
        title: 'A border of s#rev',
        text: '"abac" + "#" + "caba": its longest border is "aba" (3), which is the longest palindromic prefix of "abac". Answer: "c" + "abac" = "cabac".',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['a', 'b', 'a', 'c', '#', 'c', 'a', 'b', 'a'],
              marks: { '0': 'hit', '1': 'hit', '2': 'hit', '6': 'hit', '7': 'hit', '8': 'hit' },
            },
          ],
          caption: 'border 3',
        },
      },
    ],
    brute: {
      idea: 'For L from n down to 0, check whether s[0..L) is a palindrome; the first one found is the longest.',
      cost: 'O(n²)',
      waste: 'Each check rescans letters; the failure table finds the longest border in one pass.',
    },
    pattern: {
      pick: 'string-matching',
      why: 't = s + "#" + reverse(s); build lps(t); L = lps[last]; return reverse(s.substring(L)) + s. O(n).',
      not: [
        {
          id: 'two-pointers',
          why: 'A palindrome table over all substrings costs O(n²) time and memory, too much for 5 × 10⁴ letters; KMP finds the palindromic prefix in O(n).',
        },
        { id: 'dp-strings', why: 'A palindrome table is O(n²) memory and time.' },
      ],
    },
    watch: {
      viz: 'StrWalkViz',
      inputs: [{ label: '"abcd"', input: { mode: 'shortpal', s: 'abcd' } }, { label: '"abac"', input: { mode: 'shortpal', s: 'abac' } }],
    },
    edges: ['Empty string → "".', 'Already a palindrome: "aba" → "aba".', '"aacecaaa" → "aaacecaaa".'],
  },

  'longest-duplicate-substring': {
    aha: 'If a substring of length L repeats, so does one of every shorter length (its prefix), so "is there a repeat of length L?" is yes up to some length and no after. Binary search that length; check each L with a rolling hash over all windows, looking for a hash seen before (and comparing the text to rule out a collision).',
    asks: {
      read: 'May the two occurrences overlap?',
      budget: 'n up to 3 × 10⁴. Can you compare every pair of substrings?',
      observe: 'In "banana", why does a repeat of length 3 ("ana") imply one of length 2?',
      brute: 'Checking every pair of start positions for the longest common prefix: what does it cost?',
      pattern: 'Which property of "a repeat of length L exists" allows a binary search?',
      watch: 'Watch the binary search over lengths, each checked with a rolling hash.',
    },
    read: [
      { phrase: 'Return any longest substring of `s` that occurs at least twice', says: 'Maximise a length: binary search on it.' },
      { phrase: 'the occurrences may overlap', says: 'Windows may share letters; every start position counts.' },
    ],
    budget: {
      from: 'n ≤ 3 × 10⁴',
      rows: [['every pair of starts', 'n² · L', 'bad', 'too slow'], ['binary search + rolling hash', 'n log n', 'ok', 'fast']],
      aim: 'O(n log n) expected',
      note: 'A suffix array gives a worst-case O(n log n) alternative.',
    },
    observe: [
      {
        title: 'A repeat of length L implies shorter ones',
        text: '"banana": "ana" repeats (at 1 and 3, overlapping), so "an" repeats too. No length-4 substring repeats.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['b', 'a', 'n', 'a', 'n', 'a'], marks: { '1': 'hit', '2': 'hit', '3': 'hit', '4': 'cur', '5': 'cur' } }],
          caption: '"ana" twice',
        },
      },
      {
        title: 'A rolling hash per length',
        text: 'For L = 3, slide one hash across "ban", "ana", "nan", "ana": the fourth hash was seen at index 1, and the text matches.',
        sketch: { kind: 'array', rows: [{ items: ['ban', 'ana', 'nan', 'ana'], marks: { '1': 'hit', '3': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'For every pair of start positions, measure how far they match, and keep the longest.',
      cost: 'O(n² · L)',
      waste: 'Most pairs share nothing; hashing all windows of one length finds repeats in O(n).',
    },
    pattern: {
      pick: 'string-matching',
      why: 'lo = 1, hi = n − 1; while lo ≤ hi: mid; if check(mid) finds a repeat (rolling hash + set, verify text) record it, lo = mid + 1, else hi = mid − 1. O(n log n) expected.',
      not: [
        {
          id: 'binary-search-on-answer',
          why: 'An LCS-style table comparing every pair of positions is O(n²) = 9 × 10⁸ for 3 × 10⁴ letters, in time and memory; binary search plus rolling hash is O(n log n).',
        },
        { id: 'dp-strings', why: 'An LCS-style table over all pairs is O(n²).' },
      ],
    },
    watch: {
      viz: 'StrWalkViz',
      inputs: [{ label: '"banana"', input: { mode: 'lds', s: 'banana' } }, { label: '"abcd"', input: { mode: 'lds', s: 'abcd' } }],
    },
    edges: ['"banana" → "ana".', 'No repeat: "abcd" → "".', 'All equal: "aaaa" → "aaa" (overlapping).'],
  },
};
