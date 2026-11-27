/**
 * <QuadWalkViz>: Construct Quad Tree (Practice thinking). Built with walkKit.
 *   quad   all one value → a leaf; mixed → four quarters, recursively (top-left, top-right, bottom-left, bottom-right)
 * The answer is the list of leaves as [row, col, size, value], in the order the recursion makes them.
 */
import { plural } from './util.js';
import { P, makeWalk } from './walkKit.js';

const QUAD = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const MODES = {
  quad: {
    hint: 'A 1 × 1, 2 × 2 or 4 × 4 grid of 0s and 1s, rows separated by ";".',
    code: [['same', 'build(r, c, size): if every cell in the square has the same value → leaf(value)'], ['split', 'else: half = size / 2;  node(build TL, build TR, build BL, build BR)'], ['ret', 'return build(0, 0, n);']],
    fields: [{ name: 'g', label: 'grid', type: 'matrix', placeholder: '1, 1, 0, 0; 1, 1, 0, 0; 0, 0, 0, 0; 0, 1, 0, 0', rows: [1, 4], cols: [1, 4], min: 0, max: 1 }],
    valid: ({ g }) => (![1, 2, 4].includes(g.length) || g[0].length !== g.length ? 'the grid must be square: 1 × 1, 2 × 2 or 4 × 4.' : ''),
    random: (gen) => { const n = gen.pick([1, 2, 4, 4]); const base = gen.int(0, 1); return { g: Array.from({ length: n }, () => Array.from({ length: n }, () => (gen.bool(0.25) ? 1 - base : base))) }; },
    brute: ({ g }) => {
      // bottom-up: start from single cells and merge four equal leaves into one
      let level = g.map((row, r) => row.map((v, c) => ({ leaf: true, v, r, c, size: 1 })));
      while (level.length > 1) {
        const next = [];
        for (let r = 0; r < level.length; r += 2) { const row = []; for (let c = 0; c < level.length; c += 2) { const q = [level[r][c], level[r][c + 1], level[r + 1][c], level[r + 1][c + 1]]; row.push(q.every((x) => x.leaf && x.v === q[0].v) ? { leaf: true, v: q[0].v, r: q[0].r, c: q[0].c, size: q[0].size * 2 } : { leaf: false, kids: q }); } next.push(row); }
        level = next;
      }
      const out = [];
      const walk = (x) => { if (x.leaf) out.push([x.r, x.c, x.size, x.v]); else x.kids.forEach(walk); };
      walk(level[0][0]);
      return out;
    },
    describe: ({ g }) => `${g.length} × ${g.length} grid`,
    rule: 'uniform → leaf; mixed → four quarters',
    run({ g }, snap) {
      const n = g.length, leaves = [];
      let nodes = 0;
      const owner = g.map((row) => row.map(() => null));
      const cells = (r0, c0, size, tone) => P.grid('grid', g.map((row, r) => row.map((v, c) => ({ l: String(v), c: [r >= r0 && r < r0 + size && c >= c0 && c < c0 + size ? tone : owner[r][c] !== null ? 'safe' : ''] }))));
      snap({ kind: 'start', lines: ['ret'], parts: [cells(0, 0, n, 'land')], title: `Build from the whole ${n} × ${n} grid`, text: 'A square whose cells all hold the same value becomes a single leaf. Otherwise it becomes an inner node with four children: its four quarters, built the same way. Each call only looks at its own square.', calc: [`n = ${n}`] });
      const build = (r, c, size, name) => {
        nodes++;
        let same = true;
        for (let i = r; i < r + size && same; i++) for (let j = c; j < c + size; j++) if (g[i][j] !== g[r][c]) { same = false; break; }
        if (same) {
          leaves.push([r, c, size, g[r][c]]);
          for (let i = r; i < r + size; i++) for (let j = c; j < c + size; j++) owner[i][j] = leaves.length;
          snap({ kind: 'keep', lines: ['same'], parts: [cells(r, c, size, 'safe')], title: `${name}: all ${g[r][c]} → leaf`, text: `Every cell of the ${size} × ${size} square at (${r}, ${c}) is ${g[r][c]}, so it is one leaf with value ${g[r][c]}${size > 1 ? `, however many cells it covers` : ''}.`, calc: [`${plural(leaves.length, 'leaf', 'leaves')}`] });
          return;
        }
        const h = size / 2;
        snap({ kind: 'split', lines: ['split'], parts: [cells(r, c, size, 'land')], title: `${name}: mixed → split into four ${h} × ${h}`, text: `The ${size} × ${size} square at (${r}, ${c}) holds both 0s and 1s, so it becomes an inner node. Build its quarters in order: top-left, top-right, bottom-left, bottom-right.`, calc: [`${nodes} nodes so far`] });
        [[r, c], [r, c + h], [r + h, c], [r + h, c + h]].forEach(([rr, cc], k) => build(rr, cc, h, `${QUAD[k]} of (${r}, ${c})`));
      };
      build(0, 0, n, 'whole grid');
      snap({ kind: 'done', lines: ['ret'], parts: [cells(0, 0, 0, '')], out: leaves, answer: `${plural(nodes, 'node')}, ${plural(leaves.length, 'leaf', 'leaves')}`, title: `${plural(nodes, 'node')}: ${plural(leaves.length, 'leaf', 'leaves')}`, text: 'Each level of the recursion scans its squares once: O(n² log n) in the worst case. Uniform areas stop early, which is what makes the tree small.', calc: [`${nodes} nodes`] });
    },
  },
};

const EXAMPLES = {
  quad: { label: 'the 4 × 4 example', input: { mode: 'quad', g: [[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 1, 0, 0]] } },
  quadSame: { label: 'all zeros', input: { mode: 'quad', g: [[0, 0], [0, 0]] } },
};

export const quadWalk = makeWalk(MODES, EXAMPLES);
