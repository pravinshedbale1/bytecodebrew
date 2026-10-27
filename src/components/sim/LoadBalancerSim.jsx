import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { SimFrame, Choice } from './SimFrame';
import { rng, quantile } from './simKit';
import styles from './Sim.module.css';
import lane from './LoadBalancerSim.module.css';

const SERVERS = 4;
const NAMES = ['A', 'B', 'C', 'D'];
const REQUESTS = 6000;
const FRAMES = 90;
const SHOWN = 8;            // dots drawn per line; the rest become "+n"
const ALGOS = [
  { id: 'rr', name: 'Take turns', tech: 'round robin', how: 'A, B, C, D, A… without looking' },
  { id: 'random', name: 'Pick at random', tech: 'random', how: 'any server, by chance' },
  { id: 'least', name: 'Least busy', tech: 'least outstanding requests', how: 'looks at all four, picks the shortest line' },
  { id: 'p2c', name: 'Best of two', tech: 'power of two choices', how: 'looks at two at random, picks the shorter line' },
];
const MIXES = {
  uniform: { label: 'All quick (10 ms)', sample: () => 10, mean: 10 },
  heavy: { label: 'Mostly quick, 1 in 10 slow', sample: (r) => (r() < 0.1 ? 100 : 5), mean: 14.5 },
};

/**
 * Same arrivals and service times for every strategy; each server serves one request at a time, in
 * order (a line at a counter). Returns the response times, plus who was in each server's line at
 * FRAMES moments of a short window, for the animation.
 */
function simulate(algo, mixId, load, seed) {
  const mix = MIXES[mixId];
  const traffic = rng(seed);
  const choice = rng(seed * 7 + 3);
  const rate = (load * SERVERS) / mix.mean;          // arrivals per ms
  const busyUntil = new Array(SERVERS).fill(0);
  const finishes = Array.from({ length: SERVERS }, () => []);
  const lineLength = (s, t) => {
    const q = finishes[s];
    while (q.length && q[0] <= t) q.shift();
    return q.length;
  };
  const latencies = [];
  const reqs = [];
  let t = 0;
  for (let k = 0; k < REQUESTS; k++) {
    t += -Math.log(1 - traffic()) / rate;            // Poisson arrivals
    const service = mix.sample(traffic);
    let s;
    if (algo === 'rr') s = k % SERVERS;
    else if (algo === 'random') s = Math.floor(choice() * SERVERS);
    else if (algo === 'least') {
      s = 0;
      for (let j = 1; j < SERVERS; j++) if (lineLength(j, t) < lineLength(s, t)) s = j;
    } else {
      const a = Math.floor(choice() * SERVERS);
      let b = Math.floor(choice() * (SERVERS - 1));
      if (b >= a) b += 1;
      s = lineLength(a, t) <= lineLength(b, t) ? a : b;
    }
    const start = Math.max(t, busyUntil[s]);
    const end = start + service;
    busyUntil[s] = end;
    finishes[s].push(end);
    reqs.push({ arrive: t, start, end, s, slow: service > 50 });
    latencies.push(end - t);
  }
  // the animation window: about 300 arrivals, after the servers have warmed up
  const t0 = reqs[1500].arrive;
  const span = 300 / rate;
  const near = reqs.filter((r) => r.end > t0 && r.arrive < t0 + span);
  const frames = Array.from({ length: FRAMES }, (_, f) => {
    const at = t0 + (span * f) / (FRAMES - 1);
    const lines = Array.from({ length: SERVERS }, () => []);
    for (const r of near) if (r.arrive <= at && at < r.end) lines[r.s].push(r);
    return lines.map((l) => l.sort((x, y) => x.start - y.start).map((r) => ({ slow: r.slow, serving: r.start <= at })));
  });
  let longest = 0;
  for (const fr of frames) for (const l of fr) longest = Math.max(longest, l.length);
  return { typical: quantile(latencies, 0.5), unlucky: quantile(latencies, 0.99), frames, longest, span };
}

