import { StepViz, Key } from './StepViz';
import { ArrayStrip, Arcs, Stage, pitchFor } from './prims';
import { EXAMPLES, MAX_LEN, codeFor, parseInput, randomInput, simulate } from './models/cyclicSort';

/**
 * Cyclic sort, one decision at a time:
 *   <CyclicSortViz examples={['basic']} />   <CyclicSortViz examples={['missing', 'positive']} />
 * Every swap is shown twice: the plan (the top arrow carries nums[i] to its home, the bottom arrow
 * carries the value it displaces back to i), then the result, with both values moving along them.
 */

const CELL_TOP = 48;
const CELL_H = 48;
const BACK_Y = CELL_TOP + CELL_H + 52;   // below the index and "wants" rows
const HEIGHT = BACK_Y + 50;

const RULE = {
  one: 'Value v belongs at index v − 1.',
  zero: 'Value v belongs at index v; the value n has no home.',
  positive: 'Only 1 … n have a home (index v − 1); everything else stays put.',
};
const PLACEHOLDER = { one: 'e.g. 2, 3, 1, 3, 5', zero: 'e.g. 4, 2, 0, 1', positive: 'e.g. 7, -2, 1, 2, 9' };
const scanOf = (input) => input.range !== 'one' || new Set(input.arr).size !== input.arr.length;

function CyclicStage({ step: f, input, width, link, seq, jump }) {
  const n = f.cells.length;
  const pitch = pitchFor(width, n, 36, 66);
  const settled = new Set(f.settled);
  const wants = (k) => (input.range === 'zero' ? k : k + 1);
  const cx = (k) => k * pitch + pitch / 2;
  const arcs = f.arrows.map((a) => {
    const below = a.kind === 'back' || (a.kind === 'done' && a.from === f.target);
    const tone = { go: 'accent', back: 'warn', blocked: 'danger', done: 'muted' }[a.kind];
    return below
      ? { x1: cx(a.from), x2: cx(a.to), y: BACK_Y, depth: 48, tone, label: a.label, faded: a.kind === 'done' }
      : { x1: cx(a.from), x2: cx(a.to), y: CELL_TOP - 3, depth: -43, tone, label: a.label, faded: a.kind === 'done', dashed: a.kind === 'blocked' };
  });
  const tags = {};
  if (f.i !== null && f.i !== undefined) tags[f.i] = [{ label: 'i', tone: 'accent' }];
  if (f.target !== undefined && f.target !== f.i) tags[f.target] = [{ label: 'home', tone: 'warn' }];
  return (
    <Stage width={n * pitch} height={HEIGHT} jump={jump} label={`nums = [${f.cells.map((c) => c.v).join(', ')}]`}>
      <Arcs id="cyc" width={n * pitch} height={HEIGHT} arcs={arcs} />
      <ArrayStrip
        items={f.cells} y={CELL_TOP} pitch={pitch} h={CELL_H} seq={seq}
        flight={link?.swap ?? null}
        cls={(k, c) => [
          settled.has(k) && 'home',
          f.tags[c.id] === 'spare' && !settled.has(k) && 'bad',
          f.tags[c.id] === 'nohome' && 'muted',
          f.target === k && f.kind !== 'athome' && 'target',
          f.i === k && 'cur',
        ].filter(Boolean).join(' ')}
        check={(k) => settled.has(k)}
        badge={(k, c) => (f.tags[c.id] === 'spare' && !settled.has(k) ? { text: 'dup', tone: 'danger' } : f.tags[c.id] === 'nohome' ? { text: '∅', tone: 'muted' } : null)}
        tags={tags}
        sub={(k) => ({ text: wants(k), tone: f.slots[k] === 'missing' ? 'danger' : f.slots[k] === 'answer' ? 'success' : undefined })}
      />
    </Stage>
  );
}

const spec = {
  title: 'Cyclic sort, step by step',
  examples: EXAMPLES,
  simulate: (input) => simulate(input.arr, input.range),
  code: (input) => codeFor(input.range, scanOf(input)),
  kinds: {
    start: ['Start', 'neutral'],
    plan: ['Decide', 'accent'],
    swapped: ['Swapped', 'accent'],
    athome: ['Already home', 'success'],
    spare: ['Duplicate', 'danger'],
    nohome: ['No home', 'muted'],
    placed: ['Placement done', 'neutral'],
    scan: ['Read the answer', 'interview'],
    done: ['Answer', 'success'],
  },
  describe: (input) => `nums = [${input.arr.join(', ')}]`,
  rule: (input) => RULE[input.range],
  stats: (f) => [
    ['i', f.i === null || f.i === undefined ? 'n (end)' : f.i],
    ['swaps', f.swaps],
    ['home ✓', `${f.settled.length} / ${f.cells.length}`],
  ],
  legend: (f) => [
    [<Key tone="accent">i</Key>, 'being checked'],
    [<Key tone="warn">home</Key>, 'where nums[i] belongs'],
    [<Key shape="dashed">3</Key>, 'the value each index wants'],
    [<Key shape="text" tone="success">✓</Key>, 'home for good'],
    ...(f.cells.some((c) => f.tags[c.id] === 'spare') ? [[<Key shape="box" tone="danger">dup</Key>, 'spare copy']] : []),
    ...(f.cells.some((c) => f.tags[c.id] === 'nohome') ? [[<Key shape="dashed">∅</Key>, 'no home']] : []),
  ],
  fields: (input) => [{ name: 'nums', label: 'nums', placeholder: PLACEHOLDER[input.range] }],
  values: (input) => ({ nums: input.arr.join(', ') }),
  parse: (values, input) => {
    const r = parseInput(values.nums ?? '', input.range);
    return r.error ? r : { input: { range: input.range, arr: r.arr } };
  },
  random: (input) => ({ range: input.range, arr: randomInput(input.range) }),
  hint: (input) => `Up to ${MAX_LEN} whole numbers. ${RULE[input.range]}${input.range === 'one' ? ' Repeats are allowed: they show the duplicate case.' : ''}`,
  delay: (f) => (f.kind === 'plan' ? 1900 : 2600),
  Stage: CyclicStage,
};

export function CyclicSortViz(props) {
  return <StepViz spec={spec} {...props} />;
}
