/**
 * "Repeatedly take the best": simulations driven by a heap (the model behind <HeapSimViz>). Each step
 * shows the heap best-first, an optional side lane (things not ready yet), the output so far, and the
 * one decision made. Pure, so scripts/viz-check.mjs can test it against brute force.
 *
 * Modes:
 *   stones    max-heap: smash the two heaviest, push back the difference          (Last Stone Weight)
 *   closest   max-heap of size k by squared distance: drop the farthest           (K Closest Points)
 *   tasks     max-heap of counts + a cooldown lane, one time unit per step        (Task Scheduler)
 *   cpu       arrivals lane + min-heap by (time, index)                            (Single-Threaded CPU)
 *   reorg     max-heap of counts, the last letter held back for one turn          (Reorganize String)
 *   happy     max-heap of counts; skip the top if it would make three in a row    (Longest Happy String)
 *   ipo       projects locked by capital + a max-heap of affordable profits       (IPO)
 * A step: { kind, title, text, calc, lines, tokens?, i?, marks?, heap: { label, items }, side?: { label, items },
 *           out: { label, items }, card?, stats, answer? }
 */
import { parseInt1, parseInts, rng } from './util.js';

export const HEAP_SIM = {
  stones: { label: 'Stones [2,7,4,1,8,1]', input: { mode: 'stones', stones: [2, 7, 4, 1, 8, 1] } },
  closest: { label: '2 closest points', input: { mode: 'closest', points: [[3, 3], [5, -1], [-2, 4]], k: 2 } },
  tasks: { label: 'AAABBB, n = 2', input: { mode: 'tasks', tasks: 'AAABBB', n: 2 } },
  cpu: { label: 'CPU, 4 tasks', input: { mode: 'cpu', tasks: [[1, 2], [2, 4], [3, 2], [4, 1]] } },
  reorg: { label: '"aaabc"', input: { mode: 'reorg', s: 'aaabc' } },
  happy: { label: 'a 1, b 1, c 7', input: { mode: 'happy', a: 1, b: 1, c: 7 } },
  ipo: { label: 'k 2, w 0', input: { mode: 'ipo', k: 2, w: 0, profits: [1, 2, 3], capital: [0, 1, 1] } },
};

export const heapSimCode = {
  stones: [
    ['init', 'PriorityQueue<Integer> pq = max-heap of all stones;'],
    ['loop', 'while (pq.size() > 1) {'],
    ['pop', '    int y = pq.poll(), x = pq.poll();      // the two heaviest'],
    ['push', '    if (y > x) pq.offer(y - x);'],
    ['end', '}'],
    ['ret', 'return pq.isEmpty() ? 0 : pq.peek();'],
  ],
  closest: [
    ['loop', 'for (int[] p : points) {'],
    ['push', '    pq.offer(p);                              // max-heap by x² + y²'],
    ['pop', '    if (pq.size() > k) pq.poll();            // drop the farthest'],
    ['end', '}'],
    ['ret', 'return everything left in pq;'],
  ],
  tasks: [
    ['init', 'max-heap of counts; queue of (count, readyTime) cooling down;'],
    ['loop', 'for (time = 0; !heap.isEmpty() || !cooling.isEmpty(); time++) {'],
    ['back', '    if (!cooling.isEmpty() && cooling.peek().readyTime == time) heap.offer(cooling.poll().count);'],
    ['run', '    if (!heap.isEmpty()) { int c = heap.poll() - 1;          // run the most plentiful task'],
    ['cool', '        if (c > 0) cooling.offer(new int[]{c, time + n + 1}); }'],
    ['idle', '    // otherwise the CPU idles this interval'],
    ['end', '}'],
    ['ret', 'return time;'],
  ],
  cpu: [
    ['sort', 'sort task indexes by enqueue time;'],
    ['loop', 'while (done < n) {'],
    ['arrive', '    while (next < n && enqueue[order[next]] <= time) heap.offer(order[next++]);   // by (time, index)'],
    ['idle', '    if (heap.isEmpty()) { time = enqueue[order[next]]; continue; }               // jump to the next arrival'],
    ['run', '    int t = heap.poll(); result[done++] = t; time += processing[t];'],
    ['end', '}'],
    ['ret', 'return result;'],
  ],
  reorg: [
    ['init', 'max-heap of (count, letter); int[] held = null;'],
    ['loop', 'while (!heap.isEmpty()) {'],
    ['take', '    int[] top = heap.poll(); sb.append(top.letter); top.count--;'],
    ['back', '    if (held != null && held.count > 0) heap.offer(held);   // the previous letter may come back'],
    ['hold', '    held = top;                                          // and this one sits out a turn'],
    ['end', '}'],
    ['ret', 'return held.count > 0 ? "" : sb.toString();           // a letter left over: impossible'],
  ],
  happy: [
    ['init', 'max-heap of (count, letter) for the counts > 0;'],
    ['loop', 'while (!heap.isEmpty()) {'],
    ['top', '    int[] first = heap.poll();'],
    ['block', '    if (sb ends with two of first.letter) {                 // a third would make "xxx"'],
    ['second', '        if (heap.isEmpty()) break; int[] second = heap.poll(); use(second); heap.offer(first);'],
    ['use', '    } else use(first);                                      // use(): append, count--, push back if > 0'],
    ['end', '}'],
    ['ret', 'return sb.toString();'],
  ],
  ipo: [
    ['sort', 'sort projects by required capital;'],
    ['loop', 'for (int round = 0; round < k; round++) {'],
    ['unlock', '    while (next < n && capital[order[next]] <= w) heap.offer(profits[order[next++]]);   // affordable now'],
    ['stop', '    if (heap.isEmpty()) break;                         // nothing affordable: stop'],
    ['take', '    w += heap.poll();                                  // the most profitable affordable project'],
    ['end', '}'],
    ['ret', 'return w;'],
  ],
};

