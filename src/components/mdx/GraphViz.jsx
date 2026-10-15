import styles from './ArrayViz.module.css';
import g from './GraphViz.module.css';
import { useStepper, VizState, VizControls } from './VizStepper';

/**
 * Step-through visualiser for anything drawn as nodes and arrows: graphs, linked lists, hash-table chains.
 *
 * <GraphViz title="…" directed nodes={[{ id: 'a', label: 'A', x: 0, y: 0, shape: 'circle' }]}
 *   edges={[{ from: 'a', to: 'b', label: '5', bend: 20 }]} frames={[
 *     { highlight: ['a'], visited: [], done: [], marked: [], hidden: [], activeEdges: ['a>b'],
 *       hiddenEdges: [], labels: { a: 'A*' }, notes: { a: 'd=0' }, pointers: { head: 'a' },
 *       vars: {}, aux: { label: 'queue', items: [] }, note: '…' },
 *   ]} />
 *
 * x / y are grid units (one unit ≈ 84 px). `bend` curves an edge sideways (px; negative bends the other way). shape: 'circle' (default), 'box' (sized to the label) or 'text'.
 * A frame may replace `edges` (e.g. arrows flipping during a list reversal) or set `directed`; nodes keep their positions.
 * Edge keys are "from>to"; for undirected graphs either order matches.
 */
const UNIT = 84;
const R = 19;          // circle radius
const BOX_H = 34;
const PAD = 34;        // margin around the drawing (room for pointers and notes)

const boxWidth = (label) => Math.max(44, String(label).length * 8.6 + 20);

function size(n, label) {
  if (n.shape === 'box') return { w: boxWidth(label), h: BOX_H };
  if (n.shape === 'text') return { w: String(label).length * 8 + 8, h: 20 };
  return { w: 2 * R, h: 2 * R };
}

/** Where the segment from a's centre towards b's centre leaves a's outline. */
function exitPoint(a, b, sa) {
  const dx = b.px - a.px, dy = b.py - a.py;
  const len = Math.hypot(dx, dy) || 1;
  if (a.shape === 'box' || a.shape === 'text') {
    const tx = dx === 0 ? Infinity : (sa.w / 2) / Math.abs(dx);
    const ty = dy === 0 ? Infinity : (sa.h / 2) / Math.abs(dy);
    const t = Math.min(tx, ty);
    return [a.px + dx * t, a.py + dy * t];
  }
  return [a.px + (dx / len) * R, a.py + (dy / len) * R];
}

