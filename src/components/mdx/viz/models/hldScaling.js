/**
 * HLD Scaling Compute step-throughs (models for <SessionsViz> and <BalancerViz>). Pure, so
 * scripts/viz-check.mjs can test them.
 */
import { plural } from './util.js';

// ---------------------------------------------------------------- where does session state live?

export const SESSIONS = {
  memory: { label: 'Sessions in server memory', input: { mode: 'memory' } },
  shared: { label: 'Sessions in a shared store', input: { mode: 'shared' } },
};

export const sessionsCode = {
  memory: [
    ['login', 'session = new Session(user);  sessions.put(id, session);   // this server\'s RAM'],
    ['sticky', 'LB: route by cookie → always the same server            // sticky sessions'],
    ['read', 'session = sessions.get(id);   // null on any other server'],
  ],
  shared: [
    ['login', 'redis.set("session:" + id, session, ttl);   // shared store'],
    ['any', 'LB: any healthy server (round robin)'],
    ['read', 'session = redis.get("session:" + id);        // same on every server'],
  ],
};

export function sessions({ mode }) {
  const servers = { A: { up: true, chips: [], load: 0 }, B: { up: true, chips: [], load: 0 }, C: { up: true, chips: [], load: 0 } };
  const store = [];
  const steps = [];
  const shared = mode === 'shared';
  const snap = (s) => steps.push({ servers: JSON.parse(JSON.stringify(servers)), store: [...store], shared, ...s });
  // packets fly one after another: user → LB → server (→ store), `at` seconds into the step
  const route = (user, server, label, tone = 'accent', ...more) => [
    { from: user, to: 'lb', label, tone, at: 0 }, { from: 'lb', to: server, label, tone, at: 0.7 },
    ...more.map((m, k) => ({ ...m, at: 1.4 + k * 0.7 })),
  ];
  const setChip = (sv, text, tone = 'accent') => {
    const name = text.split(' ')[0];
    servers[sv].chips = [...servers[sv].chips.filter((c) => !c.text.startsWith(name)), { text, tone }];
  };
  const setStore = (text) => {
    const name = text.split(' ')[0];
    const k = store.findIndex((c) => c.text.startsWith(name));
    if (k >= 0) store[k] = { text, tone: 'success' }; else store.push({ text, tone: 'success' });
  };

  snap({
    kind: 'start', packets: [], lines: [],
    title: shared ? 'Sessions live in a shared store, not in the servers' : 'Each server keeps its users\' sessions in its own memory',
    text: shared
      ? 'Same three users and three app servers, but now a login writes the session to a shared store (Redis here). The app servers keep nothing between requests: they are stateless, so any of them can handle any request.'
      : 'Three users, one load balancer, three app servers. When you log in, the server you hit keeps your session (and your cart) in its RAM. That is fast and simple, until it isn\'t.',
    calc: [shared ? 'state: in Redis' : 'state: in each server\'s RAM', 'servers: A, B, C'],
  });

  servers.A.load++;
  if (shared) setStore('Alice ✓'); else setChip('A', 'Alice ✓');
  snap({
    kind: 'login', packets: route('alice', 'A', 'login', 'accent', ...(shared ? [{ from: 'A', to: 'store', label: 'save', tone: 'success' }] : [])), lines: ['login'],
    title: 'Alice logs in, and lands on server A',
    text: shared ? 'A checks her password and writes her session to the shared store. A itself remembers nothing once the request is done.' : 'A checks her password and keeps her session in its own memory.',
    calc: [shared ? 'redis.set(session:alice)' : 'A.sessions += alice'],
  });

  servers.B.load++;
  if (shared) setStore('Bob ✓'); else setChip('B', 'Bob ✓');
  snap({
    kind: 'login', packets: route('bob', 'B', 'login', 'accent', ...(shared ? [{ from: 'B', to: 'store', label: 'save', tone: 'success' }] : [])), lines: ['login'],
    title: 'Bob logs in on server B',
    text: shared ? 'Bob\'s session also goes to the store. Note the servers hold no chips: there is nothing on them to lose.' : 'Bob\'s session now exists only in B\'s RAM. Bob is tied to B from here on.',
    calc: [shared ? 'redis.set(session:bob)' : 'B.sessions += bob'],
  });

  if (shared) {
    servers.C.load++;
    setStore('Bob ✓ cart 2');
    snap({
      kind: 'any', packets: route('bob', 'C', 'add to cart', 'accent', { from: 'C', to: 'store', label: 'read + write', tone: 'success' }), lines: ['any', 'read'],
      title: 'Bob adds to his cart, served by C this time',
      text: 'Round robin sends Bob\'s next request to C. That is fine: C reads Bob\'s session from the store, updates his cart and writes it back. The load balancer can spread requests freely, with no stickiness.',
      calc: ['redis.get(session:bob) → found', 'cart = 2 items'],
    });
  } else {
    servers.B.load++;
    setChip('B', 'Bob ✓ cart 2');
    snap({
      kind: 'sticky', packets: route('bob', 'B', 'add to cart'), lines: ['sticky'],
      title: 'Bob adds to his cart: the load balancer must send him to B',
      text: 'Only B knows Bob, so the load balancer uses a sticky session (a cookie or a hash of his IP) to pin him there. Load can no longer be balanced freely: a busy user stays on a busy server.',
      calc: ['route(bob) = B (sticky)', 'B.sessions[bob].cart = 2 items'],
    });
  }

  servers.B.up = false;
  const lostChips = servers.B.chips;
  servers.B.chips = lostChips.map((c) => ({ text: `${c.text.split(' ')[0]}: lost`, tone: 'danger' }));
  snap({
    kind: 'crash', packets: [], lines: [],
    title: 'Server B crashes',
    text: shared
      ? 'B goes down. The load balancer\'s health checks notice and stop sending traffic to it. Nothing is lost: B was not holding any state.'
      : 'B goes down, and everything in its RAM goes with it: Bob\'s session and his 2-item cart. The load balancer\'s health checks notice and stop sending traffic to B.',
    calc: ['health check B → fail', shared ? 'state lost: none' : 'state lost: Bob\'s session + cart'],
  });

  if (shared) {
    servers.A.load++;
    snap({
      kind: 'any', packets: route('bob', 'A', 'checkout', 'success', { from: 'A', to: 'store', label: 'read', tone: 'success' }, { from: 'A', to: 'bob', label: '200 OK', tone: 'success' }), lines: ['any', 'read'],
      title: 'Bob checks out on A: still logged in, cart intact',
      text: 'A has never seen Bob before, and it doesn\'t matter: his session and cart come from the store. The crash was invisible to him.',
      calc: ['redis.get(session:bob) → cart = 2 items', '200 OK'],
    });
    servers.D = { up: true, chips: [], load: 0, isNew: true };
    snap({
      kind: 'scale', packets: [{ from: 'lb', to: 'D', label: 'traffic', tone: 'accent' }], lines: ['any'],
      title: 'Traffic grows: add server D, and it works at once',
      text: 'Scaling out is now just "start another copy". D needs no warm-up and no session migration, and auto-scaling can add or remove servers whenever load changes. This is why "make the app tier stateless" comes up in almost every design.',
      calc: ['servers: A, C, D (+ B when it recovers)', 'no data to move'],
    });
  } else {
    servers.C.load++;
    snap({
      kind: 'fail', packets: route('bob', 'C', 'checkout', 'warn', { from: 'C', to: 'bob', label: '401 log in', tone: 'danger' }), lines: ['read'],
      title: 'Bob\'s next click lands on C: "please log in", cart gone',
      text: 'With B down, the load balancer sends Bob to C, which has never heard of him. Bob is logged out and his cart is gone. Every user who was on B has the same problem.',
      calc: ['C.sessions.get(bob) → null', '401 Unauthorized'],
    });
  }

  snap({
    kind: 'done', packets: [], lines: [], answer: shared ? 'stateless servers: crash-safe, scale freely' : 'state in RAM: lost on crash, hard to scale',
    title: shared ? 'Stateless servers, state in a shared store' : 'The cost of keeping state in the server',
    text: shared
      ? 'Move session state out of the servers (Redis, a database, or a signed token the client carries) and the app tier becomes interchangeable: any server, any request, add or remove at will. The store must now be fast and highly available itself, and it is one network hop away.'
      : 'In-memory sessions forced sticky routing, made a crash log users out, and would make adding servers awkward (new servers get no existing users; removing one logs users out). The fix is the other example: keep the state somewhere shared.',
    calc: shared ? ['servers: interchangeable', 'store: must be highly available'] : ['crash → sessions lost', 'sticky routing → uneven load'],
  });
  return steps;
}

