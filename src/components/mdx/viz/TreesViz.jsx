import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, Float, RowLabel, Stage, pitchFor } from './prims';
import { CmpCard } from './sideKit';
import kit from './sideKit.module.css';
import { TREE_WALK, parseTreeWalk, randomTreeWalk, treeWalk, treeWalkCode } from './models/treeWalk';
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
  const gap = n > 1 ? Math.min(60, (W - NODE - 44) / (n - 1)) : 0;
  const span = gap * (n - 1);
  const x0 = (W - span) / 2 - 10;   // badges hang off the right of a node: keep room for them
  const pos = {};
  order.forEach((id, k) => { pos[id] = { x: x0 + k * gap, y: 30 + depth[id] * LEVEL_H }; });
  const levels = Math.max(0, ...Object.values(depth)) + 1;
  return { pos, height: 30 + (levels - 1) * LEVEL_H + 52, levels };
}

export function TreeGraph({ t, width, cls, badge, tag, edge, label, links }) {
  const W = Math.max(280, Math.min(width, 620));
  const { pos, height } = layout(t, W);
  const ids = Object.keys(t.nodes).filter((id) => pos[id]);
  return (
    <div className={styles.tree} style={{ width: W, height }} role="img" aria-label={label}>
      <svg className={styles.edges} width={W} height={height} aria-hidden="true">
        {ids.flatMap((id) => [t.nodes[id].left, t.nodes[id].right].filter((c) => c !== null && pos[c]).map((c) => (
          <line key={`${id}-${c}`} x1={pos[id].x} y1={pos[id].y} x2={pos[c].x} y2={pos[c].y} className={styles[`edge_${edge?.(id, c) ?? 'plain'}`]} />
        )))}
        {links?.length > 0 && (
          <defs>
            {['on', 'seen'].map((tone) => (
              <marker key={tone} id={`tg-arrow-${tone}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className={styles[`arrow_${tone}`]} />
              </marker>
            ))}
          </defs>
        )}
        {links?.filter(([a, b]) => pos[a] && pos[b]).map(([a, b, tone = 'seen']) => (
          <line
            key={`ln-${a}-${b}`} x1={pos[a].x + 19} y1={pos[a].y} x2={pos[b].x - 21} y2={pos[b].y}
            className={styles[`link_${tone}`]} markerEnd={`url(#tg-arrow-${tone})`}
          />
        ))}
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

function TreeNextStage({ step: f, width }) {
  const t = buildTree(f.tree);
  const N = t.nodes;
  const walk = new Set(f.walk ?? []);
  const kids = new Set(f.kids ?? []);
  const fresh = new Set(f.fresh);
  const links = Object.entries(f.next).filter(([, b]) => b !== null).map(([a, b]) => [a, b, fresh.has(a) ? 'on' : 'seen']);
  return (
    <div className={styles.wrap}>
      <TreeGraph
        t={t} width={width} label={`tree ${showTree(f.tree)} with next pointers`} links={links}
        cls={(id) => [
          id in f.next && !walk.has(id) && 'done',
          walk.has(id) && 'active',
          kids.has(id) && 'queued',
          id === f.via && 'target',
          id === f.cur && 'cur',
        ]}
        badge={(id) => (f.next[id] === null ? { text: '→ null', tone: 'muted' } : null)}
      />
      <Chips
        label="levels read through next"
        chips={f.out.map((lv, k) => ({ key: k, text: `${lv.join(' → ')} → null`, note: `L${k + 1}`, tone: k === f.out.length - 1 && f.kind === 'found' ? 'accent' : undefined }))}
        empty="none yet"
      />
    </div>
  );
}

function WidthSlots({ f, N }) {
  const d = f.depth;
  const here = Object.keys(f.posOf).filter((id) => f.levelOf[id] === d).sort((a, b) => f.posOf[a] - f.posOf[b]);
  if (!here.length) return null;
  const top = f.posOf[here.at(-1)];
  const at = Object.fromEntries(here.map((id) => [f.posOf[id], id]));
  return (
    <Chips
      label={`level ${d} positions`}
      chips={Array.from({ length: top + 1 }, (_, p) => ({ key: p, text: at[p] !== undefined ? String(N[at[p]].v) : '·', note: String(p), tone: at[p] !== undefined ? 'accent' : undefined }))}
      empty="—"
    />
  );
}

function TreeBfsStage({ step: f, input, width }) {
  if (input.mode === 'next') return <TreeNextStage step={f} width={width} />;
  const t = buildTree(f.tree);
  const N = t.nodes;
  const curLeft = f.kind === 'level' ? f.queue.length : f.kind === 'visit' || f.kind === 'found' ? Math.max(0, f.size - f.i - 1) : 0;
  const num = input.mode === 'avg' || input.mode === 'max' || input.mode === 'width';
  const levelChips = num
    ? f.out.map((v, k) => ({ key: k, text: input.mode === 'avg' ? (Number.isInteger(v) ? `${v}.0` : String(Math.round(v * 1e5) / 1e5)) : String(v), note: `L${k + 1}`, tone: k === f.out.length - 1 && f.kind === 'found' ? 'success' : undefined }))
    : input.mode === 'right'
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
        badge={(id) => (input.mode === 'width' && id in f.posOf ? { text: `#${f.posOf[id]}`, tone: 'muted' } : f.levelOf[id] ? { text: `L${f.levelOf[id]}`, tone: 'muted' } : null)}
        edge={(a, b) => (f.status[b] ? 'seen' : 'plain')}
      />
      <Chips
        label="queue (front →)"
        chips={f.queue.map((id, k) => ({ key: id, text: String(N[id].v), tone: k < curLeft ? 'accent' : undefined, note: k < curLeft ? 'this level' : 'next' }))}
        empty="empty"
      />
      {input.mode === 'width' && f.depth && <WidthSlots f={f} N={N} />}
      <Chips label={{ right: 'visible from the right', min: 'levels finished', avg: 'averages', max: 'largest per level', width: 'widths' }[input.mode] ?? 'levels so far'} chips={levelChips} empty="none yet" />
    </div>
  );
}

const treeBfsSpec = {
  title: 'Tree BFS: level by level',
  examples: TREE_BFS,
  simulate: treeBfs,
  code: (input) => treeBfsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], level: ['New level', 'interview'], visit: ['Poll', 'accent'], wire: ['Siblings', 'accent'], link: ['Cousins', 'interview'], found: ['Found', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `tree = [${showTree(input.tree)}]`,
  rule: (input) => (input.mode === 'next'
    ? 'Walk a linked level through next; wire its children: left → right, right → next.left.'
    : input.mode === 'width'
      ? 'Children of p are 2p and 2p + 1; re-base each level so it starts at 0; width = last + 1.'
      : 'Freeze size = queue.size(); poll exactly that many; their children are the next level.'),
  stats: (f, input) => (input.mode === 'next' ? [['level', f.depth ?? '—']] : [['queue', f.queue.length], ['level', f.depth ?? '—']]),
  legend: (f, input) => (input.mode === 'next' ? [
    [<Key shape="box" tone="accent">2</Key>, 'level being walked'],
    [<Key shape="box" tone="warn">3</Key>, 'standing here'],
    [<Key shape="box" tone="success">5</Key>, 'next is set'],
  ] : [
    [<Key shape="box" tone="accent">9</Key>, 'in the queue'],
    [<Key shape="box" tone="warn">3</Key>, 'being polled'],
    [<Key shape="box" tone="success">2</Key>, input.mode === 'width' ? 'done (# = its position)' : 'done (L = its level)'],
  ]),
  fields: () => [{ name: 'tree', label: 'tree (level order, null for gaps)', placeholder: 'e.g. 1, 2, 3, null, 5, null, 4' }],
  values: (input) => ({ tree: showTree(input.tree) }),
  parse: parseTreeBfs,
  random: (input) => randomTreeBfs(input),
  hint: (input) => (input.mode === 'next' ? 'A perfect tree: 3, 7 or 15 values, no nulls.' : 'Level order like LeetCode: up to 15 nodes and 5 levels; null marks a missing child.'),
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

// ---------------------------------------------------------------- comparing, changing and rebuilding trees

function WalkStrip({ strip, width, jump }) {
  const n = strip.items.length;
  const pitch = pitchFor(width - 8, n, 26, 50);
  return (
    <Stage width={n * pitch} height={22 + 40 + 24} jump={jump} label={`${strip.label}: ${strip.items.join(' ')}`}>
      <RowLabel x={0} y={0}>{strip.label}</RowLabel>
      <ArrayStrip
        items={strip.items} y={22} pitch={pitch} h={40} index={false}
        tags={strip.cur !== null && strip.cur !== undefined ? { [strip.cur]: [{ label: 'now', tone: 'accent' }] } : {}}
        bands={strip.band ? [{ from: strip.band[0], to: strip.band[1], tone: 'accent' }] : []}
        cls={(k) => [k === strip.cur && 'cur', strip.marks?.[k]].filter(Boolean).join(' ')}
      />
    </Stage>
  );
}

function TreeWalkStage({ step: f, width, jump }) {
  const two = f.trees.length > 1;
  const side = two && width >= 640;
  const tw = side ? Math.floor(width / 2) - 12 : width;
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {f.trees.map((tr) => (
          <div key={tr.label} style={{ minWidth: 0 }}>
            <p className={kit.label} style={{ textAlign: 'center' }}>{tr.label}</p>
            {tr.t.root === null
              ? <p className={kit.label} style={{ textAlign: 'center', opacity: 0.7 }}>(empty)</p>
              : <TreeGraph t={tr.t} width={tw} cls={(id) => tr.cls[id] ?? []} badge={(id) => tr.badge[id]} label={tr.label} />}
          </div>
        ))}
      </div>
      {(f.strips ?? []).map((st) => <WalkStrip key={st.label} strip={st} width={width} jump={jump} />)}
      {f.card && <div className={kit.sideRow} style={{ justifyContent: 'center' }}><CmpCard {...f.card} style={{ minWidth: 160 }} /></div>}
    </div>
  );
}

const TW_DESCRIBE = (i) => ({
  same: () => `p = [${i.p.join(', ')}], q = [${i.q.join(', ')}]`,
  subtree: () => `root = [${i.tree.join(', ')}], subRoot = [${i.sub.join(', ')}]`,
  build: () => `preorder = [${i.pre.join(', ')}], inorder = [${i.ino.join(', ')}]`,
  delete: () => `root = [${i.tree.join(', ')}], target = ${i.target}`,
})[i.mode]?.() ?? `root = [${i.tree.join(', ')}]`;

const TW_RULE = {
  same: 'Equal values, and the left pair and the right pair both match.',
  symmetric: 'Compare outside with outside and inside with inside.',
  invert: 'Children first, then swap the node\'s two children.',
  balanced: 'Height = 1 + max(l, r); −1 means unbalanced and travels straight up.',
  order: 'Same walk every time; only the moment the node is written changes.',
  subtree: 'Try every node of root as the start of subRoot.',
  build: 'Next preorder value = root; its inorder position splits left and right.',
  delete: 'Clean the children first; then delete the node if it is now a target leaf.',
  serialize: 'Preorder with # for every null; read it back in the same order.',
};

const TW_FIELDS = {
  same: [{ name: 'p', label: 'p (level order)', placeholder: '1, 2' }, { name: 'q', label: 'q (level order)', placeholder: '1, null, 2' }],
  subtree: [{ name: 'tree', label: 'root (level order)', placeholder: '3, 4, 5, 1, 2' }, { name: 'sub', label: 'subRoot', placeholder: '4, 1, 2' }],
  build: [{ name: 'pre', label: 'preorder', placeholder: '3, 9, 20, 15, 7' }, { name: 'ino', label: 'inorder', placeholder: '9, 3, 15, 20, 7' }],
  delete: [{ name: 'tree', label: 'root (level order)', placeholder: '1, 2, 3, 2, null, 2, 4' }, { name: 'target', label: 'target', placeholder: '2', short: true }],
};

const treeWalkSpec = {
  title: 'Tree DFS, one decision at a time',
  examples: TREE_WALK,
  simulate: treeWalk,
  code: (input) => treeWalkCode(input),
  kinds: {
    start: ['Start', 'neutral'], match: ['Match', 'success'], differ: ['Differ', 'danger'], swap: ['Swap', 'accent'],
    height: ['Height', 'success'], unbalanced: ['Unbalanced', 'danger'], pass: ['Pass −1 up', 'muted'], record: ['Write', 'accent'],
    try: ['Try here', 'neutral'], root: ['Root', 'accent'], remove: ['Delete', 'danger'], keep: ['Keep', 'warn'],
    write: ['Write', 'accent'], null: ['#', 'muted'], read: ['Read', 'success'], readnull: ['#', 'muted'], done: ['Answer', 'success'],
  },
  describe: TW_DESCRIBE,
  rule: (input) => TW_RULE[input.mode],
  stats: () => [],
  legend: () => [[<Key shape="box" tone="warn">·</Key>, 'the node being decided'], [<Key shape="box" tone="success">·</Key>, 'done']],
  fields: (input) => TW_FIELDS[input.mode] ?? [{ name: 'tree', label: 'root (level order)', placeholder: '1, 2, 3, null, 4' }],
  values: (input) => ({
    same: { p: input.p?.join(', '), q: input.q?.join(', ') },
    subtree: { tree: input.tree?.join(', '), sub: input.sub?.join(', ') },
    build: { pre: input.pre?.join(', '), ino: input.ino?.join(', ') },
    delete: { tree: input.tree?.join(', '), target: String(input.target) },
  })[input.mode] ?? { tree: input.tree.join(', ') },
  parse: parseTreeWalk,
  random: (input) => randomTreeWalk(input),
  hint: () => 'Trees in level order with null for a missing child, up to 11 entries.',
  delay: (f) => (f.kind === 'start' ? 2600 : 1900),
  Stage: TreeWalkStage,
};

export function TreeWalkViz(props) {
  return <StepViz spec={treeWalkSpec} {...props} />;
}
