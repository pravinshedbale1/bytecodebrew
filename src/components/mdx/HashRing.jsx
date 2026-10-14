import styles from './HashRing.module.css';

/**
 * Draws a consistent-hashing ring.
 *   servers: [{ id: 'A', pos: 10 }]  keys: [{ id: 'k1', pos: 25 }]
 * Positions are on a 0..max scale; each key is labelled with its owner
 * (the first server clockwise).
 */
export function HashRing({ servers, keys = [], max = 100, caption }) {
  const size = 340;
  const c = size / 2;
  const r = 120;

  const point = (pos, radius = r) => {
    const angle = (pos / max) * 2 * Math.PI - Math.PI / 2;
    return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)];
  };

  const sorted = [...servers].sort((a, b) => a.pos - b.pos);
  const ownerOf = (pos) => (sorted.find((s) => s.pos >= pos) ?? sorted[0]).id;

  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 0 ${size} ${size}`} className={styles.svg} role="img" aria-label="Hash ring">
        <circle cx={c} cy={c} r={r} className={styles.ring} />
        <text x={c} y={c - 6} className={styles.center}>
          hash space
        </text>
        <text x={c} y={c + 12} className={styles.centerSub}>
          0 → {max} (clockwise)
        </text>

        {keys.map((k) => {
          const [x, y] = point(k.pos);
          const [lx, ly] = point(k.pos, r - 30);
          return (
            <g key={k.id}>
              <circle cx={x} cy={y} r={5} className={styles.key} />
              <text x={lx} y={ly} className={styles.keyLabel}>
                {k.id}→{ownerOf(k.pos)}
              </text>
            </g>
          );
        })}

        {servers.map((s) => {
          const [x, y] = point(s.pos);
          const [lx, ly] = point(s.pos, r + 30);
          return (
            <g key={s.id}>
              <circle cx={x} cy={y} r={11} className={`${styles.server} ${s.added ? styles.added : ''}`} />
              <text x={x} y={y + 4} className={styles.serverId}>
                {s.id}
              </text>
              <text x={lx} y={ly + 4} className={styles.pos}>
                {s.pos}
              </text>
            </g>
          );
        })}
      </svg>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
