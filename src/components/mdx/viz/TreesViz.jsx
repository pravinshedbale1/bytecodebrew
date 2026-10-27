import { StepViz, Key } from './StepViz';
import { Chips, Float } from './prims';
import styles from './TreesViz.module.css';
import {
  BST, TREE_BFS, TREE_DFS, bst, bstCode, buildTree, inorder, parseBst, parseTreeBfs, parseTreeDfs, randomBst, randomTreeBfs, randomTreeDfs,
  showTree, treeBfs, treeBfsCode, treeDfs, treeDfsCode,
} from './models/trees';

/**
 * Step-throughs for the Tree DFS, Tree BFS and Binary Search Tree lessons:
 *   <TreeDfsViz />   calls go down, answers come back up as badges; context passed down shows under nodes
 *   <TreeBfsViz />   the queue, frozen level sizes, and what each level writes
 *   <BstViz />       search, insert, validate with ranges, k-th smallest with a stack, LCA by splitting
 */

const NODE = 34;
const LEVEL_H = 64;

/** x by in-order rank, y by depth: never overlaps, and a BST reads sorted from left to right. */
function layout(t, W) {
  const order = inorder(t);
  const depth = {};
  const walk = (id, d) => { if (id === null) return; depth[id] = d; walk(t.nodes[id].left, d + 1); walk(t.nodes[id].right, d + 1); };
  walk(t.root, 0);
  const n = order.length;
  const gap = n > 1 ? Math.min(60, (W - NODE - 8) / (n - 1)) : 0;
  const span = gap * (n - 1);
  const x0 = (W - span) / 2;
  const pos = {};
  order.forEach((id, k) => { pos[id] = { x: x0 + k * gap, y: 30 + depth[id] * LEVEL_H }; });
  const levels = Math.max(0, ...Object.values(depth)) + 1;
  return { pos, height: 30 + (levels - 1) * LEVEL_H + 52, levels };
}

