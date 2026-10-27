import styles from './prims.module.css';

/**
 * Building blocks for the step-through stages. A stage is a position: relative box (<Stage>) with
 * absolutely placed parts, so values can slide between cells and ranges can grow and shrink smoothly.
 */

export const GAP = 6;

/** Cell pitch (width + gap) for n cells in the available width. */
export const pitchFor = (width, n, min = 36, max = 64) => Math.max(min, Math.min(max, Math.floor(width / Math.max(1, n))));

export function Stage({ width, height, jump, children, label }) {
  return (
    <div className={`${styles.stage} ${jump ? styles.jump : ''}`} style={{ width, height }} role="img" aria-label={label}>
      {children}
    </div>
  );
}

/** Height an ArrayStrip needs below its cell top: cells, then index labels, then a sub-label row. */
export const stripBelow = ({ h = 46, index = true, sub = false } = {}) => h + (index ? 24 : 6) + (sub ? 24 : 0);

/**
 * A row of array cells.
 *   items     plain values, or [{ v, id }]: with ids a value that changes index slides to its new cell
 *   x0, y     left edge and top of the cells; pitch = cell width + GAP; h = cell height
 *   cls(k, item)    space-separated cell styles: cur target home hit dim bad kept muted note warm
 *   tags      { [k]: [{ label, tone }] } pointer tags hanging from the cell's bottom edge
 *   badge(k, item)  { text, tone } in the top-left corner;  check(k, item) → ✓ in the top-right
 *   index     index labels under the cells (indexLabel(k) to change them)
 *   sub(k)    { text, tone } small dashed box under the index
 *   bands     [{ from, to, tone, label }] shaded ranges behind the cells
 *   flight    { up, down } item ids that travel over / under the row when they move; seq re-runs it
 */
export function ArrayStrip({
  items, x0 = 0, y, pitch, h = 46, cls, tags = {}, badge, check, index = true, indexLabel, sub, bands = [], flight, seq = 0, mono = true,
}) {
  const list = items.map((it, k) => (it !== null && typeof it === 'object' && 'v' in it ? it : { v: it, id: k }));
  const pos = new Map(list.map((it, k) => [it.id, k]));
  const ordered = [...list].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const w = pitch - GAP;
  return (
    <>
      {bands.map((b, k) => (
        <div
          key={`band-${k}-${b.tone}`} className={`${styles.band} ${styles[`band_${b.tone ?? 'accent'}`]}`}
          style={{ left: x0 + b.from * pitch + 1, width: Math.max(0, (b.to - b.from + 1) * pitch - 2), top: y - 7, height: h + 14 }}
        >
          {b.label && <span className={styles.bandLabel}>{b.label}</span>}
        </div>
      ))}
      {ordered.map((it) => {
        const k = pos.get(it.id);
        const fly = flight && (it.id === flight.up || it.id === flight.down);
        const b = badge?.(k, it);
        return (
          <div key={it.id} className={styles.slot} style={{ transform: `translateX(${x0 + k * pitch + GAP / 2}px)`, top: y, width: w, height: h }}>
            <div
              key={fly ? `${it.id}-${seq}` : 'still'}
              className={[styles.cell, mono && styles.mono, ...(cls?.(k, it) ?? '').split(' ').filter(Boolean).map((c) => styles[c]), fly && (it.id === flight.up ? styles.flyUp : styles.flyDown)].filter(Boolean).join(' ')}
            >
              <span className={styles.value}>{String(it.v)}</span>
              {check?.(k, it) && <span className={styles.check} aria-label="done">✓</span>}
              {b && <span className={`${styles.badge} ${styles[`t_${b.tone ?? 'danger'}`]}`}>{b.text}</span>}
            </div>
          </div>
        );
      })}
      {list.map((_, k) => {
        const t = tags[k] ?? [];
        const s = sub?.(k);
        return (
          <div key={`under-${k}`} className={styles.under} style={{ left: x0 + k * pitch, width: pitch }}>
            {t.length > 0 && (
              <span className={styles.tags} style={{ top: y + h - 8 }}>
                {t.map((tg) => <span key={tg.label} className={`${styles.tag} ${styles[`tag_${tg.tone ?? 'accent'}`]}`}>{tg.label}</span>)}
              </span>
            )}
            {index && <span className={styles.idx} style={{ top: y + h + 10 }}>{indexLabel ? indexLabel(k) : k}</span>}
            {s && <span className={`${styles.sub} ${s.tone ? styles[`sub_${s.tone}`] : ''}`} style={{ top: y + h + (index ? 26 : 8) }}>{s.text}</span>}
          </div>
        );
      })}
    </>
  );
}

