/**
 * HLD Data Storage step-throughs, part 2 (models for <IsolationViz>, <ReplicationViz>, <ShardingViz>
 * and <RingViz>). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, plural } from './util.js';

// ---------------------------------------------------------------- transactions and isolation

export const ISOLATION = {
  readskew: { label: 'Read skew', input: { ex: 'readskew' } },
  snapshot: { label: 'Snapshot isolation fixes it', input: { ex: 'snapshot' } },
  lost: { label: 'Lost update', input: { ex: 'lost' } },
  atomic: { label: 'Atomic UPDATE fixes it', input: { ex: 'atomic' } },
  writeskew: { label: 'Write skew', input: { ex: 'writeskew' } },
  serializable: { label: 'Serializable fixes it', input: { ex: 'serializable' } },
};

const LEVEL_NAME = { rc: 'Read Committed', si: 'Snapshot Isolation (Repeatable Read)', ssi: 'Serializable (SSI)' };
const fmtVal = (v) => (v === true ? 'on' : v === false ? 'off' : String(v));

/**
 * Each example: isolation level, starting rows, a script of operations, and the invariant to check.
 * Ops: begin | read key | count keys | write key (value or fn of what the tx read) | incr key | commit | resume.
 */
const SCRIPTS = {
  readskew: {
    level: 'rc', rows: { A: 500, B: 500 },
    code: [['level', 'SET TRANSACTION ISOLATION LEVEL READ COMMITTED   -- a fresh snapshot per statement'], ['t1', 'T1 (a report):   SELECT balance … A;   SELECT balance … B'], ['t2', 'T2 (a transfer): UPDATE … A − 100;   UPDATE … B + 100;   COMMIT']],
    ops: [['T1', 'begin'], ['T1', 'read', 'A'], ['T2', 'begin'], ['T2', 'write', 'A', 400], ['T2', 'write', 'B', 600], ['T2', 'commit'], ['T1', 'read', 'B'], ['T1', 'commit']],
    check: (s) => { const sum = s.seen.T1.A + s.seen.T1.B; return { ok: sum === 1000, text: `T1 saw A + B = ${sum}${sum === 1000 ? '' : ' (should be 1,000)'}` }; },
  },
  snapshot: {
    level: 'si', rows: { A: 500, B: 500 },
    code: [['level', 'SET TRANSACTION ISOLATION LEVEL REPEATABLE READ   -- one snapshot for the whole transaction'], ['t1', 'T1 (a report):   SELECT balance … A;   SELECT balance … B'], ['t2', 'T2 (a transfer): UPDATE … A − 100;   UPDATE … B + 100;   COMMIT']],
    ops: [['T1', 'begin'], ['T1', 'read', 'A'], ['T2', 'begin'], ['T2', 'write', 'A', 400], ['T2', 'write', 'B', 600], ['T2', 'commit'], ['T1', 'read', 'B'], ['T1', 'commit']],
    check: (s) => { const sum = s.seen.T1.A + s.seen.T1.B; return { ok: sum === 1000, text: `T1 saw A + B = ${sum}${sum === 1000 ? '' : ' (should be 1,000)'}` }; },
  },
  lost: {
    level: 'rc', rows: { counter: 10 },
    code: [['level', 'READ COMMITTED'], ['t1', 'T1: v = SELECT counter;   UPDATE … SET counter = v + 1   -- v + 1 computed in the app'], ['t2', 'T2: v = SELECT counter;   UPDATE … SET counter = v + 1']],
    ops: [['T1', 'begin'], ['T2', 'begin'], ['T1', 'read', 'counter'], ['T2', 'read', 'counter'], ['T1', 'write', 'counter', (seen) => seen.counter + 1], ['T2', 'write', 'counter', (seen) => seen.counter + 1], ['T1', 'commit'], ['T2', 'resume'], ['T2', 'commit']],
    check: (s) => ({ ok: s.final.counter === 12, text: `counter = ${s.final.counter} after two increments${s.final.counter === 12 ? '' : ' (should be 12)'}` }),
  },
  atomic: {
    level: 'rc', rows: { counter: 10 },
    code: [['level', 'READ COMMITTED'], ['t1', 'T1: UPDATE … SET counter = counter + 1   -- read and write in one statement'], ['t2', 'T2: UPDATE … SET counter = counter + 1']],
    ops: [['T1', 'begin'], ['T2', 'begin'], ['T1', 'incr', 'counter'], ['T2', 'incr', 'counter'], ['T1', 'commit'], ['T2', 'resume'], ['T2', 'commit']],
    check: (s) => ({ ok: s.final.counter === 12, text: `counter = ${s.final.counter} after two increments${s.final.counter === 12 ? '' : ' (should be 12)'}` }),
  },
  writeskew: {
    level: 'si', rows: { alice: true, bob: true },
    code: [['level', 'REPEATABLE READ   -- snapshot isolation'], ['t1', 'T1 (Alice): n = SELECT count(*) WHERE on_call;   if n ≥ 2: UPDATE alice SET on_call = off'], ['t2', 'T2 (Bob):   n = SELECT count(*) WHERE on_call;   if n ≥ 2: UPDATE bob SET on_call = off']],
    ops: [['T1', 'begin'], ['T2', 'begin'], ['T1', 'count'], ['T2', 'count'], ['T1', 'write', 'alice', false], ['T2', 'write', 'bob', false], ['T1', 'commit'], ['T2', 'commit']],
    check: (s) => { const n = ['alice', 'bob'].filter((k) => s.final[k]).length; return { ok: n >= 1, text: `doctors on call: ${n}${n ? '' : ' (the rule says at least 1)'}` }; },
  },
  serializable: {
    level: 'ssi', rows: { alice: true, bob: true },
    code: [['level', 'SERIALIZABLE   -- PostgreSQL: serializable snapshot isolation'], ['t1', 'T1 (Alice): n = SELECT count(*) WHERE on_call;   if n ≥ 2: UPDATE alice SET on_call = off'], ['t2', 'T2 (Bob):   n = SELECT count(*) WHERE on_call;   if n ≥ 2: UPDATE bob SET on_call = off'], ['retry', 'on serialization failure: run the whole transaction again']],
    ops: [['T1', 'begin'], ['T2', 'begin'], ['T1', 'count'], ['T2', 'count'], ['T1', 'write', 'alice', false], ['T2', 'write', 'bob', false], ['T1', 'commit'], ['T2', 'commit'], ['T2', 'begin', 'retry'], ['T2', 'count'], ['T2', 'commit']],
    check: (s) => { const n = ['alice', 'bob'].filter((k) => s.final[k]).length; return { ok: n >= 1, text: `doctors on call: ${n}${n ? '' : ' (the rule says at least 1)'}` }; },
  },
};

export const isolationCode = (ex) => SCRIPTS[ex].code;

