import { StepViz, Key } from './StepViz';
import { ArrayStrip, Arcs, Brackets, Chips, Float, Stage, pitchFor } from './prims';
import styles from './PrefixSumsViz.module.css';
import {
  DIFFERENCE, PREFIX_QUERY, SUBARRAY_K, difference, differenceCode, parseDifference, parsePrefixQuery, parseSubarrayK,
  prefixQuery, prefixQueryCode, randomDifference, randomPrefixQuery, randomSubarrayK, subarrayK, subarrayKCode,
} from './models/prefixSums';

/**
 * Prefix-sum step-throughs for the Prefix Sums lesson:
 *   <PrefixQueryViz />       build p, then answer sum(l..r) = p[r + 1] − p[l]
 *   <SubarraySumViz />       count subarrays with sum k: prefixes + a hash map, each match bracketed
 *   <DifferenceArrayViz />   range updates with two marks each, then one running sum
 * Prefixes sit on the boundaries between cells: p[i] is the sum of everything to the left of boundary i.
 */

const list = (a) => `[${a.join(', ')}]`;

function RowLabel({ y, children }) {
  return <span className={styles.rowLabel} style={{ top: y }}>{children}</span>;
}

// ---------------------------------------------------------------- build + range query

function QueryStage({ step: f, input, width, seq, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 10, n + 1, 40, 62);
  const W = (n + 1) * pitch;
  const x0 = pitch / 2;
  const top = 74;
  const h = 44;
  const py = top + h + 48;
  const ph = 34;
  const height = py + ph + 80;
  const left = (k) => x0 + k * pitch + 3;
  const right = (k) => x0 + (k + 1) * pitch - 3;
  const brackets = [];
  if (f.kind === 'whole' || f.kind === 'extra') brackets.push({ x1: left(0), x2: right(f.range[1]), y: 40, up: true, tone: 'accent', label: `p[${input.r + 1}] = ${f.p[input.r + 1]}` });
  if (f.kind === 'extra' && f.extra) brackets.push({ x1: left(0), x2: right(f.extra[1]), y: 62, up: true, tone: 'warn', label: `p[${input.l}] = ${f.p[input.l]}` });
  if (f.kind === 'done') brackets.push({ x1: left(f.range[0]), x2: right(f.range[1]), y: 40, up: true, tone: 'success', label: `p[${input.r + 1}] − p[${input.l}] = ${f.p[input.r + 1] - f.p[input.l]}` });
  const arcs = f.kind === 'build' ? [{ x1: f.i * pitch + pitch / 2, x2: (f.i + 1) * pitch + pitch / 2, y: py + ph + 28, depth: 30, tone: 'accent', label: `+ a[${f.i}] = ${a[f.i]}` }] : [];
  const inRange = (k) => f.kind === 'done' && k >= input.l && k <= input.r;
  const pItems = Array.from({ length: n + 1 }, (_, k) => (k < f.p.length ? f.p[k] : '·'));
  return (
    <Stage width={W} height={height} jump={jump} label={`a = ${list(a)}`}>
      <Brackets width={W} height={height} brackets={brackets} />
      <Arcs id="pq" width={W} height={height} arcs={arcs} />
      <RowLabel y={top - 16}>a</RowLabel>
      <ArrayStrip
        items={a} x0={x0} y={top} pitch={pitch} h={h}
        cls={(k) => [
          f.kind === 'build' && k === f.i && 'cur',
          inRange(k) && 'hit',
          f.kind === 'done' && !inRange(k) && 'dim',
          f.kind === 'extra' && f.extra && k <= f.extra[1] && 'warm',
        ].filter(Boolean).join(' ')}
      />
      <RowLabel y={py - 16}>p (on the boundaries)</RowLabel>
      <ArrayStrip
        items={pItems} y={py} pitch={pitch} h={ph} seq={seq} indexLabel={(k) => `p[${k}]`}
        cls={(k) => [
          k >= f.p.length && 'muted',
          f.kind === 'build' && k === f.i && 'second',
          f.kind === 'build' && k === f.i + 1 && 'cur',
          (f.kind === 'whole' || f.kind === 'extra' || f.kind === 'done') && k === input.r + 1 && 'cur',
          (f.kind === 'extra' || f.kind === 'done') && k === input.l && 'target',
        ].filter(Boolean).join(' ')}
      />
    </Stage>
  );
}

