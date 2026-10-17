import { useState } from 'react';
import { SimFrame, Choice, Stat } from './SimFrame';
import { fnv1a, pct } from './simKit';
import styles from './Sim.module.css';

const M = 32;   // bits

/** k bit positions for a word, by double hashing: h1 + i·h2 (mod m). */
const positions = (word, k) => {
  const h1 = fnv1a(word);
  const h2 = fnv1a(word, 0x01000193) | 1;
  return Array.from({ length: k }, (_, i) => (h1 + i * h2) % M);
};

const START = ['apple', 'banana', 'cherry', 'mango', 'peach'];
const CANDIDATES = ['grape', 'kiwi', 'lemon', 'melon', 'plum', 'fig', 'lime', 'pear', 'date', 'guava', 'papaya', 'olive', 'onion', 'carrot', 'tomato', 'potato', 'garlic', 'ginger', 'pepper', 'radish'];

/** A tiny Bloom filter (32 bits): add words, check words, and catch a false positive. */
export function BloomSim() {
  const [k, setK] = useState(3);
  const [added, setAdded] = useState(START);
  const [word, setWord] = useState('grape');
  const [last, setLast] = useState(null);

  const bits = new Array(M).fill(0);
  for (const w of added) for (const p of positions(w, k)) bits[p] = 1;
  const fill = bits.filter(Boolean).length / M;
  const theory = (1 - Math.exp((-k * added.length) / M)) ** k;

  const check = () => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    const ps = positions(w, k);
    const all = ps.every((p) => bits[p]);
    const truly = added.includes(w);
    setLast({ w, ps, kind: 'check', all, falsePositive: all && !truly });
  };

  const add = () => {
    const w = word.trim().toLowerCase();
    if (!w || added.includes(w)) return;
    setAdded((a) => [...a, w]);
    setLast({ w, ps: positions(w, k), kind: 'add' });
  };

  const lit = new Set(last?.ps ?? []);
  const fpWord = CANDIDATES.find((c) => !added.includes(c) && positions(c, k).every((p) => bits[p]));
  return (
    <SimFrame
      title="A Bloom filter, bit by bit"
      hint={`${M} bits and k hash functions. Adding a word sets its k bits; checking a word looks at the same k bits. If any is 0, the word was definitely never added. If all are 1, it was probably added — or the bits were set by other words (a false positive).`}
      footer={last && (
        <p className={styles.note} style={{ color: last.kind === 'check' && last.falsePositive ? '#d4554a' : undefined }}>
          {last.kind === 'add'
            ? <>Added <strong>{last.w}</strong>: set bits {last.ps.join(', ')}.</>
            : last.all
              ? last.falsePositive
                ? <><strong>False positive!</strong> Bits {last.ps.join(', ')} are all 1, so the filter says &ldquo;{last.w}&rdquo; is probably present — but it was never added. Other words set those bits.</>
                : <>All of bits {last.ps.join(', ')} are 1: &ldquo;{last.w}&rdquo; is probably present (and it really was added).</>
              : <>Bit {last.ps.find((p) => !bits[p])} is 0, so &ldquo;{last.w}&rdquo; was <strong>definitely never added</strong>.</>}
        </p>
      )}
    >
      <div className={styles.row}>
        <Choice label="Hash functions k" value={k} options={[1, 2, 3, 4]} onChange={(v) => { setK(v); setLast(null); }} />
        <input className={styles.input} value={word} onChange={(e) => setWord(e.target.value)} aria-label="Word" onKeyDown={(e) => e.key === 'Enter' && check()} />
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={check}>Check</button>
        <button type="button" className={styles.btn} onClick={add}>Add</button>
        <button type="button" className={styles.btn} onClick={() => { setAdded(START); setLast(null); }}>Reset</button>
        {fpWord && <button type="button" className={styles.btn} onClick={() => setWord(fpWord)}>Find a false positive</button>}
      </div>
      <div role="img" aria-label={`Bit array: ${bits.join('')}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${M / 2}, minmax(0, 1fr))`, gap: 4 }}>
        {bits.map((b, i) => (
          <span key={i} className={styles.mono} style={{
            display: 'grid', placeItems: 'center', height: 30, borderRadius: 4, fontSize: 12, fontWeight: 700,
            background: b ? 'var(--color-accent-soft)' : 'var(--color-surface-muted)',
            color: b ? 'var(--color-accent)' : 'var(--color-text-subtle)',
            outline: lit.has(i) ? `2px solid ${last?.kind === 'check' && !b ? '#d4554a' : 'var(--color-text)'}` : 'none',
          }} title={`bit ${i}`}>{b}</span>
        ))}
      </div>
      <div className={styles.row}>
        <span className={styles.muted}>Added:</span>
        {added.map((w) => <span key={w} className={styles.mono}>{w}</span>)}
      </div>
      <div className={styles.stats}>
        <Stat label="words added (n)" value={added.length} />
        <Stat label="bits set" value={pct(fill)} />
        <Stat label="false-positive rate ≈ (1 − e^(−kn/m))^k" value={pct(theory, 1)} tone={theory > 0.2 ? 'bad' : undefined} />
      </div>
    </SimFrame>
  );
}