export function isolation({ ex }) {
  const S = SCRIPTS[ex];
  const level = S.level;
  let ts = 0;
  const rows = Object.fromEntries(Object.entries(S.rows).map(([k, v]) => [k, [{ value: v, by: 'T0', at: 0 }]]));
  const txs = {};
  const locks = {};
  const lanes = [];               // statements so far: { tx, text, tone }
  const steps = [];
  const latest = (key) => rows[key].filter((v) => v.at !== null && !v.aborted).at(-1);
  /** The version a transaction sees: its own write, else the newest committed one inside its snapshot. */
  const visible = (tx, key) => {
    const own = rows[key].filter((v) => v.by === tx.id && v.at === null && !v.aborted).at(-1);
    if (own) return own;
    const snap = level === 'rc' ? ts : tx.start;
    return rows[key].filter((v) => v.at !== null && v.at <= snap && !v.aborted).at(-1);
  };
  const sees = () => Object.fromEntries(Object.values(txs).filter((t) => t.status === 'active' || t.status === 'blocked').map((t) => [t.id, Object.fromEntries(Object.keys(rows).map((k) => [k, rows[k].indexOf(visible(t, k))]))]));
  const seen = { T1: {}, T2: {} };
  const snap = (s) => steps.push({
    rows: Object.fromEntries(Object.entries(rows).map(([k, vs]) => [k, vs.map((v) => ({ ...v }))])),
    lanes: lanes.map((l) => ({ ...l })), locks: { ...locks }, sees: sees(),
    status: Object.fromEntries(Object.values(txs).map((t) => [t.id, t.status])), ...s,
  });
  const lineOf = (tx) => (tx === 'T1' ? 't1' : 't2');
  const say = (tx, text, tone = 'muted') => lanes.push({ tx, text, tone });

  snap({
    kind: 'start', lines: ['level'], live: null,
    title: {
      readskew: 'A report reads two balances while a transfer runs',
      snapshot: 'The same report, under snapshot isolation',
      lost: 'Two transactions each add 1 to a counter',
      atomic: 'The same two increments, as atomic UPDATEs',
      writeskew: 'Two doctors, one rule: someone must stay on call',
      serializable: 'The same two doctors, under SERIALIZABLE',
    }[ex],
    text: {
      readskew: 'Accounts A and B hold 500 each, 1,000 in total. T1 is a report that reads both balances; T2 moves 100 from A to B. Under Read Committed, each statement sees the latest committed data.',
      snapshot: 'Same transfer, same report, but each transaction reads from one snapshot taken when it started. The database keeps old versions of rows around (MVCC) to make that possible.',
      lost: 'The counter is 10. Each transaction reads it, adds 1 in application code and writes the result back: the classic read-modify-write.',
      atomic: 'Same counter, but the increment happens inside the database in one statement: UPDATE … SET counter = counter + 1.',
      writeskew: 'Alice and Bob are both on call. Each wants to go home, and each checks "is someone else still on call?" before leaving. They do it at the same moment.',
      serializable: 'Same rule, same timing, but at the Serializable level. PostgreSQL implements it with SSI: transactions run on snapshots without blocking, and the database aborts one if the outcome could not have happened serially.',
    }[ex],
    calc: [`level: ${LEVEL_NAME[level]}`, `rows: ${Object.entries(S.rows).map(([k, v]) => `${k} = ${fmtVal(v)}`).join(', ')}`],
  });

  for (const [id, op, key, arg] of S.ops) {
    const tx = txs[id] ?? (txs[id] = { id, status: 'idle' });
    const lines = [lineOf(id)];
    if (op === 'begin') {
      Object.assign(tx, { status: 'active', start: ts, writes: {}, reads: new Set(), pending: null });
      seen[id] = {};
      const retry = key === 'retry';
      say(id, retry ? 'BEGIN (retry)' : 'BEGIN', retry ? 'warn' : 'muted');
      snap({
        kind: 'begin', live: lanes.length - 1, lines: retry ? ['retry'] : ['level'],
        title: retry ? `${id} retries from the start` : `${id} begins`,
        text: retry
          ? `The application catches the serialization error and runs ${id} again. The new attempt gets a fresh snapshot, which now includes T1's committed change.`
          : level === 'rc' ? `${id} starts. Under Read Committed it has no fixed snapshot: every statement will see whatever is committed at that moment.` : `${id} starts and its snapshot is fixed now: it will see the data as committed at this instant (version time ${ts}), no matter what commits later.`,
        calc: [`${id}: ${level === 'rc' ? 'snapshot per statement' : `snapshot at t${ts}`}`],
      });
      continue;
    }
    if (op === 'read') {
      const v = visible(tx, key);
      tx.reads.add(key);
      seen[id][key] = v.value;
      const newer = latest(key) !== v || rows[key].some((x) => x.at === null && !x.aborted && x.by !== id);
      say(id, `read ${key} → ${fmtVal(v.value)}`, 'accent');
      snap({
        kind: 'read', live: lanes.length - 1, lines, focus: { key, tx: id },
        title: `${id} reads ${key} = ${fmtVal(v.value)}`,
        text: level !== 'rc' && latest(key) !== v
          ? `${key} has a newer committed version (${fmtVal(latest(key).value)}, by ${latest(key).by}), but it was committed after ${id}'s snapshot, so ${id} still sees ${fmtVal(v.value)}. Its two reads stay consistent with each other.`
          : rows[key].some((x) => x.at === null && !x.aborted && x.by !== id)
            ? `${rows[key].find((x) => x.at === null && !x.aborted && x.by !== id).by} has written ${key} but not committed, so ${id} sees the last committed value, ${fmtVal(v.value)}. No dirty reads.`
            : `${id} sees the latest committed version of ${key}${v.by !== 'T0' ? `, written by ${v.by}` : ''}.${newer ? '' : ''}`,
        calc: [`${id} sees ${key} = ${fmtVal(v.value)} (by ${v.by})`],
      });
      continue;
    }
    if (op === 'count') {
      const keys = Object.keys(rows);
      const n = keys.filter((k) => visible(tx, k).value === true).length;
      keys.forEach((k) => { tx.reads.add(k); seen[id][k] = visible(tx, k).value; });
      seen[id].count = n;
      say(id, `count on call → ${n}`, 'accent');
      snap({
        kind: 'read', live: lanes.length - 1, lines, focus: { key: keys, tx: id },
        title: `${id} counts doctors on call: ${n}`,
        text: n >= 2
          ? `${id} sees ${n} doctors on call, so going home looks safe: someone else will still be there.`
          : `${id} sees only ${n} doctor on call, so ${id === 'T1' ? 'Alice' : 'Bob'} must stay. Nothing to write.`,
        calc: [`count(on_call) in ${id}'s snapshot = ${n}`, n >= 2 ? 'n ≥ 2 → OK to leave' : 'n < 2 → stay'],
      });
      continue;
    }
    if (op === 'write' || op === 'incr' || op === 'resume') {
      const act = op === 'resume' ? tx.pending : { op, key, arg };
      const k = act.key;
      if (locks[k] && locks[k] !== id) {
        tx.status = 'blocked';
        tx.pending = act;
        say(id, `${act.op === 'incr' ? `UPDATE ${k} + 1` : `write ${k}`} ⏳ waits`, 'warn');
        snap({
          kind: 'block', live: lanes.length - 1, lines, focus: { key: k, tx: id },
          title: `${id} must wait: ${locks[k]} holds the lock on ${k}`,
          text: `${locks[k]} has written ${k} and not committed. Databases never let two transactions overwrite each other's uncommitted data (that would be a dirty write), so ${id} blocks until ${locks[k]} commits or aborts.`,
          calc: [`lock(${k}) held by ${locks[k]}`, `${id}: waiting`],
        });
        continue;
      }
      let value;
      let why;
      if (act.op === 'incr') {
        const base = latest(k).value;
        value = base + 1;
        why = op === 'resume'
          ? `T1 committed, so ${id} gets the lock. An UPDATE re-reads the row after taking the lock: it sees ${base}, the value T1 just committed, and writes ${value}.`
          : `The database takes ${k}'s row lock, reads the current value (${base}) and writes ${value}, all inside one statement. Nobody can change ${k} in between.`;
      } else {
        value = typeof act.arg === 'function' ? act.arg(seen[id]) : act.arg;
        why = typeof act.arg === 'function'
          ? op === 'resume'
            ? `T1 committed and released the lock, so ${id}'s write goes ahead. But ${id} computed ${value} from the ${seen[id][k]} it read earlier: the lock stopped a dirty write, not a stale read.`
            : `${id} writes the value it computed in the application: ${seen[id][k]} + 1 = ${value}. It now holds ${k}'s row lock until it commits.`
          : ex === 'writeskew' || ex === 'serializable'
            ? `${id} updates its own row only. ${id === 'T2' ? 'T1 locked a different row (alice), so there is no lock conflict at all.' : 'Other transactions still see the old value until T1 commits.'}`
            : `${id} writes a new version of ${k}. Until ${id} commits, other transactions keep seeing the old committed one.`;
      }
      rows[k].push({ value, by: id, at: null });
      tx.writes[k] = value;
      locks[k] = id;
      tx.status = 'active';
      tx.pending = null;
      say(id, `${act.op === 'incr' ? `UPDATE ${k} + 1 → ${fmtVal(value)}` : `write ${k} = ${fmtVal(value)}`}`, 'note');
      snap({
        kind: op === 'resume' ? 'resume' : 'write', live: lanes.length - 1, lines, focus: { key: k, tx: id },
        title: act.op === 'incr' ? `${id}${op === 'resume' ? ' resumes:' : ':'} UPDATE ${k} = ${k} + 1 → ${fmtVal(value)}` : `${id} ${op === 'resume' ? 'resumes and ' : ''}writes ${k} = ${fmtVal(value)}`,
        text: why,
        calc: [`new version ${k} = ${fmtVal(value)} (by ${id}, uncommitted)`, `lock(${k}) → ${id}`],
      });
      continue;
    }
    // commit
    let conflict = null;
    if (level !== 'rc') {
      const ww = Object.keys(tx.writes).find((k) => rows[k].some((v) => v.at !== null && v.at > tx.start && v.by !== id));
      if (ww) conflict = { key: ww, kind: 'write' };
      if (!conflict && level === 'ssi') {
        const rw = [...tx.reads].find((k) => rows[k].some((v) => v.at !== null && v.at > tx.start && v.by !== id));
        if (rw) conflict = { key: rw, kind: 'read', by: rows[rw].find((v) => v.at !== null && v.at > tx.start && v.by !== id).by };
      }
    }
    if (conflict) {
      for (const k of Object.keys(rows)) for (const v of rows[k]) if (v.by === id && v.at === null) v.aborted = true;
      for (const k of Object.keys(locks)) if (locks[k] === id) delete locks[k];
      tx.status = 'aborted';
      say(id, 'COMMIT ✗ aborted', 'danger');
      snap({
        kind: 'abort', live: lanes.length - 1, lines: level === 'ssi' ? [lineOf(id), 'retry'] : lines, focus: { key: conflict.key, tx: id },
        title: `${id} can't commit: serialization failure`,
        text: `${id} decided based on ${conflict.key} as it was in its snapshot, but ${conflict.by} has since committed a change to ${conflict.key}. If both commits stood, no serial order of T1 and T2 could produce this result, so the database aborts ${id} and rolls back its write.`,
        calc: [`${id} read ${conflict.key}; ${conflict.by} changed it after ${id}'s snapshot`, `${id}: aborted, write discarded`],
      });
      continue;
    }
    ts++;
    for (const k of Object.keys(rows)) for (const v of rows[k]) if (v.by === id && v.at === null && !v.aborted) v.at = ts;
    for (const k of Object.keys(locks)) if (locks[k] === id) delete locks[k];
    tx.status = 'committed';
    const wrote = Object.keys(tx.writes);
    const waiting = Object.values(txs).find((t) => t.status === 'blocked');
    say(id, 'COMMIT ✓', 'success');
    snap({
      kind: 'commit', live: lanes.length - 1, lines, focus: { key: wrote, tx: id },
      title: `${id} commits${wrote.length ? `: ${wrote.map((k) => `${k} = ${fmtVal(tx.writes[k])}`).join(', ')} ${wrote.length > 1 ? 'become' : 'becomes'} visible` : ''}`,
      text: wrote.length
        ? `${id}'s new versions are now committed (version time ${ts}).${waiting ? ` Its locks are released, so ${waiting.id} can stop waiting.` : ''}${level === 'si' && (ex === 'writeskew') && id === 'T2' ? ' Snapshot isolation only checks whether two transactions wrote the same row. T1 wrote alice, T2 wrote bob: no conflict, so both commits succeed.' : ''}`
        : `${id} wrote nothing, so there is nothing to check: it commits.`,
      calc: [`commit at t${ts}`, ...wrote.map((k) => `${k} = ${fmtVal(tx.writes[k])} (committed)`)],
    });
  }
  const final = Object.fromEntries(Object.keys(rows).map((k) => [k, latest(k).value]));
  const verdict = S.check({ seen, final });
  snap({
    kind: verdict.ok ? 'ok' : 'anomaly', live: null, lines: [], answer: verdict.text, ok: verdict.ok,
    title: {
      readskew: 'Read skew: T1 counted the 100 twice',
      snapshot: 'One consistent snapshot: 1,000',
      lost: 'Lost update: one increment vanished',
      atomic: 'Both increments counted: 12',
      writeskew: 'Write skew: nobody is on call',
      serializable: 'The rule holds: Bob stays on call',
    }[ex],
    text: {
      readskew: 'T1 read A before the transfer and B after it, so it saw the 100 in both accounts. A backup or report run this way is quietly wrong. Snapshot isolation (the next example) gives each transaction one consistent view.',
      snapshot: 'Both reads came from the same snapshot, so T1 saw a consistent 1,000 even though T2 committed in between. Readers never blocked T2 and T2 never blocked them: that is MVCC\'s big win.',
      lost: 'Both transactions read 10 and both wrote 11. The row lock only made T2 wait; it didn\'t make T2 re-read. Fixes: an atomic UPDATE (next example), SELECT … FOR UPDATE, or a version column checked on write.',
      atomic: 'The read and the write happened in one statement under the row lock, so T2 saw T1\'s result and the counter reached 12. Prefer atomic operations whenever the database can do the arithmetic.',
      writeskew: 'Each transaction made a sensible decision from its own snapshot and wrote a different row, so no lock or snapshot check caught it. Fixes: SERIALIZABLE (next example), or SELECT … FOR UPDATE on the rows the decision depends on.',
      serializable: 'SSI noticed that T2\'s decision was based on data T1 had since changed, and aborted it. The retry saw only one doctor on call, so Bob stayed. The price: transactions must be written to be retried.',
    }[ex],
    calc: [verdict.text, `level: ${LEVEL_NAME[level]}`],
  });
  return steps;
}

