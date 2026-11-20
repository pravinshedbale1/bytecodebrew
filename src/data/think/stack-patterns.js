/** Practice thinking walkthroughs: stack-patterns (format: src/data/think/index.js). */
export default {
  'valid-parentheses': {
    free: true,
    read: [
      { phrase: 'closed by a bracket of the same type', says: 'When a closer arrives, we must know which opener it is closing: remember the openers.' },
      { phrase: 'the most recently opened one first', says: 'Last opened, first closed: last in, first out. That is exactly a stack.' },
      { phrase: 'every closing bracket has a matching opening bracket', says: 'A closer with nothing open (an empty stack) is an immediate failure.' },
    ],
    budget: { from: 's.length ≤ 10⁴', n: 1e4, aim: 'O(n)', note: 'One pass over the string is the target.' },
    observe: [
      {
        title: 'The innermost pair closes first',
        text: 'In "{[()]}", the pairs are nested: ( ) is inside [ ], which is inside { }. A closer always matches the most recent opener that is still open.',
        sketch: { kind: 'array', rows: [{ items: ['{', '[', '(', ')', ']', '}'], bands: [{ from: 0, to: 5, tone: 'ghost' }, { from: 1, to: 4, tone: 'accent' }, { from: 2, to: 3, tone: 'success' }] }], caption: 'pairs nest like boxes inside boxes' },
      },
      {
        title: 'Only the last unmatched opener matters',
        text: 'In "([)]", when ) arrives the last open bracket is [, so ) is wrong, even though a ( is open further back.',
        sketch: { kind: 'array', rows: [{ items: ['(', '[', ')', ']'], marks: { 1: 'target', 2: 'bad' }, tags: { 2: [['≠ [', 'danger']] } }], caption: 'compare only with the most recent opener' },
      },
      {
        title: 'Leftovers mean failure',
        text: 'If openers remain when the string ends, something was never closed: "(()" leaves one ( behind.',
        sketch: { kind: 'array', rows: [{ items: ['(', '(', ')'], marks: { 0: 'bad', 1: 'hit', 2: 'hit' } }], caption: 'one opener is still waiting at the end' },
      },
    ],
    brute: { idea: 'Repeatedly delete every "()", "[]" and "{}" from the string until nothing changes; valid if it becomes empty.', cost: 'O(n²)', waste: 'Each pass rescans and rebuilds the whole string to remove one layer of pairs.' },
    pattern: {
      pick: 'stack-patterns',
      why: 'Openers wait until they are closed, and the most recent one is closed first. Push openers, and let each closer check the top.',
      not: [
        { id: 'monotonic-stack', why: 'A monotonic stack orders values by size; here we only match types, there is no ordering to keep.' },
        { id: 'two-pointers', why: 'Matching from both ends works for "([])" but not for "()[]", where pairs sit side by side.' },
      ],
    },
    watch: { viz: 'BracketsViz', inputs: [{ label: '"{[()]()}" (valid)', input: { s: '{[()]()}' } }, { label: '"([)]" (crossed)', input: { s: '([)]' } }] },
    edges: ['A single character, like "(" or "]".', 'Starts with a closer: ")(".', 'Odd length can never be valid (a quick early exit).'],
  },
};