// ---------------------------------------------------------------- load-balancing algorithms

/** Three kinds of request: how long each keeps a server busy, in seconds. */
export const JOBS = {
  S: { label: 'page', name: 'open a page', secs: 1 },
  M: { label: 'search', name: 'run a search', secs: 3 },
  L: { label: 'report', name: 'export a report', secs: 6 },
};
export const PEOPLE = ['Asha', 'Ben', 'Chen', 'Dev'];
/** Nine requests, one per second: who sends it and how big it is. */
export const REQUESTS = [['Asha', 'M'], ['Ben', 'S'], ['Chen', 'L'], ['Asha', 'S'], ['Dev', 'S'], ['Ben', 'L'], ['Chen', 'S'], ['Dev', 'M'], ['Asha', 'S']];
export const SERVERS = ['A', 'B', 'C'];

export const BALANCER = {
  rr: { label: 'Round robin', input: { algo: 'rr' } },
  least: { label: 'Least connections', input: { algo: 'least' } },
  weighted: { label: 'Weighted', input: { algo: 'weighted' } },
  iphash: { label: 'IP hash', input: { algo: 'iphash' } },
  health: { label: 'A server crashes', input: { algo: 'health' } },
};

export const balancerCode = {
  rr: [['pick', 'server = servers[turn];  turn = (turn + 1) % 3   // A, B, C, A, B, C…']],
  least: [['pick', 'server = the one with the fewest requests in progress']],
  weighted: [['add', 'every server: score += weight        // A: 3, B: 1, C: 1'], ['pick', 'winner = highest score;  winner.score -= 5   // total weight']],
  iphash: [['pick', 'server = servers[hash(client IP) % 3]   // same person → same server']],
  health: [
    ['check', 'every second: GET /health on every server'],
    ['out', '2 misses in a row → stop sending it requests;  2 good answers → back in'],
    ['pick', 'server = next in turn, skipping servers that are out'],
    ['retry', 'if the server doesn\'t answer: try the next one   // safe for reads'],
  ],
};