// ---------------------------------------------------------------- replication

export const REPLICATION = {
  semisync: { label: 'Semi-synchronous write', input: { ex: 'semisync' } },
  lag: { label: 'Replication lag', input: { ex: 'lag' } },
  failover: { label: 'Failover loses writes', input: { ex: 'failover' } },
  quorum: { label: 'Leaderless quorum', input: { ex: 'quorum' } },
};

export const replicationCode = {
  semisync: [['write', 'leader: append to log;  send to followers'], ['sync', 'wait for the sync follower\'s ack, then reply OK'], ['async', 'async followers apply whenever the log reaches them']],
  lag: [['write', 'leader: append, reply OK at once   // asynchronous'], ['read', 'reads: any follower   // may be behind'], ['fix', 'read-your-writes: read own data from the leader for 1 min after a write']],
  failover: [['write', 'leader: append, reply OK   // async: followers may be behind'], ['detect', 'no heartbeat for 10 s → leader presumed dead'], ['elect', 'promote the most up-to-date follower;  epoch += 1'], ['fence', 'reject writes that carry an old epoch']],
  quorum: [['write', 'write to all N = 3;  success after W = 2 acks'], ['read', 'read from R = 2;  W + R > N, so at least one has the latest'], ['repair', 'newest version wins;  write it back to stale replicas (read repair)']],
};

