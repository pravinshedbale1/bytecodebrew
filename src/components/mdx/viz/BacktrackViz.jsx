import { Crown } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import styles from './BacktrackViz.module.css';
import { BACKTRACK, QUEENS, backtrack, backtrackCode, parseBacktrack, parseQueens, queens, queensCode, randomBacktrack } from './models/backtracking';
import { BT_WALK, btWalk, btWalkCode, parseBtWalk, randomBtWalk } from './models/btWalk';
import { GridCells } from './GraphsViz';

/**
 * Step-throughs for the Backtracking lesson:
 *   <BacktrackViz />   the decision tree grows as you choose, explore and un-choose (subsets, permutations, combination sum)
 *   <QueensViz />      N-Queens on a board: safe squares, dead ends and lifted queens
 */

const list = (a) => `[${a.join(', ')}]`;

/** Fixed places for every node of the finished tree: leaves left to right, parents over their children. */
function treeLayout(nodes, W) {
  const kids = nodes.map(() => []);
  nodes.forEach((n) => { if (n.parent !== null) kids[n.parent].push(n.id); });
  const leaves = [];
  const walk = (id) => { if (!kids[id].length) leaves.push(id); kids[id].forEach(walk); };
  walk(0);
  const slot = W / leaves.length;
  const pos = [];
  leaves.forEach((id, k) => { pos[id] = { x: (k + 0.5) * slot }; });
  const place = (id) => { if (pos[id]) return pos[id]; kids[id].forEach(place); pos[id] = { x: (place(kids[id][0]).x + place(kids[id].at(-1)).x) / 2 }; return pos[id]; };
  place(0);
  nodes.forEach((n) => { pos[n.id].y = 24 + n.depth * 56; });
  return { pos, height: 24 + Math.max(...nodes.map((n) => n.depth)) * 56 + 34, slot };
}

function DecisionTree({ f, width }) {
  const W = Math.max(300, Math.min(width, 640));
  const { pos, height, slot } = treeLayout(f.nodes, W);
  const shown = new Set(f.shown);
  const recorded = new Set(f.recorded);
  const onPath = new Set();
  for (let id = f.cur; id !== null && id !== undefined; id = f.nodes[id].parent) onPath.add(id);
  const backFrom = new Set(f.backFrom ?? []);
  const small = slot < 46;
  return (
    <div className={styles.wrap}>
      <div className={styles.tree} style={{ width: W, height }}>
        <svg className={styles.svg} width={W} height={height} aria-hidden="true">
          {f.nodes.filter((n) => n.parent !== null && shown.has(n.id)).map((n) => (
            <line
              key={n.id} x1={pos[n.parent].x} y1={pos[n.parent].y} x2={pos[n.id].x} y2={pos[n.id].y}
              className={n.kind === 'pruned' ? styles.edgeCut : onPath.has(n.id) ? styles.edgeOn : backFrom.has(n.id) ? styles.edgeBack : styles.edge}
            />
          ))}
        </svg>
        {f.nodes.filter((n) => shown.has(n.id)).map((n) => (
          <div
            key={n.id}
            className={[
              styles.node, small && styles.small,
              n.kind === 'pruned' && styles.pruned,
              recorded.has(n.id) && styles.recorded,
              onPath.has(n.id) && styles.onPath,
              n.id === f.cur && styles.cur,
              (n.id === f.cur || n.id === f.pruned) && styles.pop,
            ].filter(Boolean).join(' ')}
            style={{ left: pos[n.id].x, top: pos[n.id].y }}
            title={list(n.path)}
          >
            {n.kind === 'pruned' ? `${n.label}✗` : n.label}
            {recorded.has(n.id) && <i className={styles.tick}>✓</i>}
          </div>
        ))}
      </div>
    </div>
  );
}

function TreeStage({ step: f, width }) {
  return (
    <div className={styles.wrap}>
      <DecisionTree f={f} width={width} />
      <Chips label="path" chips={(f.cur === null ? [] : f.nodes[f.cur].path).map((v, k) => ({ key: k, text: String(v), tone: 'accent' }))} empty="[ ]" />
      <Chips label="found" chips={f.found.map((p, k) => ({ key: k, text: list(p), tone: 'success', isNew: k === f.found.length - 1 && f.kind === 'record' }))} empty="none yet" />
    </div>
  );
}

