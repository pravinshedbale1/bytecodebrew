import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { Arrow, ArrowDefs, GridCells, forest } from './GraphsViz';
import { UF_WALK, parseUfWalk, randomUfWalk, ufWalk, ufWalkCode } from './models/ufWalk';
import { SP_WALK, parseSpWalk, randomSpWalk, spWalk, spWalkCode } from './models/spWalk';
import styles from './GraphsViz.module.css';
import { GRAPH_WALK, graphWalk, graphWalkCode, gridToText, parseGraphWalk, randomGraphWalk } from './models/graphWalk';
import { TOPO_WALK, parseTopoWalk, randomTopoWalk, topoWalk, topoWalkCode } from './models/topoWalk';

/**
 * <GraphWalkViz /> — the graph traversal lesson's problems, one engine. A frame can show a grid of cells,
 * one or two graphs drawn on a circle, and rows of chips (queues, stacks, maps, answers).
 */

function Graph({ g, width, id }) {
  const W = Math.max(240, Math.min(width, 480));
  const n = g.nodes.length;
  const H = n <= 2 ? 120 : Math.min(250, Math.max(170, W * 0.55));
  const pos = Object.fromEntries(g.nodes.map((v, k) => {
    if (v.px !== undefined) return [v.id, { x: 30 + v.px * (W - 60), y: 26 + v.py * (H - 52) }];
    if (n === 1) return [v.id, { x: W / 2, y: H / 2 }];
    const t = -Math.PI / 2 + (2 * Math.PI * k) / n;
    return [v.id, { x: W / 2 + (W / 2 - 40) * Math.cos(t), y: H / 2 + (H / 2 - 30) * Math.sin(t) }];
  }));
  const seen = {};
  return (
    <div>
      {g.label && <p className={styles.graphLabel}>{g.label}</p>}
      <div className={styles.graph} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          <ArrowDefs id={id} />
          {g.edges.map((e, k) => {
            const tone = e.tone ?? 'plain';
            if (!e.dir) {
              const a = pos[e.a], b = pos[e.b];
              return (
                <g key={k} className={`${styles.edge} ${styles.undirected} ${styles[`edge_${tone}`]}`}>
                  <path d={`M${a.x},${a.y} L${b.x},${b.y}`} />
                  {e.l !== undefined && <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 5} textAnchor="middle">{e.l}</text>}
                </g>
              );
            }
            const pair = `${e.a}>${e.b}`;
            const same = seen[pair] ?? 0;
            seen[pair] = same + 1;
            const reverse = g.edges.some((x) => x.dir && x.a === e.b && x.b === e.a);
            const bend = (reverse ? 16 : 0) + same * 22;
            return <Arrow key={k} id={`${id}-${tone}`} a={pos[e.a]} b={pos[e.b]} label={e.l} bend={bend} cls={`${styles.edge} ${styles[`edge_${tone}`]}`} />;
          })}
        </svg>
        {g.nodes.map((v) => (
          <div
            key={v.id}
            className={[styles.node, ...(v.c ?? []).filter(Boolean).map((c) => styles[c])].filter(Boolean).join(' ')}
            style={{
              left: pos[v.id].x, top: pos[v.id].y, fontSize: v.l.length > 2 ? 11 : 13,
              ...(v.l.length > 3 ? { width: 'auto', minWidth: 38, padding: '0 7px', borderRadius: 19, margin: 0, transform: 'translate(-50%, -50%)' } : {}),
            }}
          >
            {v.l}
            {v.badge !== undefined && <i key={v.badge} className={styles.deg}>{v.badge}</i>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Forest({ fo, width }) {
  const leaves = fo.ids.filter((i) => !fo.ids.some((j) => j !== i && fo.parent[j] === i)).length;
  const W = Math.max(260, Math.min(width, 600), leaves * 46);   // never squeeze nodes together: scroll instead
  const { pos, roots, height } = forest(fo.parent, fo.ids, W);
  const H = Math.max(height + (fo.tag ? 14 : 0), 110);
  const set = (k) => new Set((fo[k] ?? []).map(String));
  const hot = set('hot'), bad = set('bad'), good = set('good'), prime = set('prime');
  return (
    <div style={{ maxWidth: '100%', overflowX: W > width ? 'auto' : undefined }}>
      <p className={styles.graphLabel}>union-find trees: each node points to its parent; a root stands for its group</p>
      <div className={styles.graph} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          <ArrowDefs id="fw" />
          {fo.ids.filter((i) => fo.parent[i] !== i).map((i) => {
            const tone = hot.has(String(i)) ? 'on' : 'plain';
            return <Arrow key={`${i}-${fo.parent[i]}`} id={`fw-${tone}`} a={pos[i]} b={pos[fo.parent[i]]} cls={`${styles.edge} ${styles[`edge_${tone}`]}`} />;
          })}
        </svg>
        {fo.ids.map((i) => {
          const l = fo.label[i];
          return (
            <div
              key={i}
              className={[styles.node, roots.includes(i) && styles.nodeRoot, prime.has(String(i)) && styles.nodeReady, good.has(String(i)) && styles.nodeDone, bad.has(String(i)) && styles.nodeBad, hot.has(String(i)) && styles.nodeCur].filter(Boolean).join(' ')}
              style={{ left: pos[i].x, top: pos[i].y, fontSize: l.length > 2 ? 11 : 13, ...(l.length > 3 ? { width: 'auto', minWidth: 38, padding: '0 7px', borderRadius: 19, margin: 0, transform: 'translate(-50%, -50%)' } : {}) }}
            >
              {l}
              {roots.includes(i) && fo.size[i] > 1 && <i className={styles.deg}>{fo.size[i]}</i>}
              {fo.tag?.[i] !== undefined && <i className={styles.dist}>{fo.tag[i]}</i>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GraphWalkStage({ step: f, width, seq }) {
  const two = (f.graphs?.length ?? 0) > 1;
  const gw = two && width >= 560 ? Math.floor(width / 2) - 12 : width;
  return (
    <div className={styles.wrap}>
      {f.grid && (
        <GridCells
          grid={f.grid} width={width} min={f.grid[0].length > 7 ? 22 : 30}
          cell={(r, c) => ({ cls: f.grid[r][c].c.filter(Boolean), label: f.grid[r][c].l, badge: f.grid[r][c].b, pop: f.grid[r][c].c.includes('cellNew'), key: f.grid[r][c].c.includes('cellNew') ? `n${seq}` : 'v' })}
        />
      )}
      {f.forest && <Forest fo={f.forest} width={width} />}
      {f.graphs && (
        <div className={styles.graphs}>
          {f.graphs.map((g, k) => <Graph key={k} g={g} width={gw} id={`gw${k}`} />)}
        </div>
      )}
      {f.rows?.map((row, k) => (
        <Chips key={k} label={row.label} seq={seq} chips={row.chips.map((c, i) => ({ key: `${i}-${c.text}`, ...c }))} empty="—" />
      ))}
      {f.caption && <p className={styles.caption}>{f.caption}</p>}
    </div>
  );
}

const FIELDS = {
  flood: [{ name: 'image', label: 'image rows (colours 0–5), separated by ;', placeholder: 'e.g. 111; 110; 101' }, { name: 'sr', label: 'sr', placeholder: '1', short: true }, { name: 'sc', label: 'sc', placeholder: '1', short: true }, { name: 'color', label: 'color', placeholder: '2', short: true }],
  perimeter: [{ name: 'grid', label: 'grid rows (1 = land, one island)', placeholder: 'e.g. 0100; 1110; 0100; 1100' }],
  zeros: [{ name: 'grid', label: 'matrix rows (0s and 1s)', placeholder: 'e.g. 000; 010; 111' }],
  gates: [{ name: 'grid', label: 'rooms (G gate, . room, # wall)', placeholder: 'e.g. .#G.; ...#; .#.#; G#..' }],
  surrounded: [{ name: 'grid', label: 'board rows of X and O', placeholder: 'e.g. XXXX; XOOX; XXOX; XOXX' }],
  pacific: [{ name: 'grid', label: 'heights (one digit per cell)', placeholder: 'e.g. 12235; 32344; 24531' }],
  provinces: [{ name: 'grid', label: 'isConnected rows', placeholder: 'e.g. 110; 110; 001' }],
  judge: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'trust', label: 'trust (a>b: a trusts b)', placeholder: 'e.g. 1>3, 2>3, 4>3' }],
  clone: [{ name: 'adj', label: 'neighbours of node 1; node 2; …', placeholder: 'e.g. 2,4; 1,3; 2,4; 1,3' }],
  lock: [{ name: 'dead', label: 'dead ends (two wheels)', placeholder: 'e.g. 01, 10, 12' }, { name: 'target', label: 'target', placeholder: '22', short: true }],
  division: [{ name: 'eq', label: 'equations', placeholder: 'e.g. a/b=2, b/c=3' }, { name: 'queries', label: 'queries', placeholder: 'e.g. a/c, b/a, a/e' }],
  ladder: [{ name: 'begin', label: 'begin', placeholder: 'hit', short: true }, { name: 'end', label: 'end', placeholder: 'cog', short: true }, { name: 'words', label: 'wordList', placeholder: 'e.g. hot, dot, dog, lot, log, cog' }],
  itinerary: [{ name: 'tickets', label: 'tickets (FROM>TO)', placeholder: 'e.g. JFK>SFO, SFO>ATL, ATL>JFK' }],
};

const VALUES = {
  flood: (i) => ({ image: gridToText(i.image, '012345'), sr: String(i.sr), sc: String(i.sc), color: String(i.color) }),
  perimeter: (i) => ({ grid: gridToText(i.grid, '01') }),
  zeros: (i) => ({ grid: gridToText(i.mat, '01') }),
  gates: (i) => ({ grid: gridToText(i.rooms, 'G.#') }),
  surrounded: (i) => ({ grid: gridToText(i.board, 'XO') }),
  pacific: (i) => ({ grid: gridToText(i.h, '0123456789') }),
  provinces: (i) => ({ grid: gridToText(i.m, '01') }),
  judge: (i) => ({ n: String(i.n), trust: i.trust.map(([a, b]) => `${a}>${b}`).join(', ') }),
  clone: (i) => ({ adj: i.adj.map((l) => l.join(',')).join('; ') }),
  lock: (i) => ({ dead: i.dead.join(', '), target: i.target }),
  division: (i) => ({ eq: i.eq.map(([a, b, v]) => `${a}/${b}=${v}`).join(', '), queries: i.queries.map(([a, b]) => `${a}/${b}`).join(', ') }),
  ladder: (i) => ({ begin: i.begin, end: i.end, words: i.words.join(', ') }),
  itinerary: (i) => ({ tickets: i.tickets.map(([a, b]) => `${a}>${b}`).join(', ') }),
};

const RULE = {
  flood: 'Paint a cell only if it still has the old colour; painting marks it as done.',
  perimeter: 'Each land cell adds its sides that face water or the edge.',
  judge: 'Trusting someone: −1. Being trusted: +1. The judge alone can reach n − 1.',
  provinces: 'Each DFS from an unreached city finds one whole province.',
  clone: 'Put the copy in the map before visiting neighbours; reuse copies from the map.',
  zeros: 'Start from every 0 at once; a cell\'s ring number is its distance.',
  gates: 'Start from every gate at once; rooms are written once, by the nearest gate.',
  surrounded: 'Mark everything reachable from a border O; flip the O\'s left over.',
  pacific: 'Climb from each ocean\'s edge to cells not lower; keep cells both reach.',
  lock: 'Each combination is a node with 4 neighbours here (8 with four wheels); BFS from 00.',
  division: 'a / b = v is an edge of weight v (1 / v backwards); multiply along a path.',
  ladder: 'BFS over words; neighbours come from changing one letter.',
  itinerary: 'Take the smallest ticket; when stuck, the airport goes to the front of the route.',
};

const LEGEND = {
  flood: [[<Key shape="box">1</Key>, 'colour number'], [<Key shape="box" tone="warn">▢</Key>, 'painted (ringed)']],
  perimeter: [[<Key shape="box" tone="warn">3</Key>, 'land: sides facing water'], [<Key shape="box" tone="note"> </Key>, 'water']],
  judge: [[<Key shape="box">2</Key>, 'score'], [<Key tone="accent">→</Key>, 'trusts']],
  provinces: [[<Key shape="box" tone="accent">P1</Key>, 'its province'], [<Key shape="box" tone="warn">2</Key>, 'visiting']],
  clone: [[<Key shape="box" tone="success">1</Key>, 'copied'], [<Key shape="box" tone="accent">{"1'"}</Key>, 'its copy'], [<Key shape="dashed">{"3'"}</Key>, 'not made yet']],
  zeros: [[<Key shape="box">0</Key>, 'a zero: distance 0'], [<Key shape="box" tone="accent">2</Key>, 'reached: distance'], [<Key shape="box">?</Key>, 'not reached yet']],
  gates: [[<Key shape="box" tone="success">G</Key>, 'gate'], [<Key shape="box">#</Key>, 'wall'], [<Key shape="box" tone="accent">2</Key>, 'steps to a gate']],
  surrounded: [[<Key shape="box" tone="warn">O</Key>, 'not marked'], [<Key shape="box" tone="success">O</Key>, 'safe (reaches the border)'], [<Key shape="box" tone="danger">X</Key>, 'captured']],
  pacific: [[<Key shape="box" tone="accent">3</Key>, 'reaches the Pacific'], [<Key shape="box" tone="note">3</Key>, 'reaches the Atlantic'], [<Key shape="box" tone="success">5</Key>, 'both']],
  lock: [[<Key shape="box">✕</Key>, 'dead end'], [<Key shape="box" tone="accent">3</Key>, 'moves from 00'], [<Key shape="dashed">22</Key>, 'target']],
  division: [[<Key shape="box">6</Key>, 'start / this node'], [<Key tone="accent">→</Key>, 'path used']],
  ladder: [[<Key shape="box" tone="accent">hot</Key>, 'expanding'], [<Key shape="box" tone="warn">dot</Key>, 'just found']],
  itinerary: [[<Key tone="accent">→</Key>, 'ticket used'], [<Key shape="box">2</Key>, 'tickets left there']],
};

const spec = {
  title: 'Graph traversal, step by step',
  examples: GRAPH_WALK,
  simulate: graphWalk,
  code: (input) => graphWalkCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], paint: ['Paint', 'accent'], count: ['Count', 'accent'], pair: ['Trust', 'accent'], found: ['Found', 'success'],
    visit: ['Visit', 'accent'], make: ['Copy', 'success'], reuse: ['Reuse', 'interview'], wire: ['Wire', 'accent'], ring: ['Next ring', 'accent'],
    safe: ['Safe', 'success'], flip: ['Capture', 'danger'], pac: ['Pacific', 'accent'], atl: ['Atlantic', 'note'], ask: ['Query', 'interview'],
    step: ['Step', 'accent'], hit: ['Answer', 'success'], miss: ['−1', 'danger'], expand: ['Expand', 'accent'], go: ['Fly', 'accent'], stuck: ['Stuck', 'interview'],
    done: ['Answer', 'success'],
  },
  describe: (input) => ({
    flood: () => `${input.image.length} × ${input.image[0].length} image, start (${input.sr}, ${input.sc}), colour ${input.color}`,
    perimeter: () => `${input.grid.length} × ${input.grid[0].length} grid`,
    judge: () => `n = ${input.n}, trust = ${input.trust.map(([a, b]) => `${a}→${b}`).join(', ') || 'none'}`,
    provinces: () => `${input.m.length} cities`,
    clone: () => `${input.adj.length} nodes`,
    zeros: () => `${input.mat.length} × ${input.mat[0].length} matrix`,
    gates: () => `${input.rooms.length} × ${input.rooms[0].length} rooms`,
    surrounded: () => `${input.board.length} × ${input.board[0].length} board`,
    pacific: () => `${input.h.length} × ${input.h[0].length} heights`,
    lock: () => `two wheels, target ${input.target}, dead ${input.dead.join(' ') || 'none'}`,
    division: () => `${input.eq.map(([a, b, v]) => `${a}/${b}=${v}`).join(', ')}`,
    ladder: () => `${input.begin} → ${input.end}`,
    itinerary: () => `${input.tickets.length} tickets`,
  })[input.mode](),
  rule: (input) => RULE[input.mode],
  stats: () => [],
  legend: (f, input) => LEGEND[input.mode],
  fields: (input) => FIELDS[input.mode],
  values: (input) => VALUES[input.mode](input),
  parse: parseGraphWalk,
  random: (input) => randomGraphWalk(input),
  hint: (input) => (['judge', 'clone', 'division', 'ladder', 'itinerary', 'lock'].includes(input.mode) ? 'Keep it small so it fits: up to about 7 nodes.' : 'Up to 6 rows of up to 7 cells.'),
  delay: () => 2200,
  Stage: GraphWalkStage,
};

export function GraphWalkViz(props) {
  return <StepViz spec={spec} {...props} />;
}

// ---------------------------------------------------------------- topological sort problems (same stage)

const pairs = (ps, sep = '>') => ps.map(([a, b]) => `${a}${sep}${b}`).join(', ');

const TOPO_FIELDS = {
  reach: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'pre', label: 'prerequisites (a>b: a before b)', placeholder: 'e.g. 0>1, 1>2' }, { name: 'queries', label: 'queries (u>v)', placeholder: 'e.g. 0>2, 2>0' }],
  mht: [{ name: 'n', label: 'n', placeholder: '6', short: true }, { name: 'edges', label: 'edges', placeholder: 'e.g. 3-0, 3-1, 3-2, 3-4, 5-4' }],
  safe: [{ name: 'graph', label: 'graph[i] (lists separated by ;)', placeholder: 'e.g. 1,2; 2,3; 5; 0; 5; ; ' }],
  recipes: [{ name: 'recipes', label: 'recipe: ingredients; …', placeholder: 'e.g. bread: yeast, flour; sandwich: bread, meat' }, { name: 'supplies', label: 'supplies', placeholder: 'e.g. yeast, flour, meat' }],
  alien: [{ name: 'words', label: 'words (sorted in the alien order)', placeholder: 'e.g. wrt, wrf, er, ett, rftt' }],
  groups: [{ name: 'm', label: 'm', placeholder: '2', short: true }, { name: 'group', label: 'group', placeholder: 'e.g. -1, -1, 1, 0, 0, 1, 0, -1' }, { name: 'before', label: 'beforeItems (lists separated by ;)', placeholder: 'e.g. ; 6; 5; 6; 3,6; ; ; ' }],
  matrix: [{ name: 'k', label: 'k', placeholder: '3', short: true }, { name: 'rows', label: 'rowConditions (above>below)', placeholder: 'e.g. 1>2, 3>2' }, { name: 'cols', label: 'colConditions (left>right)', placeholder: 'e.g. 2>1, 3>2' }],
};

const TOPO_VALUES = {
  reach: (i) => ({ n: String(i.n), pre: pairs(i.pre), queries: pairs(i.queries) }),
  mht: (i) => ({ n: String(i.n), edges: pairs(i.edges, '-') }),
  safe: (i) => ({ graph: i.graph.map((l) => l.join(',')).join('; ') }),
  recipes: (i) => ({ recipes: i.recipes.map((r, k) => `${r}: ${i.ingredients[k].join(', ')}`).join('; '), supplies: i.supplies.join(', ') }),
  alien: (i) => ({ words: i.words.join(', ') }),
  groups: (i) => ({ m: String(i.m), group: i.group.join(', '), before: i.before.map((l) => l.join(',')).join('; ') }),
  matrix: (i) => ({ k: String(i.k), rows: pairs(i.rows), cols: pairs(i.cols) }),
};

const TOPO_RULE = {
  reach: 'Let each course in turn be a middle step: i before k and k before j means i before j.',
  mht: 'Remove every leaf at once, again and again; the last 1 or 2 nodes are the centre.',
  safe: 'Terminal nodes are safe; a node is safe once every out-edge leads to a safe node.',
  recipes: 'Each available item takes one off the missing count of the recipes using it.',
  alien: 'First differing letter of neighbouring words → a rule; then a topological sort.',
  groups: 'Sort the groups, sort the items, then output each group\'s items in item order.',
  matrix: 'Rows and columns are independent: one topological sort each.',
};

const TOPO_LEGEND = {
  reach: [[<Key shape="box" tone="accent">✓</Key>, 'row comes before column'], [<Key shape="box" tone="warn">2</Key>, 'middle course now']],
  mht: [[<Key shape="box">2</Key>, 'degree'], [<Key shape="box" tone="danger">5</Key>, 'leaves to remove'], [<Key shape="box" tone="success">3</Key>, 'centre']],
  safe: [[<Key shape="box">1</Key>, 'out-edges still unknown'], [<Key shape="box" tone="success">5</Key>, 'safe'], [<Key shape="box" tone="danger">0</Key>, 'can reach a cycle']],
  recipes: [[<Key shape="box" tone="accent">egg</Key>, 'supply'], [<Key shape="box">1</Key>, 'missing ingredients'], [<Key shape="box" tone="success">tea</Key>, 'cooked']],
  alien: [[<Key tone="accent">→</Key>, 'comes before'], [<Key shape="box">1</Key>, 'rules into it'], [<Key shape="box" tone="success">#1</Key>, 'position']],
  groups: [[<Key shape="box" tone="accent">G0</Key>, 'colour = group'], [<Key tone="accent">→</Key>, 'between groups']],
  matrix: [[<Key shape="box" tone="accent">2</Key>, 'placed']],
};

const topoSpec = {
  title: 'Topological sort problems, step by step',
  examples: TOPO_WALK,
  simulate: topoWalk,
  code: (input) => topoWalkCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], mid: ['Middle', 'accent'], leaves: ['Leaves', 'interview'], trim: ['Trim', 'accent'], init: ['Start', 'interview'],
    peel: ['Peel', 'accent'], use: ['Use', 'accent'], make: ['Cook', 'success'], pair: ['Compare', 'accent'], kahn: ['Sort', 'interview'],
    take: ['Take', 'success'], fail: ['Impossible', 'danger'], edges: ['Rules', 'accent'], gsort: ['Groups', 'interview'], isort: ['Items', 'interview'],
    place: ['Place', 'success'], rsort: ['Rows', 'interview'], csort: ['Columns', 'interview'], done: ['Answer', 'success'],
  },
  describe: (input) => ({
    reach: () => `${input.n} courses, ${input.queries.length} queries`,
    mht: () => `${input.n} nodes`,
    safe: () => `${input.graph.length} nodes`,
    recipes: () => `${input.recipes.length} recipes`,
    alien: () => input.words.join(', '),
    groups: () => `${input.n} items, ${input.m} groups`,
    matrix: () => `k = ${input.k}`,
  })[input.mode](),
  rule: (input) => TOPO_RULE[input.mode],
  stats: () => [],
  legend: (f, input) => TOPO_LEGEND[input.mode],
  fields: (input) => TOPO_FIELDS[input.mode],
  values: (input) => TOPO_VALUES[input.mode](input),
  parse: parseTopoWalk,
  random: (input) => randomTopoWalk(input),
  hint: () => 'Keep it small so it fits: up to about 8 nodes.',
  delay: () => 2400,
  Stage: GraphWalkStage,
};

export function TopoWalkViz(props) {
  return <StepViz spec={topoSpec} {...props} />;
}

// ---------------------------------------------------------------- union-find problems (same stage, plus the forest)

const UF_FIELDS = {
  path: [{ name: 'n', label: 'n', placeholder: '6', short: true }, { name: 'edges', label: 'edges', placeholder: 'e.g. 0-1, 0-2, 3-5' }, { name: 'source', label: 'source', placeholder: '0', short: true }, { name: 'dest', label: 'destination', placeholder: '5', short: true }],
  components: [{ name: 'n', label: 'n', placeholder: '5', short: true }, { name: 'edges', label: 'edges', placeholder: 'e.g. 0-1, 1-2, 3-4' }],
  tree: [{ name: 'n', label: 'n', placeholder: '5', short: true }, { name: 'edges', label: 'edges', placeholder: 'e.g. 0-1, 0-2, 0-3, 1-4' }],
  equations: [{ name: 'eqs', label: 'equations', placeholder: 'e.g. a==b, b!=c, c==a' }],
  swaps: [{ name: 's', label: 's', placeholder: 'dcab', short: true }, { name: 'pairs', label: 'pairs', placeholder: 'e.g. 0-3, 1-2' }],
  accounts: [{ name: 'accounts', label: 'name emails…; name emails…', placeholder: 'e.g. John js@m jny@m; John js@m j00@m; Mary mary@m' }],
  mincost: [{ name: 'points', label: 'points (x,y; x,y …)', placeholder: 'e.g. 0,0; 2,2; 3,10; 5,2; 7,0' }],
  slashes: [{ name: 'grid', label: 'rows separated by ; (. = space, b = backslash)', placeholder: 'e.g. ./; /.' }],
  factor: [{ name: 'nums', label: 'nums (distinct)', placeholder: 'e.g. 4, 6, 15, 35' }],
  gcd: [{ name: 'nums', label: 'nums', placeholder: 'e.g. 2, 3, 6' }],
  critical: [{ name: 'n', label: 'n', placeholder: '5', short: true }, { name: 'edges', label: 'edges a-b:weight', placeholder: 'e.g. 0-1:1, 1-2:1, 2-3:2' }],
};

const UF_VALUES = {
  path: (i) => ({ n: String(i.n), edges: i.edges.map((e) => e.join('-')).join(', '), source: String(i.source), dest: String(i.dest) }),
  components: (i) => ({ n: String(i.n), edges: i.edges.map((e) => e.join('-')).join(', ') }),
  tree: (i) => ({ n: String(i.n), edges: i.edges.map((e) => e.join('-')).join(', ') }),
  equations: (i) => ({ eqs: i.eqs.join(', ') }),
  swaps: (i) => ({ s: i.s, pairs: i.pairs.map((e) => e.join('-')).join(', ') }),
  accounts: (i) => ({ accounts: i.accounts.map((a) => a.join(' ')).join('; ') }),
  mincost: (i) => ({ points: i.points.map((p) => p.join(',')).join('; ') }),
  slashes: (i) => ({ grid: i.grid.map((r) => r.replace(/ /g, '.').replace(/\\/g, 'b')).join('; ') }),
  factor: (i) => ({ nums: i.nums.join(', ') }),
  gcd: (i) => ({ nums: i.nums.join(', ') }),
  critical: (i) => ({ n: String(i.n), edges: i.edges.map(([a, b, w]) => `${a}-${b}:${w}`).join(', ') }),
};

const UF_RULE = {
  path: 'Union both ends of every edge; connected = same root.',
  components: 'Start with n; every union that merges two roots removes one component.',
  tree: 'Exactly n − 1 edges, and no edge whose ends already share a root.',
  equations: 'All == first (union), then every != must span two roots.',
  swaps: 'Indices that can swap form groups; sort the letters inside each group.',
  accounts: 'A shared email unions two accounts; each root is one person.',
  mincost: 'Cheapest edge first; take it only if its ends have different roots.',
  slashes: 'Scale ×3, slashes block pixels; count connected free areas.',
  factor: 'Union each number with its prime factors; count numbers per root.',
  gcd: 'Union each index with its value\'s primes; all one root → true.',
  critical: 'Without it heavier → critical; forced in and still minimal → pseudo-critical.',
};

const ufSpec = {
  title: 'Union-Find problems, step by step',
  examples: UF_WALK,
  simulate: ufWalk,
  code: (input) => ufWalkCode(input.mode),
  kinds: {
    start: ['Start', 'neutral'], union: ['Union', 'accent'], same: ['Same root', 'warn'], own: ['New owner', 'neutral'], fail: ['Impossible', 'danger'], check: ['Check', 'accent'],
    sort: ['Sort group', 'success'], take: ['Take', 'success'], skip: ['Skip', 'warn'], region: ['Region', 'accent'], crit: ['Critical', 'danger'],
    pseudo: ['Pseudo', 'warn'], neither: ['Neither', 'neutral'], done: ['Answer', 'success'],
  },
  describe: (input) => ({
    path: () => `n = ${input.n}, ${input.source} → ${input.dest}`,
    components: () => `n = ${input.n}, ${input.edges.length} edges`,
    tree: () => `n = ${input.n}, ${input.edges.length} edges`,
    equations: () => input.eqs.join(', '),
    swaps: () => `"${input.s}"`,
    accounts: () => `${input.accounts.length} accounts`,
    mincost: () => `${input.points.length} points`,
    slashes: () => `${input.grid.length} × ${input.grid.length} grid`,
    factor: () => input.nums.join(', '),
    gcd: () => input.nums.join(', '),
    critical: () => `n = ${input.n}, ${input.edges.length} edges`,
  })[input.mode](),
  rule: (input) => UF_RULE[input.mode],
  stats: () => [],
  legend: (f, input) => (input.mode === 'mincost' || input.mode === 'critical'
    ? [[<Key tone="success">—</Key>, input.mode === 'mincost' ? 'edges taken' : 'tree of this run'], [<Key tone="danger">—</Key>, input.mode === 'mincost' ? 'skipped: would close a cycle' : 'the edge being tested']]
    : input.mode === 'slashes'
      ? [[<Key shape="box">■</Key>, 'slash pixel'], [<Key shape="box" tone="accent">1</Key>, 'region number']]
      : [[<Key shape="box" tone="accent">0</Key>, 'root (badge = group size)'], [<Key shape="box" tone="warn">3</Key>, 'involved now'], [<Key>→</Key>, 'points to its parent']]),
  fields: (input) => UF_FIELDS[input.mode],
  values: (input) => UF_VALUES[input.mode](input),
  parse: parseUfWalk,
  random: (input) => randomUfWalk(input),
  hint: (input) => (input.mode === 'slashes' ? 'Up to 4 × 4 cells.' : 'Keep it small so it fits: up to about 8 nodes.'),
  delay: () => 2400,
  Stage: GraphWalkStage,
};

export function UfWalkViz(props) {
  return <StepViz spec={ufSpec} {...props} />;
}

// ---------------------------------------------------------------- shortest-path problems (same stage)

const SP_FIELDS = {
  delay: [{ name: 'n', label: 'n', placeholder: '5', short: true }, { name: 'edges', label: 'times (u>v:w)', placeholder: 'e.g. 1>2:2, 1>3:6, 2>3:3' }, { name: 'k', label: 'k', placeholder: '1', short: true }],
  flights: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'edges', label: 'flights (a>b:price)', placeholder: 'e.g. 0>1:100, 1>3:600' }, { name: 'src', label: 'src', placeholder: '0', short: true }, { name: 'dst', label: 'dst', placeholder: '3', short: true }, { name: 'k', label: 'k', placeholder: '1', short: true }],
  prob: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'edges', label: 'edges (a-b:prob)', placeholder: 'e.g. 0-1:0.5, 1-2:0.5, 0-2:0.2' }, { name: 'start', label: 'start', placeholder: '0', short: true }, { name: 'end', label: 'end', placeholder: '2', short: true }],
  city: [{ name: 'n', label: 'n', placeholder: '4', short: true }, { name: 'edges', label: 'roads (a-b:length)', placeholder: 'e.g. 0-1:3, 1-2:1, 1-3:4, 2-3:1' }, { name: 'threshold', label: 'threshold', placeholder: '4', short: true }],
  effort: [{ name: 'grid', label: 'heights (rows separated by ;)', placeholder: 'e.g. 1 2 2; 3 8 2; 5 3 5' }],
  swim: [{ name: 'grid', label: 'heights 0..n²−1 (rows separated by ;)', placeholder: 'e.g. 0 2; 1 3' }],
  obstacles: [{ name: 'grid', label: 'grid of 0 and 1 (rows separated by ;)', placeholder: 'e.g. 0 1 1; 1 1 0; 1 1 0' }],
  signs: [{ name: 'grid', label: 'signs 1→ 2← 3↓ 4↑ (rows separated by ;)', placeholder: 'e.g. 1 1 3; 3 2 2; 1 1 4' }],
};
const tri = (es, sep = '>') => es.map(([a, b, w]) => `${a}${sep}${b}:${w}`).join(', ');
const SP_VALUES = {
  delay: (i) => ({ n: String(i.n), edges: tri(i.times), k: String(i.k) }),
  flights: (i) => ({ n: String(i.n), edges: tri(i.flights), src: String(i.src), dst: String(i.dst), k: String(i.k) }),
  prob: (i) => ({ n: String(i.n), edges: tri(i.edges, '-'), start: String(i.start), end: String(i.end) }),
  city: (i) => ({ n: String(i.n), edges: tri(i.edges, '-'), threshold: String(i.threshold) }),
  effort: (i) => ({ grid: i.grid.map((r) => r.join(' ')).join('; ') }),
  swim: (i) => ({ grid: i.grid.map((r) => r.join(' ')).join('; ') }),
  obstacles: (i) => ({ grid: i.grid.map((r) => r.join(' ')).join('; ') }),
  signs: (i) => ({ grid: i.grid.map((r) => r.join(' ')).join('; ') }),
};
const SP_RULE = {
  delay: 'Settle the closest unsettled node; its time is final. Relax its edges.',
  flights: 'Round r = routes with ≤ r flights; each round reads a copy of the last.',
  prob: 'Settle the most likely node first; multiplying by ≤ 1 never helps later.',
  city: 'Each city in turn may be a middle stop: i → k → j.',
  effort: 'A route costs its biggest step; expand the smallest cost first.',
  swim: 'A route costs its highest cell; expand the smallest cost first.',
  obstacles: 'Empty: +0, push front. Obstacle: +1, push back.',
  signs: 'Follow the sign: +0, push front. Any other way: +1, push back.',
};

const spSpec = {
  title: 'Shortest-path problems, step by step',
  examples: SP_WALK,
  simulate: spWalk,
  code: (input) => spWalkCode(input.mode),
  kinds: { start: ['Start', 'neutral'], settle: ['Settle', 'success'], stale: ['Stale', 'warn'], round: ['Round', 'accent'], found: ['Reached', 'success'], mid: ['Middle', 'accent'], done: ['Answer', 'success'] },
  describe: (input) => ({
    delay: () => `n = ${input.n}, from ${input.k}`,
    flights: () => `${input.src} → ${input.dst}, k = ${input.k}`,
    prob: () => `${input.start} → ${input.end}`,
    city: () => `n = ${input.n}, threshold ${input.threshold}`,
  }[input.mode] ?? (() => `${input.grid.length} × ${input.grid[0].length} grid`))(),
  rule: (input) => SP_RULE[input.mode],
  stats: () => [],
  legend: (f, input) => (input.grid
    ? [[<Key shape="box" tone="accent">2</Key>, 'final (corner badge = cost)'], [<Key shape="dashed">5</Key>, 'the target']]
    : [[<Key shape="box" tone="success">3</Key>, 'final'], [<Key shape="box">4</Key>, 'badge = best so far']]),
  fields: (input) => SP_FIELDS[input.mode],
  values: (input) => SP_VALUES[input.mode](input),
  parse: parseSpWalk,
  random: (input) => randomSpWalk(input),
  hint: (input) => (input.grid ? 'Up to 5 × 6 cells.' : 'Up to 7 nodes and 10 edges.'),
  delay: () => 2400,
  Stage: GraphWalkStage,
};

export function SpWalkViz(props) {
  return <StepViz spec={spSpec} {...props} />;
}
