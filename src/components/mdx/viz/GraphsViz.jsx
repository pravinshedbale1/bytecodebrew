import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, RowLabel, Stage, pitchFor } from './prims';
import styles from './GraphsViz.module.css';
import {
  DIJKSTRA, GRID_BFS, ISLANDS, TOPO, UNION_FIND, dijkstra, dijkstraCode, edgesText, gridBfs, gridBfsCode, gridText, islands, islandsCode,
  parseDijkstra, parseGridBfs, parseIslands, parseTopo, parseUnionFind, randomDijkstra, randomGridBfs, randomIslands, randomTopo, randomUnionFind,
  topo, topoCode, topoLayers, unionFind, unionFindCode, unionOpsText,
} from './models/graphs';

/**
 * Step-throughs for the Graphs module:
 *   <IslandsViz />      DFS flood fill on a grid, one colour per island
 *   <GridBfsViz />      BFS in rings: shortest path in a grid, and multi-source rotting oranges
 *   <TopoViz />         Kahn's algorithm: in-degrees fall as courses are taken; leftovers are a cycle
 *   <UnionFindViz />    a forest of parent arrows: union by size, path halving, the edge that closes a cycle
 *   <DijkstraViz />     distances settle one by one; edges relax; stale queue entries are skipped
 */

const ISLAND_TONES = ['accent', 'note', 'interview', 'warn', 'success'];

// ---------------------------------------------------------------- grids

