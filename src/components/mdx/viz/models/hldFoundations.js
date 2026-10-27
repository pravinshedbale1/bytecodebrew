/**
 * HLD Foundations step-throughs (models for <InterviewViz>, <EstimationViz>, <RequestJourneyViz>).
 * Pure, so scripts/viz-check.mjs can test them.
 */
import { parseInt1 } from './util.js';

// ---------------------------------------------------------------- number formatting

const SI = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
/** 1234 → "1.2K", 25000000000 → "25B" */
export function count(n) {
  for (const [v, s] of SI) if (n >= v) return `${trim(n / v)}${s}`;
  return trim(n);
}
const BYTES = [[1e15, 'PB'], [1e12, 'TB'], [1e9, 'GB'], [1e6, 'MB'], [1e3, 'KB']];
/** decimal units, as estimates use */
export function bytes(n) {
  for (const [v, s] of BYTES) if (n >= v) return `${trim(n / v)} ${s}`;
  return `${trim(n)} B`;
}
function trim(x) {
  if (x >= 100) return Math.round(x).toLocaleString('en-US');
  if (x >= 10) return (Math.round(x * 10) / 10).toString().replace(/\.0$/, '');
  return (Math.round(x * 100) / 100).toString();
}

// ---------------------------------------------------------------- the interview, minute by minute

export const INTERVIEW = {
  shortener: { label: 'Design a URL shortener', input: { topic: 'shortener' } },
};

export const interviewCode = [
  ['s1', '1. Clarify requirements          (~5 min)'],
  ['s2', '2. Back-of-the-envelope numbers   (~4 min)'],
  ['s3', '3. API                            (~3 min)'],
  ['s4', '4. Data model                     (~3 min)'],
  ['s5', '5. High-level design              (~11 min)'],
  ['s6', '6. Deep dives                     (~14 min)'],
  ['s7', '7. Wrap up                        (~5 min)'],
];