const list = (a) => `[${a.join(', ')}]`;
const pt = ([x, y]) => `(${x}, ${y})`;
const d2 = ([x, y]) => x * x + y * y;

function recorder() {
  const steps = [];
  const snap = (x) => steps.push({ stats: [], ...x, heap: { ...x.heap, items: x.heap.items.map((it) => ({ ...it })) } });
  return { steps, snap };
}

// ---------------------------------------------------------------- last stone weight

function stonesRun({ stones }) {
  const R = recorder();
  let id = 0;
  let heap = stones.map((w) => ({ id: id++, w }));
  const sorted = () => [...heap].sort((p, q) => q.w - p.w || p.id - q.id);
  const H = (extra = {}) => ({ label: 'max-heap (heaviest first)', items: sorted().map((s, k) => ({ id: s.id, main: String(s.w), tone: k === 0 ? 'warn' : undefined, isNew: s.id === extra.fresh })) });
  R.snap({ kind: 'start', heap: H(), out: { label: 'smashes', items: [] }, lines: ['init'], title: `Smash the two heaviest, again and again`, text: 'Each round needs the two heaviest stones, and the leftover goes back among the others. A max-heap gives the heaviest in O(log n) each time, without sorting everything again.', calc: [`stones = ${list(stones)}`], stats: [['stones left', heap.length]] });
  const log = [];
  while (heap.length > 1) {
    const [y, x] = sorted();
    heap = heap.filter((s) => s !== y && s !== x);
    let fresh = null;
    if (y.w > x.w) { fresh = { id: id++, w: y.w - x.w }; heap.push(fresh); }
    log.push(fresh ? `${y.w}−${x.w}` : `${y.w}=${x.w}`);
    R.snap({
      kind: fresh ? 'smash' : 'both', heap: H({ fresh: fresh?.id }), out: { label: 'smashes', items: [...log] },
      card: { q: `${y.w} vs ${x.w}`, a: fresh ? `→ ${fresh.w} goes back` : 'equal → both destroyed', tone: fresh ? 'info' : 'bad' },
      lines: ['loop', 'pop', 'push'],
      title: fresh ? `Smash ${y.w} and ${x.w}: ${fresh.w} goes back` : `Smash ${y.w} and ${x.w}: both destroyed`,
      text: fresh ? `Pop the two heaviest. The lighter one is destroyed and the heavier one now weighs ${y.w} − ${x.w} = ${fresh.w}; push it back, where it may no longer be the heaviest.` : 'Equal weights destroy each other: nothing goes back.',
      calc: [`y = ${y.w}, x = ${x.w}`, `heap = ${list(sorted().map((s) => s.w))}`],
      stats: [['stones left', heap.length]],
    });
  }
  const ans = heap.length ? heap[0].w : 0;
  R.snap({ kind: 'done', heap: H(), out: { label: 'smashes', items: [...log] }, lines: ['ret'], answer: String(ans), title: heap.length ? `One stone left: ${ans}` : 'No stones left: 0', text: `At most one stone remains. ${stones.length - 1} rounds at most, each O(log n): O(n log n).`, calc: [`return ${ans}`], stats: [['stones left', heap.length]] });
  return R.steps;
}

// ---------------------------------------------------------------- k closest points