function GridCells({ grid, width, cell: cellFn }) {
  const R = grid.length, C = grid[0].length;
  const size = Math.max(30, Math.min(52, Math.floor((width - 8) / C)));
  return (
    <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${C}, ${size}px)`, gridAutoRows: `${size}px` }}>
      {grid.flatMap((row, r) => row.map((_, c) => {
        const x = cellFn(r, c);
        return (
          <div key={`${r},${c}`} className={[styles.cell, ...(x.cls ?? []).map((k) => styles[k])].filter(Boolean).join(' ')} title={`(${r}, ${c})`}>
            {x.label !== undefined && <span key={x.key ?? 'v'} className={x.pop ? styles.pop : undefined}>{x.label}</span>}
            {x.badge !== undefined && <i className={styles.cellBadge}>{x.badge}</i>}
          </div>
        );
      }))}
    </div>
  );
}

function IslandsStage({ step: f, width }) {
  const onStack = new Map(f.stack.map(([r, c], k) => [`${r},${c}`, k + 1]));
  return (
    <div className={styles.wrap}>
      <GridCells
        grid={f.grid} width={width}
        cell={(r, c) => {
          const land = f.grid[r][c] === 1;
          const isle = f.owner[r][c];
          const cur = f.cur && f.cur[0] === r && f.cur[1] === c;
          return {
            cls: [land ? 'land' : 'water', isle && `isle_${ISLAND_TONES[(isle - 1) % ISLAND_TONES.length]}`, cur && 'cellCur', f.finished === isle && isle && 'cellDone'],
            label: isle ? isle : land ? '' : '',
            badge: onStack.has(`${r},${c}`) ? onStack.get(`${r},${c}`) : undefined,
            pop: cur,
            key: cur ? 'cur' : 'v',
          };
        }}
      />
      <p className={styles.caption}>{f.stack.length ? `DFS path (small numbers = call depth): ${f.stack.map(([r, c]) => `(${r},${c})`).join(' → ')}` : 'numbers = which island a cell belongs to'}</p>
    </div>
  );
}

const islandsSpec = {
  title: 'Islands: DFS flood fill',
  examples: ISLANDS,
  simulate: islands,
  code: (input) => islandsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], found: ['New island', 'interview'], visit: ['Visit', 'accent'], island: ['Island done', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `${input.grid.length} × ${input.grid[0].length} grid`,
  rule: () => 'New unvisited land → a new island; DFS marks all of it.',
  stats: (f) => [['islands', f.count], ['DFS depth', f.stack.length]],
  legend: () => [[<Key shape="box" tone="note">0</Key>, 'water'], [<Key shape="box" tone="warn">1</Key>, 'land, not visited'], [<Key shape="box" tone="accent">2</Key>, 'visited: island number']],
  fields: () => [{ name: 'grid', label: 'grid rows (1 = land), separated by ;', placeholder: 'e.g. 11000; 11000; 00100; 00011' }],
  values: (input) => ({ grid: gridText(input.grid) }),
  parse: parseIslands,
  random: (input) => randomIslands(input),
  hint: () => 'Up to 6 rows of up to 8 cells, 0 or 1.',
  delay: () => 1800,
  Stage: IslandsStage,
};

export function IslandsViz(props) {
  return <StepViz spec={islandsSpec} {...props} />;
}

function GridBfsStage({ step: f, input, width }) {
  const fresh = new Set((f.fresh ?? []).map(([r, c]) => `${r},${c}`));
  const R = f.grid.length, C = f.grid[0].length;
  return (
    <div className={styles.wrap}>
      <GridCells
        grid={f.grid} width={width}
        cell={(r, c) => {
          const d = f.dist[r][c];
          const isNew = fresh.has(`${r},${c}`);
          if (input.mode === 'path') {
            const blocked = f.grid[r][c] === 1;
            const end = (r === 0 && c === 0) || (r === R - 1 && c === C - 1);
            return { cls: [blocked ? 'wall' : 'open', d !== null && `ring_${Math.min(d, 9) % 2 ? 'a' : 'b'}`, isNew && 'cellNew', end && 'cellEnd'], label: d ?? '', pop: isNew, key: isNew ? `n${f.ring}` : 'v' };
          }
          const v = f.state[r][c];
          return {
            cls: [v === 0 ? 'empty' : v === 1 ? 'fresh' : 'rotten', isNew && 'cellNew'],
            label: v === 2 ? (d ?? '') : '',
            pop: isNew, key: isNew ? `n${f.ring}` : 'v',
          };
        }}
      />
      <p className={styles.caption}>{input.mode === 'path' ? 'numbers = distance from the start (in cells)' : 'numbers on rotten oranges = the minute they went rotten'}</p>
    </div>
  );
}

const gridBfsSpec = {
  title: 'BFS on a grid: rings of distance',
  examples: GRID_BFS,
  simulate: gridBfs,
  code: (input) => gridBfsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], ring: ['Next ring', 'accent'], found: ['Reached', 'success'], done: ['Answer', 'success'] },
  describe: (input) => `${input.grid.length} × ${input.grid[0].length} grid`,
  rule: (input) => (input.mode === 'path' ? 'One ring per BFS level; the first ring that touches the corner is the answer.' : 'All rotten oranges start in the queue; one level = one minute.'),
  stats: (f) => [['queue', f.queue.length]],
  legend: (f, input) => (input.mode === 'path'
    ? [[<Key shape="box" tone="accent">3</Key>, 'reached this ring'], [<Key shape="box">■</Key>, 'blocked']]
    : [[<Key shape="box" tone="warn">●</Key>, 'fresh'], [<Key shape="box" tone="danger">2</Key>, 'rotten (minute)'], [<Key shape="dashed"> </Key>, 'empty']]),
  fields: (input) => [{ name: 'grid', label: input.mode === 'path' ? 'grid rows (1 = blocked), separated by ;' : 'grid rows (0 empty, 1 fresh, 2 rotten)', placeholder: input.mode === 'path' ? 'e.g. 000; 110; 110' : 'e.g. 211; 110; 011' }],
  values: (input) => ({ grid: gridText(input.grid) }),
  parse: parseGridBfs,
  random: (input) => randomGridBfs(input),
  hint: () => 'Up to 6 rows of up to 7 cells.',
  delay: () => 2200,
  Stage: GridBfsStage,
};

export function GridBfsViz(props) {
  return <StepViz spec={gridBfsSpec} {...props} />;
}

// ---------------------------------------------------------------- drawing directed graphs

const R_NODE = 19;

function Arrow({ a, b, cls, label, bend = 0, id }) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = a.x + ux * R_NODE, sy = a.y + uy * R_NODE;
  const ex = b.x - ux * (R_NODE + 3), ey = b.y - uy * (R_NODE + 3);
  const mx = (sx + ex) / 2 - uy * bend, my = (sy + ey) / 2 + ux * bend;
  return (
    <g className={cls}>
      <path d={`M${sx},${sy} Q${mx},${my} ${ex},${ey}`} markerEnd={`url(#${id})`} />
      {label !== undefined && <text x={mx - uy * 9} y={my + ux * 9 + 4} textAnchor="middle">{label}</text>}
    </g>
  );
}

function ArrowDefs({ id }) {
  return (
    <defs>
      {['plain', 'on', 'good', 'faded', 'bad'].map((t) => (
        <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className={styles[`head_${t}`]} />
        </marker>
      ))}
    </defs>
  );
}

