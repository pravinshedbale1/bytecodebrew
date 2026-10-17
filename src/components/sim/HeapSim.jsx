import { useState } from 'react';
import { SimFrame } from './SimFrame';
import styles from './Sim.module.css';

const START = [1, 3, 2, 7, 4, 5, 9];

/** offer(x) on a min-heap array, recording each comparison and swap. */
function offer(heap, x) {
  const a = [...heap, x];
  const steps = [`Add ${x} at the end (index ${a.length - 1}) to keep the tree complete.`];
  const path = [a.length - 1];
  let i = a.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (a[p] <= a[i]) { steps.push(`Parent ${a[p]} (index ${p}) ≤ ${a[i]}: stop.`); break; }
    steps.push(`Parent ${a[p]} (index ${p}) > ${a[i]}: swap them (sift up).`);
    [a[p], a[i]] = [a[i], a[p]];
    i = p;
    path.push(i);
  }
  if (i === 0 && path.length > 1) steps.push(`${a[0]} reached the root: it is the new minimum.`);
  return { heap: a, steps, path };
}

/** poll() on a min-heap array: remove the root, move the last element up, sift it down. */
function poll(heap) {
  if (!heap.length) return { heap, steps: ['The heap is empty.'], path: [] };
  const min = heap[0];
  const a = [...heap];
  const last = a.pop();
  if (!a.length) return { heap: a, steps: [`Remove ${min}; the heap is now empty.`], path: [], removed: min };
  a[0] = last;
  const steps = [`Remove the minimum ${min}. Move the last element ${last} to the root.`];
  const path = [0];
  let i = 0;
  for (;;) {
    const l = 2 * i + 1;
    const r = l + 1;
    let m = i;
    if (l < a.length && a[l] < a[m]) m = l;
    if (r < a.length && a[r] < a[m]) m = r;
    if (m === i) { steps.push(l < a.length ? `${a[i]} is not bigger than its children: stop.` : `${a[i]} has no children: stop.`); break; }
    steps.push(`Smaller child is ${a[m]} (index ${m}) < ${a[i]}: swap them (sift down).`);
    [a[m], a[i]] = [a[i], a[m]];
    i = m;
    path.push(i);
  }
  return { heap: a, steps, path, removed: min };
}

/** A min-heap you can add to and poll, shown as both a tree and the array Java's PriorityQueue stores. */
export function HeapSim() {
  const [heap, setHeap] = useState(START);
  const [value, setValue] = useState('0');
  const [last, setLast] = useState(null);

  const doOffer = () => {
    const x = Number.parseInt(value, 10);
    if (Number.isNaN(x) || heap.length >= 15) return;
    const r = offer(heap, x);
    setHeap(r.heap); setLast({ ...r, op: `offer(${x})` });
    setValue(String(Math.floor(Math.random() * 20)));
  };
  const doPoll = () => { const r = poll(heap); setHeap(r.heap); setLast({ ...r, op: `poll() → ${r.removed ?? 'null'}` }); };

  const lit = new Set(last?.path ?? []);
  const W = 520;
  const pos = (i) => {
    const level = Math.floor(Math.log2(i + 1));
    const first = 2 ** level - 1;
    const slots = 2 ** level;
    return [((i - first + 0.5) / slots) * W, 26 + level * 56];
  };

  return (
    <SimFrame
      title="Min-heap: offer and poll"
      hint="A PriorityQueue stores a complete binary tree in an array: the children of index i are at 2i + 1 and 2i + 2. Add values and poll the minimum, and follow the swaps that restore the heap order. Each operation touches at most one root-to-leaf path: O(log n)."
      footer={last ? (
        <div>
          <p className={styles.note}><strong className={styles.mono}>{last.op}</strong></p>
          <ol style={{ margin: '4px 0 0', paddingLeft: '1.2em', lineHeight: 1.6 }}>{last.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
        </div>
      ) : <p className={styles.note}>Try offer(0): it climbs all the way to the root. Then poll() and watch the last element sink back down.</p>}
    >
      <div className={styles.row}>
        <input className={styles.input} style={{ width: 70 }} value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value to add" onKeyDown={(e) => e.key === 'Enter' && doOffer()} />
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={doOffer} disabled={heap.length >= 15}>offer</button>
        <button type="button" className={styles.btn} onClick={doPoll} disabled={!heap.length}>poll</button>
        <button type="button" className={styles.btn} onClick={() => { setHeap(START); setLast(null); }}>Reset</button>
        <span className={styles.muted}>peek() = <strong className={styles.mono}>{heap[0] ?? 'null'}</strong>, size = {heap.length}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${26 + 3 * 56 + 24}`} className={styles.svg} role="img" aria-label={`Heap as a tree: ${heap.join(', ')}`}>
        {heap.map((_, i) => {
          if (i === 0) return null;
          const [x1, y1] = pos((i - 1) >> 1);
          const [x2, y2] = pos(i);
          const on = lit.has(i) && lit.has((i - 1) >> 1);
          return <line key={`e${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? 'var(--color-accent)' : 'var(--color-border-strong)'} strokeWidth={on ? 3 : 1.5} />;
        })}
        {heap.map((v, i) => {
          const [x, y] = pos(i);
          return (
            <g key={`n${i}`}>
              <circle cx={x} cy={y} r={17} fill={lit.has(i) ? 'var(--color-accent-soft)' : 'var(--color-surface)'} stroke={lit.has(i) ? 'var(--color-accent)' : 'var(--color-border-strong)'} strokeWidth={lit.has(i) ? 2.5 : 1.5} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--color-text)">{v}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.row} style={{ gap: 4 }} aria-label="Backing array">
        {heap.map((v, i) => (
          <span key={i} style={{ display: 'grid', justifyItems: 'center', minWidth: 30 }}>
            <span className={styles.mono} style={{ padding: '3px 8px', borderRadius: 4, fontWeight: 700, background: lit.has(i) ? 'var(--color-accent-soft)' : 'var(--color-surface-muted)' }}>{v}</span>
            <span style={{ fontSize: 10 }} className={styles.muted}>{i}</span>
          </span>
        ))}
      </div>
    </SimFrame>
  );
}
