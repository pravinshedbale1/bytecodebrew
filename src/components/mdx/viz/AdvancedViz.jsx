import { StepViz, Key } from './StepViz';
import { ArrayStrip, Chips, Float, RowLabel, Stage, pitchFor } from './prims';
import styles from './AdvancedViz.module.css';
import {
  FENWICK, KMP, LRU, MATH, MATRIX, SEGTREE, fenwick, fenwickCode, kmp, kmpAlign, kmpCode, lowbit, lru, lruCode, lruOpsText, math, mathCode,
  matrix, matrixCode, parseFenwick, parseKmp, parseLru, parseMath, parseMatrix, parseSeg, randomFenwick, randomKmp, randomLru, randomMath,
  randomMatrix, randomSeg, segCode, segTree,
} from './models/advanced';

/**
 * Step-throughs for the Design, Matrices & Advanced Topics module:
 *   <LruViz />       hash map + doubly linked list: move to front on use, evict from the back
 *   <MatrixViz />    spiral boundaries, rotation (transpose + reverse, cells glide), set-zeroes markers
 *   <MathViz />      the sieve, Euclid's gcd, fast power by squaring
 *   <KmpViz />       the failure table, and KMP search sliding the pattern without moving back in the text
 *   <FenwickViz />   boxes covering lowbit-sized ranges: queries walk down, updates climb
 *   <SegTreeViz />   a range query: no overlap, full overlap, partial overlap
 */

const list = (a) => `[${a.join(', ')}]`;

// ---------------------------------------------------------------- LRU

function LruStage({ step: f, width }) {
  const W = Math.max(300, Math.min(width, 600));
  const nodeW = 66, gap = 22;
  const listX0 = 92;
  const keys = [...f.list.map((n) => n.key)].sort((a, b) => a - b);
  const xOf = (k) => listX0 + 34 + k * (nodeW + gap);
  const H = Math.max(86, 54 + Math.max(3, keys.length) * 34);
  const tailX = xOf(f.cap);
  const scale = Math.min(1, (W - 10) / (tailX + 40));
  return (
    <div className={styles.wrap} style={{ width: W }}>
      <div className={styles.lru} style={{ width: (tailX + 40), height: H, transform: `scale(${scale})`, transformOrigin: 'top left', marginBottom: -(1 - scale) * H, marginRight: -(1 - scale) * (tailX + 40) }}>
        <span className={styles.mapLabel}>hash map</span>
        <span className={styles.listLabel} style={{ left: listX0 + 34, top: 66 }}>most recent ← list → least recent</span>
        <svg className={styles.svg} width={tailX + 40} height={H} aria-hidden="true">
          {keys.map((k, r) => {
            const at = f.list.findIndex((n) => n.key === k);
            return <line key={k} x1={62} y1={50 + r * 34} x2={xOf(at) + nodeW / 2} y2={36} className={k === f.key ? styles.ptrOn : styles.ptr} />;
          })}
        </svg>
        {keys.map((k, r) => <span key={k} className={`${styles.mapKey} ${k === f.key ? styles.mapOn : ''}`} style={{ top: 38 + r * 34 }}>{k}</span>)}
        <span className={styles.sentinel} style={{ left: listX0 - 10, top: 16 }}>head</span>
        {f.list.map((n, k) => (
          <div key={n.key} className={[styles.lnode, n.key === f.key && styles.lnodeOn, k === 0 && styles.mru, k === f.list.length - 1 && f.list.length === f.cap && styles.lru1].filter(Boolean).join(' ')} style={{ left: xOf(k), top: 16, width: nodeW }}>
            <b>{n.key}</b><span>{n.val}</span>
          </div>
        ))}
        {f.evicted !== null && f.evicted !== undefined && <div key={`gone${f.evicted}`} className={`${styles.lnode} ${styles.gone}`} style={{ left: xOf(f.cap - 1) + nodeW / 2, top: 40, width: nodeW }}><b>{f.evicted}</b><span>evicted</span></div>}
        <span className={styles.sentinel} style={{ left: tailX - 6, top: 16 }}>tail</span>
        {Array.from({ length: f.list.length + 1 }, (_, k) => <span key={k} className={styles.dlink} style={{ left: (k === 0 ? listX0 + 26 : xOf(k - 1) + nodeW), width: k === 0 ? 8 : gap, top: 32 }}>⇄</span>)}
      </div>
      <Chips label="get() returned" chips={f.out.map((v, k) => ({ key: k, text: String(v), tone: v === -1 ? 'danger' : 'success', isNew: k === f.out.length - 1 && (f.kind === 'hit' || f.kind === 'miss') }))} empty="nothing yet" />
    </div>
  );
}