/** The board grows step by step: requirement notes, numbers, API, schema, then the architecture. */
export function interview() {
  const board = { notes: [], numbers: [], api: [], schema: [], arch: false, focus: null, flags: [] };
  const steps = [];
  const snap = (s) => steps.push({ board: JSON.parse(JSON.stringify(board)), ...s });
  snap({
    kind: 'start', minute: 0, lines: [],
    title: '"Design a URL shortener." The clock starts',
    text: 'You have about 45 minutes. The worst opening is to start drawing boxes. Interviewers score how you scope, reason with numbers, design, go deep and talk about trade-offs, in that order. Step through how the board fills up.',
    calc: ['time: 0 / 45 min', 'board: empty'],
    signal: 'Do you drive, or wait to be told?',
  });
  board.notes = [
    { text: 'Shorten a long URL', tone: 'accent' }, { text: 'Redirect short → long', tone: 'accent' }, { text: 'Custom alias? (stretch)', tone: 'muted' },
    { text: '100M new URLs / day', tone: 'warn' }, { text: 'Reads ≫ writes (10:1)', tone: 'warn' }, { text: 'Redirect < 50 ms, highly available', tone: 'warn' },
  ];
  snap({
    kind: 's1', minute: 5, lines: ['s1'],
    title: 'Clarify: what exactly are we building?',
    text: '"Before I design, can I check the scope?" Agree on the core features (shorten, redirect), park the extras (custom alias, analytics), and pin down the non-functional requirements: scale, read/write ratio, latency, availability. Write them on the board; everything later is justified against these notes.',
    calc: ['functional: shorten, redirect', 'non-functional: 100M writes/day, 10:1 reads, < 50 ms, 99.99%'],
    signal: 'Scoping and prioritising',
  });
  board.numbers = [
    { label: 'writes', value: '1.2K/s' }, { label: 'reads', value: '12K/s' }, { label: 'storage 5 yr', value: '~90 TB' }, { label: 'keys', value: '62⁷ ≈ 3.5T' },
  ];
  snap({
    kind: 's2', minute: 9, lines: ['s2'],
    title: 'Estimate: only the numbers that shape the design',
    text: '100M writes a day ÷ 10⁵ s ≈ 1,000–1,200/s; at 10:1 that is ~12,000 reads/s. 100M × 500 B × 365 × 5 ≈ 90 TB over five years. 7 base-62 characters give 3.5 trillion codes, far more than the 180 billion needed. Each number leads to a decision: cache the reads, shard the storage, 7-character keys.',
    calc: ['100M ÷ 86,400 ≈ 1,157 writes/s', '× 10 = ~12K reads/s', '100M × 500 B × 1,825 days ≈ 91 TB', '62⁷ = 3.52 × 10¹² codes'],
    signal: 'Quantitative reasoning',
  });
  board.api = ['POST /urls { longUrl } → { shortUrl }', 'GET /{code} → 302 Location: longUrl'];
  snap({
    kind: 's3', minute: 12, lines: ['s3'],
    title: 'API: the contract before the boxes',
    text: 'Two endpoints cover the core. Say why GET returns 302 (temporary) rather than 301 (permanent): browsers cache 301s, so you would lose click analytics. A small decision that shows you think about consequences.',
    calc: ['POST /urls → 201 + shortUrl', 'GET /{code} → 302 redirect'],
    signal: 'Interface design',
  });
  board.schema = ['urls(code PK, long_url, created_at, expires_at, owner_id)'];
  snap({
    kind: 's4', minute: 15, lines: ['s4'],
    title: 'Data model: one table, keyed by the code',
    text: 'The redirect is a lookup by code, so code is the primary key: a key-value access pattern that any store handles, and that shards cleanly by code later. No joins on the hot path.',
    calc: ['access pattern: get by code', 'size: ~500 B per row'],
    signal: 'Data modelling',
  });
  board.arch = true;
  snap({
    kind: 's5', minute: 26, lines: ['s5'],
    title: 'High-level design: the whole path, end to end',
    text: 'Client → load balancer → stateless app servers → cache → database, plus a key generator so codes never collide. Walk one write and one read through the diagram out loud. Keep every box simple; depth comes next, where the interviewer points.',
    calc: ['write: app → key generator → DB', 'read: app → cache (hit) → 302', 'read miss: cache → DB → fill cache'],
    signal: 'End-to-end design',
  });
  board.focus = 'keys';
  board.flags = [{ at: 'keys', text: 'counter ranges, no collisions' }, { at: 'cache', text: '80/20: hot URLs in memory' }];
  snap({
    kind: 's6', minute: 40, lines: ['s6'],
    title: 'Deep dives: key generation and caching',
    text: 'Pick the hardest parts. Keys: hashing the URL risks collisions; instead each app server leases a range of counter values (say 1,000 at a time) from the key generator and base-62 encodes them, so no coordination per request. Caching: 20% of URLs get 80% of clicks, so a cache in front of the DB serves most redirects in memory.',
    calc: ['key = base62(counter)', 'lease 1,000 ids per server', 'cache hit ratio ~80%+'],
    signal: 'Depth and trade-offs',
  });
  board.focus = null;
  board.flags.push({ at: 'db', text: 'bottleneck? shard by code' }, { at: 'lb', text: 'monitor p99 latency' });
  snap({
    kind: 's7', minute: 45, lines: ['s7'],
    title: 'Wrap up: bottlenecks, failures, what next',
    text: 'Summarise the design in two sentences, then name what breaks first (database growth: shard by code), how you would monitor it (redirect p99, cache hit ratio), and what you would add with more time (analytics pipeline, expiry clean-up). Ending on trade-offs leaves the strongest impression.',
    calc: ['bottleneck: DB growth → shard', 'monitor: p99, hit ratio', 'next: analytics, expiry'],
    signal: 'Ownership and communication',
  });
  snap({
    kind: 'done', minute: 45, lines: interviewCode.map(([k]) => k), answer: '45 min: 5 + 4 + 3 + 3 + 11 + 14 + 5',
    title: 'The finished board',
    text: 'Requirements justified every later choice, the numbers pointed at caching and sharding, and the deep dives went where the risk was. The time split matters as much as the content: most candidates spend 25 minutes on boxes and run out of time for depth.',
    calc: ['scope → numbers → API → data → design → depth → wrap up'],
    signal: 'All of the above',
  });
  return steps;
}

// ---------------------------------------------------------------- back-of-the-envelope estimation

export const ESTIMATE = {
  photos: { label: 'Photo sharing', input: { name: 'photo app', dau: 500e6, writes: 0.2, reads: 50, writeKB: 600, readKB: 200 } },
  chat: { label: 'Chat app', input: { name: 'chat app', dau: 50e6, writes: 40, reads: 200, writeKB: 0.2, readKB: 0.2 } },
};

