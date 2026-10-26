import { StepViz, Key } from './StepViz';
import { ArrayStrip, Brackets, Chips, Float, Stage, pitchFor } from './prims';
import { WINDOW, parseWindow, randomWindow, slidingWindow, windowCode } from './models/slidingWindow';

/**
 * Sliding-window step-throughs for the Sliding Window lesson:
 *   <SlidingWindowViz examples={['longest']} />   longest window without a repeated letter
 *   <SlidingWindowViz examples={['shortest', 'fixed']} />
 */

const TOP = 52;
const H = 46;

function WindowStage({ step: f, input, width, seq, jump }) {
  const items = input.mode === 'longest' ? input.s.split('') : input.nums;
  const n = items.length;
  const pitch = pitchFor(width, n, 38, 62);
  const height = TOP + H + 62;
  const L = f.L ?? 0;
  const R = f.R ?? -1;
  const has = R >= L;
  const invalid = input.mode === 'longest' && (f.kind === 'invalid' || (f.kind === 'shrink' && Boolean(f.dup)));
  const enough = input.mode === 'shortest' && has && f.sum >= input.target;
  const bands = [];
  // the best window so far: a bracket under the indexes, so it never collides with the window's label
  const bestLen = f.bestWin ? f.bestWin[1] - f.bestWin[0] + 1 : 0;
  const brackets = f.bestWin && f.kind !== 'start'
    ? [{ x1: f.bestWin[0] * pitch + 4, x2: (f.bestWin[1] + 1) * pitch - 4, y: TOP + H + 30, tone: 'success', label: f.kind === 'done' ? `answer: ${input.mode === 'fixed' ? `sum ${f.best}` : bestLen}` : `best so far: ${input.mode === 'fixed' ? `sum ${f.best}` : bestLen}` }]
    : [];
  if (has) bands.push({ from: L, to: R, tone: invalid ? 'danger' : f.kind === 'done' || enough ? 'success' : 'accent', label: f.kind === 'done' ? 'best window' : `window: ${R - L + 1}` });
  const tags = {};
  if (has && f.kind !== 'done') {
    tags[L] = [{ label: 'L', tone: 'interview' }];
    tags[R] = [...(tags[R] ?? []), { label: 'R', tone: 'accent' }];
  }
  const mid = has ? ((L + R) / 2) * pitch + pitch / 2 : null;
  let float = null;
  if (input.mode === 'shortest' && has) {
    const ok = f.sum >= input.target;
    float = <Float x={mid} y={0} tone={ok ? 'success' : 'muted'}>{`sum ${f.sum} ${ok ? '≥' : '<'} ${input.target}`}</Float>;
  } else if (input.mode === 'fixed' && has) {
    float = <Float x={mid} y={0} tone={f.better ? 'success' : 'muted'}>{`sum ${f.sum}`}</Float>;
  } else if (input.mode === 'longest' && has) {
    float = <Float x={mid} y={0} tone={invalid ? 'danger' : 'success'}>{invalid ? `two ${f.dup}s` : `"${input.s.slice(L, R + 1)}" ✓`}</Float>;
  }
  return (
    <>
      <Stage width={n * pitch} height={height} jump={jump} label={input.mode === 'longest' ? `s = "${input.s}"` : `nums = [${input.nums.join(', ')}]`}>
        {float}
        <Brackets width={n * pitch} height={height} brackets={brackets} />
        <ArrayStrip
          items={items} y={TOP} pitch={pitch} h={H} seq={seq} bands={bands} tags={tags}
          cls={(k, it) => [
            k === f.added && f.kind !== 'done' && 'cur',
            k === f.removed && 'dim',
            has && k < L && k !== f.removed && 'dim',
            input.mode === 'longest' && f.dup && has && k >= L && k <= R && it.v === f.dup && 'bad',
          ].filter(Boolean).join(' ')}
          badge={(k) => (k === f.added && input.mode !== 'longest' && f.kind !== 'done'
            ? { text: `+${items[k]}`, tone: 'success' }
            : k === f.removed ? { text: input.mode === 'longest' ? '−' : `−${items[k]}`, tone: 'danger' } : null)}
        />
      </Stage>
      {input.mode === 'longest' && (
        <Chips
          label="letters in the window:" seq={seq} empty="none"
          chips={Object.entries(f.count).map(([c, k]) => ({
            key: c, text: `${c} × ${k}`, tone: k > 1 ? 'miss' : undefined,
          }))}
        />
      )}
    </>
  );
}

