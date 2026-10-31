export default {
  'sort-list': {
    statement: `Given the \`head\` of a singly linked list, sort the list in ascending order and return the head of the sorted list.

Follow-up: can you sort it in O(n log n) time using only O(1) extra memory?`,
    constraints: ['The number of nodes is between 0 and 5 × 1e4', '-1e5 <= Node.val <= 1e5'],
    hints: [
      'Copying the values into an array, sorting it and writing them back works, but uses O(n) extra space. Which O(n log n) sort needs no random access?',
      'Merge sort suits linked lists: find the middle with slow and fast pointers, cut the list in two, sort each half recursively, and merge the two sorted halves by relinking nodes.',
      'Merging two sorted lists needs no extra nodes, just a dummy head. For truly O(1) space, do merge sort bottom-up: merge runs of length 1, then 2, then 4, … iteratively.',
    ],
  },
  'different-ways-to-add-parentheses': {
    statement: `You are given a string \`expression\` made of non-negative integers and the operators \`+\`, \`-\` and \`*\`. Return the results of evaluating it under every possible way of grouping its operations with parentheses. Return them in any order; if two groupings give the same value, include it twice.

The test data guarantees that every result, and every intermediate value, fits in a 32-bit integer, and that there are at most 10⁴ results.`,
    constraints: ['1 <= expression.length <= 20', 'expression consists of digits and the operators +, - and *', 'Every integer in expression is between 0 and 99', 'Integers have no leading + or - sign'],
    hints: [
      'Every grouping has a last operator applied. Choose which operator that is, and the expression splits into a left part and a right part.',
      'Recursively compute all results for the left part and all results for the right part, then combine every pair with the chosen operator. An expression with no operator is just its number.',
      'The same sub-expression appears under many splits. Memoising results by substring avoids recomputing them.',
    ],
  },
  'longest-substring-with-at-least-k-repeating-characters': {
    statement: `Given a string \`s\` and an integer \`k\`, return the length of the longest substring of \`s\` in which **every** character that appears, appears at least \`k\` times. If no such substring exists, return \`0\`.`,
    constraints: ['1 <= s.length <= 1e4', 's consists of lowercase English letters', '1 <= k <= 1e5'],
    hints: [
      'Checking every substring with counts works in O(26 · n²). Look for a character that rules out many substrings at once.',
      'If a character appears fewer than k times in the whole string, no valid substring can contain it. It splits the string into pieces, and the answer lies entirely inside one piece.',
      'Recurse on each piece, recounting characters inside it. A piece where every character appears at least k times is valid as a whole. Each level of recursion removes at least one of the 26 letters, so the depth is at most 26.',
    ],
  },
};