const short = (log, keep = 3) => {
  const n = log.length;
  const chips = log.slice(Math.max(0, n - keep)).map((e) => ({ ...e }));
  return n > keep ? [{ text: n - keep === 1 ? '#1 ✓' : `#1–${n - keep} ✓`, tone: 'muted' }, ...chips] : chips;
};

export function replication({ ex }) {
  const steps = [];
  if (ex === 'quorum') {
    const nodes = { N1: { val: 'v1', t: 1, up: true }, N2: { val: 'v1', t: 1, up: true }, N3: { val: 'v1', t: 1, up: true } };
    const snap = (s) => steps.push({ ex, nodes: JSON.parse(JSON.stringify(nodes)), ...s });
    snap({ kind: 'start', packets: [], lines: [], title: 'Three replicas, no leader: N = 3, W = 2, R = 2', text: 'Every replica accepts reads and writes. A write counts as done when W of the N replicas confirm it; a read asks R replicas and takes the newest version it sees. Each value carries a version (here a timestamp).', calc: ['N = 3, W = 2, R = 2', 'W + R = 4 > N = 3'] });
    nodes.N3.up = false;
    nodes.N1.val = 'v2'; nodes.N1.t = 2;
    nodes.N2.val = 'v2'; nodes.N2.t = 2;
    snap({ kind: 'write', packets: [{ from: 'writer', to: 'N1', label: 'x = v2', tone: 'accent', at: 0 }, { from: 'writer', to: 'N2', label: 'x = v2', tone: 'accent', at: 0 }, { from: 'writer', to: 'N3', label: 'x = v2 ✗', tone: 'danger', at: 0 }, { from: 'N1', to: 'writer', label: 'ack', tone: 'success', at: 0.9 }, { from: 'N2', to: 'writer', label: 'ack', tone: 'success', at: 0.9 }], lines: ['write'], focus: ['N1', 'N2'], title: 'Write x = v2: two acks, so it succeeds', text: 'The writer sends to all three. N3 is unreachable (a network blip), but N1 and N2 confirm: 2 acks = W, so the write succeeds. N3 still holds the old v1.', calc: ['acks: N1, N2 = 2 ≥ W', 'N3: missed the write'] });
    nodes.N3.up = true;
    snap({ kind: 'read', packets: [{ from: 'reader', to: 'N2', label: 'get x', tone: 'note', at: 0 }, { from: 'reader', to: 'N3', label: 'get x', tone: 'note', at: 0 }, { from: 'N2', to: 'reader', label: 'v2 · t2', tone: 'success', at: 0.9 }, { from: 'N3', to: 'reader', label: 'v1 · t1', tone: 'warn', at: 0.9 }], lines: ['read'], focus: ['N2', 'N3'], title: 'Read from N2 and N3: they disagree', text: 'N3 is back. The reader asks R = 2 replicas and happens to pick N2 and N3. N2 says v2 (version 2), N3 says v1 (version 1). Because W + R > N, the two sets must overlap: at least one replica the reader asked has the latest write.', calc: ['N2 → v2 (t2)', 'N3 → v1 (t1)'] });
    nodes.N3.val = 'v2'; nodes.N3.t = 2;
    snap({ kind: 'repair', packets: [{ from: 'reader', to: 'N3', label: 'repair: v2', tone: 'accent', at: 0 }], lines: ['repair'], focus: ['N3'], result: 'v2', title: 'Newest wins: x = v2, and N3 gets repaired', text: 'The reader returns v2, the higher version. It also writes v2 back to N3, which was stale: read repair. Anti-entropy jobs (Merkle trees) fix replicas that nobody happens to read.', calc: ['max(t2, t1) → v2', 'N3 ← v2'] });
    snap({ kind: 'stale', packets: [{ from: 'reader', to: 'N3', label: 'get x (R = 1)', tone: 'note', at: 0 }], lines: ['read'], focus: ['N3'], title: 'What if R = 1? (W + R = 3, not more than N)', text: 'Rewind to before the repair: with R = 1 the reader might ask only N3, the replica the write missed, and get v1. When W + R ≤ N the read and write sets need not overlap, so reads can be stale: faster and more available, but only eventually consistent.', calc: ['W + R = 2 + 1 = 3 ≤ N', 'possible answer: v1 (stale)'] });
    snap({ kind: 'done', packets: [], lines: [], answer: 'W + R > N → reads see the latest write', title: 'Quorums trade latency for freshness', text: 'N = 3, W = 2, R = 2 tolerates one replica down for both reads and writes and still returns the latest value. W = 3 makes writes fragile; R = 1 makes reads fast but possibly stale. Cassandra and DynamoDB let you choose per query.', calc: ['N=3 W=2 R=2: balanced', 'W+R ≤ N: eventual consistency'] });
    return steps;
  }
  const entry = (n, op, tone = 'accent') => ({ n, text: `#${n} ${op}`, tone });
  const base = (k) => Array.from({ length: k }, (_, i) => entry(i + 1, ['a=1', 'b=7', 'a=4', 'c=2', 'b=9'][i % 5], 'muted'));
  const nodes = {
    L: { role: 'leader', log: base(3), up: true, epoch: 1 },
    F1: { role: ex === 'semisync' ? 'follower · sync' : 'follower', log: base(3), up: true, epoch: 1 },
    F2: { role: ex === 'semisync' ? 'follower · async' : 'follower', log: base(3), up: true, epoch: 1 },
  };
  if (ex === 'lag') for (const n of Object.values(nodes)) n.log = [...base(2), entry(3, 'name=Asha', 'muted')];
  if (ex === 'failover') {
    nodes.L.log = base(6); nodes.F1.log = base(5); nodes.F2.log = base(4);
  }
  const lagOf = (id) => nodes.L.up ? Math.max(0, nodes.L.log.length - nodes[id].log.length) : 0;
  const snap = (s) => steps.push({
    ex,
    nodes: Object.fromEntries(Object.entries(nodes).map(([k, n]) => [k, { ...n, chips: short(n.log), at: n.log.length, lag: k === 'L' ? 0 : lagOf(k) }])),
    ...s,
  });
  if (ex === 'semisync') {
    snap({ kind: 'start', packets: [], lines: [], title: 'One leader, one sync follower, one async follower', text: 'All writes go to the leader, which appends them to its replication log and ships the log to followers. Here F1 is synchronous (the leader waits for it) and F2 asynchronous (it doesn\'t): semi-synchronous replication.', calc: ['every node at #3'] });
    nodes.L.log.push(entry(4, 'x=5'));
    snap({ kind: 'write', packets: [{ from: 'client', to: 'L', label: 'write x = 5', tone: 'accent' }], lines: ['write'], focus: ['L'], title: 'The client writes x = 5: the leader appends #4', text: 'The leader writes entry #4 to its log. It doesn\'t answer the client yet: first it must make sure the sync follower has a copy.', calc: ['leader: #4 x=5'] });
    nodes.F1.log.push(entry(4, 'x=5'));
    snap({ kind: 'replicate', packets: [{ from: 'L', to: 'F1', label: '#4', tone: 'accent', at: 0 }, { from: 'L', to: 'F2', label: '#4', tone: 'note', at: 0 }], lines: ['write', 'sync'], focus: ['F1'], title: 'The log entry goes to both followers', text: 'F1 is close and fast and applies #4 at once. F2\'s copy is still on its way (a slower link, or a busy disk).', calc: ['F1: at #4', 'F2: at #3, 1 behind'] });
    snap({ kind: 'ack', packets: [{ from: 'F1', to: 'L', label: 'ack #4', tone: 'success', at: 0 }, { from: 'L', to: 'client', label: 'OK', tone: 'success', at: 0.7 }], lines: ['sync'], focus: ['F1', 'L'], title: 'F1 acks, and only now the client hears OK', text: 'The write exists on two machines before anyone is told it succeeded, so losing the leader can\'t lose it. The client waited for one follower, not both: F2 being slow didn\'t slow the write down.', calc: ['copies before OK: 2', 'waited for: F1 only'] });
    nodes.F2.log.push(entry(4, 'x=5'));
    snap({ kind: 'catchup', packets: [{ from: 'L', to: 'F2', label: '#4', tone: 'note' }], lines: ['async'], focus: ['F2'], title: 'F2 catches up a moment later', text: 'The async follower applies #4 when it arrives. In between, a read from F2 would have returned the old x: that window is replication lag.', calc: ['F2: at #4, lag 0'] });
    snap({ kind: 'done', packets: [], lines: [], answer: 'durable on 2 nodes, waited for 1 follower', title: 'Semi-sync: safety without waiting for everyone', text: 'Fully synchronous replication would make every write as slow as the slowest follower, and stop if any follower died. Fully async risks losing acknowledged writes on failover. One sync follower is the common middle ground (and if it fails, another is made sync).', calc: ['sync: durable, slower', 'async: fast, may lose recent writes'] });
    return steps;
  }
  if (ex === 'lag') {
    snap({ kind: 'start', packets: [], lines: [], title: 'Asynchronous followers serve the reads', text: 'Asha\'s profile is replicated to two followers, and reads are spread across them to take load off the leader. Replication is asynchronous: the leader replies as soon as it has a write.', calc: ['name = "Asha" on every node'] });
    nodes.L.log.push(entry(4, 'name=Asha R.'));
    snap({ kind: 'write', packets: [{ from: 'client', to: 'L', label: 'name = Asha R.', tone: 'accent', at: 0 }, { from: 'L', to: 'client', label: 'OK', tone: 'success', at: 0.8 }], lines: ['write'], focus: ['L'], title: 'Asha renames herself: OK at once', text: 'The leader appends #4 and replies straight away, without waiting for followers. Fast, but for a while the followers don\'t know.', calc: ['leader: #4 name=Asha R.'] });
    nodes.F1.log.push(entry(4, 'name=Asha R.'));
    snap({ kind: 'replicate', packets: [{ from: 'L', to: 'F1', label: '#4', tone: 'accent' }], lines: ['write'], focus: ['F1'], title: 'F1 gets #4; F2 is busy and falls behind', text: 'F1 applies the change. F2 is busy applying a large batch from another table, so its copy of #4 is queued: it is now 1 entry behind (seconds, under load sometimes minutes).', calc: ['F1: at #4', 'F2: at #3, 1 behind'] });
    snap({ kind: 'stale', packets: [{ from: 'client', to: 'F2', label: 'GET profile', tone: 'note', at: 0 }, { from: 'F2', to: 'client', label: 'name = Asha', tone: 'danger', at: 0.8 }], lines: ['read'], focus: ['F2'], title: 'Asha reloads and sees her old name', text: 'The read lands on F2, which hasn\'t applied #4. From Asha\'s side, her change has vanished: the read-your-writes guarantee is broken. A second reload might hit F1 and show the new name, then F2 again: time appears to go backwards.', calc: ['F2 at #3 → name = "Asha"', 'expected "Asha R."'] });
    snap({ kind: 'fix', packets: [{ from: 'client', to: 'L', label: 'GET own profile', tone: 'note', at: 0 }, { from: 'L', to: 'client', label: 'name = Asha R.', tone: 'success', at: 0.8 }], lines: ['fix'], focus: ['L'], title: 'Fix: read your own data from the leader', text: 'For a minute after a user writes, send that user\'s reads of their own data to the leader (or to a follower known to be at #4 or later). Everyone else can keep reading from followers.', calc: ['own profile, recent write → leader', 'others → any follower'] });
    nodes.F2.log.push(entry(4, 'name=Asha R.'));
    snap({ kind: 'catchup', packets: [{ from: 'L', to: 'F2', label: '#4', tone: 'note' }], lines: ['read'], focus: ['F2'], title: 'F2 catches up', text: 'Eventually every follower has #4 and any replica gives the same answer: eventual consistency. The bugs live in the "eventually".', calc: ['F2: at #4, lag 0'] });
    snap({ kind: 'done', packets: [], lines: [], answer: 'replicas lag; route a user\'s own reads to fresh data', title: 'Read replicas are slightly stale', text: 'Async followers scale reads cheaply, at the cost of lag. Mention it whenever you add read replicas, and say how you protect read-your-writes and monotonic reads (pin a user to one replica).', calc: ['read-your-writes: leader or caught-up follower', 'monotonic reads: pin user → replica'] });
    return steps;
  }
  // failover
  snap({ kind: 'start', packets: [], lines: [], title: 'An async leader slightly ahead of its followers', text: 'The leader is at #6. F1 has everything up to #5 and F2 up to #4: normal replication lag. Every entry up to #6 has already been acknowledged to its client.', calc: ['L at #6, F1 at #5, F2 at #4'] });
  nodes.L.log.push(entry(7, 'pay=₹500', 'accent'));
  snap({ kind: 'write', packets: [{ from: 'client', to: 'L', label: '#7 pay ₹500', tone: 'accent', at: 0 }, { from: 'L', to: 'client', label: 'OK', tone: 'success', at: 0.8 }], lines: ['write'], focus: ['L'], title: 'A payment is written and acknowledged: #7', text: 'The client is told the payment succeeded. With async replication, #6 and #7 currently exist only on the leader.', calc: ['acknowledged, only on L: #6, #7'] });
  nodes.L.up = false;
  snap({ kind: 'crash', packets: [], lines: ['detect'], focus: [], title: 'The leader dies', text: 'The leader\'s machine fails before shipping #6 and #7. Followers stop receiving heartbeats; after the timeout (here 10 s) they presume it dead. Too short a timeout causes needless failovers during load spikes; too long means a longer outage.', calc: ['heartbeats: stopped', 'writes refused until a new leader exists'] });
  nodes.F1.role = 'leader'; nodes.F1.epoch = 2;
  nodes.F2.log = base(5);
  snap({ kind: 'elect', packets: [{ from: 'F1', to: 'F2', label: '#5', tone: 'accent' }], lines: ['elect'], focus: ['F1'], title: 'F1 is promoted: it has the most data (#5)', text: 'An election (via ZooKeeper, etcd or Raft) picks the most up-to-date follower, F1, and bumps the epoch to 2. F2 now follows F1 and receives #5 from it. Nobody has #6 or #7: those acknowledged writes are lost.', calc: ['new leader: F1, epoch 2', 'lost: #6, #7 (acknowledged!)'] });
  nodes.F1.log.push(entry(6, 'y=9', 'note'));
  nodes.F2.log.push(entry(6, 'y=9', 'note'));
  snap({ kind: 'write', packets: [{ from: 'client', to: 'F1', label: '#6 y = 9', tone: 'note', at: 0 }, { from: 'F1', to: 'F2', label: '#6', tone: 'note', at: 0.8 }], lines: ['write'], focus: ['F1'], title: 'New writes reuse position #6', text: 'Clients reconnect to F1. Its next entry is #6, but it is a different #6 than the one the old leader acknowledged. Anything that remembered the old #6 (a cache, another database, an auto-increment id) is now inconsistent.', calc: ['new #6: y=9', 'old #6, #7: gone'] });
  nodes.L.up = true; nodes.L.role = 'old leader';
  snap({ kind: 'fence', packets: [{ from: 'L', to: 'F2', label: 'epoch 1 ✗', tone: 'danger' }], lines: ['fence'], focus: ['L'], title: 'The old leader returns, and is fenced off', text: 'It still believes it is leader (epoch 1) and tries to keep replicating. Followers reject anything from an epoch older than 2. Without this fencing, two leaders would accept conflicting writes: split brain.', calc: ['epoch 1 < 2 → rejected', 'old leader must discard #6, #7'] });
  nodes.L.log = [...base(5), entry(6, 'y=9', 'note')];
  nodes.L.role = 'follower'; nodes.L.epoch = 2;
  snap({ kind: 'rejoin', packets: [{ from: 'F1', to: 'L', label: 'truncate, #6', tone: 'note' }], lines: ['fence'], focus: ['L'], title: 'It rejoins as a follower and drops its extra entries', text: 'The old leader truncates its log back to #5, the last entry the new leader also has, and takes #6 from F1. The cluster is consistent again, minus the payment.', calc: ['L: truncated to #5, now at #6', 'role: follower'] });
  snap({ kind: 'done', packets: [], lines: [], answer: '2 acknowledged writes lost', title: 'Async failover can lose acknowledged writes', text: 'With async replication, whatever the old leader acknowledged but hadn\'t shipped is lost on failover. Use synchronous or semi-sync replication for data like payments, fence old leaders with epochs, and keep the detection timeout sensible.', calc: ['lost: #6, #7', 'prevent: semi-sync + fencing'] });
  return steps;
}

