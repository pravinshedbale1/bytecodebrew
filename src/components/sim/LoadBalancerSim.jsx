import { useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { SimFrame, Choice } from './SimFrame';
import { rng, quantile } from './simKit';
import styles from './Sim.module.css';

const SERVERS = 4;
const REQUESTS = 6000;
const ALGOS = [
  ['rr', 'Round robin'],
  ['random', 'Random'],
  ['least', 'Least outstanding'],
  ['p2c', 'Power of two choices'],
];
const MIXES = {
  uniform: { label: 'Every request 10 ms', sample: () => 10, mean: 10 },
  heavy: { label: '90% take 5 ms, 10% take 100 ms', sample: (r) => (r() < 0.1 ? 100 : 5), mean: 14.5 },
};

/** Same arrivals and service times for every algorithm; each server serves one request at a time (FIFO). */
function simulate(algo, mixId, load, seed) {
  const mix = MIXES[mixId];
  const traffic = rng(seed);
  const choice = rng(seed * 7 + 3);
  const rate = (load * SERVERS) / mix.mean;          // arrivals per ms
  const busyUntil = new Array(SERVERS).fill(0);
  const finishes = Array.from({ length: SERVERS }, () => []);
  const outstanding = (s, t) => {
    const q = finishes[s];
    while (q.length && q[0] <= t) q.shift();
    return q.length;
  };
  const latencies = [];
  const served = new Array(SERVERS).fill(0);
  let t = 0;
  for (let k = 0; k < REQUESTS; k++) {
    t += -Math.log(1 - traffic()) / rate;            // Poisson arrivals
    const service = mix.sample(traffic);
    let s;
    if (algo === 'rr') s = k % SERVERS;
    else if (algo === 'random') s = Math.floor(choice() * SERVERS);
    else if (algo === 'least') {
      s = 0;
      for (let j = 1; j < SERVERS; j++) if (outstanding(j, t) < outstanding(s, t)) s = j;
    } else {
      const a = Math.floor(choice() * SERVERS);
      let b = Math.floor(choice() * (SERVERS - 1));
      if (b >= a) b += 1;
      s = outstanding(a, t) <= outstanding(b, t) ? a : b;
    }
    const start = Math.max(t, busyUntil[s]);
    const end = start + service;
    busyUntil[s] = end;
    finishes[s].push(end);
    served[s] += 1;
    latencies.push(end - t);
  }
  return { p50: quantile(latencies, 0.5), p99: quantile(latencies, 0.99), max: Math.max(...latencies), served };
}

/** Compare load-balancing algorithms on the same simulated traffic: who keeps the tail latency down? */
export function LoadBalancerSim() {
  const [mix, setMix] = useState('heavy');
  const [load, setLoad] = useState(0.8);
  const [seed, setSeed] = useState(1);
  const results = useMemo(() => ALGOS.map(([id, name]) => ({ id, name, ...simulate(id, mix, load, seed) })), [mix, load, seed]);
  const worst = Math.max(...results.map((r) => r.p99));
  const best = results.reduce((a, b) => (b.p99 < a.p99 ? b : a));

  return (
    <SimFrame
      title="Load-balancing algorithms under load"
      hint={`${REQUESTS.toLocaleString()} requests arrive at random and are spread over ${SERVERS} servers, each handling one request at a time. Every algorithm sees exactly the same traffic. Compare the 99th-percentile latency, then change the mix and the load.`}
      footer={<p className={styles.note}><strong>{best.name}</strong> has the lowest p99 here ({best.p99.toFixed(0)} ms). {mix === 'uniform'
        ? 'When every request costs the same, round robin already spreads work almost perfectly without knowing anything about the servers; random is worst because it piles requests up by chance.'
        : 'When some requests are much slower, blind algorithms (round robin, random) keep sending work to a server stuck behind a slow request. Algorithms that check how busy servers are avoid that queue, and power of two choices gets most of the benefit by looking at just two servers.'}</p>}
    >
      <div className={styles.row}>
        <Choice label="Requests" value={mix} options={Object.entries(MIXES).map(([k, v]) => [k, v.label])} onChange={setMix} />
        <Choice label="Server utilisation" value={load} options={[[0.6, '60%'], [0.8, '80%'], [0.95, '95%']]} onChange={setLoad} />
        <button type="button" className={styles.btn} onClick={() => setSeed((x) => x + 1)}><Shuffle size={12} /> New random traffic</button>
      </div>
      <div className={styles.bars}>
        {results.map((r) => (
          <div key={r.id} className={styles.barRow} style={{ gridTemplateColumns: '150px minmax(0, 1fr) 90px' }}>
            <span>{r.name}</span>
            <span className={styles.barTrack}>
              <span className={styles.barFill} style={{ width: `${(r.p99 / worst) * 100}%`, background: r.id === best.id ? 'var(--color-success)' : 'var(--color-accent)' }} />
            </span>
            <span className={styles.mono}>p99 {r.p99.toFixed(0)} ms</span>
          </div>
        ))}
      </div>
      <div className={styles.scroll}><table className={styles.table}>
        <thead><tr><th>Algorithm</th><th>p50</th><th>p99</th><th>Worst</th><th>Requests per server</th></tr></thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.p50.toFixed(0)} ms</td>
              <td><strong>{r.p99.toFixed(0)} ms</strong></td>
              <td>{r.max.toFixed(0)} ms</td>
              <td className={styles.mono}>{r.served.join(' / ')}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </SimFrame>
  );
}