function closestRun({ points, k }) {
  const R = recorder();
  let heap = [];
  const tokens = points.map(pt);
  const sorted = () => [...heap].sort((p, q) => d2(points[q]) - d2(points[p]) || q - p);
  const H = (fresh) => ({ label: `max-heap of the ${k} closest (farthest first)`, items: sorted().map((i, x) => ({ id: i, main: pt(points[i]), sub: `d² ${d2(points[i])}`, tone: x === 0 && heap.length === k ? 'warn' : undefined, isNew: i === fresh })) });
  R.snap({ kind: 'start', tokens, i: null, heap: H(), out: { label: 'kept', items: [] }, lines: [], title: `Keep the ${k} closest points`, text: `Compare squared distances x² + y² (the square root doesn't change the order). Keep the k closest so far in a max-heap: its top is the farthest of them, the one a closer point should replace.`, calc: points.map((p) => `${pt(p)}: d² = ${d2(p)}`).slice(0, 5), stats: [['k', k]] });
  points.forEach((p, i) => {
    heap.push(i);
    if (heap.length <= k) {
      R.snap({ kind: 'push', tokens, i, heap: H(i), out: { label: 'kept', items: sorted().map((j) => pt(points[j])) }, card: { q: `${pt(p)}: d² ${d2(p)}`, a: `fewer than ${k + 1} kept → keep it`, tone: 'info' }, lines: ['loop', 'push'], title: `Keep ${pt(p)} (d² = ${d2(p)})`, text: `The heap holds fewer than ${k + 1} points: just push.`, calc: [`push ${pt(p)}`], stats: [['k', k]] });
      return;
    }
    const far = sorted()[0];
    heap = heap.filter((j) => j !== far);
    R.snap({ kind: far === i ? 'reject' : 'replace', tokens, i, heap: H(i), out: { label: 'kept', items: sorted().map((j) => pt(points[j])) }, card: { q: `farthest: ${pt(points[far])}, d² ${d2(points[far])}`, a: far === i ? 'the new point itself → drop it' : 'pop it', tone: 'bad' }, lines: ['loop', 'push', 'pop'], title: far === i ? `${pt(p)} is farther than all ${k} kept: drop it` : `${pt(p)} is closer: drop ${pt(points[far])}`, text: `Push, then pop the top: with ${k + 1} points in the heap, the farthest one can't be among the ${k} closest.`, calc: [`push ${pt(p)}, d² = ${d2(p)}`, `farthest of ${k + 1}: ${pt(points[far])}, d² = ${d2(points[far])} → pop`], stats: [['k', k]] });
  });
  const ans = [...heap].sort((p, q) => p - q).map((i) => `[${points[i][0]},${points[i][1]}]`);
  R.snap({ kind: 'done', tokens, i: null, heap: H(), out: { label: 'kept', items: sorted().map((j) => pt(points[j])) }, lines: ['ret'], answer: `[${ans.join(',')}]`, title: `The ${k} closest: ${sorted().map((j) => pt(points[j])).join(', ')}`, text: 'Every point was pushed once and the heap never grew past k + 1: O(n log k).', calc: [`return ${ans.join(', ')}`], stats: [['k', k]] });
  return R.steps;
}

// ---------------------------------------------------------------- task scheduler