// ---------------------------------------------------------------- topological sort

function TopoStage({ step: f, input, width }) {
  const layer = topoLayers(input);
  const cols = Math.max(...layer) + 1;
  const byLayer = Array.from({ length: cols }, (_, k) => layer.map((l, i) => [l, i]).filter(([l]) => l === k).map(([, i]) => i));
  const rows = Math.max(...byLayer.map((l) => l.length));
  const W = Math.max(300, Math.min(width, 600));
  const H = 40 + rows * 70;
  const pos = {};
  byLayer.forEach((ids, l) => ids.forEach((id, k) => { pos[id] = { x: ((l + 0.5) / cols) * W, y: 34 + (k + (rows - ids.length) / 2) * 70 }; }));
  const order = Object.fromEntries(f.order.map((u, k) => [u, k + 1]));
  const queued = new Set(f.queue);
  const stuck = new Set(f.stuck ?? []);
  return (
    <div className={styles.wrap}>
      <div className={styles.graph} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          <ArrowDefs id="tp" />
          {input.edges.map(([a, b], k) => {
            const tone = order[a] ? (f.cur === a ? 'on' : 'faded') : stuck.has(a) && stuck.has(b) ? 'bad' : 'plain';
            return <Arrow key={k} id={`tp-${tone}`} a={pos[a]} b={pos[b]} cls={`${styles.edge} ${styles[`edge_${tone}`]}`} bend={layer[a] >= layer[b] ? 26 : 0} />;
          })}
        </svg>
        {Array.from({ length: input.n }, (_, u) => (
          <div
            key={u}
            className={[styles.node, order[u] && styles.nodeDone, queued.has(u) && styles.nodeReady, f.cur === u && styles.nodeCur, stuck.has(u) && styles.nodeBad, f.fresh?.includes(u) && styles.pop].filter(Boolean).join(' ')}
            style={{ left: pos[u].x, top: pos[u].y }}
          >
            {u}
            <i className={`${styles.deg} ${f.indeg[u] === 0 ? styles.degZero : ''}`} title="unfinished prerequisites">{order[u] ? `#${order[u]}` : f.indeg[u]}</i>
          </div>
        ))}
      </div>
      <Chips label="queue (ready)" chips={f.queue.map((u) => ({ key: u, text: String(u), tone: 'accent', isNew: f.fresh?.includes(u) }))} empty="empty" />
      <Chips label="order" chips={f.order.map((u, k) => ({ key: u, text: String(u), tone: 'success', isNew: k === f.order.length - 1 && f.kind === 'take' }))} empty="none yet" />
    </div>
  );
}

