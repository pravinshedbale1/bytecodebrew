/**
 * Daily Coach drill answers for every judged problem: [growth class, the exact complexity].
 *
 * The class (ids in src/lib/coach/patterns.js → CX) is what a recognition drill asks for: the worst
 * case of the standard solution the pattern lesson teaches, counting every size in the input as n
 * (m·n → n², V + E → n, n·amount → n²). The exact form is shown when the answer is revealed.
 * null = the problem is drilled on its pattern only: the complexity doesn't fit one class cleanly, or
 * the problem's own hints accept two different classes (so a single "right" class would mark a
 * correct learner wrong).
 * Second pass on 2026-10-20: every entry re-checked against its problem's hints (which were written
 * separately); 4 entries became pattern-only.
 * Checked by scripts/coach-check.mjs: every judged problem has an entry and every class is known.
 */
export default {
  // ---- backtracking
  subsets: ['exp', 'O(n·2ⁿ)'],
  combinations: ['exp', 'O(k·C(n, k))'],
  permutations: ['fact', 'O(n·n!)'],
  'combination-sum': ['exp', 'Exponential in target / smallest candidate'],
  'letter-combinations-of-a-phone-number': ['exp', 'O(n·4ⁿ)'],
  'generate-parentheses': ['exp', 'O(4ⁿ / √n), the Catalan number of results'],
  'subsets-ii': ['exp', 'O(n·2ⁿ)'],
  'combination-sum-ii': ['exp', 'O(n·2ⁿ)'],
  'permutations-ii': ['fact', 'O(n·n!)'],
  'palindrome-partitioning': ['exp', 'O(n·2ⁿ)'],
  'word-search': ['exp', 'O(m·n·3^L), L = word length'],
  'n-queens': ['fact', 'O(n!)'],
  'sudoku-solver': [null, 'Exponential search over the empty cells, though the board is a fixed 9×9'],

  // ---- binary search on the answer
  'koko-eating-bananas': ['nlogn', 'O(n log M), M = largest pile'],
  'find-the-smallest-divisor-given-a-threshold': ['nlogn', 'O(n log M), M = largest value'],
  'capacity-to-ship-packages-within-d-days': ['nlogn', 'O(n log S), S = total weight'],
  'minimum-number-of-days-to-make-m-bouquets': ['nlogn', 'O(n log M), M = latest bloom day'],
  'minimum-time-to-complete-trips': ['nlogn', 'O(n log(min time × totalTrips))'],
  'magnetic-force-between-two-balls': ['nlogn', 'O(n log n + n log M), M = position range'],
  'split-array-largest-sum': ['nlogn', 'O(n log S), S = array sum'],

  // ---- binary search
  'binary-search': ['logn', 'O(log n)'],
  'search-insert-position': ['logn', 'O(log n)'],
  'first-bad-version': ['logn', 'O(log n) calls'],
  sqrtx: ['logn', 'O(log x)'],
  'find-first-and-last-position-of-element-in-sorted-array': ['logn', 'O(log n)'],
  'search-a-2d-matrix': ['logn', 'O(log(m·n))'],
  'find-minimum-in-rotated-sorted-array': ['logn', 'O(log n)'],
  'search-in-rotated-sorted-array': ['logn', 'O(log n)'],
  'find-peak-element': ['logn', 'O(log n)'],
  'median-of-two-sorted-arrays': ['logn', 'O(log(min(m, n)))'],

  // ---- bit manipulation
  'single-number': ['n', 'O(n), O(1) space'],
  'number-of-1-bits': ['1', 'O(1): at most 32 bits'],
  'power-of-two': ['1', 'O(1)'],
  'missing-number': ['n', 'O(n), O(1) space'],
  'counting-bits': ['n', 'O(n)'],
  'reverse-bits': ['1', 'O(1): 32 bits'],
  'single-number-ii': ['n', 'O(n), O(1) space'],
  'sum-of-two-integers': ['1', 'O(1): at most 32 carries'],
  'single-number-iii': ['n', 'O(n), O(1) space'],

  // ---- binary search trees (h = height: log n when balanced, n in the worst case)
  'search-in-a-binary-search-tree': ['n', 'O(h): O(log n) balanced, O(n) worst'],
  'convert-sorted-array-to-binary-search-tree': ['n', 'O(n)'],
  'lowest-common-ancestor-of-a-binary-search-tree': ['n', 'O(h): O(log n) balanced, O(n) worst'],
  'validate-binary-search-tree': ['n', 'O(n)'],
  'kth-smallest-element-in-a-bst': ['n', 'O(h + k)'],
  'insert-into-a-binary-search-tree': ['n', 'O(h): O(log n) balanced, O(n) worst'],
  'delete-node-in-a-bst': ['n', 'O(h): O(log n) balanced, O(n) worst'],
  'binary-search-tree-iterator': ['1', 'O(1) amortised per call, O(h) space'],
  'recover-binary-search-tree': ['n', 'O(n)'],

  // ---- designing data structures (per operation)
  'implement-queue-using-stacks': ['1', 'O(1) amortised per operation'],
  'design-hashmap': ['1', 'O(1) average per operation'],
  'min-stack': ['1', 'O(1) per operation'],
  'lru-cache': ['1', 'O(1) per get and put'],
  'insert-delete-getrandom-o1': ['1', 'O(1) average per operation'],
  'time-based-key-value-store': ['logn', 'O(1) set, O(log n) get'],
  'peeking-iterator': ['1', 'O(1) per call'],
  'flatten-nested-list-iterator': ['1', 'O(1) amortised per call'],
  'snapshot-array': ['logn', 'O(1) set and snap, O(log s) get'],
  'design-twitter': ['nlogn', 'O(f log f) per news feed, f = people followed'],
  'lfu-cache': ['1', 'O(1) per get and put'],
  'insert-delete-getrandom-o1-duplicates-allowed': ['1', 'O(1) average per operation'],

  // ---- grid DP
  'unique-paths': ['n2', 'O(m·n)'],
  'unique-paths-ii': ['n2', 'O(m·n)'],
  'minimum-path-sum': ['n2', 'O(m·n)'],
  triangle: ['n2', 'O(n²) for n rows'],
  'minimum-falling-path-sum': ['n2', 'O(n²)'],
  'maximal-square': ['n2', 'O(m·n)'],
  'count-square-submatrices-with-all-ones': ['n2', 'O(m·n)'],
  'dungeon-game': ['n2', 'O(m·n)'],
  'cherry-pickup': ['n3', 'O(n³)'],

  // ---- knapsack DP
  'partition-equal-subset-sum': ['n2', 'O(n·sum)'],
  'target-sum': ['n2', 'O(n·sum)'],
  'last-stone-weight-ii': ['n2', 'O(n·sum)'],
  'coin-change': ['n2', 'O(n·amount)'],
  'coin-change-ii': ['n2', 'O(n·amount)'],
  'combination-sum-iv': ['n2', 'O(n·target)'],
  'perfect-squares': [null, 'O(n·√n)'],
  'ones-and-zeroes': ['n3', 'O(L·m·n), L = number of strings'],

  // ---- 1D DP
  'house-robber': ['n', 'O(n), O(1) space'],
  'house-robber-ii': ['n', 'O(n)'],
  'maximum-subarray': ['n', 'O(n), Kadane'],
  'maximum-product-subarray': ['n', 'O(n)'],
  'decode-ways': ['n', 'O(n)'],
  'word-break': [null, 'O(n²) split points, each checked against the dictionary'],
  'longest-increasing-subsequence': ['nlogn', 'O(n log n) with patience sorting'],
  'number-of-longest-increasing-subsequence': ['n2', 'O(n²)'],
  'best-time-to-buy-and-sell-stock-with-cooldown': ['n', 'O(n)'],
  'russian-doll-envelopes': ['nlogn', 'O(n log n)'],

  // ---- DP without fear
  'fibonacci-number': ['n', 'O(n)'],
  'climbing-stairs': ['n', 'O(n)'],
  'min-cost-climbing-stairs': ['n', 'O(n)'],
  'n-th-tribonacci-number': ['n', 'O(n)'],

  // ---- state-machine and bitmask DP
  'best-time-to-buy-and-sell-stock-ii': ['n', 'O(n)'],
  'best-time-to-buy-and-sell-stock-with-transaction-fee': ['n', 'O(n)'],
  'best-time-to-buy-and-sell-stock-iii': ['n', 'O(n)'],
  'best-time-to-buy-and-sell-stock-iv': ['n2', 'O(n·k)'],
  'student-attendance-record-ii': ['n', 'O(n), 6 states per day'],
  'beautiful-arrangement': ['exp', 'O(n·2ⁿ)'],
  'partition-to-k-equal-sum-subsets': ['exp', 'O(n·2ⁿ)'],
  'minimum-number-of-work-sessions-to-finish-the-tasks': ['exp', 'O(n·2ⁿ)'],
  'shortest-path-visiting-all-nodes': ['exp', 'O(2ⁿ·n²)'],
  'find-the-shortest-superstring': ['exp', 'O(2ⁿ·n²)'],

  // ---- string DP
  'longest-common-subsequence': ['n2', 'O(m·n)'],
  'delete-operation-for-two-strings': ['n2', 'O(m·n)'],
  'longest-palindromic-substring': ['n2', 'O(n²), expand around centres'],
  'longest-palindromic-subsequence': ['n2', 'O(n²)'],
  'palindromic-substrings': ['n2', 'O(n²)'],
  'interleaving-string': ['n2', 'O(m·n)'],
  'edit-distance': ['n2', 'O(m·n)'],
  'distinct-subsequences': ['n2', 'O(m·n)'],
  'regular-expression-matching': ['n2', 'O(m·n)'],

  // ---- tree and interval DP
  'diameter-of-binary-tree': ['n', 'O(n)'],
  'house-robber-iii': ['n', 'O(n)'],
  'longest-zigzag-path-in-a-binary-tree': ['n', 'O(n)'],
  'predict-the-winner': ['n2', 'O(n²)'],
  'minimum-score-triangulation-of-polygon': ['n3', 'O(n³)'],
  'binary-tree-maximum-path-sum': ['n', 'O(n)'],
  'binary-tree-cameras': ['n', 'O(n)'],
  'burst-balloons': ['n3', 'O(n³)'],
  'minimum-cost-to-cut-a-stick': ['n3', 'O(c³), c = number of cuts'],

  // ---- fast and slow pointers
  'middle-of-the-linked-list': ['n', 'O(n), O(1) space'],
  'linked-list-cycle': ['n', 'O(n), O(1) space'],
  'happy-number': ['logn', 'O(log n)'],
  'palindrome-linked-list': ['n', 'O(n), O(1) space'],
  'remove-nth-node-from-end-of-list': ['n', 'O(n), one pass'],
  'linked-list-cycle-ii': ['n', 'O(n), O(1) space'],
  'reorder-list': ['n', 'O(n), O(1) space'],
  'find-the-duplicate-number': ['n', 'O(n), O(1) space'],

  // ---- graphs and grids
  'flood-fill': ['n2', 'O(m·n)'],
  'number-of-islands': ['n2', 'O(m·n)'],
  'max-area-of-island': ['n2', 'O(m·n)'],
  'number-of-provinces': ['n2', 'O(n²) on the adjacency matrix'],
  'clone-graph': ['n', 'O(V + E)'],
  'rotting-oranges': ['n2', 'O(m·n)'],
  '01-matrix': ['n2', 'O(m·n), multi-source BFS'],
  'shortest-path-in-binary-matrix': ['n2', 'O(n²)'],
  'surrounded-regions': ['n2', 'O(m·n)'],
  'pacific-atlantic-water-flow': ['n2', 'O(m·n)'],
  'word-ladder': ['n3', 'O(N·L²), N words of length L'],

  // ---- greedy
  'assign-cookies': ['nlogn', 'O(n log n + m log m)'],
  'best-time-to-buy-and-sell-stock': ['n', 'O(n)'],
  'jump-game': ['n', 'O(n)'],
  'jump-game-ii': ['n', 'O(n)'],
  'gas-station': ['n', 'O(n)'],
  'partition-labels': ['n', 'O(n)'],
  'boats-to-save-people': ['nlogn', 'O(n log n)'],
  'two-city-scheduling': ['nlogn', 'O(n log n)'],
  candy: ['n', 'O(n)'],

  // ---- hashing
  'two-sum': ['n', 'O(n)'],
  'contains-duplicate': ['n', 'O(n)'],
  'valid-anagram': ['n', 'O(n)'],
  'first-unique-character-in-a-string': ['n', 'O(n)'],
  'group-anagrams': ['n2', 'O(n·k), k = longest word (count key)'],
  'longest-consecutive-sequence': ['n', 'O(n)'],
  'valid-sudoku': ['1', 'O(1): the board is always 9×9'],
  'first-missing-positive': ['n', 'O(n), O(1) space'],

  // ---- heaps
  'last-stone-weight': ['nlogn', 'O(n log n)'],
  'kth-largest-element-in-a-stream': ['logn', 'O(log k) per add'],
  'kth-largest-element-in-an-array': ['nlogn', 'O(n log k) with a size-k heap (O(n) average with quickselect)'],
  'top-k-frequent-elements': ['nlogn', 'O(n log k) with a heap (O(n) with buckets)'],
  'k-closest-points-to-origin': ['nlogn', 'O(n log k)'],
  'task-scheduler': ['n', 'O(n)'],
  'kth-smallest-element-in-a-sorted-matrix': [null, 'O(k log n) with a heap, or O(n log(max − min)) by binary search on the value'],
  'merge-k-sorted-lists': ['nlogn', 'O(N log k), N = all nodes'],
  'find-median-from-data-stream': ['logn', 'O(log n) add, O(1) median'],
  ipo: ['nlogn', 'O(n log n)'],

  // ---- intervals
  'merge-intervals': ['nlogn', 'O(n log n)'],
  'insert-interval': ['n', 'O(n)'],
  'non-overlapping-intervals': ['nlogn', 'O(n log n)'],
  'minimum-number-of-arrows-to-burst-balloons': ['nlogn', 'O(n log n)'],
  'interval-list-intersections': ['n', 'O(m + n)'],
  'remove-covered-intervals': ['nlogn', 'O(n log n)'],
  'minimum-interval-to-include-each-query': ['nlogn', 'O((n + q) log(n + q))'],

  // ---- linked lists
  'reverse-linked-list': ['n', 'O(n), O(1) space'],
  'merge-two-sorted-lists': ['n', 'O(m + n)'],
  'remove-linked-list-elements': ['n', 'O(n)'],
  'add-two-numbers': ['n', 'O(max(m, n))'],
  'reverse-linked-list-ii': ['n', 'O(n), one pass'],
  'swap-nodes-in-pairs': ['n', 'O(n)'],
  'partition-list': ['n', 'O(n)'],
  'rotate-list': ['n', 'O(n)'],
  'reverse-nodes-in-k-group': ['n', 'O(n), O(1) space'],

  // ---- math
  'find-greatest-common-divisor-of-array': ['n', 'O(n + log M)'],
  'palindrome-number': ['logn', 'O(log x): one step per digit'],
  'count-primes': [null, 'O(n log log n), sieve of Eratosthenes'],
  'powx-n': ['logn', 'O(log n), fast power'],
  'reverse-integer': ['logn', 'O(log x): one step per digit'],
  'factorial-trailing-zeroes': ['logn', 'O(log n)'],
  'count-good-numbers': ['logn', 'O(log n), fast power'],
  'shuffle-an-array': ['n', 'O(n) per shuffle, Fisher–Yates'],
  'linked-list-random-node': [null, 'O(n) per pick with reservoir sampling, O(1) with an array'],
  'implement-rand10-using-rand7': ['1', 'O(1) expected calls'],

  // ---- matrices
  'transpose-matrix': ['n2', 'O(m·n)'],
  'spiral-matrix': ['n2', 'O(m·n)'],
  'spiral-matrix-ii': ['n2', 'O(n²)'],
  'rotate-image': ['n2', 'O(n²), in place'],
  'set-matrix-zeroes': ['n2', 'O(m·n), O(1) space'],
  'game-of-life': ['n2', 'O(m·n), in place'],
  'search-a-2d-matrix-ii': ['n', 'O(m + n), from a corner'],
  'diagonal-traverse': ['n2', 'O(m·n)'],

  // ---- monotonic stack
  'next-greater-element-i': ['n', 'O(m + n)'],
  'daily-temperatures': ['n', 'O(n)'],
  'next-greater-element-ii': ['n', 'O(n)'],
  'online-stock-span': ['1', 'O(1) amortised per call'],
  'remove-k-digits': ['n', 'O(n)'],
  'sum-of-subarray-minimums': ['n', 'O(n)'],
  'sliding-window-maximum': ['n', 'O(n), monotonic deque'],
  'largest-rectangle-in-histogram': ['n', 'O(n)'],
  'maximal-rectangle': ['n2', 'O(m·n)'],

  // ---- prefix sums
  'running-sum-of-1d-array': ['n', 'O(n)'],
  'range-sum-query-immutable': ['1', 'O(1) per query after O(n) setup'],
  'find-pivot-index': ['n', 'O(n)'],
  'subarray-sum-equals-k': ['n', 'O(n)'],
  'subarray-sums-divisible-by-k': ['n', 'O(n)'],
  'contiguous-array': ['n', 'O(n)'],
  'product-of-array-except-self': ['n', 'O(n), no division'],
  'range-sum-query-2d-immutable': ['1', 'O(1) per query after O(m·n) setup'],
  'corporate-flight-bookings': ['n', 'O(n + bookings)'],
  'number-of-submatrices-that-sum-to-target': ['n3', 'O(m²·n)'],

  // ---- range queries
  'car-pooling': ['n', 'O(n + last stop), difference array'],
  'range-sum-query-mutable': ['logn', 'O(log n) per update and query'],
  'count-of-smaller-numbers-after-self': ['nlogn', 'O(n log n)'],
  'reverse-pairs': ['nlogn', 'O(n log n)'],
  'count-of-range-sum': ['nlogn', 'O(n log n)'],
  'create-sorted-array-through-instructions': ['nlogn', 'O(n log M), M = largest value'],
  'falling-squares': [null, 'O(n²) is enough for 1,000 squares; O(n log n) with a segment tree on compressed coordinates'],

  // ---- shortest paths
  'network-delay-time': ['nlogn', 'O(E log V), Dijkstra'],
  'path-with-minimum-effort': ['n2logn', 'O(m·n·log(m·n)), Dijkstra on the grid'],
  'cheapest-flights-within-k-stops': ['n2', 'O(k·E), Bellman–Ford rounds'],
  'path-with-maximum-probability': ['nlogn', 'O(E log V)'],
  'minimum-obstacle-removal-to-reach-corner': ['n2', 'O(m·n), 0-1 BFS'],
  'minimum-cost-to-make-at-least-one-valid-path-in-a-grid': ['n2', 'O(m·n), 0-1 BFS'],
  'swim-in-rising-water': ['n2logn', 'O(n² log n)'],
  'find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance': ['n3', 'O(n³), Floyd–Warshall'],

  // ---- sliding window
  'maximum-average-subarray-i': ['n', 'O(n)'],
  'longest-substring-without-repeating-characters': ['n', 'O(n)'],
  'minimum-size-subarray-sum': ['n', 'O(n)'],
  'max-consecutive-ones-iii': ['n', 'O(n)'],
  'longest-repeating-character-replacement': ['n', 'O(n)'],
  'permutation-in-string': ['n', 'O(m + n)'],
  'find-all-anagrams-in-a-string': ['n', 'O(m + n)'],
  'minimum-window-substring': ['n', 'O(m + n)'],
  'subarrays-with-k-different-integers': ['n', 'O(n), at most k minus at most k − 1'],

  // ---- sorting as a tool
  'sort-array-by-increasing-frequency': ['nlogn', 'O(n log n)'],
  'sort-an-array': ['nlogn', 'O(n log n)'],
  'largest-number': ['nlogn', 'O(n log n) comparisons'],
  'h-index': [null, 'O(n log n) by sorting, or O(n) with buckets'],
  'sort-characters-by-frequency': ['n', 'O(n) with buckets'],
  'maximum-gap': ['n', 'O(n) with buckets'],

  // ---- stacks
  'valid-parentheses': ['n', 'O(n)'],
  'remove-all-adjacent-duplicates-in-string': ['n', 'O(n)'],
  'backspace-string-compare': ['n', 'O(m + n)'],
  'evaluate-reverse-polish-notation': ['n', 'O(n)'],
  'asteroid-collision': ['n', 'O(n)'],
  'simplify-path': ['n', 'O(n)'],
  'basic-calculator-ii': ['n', 'O(n)'],
  'decode-string': [null, 'O(length of the decoded output)'],
  'longest-valid-parentheses': ['n', 'O(n)'],

  // ---- string matching
  'find-the-index-of-the-first-occurrence-in-a-string': ['n', 'O(m + n), KMP'],
  'rotate-string': ['n', 'O(n), KMP on s + s'],
  'repeated-substring-pattern': ['n', 'O(n), KMP prefix function'],
  'repeated-string-match': ['n', 'O(m + n)'],
  'repeated-dna-sequences': ['n', 'O(n), rolling hash'],
  'longest-happy-prefix': ['n', 'O(n), prefix function'],
  'shortest-palindrome': ['n', 'O(n), KMP'],
  'longest-duplicate-substring': ['nlogn', 'O(n log n), binary search + rolling hash'],

  // ---- topological sort
  'course-schedule': ['n', 'O(V + E)'],
  'course-schedule-ii': ['n', 'O(V + E)'],
  'course-schedule-iv': ['n3', 'O(n³) reachability table'],
  'minimum-height-trees': ['n', 'O(n), peel the leaves'],
  'find-eventual-safe-states': ['n', 'O(V + E)'],
  'find-all-possible-recipes-from-given-supplies': ['n', 'O(V + E)'],
  'sort-items-by-groups-respecting-dependencies': ['n', 'O(n + m + edges)'],

  // ---- tree BFS
  'binary-tree-level-order-traversal': ['n', 'O(n)'],
  'average-of-levels-in-binary-tree': ['n', 'O(n)'],
  'minimum-depth-of-binary-tree': ['n', 'O(n)'],
  'binary-tree-right-side-view': ['n', 'O(n)'],
  'binary-tree-zigzag-level-order-traversal': ['n', 'O(n)'],
  'find-largest-value-in-each-tree-row': ['n', 'O(n)'],
  'populating-next-right-pointers-in-each-node': ['n', 'O(n), O(1) extra space'],
  'maximum-width-of-binary-tree': ['n', 'O(n)'],

  // ---- tree DFS
  'maximum-depth-of-binary-tree': ['n', 'O(n)'],
  'same-tree': ['n', 'O(n)'],
  'invert-binary-tree': ['n', 'O(n)'],
  'symmetric-tree': ['n', 'O(n)'],
  'path-sum': ['n', 'O(n)'],
  'balanced-binary-tree': ['n', 'O(n), heights bottom-up'],
  'count-good-nodes-in-binary-tree': ['n', 'O(n)'],
  'lowest-common-ancestor-of-a-binary-tree': ['n', 'O(n)'],
  'construct-binary-tree-from-preorder-and-inorder-traversal': ['n', 'O(n) with an index map'],
  'serialize-and-deserialize-binary-tree': ['n', 'O(n)'],

  // ---- tries
  'longest-common-prefix': ['n', 'O(S), S = total characters'],
  'implement-trie-prefix-tree': ['n', 'O(L) per operation, L = word length'],
  'design-add-and-search-words-data-structure': [null, 'O(L) add; search with dots can branch 26 ways each'],
  'replace-words': ['n', 'O(total characters)'],
  'search-suggestions-system': [null, 'O(total characters) to build, O(m) per typed letter'],
  'maximum-xor-of-two-numbers-in-an-array': ['n', 'O(32·n)'],
  'word-search-ii': ['exp', 'O(m·n·4^L), pruned by the trie'],

  // ---- two pointers
  'valid-palindrome': ['n', 'O(n), O(1) space'],
  'remove-duplicates-from-sorted-array': ['n', 'O(n), in place'],
  'move-zeroes': ['n', 'O(n), in place'],
  'squares-of-a-sorted-array': ['n', 'O(n)'],
  'two-sum-ii-input-array-is-sorted': ['n', 'O(n), O(1) space'],
  'container-with-most-water': ['n', 'O(n)'],
  '3sum': ['n2', 'O(n²)'],
  'sort-colors': ['n', 'O(n), one pass'],
  'trapping-rain-water': ['n', 'O(n), O(1) space'],

  // ---- union-find (α = inverse Ackermann, effectively constant)
  'find-if-path-exists-in-graph': ['n', 'O((V + E)·α(V))'],
  'redundant-connection': ['n', 'O(n·α(n))'],
  'satisfiability-of-equality-equations': ['n', 'O(n·α(26))'],
  'smallest-string-with-swaps': ['nlogn', 'O(n log n)'],
  'accounts-merge': ['nlogn', 'O(N log N), N = all emails (sorting)'],
  'min-cost-to-connect-all-points': ['n2', 'O(n²), Prim on the dense graph'],
  'regions-cut-by-slashes': ['n2', 'O(n²·α(n))'],
  'largest-component-size-by-common-factor': [null, 'O(n·√M), M = largest value'],
};
