import { useMemo, useState } from 'react';
import { SimFrame, Choice, Stat } from './SimFrame';
import { useStepper, VizControls } from '../mdx/VizStepper';
import { pct } from './simKit';
import styles from './Sim.module.css';

const PRESETS = [
  ['A B C A D A E A B F A', 'One hot key'],
  ['A B C D A B C D A B C D', 'Loop bigger than the cache'],
  ['A B A B C D E F G A B', 'Scan pollutes the cache'],
];
const POLICIES = ['LRU', 'LFU', 'FIFO'];

/**
 * Run one policy over the access sequence. Returns one frame per access:
 * { key, hit, evicted, items: [{ key, uses }] } with items in the policy's eviction order (first = next victim).
 */
function run(policy, seq, cap) {
  const items = [];          // { key, uses, lastUsed, added }
  const frames = [];
  seq.forEach((key, t) => {
    let entry = items.find((e) => e.key === key);
    let evicted = null;
    const hit = Boolean(entry);
    if (entry) {
      entry.uses += 1;
      entry.lastUsed = t;
    } else {
      if (items.length >= cap) {
        const victim = [...items].sort(order(policy))[0];
        evicted = victim.key;
        items.splice(items.indexOf(victim), 1);
      }
      entry = { key, uses: 1, lastUsed: t, added: t };
      items.push(entry);
    }
    frames.push({ key, hit, evicted, items: [...items].sort(order(policy)).map((e) => ({ ...e })) });
  });
  return frames;
}

/** Comparator putting the next victim first. */
function order(policy) {
  if (policy === 'LRU') return (a, b) => a.lastUsed - b.lastUsed;
  if (policy === 'FIFO') return (a, b) => a.added - b.added;
  return (a, b) => a.uses - b.uses || a.lastUsed - b.lastUsed;   // LFU, ties broken by least recent
}

/** Step through an access sequence and watch LRU, LFU and FIFO make different eviction choices. */
export function CacheSim() {
  const [seqText, setSeqText] = useState(PRESETS[0][0]);
  const [cap, setCap] = useState(3);
  const seq = useMemo(() => seqText.trim().toUpperCase().split(/[\s,]+/).filter(Boolean).slice(0, 24), [seqText]);
  const runs = useMemo(() => Object.fromEntries(POLICIES.map((p) => [p, run(p, seq, cap)])), [seq, cap]);
  const s = useStepper(Math.max(1, seq.length));
  const i = Math.min(s.i, seq.length - 1);

  if (!seq.length) return null;
  return (
    <SimFrame
      title="Cache eviction policies"
      hint="The same sequence of requests goes to three caches of the same size. Each row lists the cache contents with the next item to be evicted first. Step through and see which policy keeps the right items."
      footer={
        <div className={styles.stats}>
          {POLICIES.map((p) => {
            const hits = runs[p].slice(0, i + 1).filter((f) => f.hit).length;
            return <Stat key={p} label={`${p} hit ratio so far`} value={`${hits}/${i + 1} · ${pct(hits / (i + 1))}`} />;
          })}
        </div>
      }
    >
      <div className={styles.row}>
        <Choice label="Requests" value={seqText} options={PRESETS} onChange={(v) => { setSeqText(v); s.restart(); }} />
        <Choice label="Cache size" value={cap} options={[2, 3, 4]} onChange={(v) => { setCap(v); s.restart(); }} />
      </div>
      <div className={styles.row} aria-label="Request sequence">
        {seq.map((k, j) => (
          <span key={j} className={styles.mono} style={{
            padding: '2px 7px', borderRadius: 4, fontWeight: 700,
            background: j === i ? 'var(--color-accent)' : 'var(--color-surface-muted)',
            color: j === i ? 'var(--color-accent-contrast)' : j < i ? 'var(--color-text-muted)' : 'var(--color-text)',
          }}>{k}</span>
        ))}
      </div>
      <div className={styles.scroll}><table className={styles.table}>
        <thead><tr><th>Policy</th><th>Request {seq[i]}</th><th>Cache after (next victim first)</th></tr></thead>
        <tbody>
          {POLICIES.map((p) => {
            const f = runs[p][i];
            return (
              <tr key={p}>
                <td><strong>{p}</strong></td>
                <td style={{ color: f.hit ? 'var(--color-success)' : '#d4554a', fontWeight: 650 }}>
                  {f.hit ? 'hit' : 'miss'}{f.evicted ? <span className={styles.muted} style={{ fontWeight: 400 }}> · evicted {f.evicted}</span> : null}
                </td>
                <td className={styles.mono}>
                  {f.items.map((e, k) => (
                    <span key={e.key} style={{ marginRight: 8, opacity: k === 0 && f.items.length >= cap ? 0.6 : 1 }}>
                      {e.key}{p === 'LFU' ? <sub>×{e.uses}</sub> : null}
                    </span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
      <VizControls s={s} count={seq.length} />
    </SimFrame>
  );
}
