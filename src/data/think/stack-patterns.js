/** Practice thinking walkthroughs: stack-patterns (format: src/data/think/index.js). */

export default {
  'valid-parentheses': {
    free: true,
    aha: 'Every closing bracket must match the most recent opening bracket that is still open: last opened, first closed. Push openers on a stack; each closer must match the top, and the stack must be empty at the end.',
    asks: {
      observe: 'In "([)]", when the ) arrives, which opener is the most recent one still open? Does it match?',
      pattern: 'Which structure gives you "the most recently opened, still unclosed" bracket in one step?',
      read: 'Which phrase tells you the order in which brackets must close, and which structure follows that order?',
      budget: 'The string has up to 10⁴ characters. How many times must each one be touched?',
      brute: 'What could you repeatedly delete from the string until it is empty, and what does that cost?',
      watch: 'In "([)]", at which character will the check fail, and what will be on top of the stack then?',
    },
    read: [
      {
        phrase: 'closed by a bracket of the same type',
        says: 'When a closer arrives, we must know which opener it is closing: remember the openers.',
      },
      { phrase: 'the most recently opened one first', says: 'Last opened, first closed: last in, first out. That is exactly a stack.' },
      {
        phrase: 'every closing bracket has a matching opening bracket',
        says: 'A closer with nothing open (an empty stack) is an immediate failure.',
      },
    ],
    budget: { from: 's.length ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'One pass over the string is the target.' },
    observe: [
      {
        title: 'The innermost pair closes first',
        text: 'In "{[()]}", the pairs are nested: ( ) is inside [ ], which is inside { }. A closer always matches the most recent opener that is still open.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['{', '[', '(', ')', ']', '}'],
              bands: [{ from: 0, to: 5, tone: 'ghost' }, { from: 1, to: 4, tone: 'accent' }, { from: 2, to: 3, tone: 'success' }],
            },
          ],
          caption: 'pairs nest like boxes inside boxes',
        },
      },
      {
        title: 'Only the last unmatched opener matters',
        text: 'In "([)]", when ) arrives the last open bracket is [, so ) is wrong, even though a ( is open further back.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['(', '[', ')', ']'], marks: { '1': 'target', '2': 'bad' }, tags: { '2': [['≠ [', 'danger']] } }],
          caption: 'compare only with the most recent opener',
        },
      },
      {
        title: 'Leftovers mean failure',
        text: 'If openers remain when the string ends, something was never closed: "(()" leaves one ( behind.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['(', '(', ')'], marks: { '0': 'bad', '1': 'hit', '2': 'hit' } }],
          caption: 'one opener is still waiting at the end',
        },
      },
    ],
    brute: {
      idea: 'Repeatedly delete every "()", "[]" and "{}" from the string until nothing changes; valid if it becomes empty.',
      cost: 'O(n²)',
      waste: 'Each pass rescans and rebuilds the whole string to remove one layer of pairs.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'Openers wait until they are closed, and the most recent one is closed first. Push openers, and let each closer check the top.',
      not: [
        { id: 'monotonic-stack', why: 'A monotonic stack orders values by size; here we only match types, there is no ordering to keep.' },
        { id: 'two-pointers', why: 'Matching from both ends works for "([])" but not for "()[]", where pairs sit side by side.' },
      ],
    },
    watch: { viz: 'BracketsViz', inputs: [{ label: '"{[()]()}" (valid)', input: { s: '{[()]()}' } }, { label: '"([)]" (crossed)', input: { s: '([)]' } }] },
    edges: ['A single character: "(" → false.', 'Starts with a closer: ")(" → false.', 'Odd length can never be valid: "(()" → false.'],
  },

  'remove-all-adjacent-duplicates-in-string': {
    aha: 'Read left to right, keeping the letters that survive so far. A new letter can only touch the last kept one: if they are equal, both vanish (pop); otherwise it is kept (push). A pop exposes the older letter, ready to cancel with the next one.',
    asks: {
      read: 'Which words say removals can chain?',
      budget: 'Up to 10⁵ letters. What does "remove one pair, then rescan" cost?',
      observe: 'Remove "bb" from "abbaca". Which two letters become neighbours, and what happens to them?',
      brute: 'If you delete one pair at a time, what work do you keep repeating?',
      pattern: 'A new letter is compared only with the last surviving letter. Which structure keeps "the last one" at hand?',
      watch: 'Watch each letter cancel the top or wait on the stack.',
    },
    read: [
      { phrase: 'A removal deletes two adjacent, equal letters', says: 'Only neighbours cancel, and only equal ones.' },
      {
        phrase: 'Keep making removals until none is possible',
        says: 'Removing a pair can make two new letters neighbours, which may cancel in turn: removals chain.',
      },
      {
        phrase: 'The final string is unique no matter which removals you make first',
        says: 'Any order works, so a single left-to-right pass is allowed to decide the order.',
      },
    ],
    budget: {
      from: 's.length ≤ 10⁵',
      n: 100000,
      aim: 'O(n)',
      note: 'Removing one pair and rescanning is O(n²) ≈ 10¹⁰ for a string like "abc…cba" that collapses from the middle.',
    },
    observe: [
      {
        title: 'A removal can create a new pair',
        text: 'Removing "bb" from "abbaca" leaves "aaca": the two a\'s are now neighbours and go too, leaving "ca".',
        sketch: {
          kind: 'array',
          rows: [
            { items: ['a', 'b', 'b', 'a', 'c', 'a'], marks: { '1': 'bad', '2': 'bad' } },
            { label: 'after removing bb', items: ['a', 'a', 'c', 'a'], marks: { '0': 'bad', '1': 'bad' } },
          ],
        },
      },
      {
        title: 'Only the last kept letter can pair with the next one',
        text: 'Read left to right, keeping the letters that survive so far. A new letter touches only the last kept one, so that is the only comparison to make.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'kept: "ab"', items: ['a', 'b'], marks: { '1': 'target' } }, { label: 'next letter', items: ['b'], marks: { '0': 'cur' } }],
          caption: 'b equals the last kept letter: both vanish, and "a" is the last kept letter again',
        },
      },
      {
        title: 'Last kept, first removed: a stack',
        text: 'Push a letter, or pop when the new one equals the top. After a, b, b, a everything has cancelled; then c and a are kept: "ca".',
        sketch: {
          kind: 'array',
          rows: [
            { label: 'after a, b, b, a', items: ['(empty)'], marks: { '0': 'dim' } },
            { label: 'after c, a', items: ['c', 'a'], marks: { '0': 'hit', '1': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Find any two equal neighbours, delete them, and start again until no pair is left.',
      cost: 'O(n²)',
      waste: 'Every removal rescans the string from the start, though a removal only affects the letters right next to it.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack as the output: each letter either cancels the top (equal) or is pushed. Every letter is pushed and popped at most once: O(n). A StringBuilder works as the stack.',
      not: [
        { id: 'two-pointers', why: 'A read pointer and a write pointer over the array is the same idea in place: the written part is the stack.' },
        { id: 'sliding-window', why: 'There is no window to grow or shrink; a removal can reach back any distance.' },
        { id: 'hashing', why: 'Counting letters ignores order, and only neighbours cancel.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [{ label: '"abbaca"', input: { mode: 'dups', s: 'abbaca' } }, { label: '"azxxzy"', input: { mode: 'dups', s: 'azxxzy' } }],
    },
    edges: ['Everything cancels: "aabb" → "".', 'No pairs: "abc" → "abc".', 'A chain from the middle: "abccba" → "".'],
  },

  'backspace-string-compare': {
    aha: 'An editor is a stack: typing a letter pushes it, and # pops the last letter still on screen (if there is one). Type both strings that way and compare the screens.',
    asks: {
      read: 'Which words say what # does, and what it does when nothing is there?',
      budget: 'The strings are tiny. What is the follow-up asking for?',
      observe: 'Type "ab#c" one key at a time. Which letter does # delete?',
      brute: 'Deleting from a string at every # works. What does each deletion cost?',
      pattern: 'The letter # deletes is always the most recently typed one still on screen. Which structure gives you that?',
      watch: 'Watch both strings typed onto a stack, then the screens compared.',
    },
    read: [
      { phrase: '`#` means backspace', says: 'Backspace deletes the most recently typed letter still on screen: last in, first out.' },
      { phrase: 'Backspacing in an empty editor leaves it empty', says: 'A # with nothing to delete does nothing: check before popping.' },
      {
        phrase: 'walk both strings from the end and skip characters that a later `#` would delete',
        says: 'The O(1)-space follow-up: read backwards, counting #s still to apply.',
      },
    ],
    budget: {
      from: 's.length, t.length ≤ 200',
      rows: [
        ['type both, compare', 'O(n + m) time and space', 'ok', 'fits'],
        ['from the end, two pointers', 'O(n + m), O(1) space', 'ok', 'the follow-up'],
      ],
      aim: 'O(n + m)',
      note: 'Tiny inputs: the stack is the clear first answer, and O(1) space is the follow-up.',
    },
    observe: [
      {
        title: 'Backspace deletes the last letter still on screen',
        text: 'Typing "ab#c": a, then b, then # deletes b, then c. The screen shows "ac".',
        sketch: { kind: 'array', rows: [{ items: ['a', 'b', '#', 'c'], marks: { '1': 'bad', '2': 'bad' } }], caption: 'screen: "ac"' },
      },
      {
        title: 'Last typed, first deleted: a stack',
        text: 'The screen behaves like a stack: a letter is pushed, # pops the top. "ad#c" also ends as "ac", so the two editors match: true.',
        sketch: {
          kind: 'array',
          rows: [
            { label: 's → "ac"', items: ['a', 'c'], marks: { '0': 'hit', '1': 'hit' } },
            { label: 't → "ac"', items: ['a', 'c'], marks: { '0': 'hit', '1': 'hit' } },
          ],
        },
      },
      {
        title: 'Extra backspaces do nothing',
        text: 'In "a##c", the second # finds an empty editor and does nothing, so the screen shows "c". Popping an empty stack has to be checked for.',
        sketch: { kind: 'array', rows: [{ items: ['a', '#', '#', 'c'], marks: { '0': 'bad', '1': 'bad', '2': 'dim' } }], caption: 'screen: "c"' },
      },
    ],
    brute: {
      idea: 'Build each final text as a string, cutting off its last character at every #.',
      cost: 'O(n²) for the copying',
      waste: 'Each cut copies the whole text so far; popping a stack is O(1).',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'Type each string onto a stack (letter → push, # → pop if not empty), then compare the two stacks. O(n + m). Follow-up: read both strings from the end, counting pending #s to skip deleted letters, for O(1) space.',
      not: [
        { id: 'two-pointers', why: 'The O(1)-space follow-up is two pointers from the end; the stack is the simpler first answer.' },
        { id: 'hashing', why: 'Comparing letter counts ignores order and which letters were deleted.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '"ab#c" vs "ad#c"', input: { mode: 'backspace', s: 'ab#c', t: 'ad#c' } },
        { label: '"a#c" vs "b"', input: { mode: 'backspace', s: 'a#c', t: 'b' } },
      ],
    },
    edges: ['Both end empty: "ab##", "c#d#" → true.', 'More # than letters: "a##c", "#a#c" → true.', 'Different screens: "a#c", "b" → false.'],
  },

  'baseball-game': {
    aha: 'Every rule looks at the most recent scores (+ the last two, D the last one), and C removes the most recent one. So keep the record on a stack: push new scores, pop for C, and keep a running total.',
    asks: {
      read: 'Which scores does each rule look at?',
      budget: 'Only 1000 operations. What is the real question?',
      observe: 'Apply 5, 2, C, D. Which score does D double?',
      brute: 'A plain list works. What does it tell you about which end you use?',
      pattern: 'You only ever add or remove at one end. Which structure is that?',
      watch: 'Watch each operation push or pop, with the total kept up to date.',
    },
    read: [
      { phrase: 'the sum of the previous two scores', says: '+ needs the two most recent scores still in the record.' },
      {
        phrase: 'double the previous score',
        says: 'D doubles the most recent score still in the record: again, only the top of the record matters.',
      },
      {
        phrase: 'remove the previous score from the record',
        says: 'C undoes the most recent score, which can make an older score "the previous one" again.',
      },
    ],
    budget: {
      from: 'operations.length ≤ 1000',
      rows: [['recompute the total each time', '1000 × 1000', 'ok', 'wasteful'], ['stack + running total', '1000', 'ok', 'instant']],
      aim: 'O(n)',
      note: 'Tiny: the question is which structure fits the rules.',
    },
    observe: [
      {
        title: 'Every rule looks at the most recent scores',
        text: '+ needs the last two scores, D the last one, and C removes the last one. Nothing older than the last two is ever looked at.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['5', '2', 'C', 'D', '+'],
              tags: { '2': [['removes last', 'danger']], '3': [['uses last', 'accent']], '4': [['uses last two', 'accent']] },
            },
          ],
        },
      },
      {
        title: 'C makes an older score "last" again',
        text: 'After 5 and 2, C removes 2, so D doubles 5, not 2: the record becomes [5, 10].',
        sketch: {
          kind: 'array',
          rows: [{ label: 'after 5, 2', items: [5, 2] }, { label: 'after C', items: [5] }, { label: 'after D', items: [5, 10], marks: { '1': 'hit' } }],
        },
      },
      {
        title: 'Then + adds 5 + 10',
        text: 'The record becomes [5, 10, 15] and the total is 30. Adding and removing only ever happen at the end: a stack, with a running total.',
        sketch: { kind: 'array', rows: [{ items: [5, 10, 15], marks: { '2': 'hit' } }], caption: 'total = 30' },
      },
    ],
    brute: {
      idea: 'Keep the scores in a list, look back by index, and add them up at the end.',
      cost: 'O(n)',
      waste: 'Nothing slow; the point is seeing that only one end of the list is ever used (a stack), and that a running total saves the final pass.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack of scores: a number, D and + push (using the top one or two), C pops. Keep the total up to date as you go. O(n).',
      not: [
        { id: 'hashing', why: 'Scores are never looked up by value; only the most recent ones matter.' },
        { id: 'prefix-sums', why: 'A running total is used, but C removes scores, which a prefix sum can\'t undo without remembering them.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '5, 2, C, D, +', input: { mode: 'baseball', ops: ['5', '2', 'C', 'D', '+'] } },
        { label: '5, −2, 4, C, D, 9, +, +', input: { mode: 'baseball', ops: ['5', '-2', '4', 'C', 'D', '9', '+', '+'] } },
      ],
    },
    edges: ['A single score: ["1"] → 1.', 'Everything removed: ["1","C"] → 0.', 'Negative scores: ["5","-2","4","C","D","9","+","+"] → 27.'],
  },

  'evaluate-reverse-polish-notation': {
    aha: 'Every operator applies to the two values just before it, and its result takes their place. So numbers wait on a stack; an operator pops the right operand, then the left, and pushes the result. The last value left is the answer.',
    asks: {
      read: 'Which words say where an operator finds its operands?',
      budget: 'Up to 10⁴ tokens. What does rebuilding the list after each operator cost?',
      observe: 'In 2 1 + 3 *, what does + apply to, and what does * apply to?',
      brute: 'Collapse the first operator with its two operands and repeat. What is repeated?',
      pattern: 'An operator always uses the two most recent values. Which structure keeps them on top?',
      watch: 'Watch numbers wait and operators combine the top two.',
    },
    read: [
      {
        phrase: 'every operator comes after its two operands',
        says: 'No brackets and no precedence: the order of the tokens already says what to compute.',
      },
      { phrase: 'Division between integers truncates toward zero', says: '7 / −2 is −3, not −4: use integer division that truncates.' },
      { phrase: 'Every input is a valid expression', says: 'Every operator will find two values waiting; no checks needed.' },
    ],
    budget: { from: 'tokens.length ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'Collapsing the first operator and rebuilding the list each time is O(n²).' },
    observe: [
      {
        title: 'An operator uses the two values just before it',
        text: 'In 2 1 + 3 *, + applies to 2 and 1, giving 3. Then * applies to that 3 and the 3 after it: (2 + 1) × 3 = 9.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['2', '1', '+', '3', '*'], marks: { '2': 'cur' }, bands: [{ from: 0, to: 2, tone: 'accent', label: '= 3' }] }],
        },
      },
      {
        title: 'The result takes the place of its operands',
        text: 'After +, the expression is effectively 3 3 *: the result is a value like any other, waiting for the next operator.',
        sketch: { kind: 'array', rows: [{ items: ['3', '3', '*'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'The two most recent values, in order',
        text: 'Values wait until an operator needs the latest two: a stack. Pop the right operand first, then the left: 4 2 − is 4 − 2 = 2, not 2 − 4.',
        sketch: { kind: 'array', rows: [{ items: ['4', '2', '−'], tags: { '0': [['a, the left', 'accent']], '1': [['b, popped first', 'warn']] } }] },
      },
    ],
    brute: {
      idea: 'Find the first operator, replace it and the two values before it with the result, and repeat until one value is left.',
      cost: 'O(n²)',
      waste: 'Each collapse rebuilds the whole list, though the two values an operator needs are always the two most recent.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'An operand stack: numbers push; an operator pops b, then a, and pushes a op b. The last value on the stack is the answer. O(n).',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'Splitting at the operator applied last is for listing every grouping of an ordinary expression; RPN already fixes the order.',
        },
        { id: 'math-for-interviews', why: 'Truncating division is the only arithmetic detail; the structure is the stack.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '2 1 + 3 *', input: { mode: 'rpn', tokens: ['2', '1', '+', '3', '*'] } },
        { label: '4 13 5 / +', input: { mode: 'rpn', tokens: ['4', '13', '5', '/', '+'] } },
      ],
    },
    edges: ['One number: ["7"] → 7.', 'Order matters: ["4","2","-"] → 2.', 'Negative division truncates toward zero: ["7","-2","/"] → -3.'],
  },

  'asteroid-collision': {
    aha: 'Only a right-mover followed by a left-mover can meet. Keep the survivors so far on a stack: a new left-mover fights the top while the top moves right, popping smaller ones, until it loses, ties, or has nothing left to hit.',
    asks: {
      read: 'Which pairs of directions can meet, and which can\'t?',
      budget: 'Up to 10⁴ asteroids. What does resolving one collision and rescanning cost?',
      observe: 'In [10, 2, −5], which asteroid does −5 hit first, and what happens next?',
      brute: 'If you resolve one collision at a time, which part of the row do you keep rescanning?',
      pattern: 'A left-mover always hits the nearest surviving right-mover first. Which structure keeps "the nearest survivor" on top?',
      watch: 'Watch left-movers fight the top of the survivor stack.',
    },
    read: [
      {
        phrase: 'a positive sign means it moves right and a negative sign means it moves left',
        says: 'Direction comes from the sign; size from the absolute value.',
      },
      { phrase: 'When two meet, the smaller one explodes', says: 'One comparison per meeting; equal sizes destroy both.' },
      {
        phrase: 'Asteroids moving in the same direction never meet',
        says: 'And a left-mover before a right-mover flies away from it: only "right then left" collide.',
      },
    ],
    budget: { from: 'asteroids.length ≤ 10⁴', n: 10000, aim: 'O(n)', note: 'Resolving one collision and rescanning is O(n²).' },
    observe: [
      {
        title: 'Only right-then-left meet',
        text: 'A right-mover followed by a left-mover are heading at each other. Left then right fly apart, and same directions never meet.',
        sketch: { kind: 'array', rows: [{ items: ['→5', '→10', '←5'], marks: { '1': 'cur', '2': 'cur' }, tags: { '2': [['meets 10', 'danger']] } }] },
      },
      {
        title: 'A left-mover hits the nearest right-mover first',
        text: 'In [5, 10, −5], −5 hits 10 first. 10 is bigger, so −5 explodes and never reaches 5: the answer is [5, 10].',
        sketch: { kind: 'array', rows: [{ items: [5, 10, -5], marks: { '2': 'bad' } }] },
      },
      {
        title: 'A winner keeps fighting',
        text: 'In [10, 2, −5], −5 destroys 2, then meets 10 and loses: [10]. A left-mover can pop several survivors, always the most recent first: a stack of survivors.',
        sketch: { kind: 'array', rows: [{ items: [10, 2, -5], marks: { '1': 'bad', '2': 'bad' } }], caption: 'answer [10]' },
      },
    ],
    brute: {
      idea: 'Find a right-mover followed by a left-mover, resolve that collision, and repeat until none is left.',
      cost: 'O(n²)',
      waste: 'Each collision restarts the scan, though the next collision always involves the newest survivors.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack of survivors: a right-mover, or a left-mover with nothing to hit, is pushed. A left-mover fights the top while the top moves right: pop smaller tops, stop if it loses, remove both if equal. Each asteroid is pushed and popped at most once: O(n).',
      not: [
        { id: 'two-pointers', why: 'Pointers from both ends don\'t help: collisions happen between neighbours, anywhere in the row.' },
        { id: 'monotonic-stack', why: 'The stack isn\'t kept in size order; pops depend on direction and size together.' },
      ],
    },
    watch: {
      viz: 'AsteroidViz',
      inputs: [
        { label: '[5, 10, −5]', input: { a: [5, 10, -5] } },
        { label: '[10, 2, −5]', input: { a: [10, 2, -5] } },
        { label: '[8, −8]', input: { a: [8, -8] } },
      ],
    },
    edges: ['Equal sizes: [8, -8] → [].', 'Never meet: [-2, -1, 1, 2] → [-2, -1, 1, 2].', 'One left-mover wins everything: [1, 2, -5] → [-5].'],
  },

  'simplify-path': {
    aha: 'Split the path on "/" and walk the parts with a stack of folder names: a name goes one folder deeper (push), ".." goes back up (pop, unless at the root), and "." or an empty part changes nothing. Join what is left.',
    asks: {
      read: 'Which parts change the folder, and which do nothing?',
      budget: 'Up to 3000 characters. What is the real difficulty?',
      observe: 'Walk "/a/./b/../../c/" part by part. Which folder are you in after each one?',
      brute: 'Rewriting the string until nothing changes works. What does each rewrite cost?',
      pattern: '".." always leaves the folder entered most recently. Which structure is that?',
      watch: 'Watch each part push, pop or get skipped.',
    },
    read: [
      { phrase: '`..` (parent directory)', says: 'Going up undoes the most recent "go into": last in, first out.' },
      { phrase: '`..` at the root stays at the root', says: 'Popping an empty stack must do nothing.' },
      {
        phrase: 'Any other name, including `...`, is an ordinary directory name',
        says: 'Only "." and ".." are special; compare whole parts, not characters.',
      },
      { phrase: 'separates directories with exactly one `/`', says: 'Repeated slashes make empty parts, which are skipped.' },
    ],
    budget: {
      from: 'path.length ≤ 3000',
      rows: [['repeatedly rewrite the string', 'O(n²)', 'ok', 'fiddly'], ['split + stack of names', 'O(n)', 'ok', 'clean']],
      aim: 'O(n)',
      note: 'Small input; the work is handling each kind of part correctly.',
    },
    observe: [
      {
        title: 'Split into parts',
        text: 'Splitting "/a/./b/../../c/" on "/" gives "", "a", ".", "b", "..", "..", "c", "". The empty parts (from the ends, or from "//") and "." change nothing.',
        sketch: {
          kind: 'array',
          rows: [{ items: ['·', 'a', '.', 'b', '..', '..', 'c', '·'], marks: { '0': 'dim', '2': 'dim', '7': 'dim' } }],
          caption: '· marks an empty part',
        },
      },
      {
        title: '".." leaves the most recent folder',
        text: 'Into a, into b, then ".." leaves b, and the next ".." leaves a. The folder left is always the one entered most recently: a stack.',
        sketch: { kind: 'array', rows: [{ label: 'after a, b', items: ['a', 'b'] }, { label: 'after .., ..', items: ['(root)'], marks: { '0': 'dim' } }] },
      },
      {
        title: 'Join what is left',
        text: 'Then c: the stack holds [c], and the answer is "/" followed by the names joined with "/": "/c". An empty stack means the root, "/".',
        sketch: { kind: 'array', rows: [{ items: ['c'], marks: { '0': 'hit' } }], caption: 'answer "/c"' },
      },
    ],
    brute: {
      idea: 'Repeatedly replace "//" with "/", remove "/./", and collapse "name/.." with string edits until nothing changes.',
      cost: 'O(n²)',
      waste: 'Each rewrite scans and copies the whole path; one pass over the parts with a stack does it all.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'Split on "/" and keep a stack of folder names: a name pushes, ".." pops if the stack isn\'t empty, "." and empty parts are skipped. Join the stack from bottom to top with "/". O(n).',
      not: [
        {
          id: 'two-pointers',
          why: 'Scanning characters with indexes works but makes ".", ".." and "..." fiddly to tell apart; whole parts are cleaner.',
        },
        { id: 'string-matching', why: 'Nothing is searched for; each part is handled by what it is.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: '"/a/./b/../../c/"', input: { mode: 'path', path: '/a/./b/../../c/' } },
        { label: '"/.../a/../b"', input: { mode: 'path', path: '/.../a/../b' } },
      ],
    },
    edges: [
      'Root only: "/" → "/".',
      'Up from the root: "/../" → "/".',
      '"..." is a name: "/.../a/../b" → "/.../b".',
      'Repeated slashes: "/home//foo/" → "/home/foo".',
    ],
  },

  'basic-calculator-ii': {
    aha: 'With × and ÷ binding tighter, the expression is a sum of terms. Read each number with the operator before it: + and − start a new term (−x is stored negative), × and ÷ change the last term at once. Add the terms at the end.',
    asks: {
      read: 'Which words set the order of operations, and what is missing that would make it harder?',
      budget: 'Up to 3 × 10⁵ characters. Can you afford to rescan for the next × each time?',
      observe: 'Split 3 + 2 × 2 into the parts that are added together.',
      brute: 'Two passes (first × and ÷, then + and −) work. What does the first pass really need to keep?',
      pattern: 'Only the most recent term can still be changed by × or ÷. Which structure keeps it on top?',
      watch: 'Watch terms pushed, the top term changed by × and ÷, and the sum.',
    },
    read: [
      { phrase: '`*` and `/` bind tighter than `+` and `-`', says: 'Precedence: a sum of terms, where each term is a run of × and ÷.' },
      { phrase: '(no parentheses)', says: 'No nesting, so one level of terms is all you need.' },
      { phrase: 'integer division truncates toward zero', says: '3 / 2 is 1. Negative terms only appear through −, which is stored as a sign.' },
    ],
    budget: { from: 's.length ≤ 3 × 10⁵', n: 300000, aim: 'O(n)', note: 'Rescanning for the next × or ÷ each time is O(n²) ≈ 9 × 10¹⁰: one pass is needed.' },
    observe: [
      {
        title: 'A sum of terms',
        text: 'With precedence, 3 + 2 × 2 is the terms 3 and 2 × 2 added together. × and ÷ build a term; + and − start a new one.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['3', '+', '2', '×', '2'],
              bands: [{ from: 0, to: 0, tone: 'accent', label: 'term' }, { from: 2, to: 4, tone: 'accent', label: 'term' }],
            },
          ],
        },
      },
      {
        title: 'Read each number with the operator before it',
        text: '+3 starts a term, 3. +2 starts a term, 2. ×2 starts nothing: it changes the last term, 2 → 4.',
        sketch: { kind: 'array', rows: [{ label: 'terms after +3, +2', items: [3, 2] }, { label: 'after ×2', items: [3, 4], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Only the last term can still change',
        text: 'Once + or − starts a new term, the earlier ones are final. Storing −x as a negative term makes the end a plain sum: 3 + 4 = 7. Two variables (the total so far and the last term) do the same in O(1) space.',
        sketch: { kind: 'array', rows: [{ items: [3, 4], marks: { '0': 'hit', '1': 'hit' } }], caption: 'sum = 7' },
      },
    ],
    brute: {
      idea: 'First pass: evaluate every × and ÷ into a list of terms; second pass: add them up.',
      cost: 'O(n), two passes and a list',
      waste: 'Fine for speed, but the list is only ever changed at its end: a stack, and in fact just one variable for the last term.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack of signed terms: +x pushes x, −x pushes −x, ×x and ÷x replace the top with top × x or top ÷ x (truncated). Sum the stack at the end. O(n).',
      not: [
        {
          id: 'divide-and-conquer',
          why: 'Splitting at the operator applied last is for listing every grouping; with fixed precedence one left-to-right pass is enough.',
        },
        { id: 'math-for-interviews', why: 'Truncating division is the only arithmetic subtlety; the structure is the stack of terms.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [{ label: '"3+2*2"', input: { mode: 'calc', s: '3+2*2' } }, { label: '"14-3/2"', input: { mode: 'calc', s: '14-3/2' } }],
    },
    edges: ['A single number: "42" → 42.', 'Division truncates: " 3/2 " → 1.', 'Subtraction, then division: "14-3/2" → 13.'],
  },

  'decode-string': {
    aha: 'The inside of a bracket must be decoded before it can be repeated. At "[", save the text built so far and the repeat count on a stack and start fresh; at "]", repeat the inner text and glue it after the saved text. The last bracket opened is the first one closed.',
    asks: {
      read: 'Which words say brackets can be inside brackets?',
      budget: 'The input is tiny. What actually costs time?',
      observe: 'In 3[a2[c]], which bracket has to be finished first?',
      brute: 'Expanding one innermost bracket at a time works. What does each expansion cost?',
      pattern: 'Opening a bracket pauses the outer text; closing resumes it. Which structure resumes the most recently paused one?',
      watch: 'Watch "[" save (text, k), letters build, and "]" repeat and join.',
    },
    read: [
      { phrase: '`text` repeated exactly `k` times', says: 'Repetition applies to the whole decoded inside, which must be known first.' },
      { phrase: 'Encodings can be nested', says: 'Brackets inside brackets: the innermost is finished first, like nested function calls.' },
      { phrase: 'digits appear only as repeat counts', says: 'A digit always starts a count, which may have several digits ("10[a]").' },
    ],
    budget: {
      from: 's.length ≤ 30, counts ≤ 300',
      rows: [
        ['expand innermost brackets by repeated rewriting', 'O(output × depth)', 'ok', 'slow and fiddly'],
        ['two stacks, one pass', 'O(output)', 'ok', 'clean'],
      ],
      aim: 'O(n + output length)',
      note: 'The input is tiny; the output can be long, so its length is the real cost.',
    },
    observe: [
      {
        title: 'The inside must be decoded first',
        text: 'In 3[a2[c]], the 3 repeats "a2[c]", which itself means "acc". So the innermost bracket is finished first, then the one around it.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: ['3', '[', 'a', '2', '[', 'c', ']', ']'],
              bands: [{ from: 1, to: 7, tone: 'ghost' }, { from: 4, to: 6, tone: 'accent', label: 'first' }],
            },
          ],
        },
      },
      {
        title: 'Opening a bracket pauses the outer text',
        text: 'At the first "[", the text so far ("") and the count 3 wait while the inside is built. At the next "[", the text "a" and the count 2 wait too. The last one paused is the first one resumed.',
        sketch: { kind: 'array', rows: [{ label: 'waiting, bottom → top', items: ['("", ×3)', '("a", ×2)'], marks: { '1': 'cur' } }] },
      },
      {
        title: 'Closing a bracket repeats and joins',
        text: 'At the first "]", the inside is "c": repeat it twice and glue it after the saved "a": "acc". At the last "]", "acc" × 3 after the saved "": "accaccacc".',
        sketch: {
          kind: 'array',
          rows: [
            { label: '"a" + "c" × 2', items: ['acc'], marks: { '0': 'hit' } },
            { label: '"" + "acc" × 3', items: ['accaccacc'], marks: { '0': 'hit' } },
          ],
        },
      },
    ],
    brute: {
      idea: 'Find an innermost k[...] (no brackets inside), replace it with its expansion, and repeat.',
      cost: 'O(n × output length)',
      waste: 'Each expansion rebuilds the whole string and searches it again from the start.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack of (text so far, k): digits build k; "[" pushes (text, k) and starts fresh; letters append; "]" pops and sets text = saved text + current × k. A function that calls itself at "[" is the same idea, with the call stack as the stack.',
      not: [
        { id: 'divide-and-conquer', why: 'Recursion per bracket works and is the same idea; the explicit stack just shows the waiting levels.' },
        { id: 'string-matching', why: 'Nothing is searched for; the brackets nest, which is exactly what a stack tracks.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [{ label: '"3[a2[c]]"', input: { mode: 'decode', s: '3[a2[c]]' } }, { label: '"3[a]2[bc]"', input: { mode: 'decode', s: '3[a]2[bc]' } }],
    },
    edges: ['No brackets: "abc" → "abc".', 'A two-digit count: "10[a]" → "aaaaaaaaaa".', 'Text after the brackets: "2[abc]3[cd]ef" → "abcabccdcdcdef".'],
  },

  'car-fleet': {
    aha: 'A car can only be held up by cars ahead of it. Go from the car closest to the target backwards and compare arrival times: a car that would arrive no later than the fleet ahead joins it; a later one starts a new fleet. Count the fleets.',
    asks: {
      read: 'Which words say a car can never overtake, and what counts as joining?',
      budget: 'Up to 10⁵ cars. Can every car check every car ahead of it?',
      observe: 'Work out each car\'s arrival time if it were alone. Which cars arrive no later than the car directly ahead?',
      brute: 'For each car, you could scan all cars ahead. What is the only thing ahead that matters?',
      pattern: 'Going backwards from the target, which fleet does each new car compare with?',
      watch: 'Watch the cars, closest first, join the fleet ahead or start a new one.',
    },
    read: [
      {
        phrase: 'A car can never pass the car in front of it',
        says: 'Order on the road never changes, so sort by position and think about the car directly ahead.',
      },
      { phrase: 'A car that catches up exactly at `target` still joins that fleet', says: 'Equal arrival times merge: compare with ≤, not <.' },
      { phrase: 'Return the number of fleets', says: 'Only a count is needed, not who is in which fleet.' },
    ],
    budget: { from: 'n ≤ 10⁵', n: 100000, aim: 'O(n log n)', note: 'Checking every car against every car ahead is O(n²) = 10¹⁰.' },
    observe: [
      {
        title: 'Only the cars ahead matter',
        text: 'A car can be held up only by cars in front of it, so go from the car closest to the target backwards: 10, 8, 5, 3, 0.',
        sketch: { kind: 'array', rows: [{ items: [10, 8, 5, 3, 0] }], caption: 'positions, closest to target 12 first' },
      },
      {
        title: 'Compare arrival times, not speeds',
        text: 'Alone, each car would arrive after (12 − position) / speed hours: 1, 1, 7, 3, 12. A car arriving no later than the fleet ahead catches it and joins it.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'hours if alone', items: [1, 1, 7, 3, 12], tags: { '1': [['≤ 1: joins', 'success']], '3': [['≤ 7: joins', 'success']] } }],
        },
      },
      {
        title: 'A later time starts a new fleet',
        text: 'The car at 5 needs 7 hours, later than the fleet ahead (1 hour): it never catches up and leads a new fleet. The car at 0 (12 hours) leads a third. Keep fleet times on a stack; the top is the fleet directly ahead.',
        sketch: { kind: 'array', rows: [{ label: 'fleet times', items: [1, 7, 12], marks: { '0': 'hit', '1': 'hit', '2': 'hit' } }], caption: '3 fleets' },
      },
    ],
    brute: {
      idea: 'A car leads a fleet exactly when every car ahead of it would arrive earlier on its own. Check that for each car by scanning all cars ahead.',
      cost: 'O(n²)',
      waste: 'Every car rescans everything ahead, though only the slowest time ahead (the fleet directly in front) matters.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'Sort by position, closest first, and keep a stack of fleet arrival times. A car whose time is ≤ the top joins that fleet; a later time is pushed as a new fleet. The answer is the stack\'s size. O(n log n) for the sort.',
      not: [
        {
          id: 'monotonic-stack',
          why: 'The fleet times only ever increase up the stack, so it is in sorted order, but nothing is popped: only the top is compared, and one variable would do.',
        },
        { id: 'sorting-and-selection', why: 'Sorting by position is the first step, but the count comes from comparing times with the fleet ahead.' },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [
        { label: 'target 12', input: { mode: 'fleet', target: 12, position: [10, 8, 0, 5, 3], speed: [2, 4, 1, 1, 3] } },
        { label: 'target 10, all merge', input: { mode: 'fleet', target: 10, position: [0, 4, 2], speed: [2, 1, 3] } },
      ],
    },
    edges: ['One car: 10, [3], [3] → 1.', 'Catching up exactly at the target joins: 10, [0, 5], [2, 1] → 1.', 'Nobody catches up: 10, [6, 8], [3, 2] → 2.'],
  },

  'longest-valid-parentheses': {
    aha: 'A ")" that matches nothing can\'t be inside any valid run, so it splits the string. Keep a stack of indexes whose bottom is the last such position (−1 at the start): "(" pushes its index; ")" pops, and then the valid run ending here is i − (the new top), or, if nothing is left, this ")" becomes the new bottom.',
    asks: {
      read: 'Which words say runs must be unbroken, and what breaks them?',
      budget: 'Up to 3 × 10⁴ characters. Can you check every substring?',
      observe: 'In ")()())", when ")" at index 4 matches, where does the valid run ending at 4 begin?',
      brute: 'Checking every substring with a counter works. Which substrings are hopeless?',
      pattern: 'A run ending at i starts right after the last position still unmatched. Which structure keeps that position on top?',
      watch: 'Watch indexes pushed and popped, and each run measured from the new top.',
    },
    read: [
      {
        phrase: 'the longest substring that is a well-formed (properly matched) parentheses string',
        says: 'A substring, so contiguous: not just counting matched pairs.',
      },
      { phrase: 'Pieces must be contiguous', says: 'Two valid pieces only join if nothing unmatched lies between them.' },
      {
        phrase: 'the stray ")" in the middle of a string breaks it into separate runs',
        says: 'An unmatched ")" is a wall: no valid run crosses it.',
      },
    ],
    budget: {
      from: 's.length ≤ 3 × 10⁴',
      n: 30000,
      aim: 'O(n)',
      note: 'Checking every substring with a balance counter is O(n²) ≈ 9 × 10⁸: too slow in practice.',
    },
    observe: [
      {
        title: 'A stray ")" breaks runs',
        text: 'In ")()())", the first ")" matches nothing, and neither does the last. Valid runs can\'t cross them: the answer, "()()", sits between.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [')', '(', ')', '(', ')', ')'],
              marks: { '0': 'bad', '5': 'bad' },
              bands: [{ from: 1, to: 4, tone: 'success', label: 'length 4' }],
            },
          ],
        },
      },
      {
        title: 'A run starts after the last unmatched position',
        text: 'When ")" at index 4 matches "(" at 3, the run ending at 4 starts right after the last position still unmatched, index 0. Its length is 4 − 0 = 4.',
        sketch: {
          kind: 'array',
          rows: [
            {
              items: [')', '(', ')', '(', ')', ')'],
              marks: { '0': 'bad', '4': 'cur' },
              tags: { '0': [['last unmatched', 'danger']], '4': [['i = 4', 'accent']] },
              bands: [{ from: 1, to: 4, tone: 'success' }],
            },
          ],
        },
      },
      {
        title: 'Keep the unmatched positions on a stack',
        text: 'Push the index of every "(". A ")" pops its partner, and whatever is then on top is the last unmatched position, so the run is i − top. A ")" with no partner becomes the new bottom. Start with −1 at the bottom.',
        sketch: {
          kind: 'array',
          rows: [{ label: 'stack before index 4, bottom → top', items: ['0 (bottom)', '3 ('], tags: { '1': [['popped by ) at 4', 'success']] } }],
          caption: 'then 4 − 0 = 4',
        },
      },
    ],
    brute: {
      idea: 'Check every even-length substring with a balance counter and keep the longest well-formed one.',
      cost: 'O(n²)',
      waste: 'Substrings sharing a start are re-checked from scratch, and every substring crossing a stray ")" is checked though none can be valid.',
    },
    pattern: {
      pick: 'stack-patterns',
      why: 'A stack of indexes with a bottom marker: push "(" indexes; a ")" pops, then either the stack is empty (push i as the new bottom) or the run ending here has length i − top. Each index is pushed and popped once: O(n). Two counter scans (left to right, then right to left) give O(1) space.',
      not: [
        {
          id: 'dp-linear',
          why: 'dp[i] = the longest run ending at i also works in O(n), but its two cases ("()" and "))") are harder to get right than the stack.',
        },
        {
          id: 'sliding-window',
          why: 'A window can\'t tell where a valid run starts: validity depends on matching, not on counts inside the window.',
        },
      ],
    },
    watch: {
      viz: 'TokenStackViz',
      inputs: [{ label: '")()())"', input: { mode: 'lvp', s: ')()())' } }, { label: '"()(()"', input: { mode: 'lvp', s: '()(()' } }],
    },
    edges: ['Empty: "" → 0.', 'An unclosed "(" between runs: "()(()" → 2.', 'Nested and side by side: "(()())" → 6.', 'Only closers: "))" → 0.'],
  },
};