const topoSpec = {
  title: 'Topological sort (Kahn\'s algorithm)',
  examples: TOPO,
  simulate: topo,
  code: () => topoCode,
  kinds: { start: ['Start', 'neutral'], ready: ['Ready', 'accent'], take: ['Take', 'success'], done: ['Order', 'success'], cycle: ['Cycle', 'danger'] },
  describe: (input) => `edges ${edgesText(input.edges)}`,
  rule: () => 'Take a course with in-degree 0; every course after it loses one prerequisite.',
  stats: (f) => [['taken', f.order.length], ['ready', f.queue.length]],
  legend: () => [
    [<Key shape="box">2</Key>, 'number = unfinished prerequisites'],
    [<Key shape="box" tone="accent">0</Key>, 'ready (in the queue)'],
    [<Key shape="box" tone="success">#1</Key>, 'taken: its position'],
    [<Key shape="box" tone="danger">3</Key>, 'stuck in a cycle'],
  ],
  fields: () => [{ name: 'edges', label: 'edges (a>b: a before b)', placeholder: 'e.g. 0>2, 1>2, 1>3, 2>4' }],
  values: (input) => ({ edges: edgesText(input.edges) }),
  parse: parseTopo,
  random: () => randomTopo(),
  hint: () => 'Up to 12 edges between nodes 0 to 7. Add one backwards to make a cycle.',
  delay: () => 2400,
  Stage: TopoStage,
};

export function TopoViz(props) {
  return <StepViz spec={topoSpec} {...props} />;
}

// ---------------------------------------------------------------- union-find

/** Trees from the parent array: roots side by side, each node centred over its children. */
function forest(parent, ids, W) {
  const kids = Object.fromEntries(ids.map((i) => [i, []]));
  const roots = [];
  for (const i of ids) (parent[i] === i ? roots : kids[parent[i]]).push(i);
  const leaves = (i) => (kids[i].length ? kids[i].reduce((a, c) => a + leaves(c), 0) : 1);
  const total = roots.reduce((a, r) => a + leaves(r), 0);
  const slot = W / total;
  const pos = {};
  let x = 0;
  const place = (i, depth) => {
    if (!kids[i].length) { pos[i] = { x: x + slot / 2, y: 30 + depth * 64 }; x += slot; return; }
    kids[i].forEach((c) => place(c, depth + 1));
    pos[i] = { x: (pos[kids[i][0]].x + pos[kids[i].at(-1)].x) / 2, y: 30 + depth * 64 };
  };
  roots.forEach((r) => place(r, 0));
  const depth = Math.max(...Object.values(pos).map((p) => p.y));
  return { pos, roots, height: depth + 40 };
}

function UnionFindStage({ step: f, width, seq }) {
  const ids = Array.from({ length: f.n }, (_, k) => k).filter((k) => !(f.redundant && k === 0));
  const W = Math.max(300, Math.min(width, 600));
  const { pos, roots, height } = forest(f.parent, ids, W);
  const H = Math.max(height, 3 * 64);
  const active = new Set([f.a, f.b, f.ra, f.rb].filter((x) => x !== undefined));
  const walk = new Set(f.walk ?? []);
  const pitch = pitchFor(W, ids.length, 34, 52);
  return (
    <div className={styles.wrap}>
      <div className={styles.graph} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          <ArrowDefs id="uf" />
          {ids.filter((i) => f.parent[i] !== i).map((i) => {
            const tone = f.kind === 'union' && i === f.rb ? 'on' : (f.rewired ?? []).some(([x]) => x === i) ? 'good' : walk.has(i) ? 'on' : 'plain';
            return <Arrow key={`${i}-${f.parent[i]}-${tone === 'on' ? seq : ''}`} id={`uf-${tone}`} a={pos[i]} b={pos[f.parent[i]]} cls={`${styles.edge} ${styles[`edge_${tone}`]} ${tone === 'on' ? styles.draw : ''}`} />;
          })}
        </svg>
        {ids.map((i) => (
          <div
            key={i}
            className={[styles.node, roots.includes(i) && styles.nodeRoot, active.has(i) && styles.nodeCur, f.kind === 'same' && (i === f.a || i === f.b) && styles.nodeBad].filter(Boolean).join(' ')}
            style={{ left: pos[i].x, top: pos[i].y }}
          >
            {i}
            {roots.includes(i) && f.size[i] > 1 && <i className={styles.deg} title="group size">{f.size[i]}</i>}
          </div>
        ))}
      </div>
      <Stage width={ids.length * pitch} height={46 + 26} label="parent array">
        <ArrayStrip
          items={ids.map((i) => f.parent[i])} y={0} pitch={pitch} h={40}
          indexLabel={(k) => ids[k]}
          cls={(k) => [f.parent[ids[k]] === ids[k] && 'kept', (f.rewired ?? []).some(([x]) => x === ids[k]) && 'hit', f.kind === 'union' && ids[k] === f.rb && 'hit'].filter(Boolean).join(' ')}
        />
      </Stage>
      <p className={styles.caption}>parent[i] under each person; a person who is their own parent is a root</p>
    </div>
  );
}

const unionFindSpec = {
  title: 'Union-Find: groups as trees',
  examples: UNION_FIND,
  simulate: unionFind,
  code: () => unionFindCode,
  kinds: { start: ['Start', 'neutral'], union: ['Union', 'accent'], same: ['Same group', 'warn'], find: ['Find', 'note'], done: ['Done', 'success'] },
  describe: (input) => (input.redundant ? `edges ${unionOpsText(input.ops)}` : `operations ${unionOpsText(input.ops)}`),
  rule: () => 'Same root = same group. Union: the smaller tree goes under the bigger root.',
  stats: (f) => [['groups', f.groups]],
  legend: () => [[<Key shape="box" tone="accent">0</Key>, 'root (number = group size)'], [<Key shape="box" tone="warn">3</Key>, 'involved now'], [<Key>→</Key>, 'points to its parent']],
  fields: (input) => [{ name: 'ops', label: input.redundant ? 'edges (a-b)' : 'operations: a-b to union, f3 to find', placeholder: input.redundant ? 'e.g. 1-2, 2-3, 3-4, 1-4' : 'e.g. 0-1, 2-3, 1-3, f3' }],
  values: (input) => ({ ops: unionOpsText(input.ops) }),
  parse: parseUnionFind,
  random: (input) => randomUnionFind(input),
  hint: (input) => (input.redundant ? 'A tree on nodes 1 to 7 plus one extra edge.' : 'People 0 to 7; up to 10 operations.'),
  delay: () => 2600,
  Stage: UnionFindStage,
};

export function UnionFindViz(props) {
  return <StepViz spec={unionFindSpec} {...props} />;
}

// ---------------------------------------------------------------- Dijkstra

function DijkstraStage({ step: f, width }) {
  const W = Math.max(300, Math.min(width, 560));
  const H = 270;
  const n = f.nodes.length;
  const pos = Object.fromEntries(f.nodes.map((v, k) => [v, { x: W / 2 + (W / 2 - 50) * Math.cos(Math.PI + (2 * Math.PI * k) / n), y: H / 2 + (H / 2 - 34) * Math.sin(Math.PI + (2 * Math.PI * k) / n) }]));
  const done = new Set(f.done);
  const relaxed = Object.fromEntries((f.relaxed ?? []).map((r) => [r.v, r]));
  const fmt = (d) => (d === Infinity ? '∞' : d);
  const has = (a, b) => f.edges.some(([x, y]) => x === b && y === a);
  return (
    <div className={styles.wrap}>
      <div className={styles.graph} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          <ArrowDefs id="dj" />
          {f.edges.map(([a, b, w], k) => {
            const r = f.cur === a ? relaxed[b] : null;
            const tree = f.prev[b] === a;
            const tone = r ? (r.better ? 'good' : 'faded') : tree ? 'on' : 'plain';
            return <Arrow key={k} id={`dj-${tone}`} a={pos[a]} b={pos[b]} label={w} bend={has(a, b) ? 18 : 0} cls={`${styles.edge} ${styles[`edge_${tone}`]} ${styles.weighted}`} />;
          })}
        </svg>
        {f.nodes.map((v) => (
          <div
            key={v}
            className={[styles.node, done.has(v) && styles.nodeDone, f.cur === v && styles.nodeCur, f.kind === 'stale' && f.cur === v && styles.nodeStale, relaxed[v]?.better && styles.pop].filter(Boolean).join(' ')}
            style={{ left: pos[v].x, top: pos[v].y }}
          >
            {v}
            <i key={`${v}-${f.dist[v]}`} className={`${styles.dist} ${relaxed[v]?.better ? styles.distNew : ''}`}>{fmt(f.dist[v])}</i>
          </div>
        ))}
      </div>
      <Chips label="priority queue (closest first)" chips={f.pq.map((e, k) => ({ key: `${e.u}${e.d}${k}`, text: `${e.u}(${e.d})`, tone: k === 0 ? 'accent' : e.d > f.dist[e.u] ? 'danger' : undefined, note: e.d > f.dist[e.u] ? 'stale' : undefined }))} empty="empty" />
    </div>
  );
}

const dijkstraSpec = {
  title: 'Dijkstra: settle the closest node',
  examples: DIJKSTRA,
  simulate: dijkstra,
  code: () => dijkstraCode,
  kinds: { start: ['Start', 'neutral'], settle: ['Settle', 'success'], stale: ['Stale', 'warn'], done: ['Distances', 'success'] },
  describe: (input) => `from ${input.src}: ${edgesText(input.edges, true)}`,
  rule: () => 'Take the closest unfinished node; its distance is final. Then relax its edges.',
  stats: (f) => [['final', f.done.length], ['in queue', f.pq.length]],
  legend: () => [
    [<Key shape="box" tone="success">3</Key>, 'final distance'],
    [<Key shape="box" tone="warn">B</Key>, 'settling now'],
    [<Key tone="accent">→</Key>, 'shortest-path tree'],
  ],
  fields: () => [{ name: 'edges', label: 'edges (A>B weight)', placeholder: 'e.g. A>B 4, A>C 1, C>B 2' }, { name: 'src', label: 'source', placeholder: 'A', short: true }],
  values: (input) => ({ edges: edgesText(input.edges, true), src: input.src }),
  parse: parseDijkstra,
  random: () => randomDijkstra(),
  hint: () => 'Nodes A to G, weights 0 to 20, up to 12 edges (directed).',
  delay: () => 2800,
  Stage: DijkstraStage,
};

export function DijkstraViz(props) {
  return <StepViz spec={dijkstraSpec} {...props} />;
}