// ---------------------------------------------------------------- the backtracking problems (same tree, plus grids)

function BtWalkStage({ step: f, width, seq }) {
  return (
    <div className={styles.wrap}>
      {f.grid
        ? <GridCells grid={f.grid} width={Math.min(width, 360)} cell={(r, c) => ({ cls: f.grid[r][c].c.filter(Boolean), label: f.grid[r][c].l, badge: f.grid[r][c].b, pop: f.grid[r][c].c.includes('cellCur'), key: f.grid[r][c].c.includes('cellCur') ? `c${seq}` : 'v' })} />
        : (
          <>
            <DecisionTree f={f} width={width} />
            <Chips label="path" chips={(f.cur === null ? [] : f.nodes[f.cur].path).map((v, k) => ({ key: k, text: String(v), tone: 'accent' }))} empty="[ ]" />
            <Chips label="found" chips={f.found.map((p, k) => ({ key: k, text: p, tone: 'success', isNew: k === f.found.length - 1 && f.kind === 'record' }))} empty="none yet" />
          </>
        )}
      {f.rows?.map((row, k) => <Chips key={k} label={row.label} seq={seq} chips={row.chips.map((c, i) => ({ key: `${i}`, ...c }))} empty="—" />)}
    </div>
  );
}

const BT_FIELDS = {
  xor: [{ name: 'nums', label: 'nums (up to 4)', placeholder: 'e.g. 5, 1, 6' }],
  subsets2: [{ name: 'nums', label: 'nums (repeats allowed, up to 4)', placeholder: 'e.g. 1, 2, 2' }],
  perms2: [{ name: 'nums', label: 'nums (repeats allowed, up to 4)', placeholder: 'e.g. 1, 1, 2' }],
  combsum2: [{ name: 'nums', label: 'candidates (up to 5)', placeholder: 'e.g. 1, 2, 2, 5' }, { name: 'target', label: 'target', placeholder: '5', short: true }],
  matchsticks: [{ name: 'nums', label: 'sticks (up to 6)', placeholder: 'e.g. 1, 1, 2, 2, 2' }],
  combos: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  letters: [{ name: 'digits', label: 'digits (up to 2)', placeholder: '23', short: true }],
  parens: [{ name: 'n', label: 'n (1 to 3)', placeholder: '3', short: true }],
  palin: [{ name: 's', label: 's (up to 5 letters)', placeholder: 'aabb', short: true }],
  wordbreak: [{ name: 's', label: 's', placeholder: 'catsanddog' }, { name: 'words', label: 'wordDict', placeholder: 'e.g. cat, cats, and, sand, dog' }],
  wordsearch: [{ name: 'board', label: 'board rows', placeholder: 'e.g. ABCE; SFCS; ADEE' }, { name: 'word', label: 'word', placeholder: 'ABCCED', short: true }],
  sudoku: [{ name: 'board', label: '4 rows of 4 (. = empty)', placeholder: 'e.g. 1...; ..3.; .4..; ...2' }],
};
const BT_VALUES = {
  xor: (i) => ({ nums: i.nums.join(', ') }), subsets2: (i) => ({ nums: i.nums.join(', ') }), perms2: (i) => ({ nums: i.nums.join(', ') }),
  combsum2: (i) => ({ nums: i.nums.join(', '), target: String(i.target) }), matchsticks: (i) => ({ nums: i.sticks.join(', ') }),
  combos: (i) => ({ n: String(i.n), k: String(i.k) }), letters: (i) => ({ digits: i.digits }), parens: (i) => ({ n: String(i.n) }), palin: (i) => ({ s: i.s }),
  wordbreak: (i) => ({ s: i.s, words: i.words.join(', ') }), wordsearch: (i) => ({ board: i.board.join('; '), word: i.word }),
  sudoku: (i) => ({ board: i.board.map((r) => r.map((v) => (v ? String(v) : '.')).join('')).join('; ') }),
};
const BT_RULE = {
  xor: 'Every node is a subset; add up their XORs.', combos: 'Add only bigger numbers; stop when too few are left.', combsum2: 'Skip a value equal to the one before it at the same level.',
  subsets2: 'Skip a repeated value at the same level; deeper is fine.', perms2: 'A copy may be placed only after its twin.', letters: 'One level per digit, one branch per letter.',
  parens: '"(" while some are left; ")" only while something is open.', palin: 'Cut a palindrome off the front; recurse on the rest.', wordbreak: 'Take a dictionary word off the front; recurse on the rest.',
  matchsticks: 'Longest first; skip overflowing sides and sides equal to one already tried.', wordsearch: 'Extend to a matching unused neighbour; un-choose on a dead end.', sudoku: 'Next empty cell, a digit that fits, recurse; undo on a dead end.',
};