export const estimateCode = [
  ['qps', 'average QPS = DAU × actions per user per day / 86,400   (≈ / 10⁵)'],
  ['peak', 'peak QPS    = average × peak factor (3×)'],
  ['storage', 'storage     = writes/day × size × 365 × years × 3 replicas'],
  ['bw', 'egress      = read QPS × response size   (× 8 for bits)'],
  ['cache', 'cache       ≈ 0.2 × reads/day × response size   (80/20 rule)'],
  ['servers', 'servers     ≈ peak QPS / 2,000 per server × 1.5 headroom'],
];

const YEARS = 5, REPLICAS = 3, PEAK = 3, SERVER_QPS = 2000, HEADROOM = 1.5, DAY = 86400;

/** Every number in the chain, exact; the steps show both the exact and the rounded arithmetic. */
export function estimateNumbers({ dau, writes, reads, writeKB, readKB }) {
  const writesDay = dau * writes, readsDay = dau * reads;
  const wq = writesDay / DAY, rq = readsDay / DAY;
  const storeDay = writesDay * writeKB * 1e3;
  const storeTotal = storeDay * 365 * YEARS * REPLICAS;
  const egress = rq * readKB * 1e3;
  const cache = 0.2 * readsDay * readKB * 1e3;
  const servers = Math.ceil(((wq + rq) * PEAK / SERVER_QPS) * HEADROOM);
  return { writesDay, readsDay, wq, rq, storeDay, storeTotal, egress, cache, servers, ratio: rq / Math.max(wq, 1e-9) };
}

/** What the storage number means for the design: big blobs and small records go to different places. */
function storageAdvice(writeKB, total, long) {
  const blobs = writeKB >= 64;
  if (blobs && total > 1e14) return long ? 'That much media belongs in object storage (S3-like) with only the metadata in a database.' : 'large blobs → object storage + a metadata DB';
  if (total > 1e13) return long ? 'Far more than one machine holds, and these are small records: shard the database, or use a wide-column store such as Cassandra.' : 'lots of small records → shard (or a wide-column store)';
  return long ? 'Small enough for a single replicated database.' : 'one replicated database is enough';
}