export function TreeGraph({ t, width, cls, badge, tag, edge, label }) {
  const W = Math.max(280, Math.min(width, 620));
  const { pos, height } = layout(t, W);
  const ids = Object.keys(t.nodes).filter((id) => pos[id]);
  return (
    <div className={styles.tree} style={{ width: W, height }} role="img" aria-label={label}>
      <svg className={styles.edges} width={W} height={height} aria-hidden="true">
        {ids.flatMap((id) => [t.nodes[id].left, t.nodes[id].right].filter((c) => c !== null && pos[c]).map((c) => (
          <line key={`${id}-${c}`} x1={pos[id].x} y1={pos[id].y} x2={pos[c].x} y2={pos[c].y} className={styles[`edge_${edge?.(id, c) ?? 'plain'}`]} />
        )))}
      </svg>
      {ids.map((id) => {
        const b = badge?.(id);
        const tg = tag?.(id);
        return (
          <div key={id} className={[styles.node, ...(cls?.(id) ?? []).map((c) => styles[c])].filter(Boolean).join(' ')} style={{ left: pos[id].x, top: pos[id].y }}>
            <span className={styles.val}>{t.nodes[id].v}</span>
            {b && <span key={b.text} className={`${styles.badge} ${styles[`b_${b.tone ?? 'success'}`]}`}>{b.text}</span>}
            {tg && <span className={`${styles.tag} ${styles[`b_${tg.tone ?? 'note'}`]}`}>{tg.text}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- tree DFS

const FN = { depth: 'maxDepth', pathsum: 'has', good: 'good', diameter: 'depth', lca: 'lca' };

function TreeDfsStage({ step: f, input, width }) {
  const t = buildTree(f.tree);
  const N = t.nodes;
  return (
    <div className={styles.wrap}>
      {f.record !== null && input.mode === 'diameter' && <Float x={0} y={0} anchor="right" tone="success">{`longest bend so far: ${f.record}`}</Float>}
      <TreeGraph
        t={t} width={width} label={`tree ${showTree(f.tree)}`}
        cls={(id) => [
          f.status[id] === 'active' && 'active',
          f.status[id] === 'done' && 'done',
          f.status[id] === 'skip' && 'skip',
          id === f.cur && (f.kind === 'found' ? 'hit' : 'cur'),
          f.bend === id && 'bend',
        ]}
        badge={(id) => (f.ret[id] !== undefined ? { text: input.mode === 'pathsum' || input.mode === 'lca' ? f.ret[id] : `↑ ${f.ret[id]}`, tone: f.ret[id] === 'null' || f.ret[id] === 'false' ? 'muted' : 'success' } : null)}
        tag={(id) => (f.ctx[id] !== undefined ? { text: f.ctx[id], tone: 'note' } : null)}
        edge={(a, b) => (f.status[b] === 'skip' ? 'skip' : f.status[a] === 'active' && f.status[b] === 'active' ? 'on' : f.status[b] ? 'seen' : 'plain')}
      />
      <Chips
        label="call stack (top →)"
        chips={f.stack.map((id, k) => ({ key: id, text: `${FN[input.mode]}(${N[id].v})`, note: f.ctx[id], tone: k === f.stack.length - 1 ? 'accent' : undefined }))}
        empty={f.kind === 'done' ? 'all calls returned' : 'no calls yet'}
      />
    </div>
  );
}

const DFS_FIELDS = (input) => [
  { name: 'tree', label: 'tree (level order, null for gaps)', placeholder: 'e.g. 3, 9, 20, null, null, 15, 7' },
  ...(input.mode === 'pathsum' ? [{ name: 'target', label: 'target', placeholder: '22', short: true }] : []),
  ...(input.mode === 'lca' ? [{ name: 'p', label: 'p', placeholder: '7', short: true }, { name: 'q', label: 'q', placeholder: '4', short: true }] : []),
];

const treeDfsSpec = {
  title: 'Tree DFS: answers come back up',
  examples: TREE_DFS,
  simulate: treeDfs,
  code: (input) => treeDfsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], call: ['Call', 'accent'], return: ['Return', 'note'], found: ['Found', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `tree = [${showTree(input.tree)}]${input.mode === 'pathsum' ? `, target = ${input.target}` : input.mode === 'lca' ? `, p = ${input.p}, q = ${input.q}` : ''}`,
  rule: (input) => ({
    depth: 'Ask both children, trust them, add 1.',
    pathsum: 'Pass the amount still needed down; a leaf checks it.',
    good: 'Pass the biggest value so far down; add up the counts.',
    diameter: 'Return the height; record left + right on the side.',
    lca: 'Return what you found; both sides found something → here.',
  })[input.mode],
  stats: (f) => [['calls waiting', f.stack.length]],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">9</Key>, 'call in progress'],
    [<Key shape="box" tone="success">↑ 1</Key>, 'what a call returned'],
    ...(input.mode === 'pathsum' || input.mode === 'good' ? [[<Key shape="box" tone="note">need 17</Key>, 'passed down']] : []),
    ...(input.mode === 'pathsum' || input.mode === 'lca' ? [[<Key shape="dashed">8</Key>, 'never visited']] : []),
  ],
  fields: DFS_FIELDS,
  values: (input) => ({ tree: showTree(input.tree), ...(input.mode === 'pathsum' ? { target: String(input.target) } : {}), ...(input.mode === 'lca' ? { p: String(input.p), q: String(input.q) } : {}) }),
  parse: parseTreeDfs,
  random: (input) => randomTreeDfs(input),
  hint: () => 'Level order like LeetCode: up to 15 nodes and 5 levels; null marks a missing child.',
  delay: () => 2600,
  Stage: TreeDfsStage,
};

export function TreeDfsViz(props) {
  return <StepViz spec={treeDfsSpec} {...props} />;
}

// ---------------------------------------------------------------- tree BFS

function TreeBfsStage({ step: f, input, width }) {
  const t = buildTree(f.tree);
  const N = t.nodes;
  const curLeft = f.kind === 'level' ? f.queue.length : f.kind === 'visit' || f.kind === 'found' ? Math.max(0, f.size - f.i - 1) : 0;
  const levelChips = input.mode === 'right'
    ? f.out.map((v, k) => ({ key: k, text: String(v), tone: 'success', isNew: k === f.out.length - 1 && f.kind === 'found' }))
    : f.out.map((lv, k) => ({ key: k, text: `[${lv.join(', ')}]`, note: `L${k + 1}`, tone: k === f.out.length - 1 && f.kind !== 'done' ? 'accent' : undefined }));
  return (
    <div className={styles.wrap}>
      <TreeGraph
        t={t} width={width} label={`tree ${showTree(f.tree)}`}
        cls={(id) => [
          f.status[id] === 'queued' && 'queued',
          f.status[id] === 'done' && 'done',
          id === f.cur && (f.kind === 'found' ? 'hit' : 'cur'),
        ]}
        badge={(id) => (f.levelOf[id] ? { text: `L${f.levelOf[id]}`, tone: 'muted' } : null)}
        edge={(a, b) => (f.status[b] ? 'seen' : 'plain')}
      />
      <Chips
        label="queue (front →)"
        chips={f.queue.map((id, k) => ({ key: id, text: String(N[id].v), tone: k < curLeft ? 'accent' : undefined, note: k < curLeft ? 'this level' : 'next' }))}
        empty="empty"
      />
      <Chips label={input.mode === 'right' ? 'visible from the right' : input.mode === 'min' ? 'levels finished' : 'levels so far'} chips={levelChips} empty="none yet" />
    </div>
  );
}

const treeBfsSpec = {
  title: 'Tree BFS: level by level',
  examples: TREE_BFS,
  simulate: treeBfs,
  code: (input) => treeBfsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], level: ['New level', 'interview'], visit: ['Poll', 'accent'], found: ['Found', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `tree = [${showTree(input.tree)}]`,
  rule: () => 'Freeze size = queue.size(); poll exactly that many; their children are the next level.',
  stats: (f) => [['queue', f.queue.length], ['level', f.depth ?? '—']],
  legend: () => [
    [<Key shape="box" tone="accent">9</Key>, 'in the queue'],
    [<Key shape="box" tone="warn">3</Key>, 'being polled'],
    [<Key shape="box" tone="success">2</Key>, 'done (L = its level)'],
  ],
  fields: () => [{ name: 'tree', label: 'tree (level order, null for gaps)', placeholder: 'e.g. 1, 2, 3, null, 5, null, 4' }],
  values: (input) => ({ tree: showTree(input.tree) }),
  parse: parseTreeBfs,
  random: (input) => randomTreeBfs(input),
  hint: () => 'Level order like LeetCode: up to 15 nodes and 5 levels; null marks a missing child.',
  delay: () => 2400,
  Stage: TreeBfsStage,
};

export function TreeBfsViz(props) {
  return <StepViz spec={treeBfsSpec} {...props} />;
}

// ---------------------------------------------------------------- binary search trees

function BstStage({ step: f, input, width }) {
  const t = f.t;
  const N = t.nodes;
  const order = Object.fromEntries(f.visit.map((id, k) => [id, k + 1]));
  return (
    <div className={styles.wrap}>
      {(input.mode === 'search' || input.mode === 'insert') && <Float x={0} y={0} anchor="right" tone="accent">{`${input.mode === 'search' ? 'looking for' : 'inserting'} ${input.x}`}</Float>}
      {input.mode === 'lca' && <Float x={0} y={0} anchor="right" tone="accent">{`p = ${input.p}, q = ${input.q}`}</Float>}
      <TreeGraph
        t={t} width={width} label="binary search tree"
        cls={(id) => [
          f.status[id] === 'path' && 'active',
          f.status[id] === 'done' && 'done',
          f.status[id] === 'bad' && 'bad',
          f.status[id] === 'hit' && 'hit',
          id === f.cur && f.status[id] !== 'hit' && f.status[id] !== 'bad' && 'cur',
          f.fresh === id && 'fresh',
          input.mode === 'lca' && (N[id].v === input.p || N[id].v === input.q) && 'target',
        ]}
        badge={(id) => (order[id] ? { text: `#${order[id]}`, tone: f.status[id] === 'hit' ? 'success' : 'muted' } : null)}
        tag={(id) => (f.tags[id] ? { text: f.tags[id], tone: f.status[id] === 'bad' ? 'danger' : 'note' } : null)}
        edge={(a, b) => ((f.status[a] === 'path' || f.status[a] === 'hit') && f.status[b] ? 'on' : 'plain')}
      />
      {input.mode === 'kth' && (
        <>
          <Chips label="stack (top →)" chips={f.stack.map((id, k) => ({ key: id, text: String(N[id].v), tone: k === f.stack.length - 1 ? 'accent' : undefined }))} empty="empty" />
          <Chips label="visited in order" chips={f.visit.map((id) => ({ key: id, text: String(N[id].v), tone: f.status[id] === 'hit' ? 'success' : undefined }))} empty="none yet" />
        </>
      )}
    </div>
  );
}

const bstSpec = {
  title: 'Binary search trees, step by step',
  examples: BST,
  simulate: bst,
  code: (input) => bstCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], go: ['Go', 'accent'], found: ['Found', 'success'], missing: ['Not there', 'warn'], insert: ['Insert', 'success'],
    check: ['Fits', 'accent'], fail: ['Not a BST', 'danger'], left: ['Go left', 'accent'], visit: ['Visit', 'note'], done: ['Answer', 'success'],
  },
  describe: (input) => `tree = [${showTree(input.tree)}]${input.mode === 'lca' ? `, p = ${input.p}, q = ${input.q}` : input.mode === 'validate' ? '' : `, ${input.mode === 'kth' ? 'k' : 'x'} = ${input.x}`}`,
  rule: (input) => ({
    search: 'Smaller: go left. Bigger: go right.',
    insert: 'Search for it; attach it where the search falls off.',
    validate: 'Each node must fit the (lo, hi) range handed down by its ancestors.',
    kth: 'In-order is sorted: go left, visit, go right, count to k.',
    lca: 'Both smaller: left. Both bigger: right. Otherwise: here.',
  })[input.mode],
  stats: () => [],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">8</Key>, input.mode === 'kth' ? 'on the stack' : 'on the path'],
    [<Key shape="box" tone="success">6</Key>, 'the answer'],
    ...(input.mode === 'validate' ? [[<Key shape="box" tone="note">(5, 8)</Key>, 'allowed range']] : []),
    ...(input.mode === 'kth' ? [[<Key shape="box">#2</Key>, 'visit order']] : []),
  ],
  fields: (input) => [
    { name: 'tree', label: 'tree (level order)', placeholder: 'e.g. 8, 3, 10, 1, 6, null, 14' },
    ...(input.mode === 'lca' ? [{ name: 'p', label: 'p', placeholder: '4', short: true }, { name: 'q', label: 'q', placeholder: '7', short: true }] : input.mode === 'validate' ? [] : [{ name: 'x', label: input.mode === 'kth' ? 'k' : 'x', placeholder: '3', short: true }]),
  ],
  values: (input) => ({ tree: showTree(input.tree), ...(input.mode === 'lca' ? { p: String(input.p), q: String(input.q) } : input.mode === 'validate' ? {} : { x: String(input.x) }) }),
  parse: parseBst,
  random: (input) => randomBst(input),
  hint: (input) => (input.mode === 'validate' ? 'Any tree in level order (up to 13 nodes); try one that breaks the rule deep down.' : 'A BST in level order (up to 13 nodes, distinct values).'),
  delay: () => 2400,
  Stage: BstStage,
};

export function BstViz(props) {
  return <StepViz spec={bstSpec} {...props} />;
}
