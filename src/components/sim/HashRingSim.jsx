import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { SimFrame, Choice, Stat } from './SimFrame';
import { fnv1a, PALETTE, pct } from './simKit';
import styles from './Sim.module.css';

const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const KEYS = Array.from({ length: 400 }, (_, i) => ({ id: `user:${i}`, h: fnv1a(`user:${i}`) }));
const MAX = 2 ** 32;

/** Ring points for each server: `vnodes` hashed positions per server. */
function ringOf(servers, vnodes) {
  const points = [];
  for (const s of servers) for (let v = 0; v < vnodes; v++) points.push({ server: s, h: fnv1a(`${s}#${v}`) });
  return points.sort((a, b) => a.h - b.h);
}

function ownerOn(points, h) {
  let lo = 0;
  let hi = points.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].h < h) lo = mid + 1;
    else hi = mid;
  }
  return points[lo % points.length].server;
}

const assign = (servers, vnodes) => {
  const ring = ringOf(servers, vnodes);
  return KEYS.map((k) => ownerOn(ring, k.h));
};
const assignModulo = (servers) => KEYS.map((k) => servers[k.h % servers.length]);

/** Interactive consistent-hashing ring: add/remove servers, change virtual nodes, see the load and how many keys move. */
export function HashRingSim() {
  const [servers, setServers] = useState(['A', 'B', 'C', 'D']);
  const [vnodes, setVnodes] = useState(1);
  const [last, setLast] = useState(null);

  const ring = useMemo(() => ringOf(servers, vnodes), [servers, vnodes]);
  const owners = useMemo(() => assign(servers, vnodes), [servers, vnodes]);
  const color = (s) => PALETTE[NAMES.indexOf(s) % PALETTE.length];

  const change = (next, label) => {
    const before = assign(servers, vnodes);
    const after = assign(next, vnodes);
    const moved = before.filter((o, i) => o !== after[i]).length;
    const mb = assignModulo(servers);
    const ma = assignModulo(next);
    const movedMod = mb.filter((o, i) => o !== ma[i]).length;
    setLast({ label, moved, movedMod });
    setServers(next);
  };

  const add = () => {
    const name = NAMES.find((n) => !servers.includes(n));
    if (name) change([...servers, name], `Added server ${name}`);
  };
  const remove = (s) => servers.length > 1 && change(servers.filter((x) => x !== s), `Removed server ${s}`);

  const counts = Object.fromEntries(servers.map((s) => [s, 0]));
  owners.forEach((o) => { counts[o] += 1; });
  const ideal = KEYS.length / servers.length;
  const maxShare = Math.max(...Object.values(counts)) / KEYS.length;
  const scale = 100 / Math.max(maxShare * 1.15, 2 / servers.length);   // % of bar width per unit of share

  const size = 300;
  const c = size / 2;
  const at = (h, r) => {
    const a = (h / MAX) * 2 * Math.PI - Math.PI / 2;
    return [c + r * Math.cos(a), c + r * Math.sin(a)];
  };

  return (
    <SimFrame
      title="Consistent hashing ring"
      hint="400 keys, hashed onto the ring. Each key belongs to the first server point clockwise from it. Add or remove a server and compare how many keys move with how many modulo hashing would move. Then raise the virtual nodes and watch the load even out."
      footer={last ? (
        <p className={styles.note}>
          <strong>{last.label}:</strong> {last.moved} of {KEYS.length} keys moved ({pct(last.moved / KEYS.length)}).
          With <span className={styles.mono}>hash % n</span> it would have been {last.movedMod} keys ({pct(last.movedMod / KEYS.length)}).
        </p>
      ) : (
        <p className={styles.note}>Add or remove a server to see how many keys have to move.</p>
      )}
    >
      <div className={styles.row}>
        <Choice label="Virtual nodes per server" value={vnodes} options={[1, 3, 10, 50]} onChange={(v) => { setVnodes(v); setLast(null); }} />
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={add} disabled={servers.length >= NAMES.length}>
          <Plus size={12} /> Add server
        </button>
      </div>
      <div className={styles.split}>
        <svg viewBox={`0 0 ${size} ${size}`} className={styles.svg} role="img" aria-label={`Hash ring with ${servers.length} servers and ${vnodes} virtual nodes each`}>
          <circle cx={c} cy={c} r={120} fill="none" stroke="var(--color-border-strong)" strokeWidth="2" />
          {KEYS.map((k, i) => {
            const [x, y] = at(k.h, 104);
            return <circle key={k.id} cx={x} cy={y} r={2.2} fill={color(owners[i])} opacity="0.75" />;
          })}
          {ring.map((p) => {
            const [x, y] = at(p.h, 120);
            return <circle key={`${p.server}${p.h}`} cx={x} cy={y} r={vnodes > 10 ? 3.5 : 6} fill={color(p.server)} stroke="var(--color-surface)" strokeWidth="1.5" />;
          })}
          <text x={c} y={c - 4} textAnchor="middle" fill="var(--color-text)" fontSize="13" fontWeight="650">{servers.length} servers</text>
          <text x={c} y={c + 14} textAnchor="middle" fill="var(--color-text-subtle)" fontSize="11">{servers.length * vnodes} points on the ring</text>
        </svg>
        <div className={styles.bars}>
          {servers.map((s) => (
            <div key={s} className={styles.barRow} style={{ gridTemplateColumns: '112px minmax(0, 1fr) 64px' }}>
              <span style={{ whiteSpace: 'nowrap' }}>
                <span className={styles.dot} style={{ background: color(s) }} />Server {s}
                {servers.length > 1 && (
                  <button type="button" className={styles.btn} style={{ padding: '0 4px', marginLeft: 6 }} onClick={() => remove(s)} aria-label={`Remove server ${s}`}>
                    <X size={11} />
                  </button>
                )}
              </span>
              <span className={styles.barTrack}>
                <span className={styles.barFill} style={{ width: `${(counts[s] / KEYS.length) * scale}%`, background: color(s) }} />
                <span className={styles.ideal} style={{ left: `${(ideal / KEYS.length) * scale}%` }} title="Fair share" />
              </span>
              <span className={styles.mono}>{counts[s]} keys</span>
            </div>
          ))}
          <div className={styles.stats}>
            <Stat label="Fair share per server" value={pct(1 / servers.length)} />
            <Stat label="Busiest server" value={pct(maxShare)} tone={maxShare > 1.5 / servers.length ? 'bad' : 'good'} />
          </div>
        </div>
      </div>
    </SimFrame>
  );
}