// ---------------------------------------------------------------- sharding

/** A fixed integer mixer, so "hash" placements look random but are reproducible. */
export const hash32 = (x) => {
  let h = Math.imul(x ^ 0x5bd1e995, 0x9e3779b1) >>> 0;
  h ^= h >>> 15;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  return (h ^ (h >>> 13)) >>> 0;
};

export const SHARDING = {
  range: { label: 'Range: hot spot', input: { ex: 'range' } },
  hash: { label: 'Hash: even, but scattered', input: { ex: 'hash' } },
  modn: { label: 'Add a shard: hash mod N', input: { ex: 'modn' } },
  fixed: { label: 'Add a shard: fixed partitions', input: { ex: 'fixed' } },
};

export const shardingCode = {
  range: [['route', 'shard = the range that contains order_id   // 1–100, 101–200, 201–300, 301+'], ['query', 'WHERE order_id BETWEEN 395 AND 405 → shards whose range overlaps']],
  hash: [['route', 'shard = hash(order_id) % 4'], ['query', 'WHERE order_id BETWEEN 395 AND 405 → ask every shard, merge']],
  modn: [['route', 'shard = hash(user_id) % N'], ['grow', 'N: 4 → 5   // every key\'s shard is recomputed']],
  fixed: [['route', 'partition = hash(user_id) % 12   // never changes'], ['map', 'node = owner[partition]   // a small lookup table'], ['grow', 'new node: move whole partitions to it, update the table']],
};

