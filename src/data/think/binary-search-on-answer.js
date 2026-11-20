/** Practice thinking walkthroughs: binary-search-on-answer (format: src/data/think/index.js). */
export default {
  'koko-eating-bananas': {
    read: [
      { phrase: 'Return the smallest integer `k`', says: 'The answer is a number we choose, and we want the smallest one that works.' },
      { phrase: 'within `h` hours', says: 'For any given k we can just check whether it works: a yes/no test.' },
      { phrase: 'she finishes it and does not start another pile that hour', says: 'Each pile takes ceil(pile / k) hours on its own. The total is a simple sum.' },
    ],
    budget: { from: 'piles ≤ 10⁴, values ≤ 10⁹', rows: [['try every k', '10⁹ × 10⁴', 'bad'], ['binary search on k', '30 × 10⁴', 'ok']], aim: 'O(n log max)', note: 'The answer lies between 1 and max(piles), up to 10⁹: we cannot try them all.' },
    observe: [
      {
        title: 'Checking one speed is easy',
        text: 'For k = 4, the piles [3, 6, 7, 11] take 1, 2, 2 and 3 hours: 8 in total, which fits h = 8.',
        sketch: { kind: 'array', rows: [{ label: 'piles', items: [3, 6, 7, 11] }, { label: 'hours at k = 4', items: [1, 2, 2, 3], marks: { 0: 'hit', 1: 'hit', 2: 'hit', 3: 'hit' } }], caption: '1 + 2 + 2 + 3 = 8 ≤ 8' },
      },
      {
        title: 'Faster never hurts',
        text: 'If speed k works, every faster speed works too. So the answers to "does k work?" look like no, no, no, yes, yes, yes: they switch once.',
        sketch: { kind: 'array', rows: [{ label: 'k', items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], marks: { 0: 'bad', 1: 'bad', 2: 'bad', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit' }, tags: { 3: [['first yes', 'success']] } }] },
      },
      {
        title: 'Search the answer, not the array',
        text: 'A yes/no that switches once can be binary searched: about 30 checks over 1 … 10⁹, each O(n).',
        sketch: { kind: 'array', rows: [{ label: 'range of k', items: ['1', '…', 'mid', '…', 'max'], marks: { 2: 'cur' } }], caption: 'mid works → look left; it doesn\'t → look right' },
      },
    ],
    brute: { idea: 'Try k = 1, 2, 3, … and return the first speed that finishes in time.', cost: 'O(max(piles) · n)', waste: 'It tests speeds one by one, ignoring that the answers are sorted (no … no, yes … yes).' },
    pattern: {
      pick: 'binary-search-on-answer',
      why: 'Minimise a number whose feasibility test is easy and monotone (faster always still works): binary search over the answer range.',
      not: [
        { id: 'binary-search', why: 'There is no sorted array to search; we search a range of candidate answers instead.' },
        { id: 'greedy', why: 'No local choice builds the answer; we need the smallest speed that passes a global test.' },
      ],
    },
    watch: { viz: 'AnswerSearchViz', inputs: [{ label: 'piles [3, 6, 7, 11], h = 8', input: { mode: 'koko', piles: [3, 6, 7, 11], h: 8 } }] },
    edges: ['h equals the number of piles: the answer is the largest pile.', 'Huge piles: sum the hours in a 64-bit number.', 'A single pile.'],
  },
};
