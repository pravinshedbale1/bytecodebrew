import { StepViz, Key } from './StepViz';
import { ArrayStrip, Arcs, Chips, Float, Stage, pitchFor } from './prims';
import {
  CONSECUTIVE, TWO_SUM, consecutive, consecutiveCode, parseConsecutive, parseTwoSum, randomConsecutive, randomTwoSum, twoSum, twoSumCode,
} from './models/hashing';

/**
 * Hash map and set step-throughs for the Hashing lesson:
 *   <TwoSumMapViz />        Two Sum: check the map for the partner, then store
 *   <ConsecutiveSetViz />   Longest Consecutive Sequence: only start counting at the start of a run
 */

// ---------------------------------------------------------------- Two Sum

const TS_TOP = 44;
const TS_H = 46;

function TwoSumStage({ step: f, input, width, seq, jump }) {
  const n = input.nums.length;
  const pitch = pitchFor(width, n, 42, 64);
  const cx = (k) => k * pitch + pitch / 2;
  const stored = new Set(f.map.map((e) => e.idx));
  const height = TS_TOP + TS_H + 26;
  const arcs = f.pair ? [{ x1: cx(f.pair[0]), x2: cx(f.pair[1]), y: TS_TOP - 3, depth: -38, tone: 'success', label: `${input.nums[f.pair[0]]} + ${input.nums[f.pair[1]]} = ${input.target}`, head: false }] : [];
  const bubble = f.i !== null && f.kind !== 'found'
    ? <Float x={cx(f.i)} y={6} tone={f.kind === 'miss' ? 'danger' : f.kind === 'store' ? 'accent' : 'muted'}>{f.kind === 'store' ? `store ${f.added}→${f.i}` : `need ${f.need}`}</Float>
    : null;
  return (
    <>
      <Stage width={n * pitch} height={height} jump={jump} label={`nums = [${input.nums.join(', ')}]`}>
        <Arcs id="ts" width={n * pitch} height={height} arcs={arcs} />
        {bubble}
        <ArrayStrip
          items={input.nums} y={TS_TOP} pitch={pitch} h={TS_H}
          cls={(k) => [
            f.pair?.includes(k) && 'hit',
            !f.pair && f.i === k && 'cur',
            !f.pair?.includes(k) && stored.has(k) && f.i !== k && 'kept',
            f.i !== null && k > f.i && 'dim',
          ].filter(Boolean).join(' ')}
          tags={f.i !== null ? { [f.i]: [{ label: 'i', tone: 'accent' }] } : {}}
        />
      </Stage>
      <Chips
        label="seen (value → index):" seq={seq} empty="{ } empty"
        chips={[
          ...f.map.map((e) => ({
            key: `e${e.key}`, text: `${e.key} → ${e.idx}`,
            tone: f.probe?.hit !== null && f.probe?.key === e.key ? 'hit' : f.kind === 'store' && f.added === e.key ? 'accent' : undefined,
            note: f.probe?.hit !== null && f.probe?.key === e.key ? 'found' : f.kind === 'store' && f.added === e.key ? (f.replaced ? 'updated' : 'new') : undefined,
            isNew: f.kind === 'store' && f.added === e.key,
          })),
          ...(f.kind === 'miss' ? [{ key: 'probe', text: `${f.need} ?`, tone: 'miss', note: 'not found' }] : []),
        ]}
      />
    </>
  );
}

const twoSumSpec = {
  title: 'Two Sum: check, then store',
  examples: TWO_SUM,
  simulate: twoSum,
  code: () => twoSumCode,
  kinds: {
    start: ['Start', 'neutral'],
    miss: ['Check', 'danger'],
    store: ['Store', 'accent'],
    found: ['Found', 'success'],
    none: ['No pair', 'muted'],
  },
  describe: (input) => `nums = [${input.nums.join(', ')}], target = ${input.target}`,
  rule: () => 'Look up target − x before storing x.',
  stats: (f) => [['i', f.i ?? '–'], ['need', f.need ?? '–'], ['lookups', f.lookups], ['map size', f.map.length]],
  legend: () => [
    [<Key tone="accent">i</Key>, 'current number'],
    [<Key shape="box" tone="accent">3</Key>, 'passed, stored in the map'],
    [<Key shape="box" tone="success">6</Key>, 'the answer pair'],
  ],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: 'e.g. 2, 7, 11, 15' }, { name: 'target', label: 'target', placeholder: '9', short: true }],
  values: (input) => ({ nums: input.nums.join(', '), target: String(input.target) }),
  parse: (values) => parseTwoSum(values),
  random: () => randomTwoSum(),
  hint: () => 'Up to 10 numbers between −99 and 99. Try a target with no pair, or repeated values such as 3, 3 with target 6.',
  delay: (f) => (f.kind === 'store' ? 1700 : 2600),
  Stage: TwoSumStage,
};

