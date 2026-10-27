import styles from './hld.module.css';

/**
 * Boxes and links for architecture step-throughs, with requests travelling along the links.
 *
 *   nodes    [{ id, label, icon, x (0…1 of the width), y (px), tone, state: 'down' | 'new' | 'hot' | 'dim',
 *              note, meter: { value, max, label }, chips: [{ text, tone }] }]
 *   links    [{ from, to, tone, dashed }]
 *   packets  [{ from, to, label, tone, at }]   fly along their link in this step, `at` seconds in
 */
export function Topology({ nodes, links, packets = [], width, height, seq = 0, label }) {
  const W = Math.max(320, Math.min(width, 660));
  const at = new Map(nodes.map((n) => [n.id, { ...n, px: 16 + n.x * (W - 32) }]));
  return (
    <div className={styles.topo} style={{ width: W, height }} role="img" aria-label={label}>
      <svg className={styles.topoSvg} width={W} height={height} aria-hidden="true">
        {links.map((l) => {
          const a = at.get(l.from), b = at.get(l.to);
          if (!a || !b) return null;
          return <line key={`${l.from}-${l.to}`} x1={a.px} y1={a.y} x2={b.px} y2={b.y} className={`${styles.link} ${styles[`link_${l.tone ?? 'muted'}`]} ${l.dashed ? styles.dashedLine : ''}`} />;
        })}
      </svg>
      {[...at.values()].map((n) => {
        const Icon = n.icon;
        return (
          <div
            key={n.id}
            className={[styles.box, styles[`box_${n.tone ?? 'neutral'}`], n.state && styles[`state_${n.state}`]].filter(Boolean).join(' ')}
            style={{ left: n.px, top: n.y, minWidth: n.w ?? 74 }}
          >
            <div className={styles.boxHead}>
              {Icon && <Icon size={15} aria-hidden="true" />}
              <span>{n.label}</span>
            </div>
            {n.note && <div className={styles.boxNote}>{n.note}</div>}
            {n.meter && (
              <div className={styles.meter} title={n.meter.label}>
                <span style={{ width: `${Math.min(100, (n.meter.value / n.meter.max) * 100)}%` }} className={n.meter.value > n.meter.max * 0.8 ? styles.meterHot : undefined} />
              </div>
            )}
            {n.chips?.length > 0 && (
              <div className={styles.boxChips}>
                {n.chips.map((c) => <span key={c.text} className={`${styles.chip} ${styles[`chip_${c.tone ?? 'muted'}`]}`}>{c.text}</span>)}
              </div>
            )}
          </div>
        );
      })}
      {packets.map((p, k) => {
        const a = at.get(p.from), b = at.get(p.to);
        if (!a || !b) return null;
        return (
          <span
            key={`${seq}-${k}`} className={`${styles.packet} ${styles[`chip_${p.tone ?? 'accent'}`]}`}
            style={{ left: a.px, top: a.y, '--dx': `${b.px - a.px}px`, '--dy': `${b.y - a.y}px`, animationDelay: `${p.at ?? k * 0.12}s` }}
          >
            {p.label}
          </span>
        );
      })}
    </div>
  );
}
