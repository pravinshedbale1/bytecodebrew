/**
 * Sliding-window step-throughs (model for <SlidingWindowViz>): the longest valid window, the shortest
 * valid window and a fixed size k. Pure, so scripts/viz-check.mjs can test them against brute force.
 */
import { list, parseInt1, parseInts, q, rng } from './util.js';

export const WINDOW = {
  longest: { label: 'Longest: no repeated letter', input: { mode: 'longest', s: 'abcbdcab' } },
  shortest: { label: 'Shortest: sum ≥ target', input: { mode: 'shortest', nums: [2, 3, 1, 2, 4, 3], target: 7 } },
  fixed: { label: 'Fixed size k', input: { mode: 'fixed', nums: [2, 1, 5, 1, 3, 2], k: 3 } },
};

export const windowCode = {
  longest: [
    ['init', 'int left = 0, best = 0;'],
    ['loop', 'for (int right = 0; right < s.length(); right++) {'],
    ['add', '    count.merge(s.charAt(right), 1, Integer::sum);   // 1. expand'],
    ['while', '    while (count.get(s.charAt(right)) > 1)           // invalid?'],
    ['remove', '        count.merge(s.charAt(left++), -1, Integer::sum); // 2. shrink'],
    ['record', '    best = Math.max(best, right - left + 1);          // 3. record'],
    ['end', '}'],
  ],
  shortest: [
    ['init', 'int left = 0, sum = 0, best = Integer.MAX_VALUE;'],
    ['loop', 'for (int right = 0; right < nums.length; right++) {'],
    ['add', '    sum += nums[right];                    // 1. expand'],
    ['while', '    while (sum >= target) {                // valid: shrink while it lasts'],
    ['record', '        best = Math.min(best, right - left + 1);'],
    ['remove', '        sum -= nums[left++];'],
    ['close', '    }'],
    ['end', '}'],
    ['ret', 'return best == Integer.MAX_VALUE ? 0 : best;'],
  ],
  fixed: [
    ['first', 'for (int i = 0; i < k; i++) sum += a[i];          // the first window'],
    ['init', 'long best = sum;'],
    ['loop', 'for (int right = k; right < a.length; right++) {'],
    ['slide', '    sum += a[right] - a[right - k];   // add the new, drop the oldest'],
    ['best', '    best = Math.max(best, sum);'],
    ['end', '}'],
  ],
};

const word = (s, L, R) => (R < L ? '' : s.slice(L, R + 1));

