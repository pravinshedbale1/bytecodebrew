/**
 * <GreedyWalkViz>: the Greedy lesson's problems, one engine. A step shows a few labelled rows of cells
 * (strips), optionally queues (lanes), counters (chips) and the one comparison made (card).
 *   strip = { label, items, cls: { k: 'cur hit …' }, tags: { k: [{ label, tone }] }, sub: { k: { text, tone } },
 *             bands: [{ from, to, tone, label }], index: true | false | [labels] }
 * Pure, so scripts/viz-check.mjs can compare each mode with an independent brute force.
 */
import { list, rng } from './util.js';

export const GREEDY_WALK = {
  cookies: { label: 'Assign cookies', input: { mode: 'cookies', g: [1, 2, 3], s: [3, 1, 1] } },
  cookies2: { label: 'Cookies: skip the small ones', input: { mode: 'cookies', g: [2, 5, 3, 7], s: [1, 4, 2, 8, 3] } },
  stock: { label: 'One trade', input: { mode: 'stock', prices: [7, 1, 5, 3, 6, 4] } },
  boats: { label: 'Boats', input: { mode: 'boats', people: [3, 2, 2, 1], limit: 3 } },
  boats2: { label: 'Boats: some ride alone', input: { mode: 'boats', people: [3, 5, 3, 4], limit: 5 } },
  twocity: { label: 'Two cities', input: { mode: 'twocity', costs: [[10, 20], [30, 200], [400, 50], [30, 20]] } },
  candy: { label: 'Candy', input: { mode: 'candy', ratings: [1, 0, 2] } },
  candy2: { label: 'Candy: a slope', input: { mode: 'candy', ratings: [1, 3, 4, 5, 2] } },
  lemonade: { label: 'Lemonade change', input: { mode: 'lemonade', bills: [5, 5, 5, 10, 20] } },
  lemonadeNo: { label: 'Lemonade: stuck', input: { mode: 'lemonade', bills: [5, 5, 10, 10, 20] } },
  triplets: { label: 'Merge triplets', input: { mode: 'triplets', triplets: [[2, 5, 3], [1, 8, 4], [1, 7, 5]], target: [2, 7, 5] } },
  wildcard: { label: 'Parentheses with *', input: { mode: 'wildcard', s: '(*))' } },
  wildcardNo: { label: 'Parentheses: too many (', input: { mode: 'wildcard', s: '((*' } },
  straights: { label: 'Hand of straights', input: { mode: 'straights', hand: [1, 2, 3, 6, 2, 3, 4, 7, 8], size: 3 } },
  straightsNo: { label: 'Straights: a gap', input: { mode: 'straights', hand: [1, 2, 3, 4, 6, 7], size: 3 } },
  senate: { label: 'Dota2 senate', input: { mode: 'senate', senate: 'RDD' } },
  senate2: { label: 'Senate: longer', input: { mode: 'senate', senate: 'DRRDRDD' } },
  jump7: { label: 'Jump game VII', input: { mode: 'jump7', s: '011010', minJ: 2, maxJ: 3 } },
  orderly1: { label: 'Orderly queue, k = 1', input: { mode: 'orderly', s: 'cba', k: 1 } },
  orderly2: { label: 'Orderly queue, k = 2', input: { mode: 'orderly', s: 'cab', k: 2 } },
};

export const greedyWalkCode = (mode) => ({
  cookies: [['sort', 'sort(g); sort(s); child = 0;'], ['loop', 'for (int cookie : s) {                     // smallest cookie first'], ['fit', '    if (child < g.length && cookie >= g[child]) child++;   // the least greedy child takes it'], ['ans', 'return child;']],
  stock: [['init', 'minPrice = ∞; best = 0;'], ['best', 'best = max(best, p − minPrice);   // sell today, bought at the lowest so far'], ['min', 'minPrice = min(minPrice, p);'], ['ans', 'return best;']],
  boats: [['sort', 'sort(people); light = 0; heavy = n − 1;'], ['pair', 'if (people[light] + people[heavy] <= limit) light++;   // the lightest rides along'], ['go', 'heavy--; boats++;                    // the heaviest always leaves now'], ['ans', 'return boats;']],
  twocity: [['sort', 'sort people by aCost − bCost;        // biggest saving from A first'], ['a', 'first n people fly to A'], ['b', 'the other n fly to B'], ['ans', 'return total;']],
  candy: [['init', 'candy[i] = 1 for everyone;'], ['left', 'for i = 1..n−1:  if (r[i] > r[i−1]) candy[i] = candy[i−1] + 1;'], ['right', 'for i = n−2..0:  if (r[i] > r[i+1]) candy[i] = max(candy[i], candy[i+1] + 1);'], ['ans', 'return sum(candy);']],
  lemonade: [['five', '$5:  keep it'], ['ten', '$10: give back a $5'], ['twenty', '$20: give $10 + $5 if you can, else three $5s   // keep the $5s'], ['fail', 'no change possible → return false;'], ['ans', 'return true;']],
  triplets: [['skip', 'if (any value > target): skip it        // it would overshoot forever'], ['use', 'else: mark each position where it equals the target'], ['ans', 'return all three positions marked;']],
  wildcard: [['init', 'lo = 0; hi = 0;           // fewest / most "(" that can be open'], ['open', '"(": lo++, hi++'], ['close', '")": lo--, hi--'], ['star', '"*": lo--, hi++         // it may close one, or open one'], ['fail', 'if (hi < 0) return false;    // too many ")" whatever the * are'], ['clamp', 'lo = max(lo, 0);'], ['ans', 'return lo == 0;']],
  straights: [['count', 'count each value; walk the distinct values from small to big'], ['start', 'v = the smallest value left            // it can only START a group'], ['take', 'for x in v .. v + size − 1:  count[x]--  (missing → return false)'], ['ans', 'return true;']],
  senate: [['queues', 'queue R and queue D hold each senator\'s turn number'], ['duel', 'r = R.poll(); d = D.poll();          // the two who act next'], ['ban', 'the earlier one bans the other, and rejoins at turn + n'], ['ans', 'the party whose queue is not empty wins']],
  jump7: [['enter', 'if (i − minJump ≥ 0 && reach[i − minJump]) count++;     // enters the window'], ['leave', 'if (i − maxJump − 1 ≥ 0 && reach[i − maxJump − 1]) count--;   // leaves it'], ['set', 'reach[i] = s[i] == \'0\' && count > 0;'], ['ans', 'return reach[n − 1];']],
  orderly: [['k1', 'if (k == 1): try all n rotations, keep the smallest'], ['k2', 'else: every order is reachable → return sorted(s)'], ['move', 'one move: take one of the first k letters to the end']],
})[mode];

// ---------------------------------------------------------------- brute forces (independent of the greedy)

const sum = (a) => a.reduce((x, y) => x + y, 0);
const perms = (xs) => (xs.length <= 1 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));

