import { StepViz, Key } from './StepViz';
import { Chips } from './prims';
import { Arrow, ArrowDefs, GridCells } from './GraphsViz';
import styles from './GraphsViz.module.css';
import { GRAPH_WALK, graphWalk, graphWalkCode, gridToText, parseGraphWalk, randomGraphWalk } from './models/graphWalk';

/**
 * <GraphWalkViz /> — the graph traversal lesson's problems, one engine. A frame can show a grid of cells,
 * one or two graphs drawn on a circle, and rows of chips (queues, stacks, maps, answers).
 */

function Graph({ g, width, id }) {
  const W = Math.max(240, Math.min(width, 480));
  const n = g.nodes.length;
  const H = n <= 2 ? 120 : Math.min(250, Math.max(170, W * 0.55));
  const pos = Object.fromEntries(g.nodes.map((v, k) => {
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
              return <g key={k} className={`${styles.edge} ${styles.undirected} ${styles[`edge_${tone}`]}`}><path d={`M${a.x},${a.y} L${b.x},${b.y}`} /></g>;
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
          <div key={v.id} className={[styles.node, ...(v.c ?? []).filter(Boolean).map((c) => styles[c])].filter(Boolean).join(' ')} style={{ left: pos[v.id].x, top: pos[v.id].y, fontSize: v.l.length > 2 ? 11 : 13 }}>
            {v.l}
            {v.badge !== undefined && <i key={v.badge} className={styles.deg}>{v.badge}</i>}
          </div>
        ))}
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
          cell={(r, c) => ({ cls: f.grid[r][c].c.filter(Boolean), label: f.grid[r][c].l, pop: f.grid[r][c].c.includes('cellNew'), key: f.grid[r][c].c.includes('cellNew') ? `n${seq}` : 'v' })}
        />
      )}
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