const lruSpec = {
  title: 'LRU cache: hash map + doubly linked list',
  examples: LRU,
  simulate: lru,
  code: () => lruCode,
  kinds: { start: ['Start', 'neutral'], add: ['Put', 'accent'], update: ['Update', 'accent'], hit: ['Get: hit', 'success'], miss: ['Get: miss', 'warn'], evict: ['Evict', 'danger'], done: ['Done', 'success'] },
  describe: (input) => `capacity ${input.cap}: ${lruOpsText(input.ops)}`,
  rule: () => 'Use a key → move it to the front. Full → evict from the back.',
  stats: (f) => [['size', `${f.list.length} / ${f.cap}`]],
  legend: () => [[<Key shape="box" tone="accent">1</Key>, 'just used (front = most recent)'], [<Key shape="box" tone="danger">2</Key>, 'evicted']],
  fields: () => [{ name: 'cap', label: 'capacity', placeholder: '3', short: true }, { name: 'ops', label: 'operations (p1=A put, g1 get)', placeholder: 'p1=A, p2=B, g1, p3=C' }],
  values: (input) => ({ cap: String(input.cap), ops: lruOpsText(input.ops) }),
  parse: parseLru,
  random: () => randomLru(),
  hint: () => 'Keys 0 to 9, values are letters, capacity up to 4.',
  delay: () => 2600,
  Stage: LruStage,
};

export function LruViz(props) {
  return <StepViz spec={lruSpec} {...props} />;
}

// ---------------------------------------------------------------- matrices

function MatrixStage({ step: f, width }) {
  const R = f.cells.length, C = f.cells[0].length;
  const size = Math.max(36, Math.min(54, Math.floor((Math.min(width, 440) - 20) / C)));
  const W = C * size, H = R * size;
  const walk = new Set((f.walk ?? []).map(([r, c]) => `${r},${c}`));
  const done = new Map((f.order ?? []).map(([r, c], k) => [`${r},${c}`, k + 1]));
  const hit = new Set((f.hit ?? []).map(([r, c]) => `${r},${c}`));
  const moved = new Set(f.moved ?? []);
  const positions = [];
  f.cells.forEach((row, r) => row.forEach((cell, c) => positions.push({ ...cell, r, c })));
  const b = f.bounds;
  return (
    <div className={styles.wrap}>
      <div className={styles.matrix} style={{ width: W, height: H }}>
        {f.mode === 'rotate' && f.diag !== undefined && <span className={styles.diag} style={{ width: Math.hypot(W, H), transform: `rotate(${Math.atan2(H, W)}rad)` }} />}
        {positions.map((p) => {
          const k = `${p.r},${p.c}`;
          return (
            <span
              key={f.mode === 'zeroes' ? k : p.id}
              className={[
                styles.mcell,
                walk.has(k) && styles.walking,
                done.has(k) && !walk.has(k) && styles.visited,
                hit.has(k) && styles.hitCell,
                moved.has(p.id) && styles.moved,
                f.mode === 'zeroes' && p.v === 0 && styles.zero,
                f.mode === 'zeroes' && (p.r === 0 || p.c === 0) && styles.marker,
                f.mode === 'spiral' && b && (p.r < b.top || p.r > b.bottom || p.c < b.left || p.c > b.right) && !walk.has(k) && styles.outside,
              ].filter(Boolean).join(' ')}
              style={{ left: p.c * size, top: p.r * size, width: size - 4, height: size - 4 }}
            >
              {p.v}
              {done.has(k) && <i className={styles.order}>{done.get(k)}</i>}
            </span>
          );
        })}
        {f.mode === 'spiral' && b && b.top <= b.bottom && b.left <= b.right && (
          <span className={styles.bounds} style={{ left: b.left * size - 2, top: b.top * size - 2, width: (b.right - b.left + 1) * size, height: (b.bottom - b.top + 1) * size }} />
        )}
      </div>
      {f.mode === 'spiral' && <Chips label="output" chips={f.out.map((v, k) => ({ key: k, text: String(v), tone: k >= f.out.length - (f.walk ?? []).length ? 'accent' : undefined }))} empty="empty" />}
      {f.mode === 'zeroes' && <p className={styles.caption}>{`flags: row 0 has a 0: ${f.firstRow} · column 0 has a 0: ${f.firstCol} · row 0 and column 0 double as markers`}</p>}
    </div>
  );
}

