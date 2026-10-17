import { useEffect, useMemo, useRef } from 'react';
import { today, addDays, parseDay } from '../../lib/dates';
import styles from './Heatmap.module.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function level(n, steps) {
  if (!n) return 0;
  let l = 1;
  for (const s of steps) if (n >= s) l += 1;
  return Math.min(l, 4);
}

/**
 * A year of daily counts, one column per week (Sunday on top).
 *   data: { 'YYYY-MM-DD': number }   unit: 'activity' | 'submission'
 */
export function Heatmap({ data, unit = 'activity', steps = [3, 6, 10], weeks = 53 }) {
  const scroller = useRef(null);
  const end = today();

  const { columns, months, total, activeDays } = useMemo(() => {
    const last = parseDay(end);
    const first = addDays(end, -last.getDay() - (weeks - 1) * 7);   // the Sunday that starts the first column
    const cols = [];
    const labels = [];
    let sum = 0;
    let active = 0;
    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const day = addDays(first, w * 7 + d);
        if (day > end) {
          col.push(null);
          continue;
        }
        const n = data[day] ?? 0;
        sum += n;
        if (n) active += 1;
        col.push({ day, n });
        if (d === 0 && parseDay(day).getDate() <= 7) labels.push({ w, label: MONTHS[parseDay(day).getMonth()] });
      }
      cols.push(col);
    }
    return { columns: cols, months: labels, total: sum, activeDays: active };
  }, [data, end, weeks]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [columns]);

  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.scroller} ref={scroller}>
        <div className={styles.grid} style={{ '--weeks': weeks }} role="img" aria-label={`${plural(total, unit)} on ${plural(activeDays, 'day')} in the last year`}>
          <div className={styles.months} aria-hidden="true">
            {months.map((m) => (
              <span key={`${m.w}`} style={{ gridColumn: m.w + 1 }}>{m.label}</span>
            ))}
          </div>
          <div className={styles.cells}>
            {columns.map((col, w) =>
              col.map((c, d) =>
                c ? (
                  <span
                    key={c.day}
                    className={styles.cell}
                    data-level={level(c.n, steps)}
                    style={{ gridColumn: w + 1, gridRow: d + 1 }}
                    title={`${c.n ? plural(c.n, unit) : `No ${unit}s`} on ${parseDay(c.day).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  />
                ) : null,
              ),
            )}
          </div>
        </div>
      </div>
      <div className={styles.legend}>
        <span>{plural(total, unit)} · {plural(activeDays, 'active day')}</span>
        <span className={styles.scale} aria-hidden="true">
          Less
          {[0, 1, 2, 3, 4].map((l) => <span key={l} className={styles.cell} data-level={l} />)}
          More
        </span>
      </div>
    </div>
  );
}
