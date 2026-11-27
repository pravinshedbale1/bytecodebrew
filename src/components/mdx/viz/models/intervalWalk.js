/**
 * <IntervalWalkViz>: Intervals walkthroughs (Practice thinking), one mode per problem. Built with walkKit.
 *   rooms      meeting rooms: sort by start, compare neighbours
 *   insert     insert interval: before / overlapping / after, in one pass
 *   arrows     minimum arrows: sort by end, shoot at the end
 *   inter      interval list intersections: two pointers, advance the earlier end
 *   covered    remove covered intervals: start ↑, end ↓ on ties, furthest end so far
 *   queries    minimum interval per query: sorted queries + a heap by size
 *   rooms3     meeting rooms III: free rooms by number, busy rooms by end time
 */
import { list, plural } from './util.js';
import { P, strip, makeWalk } from './walkKit.js';

const iv = (p) => `[${p[0]}, ${p[1]}]`;
const ivs = (a) => (a.length ? a.map(iv).join(', ') : 'none');
const byStart = (a) => [...a].sort((p, q) => p[0] - q[0] || p[1] - q[1]);

const MODES = {
  rooms: {
    code: [['sort', 'sort(intervals by start);'], ['cmp', 'for (int i = 1; i < n; i++) if (a[i].start < a[i - 1].end) return false;'], ['ok', 'return true;']],
    fields: [{ name: 'list', label: 'meetings', type: 'pairs', placeholder: '[0, 30], [5, 10], [15, 20]', maxLen: 6, minLen: 0 }],
    random: (g) => ({ list: Array.from({ length: g.int(0, 5) }, () => { const a = g.int(0, 20); return [a, a + g.int(1, 6)]; }) }),
    brute: ({ list: a }) => { for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i][0] < a[j][1] && a[j][0] < a[i][1]) return false; return true; },
    describe: ({ list: a }) => `meetings ${ivs(a)}`,
    rule: 'sorted by start, a clash shows up between neighbours',
    run({ list: a }, snap) {
      const s = byStart(a);
      const view = (i, bad) => [strip('sorted by start', s.map(iv), { index: false, cls: i >= 1 ? { [i - 1]: bad ? 'bad' : 'hit', [i]: bad ? 'bad' : 'cur' } : {} })];
      snap({ kind: 'start', lines: ['sort'], parts: view(-1), title: `Sort by start: ${ivs(s)}`, text: 'One person can attend everything only if no two meetings overlap. After sorting by start, if any two meetings clash then some pair of neighbours clashes too, so one pass over neighbours decides it. A meeting ending at t and one starting at t do not clash.', calc: [plural(s.length, 'meeting')] });
      for (let i = 1; i < s.length; i++) {
        if (s[i][0] < s[i - 1][1]) { snap({ kind: 'fail', lines: ['cmp'], parts: view(i, true), out: false, answer: 'false', title: `${iv(s[i])} starts at ${s[i][0]}, before ${iv(s[i - 1])} ends → false`, text: `${s[i][0]} < ${s[i - 1][1]}: the two overlap, so one person can't attend both.`, calc: [`${s[i][0]} < ${s[i - 1][1]}`] }); return; }
        snap({ kind: 'keep', lines: ['cmp'], parts: view(i, false), title: `${iv(s[i])} starts at ${s[i][0]} ≥ ${s[i - 1][1]} ✓`, text: `It starts no earlier than the previous meeting ends${s[i][0] === s[i - 1][1] ? ' (touching is fine)' : ''}.`, calc: [`${s[i][0]} ≥ ${s[i - 1][1]}`] });
      }
      snap({ kind: 'done', lines: ['ok'], parts: view(-1), out: true, answer: 'true', title: 'No clash → true', text: 'O(n log n) for the sort, then one linear pass.', calc: ['true'] });
    },
  },

  insert: {
    code: [['before', 'while (i < n && a[i].end < new.start) out.add(a[i++]);        // entirely before'], ['merge', 'while (i < n && a[i].start <= new.end) new = [min starts, max ends], i++;'], ['add', 'out.add(new);'], ['after', 'while (i < n) out.add(a[i++]);                               // entirely after']],
    fields: [{ name: 'list', label: 'intervals (sorted, separate)', type: 'pairs', placeholder: '[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]', maxLen: 6, minLen: 0 }, { name: 'nw', label: 'new interval', type: 'pairs', placeholder: '[4, 8]', minLen: 1, maxLen: 1 }],
    valid: ({ list: a }) => (a.some((p, k) => k && a[k - 1][1] >= p[0]) ? 'intervals must be sorted by start and not overlap or touch.' : ''),
    random: (g) => { const a = []; let x = g.int(0, 3); for (let k = g.int(0, 5); k > 0; k--) { const e = x + g.int(0, 3); a.push([x, e]); x = e + g.int(1, 4); } const s = g.int(0, 18); return { list: a, nw: [[s, s + g.int(0, 8)]] }; },
    brute: ({ list: a, nw }) => { const all = byStart([...a, nw[0]]); const out = []; for (const p of all) { if (out.length && p[0] <= out.at(-1)[1]) out.at(-1)[1] = Math.max(out.at(-1)[1], p[1]); else out.push([...p]); } return out; },
    describe: ({ list: a, nw }) => `${ivs(a)} + ${iv(nw[0])}`,
    rule: 'before, overlapping (merge), after: one pass',
    run({ list: a, nw }, snap) {
      let cur = [...nw[0]], i = 0;
      const out = [];
      const view = (cls = {}) => [strip('intervals', a.length ? a.map(iv) : ['—'], { index: false, cls }), P.chips('new', [{ key: 'n', text: iv(cur), tone: 'accent' }]), P.chips('result', out.map((p, k) => ({ key: String(k), text: iv(p), tone: 'success' })), 'empty')];
      snap({ kind: 'start', lines: ['before'], parts: view(), title: `Insert ${iv(cur)}`, text: 'The list is already sorted and separate, so it splits into three runs: intervals that end before the new one starts, intervals that overlap it (merged into it), and intervals that start after it ends. One pass, no sort.', calc: [plural(a.length, 'interval')] });
      while (i < a.length && a[i][1] < cur[0]) { out.push(a[i]); snap({ kind: 'keep', lines: ['before'], parts: view({ [i]: 'kept' }), title: `${iv(a[i])} ends before ${cur[0]}: copy it`, text: `It finishes at ${a[i][1]}, before the new interval starts at ${cur[0]}, so they can't overlap.`, calc: [`${a[i][1]} < ${cur[0]}`] }); i++; }
      while (i < a.length && a[i][0] <= cur[1]) { const before = iv(cur); cur = [Math.min(cur[0], a[i][0]), Math.max(cur[1], a[i][1])]; snap({ kind: 'merge', lines: ['merge'], parts: view({ [i]: 'cur' }), title: `${iv(a[i])} overlaps: ${before} → ${iv(cur)}`, text: `It starts at ${a[i][0]}, no later than the new interval's end, so they overlap (touching counts). Merge: smaller start, larger end.`, calc: [`new = ${iv(cur)}`] }); i++; }
      out.push(cur);
      snap({ kind: 'add', lines: ['add'], parts: view(), title: `Add ${iv(cur)}`, text: i < a.length ? `${iv(a[i])} starts after ${cur[1]}, so nothing more can join: place the new interval now.` : 'Nothing is left to merge: place the new interval.', calc: [`placed ${iv(cur)}`] });
      if (i < a.length) { const rest = a.slice(i); out.push(...rest); snap({ kind: 'keep', lines: ['after'], parts: view(Object.fromEntries(rest.map((_, k) => [i + k, 'kept']))), title: `Copy the rest: ${ivs(rest)}`, text: 'Everything after starts later still, so it is copied unchanged.', calc: [`${rest.length} copied`] }); }
      snap({ kind: 'done', lines: ['after'], parts: view(), out: out.map((p) => [...p]), answer: `[${out.map(list).join(', ')}]`, title: `Result: ${ivs(out)}`, text: 'Every interval was looked at once: O(n).', calc: [ivs(out)] });
    },
  },

  arrows: {
    code: [['sort', 'sort(points by end);'], ['shoot', 'arrows = 1;  x = first end;'], ['loop', 'for each balloon: if (start > x) { arrows++; x = its end; }   // else already burst'], ['ret', 'return arrows;']],
    fields: [{ name: 'list', label: 'balloons', type: 'pairs', placeholder: '[10, 16], [2, 8], [1, 6], [7, 12]', maxLen: 6 }],
    random: (g) => ({ list: Array.from({ length: g.int(1, 6) }, () => { const a = g.int(0, 15); return [a, a + g.int(0, 6)]; }) }),
    brute: ({ list: a }) => { const pts = [...new Set(a.flat())]; const n = a.length; for (let k = 1; k <= n; k++) { const pick = (start, chosen) => { if (chosen.length === k) return a.every(([s, e]) => chosen.some((x) => s <= x && x <= e)); for (let i = start; i < pts.length; i++) if (pick(i + 1, [...chosen, pts[i]])) return true; return false; }; if (pick(0, [])) return k; } return n; },
    describe: ({ list: a }) => `balloons ${ivs(a)}`,
    rule: 'shoot at the earliest end',
    run({ list: a }, snap) {
      const s = [...a].sort((p, q) => p[1] - q[1] || p[0] - q[0]);
      let x = s[0][1], arrows = 1;
      const shots = [x];
      const view = (i, cls = {}) => [strip('sorted by end', s.map(iv), { index: false, cls: { ...Object.fromEntries(s.map((_, k) => [k, k < i ? 'kept' : ''])), ...cls } }), P.chips('arrows at', shots.map((v, k) => ({ key: String(k), text: `x = ${v}`, tone: 'accent' })))];
      snap({ kind: 'start', lines: ['sort', 'shoot'], parts: view(0, { 0: 'hit' }), title: `Sort by end; first arrow at ${x}`, text: `The balloon that ends first, ${iv(s[0])}, must be hit at or before ${x}. Shooting exactly at ${x} is never worse: it also bursts every balloon that has started by then.`, calc: [`x = ${x}`] });
      for (let i = 1; i < s.length; i++) {
        if (s[i][0] > x) { arrows++; x = s[i][1]; shots.push(x); snap({ kind: 'add', lines: ['loop'], parts: view(i, { [i]: 'cur' }), title: `${iv(s[i])} starts after ${shots.at(-2)}: arrow ${arrows} at ${x}`, text: `No arrow so far reaches it. It is now the unburst balloon that ends first, so the same rule applies: shoot at its end, ${x}.`, calc: [`arrows = ${arrows}`] }); } else snap({ kind: 'skip', lines: ['loop'], parts: view(i, { [i]: 'hit' }), title: `${iv(s[i])} contains ${x}: already burst`, text: `It starts at ${s[i][0]} ≤ ${x} and, being later in end order, ends at ${s[i][1]} ≥ ${x}: the arrow at ${x} passes through it.`, calc: [`${s[i][0]} ≤ ${x} ≤ ${s[i][1]}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(s.length), out: arrows, answer: String(arrows), title: `${plural(arrows, 'arrow')}`, text: 'O(n log n) for the sort, then one pass. Compare values rather than subtracting them in the comparator: the real coordinates reach ±2³¹.', calc: [`arrows = ${arrows}`] });
    },
  },

  inter: {
    code: [['ptrs', 'int i = 0, j = 0;'], ['ov', 'lo = max(A[i].start, B[j].start);  hi = min(A[i].end, B[j].end);  if (lo <= hi) add [lo, hi];'], ['adv', 'if (A[i].end < B[j].end) i++; else j++;   // the one that ends first is finished'], ['ret', 'until either list runs out']],
    fields: [{ name: 'A', label: 'first list', type: 'pairs', placeholder: '[0, 2], [5, 10], [13, 23], [24, 25]', maxLen: 4, minLen: 0 }, { name: 'B', label: 'second list', type: 'pairs', placeholder: '[1, 5], [8, 12], [15, 24], [25, 26]', maxLen: 4, minLen: 0 }],
    valid: ({ A, B }) => (A.some((p, k) => k && A[k - 1][1] >= p[0]) || B.some((p, k) => k && B[k - 1][1] >= p[0]) ? 'each list must be sorted and its intervals separate.' : ''),
    random: (g) => { const mk = () => { const a = []; let x = g.int(0, 3); for (let k = g.int(0, 4); k > 0; k--) { const e = x + g.int(0, 4); a.push([x, e]); x = e + g.int(1, 3); } return a; }; return { A: mk(), B: mk() }; },
    brute: ({ A, B }) => { const out = []; for (const a of A) for (const b of B) { const lo = Math.max(a[0], b[0]), hi = Math.min(a[1], b[1]); if (lo <= hi) out.push([lo, hi]); } return byStart(out); },
    describe: ({ A, B }) => `${ivs(A)} and ${ivs(B)}`,
    rule: 'record the overlap, advance whichever ends first',
    run({ A, B }, snap) {
      let i = 0, j = 0;
      const out = [];
      const view = () => [strip('A', A.length ? A.map(iv) : ['—'], { index: false, cls: Object.fromEntries(A.map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), strip('B', B.length ? B.map(iv) : ['—'], { index: false, cls: Object.fromEntries(B.map((_, k) => [k, k === j ? 'cur' : k < j ? 'dim' : ''])) }), P.chips('overlaps', out.map((p, k) => ({ key: String(k), text: iv(p), tone: 'success' })), 'none yet')];
      snap({ kind: 'start', lines: ['ptrs'], parts: view(), title: 'One pointer per list', text: 'Both lists are sorted and separate, so walk them together like a merge. Two intervals overlap in [larger start, smaller end] when that isn\'t empty. The one that ends first can\'t meet anything later in the other list, so it is done.', calc: ['i = 0, j = 0'] });
      while (i < A.length && j < B.length) {
        const lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]);
        if (lo <= hi) out.push([lo, hi]);
        const adv = A[i][1] < B[j][1] ? 'i' : 'j';
        snap({ kind: lo <= hi ? 'found' : 'skip', lines: ['ov', 'adv'], parts: view(), title: lo <= hi ? `${iv(A[i])} & ${iv(B[j])} → ${iv([lo, hi])}` : `${iv(A[i])} & ${iv(B[j])}: no overlap`, text: `${lo <= hi ? `Larger start ${lo}, smaller end ${hi}${lo === hi ? ': a single point' : ''}.` : `The larger start ${lo} is after the smaller end ${hi}.`} ${adv === 'i' ? `${iv(A[i])} ends first: advance the first list.` : `${iv(B[j])} ends first (or they end together): advance the second list.`}`, calc: [`${plural(out.length, 'overlap')}`] });
        if (adv === 'i') i++; else j++;
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(), out: out.map((p) => [...p]), answer: out.length ? `[${out.map(list).join(', ')}]` : '[]', title: `${plural(out.length, 'overlap')}`, text: 'Each step advances one pointer, so O(m + n) steps in total.', calc: [ivs(out)] });
    },
  },

  covered: {
    code: [['sort', 'sort by start ascending, end descending on ties;'], ['loop', 'for each interval: if (end <= far) covered++;   // something before it reaches further'], ['far', '    else far = end;'], ['ret', 'return n − covered;']],
    fields: [{ name: 'list', label: 'intervals', type: 'pairs', placeholder: '[1, 4], [3, 6], [2, 8]', maxLen: 6 }],
    valid: ({ list: a }) => (new Set(a.map(iv)).size !== a.length ? 'intervals must be different from each other.' : ''),
    random: (g) => ({ list: Array.from({ length: g.int(1, 6) }, () => { const s = g.int(0, 10); return [s, s + g.int(1, 6)]; }) }),
    brute: ({ list: a }) => a.filter((p, i) => !a.some((q, j) => j !== i && q[0] <= p[0] && p[1] <= q[1])).length,
    describe: ({ list: a }) => `intervals ${ivs(a)}`,
    rule: 'covered = its end is within the furthest end seen so far',
    run({ list: a }, snap) {
      const s = [...a].sort((p, q) => p[0] - q[0] || q[1] - p[1]);
      let far = -Infinity, covered = 0;
      const cls = {};
      const view = (i) => [strip('sorted', s.map(iv), { index: false, cls: { ...cls, ...(i >= 0 ? { [i]: cls[i] === 'bad' ? 'bad' : 'cur' } : {}) } }), P.chips('', [{ key: 'f', text: `furthest end so far: ${far === -Infinity ? 'none' : far}`, tone: 'accent' }, { key: 'c', text: `covered: ${covered}`, tone: covered ? 'warn' : 'muted' }])];
      snap({ kind: 'start', lines: ['sort'], parts: view(-1), title: `Sort: ${ivs(s)}`, text: 'After sorting by start, every interval that could cover the current one has already been seen (it starts no later). Equal starts go longest first, so the longer one is seen first and covers the shorter. Then "covered" just means: some earlier interval ends at or after this one\'s end.', calc: [plural(s.length, 'interval')] });
      s.forEach((p, i) => {
        if (p[1] <= far) { covered++; cls[i] = 'bad'; snap({ kind: 'skip', lines: ['loop'], parts: view(i), title: `${iv(p)}: ${p[1]} ≤ ${far} → covered`, text: `An earlier interval starts no later and reaches ${far}, which is at least ${p[1]}. It contains ${iv(p)}, so this one is removed.`, calc: [`covered = ${covered}`] }); } else { const old = far; far = p[1]; cls[i] = 'kept'; snap({ kind: 'keep', lines: ['loop', 'far'], parts: view(i), title: `${iv(p)}: ${p[1]} > ${old === -Infinity ? 'nothing yet' : old} → kept`, text: `Nothing before it reaches ${p[1]}, so it isn't covered. Its end becomes the furthest so far.`, calc: [`far = ${far}`] }); }
      });
      const out = s.length - covered;
      snap({ kind: 'done', lines: ['ret'], parts: view(-1), out, answer: String(out), title: `${s.length} − ${covered} = ${out} remain`, text: 'One sort and one pass: O(n log n).', calc: [`${out} remain`] });
    },
  },

  queries: {
    code: [['sort', 'sort intervals by start;  answer queries in increasing order'], ['push', 'for q: push every interval with start ≤ q into a min-heap by size'], ['pop', '    pop tops that end before q (they can\'t contain q or any later query)'], ['ans', '    answer[q] = top\'s size, or −1 if the heap is empty'], ['ret', 'put answers back in the original order']],
    fields: [{ name: 'list', label: 'intervals', type: 'pairs', placeholder: '[1, 4], [2, 4], [3, 6], [4, 4]', maxLen: 5 }, { name: 'qs', label: 'queries', type: 'ints', placeholder: '2, 3, 4, 5', maxLen: 5, min: 0, max: 30 }],
    random: (g) => ({ list: Array.from({ length: g.int(1, 5) }, () => { const s = g.int(0, 10); return [s, s + g.int(0, 5)]; }), qs: Array.from({ length: g.int(1, 4) }, () => g.int(0, 14)) }),
    brute: ({ list: a, qs }) => qs.map((q) => { const c = a.filter(([l, r]) => l <= q && q <= r).map(([l, r]) => r - l + 1); return c.length ? Math.min(...c) : -1; }),
    describe: ({ list: a, qs }) => `${ivs(a)}, queries ${list(qs)}`,
    rule: 'answer queries in order; a heap by size holds the started intervals',
    run({ list: a, qs }, snap) {
      const s = byStart(a), order = qs.map((q, k) => [q, k]).sort((x, y) => x[0] - y[0]);
      const heap = [], ans = Array(qs.length).fill(-1);
      let p = 0;
      const sorted = () => [...heap].sort((x, y) => x.size - y.size || x.r - y.r);
      const view = () => [strip('intervals by start', s.map(iv), { index: false, cls: Object.fromEntries(s.map((_, k) => [k, k < p ? 'dim' : ''])) }), P.chips('heap (smallest first)', sorted().map((h, k) => ({ key: `${h.l},${h.r},${k}`, text: `${iv([h.l, h.r])} size ${h.size}`, tone: k === 0 ? 'accent' : undefined })), 'empty')];
      snap({ kind: 'start', lines: ['sort'], parts: view(), title: 'Sort intervals; answer queries smallest first', text: 'In increasing query order, an interval becomes a candidate once its start is reached and stays one until its end passes. So each interval enters a heap once (ordered by size) and leaves once. Answers are written back to each query\'s original position.', calc: [`${plural(qs.length, 'query', 'queries')}`] });
      for (const [q, k] of order) {
        const pushed = [];
        while (p < s.length && s[p][0] <= q) { heap.push({ l: s[p][0], r: s[p][1], size: s[p][1] - s[p][0] + 1 }); pushed.push(iv(s[p])); p++; }
        const dropped = [];
        let top;
        while ((top = sorted()[0]) && top.r < q) { heap.splice(heap.indexOf(top), 1); dropped.push(iv([top.l, top.r])); }
        top = sorted()[0];
        ans[k] = top ? top.size : -1;
        snap({ kind: top ? 'found' : 'fail', lines: ['push', 'pop', 'ans'], parts: view(), title: `q = ${q}: ${top ? `${iv([top.l, top.r])}, size ${top.size}` : '−1'}`, text: `${pushed.length ? `Push ${pushed.join(', ')} (started by ${q}). ` : ''}${dropped.length ? `Pop ${dropped.join(', ')}: ended before ${q}, and later queries are larger still. ` : ''}${top ? `The smallest interval left contains ${q}.` : `Nothing that has started still covers ${q}.`}`, calc: [`answer[${k}] = ${ans[k]}`] });
      }
      snap({ kind: 'done', lines: ['ret'], parts: view(), out: [...ans], answer: list(ans), title: `Answers in query order: ${list(ans)}`, text: 'Sorting both lists is O(n log n + q log q); each interval is pushed and popped once, O(log n) each.', calc: [list(ans)] });
    },
  },

  rooms3: {
    code: [['sort', 'sort meetings by start;  free = min-heap of room numbers;  busy = min-heap of (end, room)'], ['free', 'for [s, e]: move every busy room with end ≤ s back to free'], ['take', '    free room? take the lowest number, end = e'], ['wait', '    none free: the room that frees first takes it, end = its end + (e − s)'], ['ret', 'return the room with the most meetings (lowest number on ties)']],
    fields: [{ name: 'n', label: 'rooms', type: 'int', placeholder: '2', short: true, min: 1, max: 4 }, { name: 'list', label: 'meetings (distinct starts)', type: 'pairs', placeholder: '[0, 10], [1, 5], [2, 7], [3, 4]', maxLen: 6 }],
    valid: ({ list: a }) => (a.some(([x, y]) => x >= y) ? 'each meeting needs start < end.' : new Set(a.map((p) => p[0])).size !== a.length ? 'start times must be distinct.' : ''),
    random: (g) => { const starts = g.shuffle(Array.from({ length: 12 }, (_, k) => k)).slice(0, g.int(1, 6)); return { n: g.int(1, 3), list: starts.map((s) => [s, s + g.int(1, 6)]) }; },
    brute: ({ n, list: a }) => { const s = byStart(a), end = Array(n).fill(0), cnt = Array(n).fill(0); for (const [st, en] of s) { let room = -1; for (let r = 0; r < n; r++) if (end[r] <= st) { room = r; break; } if (room < 0) { room = 0; for (let r = 1; r < n; r++) if (end[r] < end[room]) room = r; end[room] += en - st; } else end[room] = en; cnt[room]++; } return cnt.indexOf(Math.max(...cnt)); },
    describe: ({ n, list: a }) => `${plural(n, 'room')}, meetings ${ivs(a)}`,
    rule: 'lowest free room, else the room that frees first',
    run({ n, list: a }, snap) {
      const s = byStart(a), end = Array(n).fill(0), cnt = Array(n).fill(0), busy = new Set();
      const view = (i) => [strip('meetings by start', s.map(iv), { index: false, cls: Object.fromEntries(s.map((_, k) => [k, k === i ? 'cur' : k < i ? 'dim' : ''])) }), P.chips('rooms', Array.from({ length: n }, (_, r) => ({ key: String(r), text: `room ${r}: ${busy.has(r) ? `busy until ${end[r]}` : 'free'} · ${plural(cnt[r], 'meeting')}`, tone: busy.has(r) ? 'warn' : 'success' })))];
      snap({ kind: 'start', lines: ['sort'], parts: view(-1), title: `${plural(n, 'room')}, meetings in start order`, text: 'Two questions come up again and again: "which is the lowest-numbered free room?" and "which busy room frees first?". A min-heap answers each in O(log n). Before placing a meeting, rooms whose meetings have ended go back to the free heap.', calc: [`${plural(s.length, 'meeting')}`] });
      s.forEach(([st, en], i) => {
        const freed = [...busy].filter((r) => end[r] <= st);
        freed.forEach((r) => busy.delete(r));
        let room = -1;
        for (let r = 0; r < n; r++) if (!busy.has(r)) { room = r; break; }
        if (room >= 0) { end[room] = en; busy.add(room); cnt[room]++; snap({ kind: 'add', lines: ['free', 'take'], parts: view(i), title: `${iv([st, en])} → room ${room}`, text: `${freed.length ? `Room${freed.length > 1 ? 's' : ''} ${freed.join(', ')} finished by ${st} and ${freed.length > 1 ? 'are' : 'is'} free again. ` : ''}Room ${room} is the lowest free number: it runs ${st} → ${en}.`, calc: [`room ${room} until ${en}`] }); return; }
        room = 0;
        for (let r = 1; r < n; r++) if (end[r] < end[room]) room = r;
        const startAt = end[room];
        const tie = [...Array(n).keys()].some((r) => r !== room && end[r] === startAt);
        end[room] += en - st; cnt[room]++;
        snap({ kind: 'move', lines: ['free', 'wait'], parts: view(i), title: `${iv([st, en])} waits for room ${room} (free at ${startAt})`, text: `Every room is busy at ${st}. Room ${room} frees first${tie ? ' (lowest number on a tie)' : ''}, so the meeting is delayed to ${startAt} and keeps its length ${en - st}: it runs ${startAt} → ${end[room]}.`, calc: [`room ${room} until ${end[room]}`] });
      });
      const best = cnt.indexOf(Math.max(...cnt));
      snap({ kind: 'done', lines: ['ret'], parts: view(s.length), out: best, answer: String(best), title: `Room ${best} held the most meetings (${cnt[best]})`, text: `Counts per room: ${cnt.map((c, r) => `room ${r}: ${c}`).join(', ')}. Ties go to the lowest number. O(m log m + m log n); end times can exceed 32 bits on the real limits, so keep them in longs.`, calc: [list(cnt)] });
    },
  },
};

const EXAMPLES = {
  rooms: { label: '[0, 30], [5, 10], [15, 20]', input: { mode: 'rooms', list: [[0, 30], [5, 10], [15, 20]] } },
  roomsOk: { label: '[7, 10], [2, 4]', input: { mode: 'rooms', list: [[7, 10], [2, 4]] } },
  insert: { label: 'insert [4, 8]', input: { mode: 'insert', list: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], nw: [[4, 8]] } },
  arrows: { label: '[10, 16], [2, 8], [1, 6], [7, 12]', input: { mode: 'arrows', list: [[10, 16], [2, 8], [1, 6], [7, 12]] } },
  inter: { label: 'the LeetCode lists', input: { mode: 'inter', A: [[0, 2], [5, 10], [13, 23], [24, 25]], B: [[1, 5], [8, 12], [15, 24], [25, 26]] } },
  covered: { label: '[1, 4], [3, 6], [2, 8]', input: { mode: 'covered', list: [[1, 4], [3, 6], [2, 8]] } },
  coveredTie: { label: 'equal starts: [1, 4], [1, 2]', input: { mode: 'covered', list: [[1, 4], [1, 2]] } },
  queries: { label: '[1, 4], [2, 4], [3, 6], [4, 4]; 2, 3, 4, 5', input: { mode: 'queries', list: [[1, 4], [2, 4], [3, 6], [4, 4]], qs: [2, 3, 4, 5] } },
  rooms3: { label: '2 rooms, 4 meetings', input: { mode: 'rooms3', n: 2, list: [[0, 10], [1, 5], [2, 7], [3, 4]] } },
};

export const intervalWalk = makeWalk(MODES, EXAMPLES);
