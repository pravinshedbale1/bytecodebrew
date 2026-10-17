import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { SimFrame, Stat } from './SimFrame';
import styles from './Sim.module.css';

const LIMIT = 5;          // requests
const WINDOW = 10;        // seconds
const RATE = LIMIT / WINDOW;
const VIEW = 15;          // seconds of history shown
const ALGOS = [
  { id: 'fixed', name: 'Fixed window' },
  { id: 'sliding', name: 'Sliding window log' },
  { id: 'bucket', name: 'Token bucket' },
];

/** Decide every request (sorted times) with each algorithm, from scratch. Deterministic and cheap for a few hundred requests. */
function simulate(times) {
  const out = { fixed: [], sliding: [], bucket: [] };
  const perWindow = new Map();
  const log = [];
  let tokens = LIMIT;
  let last = 0;
  for (const t of times) {
    const w = Math.floor(t / WINDOW);
    const n = perWindow.get(w) ?? 0;
    out.fixed.push(n < LIMIT);
    if (n < LIMIT) perWindow.set(w, n + 1);

    while (log.length && log[0] <= t - WINDOW) log.shift();
    const okSliding = log.length < LIMIT;
    out.sliding.push(okSliding);
    if (okSliding) log.push(t);

    tokens = Math.min(LIMIT, tokens + (t - last) * RATE);
    last = t;
    const okBucket = tokens >= 1;
    out.bucket.push(okBucket);
    if (okBucket) tokens -= 1;
  }
  return { out, tokensAt: (now) => Math.min(LIMIT, tokens + (now - last) * RATE), windowCount: (now) => perWindow.get(Math.floor(now / WINDOW)) ?? 0 };
}

/** The most requests accepted inside any 10-second span. */
function worstSpan(times, ok) {
  const acc = times.filter((_, i) => ok[i]);
  let best = 0;
  for (let i = 0, j = 0; j < acc.length; j++) {
    while (acc[j] - acc[i] >= WINDOW) i++;
    best = Math.max(best, j - i + 1);
  }
  return best;
}

/**
 * Three rate limiters (5 requests per 10 s) judging the same traffic: fixed window, sliding window
 * log and token bucket. Send requests by hand or play the "burst at the boundary" scenario.
 */
export function RateLimiterSim() {
  const [now, setNow] = useState(0);
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setNow((x) => Math.round((x + 0.1) * 10) / 10), 50);   // 2× real time
    return () => clearInterval(t);
  }, [running]);

  const send = (count, at = now) => {
    setRunning(true);
    setEvents((ev) => [...ev, ...Array.from({ length: count }, (_, k) => Math.round((at + k * 0.15) * 100) / 100)].sort((a, b) => a - b));
  };

  const boundaryBurst = () => {
    const nextBoundary = (Math.floor(now / WINDOW) + 1) * WINDOW;
    const start = nextBoundary - 1 < now + 0.5 ? nextBoundary + WINDOW - 1 : nextBoundary - 1;
    setRunning(true);
    setEvents((ev) => [
      ...ev,
      ...Array.from({ length: 5 }, (_, k) => Math.round((start + 0.2 + k * 0.15) * 100) / 100),
      ...Array.from({ length: 5 }, (_, k) => Math.round((start + 1.1 + k * 0.15) * 100) / 100),
    ].sort((a, b) => a - b));
  };

  const reset = () => { setRunning(false); setNow(0); setEvents([]); };

  const done = useMemo(() => events.filter((t) => t <= now), [events, now]);
  const sim = useMemo(() => simulate(done), [done]);

  const from = Math.max(0, now - VIEW);
  const W = 640;
  const rowH = 46;
  const left = 132;
  const x = (t) => left + ((t - from) / VIEW) * (W - left - 12);

  return (
    <SimFrame
      title="Rate limiters side by side"
      hint="Each row is the same limit — 5 requests per 10 seconds — implemented a different way. Every request you send is judged by all three. Try 'Burst at a window boundary': 10 requests in about 2 seconds, straddling a window edge."
      footer={
        <div className={styles.stats}>
          {ALGOS.map((a) => {
            const ok = sim.out[a.id];
            const accepted = ok.filter(Boolean).length;
            const worst = worstSpan(done, ok);
            return <Stat key={a.id} label={`${a.name}: most accepted in any 10 s`} value={`${worst} / ${LIMIT}`} tone={worst > LIMIT ? 'bad' : accepted ? 'good' : undefined} />;
          })}
        </div>
      }
    >
      <div className={styles.row}>
        <button type="button" className={styles.btn} onClick={() => setRunning((r) => !r)} aria-label={running ? 'Pause the clock' : 'Start the clock'}>
          {running ? <Pause size={12} /> : <Play size={12} />} {running ? 'Pause' : 'Start'}
        </button>
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => send(1)}>Send 1 request</button>
        <button type="button" className={styles.btn} onClick={() => send(5)}>Send 5 at once</button>
        <button type="button" className={styles.btn} onClick={boundaryBurst}><Zap size={12} /> Burst at a window boundary</button>
        <button type="button" className={styles.btn} onClick={reset} aria-label="Reset"><RotateCcw size={12} /></button>
        <span className={`${styles.mono} ${styles.muted}`}>t = {now.toFixed(1)} s</span>
      </div>

      <svg viewBox={`0 0 ${W} ${rowH * 3 + 26}`} className={styles.svg} role="img" aria-label="Accepted and rejected requests over time for each algorithm">
        {ALGOS.map((a, r) => {
          const y = 14 + r * rowH;
          const ok = sim.out[a.id];
          return (
            <g key={a.id}>
              <text x={0} y={y + 20} fill="var(--color-text)" fontSize="12" fontWeight="600">{a.name}</text>
              <rect x={left} y={y + 6} width={W - left - 12} height={26} rx={4} fill="var(--color-surface-muted)" />
              {a.id === 'fixed' && Array.from({ length: Math.ceil(VIEW / WINDOW) + 1 }, (_, k) => (Math.floor(from / WINDOW) + k) * WINDOW)
                .filter((b) => b > from && b <= now)
                .map((b) => <line key={b} x1={x(b)} x2={x(b)} y1={y + 2} y2={y + 36} stroke="var(--color-text-subtle)" strokeDasharray="3 3" />)}
              {done.map((t, i) => (t >= from ? (
                <circle key={`${t}-${i}`} cx={x(t)} cy={y + 19} r={3.4}
                  fill={ok[i] ? 'var(--color-success)' : 'var(--color-surface)'}
                  stroke={ok[i] ? 'var(--color-success)' : '#d4554a'} strokeWidth="2" />
              ) : null))}
            </g>
          );
        })}
        <text x={left} y={rowH * 3 + 22} fill="var(--color-text-subtle)" fontSize="10">{from.toFixed(0)} s</text>
        <text x={W - 12} y={rowH * 3 + 22} fill="var(--color-text-subtle)" fontSize="10" textAnchor="end">now</text>
      </svg>

      <div className={styles.legend}>
        <span><span className={styles.dot} style={{ background: 'var(--color-success)' }} />accepted</span>
        <span><span className={styles.dot} style={{ background: 'var(--color-surface)', border: '2px solid #d4554a' }} />rejected (429)</span>
        <span>dashed lines: fixed-window boundaries</span>
        <span>tokens in the bucket now: <strong className={styles.mono}>{sim.tokensAt(now).toFixed(1)}</strong> / {LIMIT}</span>
        <span>fixed-window count now: <strong className={styles.mono}>{sim.windowCount(now)}</strong> / {LIMIT}</span>
      </div>
    </SimFrame>
  );
}