const HASH = { Asha: 0, Ben: 1, Chen: 2, Dev: 0 };   // a fixed toy hash: person → server index
export const WEIGHT = { A: 3, B: 1, C: 1 };
const CRASH = 3, OUT = 5, BACK = 7;                  // the 'health' example, in seconds
export const HEALTH = { crash: CRASH, out: OUT, back: BACK };
const job = (size) => `${JOBS[size].label} (${JOBS[size].secs} s)`;
const counts = (active) => SERVERS.map((s) => `${s} ${active[s].length}`).join(' · ');
const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

/** Nine requests of mixed size, one per second, spread over servers A, B and C by `algo`. */
export function balancer({ algo }) {
  const ids = SERVERS;
  const weighted = algo === 'weighted';
  const health = algo === 'health';
  const active = { A: [], B: [], C: [] };      // requests in progress: { id, who, size, start, ends }
  const bars = [];                             // every request placed so far (failed attempts too)
  const work = { A: 0, B: 0, C: 0 };
  const served = { A: 0, B: 0, C: 0 };
  const peak = { A: 0, B: 0, C: 0 };
  const score = { A: 0, B: 0, C: 0 };
  const checks = { A: [], B: [], C: [] };      // health-check answers so far, one per second
  const crashed = new Set();
  const out = new Set();
  let pos = 0;
  const steps = [];
  const jobsAt = (t) => Object.fromEntries(ids.map((k) => [k, active[k].map((r) => ({ id: r.id, who: r.who, size: r.size, left: r.ends - t, total: r.ends - r.start }))]));
  const snap = (s) => steps.push({
    bars: bars.map((b) => ({ ...b })), inFlight: Object.fromEntries(ids.map((k) => [k, active[k].length])), work: { ...work }, served: { ...served },
    crashed: [...crashed], out: [...out], score: { ...score }, weighted, checks: health ? JSON.parse(JSON.stringify(checks)) : null, ...s,
  });
  const nextInTurn = () => {
    for (let k = 0; k < ids.length; k++) {
      const s = ids[(pos + k) % ids.length];
      if (!out.has(s)) { pos = (ids.indexOf(s) + 1) % ids.length; return s; }
    }
    return null;
  };
  snap({
    kind: 'start', t: 0, lines: [], jobs: jobsAt(0), done: [], say: 'Ready!',
    title: {
      rr: 'Round robin: everyone takes a turn',
      least: 'Least connections: give it to the least busy server',
      weighted: 'Weighted: the bigger server gets more',
      iphash: 'IP hash: each person sticks to one server',
      health: 'Health checks: what if a server crashes?',
    }[algo],
    text: `Nine requests arrive, one every second, from Asha, Ben, Chen and Dev. They aren't equal: opening a page takes 1 s, a search 3 s, exporting a report 6 s. A server can work on several at once, but the more it juggles, the slower each one gets. ${{
      rr: 'Round robin deals them out like cards, A, B, C, A, B, C…, without looking at how busy anyone is.',
      least: 'Least connections looks at each server first and picks the one doing the least right now.',
      weighted: 'Server A is a much bigger machine, so it gets weight 3 and the others weight 1.',
      iphash: 'IP hash sends each person to "their" server every time, based on a hash of their address.',
      health: 'The load balancer takes turns, and asks every server "are you OK?" once a second. Server B is about to crash.',
    }[algo]}`,
    calc: ['page 1 s · search 3 s · report 6 s', 'one request per second'],
  });
  REQUESTS.forEach(([who, size], i) => {
    const t = i;
    const done = [];
    for (const s of ids) {
      done.push(...active[s].filter((r) => r.ends <= t).map((r) => ({ id: r.id, who: r.who, size: r.size, server: s })));
      active[s] = active[s].filter((r) => r.ends > t);
    }
    if (health) {
      // B answers its check at second 3 and then crashes; it misses 4 and 5 (out), restarts and answers 6 and 7 (back in)
      if (t === BACK - 1) crashed.delete('B');
      for (const s of ids) checks[s].push(!crashed.has(s));
      if (t === CRASH) crashed.add('B');
      if (t === OUT) out.add('B');
      if (t === BACK) out.delete('B');
    }
    const id = `#${i + 1}`;
    const ask = `${who} wants to ${JOBS[size].name} (${JOBS[size].secs} s).`;
    const finished = done.length ? `${done.map((d) => `${d.who}'s ${JOBS[d.size].label} on ${d.server}`).join(' and ')} ${done.length === 1 ? 'is' : 'are'} done. ` : '';
    let kind = 'pick', lines = ['pick'], pick, why, say, calc, bounce = null;
    if (algo === 'rr' || health) {
      pick = nextInTurn();
      const idle = ids.filter((s) => s !== pick && !crashed.has(s) && !out.has(s) && active[s].length === 0);
      say = `${pick}'s turn!`;
      why = `It's ${pick}'s turn, so ${pick} gets it${active[pick].length && idle.length ? `, even though ${pick} is already busy and ${and(idle)} ${idle.length === 1 ? 'is' : 'are'} doing nothing` : ''}.`;
      calc = [`turn → ${pick}`];
      if (health) {
        if (t === CRASH) { kind = 'crash'; why = `Server B has just crashed, right after answering a health check, so the load balancer doesn't know yet. ${why}`; }
        if (t === OUT) { kind = 'out'; lines = ['check', 'out', 'pick']; say = `${pick}'s turn (B is out)`; why = `B missed its second health check in a row, so the load balancer stops sending it anything. ${why.replace(/^It's/, 'Skipping B, it\'s')}`; }
        if (t === BACK) { kind = 'back'; lines = ['check', 'out', 'pick']; why = `B restarted and answered two health checks, so it's back in the rotation. ${why}`; }
        if (out.has('B') && t !== OUT && t !== BACK) { say = `${pick}'s turn (B is out)`; why = `${crashed.has('B') ? 'B is still down.' : 'B has restarted and answered one health check, but it needs two in a row before it gets requests again.'} ${why}`; }
      }
      if (crashed.has(pick)) {
        bars.push({ id, who, size, server: pick, start: t, ends: t, failed: true });
        const retry = nextInTurn();
        kind = 'fail'; lines = ['check', 'pick', 'retry'];
        bounce = { from: pick, to: retry };
        say = `${pick}? No answer… ${retry}, then!`;
        why = `It's ${pick}'s turn, and the load balancer still thinks ${pick} is fine: it has missed only one health check. ${pick} doesn't answer, so the request is passed on to ${retry}. ${who} just waits a moment longer instead of seeing an error. (Retrying is safe for reading a page; for something like a payment it needs more care.)`;
        calc = [`${pick}: no answer`, `retry → ${retry}`, `B health checks: 1 missed`];
        pick = retry;
      }
    } else if (algo === 'least') {
      const fewest = Math.min(...ids.map((s) => active[s].length));
      const tied = ids.filter((s) => active[s].length === fewest);
      pick = tied[0];
      say = fewest === 0 ? `${pick} is free!` : `${pick} is least busy`;
      why = `Requests in progress right now: ${counts(active)}. ${pick} has the fewest${tied.length > 1 ? ` (${and(tied)} are tied, so the first one wins)` : ''}, so ${pick} gets it.`;
      calc = [`in progress: ${counts(active)}`, `fewest → ${pick}`];
    } else if (weighted) {
      for (const s of ids) score[s] += WEIGHT[s];
      const scores = ids.map((s) => `${s} ${score[s]}`).join(' · ');
      pick = ids.reduce((b, s) => (score[s] > score[b] ? s : b), ids[0]);
      score[pick] -= 5;
      lines = ['add', 'pick'];
      const nth = (i % 5) + 1;
      say = pick === 'A' ? 'A again: it\'s 3× bigger' : `${pick}'s share`;
      why = i === 0
        ? `A is three times as powerful, so out of every 5 requests it should get 3, spread out as A, B, A, C, A. This is request 1 of 5, so A gets it. (Behind the scenes each server keeps a score; see "the check".)`
        : `Request ${nth} of every 5. The pattern A, B, A, C, A gives this one to ${pick}.`;
      calc = [`scores ${scores} → highest: ${pick}`, `${pick} −5 → ${score[pick]}`];
    } else {
      pick = ids[HASH[who]];
      const before = bars.some((b) => b.who === who);
      say = `${who} → ${pick}, as always`;
      const busy = active[pick].length ? ` It doesn't matter that ${pick} already has ${plural(active[pick].length, 'request')} in progress: the hash never looks.` : '';
      why = before
        ? `Same person, same server: ${who} goes to ${pick} again.${busy}`
        : `The balancer hashes ${who}'s IP address, which always comes out as ${pick}. Handy when ${pick} keeps ${who}'s data cached, but it never checks how busy ${pick} is.${busy}`;
      calc = [`hash(${who}) % 3 = ${HASH[who]} → ${pick}`];
    }
    const r = { id, who, size, server: pick, start: t, ends: t + JOBS[size].secs };
    active[pick].push(r);
    bars.push(r);
    work[pick] += JOBS[size].secs;
    served[pick]++;
    peak[pick] = Math.max(peak[pick], active[pick].length);
    snap({
      kind, t, req: { id, who, size }, pick, lines, say, bounce, done, jobs: jobsAt(t),
      title: `${who}'s ${job(size)} → ${bounce ? `${bounce.from} ✗ → ` : ''}${pick}`,
      text: `${finished}${ask} ${why}`,
      calc: [`t = ${t} s`, ...calc],
    });
  });
  const most = ids.reduce((b, s) => (work[s] > work[b] ? s : b), 'A');
  const least = ids.reduce((b, s) => (work[s] < work[b] ? s : b), 'A');
  const maxPeak = Math.max(...ids.map((s) => peak[s]));
  const report = ids.filter((s) => bars.some((b) => !b.failed && b.server === s && b.size === 'L'));
  const result = {
    rr: { title: `Unfair: ${most} got stuck with ${report.length === 1 ? 'both slow reports' : 'the slow work'}`, text: `Everyone got 3 turns, but not the same work: ${most} had ${work[most]} s of work and juggled ${peak[most]} requests at once, while ${least} had only ${work[least]} s. Round robin is fine when requests are all about the same size; when they aren't, the slow ones can pile up on one server.` },
    least: { title: `Fair: no server ever juggled more than ${maxPeak}`, text: `Whenever a server was busy with a slow report, new requests went somewhere else, so nobody had more than ${maxPeak} in progress. Least connections doesn't need to know how long a request will take; it just looks at who is busy right now. Great for mixed or long-lived requests (like WebSockets).` },
    weighted: { title: `A took ${served.A} of 9 requests, as its weight says`, text: `By count it worked: A ${served.A}, B ${served.B}, C ${served.C}. But both slow reports also landed on A (${work.A} s of work against ${work.B} s and ${work.C} s). Weights decide how many requests a server gets, not how heavy they are. Use them when your servers differ in size.` },
    iphash: { title: `Sticky, but lopsided: A served ${served.A} of 9`, text: `Asha and Dev both hash to A, so A got ${served.A} requests while B and C got ${served.B} and ${served.C}. Every person always reached the same server, which helps caching, but hashing balances people, not work. Also, adding a fourth server changes hash % 3 for most people; consistent hashing fixes that.` },
    health: { title: 'A crash, and nobody saw an error', text: 'One request found B dead and was passed to the next server. After two missed health checks, B was taken out; after it came back and answered two checks, it rejoined by itself. Health checks turn "a server died" into "one request was a bit slower".' },
  }[algo];
  for (const s of ids) active[s] = active[s].filter((r) => r.ends > REQUESTS.length);
  snap({
    kind: 'done', t: REQUESTS.length, lines: [], say: 'All done!', done: [], jobs: jobsAt(REQUESTS.length), final: true,
    answer: `most work: ${most} ${work[most]} s · least: ${least} ${work[least]} s`,
    title: result.title,
    text: result.text,
    calc: ids.map((s) => `${s}: ${plural(served[s], 'request')}, ${work[s]} s of work, at most ${peak[s]} at once`),
  });
  return steps;
}
