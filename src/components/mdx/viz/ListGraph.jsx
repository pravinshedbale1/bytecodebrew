import { useEffect, useRef } from 'react';
import { Scissors } from 'lucide-react';
import styles from './ListGraph.module.css';

/**
 * Nodes and next-arrows for the linked-list step-throughs, drawn like the textbook picture: each node
 * is a card with its value and a next field, and the arrow leaves from the dot in that field.
 *
 *   nodes     [{ id, label, x, y, kind: 'node' | 'dummy' | 'null', cls: ['cur', 'hit', 'out', 'fallen', …] }]
 *   edges     [{ from, to, tone, fresh, dashed, bend }]      fresh: just changed, draws itself in
 *   pointers  [{ name, at, tone, icon, big }]                 little characters that hop between nodes
 *   marks     [{ at, icon, label, tone }]                     a flag, crown or target pinned to a node
 *   pulse     node id that gets a collision ring;  snip: { x, y } where an arrow was cut
 */

export const NODE_W = 46;
export const NODE_H = 34;
const TONES = ['muted', 'accent', 'warn', 'success', 'interview', 'danger', 'note'];

export const sizeOf = (n) => (n.kind === 'null' ? { w: 38, h: 24 } : n.kind === 'dummy' ? { w: 64, h: NODE_H } : { w: NODE_W, h: NODE_H });

/** Where the line from a box's centre towards (tx, ty) leaves the box. */
function exit(n, tx, ty) {
  const { w, h } = sizeOf(n);
  const dx = tx - n.x, dy = ty - n.y;
  const t = Math.min(dx === 0 ? Infinity : (w / 2 + 2) / Math.abs(dx), dy === 0 ? Infinity : (h / 2 + 2) / Math.abs(dy));
  return [n.x + dx * t, n.y + dy * t];
}

/** The dot in a node's next field, where its arrow starts. */
const dotOf = (n) => [n.x + sizeOf(n).w / 2 - 8, n.y];