const MARK_TONES = ['accent', 'warn', 'danger', 'success', 'muted', 'note', 'interview'];

/** Arrow-head markers for <Arcs> and <Brackets>; render once per stage SVG. */
export function Markers({ id }) {
  return (
    <defs>
      {MARK_TONES.map((t) => (
        <marker key={t} id={`${id}-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className={styles[`head_${t}`]} />
        </marker>
      ))}
    </defs>
  );
}

/**
 * Curved arrows between x positions: [{ x1, x2, y, depth, tone, label, dashed, faded }].
 * depth < 0 bulges upwards (label above the peak), > 0 downwards (label below).
 */
export function Arcs({ id, width, height, arcs, lines = [] }) {
  return (
    <svg className={styles.overlay} width={width} height={height} aria-hidden="true">
      <Markers id={id} />
      {lines.map((l, k) => (
        <g key={`l${k}`} className={`${styles.arc} ${styles[`arc_${l.tone ?? 'muted'}`]} ${l.dashed ? styles.dashed : ''}`}>
          <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} markerEnd={l.head ? `url(#${id}-${l.tone ?? 'muted'})` : undefined} />
          {l.label && <text x={l.lx ?? l.x2} y={l.ly ?? l.y2 - 6} textAnchor={l.anchor ?? 'middle'}>{l.label}</text>}
        </g>
      ))}
      {arcs.map((a, k) => {
        const mx = (a.x1 + a.x2) / 2;
        const peak = a.y + a.depth / 2;
        const ly = a.depth < 0 ? peak - 7 : peak + 15;
        return (
          <g key={k} className={`${styles.arc} ${styles[`arc_${a.tone ?? 'accent'}`]} ${a.dashed ? styles.dashed : ''} ${a.faded ? styles.faded : ''}`}>
            <path d={`M ${a.x1} ${a.y} Q ${mx} ${a.y + a.depth} ${a.x2} ${a.y}`} markerEnd={a.head === false ? undefined : `url(#${id}-${a.tone ?? 'accent'})`} />
            {a.label && <text x={mx} y={ly} textAnchor="middle">{a.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Square brackets spanning cells: [{ x1, x2, y, tone, label, up }] (up: opens upwards, label above). */
export function Brackets({ width, height, brackets }) {
  return (
    <svg className={styles.overlay} width={width} height={height} aria-hidden="true">
      {brackets.map((b, k) => {
        const d = b.up ? -6 : 6;
        return (
          <g key={k} className={`${styles.arc} ${styles[`arc_${b.tone ?? 'accent'}`]} ${b.faded ? styles.faded : ''}`}>
            <path d={`M ${b.x1} ${b.y - d} L ${b.x1} ${b.y} L ${b.x2} ${b.y} L ${b.x2} ${b.y - d}`} />
            {b.label && <text x={(b.x1 + b.x2) / 2} y={b.up ? b.y - 5 : b.y + 13} textAnchor="middle">{b.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** A labelled row of chips under a stage, such as a hash map's entries: [{ key, text, tone, isNew, note }]. */
export function Chips({ label, chips, seq = 0, empty = 'empty' }) {
  return (
    <div className={styles.chipRow}>
      {label && <span className={styles.chipLabel}>{label}</span>}
      {chips.length === 0 && <span className={styles.chipEmpty}>{empty}</span>}
      {chips.map((c) => (
        <span key={c.isNew ? `${c.key}-${seq}` : c.key} className={`${styles.chip} ${c.tone ? styles[`chip_${c.tone}`] : ''} ${c.isNew ? styles.pop : ''}`}>
          {c.text}
          {c.note && <span className={styles.chipNote}>{c.note}</span>}
        </span>
      ))}
    </div>
  );
}

/** A small label centred on x (a pointer's question, a running total); anchor="right" pins it to the stage's right edge. */
export function Float({ x, y, tone = 'accent', anchor = 'center', children }) {
  const pos = anchor === 'right' ? { right: 0, top: y, transform: 'none' } : { left: x, top: y };
  return <span className={`${styles.float} ${styles[`float_${tone}`]}`} style={pos}>{children}</span>;
}

/** A small caption for a row of cells ("p (on the boundaries)", "count[v]"). */
export function RowLabel({ x = 0, y, children }) {
  return <span className={styles.rowLabel} style={{ left: x, top: y }}>{children}</span>;
}
