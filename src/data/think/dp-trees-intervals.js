/** Practice thinking walkthroughs: dp-trees-intervals (format: src/data/think/index.js). */

export default {
  'diameter-of-binary-tree': {
    free: true,
    aha: 'The longest path bends at some highest node: it goes down the left subtree as far as possible and down the right. At that node its length is height(left) + height(right). So compute heights bottom-up, and at every node also update the best "left height + right height". The answer can bend anywhere, not just at the root.',
    asks: {
      read: 'Is length counted in nodes or edges? Must the path pass through the root?',
      budget: 'Up to 10⁴ nodes. Can you afford a height computation per node?',
      observe: 'In [1, 2, 3, 4, 5], which path is longest, and where does it bend?',
      brute: 'For every node, compute both subtree heights from scratch: how slow?',
      pattern: 'What can each node pass up, and what can it record on the side?',
      watch: 'Watch heights come up and the best bend get recorded.',
    },
    read: [
      { phrase: 'That path may or may not pass through the root', says: 'Track a best seen at every node, not just the root\'s value.' },
      { phrase: 'Length is counted in edges, not nodes', says: 'Through a node: left height + right height, with heights in edges below it.' },
    ],
    budget: {
      from: 'nodes ≤ 10⁴',
      rows: [['heights from every node', 'n² = 10⁸', 'bad', 'too slow'], ['one bottom-up pass', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'A chain of 10⁴ nodes means deep recursion; an explicit stack avoids it.',
    },
    observe: [
      {
        title: 'The path bends once',
        text: '4 → 2 → 1 → 3 has 3 edges. It goes up from 4 to 1 and down to 3: it bends at 1.',
        sketch: { kind: 'array', rows: [{ items: [4, 2, 1, 3], marks: { '2': 'hit' } }] },
      },
      {
        title: 'At the bend: left height + right height',
        text: 'At node 1: the left subtree is 2 deep (1 → 2 → 4), the right 1 deep (1 → 3). 2 + 1 = 3.',
        sketch: { kind: 'array', rows: [{ items: ['left 2', 'right 1', '= 3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'It can bend below the root',
        text: 'If one subtree is a long V shape, its own bend beats anything through the root. So record the best at every node.',
        sketch: { kind: 'array', rows: [{ items: ['best = max(best, l + r)', 'return 1 + max(l, r)'] }] },
      },
    ],
    brute: {
      idea: 'For every node, compute the heights of its two subtrees with separate searches and take the largest sum.',
      cost: 'O(n²)',
      waste: 'Every subtree height is recomputed for each ancestor; one bottom-up pass computes each once.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'Tree DP: height(n) = 1 + max(height(l), height(r)); best = max(best, height(l) + height(r)). O(n).',
      not: [
        { id: 'tree-bfs', why: 'Level order gives depths but not the bend at each node.' },
        { id: 'graph-traversal', why: 'Two BFS passes (farthest from any node, then farthest from that) also work on trees.' },
      ],
    },
    watch: {
      viz: 'TreeDfsViz',
      inputs: [
        { label: '[1, 2, 3, 4, 5]', input: { mode: 'diameter', tree: [1, 2, 3, 4, 5] } },
        { label: 'bends below the root', input: { mode: 'diameter', tree: [1, 2, null, 3, 4, 5, null, null, 6] } },
      ],
    },
    edges: ['One node: [1] → 0.', 'Two nodes: [1, 2] → 1.', '[1, 2, 3, 4, 5] → 3.'],
  },

  'house-robber-iii': {
    aha: 'A single best per subtree isn\'t enough: the parent needs to know whether that best robbed the child. So each node returns a pair [take, skip]: the best for its subtree if it is robbed (then both children must be skipped), and if it isn\'t (then each child does its best).',
    asks: {
      read: 'Which houses can\'t both be robbed?',
      budget: 'Up to 10⁴ houses. Try every set?',
      observe: 'In [3, 2, 3, null, 3, null, 1], why is robbing the root and the two grandchildren best?',
      brute: 'Recursively choosing rob or skip at every house: what repeats?',
      pattern: 'What does a parent need to know from each child?',
      watch: 'Watch every node return its [take, skip] pair.',
    },
    read: [
      {
        phrase: 'Robbing two houses that are directly linked (parent and child) sets off the alarm',
        says: 'Rob a node → its children must be skipped.',
      },
      {
        phrase: 'Return the maximum amount of money you can rob',
        says: 'The answer is the better of two plans at the root: rob it (children skipped) or skip it (children free). So each node reports both numbers to its parent.',
      },
    ],
    budget: {
      from: 'nodes ≤ 10⁴',
      rows: [['every set of houses', '2ⁿ', 'bad', 'impossible'], ['pair per node', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'One postorder pass.',
    },
    observe: [
      {
        title: 'Two numbers per node',
        text: 'A leaf with 3: take 3, skip 0. Its parent can then add "skip" when it robs itself.',
        sketch: { kind: 'array', rows: [{ items: ['leaf 3', 'take 3', 'skip 0'] }] },
      },
      {
        title: 'Take = me + children skipped',
        text: 'Tree [3, 2, 3, null, 3, null, 1]. Rob the root 3: its children 2 and 3 must be skipped, and skip(2) = 3 (its child), skip(3) = 1 (its child). take = 3 + 3 + 1 = 7.',
        sketch: { kind: 'array', rows: [{ items: ['3', '+ 3', '+ 1', '= 7'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Skip = each child\'s best',
        text: 'Skip the root: each child gives its own best, max(take, skip). Left: max(2, 3) = 3. Right: max(3, 1) = 3. skip = 6 < 7, so robbing the root wins: 7.',
        sketch: { kind: 'array', rows: [{ items: ['skip root', '= 5'] }] },
      },
    ],
    brute: {
      idea: 'At every house, try robbing it (skip both children, recurse on grandchildren) or skipping it, with no memo.',
      cost: 'O(2ⁿ)',
      waste: 'Grandchildren are solved again from both branches above them.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'rob(n) returns [take = val + l.skip + r.skip, skip = max(l) + max(r)]; answer max at the root. O(n).',
      not: [
        { id: 'dp-linear', why: 'House Robber on a line needs one value per position; a tree needs the pair to inform the parent.' },
        { id: 'greedy', why: 'Robbing alternate levels can lose: [4, 1, null, 2, null, 3] skips two levels.' },
      ],
    },
    watch: {
      viz: 'RobberTreeViz',
      inputs: [
        { label: '[3, 4, 5, 1, 3, null, 1]', input: { tree: [3, 4, 5, 1, 3, null, 1] } },
        { label: 'skip a level', input: { tree: [4, 1, null, 2, null, 3] } },
      ],
    },
    edges: ['One house: [5] → 5.', '[3, 2, 3, null, 3, null, 1] → 7.', 'Skipping two levels: [4, 1, null, 2, null, 3] → 7.'],
  },

  'longest-zigzag-path-in-a-binary-tree': {
    aha: 'Walk down from the root carrying two things: the direction of the step that arrived at the current node and the zigzag length so far. Turning the other way extends the zigzag by 1; going the same way starts a new zigzag of length 1. Track the best length seen.',
    asks: {
      read: 'Where can a zigzag start? How is its length counted?',
      budget: 'Up to 5 × 10⁴ nodes. Start a walk from every node?',
      observe: 'Going left then left again: what happens to the zigzag?',
      brute: 'From every node and each starting direction, follow the zigzag: how slow?',
      pattern: 'What does a node need from its parent to know its zigzag length?',
      watch: 'Watch the length grow on turns and reset on straight steps.',
    },
    read: [
      { phrase: 'switching direction at every step', says: 'A straight step ends the zigzag; it restarts at length 1.' },
      { phrase: 'the number of edges it uses', says: 'Lengths in edges: a single step is 1.' },
    ],
    budget: {
      from: 'nodes ≤ 5 × 10⁴',
      rows: [['walk from every node', 'n · h', 'warn', 'slow on deep trees'], ['one pass carrying the length', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Each node is visited once.',
    },
    observe: [
      {
        title: 'Turn: extend',
        text: 'If a node was reached by a right step and the zigzag so far has length 2, stepping to its left child turns, so the zigzag continues: length 3.',
        sketch: { kind: 'array', rows: [{ items: ['→2', 'go left', '←3'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'Straight: restart',
        text: 'Arrived as a right child; stepping right again starts a new zigzag of length 1 from the parent.',
        sketch: { kind: 'array', rows: [{ items: ['→2', 'go right', '→1'], marks: { '2': 'bad' } }] },
      },
      {
        title: 'Best anywhere',
        text: 'Every node updates best with its arriving length; restarting means no node is visited twice.',
        sketch: { kind: 'array', rows: [{ items: ['best = max(best, len)'] }] },
      },
    ],
    brute: {
      idea: 'From every node, follow the zigzag down starting left and starting right, and keep the longest.',
      cost: 'O(n · h)',
      waste: 'Zigzags overlap: each one is walked again from every node it passes through.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'DFS with (direction, length): turning → len + 1, straight → 1; best = max over nodes. O(n).',
      not: [
        { id: 'tree-bfs', why: 'Levels don\'t capture direction changes.' },
        { id: 'backtracking', why: 'No choices to undo: the length is passed down.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: 'a zigzag of 3', input: { mode: 'zigzag', tree: [1, null, 2, 3, 4, null, null, 5, 6, null, 7] } },
        { label: '[1,1,1,null,1,null,null,1,1,null,1]', input: { mode: 'zigzag', tree: [1, 1, 1, null, 1, null, null, 1, 1, null, 1] } },
      ],
    },
    edges: ['One node: [1] → 0.', 'A straight chain: [1, 2, null, 3] → 1.', '[1,1,1,null,1,null,null,1,1,null,1] → 4.'],
    not: { '0': [] },
  },

  'predict-the-winner': {
    aha: 'Score a range as "how far ahead the player to move can finish". Taking the left end gains it, and then the opponent plays the rest with their own lead: nums[i] − lead[i+1][j]. Same for the right end. lead[i][j] is the better of the two; player 1 wins if lead[0][n−1] ≥ 0.',
    asks: {
      read: 'What counts as a win for player 1?',
      budget: 'Up to 20 numbers. Can you explore the whole game tree?',
      observe: 'In [1, 5, 2], why can\'t player 1 win?',
      brute: 'Minimax over every sequence of choices: how many?',
      pattern: 'How can one number describe a range for whoever moves next?',
      watch: 'Watch the lead table fill from short ranges up.',
    },
    read: [
      { phrase: 'takes the number at either end of `nums`', says: 'What remains is always a contiguous range [i, j].' },
      {
        phrase: 'a tie counts as a win for player 1',
        says: 'Player 1 wins ties, so the question is whether player 1\'s final lead (their total minus player 2\'s) is ≥ 0.',
      },
    ],
    budget: {
      from: 'n ≤ 20',
      rows: [['game tree', '2²⁰', 'ok', 'fits, barely'], ['range table', 'n² = 400', 'ok', 'tiny']],
      aim: 'O(n²)',
      note: 'Only n² ranges exist.',
    },
    observe: [
      {
        title: 'Either end, then the opponent leads',
        text: '[1, 5, 2]: take 1 → opponent leads by max(5 − 2, 2 − 5) = 3 on [5, 2], so 1 − 3 = −2. Take 2 → opponent leads by 4 on [1, 5], so 2 − 4 = −2.',
        sketch: { kind: 'array', rows: [{ items: ['take 1: −2', 'take 2: −2'], marks: { '0': 'bad', '1': 'bad' } }] },
      },
      {
        title: 'Lead, not score',
        text: 'Storing the difference makes both players the same: each maximises "my lead". No need to track whose turn it is.',
        sketch: { kind: 'array', rows: [{ items: ['my take', '− their lead'] }] },
      },
      {
        title: 'Big numbers flip it',
        text: '[1, 5, 233, 7]: player 1 takes 1, so player 2 must open either 5 or 7 and either way leaves 233 at an end for player 1. Player 1 gets 1 + 233 = 234, player 2 gets 12: lead 222 ≥ 0, true.',
        sketch: { kind: 'array', rows: [{ items: ['lead 222', 'true'], marks: { '1': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try both ends on every turn, alternating maximise and minimise.',
      cost: 'O(2ⁿ)',
      waste: 'The same remaining range is reached by many different move orders.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'Interval DP on the lead: lead[i][j] = max(nums[i] − lead[i+1][j], nums[j] − lead[i][j−1]). O(n²).',
      not: [
        { id: 'greedy', why: 'Taking the bigger end now can hand the opponent a bigger number next.' },
        { id: 'backtracking', why: 'The game tree is exponential; ranges repeat.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[1, 5, 233, 7]', input: { mode: 'winner', nums: [1, 5, 233, 7] } },
        { label: '[1, 5, 2]', input: { mode: 'winner', nums: [1, 5, 2] } },
      ],
    },
    edges: ['One number → true.', '[1, 5, 2] → false.', 'A tie: [1, 1] → true.'],
    not: { '0': [] },
  },

  'minimum-score-triangulation-of-polygon': {
    aha: 'Look at the side from vertex i to vertex j. In any triangulation it belongs to exactly one triangle (i, k, j), with k somewhere between them. That triangle splits the rest into the polygons i..k and k..j, solved the same way. dp[i][j] = min over k of dp[i][k] + dp[k][j] + v[i]·v[k]·v[j].',
    asks: {
      read: 'How many triangles, and how is each scored?',
      budget: 'Up to 50 vertices. How many triangulations?',
      observe: 'For [3, 7, 4, 5], what are the two triangulations?',
      brute: 'Trying every triangulation: how many for 50 vertices?',
      pattern: 'Which triangle must contain the side between the first and last vertex?',
      watch: 'Watch each range try every apex k.',
    },
    read: [
      { phrase: 'Triangulate it into `n − 2` triangles', says: 'Every side is in exactly one triangle: split on the triangle of side (0, n−1).' },
      { phrase: 'the product of its three vertex values', says: 'Cost of choosing apex k: v[i]·v[k]·v[j].' },
    ],
    budget: {
      from: 'n ≤ 50',
      rows: [['every triangulation', 'Catalan(48) ≈ 10²⁶', 'bad', 'impossible'], ['interval table', 'n³ = 1.25 × 10⁵', 'ok', 'tiny']],
      aim: 'O(n³)',
      note: 'Same shape as matrix-chain multiplication.',
    },
    observe: [
      {
        title: 'Two ways for a quadrilateral',
        text: '[3, 7, 4, 5]: diagonal 0–2 gives 3·7·4 + 3·4·5 = 144; diagonal 1–3 gives 3·7·5 + 7·4·5 = 245. Answer 144.',
        sketch: { kind: 'array', rows: [{ items: ['diag 0–2: 144', 'diag 1–3: 245'], marks: { '0': 'hit' } }] },
      },
      {
        title: 'The side (0, n − 1) picks a triangle',
        text: 'Choosing its apex k splits the polygon into two smaller ones that don\'t interact.',
        sketch: { kind: 'array', rows: [{ items: ['0..k', '(0, k, n−1)', 'k..n−1'] }] },
      },
      {
        title: 'Small ranges first',
        text: 'dp[i][i+1] = 0 (just a side). Each longer range tries every apex between its ends.',
        sketch: { kind: 'array', rows: [{ items: ['len 2: 0', 'len 3: one triangle', 'longer: try k'] }] },
      },
    ],
    brute: {
      idea: 'Recursively choose the apex for side (i, j) and recurse on both sides, with no memo.',
      cost: 'O(Catalan(n))',
      waste: 'The same sub-polygon i..j is triangulated again under every outer choice.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'dp[i][j] = min over i < k < j of dp[i][k] + dp[k][j] + v[i]·v[k]·v[j], by increasing length. O(n³).',
      not: [
        { id: 'greedy', why: 'Cutting off the cheapest triangle first can leave expensive ones.' },
        { id: 'backtracking', why: 'Triangulations are counted by Catalan numbers.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[3, 7, 4, 5]', input: { mode: 'triangulate', nums: [3, 7, 4, 5] } },
        { label: '[1, 3, 1, 4, 1, 5]', input: { mode: 'triangulate', nums: [1, 3, 1, 4, 1, 5] } },
      ],
    },
    edges: ['Triangle: [1, 2, 3] → 6.', '[3, 7, 4, 5] → 144.', '[1, 3, 1, 4, 1, 5] → 13.'],
  },

  'stone-game': {
    aha: 'Same "lead" table as Predict the Winner: lead[i][j] = max(piles[i] − lead[i+1][j], piles[j] − lead[i][j−1]). But there\'s a shortcut: with an even number of piles, Alice can always take every even-indexed pile or every odd-indexed one, whichever sum is bigger. The total is odd, so the sums differ: Alice always wins.',
    asks: {
      read: 'What do the even count and the odd total guarantee?',
      budget: 'Up to 500 piles. Table size?',
      observe: 'With [5, 3, 4, 5], can Alice force getting both 5s?',
      brute: 'Exploring every game: how many?',
      pattern: 'Is this Predict the Winner in disguise?',
      watch: 'Watch the lead table, then the parity argument.',
    },
    read: [
      {
        phrase: 'the total number of stones is **odd**, so there are no ties',
        says: 'The total is odd, so the two scores can never be equal: someone always wins outright, and the only question is who.',
      },
      { phrase: 'takes the entire pile from **either end**', says: 'Remaining piles form a range: interval DP.' },
    ],
    budget: {
      from: 'piles ≤ 500',
      rows: [['range table', '500² / 2', 'ok', 'fits'], ['parity argument', 'O(1)', 'ok', 'instant']],
      aim: 'O(n²) or O(1)',
      note: 'The DP generalises; the parity trick is specific to this setup.',
    },
    observe: [
      {
        title: 'Alice controls parity',
        text: 'With piles at indices 0..3, Alice takes index 0 or 3 (one even, one odd). Whatever Bob does, Alice can keep taking the same parity.',
        sketch: { kind: 'array', rows: [{ items: [5, 3, 4, 5], marks: { '0': 'hit', '2': 'hit' } }], caption: 'even indices: 9, odd: 8' },
      },
      {
        title: 'The table agrees',
        text: 'For [5, 3, 4, 5], lead[0][3] = 1 > 0: with best play Alice ends 1 stone ahead (taking the even indices gives her 9 to Bob\'s 8). The DP confirms what the parity argument predicts.',
        sketch: { kind: 'array', rows: [{ items: ['lead 1', '→ true'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Why learn the DP then?',
        text: 'Change any rule (odd number of piles, ties allowed, take from one end) and parity no longer works; the lead table still does.',
        sketch: { kind: 'array', rows: [{ items: ['rules change', 'DP still works'] }] },
      },
    ],
    brute: {
      idea: 'Minimax over every sequence of end choices.',
      cost: 'O(2ⁿ)',
      waste: 'Many different move orders leave the same range of piles, and each is solved again from scratch.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'Interval lead DP: lead[i][j] = max(p[i] − lead[i+1][j], p[j] − lead[i][j−1]); answer lead > 0 (always true here by parity). O(n²).',
      not: [
        { id: 'math-for-interviews', why: 'The parity argument returns true in O(1) for exactly this setup.' },
        { id: 'greedy', why: 'Taking the bigger end now can lose.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[5, 3, 4, 5]', input: { mode: 'stonegame', nums: [5, 3, 4, 5] } },
        { label: '[3, 7, 2, 3]', input: { mode: 'stonegame', nums: [3, 7, 2, 3] } },
      ],
    },
    edges: ['Two piles: [1, 2] → true (take 2).', '[5, 3, 4, 5] → true.', '[3, 7, 2, 3] → true.'],
    not: { '1': [] },
  },

  'stone-game-ii': {
    aha: 'Whatever the current player doesn\'t take goes to the other player, who then plays the same game. So dp[i][M] = the most the player to move gets from pile i with limit M = max over X ≤ 2M of (all stones left) − dp[i + X][max(M, X)]. Suffix sums give "all stones left" in O(1). If 2M reaches the end, take everything.',
    asks: {
      read: 'How does M change after a move?',
      budget: 'Up to 100 piles. How many (position, M) states?',
      observe: 'With [2, 7, 9, 4, 4], what happens if Alice takes 2 piles first?',
      brute: 'Exploring every sequence of moves: how many?',
      pattern: 'What does a state need besides the position?',
      watch: 'Watch the (position, M) table fill from the end.',
    },
    read: [
      { phrase: 'the first `X` remaining piles, where `1 <= X <= 2M`', says: 'Options depend on M: the state is (position, M).' },
      { phrase: 'Then `M` becomes `max(M, X)`', says: 'The next state uses max(M, X).' },
      {
        phrase: 'Return the maximum number of stones Alice can get',
        says: 'Alice moves first from pile 0 with M = 1, so her best total is dp[0][1].',
      },
    ],
    budget: {
      from: 'piles ≤ 100',
      rows: [['every game', 'exponential', 'bad', 'impossible'], ['(i, M) table', 'n · n · 2n = 2 × 10⁶', 'ok', 'fits']],
      aim: 'O(n³)',
      note: 'M never needs to exceed n.',
    },
    observe: [
      {
        title: 'Everything left minus their best',
        text: 'If the player to move takes X piles, the other player gets dp[i + X][max(M, X)] of what remains. So the mover gets suffix[i] minus that.',
        sketch: { kind: 'array', rows: [{ items: ['suffix[i]', '− dp[i+X][M\']'] }] },
      },
      {
        title: 'Take all when allowed',
        text: 'From pile i, if 2M ≥ the number of piles left, the mover can take everything, and that is best (stones are never negative): dp[i][M] = suffix[i].',
        sketch: { kind: 'array', rows: [{ items: ['2M ≥ left', '→ take all'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'Alice gets 10',
        text: '[2, 7, 9, 4, 4]: taking 1 pile (2) then 2 more later gives 2 + 4 + 4 = 10 for Alice; taking 2 piles first gives only 9.',
        sketch: { kind: 'array', rows: [{ items: ['take 1 → 10', 'take 2 → 9'], marks: { '0': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Recursively try every X for every move with no memo.',
      cost: 'O((2M)^n)',
      waste: 'The same (position, M) is reached by many different move histories.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'dp[i][M] = suffix[i] if i + 2M ≥ n, else max over X of suffix[i] − dp[i + X][max(M, X)]; answer dp[0][1]. O(n³).',
      not: [
        { id: 'greedy', why: 'Taking the most stones now (X = 2M) lets M grow for the opponent.' },
        { id: 'prefix-sums', why: 'Suffix sums supply "stones left"; the decision is the DP.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: '[2, 7, 9, 4, 4]', input: { mode: 'stone2', nums: [2, 7, 9, 4, 4] } },
        { label: '[1, 2, 3, 4, 5, 100]', input: { mode: 'stone2', nums: [1, 2, 3, 4, 5, 100] } },
      ],
    },
    edges: ['One pile: [5] → 5.', 'Two piles: [1, 2] → 3 (X = 2 allowed).', '[1, 2, 3, 4, 5, 100] → 104.'],
  },

  'binary-tree-maximum-path-sum': {
    aha: 'Every path has one highest node where it bends. At each node compute its gain, the best path going straight down from it (value + the better child gain, ignoring negative gains), and the best path bending there (value + both gains). Return the gain upwards; keep the best bend on the side.',
    asks: {
      read: 'Must the path go through the root? Can it be a single node?',
      budget: 'Up to 3 × 10⁴ nodes. One pass?',
      observe: 'In [-10, 9, 20, null, null, 15, 7], where does the best path bend?',
      brute: 'Summing the path between every pair of nodes: how many pairs?',
      pattern: 'Why can a node return only one side to its parent?',
      watch: 'Watch gains go up and bends get recorded.',
    },
    read: [
      { phrase: 'It does not have to pass through the root', says: 'Record the best bend at every node.' },
      { phrase: 'it must contain at least one node', says: 'With all negatives, the answer is the largest single value: start best at −∞.' },
      { phrase: 'no node appears more than once', says: 'A path bends once: up one side, down the other.' },
    ],
    budget: {
      from: 'nodes ≤ 3 × 10⁴',
      rows: [['every pair of nodes', 'n² · h', 'bad', 'too slow'], ['one postorder pass', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'Same shape as Diameter, with sums instead of heights.',
    },
    observe: [
      {
        title: 'Bend at 20',
        text: 'Tree [−10, 9, 20, null, null, 15, 7]: the path 15 → 20 → 7 bends at 20 and sums to 42. Extending it up to −10 would only lower it, so the best path doesn\'t touch the root.',
        sketch: { kind: 'array', rows: [{ items: [15, 20, 7, '= 42'], marks: { '3': 'hit' } }] },
      },
      {
        title: 'Drop negative branches',
        text: 'If the best downward branch from a child sums to less than 0, including it lowers the total: treat its gain as 0 (stop at this node instead).',
        sketch: { kind: 'array', rows: [{ items: ['gain −3', '→ use 0'], marks: { '0': 'bad' } }] },
      },
      {
        title: 'Return one side',
        text: 'The parent can only continue the path down one side of this node, so return value + the better gain, not both.',
        sketch: { kind: 'array', rows: [{ items: ['bend: v + l + r', 'return: v + max(l, r)'] }] },
      },
    ],
    brute: {
      idea: 'For every pair of nodes, find the path between them and sum it; keep the largest.',
      cost: 'O(n² · h)',
      waste: 'Paths overlap heavily; one pass computes each node\'s best downward branch once.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'gain(n) = n.val + max(0, gain(l), gain(r)); best = max(best, n.val + max(0, gain(l)) + max(0, gain(r))). O(n).',
      not: [
        { id: 'tree-dfs', why: 'It is a DFS; returning one value while recording another is the tree DP part.' },
        { id: 'dp-linear', why: 'Kadane on a line is the 1-D cousin.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: '[-10, 9, 20, null, null, 15, 7]', input: { mode: 'maxpath', tree: [-10, 9, 20, null, null, 15, 7] } },
        { label: '[1, 2, 3]', input: { mode: 'maxpath', tree: [1, 2, 3] } },
      ],
    },
    edges: ['One node: [-3] → −3.', '[1, 2, 3] → 6.', 'All negative: [-2, -1] → −1.'],
    not: { '1': [] },
  },

  'binary-tree-cameras': {
    aha: 'Work from the leaves up. A camera on a leaf wastes coverage; one on its parent covers the leaf, the parent, its other child and the grandparent. So each node reports one of three states: NEEDS cover, HAS a camera, or COVERED. A node with a child that needs cover must get a camera; a node with a camera child is covered; otherwise it asks its parent.',
    asks: {
      read: 'Which nodes does one camera watch?',
      budget: 'Up to 1000 nodes. Try every set of cameras?',
      observe: 'In [0, 0, null, 0, 0], why does one camera on the left child suffice?',
      brute: 'Trying every subset of nodes for cameras: how many?',
      pattern: 'Why is it never worse to put the camera on a leaf\'s parent?',
      watch: 'Watch states come up from the leaves.',
    },
    read: [
      { phrase: 'A camera watches its own node, its parent and its immediate children', says: 'Coverage reaches one step in each direction.' },
      {
        phrase: 'Placing cameras on the parents of leaves, from the bottom up, is the key idea',
        says: 'Decide bottom-up (postorder). Each node reports one of three states to its parent: it needs covering, it has a camera, or it is covered.',
      },
    ],
    budget: {
      from: 'nodes ≤ 1000',
      rows: [['every subset', '2¹⁰⁰⁰', 'bad', 'impossible'], ['three states bottom-up', 'n', 'ok', 'fits']],
      aim: 'O(n)',
      note: 'A DP with three values per node also works.',
    },
    observe: [
      {
        title: 'Leaves ask for help',
        text: 'A leaf with no camera reports NEEDS. Putting the camera on its parent instead is never worse: the parent\'s camera covers the leaf, the parent, its other child and its own parent.',
        sketch: { kind: 'array', rows: [{ items: ['leaf', '→ needs'], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Parents of needy children get cameras',
        text: 'In [0, 0, null, 0, 0] the left child has two leaf children: a camera there covers both leaves, itself and the root.',
        sketch: { kind: 'array', rows: [{ items: ['leaf', 'leaf', '→ camera', 'root covered'], marks: { '2': 'hit' } }] },
      },
      {
        title: 'The root may still need one',
        text: 'If the root reports NEEDS, nothing above can help: add a camera there.',
        sketch: { kind: 'array', rows: [{ items: ['root needs', '+1 camera'] }] },
      },
    ],
    brute: {
      idea: 'Try every subset of nodes as camera positions and keep the smallest one that covers everything.',
      cost: 'O(2ⁿ · n)',
      waste: 'Trying every subset is 2ⁿ; bottom-up, each node\'s state is decided once from its children\'s states.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'Postorder with states NEEDS / CAMERA / COVERED: needy child → camera; camera child → covered; else needs; root needs → +1. O(n).',
      not: [
        { id: 'greedy', why: 'Placing cameras top-down (at the root first) wastes coverage on the empty side above the root.' },
        { id: 'tree-bfs', why: 'Level-by-level placement can\'t see which leaves are already covered.' },
      ],
    },
    watch: {
      viz: 'TreeWalkViz',
      inputs: [
        { label: 'a chain of 5', input: { mode: 'cameras', tree: [0, 0, null, 0, null, 0, null, null, 0] } },
        { label: '[0, 0, null, 0, 0]', input: { mode: 'cameras', tree: [0, 0, null, 0, 0] } },
      ],
    },
    edges: ['One node: [0] → 1.', '[0, 0, null, 0, 0] → 1.', 'A chain of 5 → 2.'],
  },

  'burst-balloons': {
    aha: 'Choosing the first balloon to burst changes everyone\'s neighbours. Choose the LAST one in a range instead: when balloon k bursts last between walls l and r, its neighbours are exactly l and r, and the two sides were cleared independently. dp[l][r] = max over k of dp[l][k] + dp[k][r] + v[l]·v[k]·v[r], with 1s padded at both ends.',
    asks: {
      read: 'How do neighbours change as balloons burst?',
      budget: 'Up to 300 balloons. Table size?',
      observe: 'Why is "which balloon goes first" a hard question?',
      brute: 'Trying every bursting order: how many?',
      pattern: 'If k is the last balloon between two walls, what are its neighbours?',
      watch: 'Watch each range try every last balloon.',
    },
    read: [
      {
        phrase: 'where `left` and `right` are its current neighbours (after earlier balloons have burst)',
        says: 'Neighbours depend on order: think about the last burst.',
      },
      { phrase: 'A missing neighbour counts as 1', says: 'Pad the array with 1 at both ends.' },
    ],
    budget: {
      from: 'n ≤ 300',
      rows: [['every order', '300!', 'bad', 'impossible'], ['interval table', 'n³ = 2.7 × 10⁷', 'ok', 'fits']],
      aim: 'O(n³)',
      note: 'Same shape as triangulation.',
    },
    observe: [
      {
        title: 'First is messy',
        text: 'Bursting 1 first in [3, 1, 5, 8] changes the neighbours of 3 and 5, so the two sides aren\'t independent.',
        sketch: { kind: 'array', rows: [{ items: [3, 1, 5, 8], marks: { '1': 'bad' } }] },
      },
      {
        title: 'Last is clean',
        text: 'If 8 is the last balloon in the whole row, its neighbours at that moment are the two padded 1s: 1·8·1. Everything left of it was cleared on its own.',
        sketch: { kind: 'array', rows: [{ items: [1, '…', 8, 1], marks: { '2': 'hit' } }] },
      },
      {
        title: '167 for the example',
        text: 'For [3, 1, 5, 8], bursting 1, 5, 3, 8 gives 3·1·5 + 3·5·8 + 1·3·8 + 1·8·1 = 15 + 120 + 24 + 8 = 167, the maximum. Seen backwards: 8 last, 3 last on its left side, and so on.',
        sketch: { kind: 'array', rows: [{ items: [15, 120, 24, 8, '= 167'], marks: { '4': 'hit' } }] },
      },
    ],
    brute: {
      idea: 'Try every order of bursting and add up the coins.',
      cost: 'O(n!)',
      waste: 'Different orders that leave the same range share all their sub-results.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'Pad with 1s; dp[l][r] = max over l < k < r of dp[l][k] + dp[k][r] + v[l]·v[k]·v[r]. O(n³).',
      not: [{ id: 'greedy', why: 'Bursting the smallest balloon first fails on many inputs.' }, { id: 'backtracking', why: 'n! orders.' }],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [{ label: '[3, 1, 5, 8]', input: { mode: 'balloons', nums: [3, 1, 5, 8] } }, { label: '[1, 5]', input: { mode: 'balloons', nums: [1, 5] } }],
    },
    edges: ['One balloon: [7] → 7.', '[1, 5] → 10.', '[3, 1, 5, 8] → 167.'],
    not: { '0': [] },
  },

  'minimum-cost-to-cut-a-stick': {
    aha: 'Sort the cuts and add the two ends: positions c[0] = 0, …, c[m] = n. dp[i][j] = the cheapest way to make every cut strictly between c[i] and c[j]. The first cut there, at c[k], costs the whole piece (c[j] − c[i]) and splits it into two independent pieces. Try every k.',
    asks: {
      read: 'What does a cut cost, and can you reorder the cuts?',
      budget: '100 cuts on a stick up to 10⁶. Table over what?',
      observe: 'With n = 7 and cuts [1, 3, 4, 5], which order costs 16?',
      brute: 'Trying every order of cuts: how many?',
      pattern: 'After the first cut, what are the two subproblems?',
      watch: 'Watch each piece try every first cut.',
    },
    read: [
      { phrase: 'Each cut costs the length of the piece being cut at that moment', says: 'Big pieces cost more: order matters.' },
      { phrase: 'in any order you choose', says: 'Pick the best first cut for each piece.' },
    ],
    budget: {
      from: 'cuts ≤ 100, n ≤ 10⁶',
      rows: [['every order', '100!', 'bad', 'impossible'], ['table over cut positions', 'm³ = 10⁶', 'ok', 'fits']],
      aim: 'O(m³)',
      note: 'The table is over cuts, not stick positions.',
    },
    observe: [
      {
        title: 'Order matters',
        text: 'Cutting 1, 3, 4, 5 in that order costs 7 + 6 + 4 + 3 = 20. Cutting 3, 5, 1, 4 costs 7 + 4 + 3 + 2 = 16.',
        sketch: { kind: 'array', rows: [{ items: ['1,3,4,5: 20', '3,5,1,4: 16'], marks: { '1': 'hit' } }] },
      },
      {
        title: 'The first cut splits it',
        text: 'Cutting the stick 0..7 at 3 first costs 7 and leaves 0..3 (cut at 1) and 3..7 (cuts at 4, 5), solved separately.',
        sketch: { kind: 'array', rows: [{ items: ['0..3', '| 3 |', '3..7'] }] },
      },
      {
        title: 'Index the cuts, not the stick',
        text: 'Only the cut positions (plus both ends) matter, so the table is (m + 2)², however long the stick.',
        sketch: { kind: 'array', rows: [{ label: 'positions', items: [0, 1, 3, 4, 5, 7] }] },
      },
    ],
    brute: {
      idea: 'Try every order of the cuts and add up the piece lengths.',
      cost: 'O(m! · m)',
      waste: 'Orders that produce the same piece share its cost; the table solves each piece once.',
    },
    pattern: {
      pick: 'dp-trees-intervals',
      why: 'c = [0, sorted cuts, n]; dp[i][j] = (c[j] − c[i]) + min over i < k < j of dp[i][k] + dp[k][j]. O(m³).',
      not: [
        { id: 'greedy', why: 'Cutting the middle first, or the cheapest first, can be beaten.' },
        { id: 'divide-and-conquer', why: 'It splits in two, but which split is best must be tried and remembered.' },
      ],
    },
    watch: {
      viz: 'DpGridViz',
      inputs: [
        { label: 'n = 7, [1, 3, 4, 5]', input: { mode: 'cuts', n: 7, cuts: [1, 3, 4, 5] } },
        { label: 'n = 9, [5, 6, 1, 4, 2]', input: { mode: 'cuts', n: 9, cuts: [5, 6, 1, 4, 2] } },
      ],
    },
    edges: ['One cut: n = 5, [2] → 5.', 'n = 7, [1, 3, 4, 5] → 16.', 'n = 9, [5, 6, 1, 4, 2] → 22.'],
  },
};