function Lane({ algo, r, frame, worst, best }) {
  const lines = r.frames[frame];
  return (
    <div className={`${lane.lane} ${best ? lane.best : ''}`}>
      <div className={lane.head}>
        <b>{algo.name}</b>
        {best && <span className={lane.trophy}><Trophy size={12} aria-hidden="true" /> best</span>}
      </div>
      <p className={lane.how}>{algo.how} <span>({algo.tech})</span></p>
      <div className={lane.counters} aria-label={`lines now: ${lines.map((l, k) => `${NAMES[k]} ${l.length}`).join(', ')}`}>
        {lines.map((l, k) => (
          <div key={k} className={lane.counter}>
            <div className={lane.stack}>
              {l.slice(0, SHOWN).map((d, j) => (
                <i key={j} className={[lane.dot, d.slow && lane.slow, d.serving && lane.serving].filter(Boolean).join(' ')} />
              ))}
              {l.length > SHOWN && <span className={lane.more}>+{l.length - SHOWN}</span>}
            </div>
            <span className={lane.name}>{NAMES[k]}</span>
          </div>
        ))}
      </div>
      <div className={lane.result}>
        <span>typical <b>{r.typical.toFixed(0)} ms</b></span>
        <span>unlucky 1 in 100 <b>{r.unlucky.toFixed(0)} ms</b></span>
      </div>
      <span className={lane.meter}><i style={{ width: `${(r.unlucky / worst) * 100}%` }} /></span>
    </div>
  );
}

/** Four strategies race on the same traffic: watch the lines at each server, then compare the unlucky waits. */
export function LoadBalancerSim() {
  const [mix, setMix] = useState('heavy');
  const [load, setLoad] = useState(0.8);
  const [seed, setSeed] = useState(1);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const results = useMemo(() => ALGOS.map((a) => simulate(a.id, mix, load, seed)), [mix, load, seed]);
  const worst = Math.max(...results.map((r) => r.unlucky));
  const bestAt = results.reduce((b, r, k) => (r.unlucky < results[b].unlucky ? k : b), 0);

  useEffect(() => { setFrame(0); setPlaying(false); }, [mix, load, seed]);
  useEffect(() => {
    if (!playing) return undefined;
    if (frame >= FRAMES - 1) { setPlaying(false); return undefined; }
    const t = setTimeout(() => setFrame((f) => f + 1), 110);
    return () => clearTimeout(t);
  }, [playing, frame]);

  const ms = Math.round((results[0].span * frame) / (FRAMES - 1));
  return (
    <SimFrame
      title="Four ways to pick a server, racing"
      hint="Four servers (A–D), each serving one request at a time while the rest wait in line. All four strategies get exactly the same requests. Press play and watch where the lines build up. Each dot is a request; the bottom one is being served."
      footer={<p className={styles.note}><strong>{ALGOS[bestAt].name}</strong> keeps the unlucky wait shortest here. {mix === 'uniform'
        ? 'When every request takes the same time, simply taking turns already spreads the work evenly; picking at random is worst, because by chance it sometimes sends several requests to the same server in a row.'
        : 'When a few requests are slow (the orange dots), strategies that don\'t look keep sending people to a server stuck behind a slow one, so a line builds up. Strategies that check the lines avoid it, and checking just two servers gets most of the benefit.'}</p>}
    >
      <div className={styles.row}>
        <Choice label="Requests" value={mix} options={Object.entries(MIXES).map(([k, v]) => [k, v.label])} onChange={setMix} />
        <Choice label="How busy" value={load} options={[[0.6, 'Calm'], [0.8, 'Busy'], [0.95, 'Packed']]} onChange={setLoad} />
      </div>
      <div className={lane.player}>
        <button type="button" className={`${styles.btn} ${lane.play}`} onClick={() => { if (frame >= FRAMES - 1) setFrame(0); setPlaying((p) => !p); }} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={14} aria-hidden="true" /> : frame >= FRAMES - 1 ? <RotateCcw size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          {playing ? 'Pause' : frame >= FRAMES - 1 ? 'Replay' : 'Play'}
        </button>
        <input
          type="range" min={0} max={FRAMES - 1} value={frame} className={lane.scrub} aria-label="time"
          onChange={(e) => { setPlaying(false); setFrame(Number(e.target.value)); }}
        />
        <span className={lane.clock}>{ms} ms</span>
        <button type="button" className={styles.btn} onClick={() => setSeed((x) => x + 1)}><Shuffle size={12} aria-hidden="true" /> New traffic</button>
      </div>
      <div className={lane.lanes}>
        {ALGOS.map((a, k) => <Lane key={a.id} algo={a} r={results[k]} frame={frame} worst={worst} best={k === bestAt} />)}
      </div>
      <p className={lane.key}>
        <i className={lane.dot} /> quick request <i className={`${lane.dot} ${lane.slow}`} /> slow request <i className={`${lane.dot} ${lane.serving}`} /> being served ·
        {' '}<b>unlucky 1 in 100</b> = 99% of requests finished faster than this (the &ldquo;p99&rdquo; in interviews)
      </p>
    </SimFrame>
  );
}