function longest(s) {
  const n = s.length;
  const count = {};
  const steps = [];
  let L = 0, best = 0, bestWin = null;
  const snap = (x) => steps.push({ L, best, bestWin, count: { ...count }, ...x });
  snap({
    kind: 'start', R: -1, lines: ['init'],
    title: 'An empty window',
    text: `Find the longest substring of "${s}" with no repeated letter. The window s[L..R] is always kept valid: R adds one letter per step; if that letter is now repeated, L removes letters from the left until it isn't. The window's letter counts are listed under the string.`,
    calc: ['L = 0, best = 0', 'counts = { }'],
  });
  for (let R = 0; R < n; R++) {
    const c = s[R];
    count[c] = (count[c] ?? 0) + 1;
    if (count[c] === 1) {
      const before = best;
      const better = R - L + 1 > best;
      if (better) { best = R - L + 1; bestWin = [L, R]; }
      snap({
        kind: 'expand', R, added: R, dup: null, better, lines: ['loop', 'add', 'while', 'record'],
        title: `Add ${q(c)}: "${word(s, L, R)}" has no repeats`,
        text: `R moves to ${R} and ${q(c)} enters the window. It appears once, so the window "${word(s, L, R)}" is still valid. Its length is ${R - L + 1}${better ? ', a new best' : `; the best stays ${best}`}.`,
        calc: [`count[${q(c)}] = 1 → valid`, `length = ${R} − ${L} + 1 = ${R - L + 1}`, `best = max(${before}, ${R - L + 1}) = ${best}`],
      });
      continue;
    }
    snap({
      kind: 'invalid', R, added: R, dup: c, lines: ['loop', 'add', 'while'],
      title: `Add ${q(c)}: now ${q(c)} appears twice`,
      text: `R moves to ${R} and ${q(c)} enters, but the window "${word(s, L, R)}" already had one. Two ${q(c)}s break the rule, so this window can't be recorded. Shrink from the left until one ${q(c)} has left.`,
      calc: [`count[${q(c)}] = 2 > 1 → invalid`, 'shrink: L++ until count[c] == 1'],
    });
    while (count[c] > 1) {
      const d = s[L];
      count[d]--;
      if (count[d] === 0) delete count[d];
      L++;
      const ok = count[c] === 1;
      const before = best;
      const better = ok && R - L + 1 > best;
      if (better) { best = R - L + 1; bestWin = [L, R]; }
      snap({
        kind: ok ? 'fixed' : 'shrink', R, removed: L - 1, dup: ok ? null : c, better, lines: ok ? ['remove', 'record'] : ['while', 'remove'],
        title: ok ? `Remove ${q(d)}: valid again, length ${R - L + 1}` : `Remove ${q(d)}: still two ${q(c)}s`,
        text: ok
          ? `${q(d)} leaves the window and L moves to ${L}. ${d === c ? `That was the earlier ${q(c)}` : `The earlier ${q(c)} is gone now`}, so "${word(s, L, R)}" has no repeats. Record its length ${R - L + 1}${better ? ', a new best' : `; the best stays ${best}`}.`
          : `${q(d)} leaves the window and L moves to ${L}. The window "${word(s, L, R)}" still holds two ${q(c)}s, so keep shrinking. (Each letter leaves the window at most once in the whole run.)`,
        calc: ok
          ? [`count[${q(d)}]-- , L = ${L}`, `count[${q(c)}] = 1 → valid`, `best = max(${before}, ${R - L + 1}) = ${best}`]
          : [`count[${q(d)}]-- , L = ${L}`, `count[${q(c)}] = 2 → still invalid`],
      });
    }
  }
  snap({
    kind: 'done', R: n - 1, lines: ['end'], answer: `longest = ${best}${bestWin ? ` ("${word(s, bestWin[0], bestWin[1])}")` : ''}`,
    title: `Done: the longest is ${best}`,
    text: `R moved ${n} times and L only ever moved forward, so each letter entered the window once and left at most once: O(n), even with the inner while loop. Brute force would check all ${(n * (n + 1)) / 2} substrings.`,
    calc: [`best = ${best}`],
  });
  return steps;
}