function tasksRun({ tasks, n }) {
  const R = recorder();
  const count = {};
  for (const t of tasks) count[t] = (count[t] ?? 0) + 1;
  let heap = Object.entries(count).map(([t, c]) => ({ t, c }));
  let cooling = [];   // { t, c, ready }
  const timeline = [];
  const sorted = () => [...heap].sort((p, q) => q.c - p.c || (p.t < q.t ? -1 : 1));
  const H = () => ({ label: 'max-heap of tasks left (most first)', items: sorted().map((x, k) => ({ id: x.t, main: x.t, sub: `× ${x.c}`, tone: k === 0 ? 'warn' : undefined })) });
  const S = () => ({ label: 'cooling down (ready at)', items: cooling.map((x) => ({ id: `c${x.t}`, main: x.t, sub: `t=${x.ready}`, tone: 'muted' })) });
  R.snap({ kind: 'start', heap: H(), side: S(), out: { label: 'timeline', items: [] }, lines: ['init'], title: `${tasks.length} tasks, at least ${n} between repeats`, text: 'Each interval, run the available task with the most copies left: it is the hardest to fit, so it should never wait when it could run. A task that just ran waits in a cooldown queue for n intervals.', calc: Object.entries(count).map(([t, c]) => `${t} × ${c}`), stats: [['time', 0]] });
  let time = 0;
  while (heap.length || cooling.length) {
    const back = cooling.filter((x) => x.ready === time);
    if (back.length) { cooling = cooling.filter((x) => x.ready !== time); heap.push(...back.map(({ t, c }) => ({ t, c }))); }
    if (heap.length) {
      const top = sorted()[0];
      heap = heap.filter((x) => x !== top);
      top.c--;
      if (top.c > 0) cooling.push({ t: top.t, c: top.c, ready: time + n + 1 });
      timeline.push(top.t);
      R.snap({ kind: 'run', heap: H(), side: S(), out: { label: 'timeline', items: [...timeline] }, card: { q: `t = ${time}: run ${top.t}`, a: top.c > 0 ? `${top.c} left, ready at t = ${time + n + 1}` : 'its last copy', tone: 'info' }, lines: ['loop', ...(back.length ? ['back'] : []), 'run', 'cool'], title: `t = ${time}: run ${top.t}${back.length ? ` (${back.map((x) => x.t).join(', ')} back from cooldown)` : ''}`, text: `${top.t} has the most copies left among the available tasks. After running, ${top.c > 0 ? `it cools down until t = ${time + n + 1}` : 'it is finished'}.`, calc: [`run ${top.t}`, `timeline: ${timeline.join(' ')}`], stats: [['time', time + 1]] });
    } else {
      timeline.push('idle');
      R.snap({ kind: 'idle', heap: H(), side: S(), out: { label: 'timeline', items: [...timeline] }, card: { q: `t = ${time}`, a: 'nothing available → idle', tone: 'bad' }, lines: ['loop', 'idle'], title: `t = ${time}: idle`, text: `Every remaining task is still cooling down (next ready at t = ${Math.min(...cooling.map((x) => x.ready))}), so the CPU has to wait.`, calc: [`timeline: ${timeline.join(' ')}`], stats: [['time', time + 1]] });
    }
    time++;
  }
  R.snap({ kind: 'done', heap: H(), side: S(), out: { label: 'timeline', items: [...timeline] }, lines: ['ret'], answer: String(time), title: `Done after ${time} intervals`, text: `${timeline.filter((x) => x === 'idle').length} idle interval${timeline.filter((x) => x === 'idle').length === 1 ? '' : 's'}. The counting formula gives the same: max(tasks, (maxCount − 1) × (n + 1) + tasks with maxCount).`, calc: [`return ${time}`], stats: [['time', time]] });
  return R.steps;
}

// ---------------------------------------------------------------- single-threaded CPU