export function greedyWalkAnswer(input) {
  const { mode } = input;
  if (mode === 'cookies') {
    // most children matched: try every child with every unused cookie
    const go = (i, used) => { if (i === input.g.length) return 0; let best = go(i + 1, used); input.s.forEach((c, j) => { if (!(used >> j & 1) && c >= input.g[i]) best = Math.max(best, 1 + go(i + 1, used | 1 << j)); }); return best; };
    return go(0, 0);
  }
  if (mode === 'stock') { let b = 0; const p = input.prices; for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) b = Math.max(b, p[j] - p[i]); return b; }
  if (mode === 'boats') {
    const go = (left) => { if (!left.length) return 0; const [x, ...rest] = left; let best = 1 + go(rest); rest.forEach((y, k) => { if (x + y <= input.limit) best = Math.min(best, 1 + go(rest.filter((_, j) => j !== k))); }); return best; };
    return go(input.people);
  }
  if (mode === 'twocity') {
    const c = input.costs, n = c.length / 2; let best = Infinity;
    for (let m = 0; m < 1 << c.length; m++) { let k = 0, t = 0; c.forEach(([a, b], i) => { if (m >> i & 1) { k++; t += a; } else t += b; }); if (k === n) best = Math.min(best, t); }
    return best;
  }
  if (mode === 'candy') {
    // keep fixing broken neighbours until nothing changes
    const r = input.ratings, c = r.map(() => 1);
    for (let changed = true; changed;) { changed = false; for (let i = 0; i < r.length; i++) for (const j of [i - 1, i + 1]) if (j >= 0 && j < r.length && r[i] > r[j] && c[i] <= c[j]) { c[i] = c[j] + 1; changed = true; } }
    return sum(c);
  }
  if (mode === 'lemonade') {
    const go = (i, f, t) => { if (i === input.bills.length) return true; const b = input.bills[i]; if (b === 5) return go(i + 1, f + 1, t); if (b === 10) return f > 0 && go(i + 1, f - 1, t + 1); return (t > 0 && f > 0 && go(i + 1, f - 1, t - 1)) || (f >= 3 && go(i + 1, f - 3, t)); };
    return String(go(0, 0, 0));
  }
  if (mode === 'triplets') {
    const T = input.triplets, x = input.target;
    for (let m = 1; m < 1 << T.length; m++) { const mx = [0, 0, 0]; T.forEach((t, i) => { if (m >> i & 1) for (let k = 0; k < 3; k++) mx[k] = Math.max(mx[k], t[k]); }); if (mx.every((v, k) => v === x[k])) return 'true'; }
    return 'false';
  }
  if (mode === 'wildcard') {
    const stars = [...input.s].filter((c) => c === '*').length;
    for (let m = 0; m < 3 ** stars; m++) {
      let x = m, bal = 0, ok = true;
      for (const c of input.s) { const v = c === '(' ? 1 : c === ')' ? -1 : [0, 1, -1][x % 3]; if (c === '*') x = Math.floor(x / 3); bal += v; if (bal < 0) { ok = false; break; } }
      if (ok && bal === 0) return 'true';
    }
    return 'false';
  }
  if (mode === 'straights') {
    const { size } = input;
    const memo = new Map();
    const go = (cards) => {   // any remaining value may start the next group
      if (!cards.length) return true;
      const key = cards.join(',');
      if (memo.has(key)) return memo.get(key);
      let res = false;
      for (const v of new Set(cards)) {
        const rest = [...cards]; let ok = true;
        for (let x = v; x < v + size; x++) { const k = rest.indexOf(x); if (k < 0) { ok = false; break; } rest.splice(k, 1); }
        if (ok && go(rest)) { res = true; break; }
      }
      memo.set(key, res);
      return res;
    };
    return String(go([...input.hand].sort((a, b) => a - b)));
  }
  if (mode === 'senate') {
    // full game search: on its turn a senator announces victory or bans any opponent
    const s = input.senate, n = s.length, memo = new Map();
    const go = (alive, i) => {
      const key = `${alive},${i}`;
      if (memo.has(key)) return memo.get(key);
      while (!(alive >> i & 1)) i = (i + 1) % n;
      const me = s[i];
      const foes = [...s].map((c, j) => j).filter((j) => alive >> j & 1 && s[j] !== me);
      let res;
      if (!foes.length) res = me;
      else res = foes.some((j) => go(alive & ~(1 << j), (i + 1) % n) === me) ? me : (me === 'R' ? 'D' : 'R');
      memo.set(key, res);
      return res;
    };
    return go((1 << n) - 1, 0) === 'R' ? 'Radiant' : 'Dire';
  }
  if (mode === 'jump7') {
    const { s, minJ, maxJ } = input, reach = [true];
    for (let j = 1; j < s.length; j++) { reach[j] = false; if (s[j] === '0') for (let i = Math.max(0, j - maxJ); i <= j - minJ; i++) if (reach[i]) reach[j] = true; }
    return String(reach[s.length - 1]);
  }
  // orderly: BFS over every reachable string
  const seen = new Set([input.s]), q = [input.s];
  while (q.length) { const t = q.shift(); for (let i = 0; i < input.k; i++) { const u = t.slice(0, i) + t.slice(i + 1) + t[i]; if (!seen.has(u)) { seen.add(u); q.push(u); } } }
  return [...seen].sort()[0];
}

// ---------------------------------------------------------------- step-throughs