function shortest(nums, target) {
  const n = nums.length;
  const steps = [];
  let L = 0, sum = 0, best = Infinity, bestWin = null;
  const shown = () => (best === Infinity ? '∞' : best);
  const snap = (x) => steps.push({ L, sum, best: shown(), bestWin, ...x });
  snap({
    kind: 'start', R: -1, lines: ['init'],
    title: 'An empty window, sum 0',
    text: `Find the shortest subarray with sum ≥ ${target} (all numbers are positive). R adds numbers until the window is valid; then L removes numbers while it stays valid, recording every valid length on the way. Positive numbers are what make this work: removing one always lowers the sum.`,
    calc: ['L = 0, sum = 0', 'best = ∞'],
  });
  for (let R = 0; R < n; R++) {
    sum += nums[R];
    if (sum < target) {
      snap({
        kind: 'expand', R, added: R, valid: false, lines: ['loop', 'add', 'while'],
        title: `Add ${nums[R]}: sum ${sum} < ${target}, not enough yet`,
        text: `R moves to ${R}; the window ${list(nums.slice(L, R + 1))} sums to ${sum}, still below ${target}. Keep expanding.`,
        calc: [`sum += ${nums[R]} → ${sum}`, `${sum} < ${target} → keep expanding`],
      });
      continue;
    }
    let first = true;
    while (sum >= target) {
      const before = shown();
      const len = R - L + 1;
      const better = len < best;
      if (better) { best = len; bestWin = [L, R]; }
      const removed = nums[L];
      if (first) {
        snap({
          kind: 'valid', R, added: R, valid: true, better, lines: ['add', 'while', 'record'],
          title: `Add ${nums[R]}: sum ${sum} ≥ ${target}, valid: record length ${len}`,
          text: `R moves to ${R}; the window ${list(nums.slice(L, R + 1))} sums to ${sum}, enough. Record its length ${len}${better ? ', the best so far' : `; the best stays ${shown()}`}. A shorter valid window might hide inside it, so now try removing from the left.`,
          calc: [`sum += ${nums[R]} → ${sum}`, `${sum} ≥ ${target} → valid`, `best = min(${before}, ${len}) = ${shown()}`],
        });
        first = false;
      } else {
        snap({
          kind: 'record', R, valid: true, better, lines: ['while', 'record'],
          title: `Still ${sum} ≥ ${target}: record length ${len}`,
          text: `After removing from the left the window ${list(nums.slice(L, R + 1))} still sums to ${sum}, so it is valid and shorter: length ${len}${better ? ', the best so far' : `; the best stays ${shown()}`}. Try removing one more.`,
          calc: [`${sum} ≥ ${target} → valid`, `best = min(${before}, ${len}) = ${shown()}`],
        });
      }
      sum -= removed;
      L++;
      snap({
        kind: 'shrink', R, removed: L - 1, valid: sum >= target, lines: ['remove', 'while'],
        title: `Remove ${removed}: sum ${sum}${sum >= target ? ` ≥ ${target}, still valid` : ` < ${target}, stop shrinking`}`,
        text: sum >= target
          ? `${removed} leaves the window and L moves to ${L}. The sum is still ${sum} ≥ ${target}, so this shorter window is valid too.`
          : `${removed} leaves the window and L moves to ${L}. Now the sum is ${sum}, below ${target}: no window ending at R = ${R} can be shorter, so go back to expanding R.`,
        calc: [`sum −= ${removed} → ${sum}`, sum >= target ? `${sum} ≥ ${target} → keep shrinking` : `${sum} < ${target} → expand again`],
      });
    }
  }
  const ans = best === Infinity ? 0 : best;
  snap({
    kind: 'done', R: n - 1, lines: ['ret'], answer: `shortest = ${ans}`,
    title: best === Infinity ? 'Done: no window reaches the target' : `Done: the shortest is ${ans}`,
    text: best === Infinity
      ? `Even the whole array sums to less than ${target}, so return 0.`
      : `Return ${ans}. Each number entered once and left at most once, so O(n). With negative numbers this breaks (removing could raise the sum): use prefix sums instead.`,
    calc: [`best = ${shown()}`, `return ${ans}`],
  });
  return steps;
}