function cpuRun({ tasks }) {
  const R = recorder();
  const order = tasks.map((_, i) => i).sort((p, q) => tasks[p][0] - tasks[q][0] || p - q);
  let next = 0, time = 0;
  let heap = [];
  const done = [];
  const sorted = () => [...heap].sort((p, q) => tasks[p][1] - tasks[q][1] || p - q);
  const H = () => ({ label: 'available (shortest first, then index)', items: sorted().map((i, k) => ({ id: i, main: `#${i}`, sub: `${tasks[i][1]} long`, tone: k === 0 ? 'warn' : undefined })) });
  const S = () => ({ label: 'not arrived yet (by time)', items: order.slice(next).map((i) => ({ id: `w${i}`, main: `#${i}`, sub: `at ${tasks[i][0]}`, tone: 'muted' })) });
  const O = () => ({ label: 'order', items: done.map((i) => `#${i}`) });
  R.snap({ kind: 'start', heap: H(), side: S(), out: O(), lines: ['sort'], title: 'Sort by arrival, pick the shortest available', text: 'Tasks arrive over time. Keep the ones not yet arrived sorted by arrival time, and the arrived ones in a min-heap by (processing time, index): whenever the CPU is free it takes the heap\'s top.', calc: tasks.map(([e, p], i) => `#${i}: arrives ${e}, takes ${p}`).slice(0, 5), stats: [['time', 0]] });
  while (done.length < tasks.length) {
    const came = [];
    while (next < order.length && tasks[order[next]][0] <= time) { heap.push(order[next]); came.push(order[next]); next++; }
    if (came.length) R.snap({ kind: 'arrive', heap: H(), side: S(), out: O(), card: { q: `time ${time}`, a: `#${came.join(', #')} arrived`, tone: 'info' }, lines: ['loop', 'arrive'], title: `By time ${time}: ${came.map((i) => `#${i}`).join(', ')} available`, text: 'Every task whose enqueue time has passed moves into the heap.', calc: [`heap top: #${sorted()[0]}`], stats: [['time', time]] });
    if (!heap.length) {
      const t0 = time;
      time = tasks[order[next]][0];
      R.snap({ kind: 'idle', heap: H(), side: S(), out: O(), card: { q: `time ${t0}`, a: `nothing available → jump to ${time}`, tone: 'bad' }, lines: ['idle'], title: `Idle: jump to time ${time}`, text: 'Nothing has arrived yet. Instead of ticking one unit at a time, jump straight to the next arrival.', calc: [`time = ${time}`], stats: [['time', time]] });
      continue;
    }
    const t = sorted()[0];
    heap = heap.filter((x) => x !== t);
    done.push(t);
    const start = time;
    time += tasks[t][1];
    R.snap({ kind: 'run', heap: H(), side: S(), out: O(), card: { q: `run #${t}`, a: `${start} → ${time}`, tone: 'yes' }, lines: ['run'], title: `Run #${t} from ${start} to ${time}`, text: `#${t} has the shortest processing time among the available tasks${heap.some((i) => tasks[i][1] === tasks[t][1]) ? ' (ties go to the smaller index)' : ''}. It runs to the end without interruption.`, calc: [`time = ${start} + ${tasks[t][1]} = ${time}`, `order: ${done.join(', ')}`], stats: [['time', time]] });
  }
  R.snap({ kind: 'done', heap: H(), side: S(), out: O(), lines: ['ret'], answer: list(done), title: `Order: ${list(done)}`, text: 'Each task enters and leaves the heap once: O(n log n), including the sort.', calc: [`return ${list(done)}`], stats: [['time', time]] });
  return R.steps;
}

// ---------------------------------------------------------------- reorganize string

function reorgRun({ s }) {
  const R = recorder();
  const count = {};
  for (const c of s) count[c] = (count[c] ?? 0) + 1;
  let heap = Object.entries(count).map(([t, c]) => ({ t, c }));
  let held = null;
  const out = [];
  const sorted = () => [...heap].sort((p, q) => q.c - p.c || (p.t < q.t ? -1 : 1));
  const H = () => ({ label: 'max-heap of letters left (most first)', items: sorted().map((x, k) => ({ id: x.t, main: x.t, sub: `× ${x.c}`, tone: k === 0 ? 'warn' : undefined })) });
  const S = () => ({ label: 'sitting out one turn', items: held && held.c > 0 ? [{ id: `h${held.t}`, main: held.t, sub: `× ${held.c}`, tone: 'muted' }] : [] });
  R.snap({ kind: 'start', heap: H(), side: S(), out: { label: 'written', items: [] }, lines: ['init'], title: `Rearrange "${s}" with no equal neighbours`, text: 'Write the letter with the most copies left: it is the hardest to place, so place it whenever you can. The letter just written sits out one turn (held back from the heap), so it can\'t be written twice in a row.', calc: Object.entries(count).map(([t, c]) => `${t} × ${c}`), stats: [] });
  while (heap.length) {
    const top = sorted()[0];
    heap = heap.filter((x) => x !== top);
    out.push(top.t);
    top.c--;
    const back = held && held.c > 0 ? held : null;
    if (back) heap.push(back);
    held = top;
    R.snap({ kind: 'take', heap: H(), side: S(), out: { label: 'written', items: [...out] }, card: { q: `write ${top.t}`, a: back ? `${back.t} rejoins the heap` : 'most copies left', tone: 'info' }, lines: ['loop', 'take', 'back', 'hold'], title: `Write ${top.t}${back ? `; ${back.t} is allowed again` : ''}`, text: `${top.t} has the most copies left among the letters allowed now. ${back ? `${back.t} sat out a turn and goes back into the heap. ` : ''}${top.t} now sits out the next turn.`, calc: [`written: "${out.join('')}"`], stats: [] });
  }
  const fail = held && held.c > 0;
  const ans = fail ? '' : out.join('');
  R.snap({ kind: fail ? 'fail' : 'done', heap: H(), side: S(), out: { label: 'written', items: [...out] }, lines: ['ret'], answer: `"${ans}"`, title: fail ? `Stuck: ${held.t} is left with nothing to separate it` : `Done: "${ans}"`, text: fail ? `The heap is empty but ${held.c} ${held.t}${held.c === 1 ? '' : "'s"} remain, and the only letter left would sit next to itself. That happens exactly when one letter has more than ⌈n / 2⌉ copies: return "".` : 'Every letter is placed and no two neighbours match. O(n log k) for k distinct letters.', calc: [`return "${ans}"`], stats: [] });
  return R.steps;
}

// ---------------------------------------------------------------- longest happy string

function happyRun({ a, b, c }) {
  const R = recorder();
  let heap = [['a', a], ['b', b], ['c', c]].filter(([, n]) => n > 0).map(([t, n]) => ({ t, c: n }));
  const out = [];
  const sorted = () => [...heap].sort((p, q) => q.c - p.c || (p.t < q.t ? -1 : 1));
  const H = () => ({ label: 'max-heap of letters left (most first)', items: sorted().map((x, k) => ({ id: x.t, main: x.t, sub: `× ${x.c}`, tone: k === 0 ? 'warn' : undefined })) });
  const O = () => ({ label: 'written', items: [...out] });
  R.snap({ kind: 'start', heap: H(), out: O(), lines: ['init'], title: `a ${a}, b ${b}, c ${c}: as long as possible, never three in a row`, text: 'Use the most plentiful letter whenever it is allowed: saving it would only leave more of it to place later, when it is harder. It is not allowed when the string already ends with two of it; then use the next most plentiful letter once.', calc: [`a = ${a}, b = ${b}, c = ${c}`], stats: [['length', 0]] });
  while (heap.length) {
    const [first, second] = sorted();
    const blocked = out.length >= 2 && out.at(-1) === first.t && out.at(-2) === first.t;
    if (blocked && !second) {
      R.snap({ kind: 'stop', heap: H(), out: O(), card: { q: `"${first.t}${first.t}" at the end`, a: 'no other letter left → stop', tone: 'bad' }, lines: ['loop', 'top', 'block', 'second'], title: `Only ${first.t} is left, and a third would make "${first.t.repeat(3)}": stop`, text: `${first.c} ${first.t}${first.c === 1 ? '' : "'s"} can't be used: there is no other letter to break them up.`, calc: [`unused: ${first.t} × ${first.c}`], stats: [['length', out.length]] });
      break;
    }
    const use = blocked ? second : first;
    out.push(use.t);
    use.c--;
    if (use.c === 0) heap = heap.filter((x) => x !== use);
    R.snap({ kind: blocked ? 'second' : 'use', heap: H(), out: O(), card: blocked ? { q: `"${first.t}${first.t}" at the end`, a: `use ${use.t} instead`, tone: 'no' } : { q: `use ${use.t}`, a: 'most left, and allowed', tone: 'info' }, lines: blocked ? ['loop', 'top', 'block', 'second'] : ['loop', 'top', 'use'], title: blocked ? `${first.t} is blocked; use ${use.t} once` : `Use ${use.t}`, text: blocked ? `The string ends with two ${first.t}'s, so the next most plentiful letter, ${use.t}, goes in to break them up. ${first.t} stays in the heap.` : `${use.t} has the most copies left and doesn't make three in a row.`, calc: [`"${out.join('')}"`], stats: [['length', out.length]] });
  }
  const ans = out.join('');
  R.snap({ kind: 'done', heap: H(), out: O(), lines: ['ret'], answer: `"${ans}"`, title: `Happy string of length ${ans.length}: "${ans}"`, text: 'With three letters each step is O(1): O(a + b + c) in total.', calc: [`return "${ans}"`], stats: [['length', ans.length]] });
  return R.steps;
}

// ---------------------------------------------------------------- IPO

function ipoRun({ k, w, profits, capital }) {
  const R = recorder();
  const order = profits.map((_, i) => i).sort((p, q) => capital[p] - capital[q] || p - q);
  let next = 0;
  let heap = [];
  const taken = [];
  const sorted = () => [...heap].sort((p, q) => profits[q] - profits[p] || p - q);
  const H = () => ({ label: 'affordable (biggest profit first)', items: sorted().map((i, x) => ({ id: i, main: `+${profits[i]}`, sub: `#${i}`, tone: x === 0 ? 'warn' : undefined })) });
  const S = () => ({ label: 'locked (capital needed)', items: order.slice(next).map((i) => ({ id: `l${i}`, main: `#${i}`, sub: `needs ${capital[i]}`, tone: 'muted' })) });
  const O = () => ({ label: 'projects done', items: taken.map((i) => `#${i}`) });
  R.snap({ kind: 'start', heap: H(), side: S(), out: O(), lines: ['sort'], title: `Capital ${w}, at most ${k} project${k === 1 ? '' : 's'}`, text: 'Profits are never negative, so capital only grows, and a project you can afford now stays affordable. Each round, take the most profitable affordable project. Sort projects by required capital; as capital grows, unlock them into a max-heap of profits.', calc: profits.map((p, i) => `#${i}: needs ${capital[i]}, earns ${p}`).slice(0, 5), stats: [['capital', w]] });
  for (let round = 0; round < k; round++) {
    const opened = [];
    while (next < order.length && capital[order[next]] <= w) { heap.push(order[next]); opened.push(order[next]); next++; }
    if (opened.length) R.snap({ kind: 'unlock', heap: H(), side: S(), out: O(), card: { q: `capital ${w}`, a: `unlocks #${opened.join(', #')}`, tone: 'info' }, lines: ['loop', 'unlock'], title: `Capital ${w} unlocks ${opened.map((i) => `#${i}`).join(', ')}`, text: 'Every project needing at most the current capital becomes affordable, and stays affordable for good.', calc: [`affordable: ${sorted().map((i) => `+${profits[i]}`).join(', ')}`], stats: [['capital', w]] });
    if (!heap.length) {
      R.snap({ kind: 'stop', heap: H(), side: S(), out: O(), card: { q: `capital ${w}`, a: 'nothing affordable → stop', tone: 'bad' }, lines: ['stop'], title: 'Nothing affordable: stop early', text: 'Capital can\'t grow without a project, so the remaining rounds are wasted.', calc: [`w = ${w}`], stats: [['capital', w]] });
      break;
    }
    const best = sorted()[0];
    heap = heap.filter((i) => i !== best);
    taken.push(best);
    w += profits[best];
    R.snap({ kind: 'take', heap: H(), side: S(), out: O(), card: { q: `take #${best}`, a: `capital → ${w}`, tone: 'yes' }, lines: ['take'], title: `Round ${round + 1}: take #${best} (+${profits[best]}), capital ${w}`, text: 'The most profitable affordable project. Taking a smaller one first could never be better: capital only grows, so the big one stays available, and taking it now unlocks more sooner.', calc: [`w = ${w - profits[best]} + ${profits[best]} = ${w}`], stats: [['capital', w]] });
  }
  R.snap({ kind: 'done', heap: H(), side: S(), out: O(), lines: ['ret'], answer: String(w), title: `Final capital: ${w}`, text: 'Sorting is O(n log n), and each project enters and leaves the heap at most once.', calc: [`return ${w}`], stats: [['capital', w]] });
  return R.steps;
}

export function heapSim(input) {
  return { stones: stonesRun, closest: closestRun, tasks: tasksRun, cpu: cpuRun, reorg: reorgRun, happy: happyRun, ipo: ipoRun }[input.mode](input);
}

/** Reference answers (brute force or a known formula), for the checks. */
export function heapSimAnswer(input) {
  switch (input.mode) {
    case 'stones': { const s = [...input.stones]; while (s.length > 1) { s.sort((p, q) => q - p); const y = s.shift(), x = s.shift(); if (y > x) s.push(y - x); } return String(s[0] ?? 0); }
    case 'closest': { const idx = input.points.map((_, i) => i).sort((p, q) => d2(input.points[p]) - d2(input.points[q]) || p - q).slice(0, input.k).sort((p, q) => p - q); return `[${idx.map((i) => `[${input.points[i][0]},${input.points[i][1]}]`).join(',')}]`; }
    case 'tasks': { const cnt = {}; for (const t of input.tasks) cnt[t] = (cnt[t] ?? 0) + 1; const m = Math.max(...Object.values(cnt)); const top = Object.values(cnt).filter((x) => x === m).length; return String(Math.max(input.tasks.length, (m - 1) * (input.n + 1) + top)); }
    case 'cpu': {
      const t = input.tasks; const left = new Set(t.map((_, i) => i)); let time = 0; const out = [];
      while (left.size) { const avail = [...left].filter((i) => t[i][0] <= time); if (!avail.length) { time = Math.min(...[...left].map((i) => t[i][0])); continue; } avail.sort((p, q) => t[p][1] - t[q][1] || p - q); const i = avail[0]; left.delete(i); out.push(i); time += t[i][1]; }
      return list(out);
    }
    case 'reorg': { const cnt = {}; for (const c of input.s) cnt[c] = (cnt[c] ?? 0) + 1; return Math.max(...Object.values(cnt)) > Math.ceil(input.s.length / 2) ? '""' : 'valid'; }
    case 'happy': { const [x, y, z] = [input.a, input.b, input.c].sort((p, q) => q - p); return String(Math.min(x, 2 * (y + z + 1)) + y + z); }
    default: {
      let w = input.w; const used = new Set();
      for (let r = 0; r < input.k; r++) { let best = -1; input.profits.forEach((p, i) => { if (!used.has(i) && input.capital[i] <= w && (best < 0 || p > input.profits[best])) best = i; }); if (best < 0) break; used.add(best); w += input.profits[best]; }
      return String(w);
    }
  }
}

export function parseHeapSim(values, input) {
  const { mode } = input;
  const nums = (v, opts) => parseInts(v, opts);
  if (mode === 'stones') { const r = nums(values.stones, { min: 1, max: 99, minLen: 1, maxLen: 8, name: 'stones' }); return r.error ? r : { input: { mode, stones: r.arr } }; }
  if (mode === 'closest') {
    const r = nums(values.points, { min: -9, max: 9, minLen: 2, maxLen: 14, name: 'points' });
    if (r.error || r.arr.length % 2) return { error: 'Points as x, y pairs: up to 7 of them, coordinates from −9 to 9.' };
    const points = []; for (let i = 0; i < r.arr.length; i += 2) points.push([r.arr[i], r.arr[i + 1]]);
    const k = parseInt1(values.k, { min: 1, max: points.length, name: 'k' });
    return k.error ? { error: `k from 1 to ${points.length}.` } : { input: { mode, points, k: k.v } };
  }
  if (mode === 'tasks') {
    const tasks = (values.tasks ?? '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!tasks.length || tasks.length > 12) return { error: 'Up to 12 task letters, like AAABBB.' };
    const n = parseInt1(values.n, { min: 0, max: 4, name: 'n' });
    return n.error ? { error: 'n from 0 to 4.' } : { input: { mode, tasks, n: n.v } };
  }
  if (mode === 'cpu') {
    const r = nums(values.tasks, { min: 1, max: 20, minLen: 2, maxLen: 12, name: 'tasks' });
    if (r.error || r.arr.length % 2) return { error: 'Tasks as enqueue, processing pairs: up to 6, values 1 to 20.' };
    const tasks = []; for (let i = 0; i < r.arr.length; i += 2) tasks.push([r.arr[i], r.arr[i + 1]]);
    return { input: { mode, tasks } };
  }
  if (mode === 'reorg') { const s = (values.s ?? '').trim().replace(/^"|"$/g, ''); return /^[a-z]{1,12}$/.test(s) ? { input: { mode, s } } : { error: 'Up to 12 lowercase letters.' }; }
  if (mode === 'happy') {
    const abc = ['a', 'b', 'c'].map((x) => parseInt1(values[x], { min: 0, max: 8, name: x }));
    if (abc.some((x) => x.error)) return { error: 'a, b and c from 0 to 8.' };
    if (abc.every((x) => x.v === 0)) return { error: 'At least one count must be above 0.' };
    return { input: { mode, a: abc[0].v, b: abc[1].v, c: abc[2].v } };
  }
  const k = parseInt1(values.k, { min: 1, max: 6, name: 'k' });
  const w = parseInt1(values.w, { min: 0, max: 20, name: 'w' });
  const p = nums(values.profits, { min: 0, max: 20, minLen: 1, maxLen: 6, name: 'profits' });
  const c = nums(values.capital, { min: 0, max: 20, minLen: 1, maxLen: 6, name: 'capital' });
  if (k.error || w.error || p.error || c.error || p.arr.length !== c.arr.length) return { error: 'k 1–6, w 0–20, and equally long lists of profits and capital (up to 6, values 0–20).' };
  return { input: { mode: 'ipo', k: k.v, w: w.v, profits: p.arr, capital: c.arr } };
}

export function randomHeapSim(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  if (mode === 'stones') return { mode, stones: Array.from({ length: g.int(1, 7) }, () => g.int(1, 12)) };
  if (mode === 'closest') {
    const points = []; const n = g.int(2, 6);
    while (points.length < n) { const p = [g.int(-6, 6), g.int(-6, 6)]; if (!points.some((q) => d2(q) === d2(p))) points.push(p); }
    return { mode, points, k: g.int(1, n) };
  }
  if (mode === 'tasks') return { mode, tasks: Array.from({ length: g.int(1, 10) }, () => 'ABC'[g.int(0, 2)]).join(''), n: g.int(0, 3) };
  if (mode === 'cpu') return { mode, tasks: Array.from({ length: g.int(1, 6) }, () => [g.int(1, 10), g.int(1, 5)]) };
  if (mode === 'reorg') return { mode, s: Array.from({ length: g.int(1, 9) }, () => 'aabc'[g.int(0, 3)]).join('') };
  if (mode === 'happy') { let a, b, c; do { a = g.int(0, 7); b = g.int(0, 4); c = g.int(0, 4); } while (a + b + c === 0); return { mode, a, b, c }; }
  const n = g.int(1, 6);
  return { mode: 'ipo', k: g.int(1, 4), w: g.int(0, 3), profits: Array.from({ length: n }, () => g.int(0, 9)), capital: Array.from({ length: n }, () => g.int(0, 8)) };
}
