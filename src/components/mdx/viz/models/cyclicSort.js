/**
 * Cyclic sort, step by step (the model behind <CyclicSortViz>): runs cyclic sort on a small array and
 * records every decision with its explanation. Pure (no React), so scripts/viz-check.mjs can test it.
 *
 * Ranges:
 *   one       values 1..n, repeats allowed: v lives at index v − 1 (then read missing / duplicates)
 *   zero      values 0..n, distinct, one missing: v lives at index v; n has no home (Missing Number)
 *   positive  any values: only 1..n have a home at v − 1 (First Missing Positive)
 *
 * A swap is two steps: "plan" (arrows show where both values are about to go) and "swapped" (the
 * values have moved; `swap` names the two elements so the view can animate them).
 */

export const EXAMPLES = {
  basic: { label: 'Values 1 … n', input: { range: 'one', arr: [3, 1, 5, 4, 2] } },
  duplicates: { label: 'With duplicates', input: { range: 'one', arr: [4, 3, 2, 7, 8, 2, 3, 1] } },
  missing: { label: 'Missing Number (0 … n)', input: { range: 'zero', arr: [3, 0, 4, 1] } },
  positive: { label: 'First Missing Positive', input: { range: 'positive', arr: [3, 4, -1, 1] } },
};

export const MAX_LEN = 10;

/** The Java the view shows, line by line; steps highlight lines by key (a key may cover several lines). */
export function codeFor(range, scan) {
  const place = range === 'zero'
    ? [
      ['init', 'int i = 0;'],
      ['loop', 'while (i < n) {'],
      ['home', '    int home = nums[i];'],
      ['test', '    if (home < n && nums[i] != nums[home])'],
      ['swap', '        swap(nums, i, home); // i stays'],
      ['else', '    else i++;'],
      ['end', '}'],
    ]
    : range === 'positive'
      ? [
        ['init', 'int i = 0;'],
        ['loop', 'while (i < n) {'],
        ['home', '    int v = nums[i], home = v - 1;'],
        ['test', '    if (v >= 1 && v <= n && nums[home] != v)'],
        ['swap', '        swap(nums, i, home); // i stays'],
        ['else', '    else i++;'],
        ['end', '}'],
      ]
      : [
        ['init', 'int i = 0;'],
        ['loop', 'while (i < n) {'],
        ['home', '    int home = nums[i] - 1;'],
        ['test', '    if (nums[i] != nums[home])'],
        ['swap', '        swap(nums, i, home); // i stays'],
        ['else', '    else i++;'],
        ['end', '}'],
      ];
  if (!scan) return place;
  const read = range === 'zero'
    ? [['scan', 'for (i = 0; i < n; i++)'], ['read', '    if (nums[i] != i) return i;'], ['ret', 'return n;']]
    : range === 'positive'
      ? [['scan', 'for (i = 0; i < n; i++)'], ['read', '    if (nums[i] != i + 1) return i + 1;'], ['ret', 'return n + 1;']]
      : [['scan', 'for (i = 0; i < n; i++)'], ['read', '    if (nums[i] != i + 1)'], ['found', '        missing.add(i + 1);'], ['found', '        duplicates.add(nums[i]);']];
  return [...place, ...read];
}

const plural = (k, word) => `${k} ${word}${k === 1 ? '' : 's'}`;
const dir = (from, to) => (to > from ? 'right' : 'left');
const list = (a) => `[${a.join(', ')}]`;

/** Number of cycles of a permutation of 1..n (for the "swaps = n − cycles" remark). */
function cycles(arr) {
  const seen = new Array(arr.length).fill(false);
  let c = 0;
  for (let k = 0; k < arr.length; k++) {
    if (seen[k]) continue;
    c++;
    for (let j = k; !seen[j]; j = arr[j] - 1) seen[j] = true;
  }
  return c;
}