export function TwoSumMapViz(props) {
  return <StepViz spec={twoSumSpec} {...props} />;
}

// ---------------------------------------------------------------- Longest Consecutive Sequence

const LC_TOP = 34;
const LC_H = 44;

/** Sorted distinct values with a gap marker wherever the next value isn't consecutive. */
function slotsOf(order) {
  const sorted = [...order].sort((a, b) => a - b);
  const slots = [];
  sorted.forEach((v, k) => {
    if (k > 0 && v - sorted[k - 1] > 1) slots.push({ v: '⋯', id: `gap${k}`, gap: true });
    slots.push({ v, id: `v${v}` });
  });
  return slots;
}

function ConsecutiveStage({ step: f, width, seq, jump }) {
  const slots = slotsOf(f.order);
  const pitch = pitchFor(width, slots.length, 36, 60);
  const at = (v) => slots.findIndex((s) => s.v === v);
  const height = LC_TOP + LC_H + 30;
  const inRun = (v) => f.run && v >= f.run[0] && v <= f.run[1];
  const bands = [];
  if (f.bestRun && !(f.run && f.run[0] === f.bestRun[0] && f.kind === 'end')) bands.push({ from: at(f.bestRun[0]), to: at(f.bestRun[1]), tone: 'ghost', label: 'best' });
  if (f.run) bands.push({ from: at(f.run[0]), to: at(f.run[1]), tone: f.kind === 'end' && f.better ? 'success' : 'accent', label: `run ${f.run[1] - f.run[0] + 1}` });
  const tags = {};
  if (f.x !== null) tags[at(f.x)] = [{ label: 'x', tone: 'accent' }];
  if ((f.kind === 'skip') && at(f.check) >= 0) tags[at(f.check)] = [...(tags[at(f.check)] ?? []), { label: 'x−1', tone: 'warn' }];
  const lastWalked = f.kind === 'walk' ? f.run[1] : null;
  return (
    <>
      <Stage width={slots.length * pitch} height={height} jump={jump} label={`set = {${f.order.join(', ')}}`}>
        {f.kind === 'start' && <Float x={at(f.x) * pitch + pitch / 2} y={2} tone="success">{f.check} absent → start</Float>}
        {f.kind === 'skip' && <Float x={at(f.x) * pitch + pitch / 2} y={2} tone="warn">{f.check} present → skip</Float>}
        {f.kind === 'end' && <Float x={Math.min(slots.length - 0.5, at(f.run[1]) + 1) * pitch} y={2} tone="danger">{f.run[1] + 1} absent → stop</Float>}
        <ArrayStrip
          items={slots} y={LC_TOP} pitch={pitch} h={LC_H} index={false} seq={seq}
          cls={(k, s) => [
            s.gap && 'gapcell',
            !s.gap && s.v === f.x && 'cur',
            !s.gap && f.kind === 'skip' && s.v === f.check && 'target',
            !s.gap && s.v === lastWalked && 'hit',
            !s.gap && !inRun(s.v) && f.x !== null && s.v !== f.check && 'dim',
          ].filter(Boolean).join(' ')}
          bands={bands}
          tags={tags}
        />
      </Stage>
      <Chips
        label="loop order:" seq={seq}
        chips={f.order.map((v) => ({
          key: `o${v}`, text: String(v),
          tone: v === f.x ? 'accent' : f.visited.includes(v) ? 'muted' : undefined,
        }))}
      />
    </>
  );
}

const consecutiveSpec = {
  title: 'Longest consecutive run with a set',
  examples: CONSECUTIVE,
  simulate: consecutive,
  code: () => consecutiveCode,
  kinds: {
    build: ['Build the set', 'neutral'],
    skip: ['Skip', 'warn'],
    start: ['Start of a run', 'accent'],
    walk: ['Walk', 'accent'],
    end: ['Run ends', 'interview'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = [${input.nums.join(', ')}]`,
  rule: () => 'Only count from x when x − 1 is missing.',
  stats: (f) => [['x', f.x ?? '–'], ['best', f.best], ['set lookups', f.lookups]],
  legend: () => [
    [<Key tone="accent">x</Key>, 'value the loop is on'],
    [<Key tone="warn">x−1</Key>, 'its predecessor is present'],
    [<Key shape="box" tone="accent">run</Key>, 'the run being walked'],
    [<Key shape="dashed">best</Key>, 'longest run so far'],
  ],
  fields: () => [{ name: 'nums', label: 'nums', placeholder: 'e.g. 9, 1, 4, 7, 3, 2, 8' }],
  values: (input) => ({ nums: input.nums.join(', ') }),
  parse: (values) => parseConsecutive(values),
  random: () => randomConsecutive(),
  hint: () => 'Up to 12 whole numbers between −50 and 250. Repeats are fine: the set keeps one of each.',
  Stage: ConsecutiveStage,
};

export function ConsecutiveSetViz(props) {
  return <StepViz spec={consecutiveSpec} {...props} />;
}
