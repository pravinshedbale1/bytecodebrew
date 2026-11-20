import styles from './sideKit.module.css';

/**
 * Helper structures drawn in their real shape, beside the input of a step-through:
 *   <Pile />     a stack of plates, top at the top (push = drops in, pop = lifts off)
 *   <Lane />     a queue or deque, front on the left and back on the right
 *   <CmpCard />  the one comparison this step makes, and its outcome (two lines, so numbers never overflow)
 * Items are { id, main, sub?, tone? } with tone one of accent | warn | success | danger | muted.
 */

export function CmpCard({ q, a, tone = 'info', style }) {
  return (
    <div className={`${styles.card} ${styles[`card_${tone}`]}`} style={style} aria-live="off">
      <b>{q}</b>
      {a && <span>{a}</span>}
    </div>
  );
}

export const PLATE = 34;

/** A vertical stack. Absolutely positioned when `left`/`top` are given (inside a Stage), else in flow. */
export function Pile({ items, width = 124, depth, leaving, seq = 0, left, top, label, empty = 'empty' }) {
  const slots = Math.max(depth ?? items.length, items.length, 1) + 1;
  const h = slots * (PLATE + 4);
  const pos = left !== undefined ? { position: 'absolute', left, top } : {};
  return (
    <div className={styles.pileWrap} style={{ ...pos, width }}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.pile} style={{ height: h }}>
        {leaving && (
          <span key={`out-${leaving.id}-${seq}`} className={`${styles.plate} ${styles.leave} ${styles[`t_${leaving.tone ?? 'success'}`]}`} style={{ bottom: items.length * (PLATE + 4) }}>
            <b>{leaving.main}</b>{leaving.sub && <small>{leaving.sub}</small>}
          </span>
        )}
        {items.map((it, k) => (
          <span
            key={it.id}
            className={[styles.plate, k === items.length - 1 && styles.top, it.isNew && styles.drop, it.tone && styles[`t_${it.tone}`]].filter(Boolean).join(' ')}
            style={{ bottom: k * (PLATE + 4) }}
          >
            <b>{it.main}</b>{it.sub && <small>{it.sub}</small>}
          </span>
        ))}
        {!items.length && !leaving && <span className={styles.empty}>{empty}</span>}
      </div>
    </div>
  );
}

/** A queue / deque drawn left to right: front on the left, back on the right. */
export function Lane({ items, label, front = 'front', back = 'back', leaving, seq = 0, empty = 'empty' }) {
  return (
    <div className={styles.laneWrap}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.lane}>
        <span className={styles.end}>{front}</span>
        <div className={styles.cells}>
          {leaving && (
            <span key={`out-${leaving.id}-${seq}`} className={`${styles.cell} ${styles.leaveLeft} ${styles[`t_${leaving.tone ?? 'muted'}`]}`}>
              <b>{leaving.main}</b>{leaving.sub && <small>{leaving.sub}</small>}
            </span>
          )}
          {items.map((it) => (
            <span key={it.id} className={[styles.cell, it.isNew && styles.slideIn, it.tone && styles[`t_${it.tone}`]].filter(Boolean).join(' ')}>
              <b>{it.main}</b>{it.sub && <small>{it.sub}</small>}
            </span>
          ))}
          {!items.length && !leaving && <span className={styles.laneEmpty}>{empty}</span>}
        </div>
        <span className={styles.end}>{back}</span>
      </div>
    </div>
  );
}