const matrixSpec = {
  title: 'Matrix tricks without the index bugs',
  examples: MATRIX,
  simulate: matrix,
  code: (input) => matrixCode(input.mode),
  kinds: { start: ['Start', 'neutral'], top: ['Top', 'accent'], right: ['Right', 'accent'], bottom: ['Bottom', 'accent'], left: ['Left', 'accent'], skip: ['Skip', 'warn'], transpose: ['Transpose', 'accent'], reverse: ['Reverse', 'note'], flags: ['Flags', 'neutral'], mark: ['Mark', 'warn'], apply: ['Clear', 'accent'], last: ['Markers', 'note'], done: ['Done', 'success'] },
  describe: (input) => `${input.m.length} × ${input.m[0].length} matrix`,
  rule: (input) => ({ spiral: 'Walk a side, then move that boundary in.', rotate: 'Transpose, then reverse each row = 90° clockwise.', zeroes: 'Row 0 and column 0 store the markers; clear them last.' })[input.mode],
  stats: () => [],
  legend: (f, input) => (input.mode === 'spiral' ? [[<Key shape="box" tone="accent">5</Key>, 'read in this step'], [<Key shape="box">2</Key>, 'small number = reading order']] : input.mode === 'rotate' ? [[<Key shape="box" tone="warn">6</Key>, 'moved in this step']] : [[<Key shape="box" tone="warn">0</Key>, 'touched in this step'], [<Key shape="box" tone="note">3</Key>, 'row 0 / column 0: markers']]),
  fields: () => [{ name: 'm', label: 'matrix rows, separated by ;', placeholder: 'e.g. 1 2 3; 4 5 6; 7 8 9' }],
  values: (input) => ({ m: input.m.map((r) => r.join(' ')).join('; ') }),
  parse: parseMatrix,
  random: (input) => randomMatrix(input),
  hint: (input) => (input.mode === 'rotate' ? 'A square matrix, up to 6 × 6.' : 'Up to 6 rows of up to 6 numbers.'),
  delay: () => 2200,
  Stage: MatrixStage,
};

export function MatrixViz(props) {
  return <StepViz spec={matrixSpec} {...props} />;
}

// ---------------------------------------------------------------- math