export function estimate(input) {
  const x = estimateNumbers(input);
  const steps = [];
  const cards = {};
  const snap = (s) => steps.push({ cards: { ...cards }, ...s });
  const { dau, writes, reads, writeKB, readKB } = input;
  snap({
    kind: 'start', card: null, lines: [],
    title: `Estimate a ${input.name}: state the assumptions first`,
    text: `${count(dau)} daily active users; each does ${writes} write${writes === 1 ? '' : 's'} (${writeKB >= 1 ? bytes(writeKB * 1e3) : `${writeKB * 1000} B`} stored each) and ${reads} read${reads === 1 ? '' : 's'} (${readKB >= 1 ? bytes(readKB * 1e3) : `${readKB * 1000} B`} served each) a day. Say these out loud: the interviewer can correct one before you build on it. Then one chain, each number feeding the next.`,
    calc: [`DAU = ${count(dau)}`, `writes/user/day = ${writes}, reads/user/day = ${reads}`, `peak factor ${PEAK}×, ${REPLICAS} replicas, ${YEARS} years`],
  });
  cards.wq = x.wq;
  snap({
    kind: 'qps', card: 'wq', lines: ['qps'],
    title: `Writes: ${count(x.writesDay)}/day → ~${count(x.wq)}/s`,
    text: `${count(dau)} × ${writes} = ${count(x.writesDay)} writes a day. A day has 86,400 seconds; round it to 10⁵ and the division is easy in your head: ${count(x.writesDay)} ÷ 10⁵ ≈ ${count(x.writesDay / 1e5)}/s (exactly ${count(x.wq)}/s).`,
    calc: [`${count(dau)} × ${writes} = ${count(x.writesDay)}/day`, `÷ 86,400 = ${count(x.wq)}/s`, `≈ ÷ 10⁵ = ${count(x.writesDay / 1e5)}/s`],
    compare: `${(x.wq / SERVER_QPS).toFixed(x.wq < SERVER_QPS ? 2 : 0)} × one server at 2K/s`,
  });
  cards.rq = x.rq;
  const heavy = x.ratio >= 10;
  snap({
    kind: 'qps', card: 'rq', lines: ['qps'],
    title: `Reads: ${count(x.readsDay)}/day → ~${count(x.rq)}/s (${Math.round(x.ratio)}:1)`,
    text: `${count(dau)} × ${reads} = ${count(x.readsDay)} reads a day ≈ ${count(x.rq)}/s. Always split reads from writes: here reads outnumber writes ${Math.round(x.ratio)} to 1, ${heavy ? 'so the read path (caches, replicas, a CDN) is where the design effort goes.' : 'a fairly balanced load, so the write path matters as much as reads.'}`,
    calc: [`${count(dau)} × ${reads} = ${count(x.readsDay)}/day`, `÷ 86,400 = ${count(x.rq)}/s`, `reads : writes = ${Math.round(x.ratio)} : 1`],
    compare: `${Math.ceil(x.rq / SERVER_QPS)} servers' worth at 2K/s each`,
  });
  cards.peak = (x.wq + x.rq) * PEAK;
  snap({
    kind: 'peak', card: 'peak', lines: ['peak'],
    title: `Peak: ~${count((x.wq + x.rq) * PEAK)}/s`,
    text: `Traffic isn't flat: evenings and launches run at ${PEAK}× the average or more, and systems are sized for the peak, not the average. ${count(x.wq + x.rq)}/s × ${PEAK} ≈ ${count((x.wq + x.rq) * PEAK)}/s.`,
    calc: [`(${count(x.wq)} + ${count(x.rq)}) × ${PEAK} = ${count((x.wq + x.rq) * PEAK)}/s`],
  });
  cards.storage = x.storeTotal;
  const disks = x.storeTotal / 4e12;
  snap({
    kind: 'storage', card: 'storage', lines: ['storage'],
    title: `Storage: ${bytes(x.storeDay)}/day → ${bytes(x.storeTotal)} over ${YEARS} years`,
    text: `${count(x.writesDay)} writes × ${bytes(writeKB * 1e3)} = ${bytes(x.storeDay)} a day, × 365 × ${YEARS} years × ${REPLICAS} replicas = ${bytes(x.storeTotal)}. Forgetting replication is the classic slip: production data is stored three times. ${storageAdvice(writeKB, x.storeTotal, true)}`,
    calc: [`${count(x.writesDay)} × ${bytes(writeKB * 1e3)} = ${bytes(x.storeDay)}/day`, `× 365 × ${YEARS} × ${REPLICAS} = ${bytes(x.storeTotal)}`],
    compare: `≈ ${count(Math.ceil(disks))} disks of 4 TB`,
  });
  cards.bw = x.egress;
  const gbps = (x.egress * 8) / 1e9;
  snap({
    kind: 'bw', card: 'bw', lines: ['bw'],
    title: `Egress: ${bytes(x.egress)}/s = ${trim(gbps)} Gbps`,
    text: `${count(x.rq)} reads/s × ${bytes(readKB * 1e3)} = ${bytes(x.egress)}/s. Network links are rated in bits, so × 8 = ${trim(gbps)} Gbps. ${gbps > 40 ? 'That is far beyond what an origin fleet should serve: a CDN is mandatory, and the origin only handles cache misses.' : gbps > 1 ? 'Several 10 Gbps links: put a CDN or cache in front of the origin.' : 'Modest: a few servers can serve it directly.'}`,
    calc: [`${count(x.rq)}/s × ${bytes(readKB * 1e3)} = ${bytes(x.egress)}/s`, `× 8 = ${trim(gbps)} Gbps`],
    compare: `≈ ${count(Math.max(1, Math.ceil(gbps / 10)))} × 10 Gbps network cards`,
  });
  cards.cache = x.cache;
  snap({
    kind: 'cache', card: 'cache', lines: ['cache'],
    title: `Cache: ~${bytes(x.cache)} of memory`,
    text: `About 20% of a day's reads take 80% of the traffic, so caching that hot slice is a good first target: 0.2 × ${count(x.readsDay)} × ${bytes(readKB * 1e3)} ≈ ${bytes(x.cache)}. ${x.cache > 1e13 ? 'Too much for RAM: a CDN does this caching at the edge.' : x.cache > 1e11 ? 'A cluster of cache servers (each holds tens to hundreds of GB).' : 'A single cache server could hold it.'}`,
    calc: [`0.2 × ${count(x.readsDay)} × ${bytes(readKB * 1e3)} = ${bytes(x.cache)}`],
    compare: `≈ ${count(Math.max(1, Math.ceil(x.cache / 256e9)))} servers with 256 GB RAM`,
  });
  cards.servers = x.servers;
  snap({
    kind: 'servers', card: 'servers', lines: ['servers'],
    title: `App servers: ~${count(x.servers)}`,
    text: `${count((x.wq + x.rq) * PEAK)} peak requests/s ÷ ${count(SERVER_QPS)} per server × ${HEADROOM} headroom ≈ ${count(x.servers)} servers, then spread them across zones. ${x.servers > 1000 ? 'Most of that load should never reach app servers: caches and the CDN absorb it.' : ''}`.trim(),
    calc: [`${count((x.wq + x.rq) * PEAK)} ÷ ${count(SERVER_QPS)} × ${HEADROOM} = ${count(x.servers)}`],
  });
  const so = [
    heavy ? 'read-heavy → caches, read replicas, CDN' : 'balanced reads and writes → scale the write path too',
    storageAdvice(writeKB, x.storeTotal, false),
    gbps > 40 ? 'hundreds of Gbps → CDN mandatory' : 'egress manageable at the origin',
  ];
  snap({
    kind: 'done', card: null, lines: estimateCode.map(([k]) => k), answer: `${count(x.wq)} w/s · ${count(x.rq)} r/s · ${bytes(x.storeTotal)} · ${trim(gbps)} Gbps`,
    title: 'The numbers now point at the design',
    text: `Each estimate only matters for the decision it drives: ${so.join('; ')}. Rounded numbers are fine; being within 2–3× and saying "so…" after each one is what interviewers want.`,
    calc: so,
  });
  return steps;
}