export function simulate(input, range) {
  const n = input.length;
  const wants = (k) => (range === 'zero' ? k : k + 1);           // the value that belongs at index k
  const homeOf = (v) => (range === 'zero' ? v : v - 1);
  const hasHome = (v) => (range === 'zero' ? v >= 0 && v < n : v >= 1 && v <= n);
  const homeCalc = (v) => (range === 'zero' ? `home = ${v}` : `home = ${v} − 1 = ${v - 1}`);
  const distinct = new Set(input).size === n;
  const scan = range === 'one' ? (distinct ? null : 'all') : 'first';

  const cells = input.map((v, id) => ({ v, id }));
  const tags = {};                                                   // element id → 'spare' | 'nohome'
  const slots = {};                                                  // index → 'missing' | 'answer' (scan)
  const steps = [];
  let swaps = 0;
  const settled = () => cells.map((c, k) => (c.v === wants(k) ? k : -1)).filter((k) => k >= 0);
  const push = (s) => steps.push({ cells: cells.map((c) => ({ ...c })), tags: { ...tags }, slots: { ...slots }, swaps, settled: settled(), arrows: [], ...s });

  // ---- start
  const rule = range === 'zero' ? 'v belongs at index v' : 'v belongs at index v − 1';
  const intro = {
    one: `There are ${n} values, each between 1 and ${n}, so every value has a home: value v belongs at index v − 1. Index 0 wants 1, index 1 wants 2, and so on (the dashed boxes under the cells). i walks from left to right, and it only moves on when slot i can't change any more.`,
    zero: `There are ${n} slots and the values come from 0 … ${n} with one missing, so value v belongs at index v (the dashed boxes). The value ${n} has no slot of its own: if it is here, it will be left wherever it lands, and that slot will point to the missing number.`,
    positive: `Any values are allowed, but only 1 … ${n} can matter: ${n} values can cover at most 1 … ${n}, so the answer is somewhere in 1 … ${n + 1}. Values 1 … ${n} go home to index v − 1. Zero, negatives and anything above ${n} have no home and are left where they are.`,
  }[range];
  push({ phase: 'start', i: 0, lines: ['init'], kind: 'start', title: 'Start: every value has a home', text: intro, calc: [`n = ${n}`, `rule: ${rule}`, 'i = 0'] });

  // ---- placement
  let i = 0;
  while (i < n) {
    const v = cells[i].v;
    if (!hasHome(v)) {
      tags[cells[i].id] = 'nohome';
      const why = range === 'zero'
        ? `Values 0 … ${n - 1} live at their own index, but ${v} = n has no slot in an array of ${n}. Leave it here: whichever slot it ends up in is the slot the missing number should have had.`
        : `Only 1 … ${n} have a home in ${n} slots, and ${v} ${v < 1 ? 'is not positive' : `is bigger than ${n}`}, so it can't change the answer. Leave it where it is.`;
      push({
        phase: 'place', i, lines: ['home', 'test', 'else'], kind: 'nohome',
        title: `${v} has no home, so i moves on`,
        text: `i = ${i} holds ${v}. ${why} i moves to ${i + 1}.`,
        calc: range === 'zero' ? [`nums[${i}] = ${v}`, `home = ${v}`, `${v} < ${n}? no → no home`, '→ i++'] : [`v = nums[${i}] = ${v}`, `1 <= ${v} <= ${n}? no → no home`, '→ i++'],
      });
      i++;
      continue;
    }
    const h = homeOf(v);
    if (h === i) {
      push({
        phase: 'place', i, target: i, lines: ['home', 'test', 'else'], kind: 'athome',
        title: `${v} is already home, so i moves on`,
        text: `Index ${i} wants ${wants(i)}, and it holds ${v}. This slot is finished, so i moves to ${i + 1}.`,
        calc: [`nums[${i}] = ${v}`, homeCalc(v), `home == i: same slot, nothing to swap`, '→ i++'],
      });
      i++;
      continue;
    }
    const w = cells[h].v;
    if (w === v) {
      tags[cells[i].id] = 'spare';
      push({
        phase: 'place', i, target: h, lines: ['home', 'test', 'else'], kind: 'spare',
        arrows: [{ from: i, to: h, kind: 'blocked', label: `taken by another ${v}` }],
        title: `Index ${h} already holds a ${v}: this ${v} is a spare`,
        text: `i = ${i} holds ${v}. Its home, index ${h}, already holds a ${v}, so this copy is a spare: a duplicate with nowhere to go. Swapping two equal values would change nothing and repeat forever, so leave it here and move i to ${i + 1}. That is why the test compares nums[i] with nums[home], not with i + 1.`,
        calc: [`nums[${i}] = ${v}`, homeCalc(v), `nums[${h}] = ${v}`, `${v} == ${v} → spare copy, i++`],
      });
      i++;
      continue;
    }
    // a swap: first the plan, then the result
    const go = { from: i, to: h, label: `${v} → index ${h}` };
    const back = { from: h, to: i, label: `${w} → index ${i}` };
    push({
      phase: 'place', i, target: h, lines: ['home', 'test'], kind: 'plan',
      arrows: [{ ...go, kind: 'go' }, { ...back, kind: 'back' }],
      title: `Swap ${v} into its home at index ${h}`,
      text: `i = ${i} holds ${v}. ${v} belongs at index ${h}, to the ${dir(i, h)}, but index ${h} holds ${w}. Swap them: ${v} moves ${dir(i, h)} to index ${h} (top arrow), and ${w} moves ${dir(h, i)} to index ${i} (bottom arrow).`,
      calc: [`nums[${i}] = ${v}`, homeCalc(v), `nums[${h}] = ${w}`, range === 'zero' ? `${h} < ${n} and ${v} ≠ ${w} → swap` : `${v} ≠ ${w} → swap`],
    });
    const up = cells[i].id, down = cells[h].id;
    [cells[i], cells[h]] = [cells[h], cells[i]];
    swaps++;
    const wHome = hasHome(w) && homeOf(w) === i;
    const count = `Swaps so far: ${swaps}. Each swap sends at least one value home for good, so there can never be more than ${n} of them: O(n) in total.`;
    push({
      phase: 'place', i, target: h, lines: ['swap'], kind: 'swapped', swap: { up, down },
      arrows: [{ ...go, kind: 'done' }, { ...back, kind: 'done' }],
      title: wHome ? `One swap, two values home` : `${v} is home for good; ${w} is checked next`,
      text: wHome
        ? `${v} landed at index ${h}, its home, and ${w} landed at index ${i}, which is exactly ${w}'s home too. Both are finished (✓) and will never move again. i stays at ${i} for one more look, which will find it already home. ${count}`
        : `${v} is now at index ${h}, its home, and will never move again (✓). ${w} landed at index ${i} but hasn't been checked yet, so i stays at ${i}. That is the key move: after a swap, look at the same slot again. ${count}`,
      calc: [`swap(nums, ${i}, ${h})`, `nums[${h}] = ${v} ✓ home`, wHome ? `nums[${i}] = ${w} ✓ home` : `nums[${i}] = ${w} (not checked yet)`, `i stays ${i}`],
    });
  }

  // ---- placement finished
  const home = settled().length;
  if (!scan) {
    const c = cycles(input);
    push({
      phase: 'done', i: null, lines: ['end'], kind: 'done', answer: `sorted with ${plural(swaps, 'swap')}`,
      title: `Sorted: ${plural(swaps, 'swap')} for ${n} values`,
      text: `i has walked off the end and every value is home. It took ${plural(swaps, 'swap')}, never more than n − 1 = ${n - 1}, because each swap sent a value home for good. No two values were ever compared to decide an order: the only question was "where does this value belong?". (${swaps} = ${n} values − ${plural(c, 'cycle')}, the minimum possible: see the cycles section below.)`,
      calc: [`swaps = ${swaps}`, `n − 1 = ${n - 1}`, `values home = ${home} / ${n}`],
    });
    return steps;
  }
  push({
    phase: 'placed', i: null, lines: ['end'], kind: 'placed',
    title: `Placement done after ${plural(swaps, 'swap')}`,
    text: scan === 'all'
      ? `i has walked off the end. Every value that appears is now at its home (✓). A slot still holding the wrong number is a slot nobody came home to. One scan from left to right reads the answer off the array.`
      : `i has walked off the end. Every value that has a home and appears in the array is now in it (✓). One scan from the left finds the first slot that doesn't hold its own number.`,
    calc: [`swaps = ${swaps}`, `values home = ${home} / ${n}`],
  });

  // ---- read the answer
  if (scan === 'all') {
    const missing = [], dups = [];
    for (let k = 0; k < n; k++) {
      const x = cells[k].v;
      if (x === wants(k)) continue;
      missing.push(k + 1);
      dups.push(x);
      slots[k] = 'missing';
      push({
        phase: 'scan', i: k, lines: ['scan', 'read', 'found'], kind: 'scan',
        title: `Index ${k} wants ${k + 1} but holds ${x}`,
        text: `Nobody came home to index ${k}, so ${k + 1} is missing from the array. And ${x} is sitting here because its own home was already taken: it is a spare copy, a duplicate.${k > 0 && missing.length === 1 ? ` (Slots 0 … ${k - 1} hold their own numbers, so nothing is missing there.)` : ''}`,
        calc: [`nums[${k}] = ${x} ≠ ${k + 1}`, `missing → ${list(missing)}`, `duplicates → ${list(dups)}`],
      });
    }
    push({
      phase: 'done', i: null, lines: ['scan'], kind: 'done', answer: `missing ${list(missing)} · duplicates ${list(dups)}`,
      title: 'Done: one placement pass, one scan',
      text: `Missing: ${list(missing)}. Duplicates: ${list(dups)}. Find All Numbers Disappeared returns the first list, Find All Duplicates the second, and Set Mismatch (exactly one wrong slot) returns [duplicate, missing]. O(n) time and no extra memory beyond the answer.`,
      calc: [`missing = ${list(missing)}`, `duplicates = ${list(dups)}`],
    });
    return steps;
  }

  let k = 0;
  while (k < n && cells[k].v === wants(k)) k++;
  const okBefore = k > 0 ? `Slots 0 … ${k - 1} hold their own numbers (✓). ` : '';
  if (k < n) {
    const ans = range === 'zero' ? k : k + 1;
    slots[k] = 'answer';
    push({
      phase: 'done', i: k, lines: ['scan', 'read'], kind: 'done', answer: range === 'zero' ? `missing number = ${ans}` : `first missing positive = ${ans}`,
      title: `Index ${k} wants ${wants(k)} but holds ${cells[k].v}: the answer is ${ans}`,
      text: `${okBefore}Index ${k} should hold ${wants(k)}, but nobody came home here, so ${ans} is ${range === 'zero' ? 'the missing number' : 'the smallest positive number that is not in the array'}. O(n) time, O(1) extra space.`,
      calc: [`nums[${k}] = ${cells[k].v} ≠ ${wants(k)}`, `return ${range === 'zero' ? 'i' : 'i + 1'} = ${ans}`],
    });
  } else {
    const ans = range === 'zero' ? n : n + 1;
    push({
      phase: 'done', i: null, lines: ['ret'], kind: 'done', answer: range === 'zero' ? `missing number = ${ans}` : `first missing positive = ${ans}`,
      title: `Every slot is right: the answer is ${ans}`,
      text: `${okBefore}All ${n} slots hold their own number, so ${range === 'zero' ? `0 … ${n - 1} are all present and the missing one is n = ${n}` : `1 … ${n} are all present and the answer is n + 1 = ${n + 1}`}.`,
      calc: [`no slot is wrong`, `return ${range === 'zero' ? 'n' : 'n + 1'} = ${ans}`],
    });
  }
  return steps;
}