export function greedyWalk(input) {
  const { mode } = input;
  const steps = [];
  const snap = (x) => steps.push({ mode, strips: [], lanes: null, chips: null, card: null, ...x });
  const S = (label, items, o = {}) => ({ label, items: [...items], cls: {}, tags: {}, sub: {}, bands: [], index: true, ...o });

  if (mode === 'cookies') {
    const g = [...input.g].sort((a, b) => a - b), s = [...input.s].sort((a, b) => a - b);
    const got = {}, gave = {}, skipped = new Set();
    let child = 0;
    const view = (cur, extra = {}) => {
      const kids = S('children (greed)', g), cook = S('cookies', s);
      g.forEach((_, i) => { if (got[i] !== undefined) { kids.cls[i] = 'hit'; kids.sub[i] = { text: `got ${s[got[i]]}`, tone: 'success' }; } });
      if (child < g.length) kids.tags[child] = [{ label: 'next child', tone: 'accent' }];
      s.forEach((_, j) => { if (gave[j] !== undefined) cook.cls[j] = 'hit'; else if (skipped.has(j)) cook.cls[j] = 'dim'; });
      if (cur !== null) { cook.cls[cur] = `${cook.cls[cur] ?? ''} cur`; cook.tags[cur] = [{ label: 'cookie', tone: 'warn' }]; }
      return { strips: [kids, cook], chips: [{ label: 'content', chips: [{ key: 'c', text: String(Object.keys(got).length), tone: 'success' }] }], ...extra };
    };
    snap({ kind: 'start', lines: ['sort'], ...view(null), title: `Greed ${list(input.g)}, cookies ${list(input.s)}`, text: 'Sort both. Then hand out cookies from the smallest up: if it satisfies the least greedy child still waiting, give it to them; if not, it is too small for every child left, so throw it away. A bigger cookie is never wasted on a child a smaller one could satisfy.', calc: [`greed ${list(g)}`, `cookies ${list(s)}`] });
    for (let j = 0; j < s.length && child < g.length; j++) {
      if (s[j] >= g[child]) {
        got[child] = j; gave[j] = child;
        snap({ kind: 'match', lines: ['loop', 'fit'], ...view(j, { card: { q: `cookie ${s[j]} ≥ greed ${g[child]}?`, a: 'yes: this child is content', tone: 'success' } }), title: `Cookie ${s[j]} → child with greed ${g[child]}`, text: `The smallest cookie left (${s[j]}) satisfies the least greedy child waiting (${g[child]}). Giving it to them uses up as little as possible, leaving the bigger cookies for greedier children.`, calc: [`${s[j]} ≥ ${g[child]}`, `content: ${child + 1}`] });
        child++;
      } else {
        skipped.add(j);
        snap({ kind: 'skip', lines: ['loop', 'fit'], ...view(j, { card: { q: `cookie ${s[j]} ≥ greed ${g[child]}?`, a: 'no: too small for everyone left', tone: 'danger' } }), title: `Cookie ${s[j]} is too small: skip it`, text: `${s[j]} doesn't satisfy greed ${g[child]}, and every child still waiting is at least that greedy (they're sorted). Nobody can use it.`, calc: [`${s[j]} < ${g[child]}`] });
      }
    }
    const ans = child;
    snap({ kind: 'done', lines: ['ans'], ...view(null), out: ans, answer: `content = ${ans}`, title: `${ans} content ${ans === 1 ? 'child' : 'children'}`, text: `${child === g.length ? 'Every child got a cookie.' : 'The cookies ran out (or were too small) before the greedier children.'} O(n log n + m log m) for the sorting, then one pass.`, calc: [`= ${ans}`] });
    return steps;
  }

  if (mode === 'stock') {
    const p = input.prices;
    let min = Infinity, minAt = -1, best = 0, bestAt = -1, bestFrom = -1;
    const profit = {};
    const view = (i) => {
      const st = S('prices', p);
      p.forEach((_, k) => { if (i !== null && k > i) st.cls[k] = 'muted'; if (profit[k] !== undefined) st.sub[k] = { text: `${profit[k] >= 0 ? '+' : ''}${profit[k]}`, tone: k === bestAt ? 'success' : undefined }; });
      if (minAt >= 0) st.tags[minAt] = [{ label: 'min', tone: 'accent' }];
      if (bestAt >= 0) { st.cls[bestAt] = 'hit'; st.tags[bestAt] = [...(st.tags[bestAt] ?? []), { label: 'best sell', tone: 'success' }]; }
      if (i !== null) st.cls[i] = `${st.cls[i] ?? ''} cur`;
      return { strips: [st], chips: [{ label: 'so far', chips: [{ key: 'm', text: `lowest ${min === Infinity ? '∞' : min}`, tone: 'accent' }, { key: 'b', text: `best ${best}`, tone: 'success' }] }] };
    };
    snap({ kind: 'start', lines: ['init'], ...view(null), title: `One trade on ${list(p)}`, text: 'If you sell on day i, the best buy is the lowest price before it. So walk the days once, remembering the lowest price so far, and on every day ask: what if I sold today? The small number under each day is that profit.', calc: ['lowest = ∞, best = 0'] });
    p.forEach((v, i) => {
      const pm = min, pr = min === Infinity ? null : v - min;
      if (pr !== null) profit[i] = pr;
      const better = pr !== null && pr > best;
      if (better) { best = pr; bestAt = i; bestFrom = minAt; }
      const lower = v < min;
      if (lower) { min = v; minAt = i; }
      snap({ kind: better ? 'better' : lower ? 'low' : 'scan', lines: ['best', 'min'], ...view(i), title: better ? `Day ${i}: sell at ${v} for +${pr}: new best` : lower ? `Day ${i}: ${v} is the new lowest price` : `Day ${i}: selling at ${v} gives ${pr}`, text: `${pr === null ? 'Nothing bought yet, so no sale today.' : `Bought at the lowest so far and sold today: ${v} − ${pm} = ${pr}${better ? ', better than anything before' : best ? `, not better than ${best}` : ''}.`} ${lower ? `${v} is lower than every earlier price, so any later sale should buy here.` : ''}`.trim(), calc: [`best = ${best}`, `lowest = ${min}`] });
    });
    snap({ kind: 'done', lines: ['ans'], ...view(null), out: best, answer: `profit = ${best}`, title: best ? `Best profit: ${best} (buy ${p[bestFrom]}, sell ${p[bestAt]})` : 'No profitable trade: 0', text: 'Each day was looked at once with two numbers remembered: O(n) time, O(1) memory. Trying every buy/sell pair would be O(n²).', calc: [`= ${best}`] });
    return steps;
  }

  if (mode === 'boats') {
    const p = [...input.people].sort((a, b) => a - b), L = input.limit;
    let light = 0, heavy = p.length - 1;
    const boat = {}, boats = [];
    const view = (cur = []) => {
      const st = S(`sorted (limit ${L})`, p);
      p.forEach((_, k) => { if (boat[k] !== undefined) { st.cls[k] = 'dim'; st.sub[k] = { text: `boat ${boat[k] + 1}` }; } });
      cur.forEach((k) => { st.cls[k] = 'cur'; });
      if (light <= heavy) { st.tags[light] = [{ label: 'light', tone: 'accent' }]; st.tags[heavy] = [...(light === heavy ? st.tags[light] : []), { label: 'heavy', tone: 'warn' }]; }
      return { strips: [st], chips: [{ label: 'boats', chips: boats.map((b, k) => ({ key: k, text: b.join(' + '), tone: b.length === 2 ? 'success' : undefined })), empty: 'none yet' }] };
    };
    snap({ kind: 'start', lines: ['sort'], ...view(), title: `Weights ${list(input.people)}, limit ${L}`, text: 'Sort. The heaviest person has to leave in some boat. The only question is who rides with them, and the best partner is the lightest person: if even they don\'t fit, nobody does, and if they do, taking them uses up the person who is easiest to place anyway.', calc: [`sorted ${list(p)}`] });
    while (light <= heavy) {
      const pair = light < heavy && p[light] + p[heavy] <= L;
      const ids = pair ? [light, heavy] : [heavy];
      const b = boats.length;
      ids.forEach((k) => { boat[k] = b; });
      boats.push(ids.map((k) => p[k]));
      const was = [light, heavy];
      snap({ kind: pair ? 'pair' : 'alone', lines: pair ? ['pair', 'go'] : ['go'], ...view(ids), card: light < heavy ? { q: `${p[was[0]]} + ${p[was[1]]} ≤ ${L}?`, a: pair ? 'yes: they share a boat' : 'no: the heavy one goes alone', tone: pair ? 'success' : 'warn' } : null, title: pair ? `Boat ${b + 1}: ${p[was[1]]} + ${p[was[0]]}` : `Boat ${b + 1}: ${p[was[1]]} alone`, text: light === heavy ? `Only ${p[heavy]} is left: one more boat.` : pair ? `The heaviest (${p[was[1]]}) and the lightest (${p[was[0]]}) fit together: ${p[was[0]] + p[was[1]]} ≤ ${L}.` : `Even the lightest (${p[was[0]]}) doesn't fit with ${p[was[1]]} (${p[was[0]] + p[was[1]]} > ${L}), so nobody does: ${p[was[1]]} leaves alone.`, calc: [`boats = ${boats.length}`] });
      if (pair) light++;
      heavy--;
    }
    snap({ kind: 'done', lines: ['ans'], ...view(), out: boats.length, answer: `boats = ${boats.length}`, title: `${boats.length} boats`, text: 'Two pointers after sorting: O(n log n). Pairing the heaviest with the lightest is safe because the lightest fits anywhere the others would.', calc: [`= ${boats.length}`] });
    return steps;
  }

  if (mode === 'twocity') {
    const c = input.costs, n = c.length / 2;
    const people = c.map(([a, b], id) => ({ id, a, b, d: a - b }));
    const sorted = [...people].sort((x, y) => x.d - y.d || x.id - y.id);
    const where = {};
    let total = 0;
    const view = (order, cur = null) => {
      const it = (f) => order.map((p) => ({ v: f(p), id: p.id }));
      const A = S('to A', it((p) => p.a), { index: false }), B = S('to B', it((p) => p.b), { index: false }), D = S('A − B', it((p) => p.d), { index: order.map((p) => `p${p.id}`) });
      order.forEach((p, k) => {
        if (where[p.id] === 'A') { A.cls[k] = 'hit'; B.cls[k] = 'dim'; }
        if (where[p.id] === 'B') { B.cls[k] = 'hit'; A.cls[k] = 'dim'; }
        if (cur === k) { D.cls[k] = 'cur'; }
      });
      if (order === sorted) D.bands = [{ from: 0, to: n - 1, tone: 'accent', label: 'fly to A' }, { from: n, to: 2 * n - 1, tone: 'note', label: 'fly to B' }];
      return { strips: [D, A, B], chips: [{ label: 'total', chips: [{ key: 't', text: String(total), tone: 'success' }] }] };
    };
    snap({ kind: 'start', lines: [], ...view(people), title: `${2 * n} people, ${n} to each city`, text: 'Imagine everyone flies to B first. Moving one person to A then changes the bill by aCost − bCost. We must move exactly n people, so move the n with the smallest (most negative) difference: the ones A saves the most on.', calc: people.map((p) => `p${p.id}: ${p.a} − ${p.b} = ${p.d}`) });
    snap({ kind: 'sort', lines: ['sort'], ...view(sorted), title: 'Sorted by A − B', text: `Most A-saving first: ${sorted.map((p) => `p${p.id} (${p.d})`).join(', ')}. The first ${n} go to A, the rest to B.`, calc: [sorted.map((p) => p.d).join(' ≤ ')] });
    sorted.forEach((p, k) => {
      const toA = k < n;
      where[p.id] = toA ? 'A' : 'B';
      total += toA ? p.a : p.b;
      snap({ kind: toA ? 'take' : 'skip', lines: [toA ? 'a' : 'b'], ...view(sorted, k), title: `p${p.id} → ${toA ? 'A' : 'B'}: ${toA ? p.a : p.b}`, text: toA ? `p${p.id} is among the ${n} biggest savings from A (${p.d}): fly them to A for ${p.a}.` : `A's ${n} places are taken by people who save more there; p${p.id} flies to B for ${p.b}.`, calc: [`total = ${total}`] });
    });
    snap({ kind: 'done', lines: ['ans'], ...view(sorted), out: total, answer: `cost = ${total}`, title: `Cheapest total: ${total}`, text: 'Exchange argument: if someone with a smaller A − B went to B while someone with a bigger one went to A, swapping them can only lower the bill. O(n log n).', calc: [`= ${total}`] });
    return steps;
  }

  if (mode === 'candy') {
    const r = input.ratings, n = r.length, c = r.map(() => 1);
    const view = (i = null, j = null, pass = null) => {
      const R = S('ratings', r), C = S('candies', c);
      if (i !== null) { R.cls[i] = 'cur'; C.cls[i] = 'cur'; }
      if (j !== null) { R.cls[j] = 'target'; C.tags[j] = [{ label: pass === 'left' ? 'left neighbour' : 'right neighbour', tone: 'muted' }]; }
      return { strips: [R, C], chips: [{ label: 'total', chips: [{ key: 't', text: String(sum(c)), tone: 'success' }] }] };
    };
    snap({ kind: 'start', lines: ['init'], ...view(), title: `Ratings ${list(r)}`, text: 'Two rules pull in two directions: higher than the left neighbour, and higher than the right neighbour. Each is easy on its own in a single sweep. Start everyone at 1, sweep left to right for the left rule, then right to left for the right rule, keeping whichever need is bigger.', calc: [`${n} × 1 = ${n}`] });
    for (let i = 1; i < n; i++) {
      const up = r[i] > r[i - 1], was = c[i];
      if (up) c[i] = c[i - 1] + 1;
      snap({ kind: up ? 'raise' : 'keep', lines: ['left'], ...view(i, i - 1, 'left'), title: up ? `${r[i]} > ${r[i - 1]}: candy ${c[i - 1]} + 1 = ${c[i]}` : `${r[i]} ≤ ${r[i - 1]}: no rule from the left`, text: up ? `Rated higher than the left neighbour, so one more than their ${c[i - 1]}.` : `Not rated higher than the left neighbour: the left rule asks nothing, keep ${was}.`, calc: [`candy[${i}] = ${c[i]}`] });
    }
    for (let i = n - 2; i >= 0; i--) {
      const up = r[i] > r[i + 1], was = c[i];
      if (up) c[i] = Math.max(c[i], c[i + 1] + 1);
      snap({ kind: up && c[i] !== was ? 'raise' : 'keep', lines: ['right'], ...view(i, i + 1, 'right'), title: up ? `${r[i]} > ${r[i + 1]}: max(${was}, ${c[i + 1]} + 1) = ${c[i]}` : `${r[i]} ≤ ${r[i + 1]}: no rule from the right`, text: up ? (c[i] !== was ? `Rated higher than the right neighbour, who has ${c[i + 1]}: raise to ${c[i]}. The max keeps what the left pass required.` : `Rated higher than the right neighbour, but the ${was} from the left pass already beats ${c[i + 1]}.`) : 'Not rated higher than the right neighbour: nothing to fix.', calc: [`candy[${i}] = ${c[i]}`] });
    }
    const ans = sum(c);
    snap({ kind: 'done', lines: ['ans'], ...view(), out: ans, answer: `candies = ${ans}`, title: `${ans} candies`, text: 'Each pass made one rule true without breaking the other (the max only ever raises). Every child holds the smallest number both rules allow, so the total is the minimum. O(n).', calc: [`${c.join(' + ')} = ${ans}`] });
    return steps;
  }

  if (mode === 'lemonade') {
    const b = input.bills;
    let five = 0, ten = 0;
    const view = (i = null, bad = false) => {
      const st = S('customers', b.map((x) => `$${x}`));
      b.forEach((_, k) => { if (i !== null && k < i) st.cls[k] = 'dim'; });
      if (i !== null) st.cls[i] = bad ? 'bad' : 'cur';
      return { strips: [st], chips: [{ label: 'in the till', chips: [{ key: 'f', text: `$5 × ${five}`, tone: 'success' }, { key: 't', text: `$10 × ${ten}`, tone: 'accent' }] }] };
    };
    snap({ kind: 'start', lines: [], ...view(), title: `Bills ${list(b.map((x) => `$${x}`))}`, text: 'Serve the queue in order. A $10 needs a $5 back. A $20 needs $15: a $10 + a $5, or three $5s. Prefer the $10 when you can: a $5 can pay change for either bill, a $10 only helps with a $20, so keep the flexible bills.', calc: ['till empty'] });
    for (let i = 0; i < b.length; i++) {
      const x = b[i];
      if (x === 5) { five++; snap({ kind: 'keep', lines: ['five'], ...view(i), title: `$5: no change needed`, text: 'Exact money. Keep the $5: it will pay someone\'s change later.', calc: [`$5 × ${five}`] }); continue; }
      if (x === 10) {
        if (!five) { snap({ kind: 'fail', lines: ['ten', 'fail'], ...view(i, true), out: 'false', answer: 'false', title: '$10 but no $5 in the till: false', text: 'This customer needs $5 back and there is none.', calc: ['$5 × 0'] }); return steps; }
        five--; ten++;
        snap({ kind: 'take', lines: ['ten'], ...view(i), title: '$10: give back a $5', text: `Keep the $10, hand back a $5. Till: $5 × ${five}, $10 × ${ten}.`, calc: [`$5 × ${five}, $10 × ${ten}`] });
        continue;
      }
      if (ten && five) { ten--; five--; snap({ kind: 'take', lines: ['twenty'], ...view(i), title: '$20: give $10 + $5', text: 'Use the $10 first: it can\'t help anyone paying with a $10 later, but the $5s can.', calc: [`$5 × ${five}, $10 × ${ten}`] }); continue; }
      if (five >= 3) { five -= 3; snap({ kind: 'take', lines: ['twenty'], ...view(i), title: '$20: give three $5s', text: 'No $10 in the till, so three $5s.', calc: [`$5 × ${five}, $10 × ${ten}`] }); continue; }
      snap({ kind: 'fail', lines: ['twenty', 'fail'], ...view(i, true), out: 'false', answer: 'false', title: '$20 but $15 can\'t be made: false', text: `The till has $5 × ${five} and $10 × ${ten}: neither $10 + $5 nor three $5s.`, calc: [`$5 × ${five}, $10 × ${ten}`] });
      return steps;
    }
    snap({ kind: 'done', lines: ['ans'], ...view(), out: 'true', answer: 'true', title: 'Everyone got correct change: true', text: 'One pass with two counters: O(n). The only choice, $10 + $5 or three $5s, is settled by keeping the bill that is useful more often.', calc: ['true'] });
    return steps;
  }

  if (mode === 'triplets') {
    const T = input.triplets, x = input.target;
    const got = [false, false, false], used = new Set(), skipped = new Set();
    const view = (cur = null) => {
      const tg = S('target', x, { index: ['x', 'y', 'z'] });
      got.forEach((g, k) => { if (g) tg.cls[k] = 'hit'; });
      const rows = T.map((t, i) => {
        const st = S(`t${i}`, t, { index: false });
        t.forEach((v, k) => {
          if (skipped.has(i)) st.cls[k] = v > x[k] ? 'bad' : 'dim';
          else if (used.has(i) && v === x[k]) st.cls[k] = 'hit';
        });
        if (cur === i) st.tags[0] = [{ label: 'check', tone: 'accent' }];
        return st;
      });
      return { strips: [tg, ...rows], chips: [{ label: 'covered', chips: ['x', 'y', 'z'].map((n, k) => ({ key: n, text: `${n} ${got[k] ? '✓' : '·'}`, tone: got[k] ? 'success' : undefined })) }] };
    };
    snap({ kind: 'start', lines: [], ...view(), title: `Reach ${list(x)}?`, text: 'Merging takes the larger value in each position, so values only grow. A triplet with ANY value above the target can never be used: it would push that position past the target for good. Every other triplet is safe to merge in. So keep the safe ones, and check that together they hit each target value exactly.', calc: [`target ${list(x)}`] });
    T.forEach((t, i) => {
      const over = t.map((v, k) => v > x[k]);
      if (over.some(Boolean)) {
        skipped.add(i);
        const k = over.indexOf(true);
        snap({ kind: 'skip', lines: ['skip'], ...view(i), title: `${list(t)}: ${t[k]} > ${x[k]}, skip it`, text: `Position ${'xyz'[k]} would become ${t[k]}, above the target ${x[k]}, and merging can never bring it back down.`, calc: [`${t[k]} > ${x[k]}`] });
      } else {
        used.add(i);
        const hits = t.map((v, k) => v === x[k]);
        hits.forEach((h, k) => { if (h) got[k] = true; });
        snap({ kind: 'use', lines: ['use'], ...view(i), title: `${list(t)} is safe${hits.some(Boolean) ? `: covers ${hits.map((h, k) => (h ? 'xyz'[k] : null)).filter(Boolean).join(', ')}` : ''}`, text: `No value above the target, so merging it in can't hurt.${hits.some(Boolean) ? ` It matches the target exactly in ${hits.map((h, k) => (h ? `${'xyz'[k]} (${x[k]})` : null)).filter(Boolean).join(' and ')}.` : ' It matches no target value, so it doesn\'t help either.'}`, calc: [`covered: ${got.map((g, k) => (g ? 'xyz'[k] : '')).join('') || 'none'}`] });
      }
    });
    const ok = got.every(Boolean);
    snap({ kind: 'done', lines: ['ans'], ...view(), out: String(ok), answer: String(ok), title: ok ? 'All three positions covered: true' : `Position ${got.map((g, k) => (g ? '' : 'xyz'[k])).join(', ')} never matched: false`, text: ok ? 'Merging all the safe triplets gives exactly the target: each position reaches its value and none goes past. O(n).' : 'No safe triplet supplies that exact value, and the unsafe ones would overshoot. O(n).', calc: [String(ok)] });
    return steps;
  }

  if (mode === 'wildcard') {
    const s = input.s;
    let lo = 0, hi = 0;
    const ranges = {};
    const view = (i = null, bad = false) => {
      const st = S('s', [...s]);
      [...s].forEach((_, k) => { if (ranges[k]) st.sub[k] = { text: ranges[k], tone: bad && k === i ? 'danger' : undefined }; if (i !== null && k > i) st.cls[k] = 'muted'; });
      if (i !== null) st.cls[i] = bad ? 'bad' : 'cur';
      return { strips: [st], chips: [{ label: 'open "(" count', chips: [{ key: 'lo', text: `fewest ${lo}`, tone: 'accent' }, { key: 'hi', text: `most ${hi}`, tone: 'warn' }] }] };
    };
    snap({ kind: 'start', lines: ['init'], ...view(), title: `Is "${s}" valid?`, text: 'Without stars you would count open "(" and fail if it goes negative. Each * could be "(", ")" or nothing, so the count is not one number but a range: the fewest and the most "(" that could be open now. Track both ends. The small text under each letter is that range.', calc: ['lo = 0, hi = 0'] });
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      const plo = lo, phi = hi;
      if (ch === '(') { lo++; hi++; } else if (ch === ')') { lo--; hi--; } else { lo--; hi++; }
      if (hi < 0) {
        ranges[i] = '✗';
        snap({ kind: 'fail', lines: ['close', 'fail'], ...view(i, true), out: 'false', answer: 'false', title: `Too many ")" at ${i}: false`, text: 'Even if every * so far were "(", this ")" has nothing left to close.', calc: [`most = ${hi} < 0`] });
        return steps;
      }
      const clamped = lo < 0;
      lo = Math.max(lo, 0);
      ranges[i] = `${lo}–${hi}`;
      snap({ kind: ch === '(' ? 'open' : ch === ')' ? 'close' : 'star', lines: [ch === '(' ? 'open' : ch === ')' ? 'close' : 'star', 'clamp'], ...view(i), title: `"${ch}": open count ${lo}–${hi}`, text: `${ch === '(' ? 'An open bracket: both ends go up.' : ch === ')' ? 'A close bracket: both ends go down.' : `A star: as ")" the fewest drops to ${plo - 1}, as "(" the most rises to ${phi + 1}.`}${clamped ? ' The fewest can\'t go below 0: a * that would close a bracket that isn\'t there is treated as empty instead.' : ''}`, calc: [`lo = ${lo}, hi = ${hi}`] });
    }
    const ok = lo === 0;
    snap({ kind: 'done', lines: ['ans'], ...view(), out: String(ok), answer: String(ok), title: ok ? 'Zero open brackets is possible: true' : `At least ${lo} "(" always stays open: false`, text: ok ? 'The range ends at 0, so some choice for the stars closes everything. O(n) time, two numbers.' : 'Even turning every * into ")" leaves brackets open. O(n).', calc: [`lo = ${lo}`] });
    return steps;
  }

  if (mode === 'straights') {
    const { hand, size } = input;
    const vals = [...new Set(hand)].sort((a, b) => a - b);
    const cnt = Object.fromEntries(vals.map((v) => [v, hand.filter((h) => h === v).length]));
    const groups = [];
    const view = (band = null, bad = null) => {
      const st = S('values', vals, { index: false });
      vals.forEach((v, k) => { st.sub[k] = { text: `× ${cnt[v]}`, tone: cnt[v] ? undefined : 'success' }; if (!cnt[v]) st.cls[k] = 'dim'; });
      if (band) st.bands = [band];
      if (bad !== null) st.cls[bad] = 'bad';
      return { strips: [st], chips: [{ label: 'groups', chips: groups.map((g, k) => ({ key: k, text: g.join(' ') })), empty: 'none yet' }] };
    };
    snap({ kind: 'start', lines: ['count'], ...view(), title: `${hand.length} cards into groups of ${size}`, text: `Look at the smallest card left. Nothing smaller remains to come before it, so it can't sit in the middle or end of a group: it must START one, which needs ${size} consecutive values from it. Take that group, and repeat. No choice is ever needed.`, calc: [hand.length % size ? `${hand.length} isn't a multiple of ${size}` : `${hand.length / size} groups needed`] });
    if (hand.length % size) { snap({ kind: 'fail', lines: ['ans'], ...view(), out: 'false', answer: 'false', title: `${hand.length} cards can't split into groups of ${size}: false`, text: 'Check the count first.', calc: ['false'] }); return steps; }
    for (;;) {
      const v = vals.find((x) => cnt[x] > 0);
      if (v === undefined) break;
      const from = vals.indexOf(v);
      for (let x = v; x < v + size; x++) {
        if (!cnt[x]) {
          const at = vals.indexOf(x);
          snap({ kind: 'fail', lines: ['start', 'take'], ...view(null, at >= 0 ? at : from), out: 'false', answer: 'false', title: `${v} starts a group but ${x} is missing: false`, text: `${v} is the smallest card left, so it must start ${v}..${v + size - 1}, and no ${x} is left.`, calc: [`count[${x}] = 0`] });
          return steps;
        }
      }
      for (let x = v; x < v + size; x++) cnt[x]--;
      groups.push(Array.from({ length: size }, (_, k) => v + k));
      snap({ kind: 'take', lines: ['start', 'take'], ...view({ from, to: vals.indexOf(v + size - 1), tone: 'accent', label: `${v}..${v + size - 1}` }), title: `Smallest left is ${v}: take ${v}..${v + size - 1}`, text: `${v} must start a group, so ${groups.at(-1).join(', ')} go together. Their counts drop by one.`, calc: [`groups: ${groups.length}`] });
    }
    snap({ kind: 'done', lines: ['ans'], ...view(), out: 'true', answer: 'true', title: `${groups.length} groups: true`, text: 'Every card was used. With a sorted map of counts this is O(n log n).', calc: ['true'] });
    return steps;
  }

  if (mode === 'senate') {
    const s = input.senate, n = s.length;
    const R = [], D = [];
    [...s].forEach((c, i) => (c === 'R' ? R : D).push(i));
    const banned = new Set();
    const lane = (q, c) => q.map((t) => ({ id: `${c}${t}`, main: `${c}${t % n}`, sub: t >= n ? `turn ${t}` : undefined, tone: c === 'R' ? 'accent' : 'warn' }));
    const view = (act = null, ban = null) => {
      const st = S('senate', [...s]);
      [...s].forEach((_, k) => { if (banned.has(k)) st.cls[k] = 'bad'; });
      if (act !== null) { st.cls[act] = 'cur'; st.tags[act] = [{ label: 'acts', tone: 'accent' }]; }
      if (ban !== null) st.tags[ban] = [{ label: 'banned', tone: 'danger' }];
      return { strips: [st], lanes: [{ label: 'Radiant queue', items: lane(R, 'R') }, { label: 'Dire queue', items: lane(D, 'D') }] };
    };
    snap({ kind: 'start', lines: ['queues'], ...view(), title: `Senate "${s}"`, text: 'Whoever acts should ban the opponent who would act soonest: that is the one about to ban one of their own. Keep each party\'s turn numbers in a queue. The two fronts duel: the earlier turn wins, bans the other, and comes back next round at turn + n.', calc: [`R: ${list(R)}`, `D: ${list(D)}`] });
    while (R.length && D.length) {
      const r = R.shift(), d = D.shift();
      const rFirst = r < d;
      const win = rFirst ? r : d, lose = rFirst ? d : r;
      banned.add(lose % n);
      (rFirst ? R : D).push(win + n);
      snap({ kind: 'duel', lines: ['duel', 'ban'], ...view(win % n, lose % n), title: `${rFirst ? 'R' : 'D'}${win % n} acts first: bans ${rFirst ? 'D' : 'R'}${lose % n}`, text: `Turn ${win} comes before turn ${lose}, so ${rFirst ? 'R' : 'D'}${win % n} acts first and bans the opponent who would act next. ${rFirst ? 'R' : 'D'}${win % n} acts again next round, at turn ${win + n}.`, calc: [`R: ${list(R)}`, `D: ${list(D)}`] });
    }
    const ans = R.length ? 'Radiant' : 'Dire';
    snap({ kind: 'done', lines: ['ans'], ...view(), out: ans, answer: ans, title: `${ans} announces victory`, text: 'Every duel removes one senator, so there are at most n duels: O(n).', calc: [ans] });
    return steps;
  }

  if (mode === 'jump7') {
    const { s, minJ, maxJ } = input, n = s.length;
    const reach = Array(n).fill(null);
    reach[0] = true;
    let count = 0;
    const view = (i = null) => {
      const st = S('s', [...s]);
      [...s].forEach((c, k) => { if (reach[k] === true) st.cls[k] = 'hit'; else if (reach[k] === false) st.cls[k] = c === '1' ? 'bad' : 'dim'; });
      if (i !== null) { st.cls[i] = `${st.cls[i] ?? ''} cur`; const lo = Math.max(0, i - maxJ), hi = i - minJ; if (hi >= 0) st.bands = [{ from: lo, to: hi, tone: 'accent', label: 'can jump from' }]; }
      return { strips: [st], chips: [{ label: 'reachable in the window', chips: [{ key: 'c', text: String(count), tone: count ? 'success' : undefined }] }] };
    };
    snap({ kind: 'start', lines: [], ...view(), title: `"${s}", jumps of ${minJ} to ${maxJ}`, text: `Index i is reachable if s[i] is "0" and some reachable index lies in the window [i − ${maxJ}, i − ${minJ}]. Checking the whole window each time is O(n · ${maxJ - minJ + 1}). Instead slide the window and keep a count of reachable indexes inside it: one enters on the right and one leaves on the left per step.`, calc: ['reach[0] = true'] });
    for (let i = 1; i < n; i++) {
      const ent = i - minJ, lev = i - maxJ - 1;
      if (ent >= 0 && reach[ent]) count++;
      if (lev >= 0 && reach[lev]) count--;
      reach[i] = s[i] === '0' && count > 0;
      snap({ kind: reach[i] ? 'take' : 'skip', lines: ['enter', 'leave', 'set'], ...view(i), title: s[i] === '1' ? `Index ${i} is "1": blocked` : reach[i] ? `Index ${i}: ${count} way${count === 1 ? '' : 's'} in, reachable` : `Index ${i}: nothing reachable in the window`, text: `The window for ${i} is ${i - minJ < 0 ? 'empty' : `[${Math.max(0, i - maxJ)}, ${i - minJ}]`}.${ent >= 0 ? ` Index ${ent} entered${reach[ent] ? ' (reachable, +1)' : ''}.` : ''}${lev >= 0 ? ` Index ${lev} left${reach[lev] ? ' (reachable, −1)' : ''}.` : ''} ${s[i] === '1' ? 'A "1" can never be landed on.' : reach[i] ? 'Some reachable index can jump here.' : 'No reachable index can jump here.'}`, calc: [`count = ${count}`, `reach[${i}] = ${reach[i]}`] });
    }
    const ok = reach[n - 1];
    snap({ kind: 'done', lines: ['ans'], ...view(), out: String(ok), answer: String(ok), title: ok ? 'The last index is reachable: true' : 'The last index is not reachable: false', text: 'Each index entered and left the window once: O(n). A prefix sum of reach[] works too.', calc: [String(ok)] });
    return steps;
  }

  // orderly queue
  const { s, k } = input, n = s.length;
  if (k === 1) {
    let best = s, bestAt = 0;
    snap({ kind: 'start', lines: ['k1', 'move'], strips: [S('s', [...s])], title: `"${s}", k = 1`, text: 'With k = 1 the only move is "first letter to the end": a rotation. Rotating n times returns to the start, so exactly the n rotations are reachable. Try them all.', calc: [`${n} rotations`] });
    for (let i = 1; i < n; i++) {
      const r = s.slice(i) + s.slice(0, i);
      const better = r < best, was = best;
      if (better) { best = r; bestAt = i; }
      const st = S(`rotation ${i}`, [...r]);
      st.bands = [{ from: n - i, to: n - 1, tone: 'muted', label: 'moved' }];
      snap({ kind: better ? 'take' : 'skip', lines: ['k1'], strips: [st], chips: [{ label: 'smallest so far', chips: [{ key: 'b', text: best, tone: 'success' }] }], title: `"${r}"${better ? ': new smallest' : ''}`, text: `Move the first ${i} letter${i === 1 ? '' : 's'} to the end. ${better ? `"${r}" comes before "${was}" alphabetically.` : `Not smaller than "${best}".`}`, calc: [`best = "${best}"`] });
    }
    snap({ kind: 'done', lines: ['k1'], strips: [S('answer', [...best])], out: best, answer: `"${best}"`, title: `Smallest rotation: "${best}"`, text: 'O(n²) to build and compare n rotations (fine for 1000 letters).', calc: [`"${best}"`] });
    return steps;
  }
  // k ≥ 2: show a shortest sequence of moves to the sorted string, found by BFS
  const target = [...s].sort().join('');
  const prev = new Map([[s, null]]), q = [s];
  while (q.length && !prev.has(target)) { const t = q.shift(); for (let i = 0; i < k; i++) { const u = t.slice(0, i) + t.slice(i + 1) + t[i]; if (!prev.has(u)) { prev.set(u, [t, i]); q.push(u); } } }
  const path = [];
  for (let t = target; prev.get(t); t = prev.get(t)[0]) path.push([prev.get(t)[0], prev.get(t)[1], t]);
  path.reverse();
  const front = (str, moved = null) => { const st = S('s', [...str]); for (let i = 0; i < k; i++) st.tags[i] = [{ label: i === moved ? 'move' : 'may move', tone: i === moved ? 'warn' : 'muted' }]; return st; };
  snap({ kind: 'start', lines: ['k2', 'move'], strips: [front(s)], title: `"${s}", k = ${k}`, text: 'With k ≥ 2 any two neighbouring letters can be swapped: rotate until they are at the front, move the second one to the end, then keep rotating until the string comes back around. Swapping neighbours can sort anything, so the answer is simply the sorted string. Here is a shortest run of moves that gets there.', calc: [`sorted: "${target}"`] });
  path.forEach(([from, i, to]) => {
    snap({ kind: 'move', lines: ['move'], strips: [front(from, i), S('after', [...to], { index: false, cls: { [n - 1]: 'hit' } })], title: `Move "${from[i]}" to the end: "${to}"`, text: `"${from[i]}" is among the first ${k} letters, so it may go to the end.`, calc: [`"${from}" → "${to}"`] });
  });
  snap({ kind: 'done', lines: ['k2'], strips: [S('answer', [...target])], out: target, answer: `"${target}"`, title: `"${target}" (just sort)`, text: 'No search is needed in the real solution: sorting the letters is O(n log n).', calc: [`"${target}"`] });
  return steps;
}