const NEW_ORDERS = [401, 402, 403, 404, 405, 406, 407, 408];
const USERS = Array.from({ length: 20 }, (_, k) => k + 1);
const userHash = (u) => hash32(u + 1971);   // salted so 20 small ids spread the way real ones would
export const PARTITIONS = 12;

export function sharding({ ex }) {
  const steps = [];
  if (ex === 'range' || ex === 'hash') {
    const isRange = ex === 'range';
    const shards = [0, 1, 2, 3].map((k) => ({ id: `S${k + 1}`, label: isRange ? ['1–100', '101–200', '201–300', '301+'][k] : `hash % 4 = ${k}`, rows: 100, fresh: [] }));
    const shardOf = (id) => (isRange ? Math.min(3, Math.floor((id - 1) / 100)) : hash32(id) % 4);
    const snap = (s) => steps.push({ ex, shards: shards.map((x) => ({ ...x, fresh: [...x.fresh] })), touched: [], ...s });
    snap({ kind: 'start', lines: [], title: isRange ? 'Range partitioning by order id' : 'Hash partitioning by order id', text: isRange ? 'Four shards, each owning a contiguous range of order ids. Orders 1–400 already exist, 100 per shard. Order ids grow over time, like most ids and timestamps.' : 'Four shards; an order goes to hash(order_id) % 4. The hash scatters neighbouring ids, so orders 1–400 are spread evenly too.', calc: ['existing: 100 rows per shard', 'next orders: 401–408'] });
    for (let b = 0; b < NEW_ORDERS.length; b += 4) {
      const batch = NEW_ORDERS.slice(b, b + 4);
      for (const s of shards) s.fresh = s.fresh.map((f) => ({ ...f, old: true }));
      for (const id of batch) { const s = shards[shardOf(id)]; s.rows++; s.fresh.push({ id, old: false }); }
      const hit = [...new Set(batch.map(shardOf))].map((k) => shards[k].id);
      snap({
        kind: 'write', lines: ['route'], touched: hit,
        title: `New orders ${batch[0]}–${batch.at(-1)} → ${hit.join(', ')}`,
        text: isRange
          ? `Every new id is above 300, so every new order lands on ${hit.join(', ')}. The other three shards sit idle for writes: a hot spot, and adding shards wouldn't help, since new ids always fall in the last range.`
          : `${batch.map((id) => `${id} → S${shardOf(id) + 1}`).join(', ')}. Consecutive ids land on different shards, so the write load is shared.`,
        calc: batch.map((id) => `${isRange ? `${id} in ${shards[shardOf(id)].label}` : `hash(${id}) % 4 = ${shardOf(id)}`} → S${shardOf(id) + 1}`),
      });
    }
    for (const s of shards) s.fresh = s.fresh.map((f) => ({ ...f, old: true }));
    const inRange = Array.from({ length: 11 }, (_, k) => 395 + k);
    const touched = [...new Set(inRange.map(shardOf))].map((k) => shards[k].id);
    snap({
      kind: 'query', lines: ['query'], touched,
      title: `Orders 395–405: ${plural(touched.length, 'shard')} to ask`,
      text: isRange
        ? `The range sits inside one shard's range, so the query goes to ${touched.join(', ')} only and reads rows already sorted. Range partitioning makes range queries cheap.`
        : `Neighbouring ids are scattered, so the router can't know which shards hold 395–405. It asks all ${touched.length} and merges the results (scatter-gather). Hashing made writes even and range queries expensive.`,
      calc: [`ids 395–405 live on ${touched.join(', ')}`],
    });
    const writes = shards.map((s) => s.fresh.length);
    snap({
      kind: 'done', lines: [], touched: [], answer: `new writes per shard: ${writes.join(' / ')} · range query: ${plural(touched.length, 'shard')}`,
      title: isRange ? 'Cheap ranges, one hot shard' : 'Even writes, scattered ranges',
      text: isRange
        ? 'Range partitioning is great for "between" queries and terrible for ever-increasing keys. Fixes: a compound key (hash a prefix such as user_id, keep time ordering inside it), or hash partitioning.'
        : 'Hashing spreads load evenly, even for sequential keys, at the cost of range queries. Pick the key by your main access pattern; compound keys can give you both (hash by user, sort by time inside).',
      calc: shards.map((s, k) => `${s.id}: +${writes[k]} new`),
    });
    return steps;
  }
  if (ex === 'modn') {
    const place = (n) => Object.fromEntries(USERS.map((u) => [u, userHash(u) % n]));
    const before = place(4);
    const snap = (s) => steps.push({ ex, n: 4, keys: USERS.map((u) => ({ u, shard: before[u] })), moved: [], ...s });
    snap({ kind: 'start', lines: ['route'], title: '20 users on 4 shards with hash % 4', text: 'Each user lives on shard hash(user_id) % 4. Simple, and the spread is fairly even. Now the data grows and a fifth shard is added.', calc: USERS.slice(0, 4).map((u) => `hash(u${u}) % 4 = ${before[u]}`) });
    const after = place(5);
    const moved = USERS.filter((u) => after[u] !== before[u]);
    const toNew = moved.filter((u) => after[u] === 4).length;
    snap({ kind: 'grow', n: 5, keys: USERS.map((u) => ({ u, shard: after[u], from: before[u] })), moved, lines: ['grow'], title: `N = 5: ${moved.length} of 20 users move`, text: `Changing the divisor changes almost every remainder. ${moved.length} of 20 users (${Math.round((moved.length / 20) * 100)}%) now belong to a different shard: ${toNew} of them to the new S5, and ${moved.length - toNew} just shuffle between the old shards. All that data has to be copied while the system serves traffic.`, calc: [`moved: ${moved.length} / 20`, `expected for 4 → 5: about 80%`] });
    snap({ kind: 'done', n: 5, keys: USERS.map((u) => ({ u, shard: after[u], from: before[u] })), moved, lines: [], answer: `${moved.length} of 20 keys moved (${Math.round((moved.length / 20) * 100)}%)`, title: 'Don\'t shard with hash mod N', text: 'Only about 1 in 5 keys needed to move to fill the new shard; mod N moved most of them. Use a fixed number of partitions (next example) or consistent hashing, where adding a node moves only its fair share.', calc: [`ideal: ~${Math.round(20 / 5)} keys to the new shard`, `mod N: ${moved.length} keys moved`] });
    return steps;
  }
  // fixed partitions
  const partOf = (u) => userHash(u) % PARTITIONS;
  const owner = Object.fromEntries(Array.from({ length: PARTITIONS }, (_, p) => [p, p % 4]));
  const snap = (s) => steps.push({ ex, n: Math.max(...Object.values(owner)) + 1, owner: { ...owner }, parts: Array.from({ length: PARTITIONS }, (_, p) => ({ p, users: USERS.filter((u) => partOf(u) === p) })), moved: [], ...s });
  snap({ kind: 'start', lines: ['route', 'map'], title: '12 partitions on 4 nodes', text: 'Users hash into 12 partitions, a number fixed up front and larger than the node count. A small table maps each partition to a node: 3 partitions per node. A user\'s partition never changes.', calc: ['partition = hash(user) % 12', 'node = owner[partition]'] });
  const takeFrom = [0, 1];
  const movedParts = takeFrom.map((n) => Object.keys(owner).map(Number).filter((p) => owner[p] === n).at(-1));
  movedParts.forEach((p, k) => {
    owner[p] = 4;
    const users = USERS.filter((u) => partOf(u) === p);
    snap({ kind: 'move', lines: ['grow'], moved: movedParts.slice(0, k + 1), title: `Move partition p${p}: S${takeFrom[k] + 1} → S5`, text: `The whole partition is copied to the new node, then the table entry is flipped. Only its ${plural(users.length, 'user')} (${users.map((u) => `u${u}`).join(', ') || 'none'}) move${users.length === 1 ? 's' : ''}; no key changes partition.`, calc: [`owner[p${p}] = S5`, `users moved: ${users.length}`] });
  });
  const movedUsers = USERS.filter((u) => movedParts.includes(partOf(u)));
  snap({ kind: 'done', lines: [], moved: movedParts, answer: `${movedUsers.length} of 20 keys moved (${Math.round((movedUsers.length / 20) * 100)}%)`, title: 'Move partitions, not keys', text: `S5 took 2 of the 12 partitions, and only the ${movedUsers.length} users inside them moved, close to the fair share of 1 in 5. Riak, Elasticsearch, Couchbase and Redis Cluster (16,384 slots) work this way. Choose the partition count with room to grow: it is hard to change later.`, calc: [`moved: ${movedUsers.length} / 20`, `partitions per node: ${[0, 1, 2, 3, 4].map((n) => Object.values(owner).filter((o) => o === n).length).join(', ')}`] });
  return steps;
}

