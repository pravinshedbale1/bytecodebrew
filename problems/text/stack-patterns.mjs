export default {
  'valid-parentheses': {
    statement: `\`s\` contains only the characters \`(\`, \`)\`, \`[\`, \`]\`, \`{\` and \`}\`. It is valid when:

- every opening bracket is closed by a bracket of the same type,
- brackets are closed in the correct order (the most recently opened one first),
- every closing bracket has a matching opening bracket.

Return \`true\` if \`s\` is valid.`,
    constraints: ['1 <= s.length <= 1e4', '`s` contains only `()[]{}`'],
    hints: [
      'The bracket that must close next is always the most recently opened one. Which data structure gives you "most recent" first?',
      'Push opening brackets onto a stack. On a closing bracket, the top of the stack must be its matching opener.',
      'Return false if the stack is empty when a closer arrives, and remember to check that the stack is empty at the end.',
    ],
  },
  'remove-all-adjacent-duplicates-in-string': {
    statement: `\`s\` has lowercase English letters. A removal deletes two adjacent, equal letters. Keep making removals until none is possible, then return the final string.

The final string is unique no matter which removals you make first.`,
    constraints: ['1 <= s.length <= 1e5', '`s` has only lowercase English letters'],
    hints: [
      'After removing a pair, the letters on both sides become neighbours and may form a new pair. Restarting the scan each time is O(n²).',
      'Use a stack of kept letters: when the next letter equals the top, pop instead of pushing.',
      'A StringBuilder works as the stack (append and deleteCharAt at the end), and it already holds the answer when you finish.',
    ],
  },
  'backspace-string-compare': {
    statement: `\`s\` and \`t\` are typed into two empty text editors; \`#\` means backspace. Return \`true\` if the two editors end up showing the same text.

Backspacing in an empty editor leaves it empty.`,
    constraints: ['1 <= s.length, t.length <= 200', '`s` and `t` have lowercase letters and `#` only'],
    hints: [
      'Building each final string with a stack (push letters, pop on #) is straightforward and O(n).',
      'For O(1) extra space, read both strings from the end: a # means "skip one more letter to the left".',
      'Move two pointers backwards, each skipping characters it should erase, and compare the characters that survive.',
    ],
  },
  'evaluate-reverse-polish-notation': {
    statement: `\`tokens\` is an arithmetic expression in Reverse Polish Notation: every operator comes after its two operands, as in \`["2","1","+","3","*"]\` for (2 + 1) × 3.

The operators are \`+\`, \`-\`, \`*\` and \`/\`. Division between integers truncates toward zero. Every input is a valid expression and all intermediate values fit in a 32-bit integer. Return the value.`,
    constraints: ['1 <= tokens.length <= 1e4', '`tokens[i]` is an operator or an integer in [-200, 200]'],
    hints: [
      'Numbers wait until an operator arrives. A stack holds them.',
      'When you see an operator, pop two values, apply the operator, and push the result.',
      'Watch the order: the first value popped is the right operand, so compute (second − first) and (second / first).',
    ],
  },
  'asteroid-collision': {
    statement: `\`asteroids\` lists asteroids in a row. The absolute value is the size; a positive sign means it moves right and a negative sign means it moves left. All move at the same speed.

When two meet, the smaller one explodes; if they are the same size, both explode. Asteroids moving in the same direction never meet. Return the asteroids that are left, in order.`,
    constraints: ['2 <= asteroids.length <= 1e4', '-1000 <= asteroids[i] <= 1000', '`asteroids[i] != 0`'],
    hints: [
      'Only a right-moving asteroid followed by a left-moving one can collide. Keep the survivors so far on a stack.',
      'When a left-moving asteroid arrives, it fights the right-moving asteroids on top of the stack one by one.',
      'Pop while the top is positive and smaller; if they are equal pop once and drop the new one; if the top is bigger drop the new one. Push it only if it survives everything.',
    ],
  },
  'simplify-path': {
    statement: `\`path\` is an absolute Unix-style file path (it starts with \`/\`). Return its canonical form, which:

- starts with a single \`/\`,
- separates directories with exactly one \`/\` and has no trailing \`/\` (unless it is the root \`/\`),
- has no \`.\` (current directory) or \`..\` (parent directory) parts; \`..\` at the root stays at the root.

Any other name, including \`...\`, is an ordinary directory name.`,
    constraints: ['1 <= path.length <= 3000', '`path` has English letters, digits, `.`, `/` and `_`', '`path` is a valid absolute Unix path'],
    hints: [
      'Split the path on "/" and look at the parts one at a time. Empty parts come from repeated slashes.',
      'Keep the directories you are in on a stack: ".." pops, "." and empty parts are ignored, anything else is pushed.',
      'Join the stack from bottom to top with "/" and add a leading "/". An empty stack means "/".',
    ],
  },
  'basic-calculator-ii': {
    statement: `\`s\` is a valid expression of non-negative integers, \`+\`, \`-\`, \`*\`, \`/\` and spaces (no parentheses). Evaluate it with the usual precedence, where \`*\` and \`/\` bind tighter than \`+\` and \`-\`, and integer division truncates toward zero.

Do not use a built-in expression evaluator. All intermediate results fit in a 32-bit integer.`,
    constraints: ['1 <= s.length <= 3e5', '`s` has digits, `+-*/` and spaces', 'Every number fits in a 32-bit integer'],
    hints: [
      'Multiplication and division must happen before addition. Can you apply them as soon as you read the second number?',
      'Keep a stack of terms. For + push the number, for − push its negative, and for * or / pop the last term, combine it with the number and push the result.',
      'Apply each operator when you finish reading the number after it (or reach the end). The answer is the sum of the stack.',
    ],
  },
  'decode-string': {
    statement: `An encoded string uses the rule \`k[text]\`, meaning \`text\` repeated exactly \`k\` times. Encodings can be nested, as in \`3[a2[c]]\` → \`accaccacc\`.

Decode \`s\` and return the result. The input is always valid, digits appear only as repeat counts, and the decoded result fits in memory.`,
    constraints: ['1 <= s.length <= 30', '`s` has lowercase letters, digits and square brackets', 'Every repeat count is between 1 and 300'],
    hints: [
      'An inner bracket must be fully decoded before the outer one can repeat it. That nesting suggests a stack (or recursion).',
      'On "[", save the text built so far and the repeat count, then start a fresh piece. On "]", repeat the piece and append it to the saved text.',
      'Counts can have several digits ("10[a]"), so build the number digit by digit.',
    ],
  },
  'longest-valid-parentheses': {
    statement: `\`s\` contains only \`(\` and \`)\`. Return the length of the longest substring that is a well-formed (properly matched) parentheses string.`,
    constraints: ['0 <= s.length <= 3e4', '`s` contains only `(` and `)`'],
    hints: [
      'A stack of indices can tell you where the current valid run started.',
      'Push −1 first as a base. Push the index of every "(". On ")", pop; if the stack becomes empty, push this index as the new base, otherwise the run length is i − stack.peek().',
      'An O(1)-space alternative counts open and close brackets in a left-to-right pass and again right to left, resetting when the counts become invalid.',
    ],
  },
  'baseball-game': {
    statement: `You keep score for a game with odd rules. Start with an empty record and apply each string in \`operations\` in order:

- an integer \`x\`: record a new score of \`x\`;
- \`"+"\`: record a new score equal to the sum of the previous two scores;
- \`"D"\`: record a new score equal to double the previous score;
- \`"C"\`: remove the previous score from the record.

Return the sum of all scores left in the record. Every operation is valid: \`"+"\` always has two previous scores, and \`"D"\` and \`"C"\` always have one.`,
    constraints: ['1 <= operations.length <= 1000', '`operations[i]` is "C", "D", "+" or an integer in [-3·10⁴, 3·10⁴]', 'All intermediate values and the answer fit in a 32-bit integer'],
    hints: [
      'Every operation only looks at the most recent scores, and "C" undoes the most recent one. Which structure gives you the latest item first?',
      'Push each recorded score onto a stack. "C" pops, "D" pushes twice the top.',
      'For "+", read the top two values (pop one, peek the next, push the first back) and push their sum. Finally add up the stack.',
    ],
  },
  'car-fleet': {
    statement: `\`n\` cars drive along a one-lane road towards \`target\`. Car \`i\` starts at \`position[i]\` (all positions are different) and drives at \`speed[i]\` miles per hour.

A car can never pass the car in front of it. If a faster car catches up with a slower one, it slows down and the two drive on together, bumper to bumper, as one **fleet**. A car that catches up exactly at \`target\` still joins that fleet. A single car is a fleet too.

Return the number of fleets that arrive at \`target\`.`,
    constraints: ['n == position.length', 'n == speed.length', '1 <= n <= 1e5', '1 <= target <= 1e6', '0 <= position[i] < target', '1 <= speed[i] <= 1e6', 'All values of `position` are distinct'],
    hints: [
      'Work out the time each car would need to reach target on its own: (target − position) / speed.',
      'Process the cars from the one closest to target backwards. A car behind can only be slowed down by cars in front of it.',
      'If a car\'s solo time is no more than the time of the fleet just ahead, it catches that fleet and merges. Otherwise it arrives later and starts a new fleet. Keep the fleet times on a stack (or just the latest one).',
    ],
  },
};
