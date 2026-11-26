/** Practice thinking walkthroughs: dp-strings (format: src/data/think/index.js). */

const notBack = { id: 'backtracking', why: 'Trying every way to align or pick characters is exponential; the table solves each pair of prefixes once.' };

export default {
  'longest-common-subsequence': {
    aha: 'Compare prefixes. dp[i][j] = the LCS of the first i letters of text1 and the first j of text2. If the last letters match, they can end the common subsequence: diagonal + 1. If not, at least one of them is not in it: drop the last letter of one string or the other, whichever keeps more.',
    asks: {
      read: 'Must the common characters be next to each other?',
      budget: 'Both strings up to 1000. How many subsequences does a string have?',
      observe: 'For "abcde" and "ace", which letters line up?',
      brute: 'Listing every subsequence of one string and testing it in the other: how many?',
      pattern: 'Look at the last letters of the two prefixes. What are the cases?',
      watch: 'Watch matches step diagonally and mismatches take the better neighbour.',
    },
    read: [
      { phrase: 'A subsequence keeps the original order of characters but may skip some', says: 'Order matters, gaps are allowed: prefix DP.' },
      { phrase: 'or `0` if they share none', says: 'Empty prefixes give 0: the base row and column.' },
    ],
    budget: { from: 'lengths ≤ 1000', rows: [['every subsequence', '2¹⁰⁰⁰', 'bad', 'impossible'], ['prefix table', '10⁶', 'ok', 'fits']], aim: 'O(m · n)', note: 'Two rows of memory suffice.' },
    observe: [
      {
        title: 'Matches go diagonal',
        text: '"abcde" vs "ace": a = a, c = c, e = e. Each match extends the LCS of the shorter prefixes by 1.',
        sketch: { kind: 'array', rows: [{ label: 'text1', items: ['a', 'b', 'c', 'd', 'e'], marks: { 0: 'hit', 2: 'hit', 4: 'hit' } }, { label: 'text2', items: ['a', 'c', 'e'], marks: { 0: 'hit', 1: 'hit', 2: 'hit' } }] },
      },
      {
        title: 'Mismatches drop a letter',
        text: '"ab" vs "ac": b ≠ c, so the LCS is the better of LCS("a", "ac") and LCS("ab", "a"): 1.',
        sketch: { kind: 'array', rows: [{ items: ['drop b → 1', 'drop c → 1', 'max = 1'] }] },
      },
      {
        title: 'Answer in the corner',
        text: 'dp[5][3] = 3: "ace".',
        sketch: { kind: 'array', rows: [{ items: ['dp[5][3]', '= 3'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Enumerate every subsequence of the shorter string and check whether it is a subsequence of the other; keep the longest.', cost: 'O(2^m · n)', waste: 'Exponentially many subsequences; the table compares each pair of prefixes once.' },
    pattern: {
      pick: 'dp-strings',
      why: 'dp[i][j] = match ? dp[i−1][j−1] + 1 : max(dp[i−1][j], dp[i][j−1]). O(m · n).',
      not: [notBack, { id: 'two-pointers', why: 'Two pointers check whether one string is a subsequence of the other, not the longest common one.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"abcde", "ace"', input: { mode: 'lcs', a: 'abcde', b: 'ace' } }, { label: '"abc", "def"', input: { mode: 'lcs', a: 'abc', b: 'def' } }] },
    edges: ['Identical: "abc", "abc" → 3.', 'Nothing shared: "abc", "def" → 0.', 'One letter: "a", "a" → 1.'],
  },

  'delete-operation-for-two-strings': {
    aha: 'The strings end up equal to something both contain in order: a common subsequence. Fewest deletions keep the longest one, so the answer is len1 + len2 − 2 × LCS. Or directly: dp[i][j] = fewest deletions for the prefixes; equal last letters stay, otherwise delete one of them.',
    asks: {
      read: 'What can a step do, and to which string?',
      budget: 'Lengths up to 500. Table size?',
      observe: 'For "sea" and "eat", what do both end up as?',
      brute: 'Trying every set of deletions: how many?',
      pattern: 'Which earlier problem tells you what survives?',
      watch: 'Watch equal letters keep the diagonal and others pay 1.',
    },
    read: [
      { phrase: 'delete exactly one character from either `word1` or `word2`', says: 'Only deletions: what remains is a common subsequence.' },
      { phrase: 'the answer is `len(word1) + len(word2) − 2 × LCS`', says: 'Keep the longest common subsequence, delete the rest.' },
    ],
    budget: { from: 'lengths ≤ 500', n: 2.5e5, aim: 'O(m · n)', note: 'One table either way.' },
    observe: [
      {
        title: 'Both become "ea"',
        text: '"sea" − s = "ea"; "eat" − t = "ea". Two deletions.',
        sketch: { kind: 'array', rows: [{ items: ['s', 'e', 'a'], marks: { 0: 'bad' } }, { items: ['e', 'a', 't'], marks: { 2: 'bad' } }] },
      },
      {
        title: 'Via LCS',
        text: 'LCS("sea", "eat") = 2, so 3 + 3 − 2·2 = 2.',
        sketch: { kind: 'array', rows: [{ items: ['3 + 3', '− 2·2', '= 2'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Or directly',
        text: 'Equal last letters cost nothing (diagonal); otherwise 1 + the cheaper of deleting either last letter.',
        sketch: { kind: 'array', rows: [{ items: ['equal: diag', 'else: 1 + min(↑, ←)'] }] },
      },
    ],
    brute: { idea: 'Try every subset of letters to delete from each word and keep the cheapest pair that leaves equal strings.', cost: 'O(2^(m+n))', waste: 'Exponentially many deletion sets; the prefix table decides each pair of prefixes once.' },
    pattern: {
      pick: 'dp-strings',
      why: 'dp[i][j] = equal ? dp[i−1][j−1] : 1 + min(dp[i−1][j], dp[i][j−1]), edges i and j. Or m + n − 2·LCS. O(m · n).',
      not: [notBack, { id: 'hashing', why: 'Counting letters ignores order; the order is what matters here.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"sea", "eat"', input: { mode: 'deletes', a: 'sea', b: 'eat' } }, { label: '"leetco", "etco"', input: { mode: 'deletes', a: 'leetco', b: 'etco' } }] },
    edges: ['Already equal: "abc", "abc" → 0.', 'Nothing shared: "ab", "cd" → 4.', '"leetcode", "etco" → 4.'],
  },

  'longest-palindromic-substring': {
    aha: 's[i..j] is a palindrome exactly when its ends match and its inside s[i+1..j−1] is one. Decide short ranges first, so the inside is always known: a table filled by length. Even simpler in memory: every palindrome has a centre (a letter or a gap), so expand outwards from each of the 2n − 1 centres.',
    asks: {
      read: 'Contiguous or not? What if there are ties?',
      budget: 'n ≤ 1000. How many substrings?',
      observe: 'In "babad", which palindromes of length 3 exist?',
      brute: 'Checking every substring: how much work?',
      pattern: 'What does a palindrome look like inside, once its ends are removed?',
      watch: 'Watch the palindrome table fill by length.',
    },
    read: [
      { phrase: 'Return a longest contiguous substring of `s`', says: 'Contiguous: a substring, decided by its ends and inside.' },
      { phrase: 'any of them is accepted', says: 'Ties can be broken any way.' },
    ],
    budget: { from: 'n ≤ 1000', rows: [['check every substring', 'n³ / 6 ≈ 1.7 × 10⁸', 'bad', 'too slow'], ['table or centres', 'n² = 10⁶', 'ok', 'fits']], aim: 'O(n²)', note: 'Centres need O(1) memory; Manacher is O(n).' },
    observe: [
      {
        title: 'Ends and inside',
        text: '"bab": ends b = b, inside "a" is a palindrome → yes. "baba": ends b ≠ a → no.',
        sketch: { kind: 'array', rows: [{ items: ['b', 'a', 'b'], marks: { 0: 'hit', 2: 'hit' } }] },
      },
      {
        title: 'Short first',
        text: 'Length 1: all true. Length 2: equal pairs. Longer: look up the inside, which is two shorter.',
        sketch: { kind: 'array', rows: [{ items: ['len 1', 'len 2', 'len 3 uses len 1', 'len 4 uses len 2'] }] },
      },
      {
        title: 'Expand around centres',
        text: 'From each letter (odd lengths) and each gap (even lengths), grow while both sides match.',
        sketch: { kind: 'array', rows: [{ items: ['b', '←a→', 'b'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'For every substring, check it by comparing letters from both ends.', cost: 'O(n³)', waste: 'Each check repeats the inside check of a shorter substring.' },
    pattern: {
      pick: 'dp-strings',
      why: 'pal[i][j] = s[i] == s[j] && pal[i+1][j−1], by length; track the longest. Or expand around 2n − 1 centres. O(n²).',
      not: [{ id: 'two-pointers', why: 'Expanding from a centre is two pointers moving out; it is the O(1)-memory version.' }, { id: 'string-matching', why: 'Manacher\'s algorithm gives O(n), beyond what is needed.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"babad"', input: { mode: 'palsub', s: 'babad' } }, { label: '"cbbd"', input: { mode: 'palsub', s: 'cbbd' } }] },
    edges: ['One letter: "a" → "a".', 'Even length: "cbbd" → "bb".', 'Whole string: "racecar" → "racecar".'],
  },

  'longest-palindromic-subsequence': {
    aha: 'dp[i][j] = the longest palindromic subsequence inside s[i..j]. If the ends match, they can wrap the best palindrome inside: dp[i+1][j−1] + 2. If not, one end is left out: max(dp[i+1][j], dp[i][j−1]). Fill by increasing length. (It also equals LCS(s, reverse(s)).)',
    asks: {
      read: 'Subsequence or substring?',
      budget: 'n ≤ 1000. Table size?',
      observe: 'In "bbbab", which letters form the longest palindrome?',
      brute: 'Testing every subsequence: how many?',
      pattern: 'How does a palindromic subsequence of s[i..j] relate to one of s[i+1..j−1]?',
      watch: 'Watch ranges grow from single letters to the whole string.',
    },
    read: [
      { phrase: 'A subsequence keeps the order of characters but may skip some', says: 'Gaps allowed: if the ends differ, drop one.' },
      { phrase: 'the longest palindromic subsequence is "bb", of length 2', says: 'Answer a length, not the string.' },
    ],
    budget: { from: 'n ≤ 1000', rows: [['every subsequence', '2¹⁰⁰⁰', 'bad', 'impossible'], ['interval table', '10⁶', 'ok', 'fits']], aim: 'O(n²)', note: 'One row of memory is possible.' },
    observe: [
      {
        title: 'Ends match: wrap the inside',
        text: '"bbbab": ends b = b, inside "bba" has best 2 ("bb"), so 2 + 2 = 4: "bbbb".',
        sketch: { kind: 'array', rows: [{ items: ['b', 'b', 'b', 'a', 'b'], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Ends differ: drop one',
        text: '"cbbd": c ≠ d → max(best of "bbd", best of "cbb") = 2.',
        sketch: { kind: 'array', rows: [{ items: ['drop c → 2', 'drop d → 2', '= 2'] }] },
      },
      {
        title: 'Same as LCS with the reverse',
        text: 'A palindrome reads the same reversed, so it is a common subsequence of s and reverse(s).',
        sketch: { kind: 'array', rows: [{ items: ['LCS("bbbab", "babbb")', '= 4'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Enumerate every subsequence and keep the longest palindrome.', cost: 'O(2ⁿ · n)', waste: 'Exponential; each range\'s best is shared by every larger range around it.' },
    pattern: {
      pick: 'dp-strings',
      why: 'Interval DP: dp[i][i] = 1; ends equal → dp[i+1][j−1] + 2, else max(dp[i+1][j], dp[i][j−1]). O(n²).',
      not: [{ id: 'dp-trees-intervals', why: 'It is an interval DP too; the two-ends recurrence is the string version.' }, notBack],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"bbbab"', input: { mode: 'lps', s: 'bbbab' } }, { label: '"cbbd"', input: { mode: 'lps', s: 'cbbd' } }] },
    edges: ['One letter: "a" → 1.', 'All different: "abc" → 1.', '"bbbab" → 4.'],
  },

  'palindromic-substrings': {
    aha: 'Use the palindrome table from Longest Palindromic Substring (ends match and the inside is a palindrome, filled by length) and count every true cell. Or expand around each of the 2n − 1 centres, counting one for every step outwards that still matches.',
    asks: {
      read: 'Are equal substrings at different positions counted twice?',
      budget: 'n ≤ 1000. How many substrings?',
      observe: 'Why does "aaa" have 6?',
      brute: 'Checking every substring: how slow?',
      pattern: 'Which table from the previous problem already marks every palindrome?',
      watch: 'Watch the count grow as palindromes are found.',
    },
    read: [
      { phrase: 'Substrings at different positions are counted separately', says: 'Count cells (i, j), not distinct strings.' },
      { phrase: '"aaa" has 6 palindromic substrings', says: 'Singles, pairs and the whole: every true cell counts.' },
    ],
    budget: { from: 'n ≤ 1000', rows: [['check every substring', 'n³ / 6', 'bad', 'too slow'], ['table or centres', 'n²', 'ok', 'fits']], aim: 'O(n²)', note: 'Centres use O(1) memory.' },
    observe: [
      {
        title: 'Count by position',
        text: '"aaa": a, a, a, aa, aa, aaa: 6.',
        sketch: { kind: 'array', rows: [{ items: ['a ×3', 'aa ×2', 'aaa ×1', '= 6'], marks: { 3: 'hit' } }] },
      },
      {
        title: 'Same rule as before',
        text: 'pal[i][j] = s[i] == s[j] and pal[i+1][j−1]. Every true cell adds 1.',
        sketch: { kind: 'array', rows: [{ items: ['true cell', '+1'] }] },
      },
      {
        title: 'Centres count as they grow',
        text: 'Expanding from a centre, each successful step outwards is one more palindrome.',
        sketch: { kind: 'array', rows: [{ items: ['centre a', 'aaa', 'stop'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Check every substring with a two-ended comparison and count the palindromes.', cost: 'O(n³)', waste: 'Each check repeats the inside check of a shorter substring.' },
    pattern: {
      pick: 'dp-strings',
      why: 'pal[i][j] by length (or centres); count the true cells. O(n²).',
      not: [{ id: 'two-pointers', why: 'Expanding around centres is two pointers; same count in O(1) memory.' }, { id: 'hashing', why: 'Hashing distinct substrings would miss repeats at different positions.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"aaba"', input: { mode: 'palcount', s: 'aaba' } }, { label: '"aaa"', input: { mode: 'palcount', s: 'aaa' } }] },
    edges: ['"abc" → 3.', '"aaa" → 6.', 'One letter → 1.'],
  },

  'interleaving-string': {
    aha: 'ok[i][j] = can the first i letters of s1 and the first j of s2 form the first i + j letters of s3? The last of those letters came either from s1 (then ok[i−1][j] must hold and the letters match) or from s2 (ok[i][j−1]). Check the lengths first.',
    asks: {
      read: 'Must each string\'s own order be kept? Can letters be reused?',
      budget: 'Lengths up to 100 and 200. Table size?',
      observe: 'For s1 = "aab", s2 = "dbc", s3 = "adabbc", where does each letter come from?',
      brute: 'Trying every way to interleave: why does it blow up?',
      pattern: 'The next letter of s3 comes from where?',
      watch: 'Watch each cell look up (from s1) and left (from s2).',
    },
    read: [
      { phrase: 'keeping the characters of each in their original order', says: 'Prefixes of s1 and s2: a two-string table.' },
      { phrase: 'merging their characters into one string', says: 'Lengths must add up exactly.' },
    ],
    budget: { from: 's1, s2 ≤ 100, s3 ≤ 200', rows: [['all interleavings', 'C(200, 100)', 'bad', 'impossible'], ['prefix table', '10⁴', 'ok', 'tiny']], aim: 'O(m · n)', note: 'One row of memory suffices.' },
    observe: [
      {
        title: 'Lengths first',
        text: 'If |s1| + |s2| ≠ |s3|, it\'s impossible before looking at any letter.',
        sketch: { kind: 'array', rows: [{ items: ['3 + 3', '= 6', '✓'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'Where the next letter comes from',
        text: '"adabbc": a (s1), d (s2), a (s1), b (s2), b (s1), c (s2).',
        sketch: { kind: 'array', rows: [{ items: ['a¹', 'd²', 'a¹', 'b²', 'b¹', 'c²'] }] },
      },
      {
        title: 'Greedy gets stuck',
        text: 'When both strings offer the needed letter, choosing one may fail later; the table keeps both possibilities.',
        sketch: { kind: 'array', rows: [{ items: ['both offer "a"', 'keep both options'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively take the next letter of s3 from s1 or s2 whenever it matches, backtracking on failure.', cost: 'O(2^(m+n))', waste: 'The same (i, j) pair is reached by many orders; the table decides it once.' },
    pattern: {
      pick: 'dp-strings',
      why: 'ok[i][j] = (ok[i−1][j] && s1[i−1] == s3[i+j−1]) || (ok[i][j−1] && s2[j−1] == s3[i+j−1]). O(m · n).',
      not: [{ id: 'two-pointers', why: 'Greedy two pointers fail when both strings offer the same letter.' }, notBack],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"aab" + "dbc" → "adabbc"', input: { mode: 'interleave', a: 'aab', b: 'dbc', c: 'adabbc' } }, { label: 'not an interleaving', input: { mode: 'interleave', a: 'ab', b: 'cd', c: 'adcb' } }] },
    edges: ['Wrong length → false.', 'Empty s1: "" + "abc" → "abc" is true only when s2 equals s3.', '"aabcc" + "dbbca" → "aadbbcbcac": true.'],
  },

  'edit-distance': {
    aha: 'dp[i][j] = the fewest operations turning the first i letters of word1 into the first j of word2. Equal last letters cost nothing (diagonal). Otherwise the last operation was a replace (diagonal + 1), a delete (above + 1) or an insert (left + 1): take the cheapest.',
    asks: {
      read: 'Which three operations are allowed?',
      budget: 'Lengths up to 500. Table size?',
      observe: 'How does "horse" become "ros" in 3 steps?',
      brute: 'Trying operation sequences: why hopeless?',
      pattern: 'What could the very last operation have been?',
      watch: 'Watch each cell pick replace, delete or insert.',
    },
    read: [
      { phrase: 'Each operation inserts, deletes or replaces a single character', says: 'Three neighbours: diagonal, above, left.' },
      { phrase: 'Return the minimum number of operations', says: 'Min over the three, + 1 when the letters differ.' },
    ],
    budget: { from: 'lengths ≤ 500', n: 2.5e5, aim: 'O(m · n)', note: 'Two rows of memory suffice.' },
    observe: [
      {
        title: 'Three moves',
        text: 'horse → rorse (replace h) → rose (delete r) → ros (delete e).',
        sketch: { kind: 'array', rows: [{ items: ['replace', 'delete', 'delete', '= 3'], marks: { 3: 'hit' } }] },
      },
      {
        title: 'Edges',
        text: 'Turning i letters into nothing takes i deletes; nothing into j letters takes j inserts.',
        sketch: { kind: 'array', rows: [{ label: 'row 0', items: [0, 1, 2, 3] }] },
      },
      {
        title: 'Equal letters are free',
        text: 'When word1[i−1] = word2[j−1], copy the diagonal: nothing to fix at that position.',
        sketch: { kind: 'array', rows: [{ items: ['s = s', 'diag'], marks: { 1: 'hit' } }] },
      },
    ],
    brute: { idea: 'Recursively try all three operations at each mismatch and keep the cheapest total.', cost: 'O(3^(m+n))', waste: 'The same pair of prefixes is reached by many operation orders.' },
    pattern: {
      pick: 'dp-strings',
      why: 'dp[i][j] = equal ? dp[i−1][j−1] : 1 + min(dp[i−1][j−1], dp[i−1][j], dp[i][j−1]); edges i and j. O(m · n).',
      not: [notBack, { id: 'graph-traversal', why: 'BFS over strings works for tiny inputs only.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"horse" → "ros"', input: { mode: 'edit', a: 'horse', b: 'ros' } }, { label: '"abc" → "abc"', input: { mode: 'edit', a: 'abc', b: 'abc' } }] },
    edges: ['Same word → 0.', 'From empty: "" → "abc" → 3.', '"intention" → "execution" → 5.'],
  },

  'distinct-subsequences': {
    aha: 'dp[i][j] = the number of ways to pick the first j letters of t out of the first i letters of s, in order. Each letter of s is either skipped (dp[i−1][j]) or, if it equals the next letter of t, used (dp[i−1][j−1]). The empty t has exactly one way.',
    asks: {
      read: 'Are subsequences counted by positions or by content?',
      budget: 's, t up to 1000. Table size?',
      observe: 'In "rabbbit", why are there 3 ways to spell "rabbit"?',
      brute: 'Checking every subsequence of s: how many?',
      pattern: 'What are the two choices for each letter of s?',
      watch: 'Watch skip (↑) and use (↖) add up.',
    },
    read: [
      { phrase: 'Two subsequences are different if they use different positions of `s`', says: 'Count position choices: matching letters split into skip + use.' },
      { phrase: 'The characters of `t` must be matched in order', says: 'Prefix DP over both strings.' },
    ],
    budget: { from: 's, t ≤ 1000', rows: [['every subsequence', '2¹⁰⁰⁰', 'bad', 'impossible'], ['prefix table', '10⁶', 'ok', 'fits']], aim: 'O(m · n)', note: 'One row, filled right to left.' },
    observe: [
      {
        title: 'Which b is left out',
        text: '"rabbbit" has three b\'s; "rabbit" needs two. Leaving out each of the three in turn: 3 ways.',
        sketch: { kind: 'array', rows: [{ items: ['r', 'a', 'b', 'b', 'b', 'i', 't'], marks: { 2: 'hit', 3: 'hit', 4: 'hit' } }] },
      },
      {
        title: 'Skip or use',
        text: 'When s[i−1] = t[j−1], dp[i][j] = dp[i−1][j] (skip) + dp[i−1][j−1] (use). Otherwise only skip.',
        sketch: { kind: 'array', rows: [{ items: ['skip ↑', '+ use ↖'] }] },
      },
      {
        title: 'Empty t is one way',
        text: 'dp[i][0] = 1 for every i: pick nothing.',
        sketch: { kind: 'array', rows: [{ label: 'col 0', items: [1, 1, 1, 1] }] },
      },
    ],
    brute: { idea: 'Enumerate every subsequence of s and count those equal to t.', cost: 'O(2^m · n)', waste: 'Exponential; the counts for each pair of prefixes are shared.' },
    pattern: {
      pick: 'dp-strings',
      why: 'dp[i][j] = dp[i−1][j] + (s[i−1] == t[j−1] ? dp[i−1][j−1] : 0), dp[i][0] = 1. O(m · n).',
      not: [notBack, { id: 'two-pointers', why: 'Two pointers find one occurrence, not the number of them.' }],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"rabbbit", "rabbit"', input: { mode: 'distinct', a: 'rabbbit', b: 'rabbit' } }, { label: '"babgbag", "bag"', input: { mode: 'distinct', a: 'babgbag', b: 'bag' } }] },
    edges: ['t longer than s → 0.', 'Equal strings → 1.', '"babgbag", "bag" → 5.'],
  },

  'regular-expression-matching': {
    aha: 'dp[i][j] = does the first i of s match the first j of p? A letter or "." must match the last character, then the shorter prefixes must match. "x*" has two options: use zero copies (skip x* in the pattern: dp[i][j−2]) or eat one more character that matches x and keep the star (dp[i−1][j]).',
    asks: {
      read: 'Must the pattern match the whole string? What does * apply to?',
      budget: 's ≤ 20, p ≤ 20. Table size?',
      observe: 'Why does "c*a*b" match "aab"?',
      brute: 'Plain recursion on the star: what does it repeat?',
      pattern: 'What are the two choices a star offers?',
      watch: 'Watch stars choose between zero copies and one more.',
    },
    read: [
      { phrase: 'against the whole string `s` (not just a part of it)', says: 'The answer is dp[m][n], both strings fully used.' },
      { phrase: '`*` matches zero or more copies of the element just before it', says: 'Zero copies: drop "x*". More: eat a character, stay on the star.' },
      { phrase: '`.` matches any single character', says: 'A wildcard for one position.' },
    ],
    budget: { from: 's, p ≤ 20', rows: [['recursion without memo', 'exponential', 'bad', 'risky'], ['prefix table', '21 × 21', 'ok', 'tiny']], aim: 'O(m · n)', note: 'Top-down recursion with memo is the same table.' },
    observe: [
      {
        title: 'Zero copies',
        text: '"c*" matches nothing in "aab": skip it. Then "a*" eats "aa", and "b" matches "b".',
        sketch: { kind: 'array', rows: [{ items: ['c* → ""', 'a* → "aa"', 'b → "b"'], marks: { 2: 'hit' } }] },
      },
      {
        title: 'One more copy',
        text: 'For "x*" to take s[i−1], it must match x (or x is "."), and the rest of s must still match the same pattern with the star available.',
        sketch: { kind: 'array', rows: [{ items: ['s[i−1] fits x', '&& dp[i−1][j]'] }] },
      },
      {
        title: 'Empty string, starry pattern',
        text: 'The first row: "" matches "a*b*" (both zero copies) but not "a*b".',
        sketch: { kind: 'array', rows: [{ items: ['a*b* ✓', 'a*b ✗'], marks: { 0: 'hit', 1: 'bad' } }] },
      },
    ],
    brute: { idea: 'Recursive matching: at a star, try zero copies or one more copy, with no memo.', cost: 'O(2^(m+n))', waste: 'The same (i, j) pair is reached many times through different star choices.' },
    pattern: {
      pick: 'dp-strings',
      why: 'dp[i][j]: letter/"." → match && dp[i−1][j−1]; "*" → dp[i][j−2] || (match(s[i−1], p[j−2]) && dp[i−1][j]). O(m · n).',
      not: [{ id: 'string-matching', why: 'KMP finds fixed patterns; stars need the DP.' }, notBack],
    },
    watch: { viz: 'DpGridViz', inputs: [{ label: '"aab" vs "c*a*b"', input: { mode: 'regex', a: 'aab', b: 'c*a*b' } }, { label: '"aa" vs "a"', input: { mode: 'regex', a: 'aa', b: 'a' } }, { label: '"ab" vs ".*"', input: { mode: 'regex', a: 'ab', b: '.*' } }] },
    edges: ['"aa" vs "a" → false.', '"aa" vs "a*" → true.', '"ab" vs ".*" → true.'],
  },
};