// ---------------------------------------------------------------- consistent hashing

export const RING_SERVERS = { A: 40, B: 100, C: 300 };
export const RING_KEYS = { k1: 15, k2: 70, k3: 130, k4: 180, k5: 230, k6: 280, k7: 320, k8: 350 };
const VNODES = { A: [40, 175, 245], B: [100, 220, 335], C: [300, 140, 60] };

/** The first server point at or clockwise after `pos` (wrapping past 360). */
export function ownerOf(pos, points) {
  const sorted = [...points].sort((a, b) => a.at - b.at);
  return sorted.find((p) => p.at >= pos) ?? sorted[0];
}

/** Degrees of the ring each server owns: the arc from the previous point up to each of its points. */
export function shares(points) {
  const sorted = [...points].sort((a, b) => a.at - b.at);
  const out = {};
  sorted.forEach((p, k) => {
    const prev = sorted[(k - 1 + sorted.length) % sorted.length].at;
    out[p.server] = (out[p.server] ?? 0) + ((p.at - prev + 360) % 360 || 360);
  });
  return out;
}

export const RING = {
  lookup: { label: 'Look up keys', input: { ex: 'lookup' } },
  add: { label: 'Add a server', input: { ex: 'add' } },
  remove: { label: 'Remove a server', input: { ex: 'remove' } },
  vnodes: { label: 'Virtual nodes', input: { ex: 'vnodes' } },
};

export const ringCode = {
  lookup: [['hash', 'pos = hash(key) % 360   // a point on the ring'], ['walk', 'server = first server point clockwise from pos']],
  add: [['hash', 'D joins at hash("D") = 200°'], ['walk', 'only keys between D\'s predecessor and D change owner']],
  remove: [['hash', 'B leaves'], ['walk', 'B\'s keys go to the next server clockwise; nobody else moves']],
  vnodes: [['hash', 'each server gets several points: hash("A#1"), hash("A#2"), …'], ['walk', 'more points → arcs average out → fairer shares']],
};