function MathStage({ step: f, width }) {
  if (f.mode === 'sieve') {
    const nums = Array.from({ length: f.n - 1 }, (_, k) => k + 2);
    const per = width < 420 ? 6 : 10;
    const size = Math.max(30, Math.min(48, Math.floor((Math.min(width, 520) - 10) / per)));
    const fresh = new Set(f.fresh);
    const primes = new Set(f.primes ?? []);
    return (
      <div className={styles.wrap}>
        <div className={styles.sieve} style={{ gridTemplateColumns: `repeat(${per}, ${size}px)`, gridAutoRows: `${size - 6}px` }}>
          {nums.map((v) => (
            <span key={v} className={[styles.num, f.crossed[v] && styles.crossed, fresh.has(v) && styles.freshX, v === f.p && styles.prime, primes.has(v) && styles.prime, f.p && f.p * f.p === v && styles.square].filter(Boolean).join(' ')}>
              {v}
              {f.crossed[v] && <i className={styles.by}>{f.crossed[v]}</i>}
            </span>
          ))}
        </div>
        <p className={styles.caption}>crossed-out numbers show the prime that crossed them out</p>
      </div>
    );
  }
  if (f.mode === 'gcd') {
    return (
      <div className={styles.wrap}>
        <div className={styles.gcd}>
          {f.rows.map((r, k) => (
            <div key={k} className={`${styles.gcdRow} ${k === f.rows.length - 1 && f.kind !== 'done' ? styles.gcdNow : ''}`}>
              <b>{r.a}</b> = <b>{r.q}</b> × <b>{r.b}</b> + <b className={r.r === 0 ? styles.zeroR : styles.rem}>{r.r}</b>
              <span className={styles.bar}><i style={{ width: `${(r.b / f.rows[0].a) * 100}%` }} /><i className={styles.barRem} style={{ width: `${(r.r / f.rows[0].a) * 100}%` }} /></span>
            </div>
          ))}
          {f.rows.length === 0 && <p className={styles.caption}>each line: a = q × b + r, then continue with (b, r)</p>}
        </div>
      </div>
    );
  }
  const nb = f.bitsOf.length;
  return (
    <div className={styles.wrap}>
      <div className={styles.expBits}>
        <span className={styles.expLabel}>{`n = ${f.n} =`}</span>
        {[...f.bitsOf].reverse().map((b, k) => {
          const idx = nb - 1 - k;
          return <span key={idx} className={[styles.ebit, b ? styles.eone : '', f.bit === idx && styles.ecur, f.bit !== null && idx < f.bit && styles.edone].filter(Boolean).join(' ')}>{b}<small>2^{idx}</small></span>;
        })}
      </div>
      <table className={styles.powTable}>
        <thead><tr><th>bit</th><th>base = {f.x}^(2^k)</th><th>used?</th><th>result</th></tr></thead>
        <tbody>
          {f.rows.map((r) => (
            <tr key={r.k} className={r.k === f.bit ? styles.rowNow : undefined}>
              <td>{r.k}</td><td>{f.x}^{r.power} = {r.base}</td><td>{r.bit ? 'yes ×' : 'no'}</td><td>{r.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const mathSpec = {
  title: 'Math for interviews, step by step',
  examples: MATH,
  simulate: math,
  code: (input) => mathCode(input.mode),
  kinds: { start: ['Start', 'neutral'], cross: ['Cross out', 'warn'], step: ['Divide', 'accent'], use: ['Use bit', 'success'], skip: ['Skip bit', 'note'], done: ['Answer', 'success'] },
  describe: (input) => (input.mode === 'sieve' ? `n = ${input.n}` : input.mode === 'gcd' ? `a = ${input.a}, b = ${input.b}` : `${input.x}^${input.n}`),
  rule: (input) => ({ sieve: 'Each prime crosses out its multiples from p².', gcd: 'gcd(a, b) = gcd(b, a mod b).', pow: 'Square the base each round; multiply it in when the bit is 1.' })[input.mode],
  stats: () => [],
  legend: (f, input) => (input.mode === 'sieve' ? [[<Key shape="box" tone="success">7</Key>, 'prime'], [<Key shape="box" tone="warn">9</Key>, 'crossed out now']] : []),
  fields: (input) => (input.mode === 'sieve' ? [{ name: 'n', label: 'n (10 to 60)', placeholder: '30', short: true }] : input.mode === 'gcd' ? [{ name: 'a', label: 'a', placeholder: '48', short: true }, { name: 'b', label: 'b', placeholder: '18', short: true }] : [{ name: 'x', label: 'x (2 to 5)', placeholder: '3', short: true }, { name: 'n', label: 'n (1 to 20)', placeholder: '13', short: true }]),
  values: (input) => (input.mode === 'sieve' ? { n: String(input.n) } : input.mode === 'gcd' ? { a: String(input.a), b: String(input.b) } : { x: String(input.x), n: String(input.n) }),
  parse: parseMath,
  random: (input) => randomMath(input),
  hint: () => 'Small numbers keep every step visible.',
  delay: () => 2400,
  Stage: MathStage,
};

export function MathViz(props) {
  return <StepViz spec={mathSpec} {...props} />;
}

// ---------------------------------------------------------------- KMP

function KmpStage({ step: f, width, jump }) {
  if (f.mode === 'table') {
    const n = f.p.length;
    const pitch = pitchFor(width, n, 36, 56);
    const bands = f.len ? [{ from: 0, to: f.len - 1, tone: 'success', label: 'prefix' }, ...(f.i !== null && f.i - f.len + 1 > f.len - 1 ? [{ from: f.i - f.len + 1, to: f.i, tone: 'note', label: 'suffix' }] : [])] : [];
    return (
      <Stage width={n * pitch} height={150} jump={jump} label="pattern">
        <ArrayStrip
          items={[...f.p]} y={28} pitch={pitch} bands={bands}
          cls={(k) => [k === f.i && 'cur', f.i !== null && k > f.i && 'dim'].filter(Boolean).join(' ')}
          tags={f.i !== null && f.kind !== 'done' ? { [f.i]: [{ label: 'i', tone: 'accent' }] } : {}}
          sub={(k) => (f.lps[k] === null ? { text: '?' } : { text: String(f.lps[k]), tone: k === f.i ? 'success' : undefined })}
        />
        <RowLabel y={128}>under each letter: lps (the reusable border length)</RowLabel>
      </Stage>
    );
  }
  const n = f.t.length, m = f.p.length;
  const pitch = pitchFor(width, n, 26, 46);
  const align = kmpAlign(f);
  const matchedTo = f.i === null ? -1 : f.i;
  return (
    <Stage width={n * pitch} height={170} jump={jump} label="text and pattern">
      <RowLabel y={4}>text</RowLabel>
      <ArrayStrip
        items={[...f.t]} y={20} pitch={pitch} h={38}
        bands={f.found.map((s) => ({ from: s, to: s + m - 1, tone: 'success', label: `match at ${s}` }))}
        cls={(k) => [k === f.i && (f.kind === 'fall' || f.kind === 'miss' ? 'target' : 'cur'), f.i !== null && k > f.i && 'dim'].filter(Boolean).join(' ')}
        index
      />
      <RowLabel y={90}>pattern (where it lines up now)</RowLabel>
      {align !== null && (
        <div className={styles.slide} style={{ transform: `translateX(${Math.max(0, align) * pitch}px)` }}>
          <ArrayStrip
            items={[...f.p]} y={106} pitch={pitch} h={38} index={false}
            cls={(k) => (k < f.j ? 'hit' : k === f.j && align + k <= matchedTo ? 'bad' : 'dim')}
          />
        </div>
      )}
    </Stage>
  );
}

const kmpSpec = {
  title: 'KMP: never move backwards in the text',
  examples: KMP,
  simulate: kmp,
  code: (input) => kmpCode(input.mode),
  kinds: { start: ['Start', 'neutral'], grow: ['Border grows', 'success'], fall: ['Fall back', 'warn'], zero: ['No border', 'note'], match: ['Match', 'accent'], miss: ['Miss', 'note'], found: ['Found', 'success'], done: ['Done', 'success'] },
  describe: (input) => (input.mode === 'table' ? `p = "${input.p}"` : `p = "${input.p}", text = "${input.t}"`),
  rule: (input) => (input.mode === 'table' ? 'Extend the border if the next letter matches; otherwise fall back to the border\'s border.' : 'On a mismatch, j = lps[j − 1]: keep what still matches.'),
  stats: (f) => (f.mode === 'table' ? [['len', f.len ?? '—']] : [['j (matched)', f.j]]),
  legend: (f, input) => (input.mode === 'table' ? [[<Key shape="box" tone="success">a</Key>, 'border as a prefix'], [<Key shape="box" tone="note">a</Key>, '…and as a suffix']] : [[<Key shape="box" tone="success">a</Key>, 'pattern letters matched'], [<Key shape="box" tone="warn">c</Key>, 'mismatch in the text']]),
  fields: (input) => [{ name: 'p', label: 'pattern', placeholder: 'aabaaab', short: true }, ...(input.mode === 'search' ? [{ name: 't', label: 'text', placeholder: 'aabaaaabaaab' }] : [])],
  values: (input) => (input.mode === 'table' ? { p: input.p } : { p: input.p, t: input.t }),
  parse: parseKmp,
  random: (input) => randomKmp(input),
  hint: () => 'Lower-case letters: a pattern up to 8, a text up to 16. Repetitive patterns (like aab) show the fallbacks best.',
  delay: () => 2200,
  Stage: KmpStage,
};

export function KmpViz(props) {
  return <StepViz spec={kmpSpec} {...props} />;
}

// ---------------------------------------------------------------- Fenwick tree

function FenwickStage({ step: f, width, jump }) {
  const n = f.a.length;
  const pitch = pitchFor(width, n, 36, 62);
  const W = n * pitch;
  const levels = Math.floor(Math.log2(n)) + 1;
  const top = 74;
  const visited = new Set(f.visited);
  return (
    <Stage width={W} height={top + levels * 34 + 20} jump={jump} label="Fenwick tree">
      <RowLabel y={0}>array (positions 1…n)</RowLabel>
      <ArrayStrip items={f.a} y={16} pitch={pitch} h={34} indexLabel={(k) => k + 1} cls={(k) => (f.cur && k + 1 > f.cur - lowbit(f.cur) && k + 1 <= f.cur ? 'kept' : '')} />
      {Array.from({ length: n }, (_, k) => k + 1).map((i) => {
        const lb = lowbit(i);
        const lvl = Math.log2(lb);
        return (
          <div
            key={i}
            className={[styles.box, visited.has(i) && styles.boxSeen, f.cur === i && styles.boxCur].filter(Boolean).join(' ')}
            style={{ left: (i - lb) * pitch + 2, width: lb * pitch - 4, top: top + lvl * 34 }}
            title={`box ${i}: positions ${i - lb + 1}–${i}`}
          >
            <b>[{i}]</b> {f.tree[i]}
          </div>
        );
      })}
      {f.mode === 'query' && f.kind !== 'start' && <Float x={0} y={top - 22} anchor="right" tone="success">{`sum = ${f.sum}`}</Float>}
    </Stage>
  );
}

const fenwickSpec = {
  title: 'Fenwick tree: boxes of lowbit size',
  examples: FENWICK,
  simulate: fenwick,
  code: (input) => fenwickCode(input.mode),
  kinds: { start: ['Start', 'neutral'], add: ['Visit box', 'accent'], done: ['Done', 'success'] },
  describe: (input) => (input.mode === 'query' ? `a = ${list(input.a)}, prefix(${input.i})` : `a = ${list(input.a)}, add ${input.delta} at ${input.i}`),
  rule: (input) => (input.mode === 'query' ? 'i −= i & −i: strip the lowest bit.' : 'i += i & −i: climb to the next covering box.'),
  stats: (f) => [['boxes visited', f.visited.length]],
  legend: () => [[<Key shape="box" tone="warn">[6] 9</Key>, 'this step\'s box'], [<Key shape="box" tone="accent">[4] 15</Key>, 'visited'], [<Key shape="box">[1..8]</Key>, 'width = positions covered']],
  fields: (input) => [{ name: 'a', label: 'a (up to 8)', placeholder: '5, 2, 9, -1, 6, 3, 4, 7' }, { name: 'i', label: 'position (1-based)', placeholder: input.mode === 'query' ? '7' : '3', short: true }, ...(input.mode === 'update' ? [{ name: 'delta', label: 'add', placeholder: '10', short: true }] : [])],
  values: (input) => ({ a: input.a.join(', '), i: String(input.i), ...(input.mode === 'update' ? { delta: String(input.delta) } : {}) }),
  parse: parseFenwick,
  random: (input) => randomFenwick(input),
  hint: () => 'Up to 8 values between −20 and 20.',
  delay: () => 2400,
  Stage: FenwickStage,
};

export function FenwickViz(props) {
  return <StepViz spec={fenwickSpec} {...props} />;
}

// ---------------------------------------------------------------- segment tree

function SegStage({ step: f, width }) {
  const W = Math.max(300, Math.min(width, 620));
  const n = f.a.length;
  const slot = W / n;
  const ks = Object.keys(f.nodes).map(Number);
  const depth = Math.max(...ks.map((k) => f.nodes[k].depth));
  const pos = (k) => { const nd = f.nodes[k]; return { x: ((nd.lo + nd.hi + 1) / 2) * slot, y: 24 + nd.depth * 58 }; };
  const H = 24 + depth * 58 + 44;
  return (
    <div className={styles.wrap}>
      <div className={styles.seg} style={{ width: W, height: H }}>
        <svg className={styles.svg} width={W} height={H} aria-hidden="true">
          {ks.filter((k) => k > 1).map((k) => { const a = pos(k >> 1), b = pos(k); return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={f.status[k] ? styles.segEdgeOn : styles.segEdge} />; })}
        </svg>
        {ks.map((k) => {
          const nd = f.nodes[k];
          const p = pos(k);
          const st = f.status[k];
          return (
            <div key={k} className={[styles.snode, st && styles[`s_${st}`], k === f.cur && styles.scur].filter(Boolean).join(' ')} style={{ left: p.x, top: p.y }}>
              <b>{nd.sum}</b>
              <small>{nd.lo === nd.hi ? nd.lo : `${nd.lo}–${nd.hi}`}</small>
            </div>
          );
        })}
        <span className={styles.qband} style={{ left: f.l * slot + 2, width: (f.r - f.l + 1) * slot - 4, top: H - 16 }}>query [{f.l}, {f.r}]</span>
      </div>
    </div>
  );
}

const segSpec = {
  title: 'Segment tree: a range query',
  examples: SEGTREE,
  simulate: segTree,
  code: () => segCode,
  kinds: { start: ['Start', 'neutral'], none: ['No overlap', 'neutral'], full: ['Full overlap', 'success'], partial: ['Partial', 'warn'], done: ['Answer', 'success'] },
  describe: (input) => `a = ${list(input.a)}, sum(${input.l}, ${input.r})`,
  rule: () => 'No overlap → 0. Full overlap → stored sum. Partial → ask both children.',
  stats: (f) => [['running total', f.total]],
  legend: () => [[<Key shape="box" tone="success">17</Key>, 'fully inside: used'], [<Key shape="box" tone="warn">35</Key>, 'partly inside: split'], [<Key shape="dashed">9</Key>, 'outside: 0']],
  fields: () => [{ name: 'a', label: 'a (up to 8)', placeholder: '5, 2, 9, -1, 6, 3, 4, 7' }, { name: 'l', label: 'l', placeholder: '2', short: true }, { name: 'r', label: 'r', placeholder: '5', short: true }],
  values: (input) => ({ a: input.a.join(', '), l: String(input.l), r: String(input.r) }),
  parse: parseSeg,
  random: () => randomSeg(),
  hint: () => 'Up to 8 values; 0-based l and r.',
  delay: () => 2200,
  Stage: SegStage,
};

export function SegTreeViz(props) {
  return <StepViz spec={segSpec} {...props} />;
}
