import { Crown } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import styles from './BacktrackViz.module.css';
import { BACKTRACK, QUEENS, backtrack, backtrackCode, parseBacktrack, parseQueens, queens, queensCode, randomBacktrack } from './models/backtracking';

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

function TreeStage({ step: f, width }) {
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
      <Chips label="path" chips={(f.cur === null ? [] : f.nodes[f.cur].path).map((v, k) => ({ key: k, text: String(v), tone: 'accent' }))} empty="[ ]" />
      <Chips label="found" chips={f.found.map((p, k) => ({ key: k, text: list(p), tone: 'success', isNew: k === f.found.length - 1 && f.kind === 'record' }))} empty="none yet" />
    </div>
  );
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