// ---------------------------------------------------------------- inputs

const ints = (t) => String(t ?? '').replace(/[[\]$]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
const intsIn = (t, lo, hi, a, b) => { const r = ints(t); return r.length >= a && r.length <= b && r.every((v) => isInt(v, lo, hi)) ? r : null; };

export function parseGreedyWalk(values, input) {
  const { mode } = input;
  if (mode === 'cookies') { const g = intsIn(values.g, 1, 20, 1, 6), s = intsIn(values.s, 1, 20, 1, 6); return g && s ? { input: { mode, g, s } } : { error: '1 to 6 children and 1 to 6 cookies, sizes 1 to 20.' }; }
  if (mode === 'stock') { const p = intsIn(values.prices, 0, 20, 1, 9); return p ? { input: { mode, prices: p } } : { error: '1 to 9 prices from 0 to 20.' }; }
  if (mode === 'boats') { const p = intsIn(values.people, 1, 20, 1, 7), L = Number(values.limit); if (!p || !isInt(L, Math.max(...(p ?? [1])), 30)) return { error: '1 to 7 weights; the limit is at least the heaviest and at most 30.' }; return { input: { mode, people: p, limit: L } }; }
  if (mode === 'twocity') {
    const pairs = String(values.costs ?? '').split(/[;|]/).map((x) => ints(x)).filter((x) => x.length);
    if (pairs.length < 2 || pairs.length > 6 || pairs.length % 2 || pairs.some((x) => x.length !== 2 || !x.every((v) => isInt(v, 1, 999)))) return { error: '2, 4 or 6 people as "a b" pairs separated by ;, costs 1 to 999.' };
    return { input: { mode, costs: pairs } };
  }
  if (mode === 'candy') { const r = intsIn(values.ratings, 0, 9, 1, 8); return r ? { input: { mode, ratings: r } } : { error: '1 to 8 ratings from 0 to 9.' }; }
  if (mode === 'lemonade') { const b = intsIn(values.bills, 5, 20, 1, 9); return b && b.every((x) => [5, 10, 20].includes(x)) ? { input: { mode, bills: b } } : { error: '1 to 9 bills, each 5, 10 or 20.' }; }
  if (mode === 'triplets') {
    const T = String(values.triplets ?? '').split(/[;|]/).map((x) => ints(x)).filter((x) => x.length);
    const x = intsIn(values.target, 1, 9, 3, 3);
    if (!x || T.length < 1 || T.length > 5 || T.some((t) => t.length !== 3 || !t.every((v) => isInt(v, 1, 9)))) return { error: '1 to 5 triplets "a b c" separated by ;, and a target of three values, all 1 to 9.' };
    return { input: { mode, triplets: T, target: x } };
  }
  if (mode === 'wildcard') { const s = String(values.s ?? '').trim(); return /^[()*]{1,10}$/.test(s) ? { input: { mode, s } } : { error: '1 to 10 characters, each (, ) or *.' }; }
  if (mode === 'straights') { const h = intsIn(values.hand, 0, 20, 1, 10), size = Number(values.size); if (!h || !isInt(size, 1, h.length)) return { error: '1 to 10 cards from 0 to 20, and a group size from 1 to the number of cards.' }; return { input: { mode, hand: h, size } }; }
  if (mode === 'senate') { const s = String(values.senate ?? '').trim().toUpperCase(); return /^[RD]{1,8}$/.test(s) ? { input: { mode, senate: s } } : { error: '1 to 8 letters, each R or D.' }; }
  if (mode === 'jump7') {
    const s = String(values.s ?? '').trim(), a = Number(values.minJ), b = Number(values.maxJ);
    if (!/^0[01]{1,9}$/.test(s)) return { error: '2 to 10 characters of 0 and 1, starting with 0.' };
    if (!isInt(a, 1, s.length - 1) || !isInt(b, a, s.length - 1)) return { error: `1 ≤ minJump ≤ maxJump < ${s.length}.` };
    return { input: { mode, s, minJ: a, maxJ: b } };
  }
  const s = String(values.s ?? '').trim(), k = Number(values.k);
  if (!/^[a-z]{1,6}$/.test(s) || !isInt(k, 1, s.length)) return { error: '1 to 6 lower-case letters, and k from 1 to the length.' };
  return { input: { mode, s, k } };
}

export function greedyWalkValues(input) {
  const { mode } = input;
  if (mode === 'cookies') return { g: input.g.join(', '), s: input.s.join(', ') };
  if (mode === 'stock') return { prices: input.prices.join(', ') };
  if (mode === 'boats') return { people: input.people.join(', '), limit: String(input.limit) };
  if (mode === 'twocity') return { costs: input.costs.map((p) => p.join(' ')).join('; ') };
  if (mode === 'candy') return { ratings: input.ratings.join(', ') };
  if (mode === 'lemonade') return { bills: input.bills.join(', ') };
  if (mode === 'triplets') return { triplets: input.triplets.map((t) => t.join(' ')).join('; '), target: input.target.join(', ') };
  if (mode === 'wildcard') return { s: input.s };
  if (mode === 'straights') return { hand: input.hand.join(', '), size: String(input.size) };
  if (mode === 'senate') return { senate: input.senate };
  if (mode === 'jump7') return { s: input.s, minJ: String(input.minJ), maxJ: String(input.maxJ) };
  return { s: input.s, k: String(input.k) };
}

export function randomGreedyWalk(input, rand = Math.random) {
  const g = rng(rand);
  const { mode } = input;
  const arr = (n, lo, hi) => Array.from({ length: n }, () => g.int(lo, hi));
  if (mode === 'cookies') return { mode, g: arr(g.int(1, 5), 1, 9), s: arr(g.int(1, 6), 1, 9) };
  if (mode === 'stock') return { mode, prices: arr(g.int(2, 8), 0, 9) };
  if (mode === 'boats') { const p = arr(g.int(1, 7), 1, 9); return { mode, people: p, limit: g.int(Math.max(...p), 12) }; }
  if (mode === 'twocity') return { mode, costs: Array.from({ length: 2 * g.int(1, 3) }, () => [g.int(1, 99), g.int(1, 99)]) };
  if (mode === 'candy') return { mode, ratings: arr(g.int(1, 8), 0, 6) };
  if (mode === 'lemonade') return { mode, bills: Array.from({ length: g.int(1, 8) }, () => g.pick([5, 5, 5, 10, 10, 20])) };
  if (mode === 'triplets') return { mode, triplets: Array.from({ length: g.int(1, 5) }, () => arr(3, 1, 6)), target: arr(3, 1, 6) };
  if (mode === 'wildcard') return { mode, s: Array.from({ length: g.int(1, 8) }, () => g.pick(['(', ')', '*'])).join('') };
  if (mode === 'straights') { const size = g.int(1, 4); return { mode, hand: arr(size * g.int(1, 3) + (g.bool(0.2) ? 1 : 0), 1, 8).slice(0, 10), size }; }
  if (mode === 'senate') return { mode, senate: Array.from({ length: g.int(1, 8) }, () => g.pick(['R', 'D'])).join('') };
  if (mode === 'jump7') { const n = g.int(2, 10); const s = `0${Array.from({ length: n - 1 }, () => (g.bool(0.35) ? '1' : '0')).join('')}`; const a = g.int(1, n - 1); return { mode, s, minJ: a, maxJ: g.int(a, n - 1) }; }
  const n = g.int(1, 6);
  return { mode, s: Array.from({ length: n }, () => g.pick(['a', 'b', 'c', 'd'])).join(''), k: g.int(1, Math.min(3, n)) };
}

export const greedyWalkFields = (input) => ({
  cookies: [{ name: 'g', label: 'greed', placeholder: '1, 2, 3' }, { name: 's', label: 'cookies', placeholder: '3, 1, 1' }],
  stock: [{ name: 'prices', label: 'prices', placeholder: '7, 1, 5, 3, 6, 4' }],
  boats: [{ name: 'people', label: 'weights', placeholder: '3, 2, 2, 1' }, { name: 'limit', label: 'limit', placeholder: '3', short: true }],
  twocity: [{ name: 'costs', label: 'costs "a b; a b; …"', placeholder: '10 20; 30 200; 400 50; 30 20' }],
  candy: [{ name: 'ratings', label: 'ratings', placeholder: '1, 0, 2' }],
  lemonade: [{ name: 'bills', label: 'bills', placeholder: '5, 5, 5, 10, 20' }],
  triplets: [{ name: 'triplets', label: 'triplets "a b c; …"', placeholder: '2 5 3; 1 8 4; 1 7 5' }, { name: 'target', label: 'target', placeholder: '2, 7, 5', short: true }],
  wildcard: [{ name: 's', label: 's', placeholder: '(*))' }],
  straights: [{ name: 'hand', label: 'cards', placeholder: '1, 2, 3, 6, 2, 3, 4, 7, 8' }, { name: 'size', label: 'group size', placeholder: '3', short: true }],
  senate: [{ name: 'senate', label: 'senate (R and D)', placeholder: 'RDD' }],
  jump7: [{ name: 's', label: 's', placeholder: '011010' }, { name: 'minJ', label: 'min', placeholder: '2', short: true }, { name: 'maxJ', label: 'max', placeholder: '3', short: true }],
  orderly: [{ name: 's', label: 's', placeholder: 'cba' }, { name: 'k', label: 'k', placeholder: '1', short: true }],
})[input.mode];

export function greedyWalkDescribe(input) {
  const { mode } = input;
  if (mode === 'cookies') return `greed ${list(input.g)}, cookies ${list(input.s)}`;
  if (mode === 'stock') return `prices ${list(input.prices)}`;
  if (mode === 'boats') return `weights ${list(input.people)}, limit ${input.limit}`;
  if (mode === 'twocity') return input.costs.map((p) => `[${p.join(', ')}]`).join(' ');
  if (mode === 'candy') return `ratings ${list(input.ratings)}`;
  if (mode === 'lemonade') return `bills ${list(input.bills)}`;
  if (mode === 'triplets') return `${input.triplets.length} triplets, target ${list(input.target)}`;
  if (mode === 'straights') return `${list(input.hand)}, groups of ${input.size}`;
  if (mode === 'jump7') return `"${input.s}", jumps ${input.minJ}..${input.maxJ}`;
  if (mode === 'orderly') return `"${input.s}", k = ${input.k}`;
  return `"${input.s ?? input.senate}"`;
}

export const greedyWalkRule = {
  cookies: 'smallest cookie that satisfies the least greedy child',
  stock: 'sell today at the best price minus the lowest price so far',
  boats: 'the heaviest leaves now, with the lightest if they fit',
  twocity: 'sort by aCost − bCost; first half to A',
  candy: 'left pass for the left rule, right pass for the right rule, keep the max',
  lemonade: 'for $20, give $10 + $5 before three $5s',
  triplets: 'skip triplets that overshoot; the rest must cover x, y and z',
  wildcard: 'track the fewest and the most open "("',
  straights: 'the smallest card left must start a group',
  senate: 'the earlier turn bans the other party\'s next senator',
  jump7: 'count reachable indexes in a sliding window',
  orderly: 'k = 1: best rotation; k ≥ 2: sorted',
};