function edgePath(a, b, bend) {
  const { w: wa, h: ha } = sizeOf(a);
  const { w: wb, h: hb } = sizeOf(b);
  const [sx, sy] = dotOf(a);
  if (a.id === b.id) {                                         // a self-loop: up from the dot and back in from above
    const y = a.y - ha / 2;
    return `M ${sx} ${sy - 4} C ${sx + 18} ${y - 36}, ${a.x - wa / 2 - 14} ${y - 36}, ${a.x - wa / 4} ${y - 1}`;
  }
  const sameRow = Math.abs(a.y - b.y) < 4;
  if (sameRow && b.x > a.x) {
    const ex = b.x - wb / 2 - 2;
    if (!bend) return `M ${sx} ${sy} L ${ex} ${b.y}`;
    return `M ${sx} ${sy - 6} Q ${(sx + ex) / 2} ${a.y + bend * 2.2} ${b.x - wb / 4} ${b.y - hb / 2 - 2}`;
  }
  if (sameRow) {                                               // pointing back: dip under the nodes
    const ex = b.x + wb / 2 - 10, ey = b.y + hb / 2 + 2;
    return `M ${sx} ${sy + 4} C ${sx + 6} ${a.y + 40}, ${ex + 4} ${b.y + 42}, ${ex} ${ey}`;
  }
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const cx = mx + (-(b.y - a.y) / len) * (bend ?? 0) * 2, cy = my + ((b.x - a.x) / len) * (bend ?? 0) * 2;
  const [x1, y1] = exit(a, cx, cy);
  const [x2, y2] = exit(b, cx, cy);
  return bend ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function ListGraph({ width, height, nodes, edges, pointers = [], marks = [], pulse, snip, seq = 0, jump, label }) {
  const at = new Map(nodes.map((n) => [n.id, n]));
  const fromFresh = new Set(edges.filter((e) => e.fresh).map((e) => e.from));

  // which pointers moved since the last picture, so they hop instead of just appearing
  const last = useRef(new Map());
  const moved = new Set(pointers.filter((p) => last.current.has(p.name) && last.current.get(p.name) !== p.at).map((p) => p.name));
  useEffect(() => { last.current = new Map(pointers.map((p) => [p.name, p.at])); });

  const stackAt = new Map();
  const placed = pointers.filter((p) => at.has(p.at)).map((p) => {
    const k = stackAt.get(p.at) ?? 0;
    stackAt.set(p.at, k + 1);
    const n = at.get(p.at);
    return { ...p, x: n.x, y: n.y - sizeOf(n).h / 2 - 6 - k * 25 };
  });

  return (
    <div className={`${styles.stage} ${jump ? styles.jump : ''}`} style={{ width, height }} role="img" aria-label={label}>
      <svg className={styles.overlay} width={width} height={height} aria-hidden="true">
        <defs>
          {TONES.map((t) => (
            <marker key={t} id={`lg-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles[`head_${t}`]} />
            </marker>
          ))}
        </defs>
        {edges.map((e) => {
          const a = at.get(e.from), b = at.get(e.to);
          if (!a || !b) return null;
          const tone = e.tone ?? 'muted';
          return (
            <path
              key={e.fresh ? `${e.from}>${e.to}-${seq}` : `${e.from}>${e.to}`} d={edgePath(a, b, e.bend ?? 0)} markerEnd={`url(#lg-${tone})`}
              className={[styles.edge, styles[`edge_${tone}`], e.dashed && styles.dashed, e.fresh && styles.fresh].filter(Boolean).join(' ')}
            />
          );
        })}
      </svg>

      {nodes.map((n) => {
        const { w, h } = sizeOf(n);
        return (
          <div key={n.id} className={styles.slot} style={{ left: n.x - w / 2, top: n.y - h / 2, width: w, height: h }}>
            <div className={[styles.node, styles[`kind_${n.kind ?? 'node'}`], ...(n.cls ?? []).map((c) => styles[c])].filter(Boolean).join(' ')}>
              <span className={styles.val}>{n.label}</span>
              {n.kind !== 'null' && (
                <span className={styles.nextField} title="next">
                  <span key={fromFresh.has(n.id) ? `d${seq}` : 'd'} className={`${styles.dot} ${fromFresh.has(n.id) ? styles.dotFlash : ''}`} />
                </span>
              )}
            </div>
            {pulse === n.id && <span key={`p${seq}`} className={styles.pulse} aria-hidden="true" />}
          </div>
        );
      })}

      {marks.filter((m) => at.has(m.at)).map((m) => {
        const n = at.get(m.at);
        const Icon = m.icon;
        return (
          <span key={`m-${m.at}-${m.label}`} className={`${styles.mark} ${styles[`mark_${m.tone ?? 'success'}`]}`} style={{ left: n.x + sizeOf(n).w / 2 - 4, top: n.y + sizeOf(n).h / 2 - 6 }}>
            <Icon size={12} aria-hidden="true" /> {m.label}
          </span>
        );
      })}

      {snip && (
        <span key={`s${seq}`} className={styles.snip} style={{ left: snip.x, top: snip.y }} aria-hidden="true">
          <Scissors size={16} />
        </span>
      )}

      {placed.map((p) => {
        const Icon = p.icon;
        return (
          <span key={p.name} className={styles.token} style={{ left: p.x, top: p.y }}>
            <span key={moved.has(p.name) ? `${p.name}-${seq}` : p.name} className={`${styles.tokenBody} ${styles[`tone_${p.tone ?? 'accent'}`]} ${moved.has(p.name) ? (p.big ? styles.hopBig : styles.hop) : ''}`}>
              {Icon && <Icon size={16} strokeWidth={2.1} aria-hidden="true" />}
              {p.name}
            </span>
          </span>
        );
      })}
    </div>
  );
}
