import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { TreeGraph } from './TreesViz';
import styles from './DpViz.module.css';
import { buildTree, showTree } from './models/trees';
import {
  DP1D, DP2D, FIB, ROBBER_TREE, dp1d, dp1dCode, dp2d, dp2dCode, dp2dValues, fib, fibCode, parseDp1d, parseDp2d, randomDp1d, randomDp2d,
  robberTree, robberTreeCode,
} from './models/dp';

/**
 * Step-throughs for the Dynamic Programming module:
 *   <FibTreeViz />      the recursion tree of fib(n): repeated calls in plain recursion, memo hits that cut branches
 *   <Dp1dViz />         one-row tables (stairs, house robber, Kadane, LIS, coin change) with arrows from the cells used
 *   <DpGridViz />       two-dimensional tables (grid paths, knapsack, coin change II, LCS, edit distance, burst
 *                       balloons, stock with cooldown) with arrows from the cells each answer comes from
 *   <RobberTreeViz />   House Robber III: every node returns [take, skip]
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- the recursion tree

function fibLayout(nodes, W) {
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
  nodes.forEach((n) => { pos[n.id].y = 22 + n.depth * 54; });
  return { pos, height: 22 + Math.max(...nodes.map((n) => n.depth)) * 54 + 34, slot };
}

function FibStage({ step: f, width }) {
  const W = Math.max(300, Math.min(width, 640));
  const { pos, height, slot } = fibLayout(f.nodes, W);
  const shown = new Set(f.shown);
  const active = new Set(f.active);
  const firstOf = {};
  f.nodes.forEach((n) => { if (firstOf[n.n] === undefined) firstOf[n.n] = n.id; });
  const isRepeat = (n) => f.mode === 'plain' && n.n > 1 && firstOf[n.n] !== n.id;
  const isHit = (n) => f.mode === 'memo' && n.n > 1 && firstOf[n.n] !== n.id;
  const tiny = slot < 44;
  return (
    <div className={styles.wrap}>
      <div className={styles.tree} style={{ width: W, height }}>
        <svg className={styles.svg} width={W} height={height} aria-hidden="true">
          {f.nodes.filter((n) => n.parent !== null && shown.has(n.id)).map((n) => (
            <line key={n.id} x1={pos[n.parent].x} y1={pos[n.parent].y} x2={pos[n.id].x} y2={pos[n.id].y} className={active.has(n.id) || n.id === f.cur ? styles.edgeOn : styles.edge} />
          ))}
        </svg>
        {f.nodes.filter((n) => shown.has(n.id)).map((n) => (
          <div
            key={n.id}
            className={[styles.call, tiny && styles.tiny, active.has(n.id) && styles.active, f.done[n.id] !== undefined && styles.returned, isRepeat(n) && styles.repeat, isHit(n) && styles.hit, n.id === f.cur && styles.cur].filter(Boolean).join(' ')}
            style={{ left: pos[n.id].x, top: pos[n.id].y }}
          >
            {tiny ? n.n : `f(${n.n})`}
            {f.done[n.id] !== undefined && <i className={styles.ret}>{f.done[n.id]}</i>}
          </div>
        ))}
      </div>
      {f.mode === 'memo' && (
        <Chips label="memo" chips={Array.from({ length: f.n + 1 }, (_, k) => k).filter((k) => f.memo[k] !== undefined).map((k) => ({ key: k, text: `memo[${k}] = ${f.memo[k]}`, tone: 'success' }))} empty="empty" />
      )}
    </div>
  );
}

const fibSpec = {
  title: 'Recursion tree: why plain recursion is slow',
  examples: FIB,
  simulate: fib,
  code: (input) => fibCode(input.mode),
  kinds: { start: ['Start', 'neutral'], call: ['Call', 'accent'], again: ['Again!', 'warn'], base: ['Base case', 'note'], hit: ['Memo hit', 'success'], return: ['Return', 'success'], done: ['Count', 'success'] },
  describe: (input) => `fib(${input.n})`,
  rule: (input) => (input.mode === 'plain' ? 'Every call makes two more; nothing is remembered.' : 'Solve each n once; later calls read the memo.'),
  stats: (f) => [['calls', f.calls]],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">f(4)</Key>, 'waiting for its children'],
    [<Key shape="box" tone="success">2</Key>, 'returned value'],
    ...(input.mode === 'plain' ? [[<Key shape="box" tone="warn">f(3)</Key>, 'computed again']] : [[<Key shape="box" tone="success">f(3)</Key>, 'answered from the memo']]),
  ],
  fields: () => [{ name: 'n', label: 'n (2 to 6)', placeholder: '5', short: true }],
  values: (input) => ({ n: String(input.n) }),
  parse: (values, input) => { const v = Number(values.n); return Number.isInteger(v) && v >= 2 && v <= 6 ? { input: { mode: input.mode, n: v } } : { error: 'n must be a whole number from 2 to 6 (the tree doubles with each step).' }; },
  random: (input) => ({ mode: input.mode, n: 3 + Math.floor(Math.random() * 3) }),
  hint: () => 'Try 6 with plain recursion to see the tree explode, then with the memo.',
  delay: () => 1700,
  Stage: FibStage,
};

export function FibTreeViz(props) {
  return <StepViz spec={fibSpec} {...props} />;
}

// ---------------------------------------------------------------- tables with dependency arrows

const TONE = { success: 'var(--color-success)', muted: 'var(--color-text-subtle)', accent: 'var(--color-accent)', note: 'var(--color-note)' };

function DpTable({ f, width, inputRows = [] }) {
  const R = f.rows.length, C = f.cols.length;
  const headW = Math.min(96, 16 + Math.max(...f.rows.map((r) => String(r).length)) * 7.5);
  const avail = Math.max(260, Math.min(width, 680)) - headW - 4;
  const cw = Math.max(32, Math.min(58, Math.floor(avail / C)));
  const ch = f.given ? 46 : 40;
  const W = headW + C * cw, H = 26 + R * ch;
  const cx = (c) => headW + c * cw + cw / 2;
  const cy = (r) => 26 + r * ch + ch / 2;
  const path = new Set((f.path ?? []).map(([r, c]) => `${r},${c}`));
  const deps = new Map((f.deps ?? []).map((d) => [`${d.r},${d.c}`, d]));
  const isCur = (r, c) => (f.col !== undefined ? c === f.col : f.cur && f.cur[0] === r && f.cur[1] === c);
  const fmt = (v) => (v === Infinity ? '∞' : v === null || v === undefined ? '' : v);
  return (
    <div className={styles.table} style={{ width: W, height: H }}>
      {f.cols.map((c, k) => <span key={`c${k}`} className={styles.colHead} style={{ left: headW + k * cw, width: cw }}>{c}</span>)}
      {f.rows.map((r, k) => <span key={`r${k}`} className={styles.rowHead} style={{ top: 26 + k * ch, height: ch, width: headW - 6 }}>{r}</span>)}
      {f.cells.map((row, r) => row.map((v, c) => {
        if (v === '') return <span key={`${r},${c}`} className={styles.void} style={{ left: headW + c * cw, top: 26 + r * ch, width: cw - 3, height: ch - 3 }} />;
        const d = deps.get(`${r},${c}`);
        return (
          <span
            key={`${r},${c}`}
            className={[
              styles.cell,
              inputRows.includes(r) && styles.input,
              f.blocked?.[r]?.[c] && styles.blocked,
              v === null && styles.empty,
              d && styles[`dep_${d.tone}`],
              path.has(`${r},${c}`) && styles.path,
              isCur(r, c) && styles.cur,
            ].filter(Boolean).join(' ')}
            style={{ left: headW + c * cw, top: 26 + r * ch, width: cw - 3, height: ch - 3 }}
          >
            {f.given && <small className={styles.given}>{f.given[r][c]}</small>}
            <b key={isCur(r, c) ? `cur${fmt(v)}` : 'v'} className={isCur(r, c) && v !== null ? styles.pop : undefined}>{fmt(v)}</b>
          </span>
        );
      }))}
      <svg className={styles.svg} width={W} height={H} aria-hidden="true">
        <defs>
          {Object.keys(TONE).map((t) => (
            <marker key={t} id={`dp-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: TONE[t] }} />
            </marker>
          ))}
        </defs>
        {f.cur && f.col === undefined && (f.deps ?? []).map((d, k) => {
          const x1 = cx(d.c), y1 = cy(d.r), x2 = cx(f.cur[1]), y2 = cy(f.cur[0]);
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
          const sx = x1 + (dx / len) * 12, sy = y1 + (dy / len) * 12, ex = x2 - (dx / len) * 14, ey = y2 - (dy / len) * 14;
          const bend = Math.abs(dy) < 2 ? -Math.min(30, 8 + len / 6) : 0;
          const mx = (sx + ex) / 2 + (Math.abs(dy) < 2 ? 0 : -dy / len * 6), my = (sy + ey) / 2 + bend;
          return (
            <g key={k} className={styles.arrow} style={{ '--tone': TONE[d.tone] ?? TONE.accent }}>
              <path d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`} markerEnd={`url(#dp-${d.tone in TONE ? d.tone : 'accent'})`} />
              {d.label && cw >= 46 && <text x={mx} y={my - 3} textAnchor="middle">{d.label}</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function Dp1dStage({ step: f, width }) {
  return <div className={styles.wrap}><DpTable f={f} width={width} inputRows={f.mode === 'coins' ? [] : [0]} /></div>;
}

const dp1dSpec = {
  title: 'Filling a DP row',
  examples: DP1D,
  simulate: dp1d,
  code: (input) => dp1dCode(input.mode),
  kinds: { start: ['Start', 'neutral'], base: ['Base case', 'note'], fill: ['Fill', 'accent'], restart: ['Start over', 'warn'], done: ['Answer', 'success'] },
  describe: (input) => (input.mode === 'coins' ? `coins ${list(input.a)}, amount ${input.amount}` : `${input.mode === 'stairs' ? 'cost' : 'a'} = ${list(input.a)}`),
  rule: (input) => ({
    stairs: 'dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2])',
    robber: 'best[i] = max(skip: best[i−1], take: best[i−2] + a[i])',
    kadane: 'ending here = max(a[i], ending here + a[i])',
    lis: 'dp[i] = 1 + the longest dp[j] with j < i and a[j] < a[i]',
    coins: 'dp[x] = min over coins of dp[x − coin] + 1',
  })[input.mode],
  stats: () => [],
  legend: () => [
    [<Key shape="box" tone="warn">7</Key>, 'being filled'],
    [<Key shape="box" tone="success">→</Key>, 'the choice that won'],
    [<Key shape="box">→</Key>, 'considered, lost'],
  ],
  fields: (input) => (input.mode === 'coins'
    ? [{ name: 'a', label: 'coins', placeholder: 'e.g. 1, 3, 4' }, { name: 'amount', label: 'amount (≤ 12)', placeholder: '6', short: true }]
    : [{ name: 'a', label: input.mode === 'stairs' ? 'cost' : 'a', placeholder: input.mode === 'kadane' ? 'e.g. -2, 1, -3, 4' : 'e.g. 2, 7, 9, 3, 1' }]),
  values: (input) => (input.mode === 'coins' ? { a: input.a.join(', '), amount: String(input.amount) } : { a: input.a.join(', ') }),
  parse: parseDp1d,
  random: (input) => randomDp1d(input),
  hint: () => 'Up to 9 numbers.',
  delay: () => 2400,
  Stage: Dp1dStage,
};

export function Dp1dViz(props) {
  return <StepViz spec={dp1dSpec} {...props} />;
}

function Dp2dStage({ step: f, width }) {
  return <div className={styles.wrap}><DpTable f={f} width={width} /></div>;
}

const DP2D_FIELDS = {
  paths: [{ name: 'R', label: 'rows', placeholder: '4', short: true }, { name: 'C', label: 'columns', placeholder: '5', short: true }],
  obstacles: [{ name: 'grid', label: 'grid (1 = obstacle), rows separated by ;', placeholder: 'e.g. 000; 010; 000' }],
  minsum: [{ name: 'grid', label: 'costs, rows separated by ;', placeholder: 'e.g. 1 3 1; 1 5 1; 4 2 1' }],
  square: [{ name: 'grid', label: 'matrix of 0/1, rows separated by ;', placeholder: 'e.g. 10100; 10111; 11111' }],
  knapsack: [{ name: 'wt', label: 'weights', placeholder: '1, 3, 4' }, { name: 'val', label: 'values', placeholder: '15, 20, 30' }, { name: 'cap', label: 'capacity', placeholder: '4', short: true }],
  ways: [{ name: 'coins', label: 'coins', placeholder: '1, 2, 5' }, { name: 'amount', label: 'amount (≤ 8)', placeholder: '5', short: true }],
  lcs: [{ name: 'a', label: 'a', placeholder: 'abcde', short: true }, { name: 'b', label: 'b', placeholder: 'ace', short: true }],
  edit: [{ name: 'a', label: 'from', placeholder: 'horse', short: true }, { name: 'b', label: 'to', placeholder: 'ros', short: true }],
  balloons: [{ name: 'nums', label: 'balloons (up to 5)', placeholder: '3, 1, 5, 8' }],
  stock: [{ name: 'prices', label: 'prices', placeholder: '1, 2, 3, 0, 2' }],
};

const dp2dSpec = {
  title: 'Filling a DP table',
  examples: DP2D,
  simulate: dp2d,
  code: (input) => dp2dCode(input.mode),
  kinds: { start: ['Start', 'neutral'], base: ['Base case', 'note'], fill: ['Fill', 'accent'], match: ['Match', 'success'], block: ['Blocked', 'danger'], take: ['Take', 'success'], skip: ['Skip', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => ({
    paths: () => `${input.R} × ${input.C} grid`,
    obstacles: () => `${input.grid.length} × ${input.grid[0].length} grid`,
    minsum: () => `${input.grid.length} × ${input.grid[0].length} costs`,
    square: () => `${input.grid.length} × ${input.grid[0].length} matrix`,
    knapsack: () => `weights ${list(input.wt)}, values ${list(input.val)}, capacity ${input.cap}`,
    ways: () => `coins ${list(input.coins)}, amount ${input.amount}`,
    lcs: () => `"${input.a}" and "${input.b}"`,
    edit: () => `"${input.a}" → "${input.b}"`,
    balloons: () => `balloons ${list(input.nums)}`,
    stock: () => `prices ${list(input.prices)}`,
  })[input.mode](),
  rule: (input) => ({
    paths: 'ways = from above + from the left',
    obstacles: 'blocked → 0; otherwise above + left',
    minsum: 'cost = min(above, left) + this cell',
    square: 'side = 1 + min(top, left, top-left)',
    knapsack: 'max(skip: row above, take: row above at c − w, + value)',
    ways: 'without this coin (above) + with one more of it (left by its value)',
    lcs: 'match: diagonal + 1; otherwise max(up, left)',
    edit: 'match: diagonal; otherwise 1 + min(replace, delete, insert)',
    balloons: 'best k to burst last between l and r',
    stock: 'each state from yesterday\'s states',
  })[input.mode],
  stats: () => [],
  legend: (f) => [
    [<Key shape="box" tone="warn">3</Key>, 'being filled'],
    [<Key shape="box" tone="success">→</Key>, 'used / the winning choice'],
    [<Key shape="box">→</Key>, 'considered, lost'],
    ...(f.given ? [[<Key shape="box"><small>5</small></Key>, 'small number: the input in that cell']] : []),
  ],
  fields: (input) => DP2D_FIELDS[input.mode],
  values: dp2dValues,
  parse: parseDp2d,
  random: (input) => randomDp2d(input),
  hint: () => 'Small inputs keep the table readable.',
  delay: () => 2000,
  Stage: Dp2dStage,
};

export function DpGridViz(props) {
  return <StepViz spec={dp2dSpec} {...props} />;
}

// ---------------------------------------------------------------- house robber III

function RobberStage({ step: f, width }) {
  const t = buildTree(f.tree);
  return (
    <div className={styles.wrap}>
      <TreeGraph
        t={t} width={width} label={`tree ${showTree(f.tree)}`}
        cls={(id) => [f.pairs[id] && 'done', id === f.cur && (f.kind === 'done' ? 'hit' : 'cur')]}
        badge={(id) => (f.pairs[id] ? { text: `${f.pairs[id][0]} | ${f.pairs[id][1]}`, tone: id === f.cur ? 'success' : 'muted' } : null)}
        edge={(a, b) => (f.pairs[b] ? 'seen' : 'plain')}
      />
      <p className={styles.caption}>badge = take | skip for that subtree</p>
    </div>
  );
}

const robberSpec = {
  title: 'Tree DP: House Robber III',
  examples: ROBBER_TREE,
  simulate: robberTree,
  code: () => robberTreeCode,
  kinds: { start: ['Start', 'neutral'], node: ['Combine', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => `tree = [${showTree(input.tree)}]`,
  rule: () => 'take = me + children\'s skip; skip = sum of each child\'s best',
  stats: () => [],
  legend: () => [[<Key shape="box" tone="success">7 | 3</Key>, 'take | skip']],
  fields: () => [{ name: 'tree', label: 'tree (level order)', placeholder: 'e.g. 3, 4, 5, 1, 3, null, 1' }],
  values: (input) => ({ tree: showTree(input.tree) }),
  parse: (values) => {
    const parts = String(values.tree ?? '').split(/[\s,]+/).filter(Boolean);
    const arr = parts.map((p) => (/^(null|n|#|-)$/i.test(p) ? null : Number(p)));
    if (!arr.length || arr[0] === null || arr.some((v) => v !== null && (!Number.isInteger(v) || v < 0 || v > 99))) return { error: 'Level order with values 0 to 99 and null for gaps.' };
    const t = buildTree(arr);
    if (Object.keys(t.nodes).length > 12) return { error: 'Use at most 12 houses.' };
    return { input: { tree: arr } };
  },
  random: () => ({ tree: Array.from({ length: 7 }, (_, k) => (k > 2 && Math.random() < 0.3 ? null : 1 + Math.floor(Math.random() * 9))) }),
  hint: () => 'Up to 12 houses, values 0 to 99.',
  delay: () => 2400,
  Stage: RobberStage,
};

export function RobberTreeViz(props) {
  return <StepViz spec={robberSpec} {...props} />;
}
