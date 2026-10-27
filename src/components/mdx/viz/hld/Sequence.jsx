import { Mail, Timer } from 'lucide-react';
import styles from './hld.module.css';

/**
 * An animated sequence diagram: one lane per actor, one row per message, newest at the bottom. The
 * message sent in this step flies across as an envelope while its arrow draws in; a stopwatch adds up
 * the time.
 *
 *   lanes  [{ id, label, icon }]
 *   rows   [{ from, to, label, sub, tone, at, note }]   messages so far; note rows sit on one lane
 *   live   index of the row being sent now, or several sent at once (or null);  total: rows in the whole run
 *          (keeps the height).  Narrow columns drop the lane icons.
 */
export function Sequence({ lanes, rows, live, total, clock, width, seq = 0, clockLabel = 'elapsed' }) {
  const W = Math.max(320, Math.min(width, 660));
  const gutter = 58;
  const colW = (W - gutter - 10) / lanes.length;
  const xOf = (id) => gutter + (lanes.findIndex((l) => l.id === id) + 0.5) * colW;
  const top = 74;
  const rowH = 36;
  const H = top + Math.max(total, rows.length) * rowH + 18;
  const lives = live === null || live === undefined ? [] : [].concat(live);
  const tight = colW < 76;
  return (
    <div className={styles.seq} style={{ width: W, height: H }} role="img" aria-label={`sequence: ${rows.map((r) => r.label).join(', ')}`}>
      <span className={styles.clock}><Timer size={13} aria-hidden="true" /> {clockLabel} {clock}</span>
      {lanes.map((l) => {
        const Icon = l.icon;
        return (
          <div key={l.id} className={`${styles.laneHead} ${tight ? styles.laneTight : ''}`} style={{ left: xOf(l.id), width: Math.min(colW - 6, 132) }}>
            {Icon && !tight && <Icon size={16} aria-hidden="true" />}
            <span>{l.label}</span>
          </div>
        );
      })}
      <svg className={styles.seqSvg} width={W} height={H} aria-hidden="true">
        <defs>
          {['accent', 'warn', 'note', 'interview', 'success', 'danger', 'muted'].map((t) => (
            <marker key={t} id={`sq-${t}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles[`fill_${t}`]} />
            </marker>
          ))}
        </defs>
        {lanes.map((l) => <line key={l.id} x1={xOf(l.id)} x2={xOf(l.id)} y1={top - 18} y2={H - 6} className={styles.lifeline} />)}
        {rows.map((r, k) => {
          if (r.note) return null;
          const y = top + k * rowH + 18;
          const x1 = xOf(r.from), x2 = xOf(r.to);
          const dir = x2 > x1 ? 1 : -1;
          const isLive = lives.includes(k);
          return (
            <g key={`${k}-${isLive ? seq : 'old'}`} className={`${styles.msg} ${styles[`msg_${r.tone ?? 'accent'}`]} ${isLive ? styles.msgLive : styles.msgOld}`}>
              <line x1={x1 + dir * 4} x2={x2 - dir * 6} y1={y} y2={y} markerEnd={`url(#sq-${r.tone ?? 'accent'})`} className={r.dashed ? styles.dashedLine : undefined} />
              <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle">{r.label}</text>
            </g>
          );
        })}
      </svg>
      {rows.map((r, k) => {
        const y = top + k * rowH + 18;
        return (
          <span key={`t${k}`} className={`${styles.stamp} ${lives.includes(k) ? styles.stampLive : ''}`} style={{ top: y - 8 }}>{r.at}</span>
        );
      })}
      {rows.map((r, k) => (r.note ? (
        <span key={`n${k}-${lives.includes(k) ? seq : 'o'}`} className={`${styles.note} ${styles[`chip_${r.tone ?? 'muted'}`]} ${lives.includes(k) ? styles.pop : ''}`} style={{ left: xOf(r.from), top: top + k * rowH + 8 }}>
          {r.label}
        </span>
      ) : null))}
      {rows.map((r, k) => (r.sub && !r.note ? (
        <span key={`s${k}`} className={styles.sub} style={{ left: Math.max(xOf(r.from), xOf(r.to)) + 8, top: top + k * rowH + 10 }}>{r.sub}</span>
      ) : null))}
      {lives.filter((k) => rows[k] && !rows[k].note).map((k) => (
        <span
          key={`env${seq}-${k}`} className={`${styles.envelope} ${styles[`chip_${rows[k].tone ?? 'accent'}`]}`}
          style={{ top: top + k * rowH + 18, '--x1': `${xOf(rows[k].from)}px`, '--x2': `${xOf(rows[k].to)}px` }}
        >
          <Mail size={13} aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}
