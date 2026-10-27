import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

/** The element that scrolls the page around `el`: the nearest scrollable ancestor, else the window. */
function scrollParent(el) {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return window;
}

/**
 * Keeps the controls under the pointer. A new step can be taller or shorter than the last, which
 * would move the buttons away from the cursor (or finger) that just pressed one. While the pointer
 * is on the controls, focus is in them, or one was just clicked, the page scrolls by the same
 * amount the controls moved, so the next click lands on the same button.
 *
 * Inside a sticky dock ([data-sticky-dock]) the dock's on-screen position hides how far the content
 * really moved (it pins to the bottom of the screen), so then the shift is read from the element
 * just above the dock, unless the dock was already pinned, in which case it only moves if it unpins.
 */
function useStayPut(i) {
  const ref = useRef(null);
  const before = useRef(null);
  const hold = useRef({ hover: false, focus: false, click: false });
  const measure = () => {
    const el = ref.current;
    if (!el) return null;
    const dock = el.closest('[data-sticky-dock]');
    const box = (dock ?? el).getBoundingClientRect();
    const above = dock?.previousElementSibling;
    const sp = scrollParent(el);
    const viewBottom = sp === window ? window.innerHeight : sp.getBoundingClientRect().bottom;
    return { top: box.top, flow: above ? above.getBoundingClientRect().bottom : box.top, pinned: Boolean(dock) && box.bottom >= viewBottom - 1 };
  };
  useLayoutEffect(() => {
    const h = hold.current;
    const was = before.current;
    const now = measure();
    if (now && was && (h.hover || h.focus || h.click)) {
      const delta = was.pinned ? now.top - was.top : now.flow - was.flow;
      if (Math.abs(delta) > 1) scrollParent(ref.current).scrollBy(0, delta);
    }
    h.click = false;
    before.current = measure();
  }, [i]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const sp = scrollParent(el);
    const update = () => { before.current = measure(); };
    sp.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { sp.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  const h = hold.current;
  return {
    ref,
    onPointerEnter: () => { h.hover = true; },
    onPointerLeave: () => { h.hover = false; },
    onFocus: () => { h.focus = true; },
    onBlur: () => { h.focus = false; },
    onClickCapture: () => { h.click = true; before.current = measure(); },
  };
}

export function VizControls({ s, count }) {
  const stay = useStayPut(s.i);
  return (
    <div className={styles.controls} {...stay}>
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