export function GraphViz({ title, nodes, edges, frames, directed: directedProp = false }) {
  const s = useStepper(frames.length);
  const f = frames[s.i];
  const directed = f.directed ?? directedProp;           // a frame may switch arrows on or off
  const label = (n) => f.labels?.[n.id] ?? n.label ?? n.id;

  const minX = Math.min(...nodes.map((n) => n.x)), minY = Math.min(...nodes.map((n) => n.y));
  const placed = new Map(nodes.map((n) => [n.id, { ...n, px: PAD + 30 + (n.x - minX) * UNIT, py: PAD + (n.y - minY) * UNIT }]));
  const width = Math.max(...[...placed.values()].map((n) => n.px + size(n, label(n)).w / 2)) + PAD;
  const height = Math.max(...[...placed.values()].map((n) => n.py)) + PAD + 20;

  const key = (a, b) => `${a}>${b}`;
  const inList = (list, e) => Boolean(list?.includes(key(e.from, e.to)) || (!directed && list?.includes(key(e.to, e.from))));
  const has = (list, id) => Boolean(list?.includes(id));
  const visibleEdges = (f.edges ?? edges).filter(
    (e) => !has(f.hidden, e.from) && !has(f.hidden, e.to) && !inList(f.hiddenEdges, e),
  );
  const twoWay = (e) => directed && visibleEdges.some((o) => o.from === e.to && o.to === e.from);

  return (
    <figure className={styles.viz}>
      {title && <figcaption className={styles.title}>{title}</figcaption>}
      <div className={styles.scroller}>
        <svg className={g.svg} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title ?? 'graph'}>
          <defs>
            {['edge', 'on', 'path'].map((kind) => (
              <marker key={kind} id={`gv-arrow-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={g[`arrow_${kind}`]} />
              </marker>
            ))}
          </defs>
          {visibleEdges.map((e) => {
            const a = placed.get(e.from), b = placed.get(e.to);
            // a bent edge curves through a control point offset sideways by `bend` px (to avoid crossing a node)
            const mx = (a.px + b.px) / 2, my = (a.py + b.py) / 2, dl = Math.hypot(b.px - a.px, b.py - a.py) || 1;
            const ctrl = e.bend ? { px: mx + (-(b.py - a.py) / dl) * e.bend * 2, py: my + ((b.px - a.px) / dl) * e.bend * 2 } : null;
            let [x1, y1] = exitPoint(a, ctrl ?? b, size(a, label(a)));
            let [x2, y2] = exitPoint(b, ctrl ?? a, size(b, label(b)));
            if (twoWay(e)) {                                   // two arrows between the same pair: offset them
              const len = Math.hypot(x2 - x1, y2 - y1) || 1, ox = (-(y2 - y1) / len) * 6, oy = ((x2 - x1) / len) * 6;
              x1 += ox; y1 += oy; x2 += ox; y2 += oy;
            }
            const kind = inList(f.activeEdges, e) ? 'on' : inList(f.pathEdges, e) ? 'path' : 'edge';
            const edgeLabel = f.edgeLabels?.[key(e.from, e.to)] ?? e.label;
            return (
              <g key={key(e.from, e.to)}>
                {ctrl
                  ? <path d={`M${x1},${y1} Q${ctrl.px},${ctrl.py} ${x2},${y2}`} fill="none" className={g[kind]} markerEnd={directed ? `url(#gv-arrow-${kind})` : undefined} />
                  : <line x1={x1} y1={y1} x2={x2} y2={y2} className={g[kind]} markerEnd={directed ? `url(#gv-arrow-${kind})` : undefined} />}
                {edgeLabel != null && (
                  <text x={ctrl ? (x1 + x2 + 2 * ctrl.px) / 4 : (x1 + x2) / 2} y={(ctrl ? (y1 + y2 + 2 * ctrl.py) / 4 : (y1 + y2) / 2) - 5} textAnchor="middle" className={g.edgeLabel}>{String(edgeLabel)}</text>
                )}
              </g>
            );
          })}
          {[...placed.values()].filter((n) => !has(f.hidden, n.id)).map((n) => {
            const text = label(n);
            const { w, h } = size(n, text);
            const cls = [
              g.node,
              n.shape === 'text' && g.plain,
              has(f.visited, n.id) && g.visited,
              has(f.highlight, n.id) && g.highlight,
              has(f.marked, n.id) && g.marked,
              has(f.done, n.id) && g.done,
            ].filter(Boolean).join(' ');
            const ptrs = Object.entries(f.pointers ?? {}).filter(([, v]) => v === n.id).map(([k]) => k);
            return (
              <g key={n.id} className={cls}>
                {ptrs.length > 0 && (
                  <text x={n.px} y={n.py - h / 2 - 7} textAnchor="middle" className={g.ptr}>{ptrs.join(', ')} ▾</text>
                )}
                {n.shape === 'text' ? null : n.shape === 'box'
                  ? <rect x={n.px - w / 2} y={n.py - h / 2} width={w} height={h} rx={7} />
                  : <circle cx={n.px} cy={n.py} r={R} />}
                <text x={n.px} y={n.py + 5} textAnchor="middle" className={g.label}>{String(text)}</text>
                {f.notes?.[n.id] != null && (
                  <text x={n.px} y={n.py + h / 2 + 14} textAnchor="middle" className={g.noteText}>{String(f.notes[n.id])}</text>
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