const btWalkSpec = {
  title: 'Backtracking problems, step by step',
  examples: BT_WALK,
  simulate: btWalk,
  code: (input) => btWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], choose: ['Choose', 'accent'], record: ['Record', 'success'], back: ['Un-choose', 'note'], prune: ['Prune', 'danger'], dup: ['Skip twin', 'warn'], dead: ['Dead end', 'danger'], match: ['Match', 'accent'], found: ['Found', 'success'], place: ['Place', 'accent'], undo: ['Undo', 'note'], done: ['Done', 'success'] },
  describe: (input) => ({ combos: `n = ${input.n}, k = ${input.k}`, letters: `"${input.digits}"`, parens: `n = ${input.n}`, palin: `"${input.s}"`, wordbreak: `"${input.s}"`, wordsearch: `"${input.word}"`, sudoku: '4 × 4', matchsticks: list(input.sticks ?? []), combsum2: `${list(input.nums ?? [])}, target ${input.target}` })[input.mode] ?? list(input.nums ?? []),
  rule: (input) => BT_RULE[input.mode],
  stats: (f) => (f.found ? [['found', f.found.length]] : []),
  legend: (f, input) => (input.mode === 'wordsearch' || input.mode === 'sudoku'
    ? [[<Key shape="box" tone="accent">A</Key>, input.mode === 'sudoku' ? 'placed' : 'on the path (badge = letter number)'], [<Key shape="box" tone="danger">E</Key>, input.mode === 'sudoku' ? 'undone' : 'dead end']]
    : [[<Key shape="box" tone="accent">2</Key>, 'on the current path'], [<Key shape="box" tone="success">3 ✓</Key>, 'recorded'], [<Key shape="box" tone="danger">6✗</Key>, 'cut or skipped']]),
  fields: (input) => BT_FIELDS[input.mode],
  values: (input) => BT_VALUES[input.mode](input),
  parse: parseBtWalk,
  random: (input) => randomBtWalk(input),
  hint: () => 'Inputs are kept small so the whole tree fits.',
  delay: () => 2000,
  Stage: BtWalkStage,
};

export function BtWalkViz(props) {
  return <StepViz spec={btWalkSpec} {...props} />;
}

const backtrackSpec = {
  title: 'Backtracking: choose, explore, un-choose',
  examples: BACKTRACK,
  simulate: backtrack,
  code: (input) => backtrackCode(input.mode),
  kinds: { start: ['Start', 'neutral'], choose: ['Choose', 'accent'], record: ['Record', 'success'], back: ['Un-choose', 'note'], prune: ['Prune', 'danger'], done: ['Done', 'success'] },
  describe: (input) => (input.mode === 'combsum' ? `candidates ${list(input.nums)}, target ${input.target}` : `nums = ${list(input.nums)}`),
  rule: (input) => ({ subsets: 'Each level adds a later element; every node is an answer.', perms: 'Each level adds any unused element; leaves are answers.', combsum: 'Reuse allowed; stop the loop once a number is too big.' })[input.mode],
  stats: (f) => [['found', f.found.length], ['depth', f.cur === null ? 0 : f.nodes[f.cur].depth]],
  legend: () => [
    [<Key shape="box" tone="accent">2</Key>, 'on the current path'],
    [<Key shape="box" tone="success">3 ✓</Key>, 'recorded'],
    [<Key shape="box" tone="danger">6✗</Key>, 'pruned'],
  ],
  fields: (input) => [
    { name: 'nums', label: input.mode === 'combsum' ? 'candidates (distinct)' : 'nums (up to 3, distinct)', placeholder: input.mode === 'combsum' ? 'e.g. 2, 3, 6, 7' : 'e.g. 1, 2, 3' },
    ...(input.mode === 'combsum' ? [{ name: 'target', label: 'target', placeholder: '7', short: true }] : []),
  ],
  values: (input) => ({ nums: input.nums.join(', '), ...(input.mode === 'combsum' ? { target: String(input.target) } : {}) }),
  parse: parseBacktrack,
  random: (input) => randomBacktrack(input),
  hint: (input) => (input.mode === 'combsum' ? 'Up to 4 distinct candidates and a target up to 12 (small enough to draw the tree).' : 'Up to 3 distinct numbers, so the whole tree fits.'),
  delay: () => 2000,
  Stage: TreeStage,
};

