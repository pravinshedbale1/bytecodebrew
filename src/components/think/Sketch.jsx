import { useLayoutEffect, useRef, useState } from 'react';
import { ArrayStrip, Stage, pitchFor } from '../mdx/viz/prims';
import styles from './Think.module.css';

/**
 * A small annotated picture of an example, drawn from data (see src/data/think/index.js):
 *   { kind: 'array', rows: [{ label?, items, marks?, bands?, tags? }], caption? }
 *   { kind: 'grid', grid, marks?, labels?, caption? }
 */
export function Sketch({ sketch }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(480);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <figure className={styles.sketch} ref={ref}>
      {sketch.kind === 'grid' ? <GridSketch s={sketch} /> : sketch.rows.map((row, k) => <ArrayRow key={k} row={row} width={width} />)}
      {sketch.caption && <figcaption className={styles.caption}>{sketch.caption}</figcaption>}
    </figure>
  );
}

function ArrayRow({ row, width }) {
  const n = row.items.length;
  const wide = row.items.some((v) => String(v).length > 3);
  const pitch = pitchFor(width - 8, n, wide ? 56 : 32, wide ? 84 : 52);
  const hasTags = row.tags && Object.keys(row.tags).length > 0;
  const hasBandLabel = row.bands?.some((b) => b.label);
  const top = hasBandLabel ? 22 : 10;
  const h = 40;
  const height = top + h + (hasTags ? 30 : 10);
  const tags = Object.fromEntries(Object.entries(row.tags ?? {}).map(([i, list]) => [i, list.map(([label, tone]) => ({ label, tone }))]));
  return (
    <div className={styles.sketchRow}>
      {row.label && <div className={styles.rowLabel}>{row.label}</div>}
      <div className={styles.sketchScroll}>
        <Stage width={n * pitch} height={height} label={row.label ?? 'example'}>
          <ArrayStrip items={row.items} y={top} pitch={pitch} h={h} index={false} tags={tags} bands={row.bands ?? []} cls={(i) => row.marks?.[i] ?? ''} />
        </Stage>
      </div>
    </div>
  );
}

function GridSketch({ s }) {
  return (
    <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${s.grid[0].length}, 40px)` }}>
      {s.grid.flatMap((row, r) => row.map((v, c) => {
        const key = `${r},${c}`;
        const cls = s.marks?.[key] ?? (v === 0 ? 'empty' : '');
        return <div key={key} className={`${styles.gcell} ${cls ? styles[`g_${cls}`] : ''}`}>{s.labels?.[key] ?? ''}</div>;
      }))}
    </div>
  );
}