/** Parse a learner's array for a range: { arr } or { error }. */
export function parseInput(text, range) {
  const parts = text.replace(/[−–]/g, '-').replace(/[[\]]/g, ' ').split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return { error: 'Type a few whole numbers, separated by commas.' };
  if (parts.length > MAX_LEN) return { error: `Use at most ${MAX_LEN} numbers so every cell stays readable.` };
  const arr = parts.map(Number);
  if (arr.some((x) => !Number.isInteger(x))) return { error: 'Whole numbers only, for example 3, 1, 2.' };
  const n = arr.length;
  if (range === 'one' && arr.some((x) => x < 1 || x > n)) return { error: `With ${n} numbers, every value must be between 1 and ${n}.` };
  if (range === 'zero') {
    if (arr.some((x) => x < 0 || x > n)) return { error: `With ${n} numbers, every value must be between 0 and ${n}.` };
    if (new Set(arr).size !== n) return { error: 'Missing Number needs distinct values: exactly one number of 0 … n is left out.' };
  }
  if (range === 'positive' && arr.some((x) => x < -99 || x > 99)) return { error: 'Keep values between −99 and 99 so they fit in the cells.' };
  return { arr };
}

/** A random valid input for a range (5 to 8 values). */
export function randomInput(range, rand = Math.random) {
  const n = 5 + Math.floor(rand() * 4);
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };
  if (range === 'zero') return shuffle(Array.from({ length: n + 1 }, (_, k) => k)).slice(0, n);
  if (range === 'positive') return Array.from({ length: n }, () => int(-3, n + 2));
  return rand() < 0.5 ? shuffle(Array.from({ length: n }, (_, k) => k + 1)) : Array.from({ length: n }, () => int(1, n));
}