export function parseEstimate(values, input) {
  const num = (t, name, min, max) => {
    const v = Number(String(t ?? '').replace(/[,_\s]/g, '').replace(/k$/i, 'e3').replace(/m$/i, 'e6').replace(/b$/i, 'e9'));
    if (!Number.isFinite(v) || v < min || v > max) return { error: `${name} must be between ${count(min)} and ${count(max)}.` };
    return { v };
  };
  const d = num(values.dau, 'DAU', 1e3, 5e9); if (d.error) return d;
  const w = num(values.writes, 'writes per user', 0.001, 1000); if (w.error) return w;
  const r = num(values.reads, 'reads per user', 0.001, 10000); if (r.error) return r;
  const wk = num(values.writeKB, 'write size (KB)', 0.01, 5e6); if (wk.error) return wk;
  const rk = num(values.readKB, 'read size (KB)', 0.01, 5e6); if (rk.error) return rk;
  return { input: { name: 'your service', dau: d.v, writes: w.v, reads: r.v, writeKB: wk.v, readKB: rk.v } };
}

// ---------------------------------------------------------------- what happens when you type a URL

export const JOURNEY = {
  cold: { label: 'First visit, TLS 1.2', input: { rtt: 200, mode: 'cold' } },
  tls13: { label: 'TLS 1.3', input: { rtt: 200, mode: 'tls13' } },
  warm: { label: 'Reused connection', input: { rtt: 200, mode: 'warm' } },
  h3: { label: 'HTTP/3 (QUIC)', input: { rtt: 200, mode: 'h3' } },
  cdn: { label: 'Nearby CDN edge', input: { rtt: 200, mode: 'cdn' } },
};

export const journeyCode = [
  ['dns', 'DNS lookup         name → IP address'],
  ['tcp', 'TCP handshake      SYN, SYN-ACK, ACK         1 RTT'],
  ['tls', 'TLS handshake      1.2: 2 RTT · 1.3: 1 RTT'],
  ['quic', 'QUIC handshake     transport + TLS together   1 RTT'],
  ['http', 'HTTP request       GET → response            1 RTT + server time'],
];

const DNS_RTT = 20;          // the resolver is close by
const RECURSE = 60;          // the resolver walks root → TLD → authoritative on a cache miss
const SERVER_MS = 20;
const EDGE_RTT = 20;