function fixed(nums, k) {
  const n = nums.length;
  const steps = [];
  let sum = 0, best = -Infinity, bestWin = null;
  const snap = (x) => steps.push({ sum, best: best === -Infinity ? '–' : best, bestWin, ...x });
  snap({
    kind: 'start', L: 0, R: -1, lines: ['first'],
    title: `A window of exactly ${k}`,
    text: `Find the largest sum of ${k} consecutive numbers. Build the first window once, then slide it one step at a time: one number enters on the right and one leaves on the left, so each slide costs O(1) instead of re-adding ${k} numbers.`,
    calc: [`k = ${k}`, 'sum = 0'],
  });
  for (let i = 0; i < k; i++) {
    sum += nums[i];
    if (i === k - 1) { best = sum; bestWin = [0, k - 1]; }
    snap({
      kind: 'build', L: 0, R: i, added: i, lines: i === k - 1 ? ['first', 'init'] : ['first'],
      title: i === k - 1 ? `First window complete: sum ${sum}` : `Build the first window: add ${nums[i]}`,
      text: i === k - 1
        ? `The first ${k} numbers ${list(nums.slice(0, k))} sum to ${sum}. That is the best so far, because it is the only window seen.`
        : `Adding ${nums[i]}: running sum ${sum}. ${k - i - 1} more to complete the first window.`,
      calc: [`sum += ${nums[i]} → ${sum}`, ...(i === k - 1 ? [`best = ${sum}`] : [])],
    });
  }
  for (let R = k; R < n; R++) {
    const inV = nums[R], outV = nums[R - k];
    const before = best;
    sum += inV - outV;
    const better = sum > best;
    if (better) { best = sum; bestWin = [R - k + 1, R]; }
    snap({
      kind: 'slide', L: R - k + 1, R, added: R, removed: R - k, better, lines: ['loop', 'slide', 'best'],
      title: `Slide: +${inV} in, −${outV} out → sum ${sum}${better ? ', a new best' : ''}`,
      text: `The window moves one step right. ${inV} enters at index ${R} and ${outV} leaves from index ${R - k}, so the new sum is ${sum - inV + outV} + ${inV} − ${outV} = ${sum}. ${better ? 'That beats the best so far.' : `The best stays ${best}.`}`,
      calc: [`sum += a[${R}] − a[${R - k}] = ${inV} − ${outV}`, `sum = ${sum}`, `best = max(${before}, ${sum}) = ${best}`],
    });
  }
  snap({
    kind: 'done', L: bestWin[0], R: bestWin[1], lines: ['end'], answer: `max sum = ${best}`,
    title: `Done: the largest window sum is ${best}`,
    text: `${n - k + 1} windows, each updated in O(1): O(n) in total instead of O(n · k). The best window is ${list(nums.slice(bestWin[0], bestWin[1] + 1))}.`,
    calc: [`best = ${best}`],
  });
  return steps;
}

export function slidingWindow(input) {
  if (input.mode === 'longest') return longest(input.s);
  if (input.mode === 'shortest') return shortest(input.nums, input.target);
  return fixed(input.nums, input.k);
}

export function parseWindow(values, input) {
  if (input.mode === 'longest') {
    const s = String(values.s ?? '').trim().toLowerCase();
    if (!/^[a-z]{1,12}$/.test(s)) return { error: 'Type 1 to 12 lowercase letters, for example abcabcbb.' };
    return { input: { mode: 'longest', s } };
  }
  const a = parseInts(values.nums, { min: input.mode === 'shortest' ? 1 : -99, max: 99, minLen: 1, maxLen: 12, name: 'nums' });
  if (a.error) return a;
  if (input.mode === 'shortest') {
    const t = parseInt1(values.target, { min: 1, max: 999, name: 'target' });
    return t.error ? t : { input: { mode: 'shortest', nums: a.arr, target: t.v } };
  }
  const k = parseInt1(values.k, { min: 1, max: a.arr.length, name: 'k' });
  return k.error ? { error: `k must be between 1 and ${a.arr.length} (the length of nums).` } : { input: { mode: 'fixed', nums: a.arr, k: k.v } };
}

export function randomWindow(input, rand = Math.random) {
  const r = rng(rand);
  if (input.mode === 'longest') return { mode: 'longest', s: Array.from({ length: r.int(6, 12) }, () => 'abcde'[r.int(0, r.int(2, 4))]).join('') };
  const n = r.int(6, 10);
  if (input.mode === 'shortest') {
    const nums = Array.from({ length: n }, () => r.int(1, 9));
    return { mode: 'shortest', nums, target: r.int(5, 22) };
  }
  return { mode: 'fixed', nums: Array.from({ length: n }, () => r.int(-5, 12)), k: r.int(2, 4) };
}