const querySpec = {
  title: 'Prefix sums: build once, answer any range',
  examples: PREFIX_QUERY,
  simulate: prefixQuery,
  code: () => prefixQueryCode,
  kinds: {
    start: ['Start', 'neutral'],
    build: ['Build', 'accent'],
    whole: ['Query: big prefix', 'accent'],
    extra: ['Query: extra part', 'warn'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `a = ${list(input.nums)}, query l = ${input.l}, r = ${input.r}`,
  rule: () => 'sum(a[l..r]) = p[r + 1] − p[l]',
  stats: (f, input) => [['built', `${f.p.length} / ${input.nums.length + 1}`]],
  legend: () => [
    [<Key shape="box" tone="accent">p</Key>, 'prefix being made or used'],
    [<Key shape="box" tone="warn">p[l]</Key>, 'the part to subtract'],
    [<Key shape="box" tone="success">a</Key>, 'the range asked for'],
  ],
  fields: () => [
    { name: 'nums', label: 'a', placeholder: 'e.g. 4, -2, 7, 1' },
    { name: 'l', label: 'l', placeholder: '1', short: true },
    { name: 'r', label: 'r', placeholder: '3', short: true },
  ],
  values: (input) => ({ nums: input.nums.join(', '), l: String(input.l), r: String(input.r) }),
  parse: (values) => parsePrefixQuery(values),
  random: () => randomPrefixQuery(),
  hint: () => 'Up to 10 numbers between −50 and 50, and a range l ≤ r. Try l = 0 to see why p[0] = 0 matters.',
  Stage: QueryStage,
};

export function PrefixQueryViz(props) {
  return <StepViz spec={querySpec} {...props} />;
}

// ---------------------------------------------------------------- count subarrays with sum k

/** The most subarrays summing to k that end at one index (to size the bracket area). */
function maxEnds(a, k) {
  let best = 0;
  for (let i = 0; i < a.length; i++) {
    let c = 0, s = 0;
    for (let j = i; j >= 0; j--) { s += a[j]; if (s === k) c++; }
    best = Math.max(best, c);
  }
  return best;
}

function SubarrayStage({ step: f, input, width, seq, jump }) {
  const a = input.nums;
  const n = a.length;
  const pitch = pitchFor(width - 10, n + 1, 40, 62);
  const W = (n + 1) * pitch;
  const x0 = pitch / 2;
  const levels = Math.max(1, maxEnds(a, input.k));
  const top = 34 + levels * 20;
  const h = 44;
  const py = top + h + 48;
  const ph = 34;
  const height = py + ph + 54;
  const left = (k) => x0 + k * pitch + 3;
  const right = (k) => x0 + (k + 1) * pitch - 3;
  const ends = f.kind === 'hit' ? f.ends : [];
  const brackets = ends.map(([j, e], lv) => ({ x1: left(j), x2: right(e), y: top - 14 - lv * 20, up: true, tone: 'success', label: lv === ends.length - 1 ? `sum ${input.k}` : undefined }));
  const matches = new Set(ends.map(([j]) => j));
  const pItems = Array.from({ length: n + 1 }, (_, k) => (k < f.p.length ? f.p[k] : '·'));
  const cur = f.i !== null && f.kind !== 'done' ? f.i : null;
  return (
    <>
      <Stage width={W} height={height} jump={jump} label={`nums = ${list(a)}`}>
        <Brackets width={W} height={height} brackets={brackets} />
        <ArrayStrip
          items={a} x0={x0} y={top} pitch={pitch} h={h}
          cls={(k) => [
            cur === k && 'cur',
            cur !== null && k > cur && 'dim',
            ends.some(([j, e]) => k >= j && k <= e) && k !== cur && 'kept',
          ].filter(Boolean).join(' ')}
        />
        <RowLabel y={py - 16}>prefix (on the boundaries)</RowLabel>
        <ArrayStrip
          items={pItems} y={py} pitch={pitch} h={ph} seq={seq} indexLabel={(k) => `p${k}`}
          cls={(k) => [
            k >= f.p.length && 'muted',
            cur !== null && k === cur + 1 && 'cur',
            matches.has(k) && 'hit',
          ].filter(Boolean).join(' ')}
        />
        {f.kind === 'miss' || f.kind === 'hit' ? <Float x={(f.i + 1) * pitch + pitch / 2} y={py + ph + 28} tone={f.kind === 'hit' ? 'success' : 'danger'}>{`need ${f.need}`}</Float> : null}
      </Stage>
      <Chips
        label="seen (prefix → times):" seq={seq}
        chips={f.map.map(({ key, c }) => ({
          key: `m${key}`, text: `${key} → ${c}`,
          tone: (f.kind === 'hit' && key === f.need) ? 'hit' : f.kind === 'store' && key === f.stored ? 'accent' : undefined,
          note: f.kind === 'hit' && key === f.need ? `+${c}` : undefined,
          isNew: f.kind === 'store' && key === f.stored,
        })).concat(f.kind === 'miss' ? [{ key: 'probe', text: `${f.need} ?`, tone: 'miss', note: 'none' }] : [])}
      />
    </>
  );
}

const subarraySpec = {
  title: 'Subarray sum equals k: prefixes + a hash map',
  examples: SUBARRAY_K,
  simulate: subarrayK,
  code: () => subarrayKCode,
  kinds: {
    start: ['Start', 'neutral'],
    miss: ['Check', 'danger'],
    hit: ['Check: found', 'success'],
    store: ['Store', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = ${list(input.nums)}, k = ${input.k}`,
  rule: () => 'Count earlier prefixes equal to prefix − k, then store prefix.',
  stats: (f) => [['i', f.i ?? '–'], ['need', f.need ?? '–'], ['count', f.count]],
  legend: () => [
    [<Key shape="box" tone="accent">p</Key>, 'current prefix'],
    [<Key shape="box" tone="success">p</Key>, 'earlier prefix = prefix − k'],
    [<Key shape="box" tone="success">⎴</Key>, 'a subarray that sums to k'],
  ],
  fields: () => [{ name: 'nums', label: 'nums (−9 to 9)', placeholder: 'e.g. 1, 1, 1' }, { name: 'k', label: 'k', placeholder: '2', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), k: String(input.k) }),
  parse: (values) => parseSubarrayK(values),
  random: () => randomSubarrayK(),
  hint: () => 'Up to 10 numbers between −9 and 9 (negatives are the point) and any k. Try k = 0.',
  Stage: SubarrayStage,
};

export function SubarraySumViz(props) {
  return <StepViz spec={subarraySpec} {...props} />;
}

// ---------------------------------------------------------------- difference array

function DifferenceStage({ step: f, input, width, seq, jump }) {
  const n = input.n;
  const pitch = pitchFor(width - 10, n + 1, 40, 60);
  const W = (n + 1) * pitch;
  const top = 46;
  const h = 42;
  const dy = top + h + 52;
  const height = dy + h + 30;
  const u = f.u !== null ? input.updates[f.u] : null;
  const outItems = f.out.map((v) => (v === null ? '·' : v));
  return (
    <>
      <Stage width={W} height={height} jump={jump} label={`n = ${n}`}>
        <RowLabel y={top - 30}>out</RowLabel>
        <ArrayStrip
          items={outItems} y={top} pitch={pitch} h={h} seq={seq}
          bands={u ? [{ from: u[0], to: u[1], tone: 'interview', label: `${u[2] > 0 ? '+' : ''}${u[2]} on ${u[0]}…${u[1]}` }] : []}
          cls={(k) => [
            f.out[k] === null && 'muted',
            f.kind === 'sweep' && k === f.i && 'hit',
          ].filter(Boolean).join(' ')}
        />
        <RowLabel y={dy - 18}>diff (n + 1 cells)</RowLabel>
        <ArrayStrip
          items={f.diff} y={dy} pitch={pitch} h={h} seq={seq}
          cls={(k) => [
            u && k === u[0] && 'cur',
            u && k === u[1] + 1 && 'target',
            f.kind === 'sweep' && k === f.i && 'cur',
            f.kind === 'sweep' && k < f.i && 'dim',
          ].filter(Boolean).join(' ')}
          badge={(k) => (u && k === u[0] ? { text: `${u[2] > 0 ? '+' : ''}${u[2]}`, tone: 'accent' } : u && k === u[1] + 1 ? { text: `${-u[2] > 0 ? '+' : ''}${-u[2]}`, tone: 'warn' } : null)}
        />
        {f.kind === 'sweep' && <Float x={f.i * pitch + pitch / 2} y={top + h + 26} tone="accent">{`running ${f.running}`}</Float>}
      </Stage>
      <Chips
        label="updates (l, r, v):" seq={seq}
        chips={input.updates.map(([l, r, v], k) => ({
          key: `u${k}`, text: `${l}…${r}: ${v > 0 ? '+' : ''}${v}`,
          tone: f.u === k ? 'accent' : f.kind === 'sweep' && f.active.includes(k) ? 'warn' : f.kind === 'start' || (f.u !== null && k > f.u) ? 'muted' : undefined,
          note: f.kind === 'sweep' && f.active.includes(k) ? 'covers' : undefined,
        }))}
      />
    </>
  );
}

const differenceSpec = {
  title: 'Difference array: range updates in O(1)',
  examples: DIFFERENCE,
  simulate: difference,
  code: () => differenceCode,
  kinds: {
    start: ['Start', 'neutral'],
    mark: ['Mark the edges', 'interview'],
    sweep: ['Running sum', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `n = ${input.n}, updates = ${input.updates.map((x) => list(x)).join(', ')}`,
  rule: () => 'diff[l] += v, diff[r + 1] −= v; then out[i] = running sum of diff.',
  stats: (f) => [['running', f.running]],
  legend: () => [
    [<Key shape="box" tone="interview">range</Key>, 'the update being applied'],
    [<Key shape="box" tone="accent">+v</Key>, 'start adding here'],
    [<Key shape="box" tone="warn">−v</Key>, 'stop after the range'],
  ],
  fields: () => [
    { name: 'n', label: 'n', placeholder: '6', short: true },
    { name: 'updates', label: 'updates: l r v; l r v', placeholder: 'e.g. 0 2 5; 1 4 -2' },
  ],
  values: (input) => ({ n: String(input.n), updates: input.updates.map((x) => x.join(' ')).join('; ') }),
  parse: (values) => parseDifference(values),
  random: () => randomDifference(),
  hint: () => 'n from 2 to 10 and up to 4 updates "l r v" separated by semicolons (0 ≤ l ≤ r < n, v from −9 to 9).',
  Stage: DifferenceStage,
};

export function DifferenceArrayViz(props) {
  return <StepViz spec={differenceSpec} {...props} />;
}
