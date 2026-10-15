import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import styles from './ArrayViz.module.css';

/** Step state shared by the visualisers: current frame index, autoplay and the button handlers. */
export function useStepper(count) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = count - 1;

  useEffect(() => {
    if (!playing) return undefined;
    if (i >= last) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setI((x) => x + 1), 1400);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  return {
    i: Math.min(i, last),
    last,
    playing,
    restart: () => { setPlaying(false); setI(0); },
    prev: () => { setPlaying(false); setI((x) => Math.max(0, x - 1)); },
    next: () => { setPlaying(false); setI((x) => Math.min(last, x + 1)); },
    toggle: () => { if (i >= last) setI(0); setPlaying((p) => !p); },
  };
}

/** Variables, the auxiliary list (stack, queue, map…) and the explanation for one frame. */
export function VizState({ f }) {
  return (
    <>
      {(f.vars || f.aux) && (
        <div className={styles.state}>
          {f.vars && Object.entries(f.vars).map(([k, v]) => (
            <span key={k} className={styles.var}><span className={styles.varName}>{k}</span> {String(v)}</span>
          ))}
          {f.aux && (
            <span className={styles.var}>
              <span className={styles.varName}>{f.aux.label}</span>
              <span className={styles.aux}>[{f.aux.items.join(', ')}]</span>
            </span>
          )}
        </div>
      )}
      {f.note && <p className={styles.note}>{f.note}</p>}
    </>
  );
}

export function VizControls({ s, count }) {
  return (
    <div className={styles.controls}>
      <button type="button" onClick={s.restart} aria-label="Restart" disabled={s.i === 0}>
        <RotateCcw size={15} />
      </button>
      <button type="button" onClick={s.prev} aria-label="Previous step" disabled={s.i === 0}>
        <ChevronLeft size={16} />
      </button>
      <button type="button" className={styles.play} onClick={s.toggle} aria-label={s.playing ? 'Pause' : 'Play'}>
        {s.playing ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <button type="button" onClick={s.next} aria-label="Next step" disabled={s.i === s.last}>
        <ChevronRight size={16} />
      </button>
      <span className={styles.step}>Step {s.i + 1} / {count}</span>
    </div>
  );
}