const spec = {
  title: 'Sliding window, step by step',
  examples: WINDOW,
  simulate: slidingWindow,
  code: (input) => windowCode[input.mode],
  kinds: {
    start: ['Start', 'neutral'],
    expand: ['Expand', 'accent'],
    invalid: ['Invalid', 'danger'],
    shrink: ['Shrink', 'warn'],
    fixed: ['Valid again', 'success'],
    valid: ['Valid', 'success'],
    record: ['Record', 'success'],
    build: ['First window', 'accent'],
    slide: ['Slide', 'accent'],
    done: ['Answer', 'success'],
  },
  describe: (input) => (input.mode === 'longest' ? `s = "${input.s}"` : input.mode === 'shortest' ? `nums = [${input.nums.join(', ')}], target = ${input.target}` : `nums = [${input.nums.join(', ')}], k = ${input.k}`),
  rule: (input) => ({
    longest: 'Longest: expand R; shrink L while the window is invalid; then record.',
    shortest: 'Shortest: expand R; while the window is valid, record, then shrink L.',
    fixed: 'Fixed k: add the new number, drop the oldest.',
  })[input.mode],
  stats: (f, input) => [
    ['L', f.L ?? 0], ['R', f.R ?? '–'],
    ...(input.mode === 'longest' ? [] : [['sum', f.sum]]),
    ['best', f.best],
  ],
  legend: (f, input) => [
    [<Key tone="interview">L</Key>, 'left edge'],
    [<Key tone="accent">R</Key>, 'right edge'],
    ...(input.mode === 'longest' ? [[<Key shape="box" tone="accent">window</Key>, 'valid window'], [<Key shape="box" tone="danger">window</Key>, 'invalid: a repeated letter']] : []),
    ...(input.mode === 'shortest' ? [[<Key shape="box" tone="accent">window</Key>, 'sum below target'], [<Key shape="box" tone="success">window</Key>, 'sum ≥ target (valid)']] : []),
    ...(input.mode === 'fixed' ? [[<Key shape="box" tone="accent">window</Key>, 'the k numbers in the window']] : []),
    [<Key shape="box" tone="success">⎵</Key>, 'best window so far'],
  ],
  fields: (input) => (input.mode === 'longest'
    ? [{ name: 's', label: 's (lowercase letters)', placeholder: 'e.g. pwwkew' }]
    : [
      { name: 'nums', label: input.mode === 'shortest' ? 'nums (positive)' : 'nums', placeholder: 'e.g. 1, 4, 4, 2, 3' },
      input.mode === 'shortest' ? { name: 'target', label: 'target', placeholder: '8', short: true } : { name: 'k', label: 'k', placeholder: '3', short: true },
    ]),
  values: (input) => (input.mode === 'longest' ? { s: input.s } : { nums: input.nums.join(', '), [input.mode === 'shortest' ? 'target' : 'k']: String(input.mode === 'shortest' ? input.target : input.k) }),
  parse: parseWindow,
  random: (input) => randomWindow(input),
  hint: (input) => ({
    longest: 'Up to 12 lowercase letters. Try "bbbbb" or "pwwkew".',
    shortest: 'Up to 12 positive numbers and a target. Try a target bigger than the whole sum.',
    fixed: 'Up to 12 numbers (negatives allowed) and a window size k.',
  })[input.mode],
  delay: () => 2300,
  Stage: WindowStage,
};

export function SlidingWindowViz(props) {
  return <StepViz spec={spec} {...props} />;
}
