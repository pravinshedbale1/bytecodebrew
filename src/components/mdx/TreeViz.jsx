import styles from './ArrayViz.module.css';
import t from './TreeViz.module.css';
import { useStepper, VizState, VizControls } from './VizStepper';

/**
 * Step-through visualiser for trees (binary trees, tries, recursion trees).
 *
 * <TreeViz title="…" tree={{ id: 'a', v: 3, c: [{ id: 'b', v: 9 }, null] }} frames={[
 *   { highlight: ['a'], visited: [], done: [], marked: [], path: ['a', 'b'],
 *     notes: { b: 'h=1' }, pointers: { cur: 'a' }, vars: {}, aux: { label: 'stack', items: [] }, note: '…' },
 * ]} />
 *
 * A node is { id, v, c? }; `c` lists children, and null keeps an empty slot (a missing left child).
 * To show a tree growing, pass the final tree and list the not-yet-created nodes in a frame's `hidden`:
 * the layout stays fixed, so nodes never jump. Every frame field is optional.
 * highlight = the node being worked on; visited = seen; done = finished (dimmed);
 * marked = special (end of word, answer); path = edges drawn in the accent colour.
 */
const H = 34;          // node height
const LEVEL = 66;      // vertical distance between levels
const TOP = 22;        // room for pointer labels
const NOTE = 16;       // room for a note under the deepest nodes

const nodeWidth = (v) => Math.max(H, String(v).length * 8.4 + 18);

function layout(root, minSlot) {
  const nodes = [];
  const edges = [];
  let maxW = H;
  const visit = (n) => {
    if (!n) return;
    maxW = Math.max(maxW, nodeWidth(n.v));
    (n.c ?? []).forEach(visit);
  };
  visit(root);
  const slot = Math.max(maxW + 14, minSlot);
  let next = 0;                                   // next free leaf slot
  let depthMax = 0;
  const place = (n, depth) => {
    depthMax = Math.max(depthMax, depth);
    if (!n) { next++; return null; }              // keep the gap for a missing child
    const kids = (n.c ?? []).map((ch) => place(ch, depth + 1));
    const real = kids.filter(Boolean);
    const x = real.length
      ? (real[0].x + real[real.length - 1].x) / 2
      : (next++ + 0.5) * slot;
    // a lone child sits under its parent's side: shift the parent half a slot
    const me = { id: n.id ?? String(n.v), v: n.v, x, y: TOP + H / 2 + depth * LEVEL, w: nodeWidth(n.v) };
    if (n.c?.length === 2 && real.length === 1) me.x = n.c[0] ? real[0].x + slot / 2 : real[0].x - slot / 2;
    nodes.push(me);
    real.forEach((k) => edges.push([me, k]));
    return me;
  };
  place(root, 0);
  const minX = Math.min(...nodes.map((n) => n.x - n.w / 2));
  const maxX = Math.max(...nodes.map((n) => n.x + n.w / 2));
  const shift = 6 - minX;
  nodes.forEach((n) => { n.x += shift; });
  return { nodes, edges, width: maxX - minX + 12, height: TOP + H + depthMax * LEVEL + NOTE + 4 };
}

export function TreeViz({ title, tree, frames }) {
  const s = useStepper(frames.length);
  const f = frames[s.i];
  // widen the slots so the longest note under any node, in any frame, never touches its neighbour
  const longestNote = Math.max(0, ...frames.flatMap((fr) => Object.values(fr.notes ?? {}).map((v) => String(v).length)));
  const { nodes: all, edges: allEdges, width, height } = layout(f.tree ?? tree, longestNote * 7 + 12);
  const nodes = all.filter((n) => !f.hidden?.includes(n.id));
  const edges = allEdges.filter(([, b]) => !f.hidden?.includes(b.id));
  const has = (list, id) => Boolean(list?.includes(id));
  const ptrsAt = (id) => Object.entries(f.pointers ?? {}).filter(([, v]) => v === id).map(([k]) => k);

  return (
    <figure className={styles.viz}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
      <div className={styles.scroller}>
        <svg className={t.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title ?? 'tree'}>
          {edges.map(([a, b]) => (
            <line
              key={`${a.id}-${b.id}`}
              x1={a.x} y1={a.y + H / 2} x2={b.x} y2={b.y - H / 2}
              className={has(f.path, a.id) && has(f.path, b.id) ? t.edgeOn : t.edge}
            />
          ))}
          {nodes.map((n) => {
            const cls = [
              t.node,
              has(f.visited, n.id) && t.visited,
              has(f.highlight, n.id) && t.highlight,
              has(f.marked, n.id) && t.marked,
              has(f.done, n.id) && t.done,
            ].filter(Boolean).join(' ');
            const ptrs = ptrsAt(n.id);
            return (
              <g key={n.id} className={cls}>
                {ptrs.length > 0 && (
                  <text x={n.x} y={n.y - H / 2 - 6} className={t.ptr} textAnchor="middle">{ptrs.join(', ')} ▾</text>
                )}
                <rect x={n.x - n.w / 2} y={n.y - H / 2} width={n.w} height={H} rx={H / 2} />
                <text x={n.x} y={n.y + 5} textAnchor="middle" className={t.label}>{String(n.v)}</text>
                {f.notes?.[n.id] != null && (
                  <text x={n.x} y={n.y + H / 2 + 13} textAnchor="middle" className={t.noteText}>{String(f.notes[n.id])}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <VizState f={f} />
      <VizControls s={s} count={frames.length} />
    </figure>
  );
}
