import styles from './ArrayViz.module.css';
import { useStepper, VizState, VizControls } from './VizStepper';

/**
 * Step-through visualiser for array algorithms.
 *
 * <ArrayViz title="Two pointers on a sorted array" frames={[
 *   { arr: [1, 2, 4, 7, 11], pointers: { L: 0, R: 4 }, window: [0, 4],
 *     highlight: [0, 4], done: [], vars: { sum: 12, target: 9 },
 *     aux: { label: 'stack', items: [3, 5] }, note: 'Sum too big: move R left.' },
 *   ...
 * ]} />
 *
 * Every field except `arr` is optional. `window` is an inclusive [l, r] range.
 * For grids, pass `grid` (array of rows) instead of `arr`; highlight / window / done take [row, col] pairs.
 */
/** 2D variant: frame.grid is an array of rows; highlight / window / done are lists of [row, col]. */
function Grid({ f }) {
  const has = (list, r, c) => list?.some(([x, y]) => x === r && y === c);
  return (
    <div className={styles.scroller}>
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${f.grid[0].length}, auto)` }}>
        {f.grid.flatMap((row, r) => row.map((v, c) => {
          const cls = [
            styles.cell, styles.gridCell,
            has(f.window, r, c) && styles.window,
            has(f.highlight, r, c) && styles.highlight,
            has(f.done, r, c) && styles.done,
          ].filter(Boolean).join(' ');
          return <div key={`${r}-${c}`} className={cls}>{String(v)}</div>;
        }))}
      </div>
    </div>
  );
}

export function ArrayViz({ frames, title }) {
  const s = useStepper(frames.length);
  const f = frames[s.i];

  const pointersAt = (idx) =>
    Object.entries(f.pointers ?? {}).filter(([, v]) => v === idx).map(([k]) => k);
  const inWindow = (idx) => f.window && idx >= f.window[0] && idx <= f.window[1];

  return (
    <figure className={styles.viz}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}

      {f.grid ? <Grid f={f} /> : (
      <div className={styles.scroller}>
        <div className={styles.row}>
          {f.arr.map((v, idx) => {
            const cls = [
              styles.cell,
              inWindow(idx) && styles.window,
              f.highlight?.includes(idx) && styles.highlight,
              f.done?.includes(idx) && styles.done,
            ].filter(Boolean).join(' ');
            const ptrs = pointersAt(idx);
            return (
              <div key={idx} className={styles.col}>
                <div className={styles.ptrs}>
                  {ptrs.map((p) => <span key={p} className={styles.ptr}>{p}</span>)}
                  {ptrs.length > 0 && <span className={styles.arrow} aria-hidden="true">▼</span>}
                </div>
                <div className={cls}>{String(v)}</div>
                <div className={styles.index}>{idx}</div>
              </div>
            );
          })}
        </div>
      </div>
      )}

      <VizState f={f} />
      <VizControls s={s} count={frames.length} />
    </figure>
  );
}