export function ring({ ex }) {
  const steps = [];
  let points = Object.entries(RING_SERVERS).map(([server, at]) => ({ id: server, server, at }));
  const keys = Object.entries(RING_KEYS).map(([k, at]) => ({ k, at }));
  const owners = () => Object.fromEntries(keys.map(({ k, at }) => [k, ownerOf(at, points).server]));
  const pct = (sh) => Object.fromEntries(Object.entries(sh).sort(([a], [b]) => (a < b ? -1 : 1)).map(([s, d]) => [s, Math.round((d / 360) * 100)]));
  const snap = (s) => steps.push({ points: points.map((p) => ({ ...p })), keys, owners: owners(), shares: pct(shares(points)), walk: null, moved: [], ...s });
  const count = (o) => Object.values(o).reduce((m, s) => ({ ...m, [s]: (m[s] ?? 0) + 1 }), {});
  const fmtCount = (o) => Object.entries(count(o)).sort().map(([s, n]) => `${s}: ${n}`).join(', ');

  if (ex === 'lookup') {
    snap({ kind: 'start', lines: [], title: 'Servers and keys on one ring', text: 'Hash each server\'s name to a point on a circle (0–359°), and hash each key the same way. A key belongs to the first server you reach walking clockwise from it.', calc: Object.entries(RING_SERVERS).map(([s, a]) => `${s} at ${a}°`) });
    const own = owners();
    for (const k of ['k1', 'k3', 'k7']) {
      const at = RING_KEYS[k];
      const o = ownerOf(at, points);
      snap({ kind: 'walk', lines: ['hash', 'walk'], walk: { k, from: at, to: o.at, server: o.server }, title: `${k} at ${at}° → ${o.server}`, text: o.at < at ? `${k} sits at ${at}°. Walking clockwise there is no server before 360°, so the walk wraps past the top and the first server is ${o.server} at ${o.at}°.` : `${k} sits at ${at}°. Walking clockwise, the first server point is ${o.server} at ${o.at}°, so ${o.server} stores ${k}.`, calc: [`hash(${k}) = ${at}°`, `next server clockwise: ${o.server} (${o.at}°)`] });
    }
    snap({ kind: 'all', lines: ['walk'], title: 'Every key, the same way', text: `Each server owns the arc that ends at its point. Note the arcs are uneven: C\'s arc is the longest, so C holds the most keys. Keep that in mind for the last example.`, calc: [fmtCount(own), `arcs: ${Object.entries(pct(shares(points))).map(([s, p]) => `${s} ${p}%`).join(', ')}`] });
    snap({ kind: 'done', lines: [], answer: fmtCount(own), title: 'No table, no modulo', text: 'Any client that knows the server points can find a key\'s server with a binary search over the sorted points. The magic shows when servers come and go (next examples).', calc: ['lookup: O(log servers)'] });
    return steps;
  }
  if (ex === 'add') {
    const before = owners();
    snap({ kind: 'start', lines: [], title: 'Three servers, eight keys', text: 'Current owners, by the clockwise rule. Now server D joins, hashing to 200°.', calc: [fmtCount(before)] });
    points = [...points, { id: 'D', server: 'D', at: 200, fresh: true }];
    const after = owners();
    const moved = Object.keys(after).filter((k) => after[k] !== before[k]);
    snap({ kind: 'add', lines: ['hash'], arc: { from: 100, to: 200 }, title: 'D lands at 200°, inside C\'s arc', text: 'D\'s predecessor clockwise is B at 100°. So D takes over the arc 100°–200°, which used to belong to C. Nothing else on the ring changes.', calc: ['D takes (100°, 200°] from C'] });
    snap({ kind: 'move', lines: ['walk'], moved, arc: { from: 100, to: 200 }, title: `${moved.join(' and ')} move to D; nothing else moves`, text: `Only keys in D's new arc change owner: ${moved.join(', ')} (from C). The other ${8 - moved.length} keys stay exactly where they were.`, calc: [`moved: ${moved.length} of 8`, fmtCount(after)] });
    const modMoved = keys.filter(({ at }) => at % 3 !== at % 4).length;
    snap({ kind: 'done', lines: [], moved, answer: `${moved.length} of 8 keys moved (mod N: ${modMoved} of 8)`, title: 'Adding a server moves about 1/N of the keys', text: `With hash % N, going from 3 to 4 servers would have moved ${modMoved} of these 8 keys. On the ring, only ${moved.length} moved, all onto the new server. That is why caches and Dynamo-style databases use it.`, calc: [`ring: ${moved.length} / 8`, `hash % 3 → % 4: ${modMoved} / 8`] });
    return steps;
  }
  if (ex === 'remove') {
    const before = owners();
    snap({ kind: 'start', lines: [], title: 'Three servers, eight keys', text: 'Server B (at 100°) is about to leave: decommissioned, or crashed.', calc: [fmtCount(before)] });
    points = points.filter((p) => p.server !== 'B');
    const after = owners();
    const moved = Object.keys(after).filter((k) => after[k] !== before[k]);
    snap({ kind: 'remove', lines: ['hash', 'walk'], moved, arc: { from: 40, to: 100 }, gone: { server: 'B', at: 100 }, title: `B leaves: ${moved.join(', ')} → C`, text: `B's arc (40°–100°) now ends at the next server clockwise, C. Only B's keys move (${moved.join(', ')}); keys on A and C are untouched.`, calc: [`moved: ${moved.length} of 8`, fmtCount(after)] });
    snap({ kind: 'done', lines: [], moved, answer: `${moved.length} of 8 keys moved`, title: 'Departures are cheap, but lopsided', text: `Only B's keys moved, and they all went to one neighbour. C now owns ${Math.round((shares(points).C / 360) * 100)}% of the ring: with few points per server, load is uneven and a departure dumps everything on one server. Virtual nodes fix both.`, calc: [fmtCount(after), `C owns ${Math.round((shares(points).C / 360) * 100)}% of the ring`] });
    return steps;
  }
  // virtual nodes
  points = Object.entries(VNODES).map(([s, ats]) => ({ id: `${s}1`, server: s, at: ats[0] }));
  snap({ kind: 'start', lines: [], title: 'One point per server: uneven arcs', text: `With one point each, arc sizes are down to luck. Here C owns ${pct(shares(points)).C}% of the ring and B only ${pct(shares(points)).B}%, so C does over three times B's work.`, calc: Object.entries(pct(shares(points))).map(([s, p]) => `${s}: ${p}%`) });
  for (const round of [1, 2]) {
    points = [...points.map((p) => ({ ...p, fresh: false })), ...Object.entries(VNODES).map(([s, ats]) => ({ id: `${s}${round + 1}`, server: s, at: ats[round], fresh: true }))];
    const p = pct(shares(points));
    snap({ kind: 'vnodes', lines: ['hash', 'walk'], title: `${round + 1} points per server`, text: round === 1 ? 'Give each server a second point by hashing "A#2", "B#2", "C#2". Each server now owns several smaller arcs, scattered around the ring, and the totals start to even out.' : `With 3 points each, the shares are ${Object.entries(p).map(([s, x]) => `${s} ${x}%`).join(', ')}. Real systems use 100–256 per server, which brings every server within a few percent of 1/N.`, calc: Object.entries(p).map(([s, x]) => `${s}: ${x}%`) });
  }
  snap({ kind: 'done', lines: [], answer: Object.entries(pct(shares(points))).map(([s, x]) => `${s} ${x}%`).join(' · '), title: 'Virtual nodes even out the load', text: 'More points per server means fairer shares. And when a server leaves, its many small arcs pass to many different neighbours, so no single server inherits all its load. A bigger machine can simply get more virtual nodes.', calc: ['few points: luck decides', 'many points: ≈ 1/N each'] });
  return steps;
}

export { list };
