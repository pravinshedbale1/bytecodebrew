import { useState } from 'react';
import { Server } from 'lucide-react';
import { SimFrame, Choice } from './SimFrame';
import styles from './Sim.module.css';

/**
 * Leaderless replication with N replicas, write quorum W and read quorum R. Click replicas to take
 * them down, write and read, and see when a read can miss the latest write (R + W ≤ N).
 */
export function QuorumSim() {
  const [n, setN] = useState(5);
  const [w, setW] = useState(3);
  const [r, setR] = useState(3);
  const [replicas, setReplicas] = useState(() => Array.from({ length: 5 }, () => ({ v: 1, up: true })));
  const [latest, setLatest] = useState(1);
  const [msg, setMsg] = useState(null);
  const [lit, setLit] = useState({ kind: null, ids: [] });

  const resize = (size) => {
    setN(size);
    setW((x) => Math.min(x, size));
    setR((x) => Math.min(x, size));
    setReplicas(Array.from({ length: size }, () => ({ v: latest, up: true })));
    setMsg(null);
    setLit({ kind: null, ids: [] });
  };

  const alive = replicas.map((x, i) => (x.up ? i : -1)).filter((i) => i >= 0);

  const write = () => {
    if (alive.length < w) {
      setMsg({ ok: false, text: `Write failed: only ${alive.length} replica${alive.length === 1 ? ' is' : 's are'} up, but W = ${w} must acknowledge.` });
      setLit({ kind: 'write', ids: [] });
      return;
    }
    const v = latest + 1;
    // Rotate the starting replica so different writes reach different subsets, as with real network luck
    const start = v % alive.length;
    const targets = Array.from({ length: w }, (_, k) => alive[(start + k) % alive.length]);
    setReplicas((rs) => rs.map((x, i) => (targets.includes(i) ? { ...x, v } : x)));
    setLatest(v);
    setLit({ kind: 'write', ids: targets });
    setMsg({ ok: true, text: `Wrote version ${v} to replicas ${targets.map((t) => t + 1).join(', ')}. ${w} acknowledgements, so the write succeeded; the others are now stale.` });
  };

  const read = () => {
    if (alive.length < r) {
      setMsg({ ok: false, text: `Read failed: only ${alive.length} replica${alive.length === 1 ? ' is' : 's are'} up, but R = ${r} must answer.` });
      setLit({ kind: 'read', ids: [] });
      return;
    }
    // The unluckiest possible read: ask the most out-of-date replicas first
    const targets = [...alive].sort((a, b) => replicas[a].v - replicas[b].v).slice(0, r);
    const got = Math.max(...targets.map((t) => replicas[t].v));
    setLit({ kind: 'read', ids: targets });
    setMsg({
      ok: got === latest,
      text: got === latest
        ? `Read the ${r} most out-of-date live replicas (${targets.map((t) => t + 1).join(', ')}) and still found version ${got}, the latest — the read set overlaps every write set.`
        : `Stale read! ${targets.length === 1 ? 'Replica' : 'Replicas'} ${targets.map((t) => t + 1).join(', ')} only ${targets.length === 1 ? 'has' : 'have'} version ${got}, but version ${latest} was acknowledged. R + W = ${r + w} is not more than N = ${n}.`,
    });
  };

  const repair = () => {
    setReplicas((rs) => rs.map((x) => (x.up ? { ...x, v: latest } : x)));
    setLit({ kind: null, ids: [] });
    setMsg({ ok: true, text: 'Anti-entropy repair copied the latest version to every live replica.' });
  };

  const toggle = (i) => {
    setReplicas((rs) => rs.map((x, k) => (k === i ? { ...x, up: !x.up } : x)));
    setLit({ kind: null, ids: [] });
  };

  const strong = r + w > n;
  return (
    <SimFrame
      title="Quorum reads and writes"
      hint="A write must be acknowledged by W replicas; a read asks R replicas and keeps the newest version. Reads here are deliberately unlucky (they ask the most out-of-date replicas). Click a replica to take it down or bring it back."
      footer={msg ? <p className={styles.note} style={{ color: msg.ok ? 'var(--color-text)' : '#d4554a' }}>{msg.text}</p> : <p className={styles.note}>Write a few versions, then read. Try R = 1, W = 1, and then R + W &gt; N.</p>}
    >
      <div className={styles.row}>
        <Choice label="N" value={n} options={[3, 5, 7]} onChange={resize} />
        <Choice label="W" value={w} options={Array.from({ length: n }, (_, k) => k + 1)} onChange={(v) => { setW(v); setMsg(null); }} />
        <Choice label="R" value={r} options={Array.from({ length: n }, (_, k) => k + 1)} onChange={(v) => { setR(v); setMsg(null); }} />
        <span className={styles.mono} style={{ fontWeight: 700, color: strong ? 'var(--color-success)' : '#d4554a' }}>
          R + W = {r + w} {strong ? '>' : '≤'} N = {n} → {strong ? 'reads see the latest write' : 'stale reads possible'}
        </span>
      </div>
      <div className={styles.row} role="group" aria-label="Replicas">
        {replicas.map((x, i) => {
          const hot = lit.ids.includes(i);
          return (
            <button key={i} type="button" onClick={() => toggle(i)} aria-pressed={!x.up}
              aria-label={`Replica ${i + 1}, version ${x.v}, ${x.up ? 'up' : 'down'}`}
              style={{
                display: 'grid', justifyItems: 'center', gap: 2, minWidth: 74, padding: '8px 6px',
                borderRadius: 8, cursor: 'pointer', font: 'inherit',
                border: `2px solid ${hot ? (lit.kind === 'write' ? 'var(--color-accent)' : '#8b5cf6') : 'var(--color-border)'}`,
                background: x.up ? 'var(--color-surface)' : 'var(--color-surface-muted)',
                opacity: x.up ? 1 : 0.5,
                color: 'var(--color-text)',
              }}>
              <Server size={16} />
              <span style={{ fontSize: 11 }}>Replica {i + 1}</span>
              <span className={styles.mono} style={{ fontWeight: 700, color: x.v === latest ? 'var(--color-success)' : 'var(--color-warn)' }}>v{x.v}</span>
              <span style={{ fontSize: 10 }} className={styles.muted}>{x.up ? 'up' : 'down'}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.row}>
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={write}>Write next version</button>
        <button type="button" className={styles.btn} onClick={read}>Read</button>
        <button type="button" className={styles.btn} onClick={repair}>Repair replicas</button>
        <span className={styles.muted}>Latest acknowledged version: <strong className={styles.mono}>v{latest}</strong></span>
      </div>
    </SimFrame>
  );
}
