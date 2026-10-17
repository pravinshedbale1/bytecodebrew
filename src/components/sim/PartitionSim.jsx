import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { SimFrame, Choice } from './SimFrame';
import { fnv1a, PALETTE } from './simKit';
import styles from './Sim.module.css';

const CONSUMERS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'];

/** Range assignment: contiguous blocks of partitions per consumer (the first ones get one extra). */
function rangeAssign(parts, consumers) {
  const out = Object.fromEntries(consumers.map((c) => [c, []]));
  const per = Math.floor(parts / consumers.length);
  const extra = parts % consumers.length;
  let p = 0;
  consumers.forEach((c, i) => {
    const n = per + (i < extra ? 1 : 0);
    for (let k = 0; k < n; k++) out[c].push(p++);
  });
  return out;
}

/** Sticky assignment: keep what each consumer already owns as far as balance allows, move only the rest. */
function stickyAssign(parts, consumers, previous) {
  const out = Object.fromEntries(consumers.map((c) => [c, []]));
  const target = (i) => Math.floor(parts / consumers.length) + (i < parts % consumers.length ? 1 : 0);
  const order = [...consumers].sort((a, b) => (previous[b]?.length ?? 0) - (previous[a]?.length ?? 0));
  const taken = new Set();
  order.forEach((c, i) => {
    for (const p of previous[c] ?? []) if (p < parts && out[c].length < target(i) && !taken.has(p)) { out[c].push(p); taken.add(p); }
  });
  const free = Array.from({ length: parts }, (_, p) => p).filter((p) => !taken.has(p));
  order.forEach((c, i) => { while (out[c].length < target(i) && free.length) out[c].push(free.shift()); });
  return out;
}

/** Kafka-style consumer group: partitions shared among consumers, idle consumers, and what a rebalance moves. */
export function PartitionSim() {
  const [parts, setParts] = useState(6);
  const [count, setCount] = useState(3);
  const [protocol, setProtocol] = useState('cooperative');
  const [assignment, setAssignment] = useState(() => rangeAssign(6, CONSUMERS.slice(0, 3)));
  const [moved, setMoved] = useState(null);
  const [key, setKey] = useState('order-1042');

  const consumers = CONSUMERS.slice(0, count);
  const color = (c) => PALETTE[CONSUMERS.indexOf(c) % PALETTE.length];

  const rebalance = (nextCount, nextParts = parts, label) => {
    const next = CONSUMERS.slice(0, nextCount);
    const result = protocol === 'eager' ? rangeAssign(nextParts, next) : stickyAssign(nextParts, next, assignment);
    const ownerBefore = {};
    Object.entries(assignment).forEach(([c, ps]) => ps.forEach((p) => { ownerBefore[p] = c; }));
    let changed = 0;
    Object.entries(result).forEach(([c, ps]) => ps.forEach((p) => { if (ownerBefore[p] !== c) changed += 1; }));
    setAssignment(result);
    setCount(nextCount);
    setParts(nextParts);
    setMoved({
      label,
      changed,
      paused: protocol === 'eager' ? nextParts : changed,
    });
  };

  const partitionOf = (k) => fnv1a(k) % parts;
  const ownerOf = (p) => Object.entries(assignment).find(([, ps]) => ps.includes(p))?.[0];
  const kp = partitionOf(key);
  const idle = consumers.filter((c) => !(assignment[c]?.length));

  return (
    <SimFrame
      title="Partitions and a consumer group"
      hint="A topic's partitions are shared among the consumers in a group; each partition is read by exactly one of them. Add consumers and watch what happens when there are more consumers than partitions. Switch the rebalance protocol to compare how much work stops."
      footer={moved && (
        <p className={styles.note}>
          <strong>{moved.label}.</strong> {moved.changed} partition{moved.changed === 1 ? '' : 's'} changed owner.{' '}
          {protocol === 'eager'
            ? <>With the eager protocol every consumer gave up all its partitions first, so consumption of all {moved.paused} partitions paused during the rebalance.</>
            : moved.paused === 0
              ? <>With the cooperative protocol nothing had to stop.</>
              : <>With the cooperative protocol only {moved.paused === 1 ? 'that partition' : `those ${moved.paused} partitions`} paused; the rest kept being consumed.</>}
          {idle.length > 0 && <> {idle.join(', ')} {idle.length === 1 ? 'is' : 'are'} idle: there are more consumers than partitions.</>}
        </p>
      )}
    >
      <div className={styles.row}>
        <Choice label="Rebalance protocol" value={protocol} options={[['eager', 'Eager (stop the world)'], ['cooperative', 'Cooperative (incremental)']]} onChange={(v) => { setProtocol(v); setMoved(null); }} />
      </div>
      <div className={styles.row}>
        <span className={styles.muted}>Consumers: {count}</span>
        <button type="button" className={styles.btn} onClick={() => rebalance(count + 1, parts, `Consumer ${CONSUMERS[count]} joined`)} disabled={count >= CONSUMERS.length}><Plus size={12} /> Add consumer</button>
        <button type="button" className={styles.btn} onClick={() => rebalance(count - 1, parts, `Consumer ${CONSUMERS[count - 1]} left`)} disabled={count <= 1}><Minus size={12} /> Remove consumer</button>
        <span className={styles.muted}>Partitions: {parts}</span>
        <button type="button" className={styles.btn} onClick={() => rebalance(count, parts + 1, 'Added a partition')} disabled={parts >= 12}><Plus size={12} /> Add partition</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(count, 4)}, minmax(0, 1fr))`, gap: 8 }}>
        {consumers.map((c) => (
          <div key={c} style={{ border: `2px solid ${assignment[c]?.length ? color(c) : 'var(--color-border)'}`, borderRadius: 8, padding: 8, opacity: assignment[c]?.length ? 1 : 0.55 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}><span className={styles.dot} style={{ background: color(c) }} />Consumer {c}</div>
            <div className={styles.row} style={{ gap: 4 }}>
              {(assignment[c] ?? []).length
                ? assignment[c].map((p) => (
                  <span key={p} className={styles.mono} style={{ padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: p === kp ? color(c) : 'var(--color-surface-muted)', color: p === kp ? '#fff' : 'var(--color-text)' }}>P{p}</span>
                ))
                : <span className={styles.muted}>idle</span>}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.row}>
        <span className={styles.muted}>Message key</span>
        <input className={styles.input} value={key} onChange={(e) => setKey(e.target.value)} aria-label="Message key" />
        <span>→ hash % {parts} = <strong className={styles.mono}>P{kp}</strong> → read by <strong>{ownerOf(kp) ? `consumer ${ownerOf(kp)}` : 'nobody yet'}</strong>. Every message with this key goes to P{kp}, so they stay in order.</span>
      </div>
    </SimFrame>
  );
}