/** Messages with their send time; one-way time is half the RTT. */
export function journey({ rtt, mode }) {
  const steps = [];
  const rows = [];
  let t = 0;
  const parts = {};
  const edge = mode === 'cdn';
  const R = edge ? EDGE_RTT : rtt;
  const server = edge ? 'edge' : 'server';
  const send = (from, to, label, tone, dur, part, sub) => {
    rows.push({ from, to, label, tone, at: `${Math.round(t)} ms`, sub });
    t += dur;
    parts[part] = (parts[part] ?? 0) + dur;
  };
  const note = (lane, label, tone, dur, part) => {
    rows.push({ from: lane, label, tone, note: true, at: `${Math.round(t)} ms` });
    t += dur;
    if (part) parts[part] = (parts[part] ?? 0) + dur;
  };
  const snap = (s) => steps.push({ rows: rows.map((r) => ({ ...r })), live: rows.length - 1, clock: Math.round(t), parts: { ...parts }, server, ...s });
  const intro = {
    cold: `A first visit to an HTTPS site ${rtt} ms away (one round trip, RTT, is ${rtt} ms: roughly Sydney ↔ Virginia). Every handshake costs round trips, and round trips, not bandwidth, dominate how slow the first byte feels.`,
    tls13: 'The same first visit, but with TLS 1.3, which needs one round trip for its handshake instead of two.',
    warm: 'A second request on a connection that is already open (HTTP keep-alive) and a DNS answer that is already cached: no handshakes at all.',
    h3: 'HTTP/3 runs over QUIC on UDP, which does the transport and TLS 1.3 handshakes in a single round trip.',
    cdn: `The same first visit, but a CDN edge server ${EDGE_RTT} ms away answers (the content is cached there). Same handshakes, much shorter round trips.`,
  }[mode];
  steps.push({ rows: [], live: null, clock: 0, parts: {}, server, kind: 'start', lines: [], title: 'Type a URL, press Enter: the stopwatch starts', text: intro, calc: [`RTT to ${edge ? 'the edge' : 'the server'} = ${R} ms`, `one way = ${R / 2} ms`] });

  if (mode !== 'warm') {
    send('browser', 'dns', 'DNS: IP of example.com?', 'interview', DNS_RTT / 2, 'dns');
    snap({ kind: 'dns', lines: ['dns'], title: 'Ask the DNS resolver for the IP address', text: 'The browser (via the OS) asks a nearby recursive resolver, usually your ISP or a public one like 1.1.1.1, which name the browser must connect to. Browsers and operating systems cache answers, so repeat visits skip this.', calc: [`→ resolver, ${DNS_RTT / 2} ms one way`] });
    note('dns', 'root → .com → authoritative', 'muted', RECURSE, 'dns');
    snap({ kind: 'dns', lines: ['dns'], title: 'Cache miss: the resolver walks the hierarchy', text: `The resolver doesn't know the answer, so it asks a root server where .com lives, a .com server where example.com's name servers are, and the authoritative server for the address. About ${RECURSE} ms here; the answer is then cached for its TTL.`, calc: [`recursive lookup ≈ ${RECURSE} ms`] });
    send('dns', 'browser', `IP ${edge ? '(nearest edge)' : '93.184.x.x'}`, 'interview', DNS_RTT / 2, 'dns');
    snap({ kind: 'dns', lines: ['dns'], title: `Got the IP after ${Math.round(t)} ms`, text: edge ? 'With a CDN, DNS returns the address of an edge server near the user (GeoDNS or anycast). That one answer is what puts the server 20 ms away instead of 200.' : 'Now the browser knows where to connect.', calc: [`DNS total = ${Math.round(parts.dns)} ms`] });
  }

  if (mode === 'h3') {
    send('browser', server, 'QUIC Initial + TLS ClientHello', 'accent', R / 2, 'handshake', '1 RTT');
    snap({ kind: 'quic', lines: ['quic'], title: 'One packet opens the connection and starts TLS', text: 'QUIC merges what TCP and TLS do separately: the first packet carries the TLS 1.3 ClientHello with the client\'s key share.', calc: [`+${R / 2} ms`] });
    send(server, 'browser', 'Handshake + TLS Finished', 'accent', R / 2, 'handshake');
    snap({ kind: 'quic', lines: ['quic'], title: `Secure connection ready after one round trip (${Math.round(t)} ms)`, text: 'One round trip instead of two (TCP + TLS 1.3) or three (TCP + TLS 1.2). On a later visit, 0-RTT resumption can even send the request in the very first packet.', calc: [`handshake = ${R} ms (1 RTT)`] });
  } else if (mode !== 'warm') {
    send('browser', server, 'TCP SYN', 'warn', R / 2, 'tcp', '1 RTT');
    snap({ kind: 'tcp', lines: ['tcp'], title: 'TCP handshake: SYN', text: 'TCP opens a connection with a three-way handshake so both sides agree on sequence numbers (which is how lost packets get detected and resent).', calc: [`+${R / 2} ms`] });
    send(server, 'browser', 'TCP SYN-ACK', 'warn', R / 2, 'tcp');
    snap({ kind: 'tcp', lines: ['tcp'], title: 'SYN-ACK comes back', text: `One full round trip (${R} ms) has passed. The client's final ACK travels together with the first TLS message, so it costs no extra time.`, calc: [`TCP = ${R} ms (1 RTT)`] });
    send('browser', server, 'ACK + TLS ClientHello', 'note', R / 2, 'tls', mode === 'tls13' || edge ? '1 RTT' : '2 RTT');
    snap({ kind: 'tls', lines: ['tls'], title: 'TLS starts: ClientHello', text: mode === 'tls13' || edge ? 'TLS 1.3: the ClientHello already carries the client\'s key share, so the server can finish its side in its reply.' : 'TLS 1.2: the ClientHello lists cipher suites; keys are agreed over the next messages.', calc: [`+${R / 2} ms`] });
    send(server, 'browser', mode === 'tls13' || edge ? 'ServerHello, cert, Finished' : 'ServerHello, certificate', 'note', R / 2, 'tls');
    snap({ kind: 'tls', lines: ['tls'], title: mode === 'tls13' || edge ? 'TLS 1.3 done in one round trip' : 'Server proves who it is', text: mode === 'tls13' || edge ? 'The server sends its certificate and Finished in one flight. The client\'s Finished goes out with the HTTP request.' : 'The certificate proves the server owns the name. TLS 1.2 still needs another round trip to agree on keys.', calc: [`+${R / 2} ms`] });
    if (!(mode === 'tls13' || edge)) {
      send('browser', server, 'key exchange, Finished', 'note', R / 2, 'tls');
      snap({ kind: 'tls', lines: ['tls'], title: 'TLS 1.2: a second round trip for the keys', text: 'The client sends its key exchange and Finished message; from these both sides derive the same session keys.', calc: [`+${R / 2} ms`] });
      send(server, 'browser', 'Finished', 'note', R / 2, 'tls');
      snap({ kind: 'tls', lines: ['tls'], title: `Secure after ${Math.round(t)} ms, and not one byte of the page yet`, text: `TLS 1.2 cost two round trips (${2 * R} ms). This is why TLS 1.3 (1 RTT) and connection reuse matter so much on long distances.`, calc: [`TLS = ${2 * R} ms (2 RTT)`] });
    }
  }

  send('browser', server, 'GET /', 'success', R / 2, 'request', '1 RTT');
  snap({ kind: 'http', lines: ['http'], title: mode === 'warm' ? 'The connection is already open: send GET straight away' : 'Finally, the HTTP request', text: mode === 'warm' ? 'Keep-alive keeps the TCP and TLS connection open between requests (and HTTP/2 multiplexes many requests over it), so later requests skip every handshake.' : 'The request travels to the server…', calc: [`+${R / 2} ms`] });
  note(server, `server works ${SERVER_MS} ms`, 'muted', SERVER_MS, 'server');
  snap({ kind: 'http', lines: ['http'], title: `The server builds the response (${SERVER_MS} ms)`, text: `Application time, here ${SERVER_MS} ms: often small next to the network time spent getting here.`, calc: [`server time = ${SERVER_MS} ms`] });
  send(server, 'browser', '200 OK + HTML', 'success', R / 2, 'request');
  const total = Math.round(t);
  const net = total - SERVER_MS;
  const breakdown = Object.entries(parts).map(([k, v]) => `${k} ${Math.round(v)} ms`);
  steps.push({
    rows: rows.map((r) => ({ ...r })), live: rows.length - 1, clock: total, parts: { ...parts }, server,
    kind: 'done', lines: ['http'], answer: `first byte at ${total} ms`,
    title: `First byte after ${total} ms`,
    text: `${breakdown.join(', ')}. ${Math.round((net / total) * 100)}% of the wait is network round trips, not the server. ${mode === 'cold' ? 'Fixes, biggest first: reuse connections, TLS 1.3, HTTP/3, and a CDN edge near the user.' : mode === 'warm' ? 'This is why connection pooling between services is standard practice.' : 'Compare it with the other examples.'}`,
    calc: [...breakdown, `total = ${total} ms`],
  });
  return steps;
}

export function parseJourney(values, input) {
  const r = parseInt1(values.rtt, { min: 1, max: 400, name: 'RTT (ms)' });
  return r.error ? r : { input: { rtt: r.v, mode: input.mode } };
}

