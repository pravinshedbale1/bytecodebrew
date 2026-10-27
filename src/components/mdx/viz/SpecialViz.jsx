import { StepViz, Key } from './StepViz';
import { Arcs, ArrayStrip, Chips, Float, RowLabel, Stage, pitchFor } from './prims';
import styles from './SpecialViz.module.css';
import {
  BITS, BIT_WIDTH, GREEDY, TRIE, bits, bitsCode, greedy, greedyCode, parseBits, parseGreedy, parseTrie, randomBits, randomGreedy, randomTrie, toBits,
  trie, trieCode, trieQueriesText,
} from './models/special';

/**
 * Step-throughs for the Greedy, Tries and Bit Manipulation lessons:
 *   <GreedyViz />   jump game (the furthest reach), fewest jumps (rings), gas station (a resetting tank), partition labels
 *   <TrieViz />     a trie built word by word, then searches walking down it (wildcards branch)
 *   <BitsViz />     binary rows: n & (n − 1) clears the lowest bit; XOR cancels pairs
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- greedy

const RING_TONES = ['accent', 'warn', 'muted'];

function GreedyStage({ step: f, input, width, jump }) {
  if (f.mode === 'gas') {
    const n = f.gas.length;
    const pitch = pitchFor(width - 50, n, 36, 58);
    const W = 50 + n * pitch;
    const failed = f.failedFrom !== null && f.failedFrom !== undefined ? [f.failedFrom, f.i] : null;
    const row = (items, y, label, cls) => (
      <>
        <RowLabel x={0} y={y + 14}>{label}</RowLabel>
        <ArrayStrip items={items} x0={50} y={y} pitch={pitch} h={34} index={false} cls={cls} />
      </>
    );
    return (
      <Stage width={W} height={196} jump={jump} label="gas stations">
        {f.i !== null && <Float x={50 + f.i * pitch + pitch / 2} y={0} tone={f.kind === 'reset' ? 'danger' : 'accent'}>{`tank ${f.kind === 'reset' ? 'reset to 0' : f.tank}`}</Float>}
        {row(f.gas, 24, 'gas', (k) => (k === f.i ? 'cur' : f.i !== null && k > f.i ? 'dim' : ''))}
        {row(f.cost, 64, 'cost', (k) => (k === f.i ? 'cur' : f.i !== null && k > f.i ? 'dim' : ''))}
        {row(f.diff.map((d) => (d > 0 ? `+${d}` : d)), 104, 'net', (k) => [k === f.i && 'cur', failed && k >= failed[0] && k <= failed[1] && 'bad', f.kind === 'done' && k === f.start && f.total >= 0 && 'hit', f.i !== null && k > f.i && 'dim'].filter(Boolean).join(' '))}
        <span className={styles.startTag} style={{ left: 50 + Math.min(f.start, n - 1) * pitch + pitch / 2, top: 146 }}>{f.start < n ? `start = ${f.start}` : 'no start yet'}</span>
      </Stage>
    );
  }
  if (f.mode === 'labels') {
    const n = f.chars.length;
    const pitch = pitchFor(width, n, 22, 44);
    const cur = f.i !== null ? f.chars[f.i] : null;
    const bands = [
      ...f.parts.map(([a, b], k) => ({ from: a, to: b, tone: k % 2 ? 'note' : 'success', label: String(b - a + 1) })),
      ...(f.i !== null && !(f.parts.length && f.parts.at(-1)[1] >= f.i) ? [{ from: f.start, to: f.end, tone: 'accent', label: `until ${f.end}` }] : []),
    ];
    const tags = {};
    if (f.i !== null) { tags[f.i] = [{ label: 'i', tone: 'accent' }]; if (f.last[cur] !== f.i) tags[f.last[cur]] = [{ label: `last ${cur}`, tone: 'warn' }]; }
    return (
      <Stage width={n * pitch} height={130} jump={jump} label="string">
        <ArrayStrip items={f.chars} y={30} pitch={pitch} h={40} bands={bands} tags={tags} cls={(k) => (f.i !== null && k > f.end ? 'dim' : k === f.i ? 'cur' : '')} />
      </Stage>
    );
  }
  const n = f.a.length;
  const pitch = pitchFor(width, n, 40, 64);
  const W = n * pitch;
  const cx = (k) => k * pitch + pitch / 2;
  const bands = f.mode === 'jump'
    ? [{ from: 0, to: Math.min(n - 1, f.furthest), tone: f.kind === 'stuck' ? 'danger' : 'accent', label: `reachable: 0–${Math.min(n - 1, f.furthest)}` }]
    : [{ from: 0, to: 0, tone: 'success', label: '0' }, ...f.bands.map(([a, b, k]) => ({ from: a, to: b, tone: RING_TONES[(k - 1) % 3], label: `${k} jump${k === 1 ? '' : 's'}` }))];
  return (
    <Stage width={W} height={150} jump={jump} label="jumps">
      <Arcs id="gj" width={W} height={150} arcs={f.jump ? [{ x1: cx(f.jump[0]), x2: cx(f.jump[1]), y: 52, depth: -36, tone: 'accent', label: `+${f.a[f.jump[0]]}` }] : []} />
      <ArrayStrip
        items={f.a} y={58} pitch={pitch} bands={bands}
        cls={(k) => [k === f.i && (f.kind === 'stuck' ? 'bad' : 'cur'), k === n - 1 && 'target', f.kind === 'done' && k === n - 1 && 'hit'].filter(Boolean).join(' ')}
        tags={f.mode === 'jump2' && f.kind !== 'start' ? { [Math.min(n - 1, f.curEnd)]: [{ label: 'curEnd', tone: 'warn' }] } : {}}
      />
    </Stage>
  );
}

const greedySpec = {
  title: 'Greedy: one smart variable',
  examples: GREEDY,
  simulate: greedy,
  code: (input) => greedyCode(input.mode),
  kinds: { start: ['Start', 'neutral'], reach: ['Reach', 'accent'], stuck: ['Stuck', 'danger'], jump: ['Jump', 'warn'], add: ['Station', 'accent'], reset: ['Reset', 'danger'], extend: ['Extend', 'accent'], cut: ['Cut', 'success'], done: ['Answer', 'success'] },
  describe: (input) => (input.mode === 'gas' ? `gas ${list(input.gas)}, cost ${list(input.cost)}` : input.mode === 'labels' ? `s = "${input.s}"` : `a = ${list(input.a)}`),
  rule: (input) => ({
    jump: 'furthest = max(furthest, i + a[i]); stuck if i > furthest.',
    jump2: 'Each ring of reachable indexes costs one jump.',
    gas: 'Tank below 0 → nothing since the start works; start after it.',
    labels: 'Stretch the part to every letter\'s last occurrence; cut when you reach it.',
  })[input.mode],
  stats: (f) => (f.mode === 'gas' ? [['total', f.total], ['tank', f.tank]] : f.mode === 'labels' ? [['parts', f.parts.length]] : f.mode === 'jump2' ? [['jumps', f.jumps], ['furthest', f.furthest]] : [['furthest', f.furthest]]),
  legend: (f, input) => (input.mode === 'labels'
    ? [[<Key shape="box" tone="accent">a</Key>, 'current part'], [<Key shape="box" tone="success">9</Key>, 'finished part (size)']]
    : input.mode === 'gas'
      ? [[<Key shape="box" tone="danger">−2</Key>, 'stations ruled out as a start']]
      : [[<Key shape="box" tone="accent">2</Key>, input.mode === 'jump' ? 'reachable so far' : 'reachable with k jumps'], [<Key shape="box" tone="warn">4</Key>, 'the last index']]),
  fields: (input) => (input.mode === 'gas'
    ? [{ name: 'gas', label: 'gas', placeholder: '1, 2, 3, 4, 5' }, { name: 'cost', label: 'cost', placeholder: '3, 4, 5, 1, 2' }]
    : input.mode === 'labels' ? [{ name: 's', label: 'string', placeholder: 'ababcbacadefegde' }] : [{ name: 'a', label: 'jump lengths', placeholder: '2, 3, 1, 1, 4' }]),
  values: (input) => (input.mode === 'gas' ? { gas: input.gas.join(', '), cost: input.cost.join(', ') } : input.mode === 'labels' ? { s: input.s } : { a: input.a.join(', ') }),
  parse: parseGreedy,
  random: (input) => randomGreedy(input),
  hint: () => 'Small inputs: up to 10 numbers (0 to 9), or 16 letters.',
  delay: () => 2000,
  Stage: GreedyStage,
};

export function GreedyViz(props) {
  return <StepViz spec={greedySpec} {...props} />;
}

// ---------------------------------------------------------------- tries

function trieLayout(all, W) {
  const kids = {};
  Object.values(all).forEach((n) => { if (n.parent !== null) (kids[n.parent] ??= []).push(n.id); });
  Object.values(kids).forEach((k) => k.sort());
  const leaves = [];
  const walk = (id) => { if (!kids[id]?.length) leaves.push(id); (kids[id] ?? []).forEach(walk); };
  walk('');
  const slot = W / leaves.length;
  const pos = {};
  leaves.forEach((id, k) => { pos[id] = { x: (k + 0.5) * slot }; });
  const place = (id) => { if (pos[id]) return pos[id]; kids[id].forEach(place); pos[id] = { x: (pos[kids[id][0]].x + pos[kids[id].at(-1)].x) / 2 }; return pos[id]; };
  place('');
  Object.values(all).forEach((n) => { pos[n.id].y = 22 + n.id.length * 54; });
  const depth = Math.max(...Object.keys(all).map((id) => id.length));
  return { pos, height: 22 + depth * 54 + 34 };
}

function TrieStage({ step: f, width }) {
  const W = Math.max(280, Math.min(width, 560));
  const { pos, height } = trieLayout(f.all, W);
  const ids = Object.keys(f.nodes);
  const onPath = new Set(f.path);
  const fresh = new Set(f.fresh ?? []);
  const lastOnPath = f.path.at(-1);
  return (
    <div className={styles.wrap}>
      {f.query && <Float x={0} y={0} anchor="right" tone={f.kind === 'found' ? 'success' : 'danger'}>{f.query}</Float>}
      <div className={styles.tree} style={{ width: W, height }}>
        <svg className={styles.svg} width={W} height={height} aria-hidden="true">
          {ids.filter((id) => id !== '').map((id) => {
            const p = f.nodes[id].parent;
            return <line key={id} x1={pos[p].x} y1={pos[p].y} x2={pos[id].x} y2={pos[id].y} className={onPath.has(id) && onPath.has(p) ? styles.edgeOn : styles.edge} />;
          })}
        </svg>
        {ids.map((id) => {
          const n = f.nodes[id];
          return (
            <div
              key={id}
              className={[
                styles.tnode, id === '' && styles.root, n.end && styles.end, onPath.has(id) && styles.on, fresh.has(id) && styles.pop,
                f.hit === id && styles.hit, f.kind === 'missing' && id === lastOnPath && f.broke !== undefined && f.broke !== null && styles.broke,
              ].filter(Boolean).join(' ')}
              style={{ left: pos[id].x, top: pos[id].y }}
              title={id === '' ? 'root' : `"${id}"${n.end ? ' (a word)' : ''}, pass ${n.pass}`}
            >
              {id === '' ? '•' : n.letter}
              {id !== '' && n.pass > 0 && <i className={styles.pass}>{n.pass}</i>}
            </div>
          );
        })}
      </div>
      <p className={styles.caption}>ringed nodes end a word · small number = words passing through</p>
    </div>
  );
}

const trieSpec = {
  title: 'Tries: words that share a prefix share a path',
  examples: TRIE,
  simulate: trie,
  code: () => trieCode,
  kinds: { start: ['Start', 'neutral'], insert: ['Insert', 'accent'], found: ['Found', 'success'], missing: ['Not found', 'danger'], done: ['Answers', 'success'] },
  describe: (input) => `words ${list(input.words)}`,
  rule: () => 'Follow one edge per letter; a ring means a whole word ends here.',
  stats: (f) => [['nodes', Object.keys(f.nodes).length - 1]],
  legend: () => [[<Key shape="box" tone="accent">a</Key>, 'on the path'], [<Key shape="box" tone="success">t</Key>, 'end of a word'], [<Key shape="box" tone="danger">c</Key>, 'the path breaks here']],
  fields: (input) => [{ name: 'words', label: 'words', placeholder: 'car, cat, cart, dog' }, { name: 'queries', label: input.queries[0][0] === 'wild' ? 'searches (. = any letter)' : 'searches (* = prefix, # = count)', placeholder: input.queries[0][0] === 'wild' ? '.ad, b..' : 'car, ca, ca*' }],
  values: (input) => ({ words: input.words.join(', '), queries: trieQueriesText(input.queries) }),
  parse: parseTrie,
  random: (input) => randomTrie(input),
  hint: () => 'Up to 6 words of up to 5 letters, and up to 5 searches.',
  delay: () => 2400,
  Stage: TrieStage,
};

export function TrieViz(props) {
  return <StepViz spec={trieSpec} {...props} />;
}

// ---------------------------------------------------------------- bits

function BitsStage({ step: f, width }) {
  const cell = Math.max(26, Math.min(40, Math.floor((Math.min(width, 520) - 120) / BIT_WIDTH)));
  return (
    <div className={styles.wrap}>
      <div className={styles.bits} style={{ gridTemplateColumns: `90px repeat(${BIT_WIDTH}, ${cell}px) 46px` }}>
        <span />
        {Array.from({ length: BIT_WIDTH }, (_, k) => <span key={k} className={styles.place}>{2 ** (BIT_WIDTH - 1 - k)}</span>)}
        <span />
        {f.rows.map((row, r) => {
          const b = toBits(row.v);
          const markCol = row.mark ? BIT_WIDTH - 1 - Math.log2(row.mark) : -1;
          return [
            <span key={`l${r}`} className={`${styles.rowLabel} ${row.result ? styles.resultLabel : ''}`}>{row.label}</span>,
            ...b.map((bit, k) => (
              <span key={`${r}-${k}`} className={[styles.bit, bit ? styles.one : styles.zero, row.result && styles.result, k === markCol && styles.mark, row.mark && k > markCol && styles.below].filter(Boolean).join(' ')} style={{ height: cell }}>{bit}</span>
            )),
            <span key={`v${r}`} className={`${styles.dec} ${row.result ? styles.resultLabel : ''}`}>{row.v}</span>,
          ];
        })}
      </div>
      {f.mode === 'popcount' && <Chips label="bits cleared" chips={Array.from({ length: f.count }, (_, k) => ({ key: k, text: String(k + 1), tone: 'success', isNew: k === f.count - 1 && f.kind === 'clear' }))} empty="none yet" />}
    </div>
  );
}

const bitsSpec = {
  title: 'Bits, one row at a time',
  examples: BITS,
  simulate: bits,
  code: (input) => bitsCode(input.mode),
  kinds: { start: ['Start', 'neutral'], clear: ['Clear a bit', 'accent'], xor: ['XOR', 'accent'], cancel: ['Cancels', 'success'], done: ['Answer', 'success'] },
  describe: (input) => (input.mode === 'popcount' ? `n = ${input.n}` : `a = ${list(input.a)}`),
  rule: (input) => (input.mode === 'popcount' ? 'n & (n − 1) removes the lowest 1-bit.' : 'v ^ v = 0 and v ^ 0 = v: pairs cancel.'),
  stats: () => [],
  legend: (f, input) => [[<Key shape="box" tone="accent">1</Key>, 'a 1-bit'], ...(input.mode === 'popcount' ? [[<Key shape="box" tone="warn">1</Key>, 'the lowest set bit']] : []), [<Key shape="box" tone="success">1</Key>, 'result row']],
  fields: (input) => (input.mode === 'popcount' ? [{ name: 'n', label: 'n (1 to 255)', placeholder: '52', short: true }] : [{ name: 'a', label: input.mode === 'single' ? 'a (pairs + one single)' : 'a (0…n, one missing)', placeholder: input.mode === 'single' ? '4, 1, 2, 1, 2' : '3, 0, 1' }]),
  values: (input) => (input.mode === 'popcount' ? { n: String(input.n) } : { a: input.a.join(', ') }),
  parse: parseBits,
  random: (input) => randomBits(input),
  hint: () => 'Values up to 255, so everything fits in 8 bits.',
  delay: () => 2400,
  Stage: BitsStage,
};

export function BitsViz(props) {
  return <StepViz spec={bitsSpec} {...props} />;
}