export function BacktrackViz(props) {
  return <StepViz spec={backtrackSpec} {...props} />;
}

// ---------------------------------------------------------------- N-Queens

function QueensStage({ step: f, width }) {
  const { n } = f;
  const size = Math.max(36, Math.min(56, Math.floor((Math.min(width, 420) - 10) / n)));
  const queenAt = (r, c) => f.colOf[r] === c;
  const attacked = (r, c) => f.colOf.some((cc, rr) => !(rr === r && cc === c) && (cc === c || rr - cc === r - c || rr + cc === r + c));
  const lifted = new Set((f.lifted ?? []).map(([r, c]) => `${r},${c}`));
  return (
    <div className={styles.wrap}>
      <div className={styles.board} style={{ gridTemplateColumns: `repeat(${n}, ${size}px)`, gridAutoRows: `${size}px` }}>
        {Array.from({ length: n * n }, (_, k) => {
          const r = Math.floor(k / n), c = k % n;
          const q = queenAt(r, c);
          const isNew = f.at && f.at[0] === r && f.at[1] === c;
          return (
            <div
              key={k}
              className={[
                styles.square, (r + c) % 2 ? styles.dark : styles.light,
                !q && attacked(r, c) && styles.attacked,
                f.row === r && f.kind !== 'solution' && f.kind !== 'done' && styles.rowNow,
                f.kind === 'dead' && f.row === r && styles.rowDead,
                f.kind === 'solution' && q && styles.win,
              ].filter(Boolean).join(' ')}
            >
              {q && <Crown key={isNew ? 'new' : 'q'} size={size * 0.5} className={`${styles.queen} ${isNew ? styles.pop : ''}`} aria-label="queen" />}
              {lifted.has(`${r},${c}`) && <Crown size={size * 0.5} className={styles.ghost} aria-hidden="true" />}
            </div>
          );
        })}
      </div>
      <p className={styles.caption}>shaded squares are attacked by the queens on the board</p>
      <Chips label="solutions" chips={f.sols.map((s, k) => ({ key: k, text: list(s), tone: 'success', isNew: f.kind === 'solution' && k === f.sols.length - 1 }))} empty="none yet" />
    </div>
  );
}

const queensSpec = {
  title: 'N-Queens: place, check, backtrack',
  examples: QUEENS,
  simulate: queens,
  code: () => queensCode,
  kinds: { start: ['Start', 'neutral'], place: ['Place', 'accent'], dead: ['Dead end', 'danger'], lift: ['Lift', 'note'], solution: ['Solution', 'success'], done: ['Done', 'success'] },
  describe: (input) => `n = ${input.n}`,
  rule: () => 'One queen per row; skip attacked columns; no safe column → lift the last queen.',
  stats: (f) => [['queens', f.colOf.length], ['solutions', f.sols.length]],
  legend: () => [[<Key shape="box" tone="danger"> </Key>, 'attacked'], [<Key shape="box" tone="accent"> </Key>, 'row being filled']],
  fields: () => [{ name: 'n', label: 'n (4 to 6)', placeholder: '4', short: true }],
  values: (input) => ({ n: String(input.n) }),
  parse: parseQueens,
  random: () => ({ n: 4 + Math.floor(Math.random() * 3), first: true }),
  hint: () => 'n = 4 shows both solutions; 5 and 6 stop at the first one.',
  delay: () => 1800,
  Stage: QueensStage,
};

export function QueensViz(props) {
  return <StepViz spec={queensSpec} {...props} />;
}
