import { Database, FileBarChart, FileText, HeartPulse, Network, Search, Server, ServerCrash, User } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Topology } from './hld/Topology';
import styles from './hld/scaling.module.css';
import {
  BALANCER, JOBS, REQUESTS, SERVERS, SESSIONS, WEIGHT, balancer, balancerCode, sessions, sessionsCode,
} from './models/hldScaling';

/**
 * Step-throughs for the HLD Scaling Compute module:
 *   <SessionsViz />   sessions in server memory vs a shared store: a crash, sticky routing, scaling out
 *   <BalancerViz />   round robin, least connections, weights, IP hash and health checks, request by request:
 *                     people send requests, the balancer says where each goes, servers juggle their jobs
 */

// ---------------------------------------------------------------- sessions

function SessionsStage({ step: f, width, seq }) {
  const ids = Object.keys(f.servers);
  const narrow = width < 480;
  const focus = f.packets.find((p) => p.from === 'lb')?.to;
  const nodes = [
    { id: 'alice', label: 'Alice', icon: User, x: 0.27, y: 22, w: 64 },
    { id: 'bob', label: 'Bob', icon: User, x: 0.73, y: 22, w: 64 },
    { id: 'lb', label: 'Load balancer', icon: Network, x: 0.5, y: 98, note: f.shared ? 'round robin' : 'sticky: same user → same server' },
    ...ids.map((k, j) => {
      const s = f.servers[k];
      return {
        id: k, label: narrow ? k : `Server ${k}`, icon: Server, x: (j + 0.5) / ids.length, y: 192, w: narrow ? 56 : 84,
        note: !s.up ? 'crashed' : f.shared ? 'stateless' : s.chips.length ? 'RAM:' : 'RAM: empty',
        state: !s.up ? 'down' : s.isNew ? 'new' : focus === k ? 'focus' : undefined,
        chips: s.chips,
      };
    }),
    ...(f.shared ? [{ id: 'store', label: 'Redis: sessions', icon: Database, x: 0.5, y: 294, tone: 'success', chips: f.store, w: 120 }] : []),
  ];
  const links = [
    { from: 'alice', to: 'lb' }, { from: 'bob', to: 'lb' },
    ...ids.map((k) => ({ from: 'lb', to: k, tone: focus === k ? 'accent' : 'muted', dashed: !f.servers[k].up })),
    ...(f.shared ? ids.map((k) => ({ from: k, to: 'store', tone: 'success', dashed: true })) : []),
  ];
  return <Topology nodes={nodes} links={links} packets={f.packets} width={width} height={f.shared ? 336 : 248} seq={seq} label="users, load balancer, app servers" />;
}

const sessionsSpec = {
  title: 'Where does session state live?',
  examples: SESSIONS,
  simulate: sessions,
  code: (input) => sessionsCode[input.mode],
  kinds: {
    start: ['Setup', 'neutral'], login: ['Log in', 'accent'], sticky: ['Sticky', 'warn'], any: ['Any server', 'success'],
    crash: ['Crash', 'danger'], fail: ['Logged out', 'danger'], scale: ['Scale out', 'success'], done: ['So…', 'success'],
  },
  describe: (input) => (input.mode === 'shared' ? 'stateless servers + a shared store' : 'sessions in each server\'s RAM'),
  rule: (input) => (input.mode === 'shared' ? 'No server holds state, so any server can take any request.' : 'A user must keep going back to the server that holds their session.'),
  stats: (f) => [['servers up', Object.values(f.servers).filter((s) => s.up).length]],
  legend: (f) => [
    [<Key shape="box" tone={f.shared ? 'success' : 'accent'}>Bob ✓</Key>, f.shared ? 'session in the shared store' : 'session in this server\'s RAM'],
    [<Key shape="box" tone="danger">down</Key>, 'crashed server'],
  ],
  delay: () => 3600,
  Stage: SessionsStage,
};

export function SessionsViz(props) {
  return <StepViz spec={sessionsSpec} {...props} />;
}

// ---------------------------------------------------------------- load balancing

const PERSON_TONE = { Asha: 'accent', Ben: 'note', Chen: 'interview', Dev: 'warn' };
const JOB_ICON = { S: FileText, M: Search, L: FileBarChart };
const LOAD = [['idle', 'calm'], ['busy', 'ok'], ['very busy', 'warm'], ['overloaded', 'hot']];
const MAX_WORK = 19;      // the most work any server gets in any example, so the bars compare across examples

function Avatar({ who, size = 22 }) {
  return <span className={`${styles.avatar} ${styles[`t_${PERSON_TONE[who]}`]}`} style={{ width: size, height: size, fontSize: size * 0.48 }} title={who}>{who[0]}</span>;
}

function ServerCard({ s, f, health, narrow }) {
  const jobs = f.jobs[s];
  const done = f.done.filter((d) => d.server === s);
  const down = f.crashed.includes(s);
  const out = f.out.includes(s);
  const [load, tone] = LOAD[Math.min(3, jobs.length)];
  const status = out ? (down ? 'down · taken out' : 'restarted · waiting') : down ? 'crashed!' : f.kind === 'back' && s === 'B' ? 'back in' : load;
  const Icon = down ? ServerCrash : Server;
  return (
    <div className={[styles.card, styles[`load_${down || out ? 'down' : tone}`], f.pick === s && styles.cardPick, f.final && f.work[s] === Math.max(...SERVERS.map((x) => f.work[x])) && styles.cardMost].filter(Boolean).join(' ')}>
      <div className={styles.cardHead}>
        <Icon size={narrow ? 14 : 16} aria-hidden="true" />
        <b>{narrow ? s : `Server ${s}`}</b>
        {f.weighted && <span className={styles.weight}>×{WEIGHT[s]}</span>}
      </div>
      <span key={status} className={`${styles.status} ${styles.pop}`}>{status}</span>
      {health && (
        <div className={styles.checks} title="health checks, one per second (newest on the right)">
          <HeartPulse size={12} aria-hidden="true" />
          {f.checks[s].slice(-4).map((ok, k) => <i key={k} className={ok ? styles.ok : styles.miss}>{ok ? '✓' : '✗'}</i>)}
        </div>
      )}
      <div className={styles.jobs}>
        {jobs.map((j) => {
          const JobIcon = JOB_ICON[j.size];
          return (
            <span key={j.id} className={`${styles.job} ${j.id === f.req?.id ? styles.jobNew : ''}`} title={`${j.who}'s ${JOBS[j.size].label}: ${j.left} s left`}>
              <Avatar who={j.who} size={narrow ? 16 : 18} />
              {!narrow && <JobIcon size={12} aria-hidden="true" />}
              <span className={styles.jobLabel}>{JOBS[j.size].label}</span>
              <span className={styles.timeLeft}><i style={{ width: `${(j.left / j.total) * 100}%` }} /></span>
              <small>{j.left}s</small>
            </span>
          );
        })}
        {done.map((d) => <span key={`d${d.id}`} className={styles.jobDone}>✓ {d.who}&rsquo;s {JOBS[d.size].label}</span>)}
        {jobs.length === 0 && done.length === 0 && <span className={styles.free}>{down ? 'not answering' : 'free'}</span>}
      </div>
      <div className={styles.work}>
        <span>work so far</span>
        <span className={styles.workBar}><i style={{ width: `${(f.work[s] / MAX_WORK) * 100}%` }} /></span>
        <b>{f.work[s]} s</b>
      </div>
    </div>
  );
}

function BalancerStage({ step: f, input, width, seq }) {
  const W = Math.max(300, Math.min(width, 640));
  const narrow = W < 470;
  const health = input.algo === 'health';
  const placed = new Set(f.bars.map((b) => b.id));
  const now = f.req?.id;
  const col = (s) => ((SERVERS.indexOf(s) + 0.5) / SERVERS.length) * 100;
  const target = f.bounce ? f.bounce.to : f.pick;
  return (
    <div className={styles.lb} style={{ width: W }}>
      <div className={styles.queue} aria-label="requests, one per second">
        {REQUESTS.map(([who, size], k) => {
          const id = `#${k + 1}`;
          const JobIcon = JOB_ICON[size];
          const state = id === now ? styles.qNow : placed.has(id) ? styles.qGone : styles.qWait;
          return (
            <span key={id} className={`${styles.q} ${state}`} title={`${who}: ${JOBS[size].name} (${JOBS[size].secs} s)`}>
              <Avatar who={who} size={narrow ? 20 : 24} />
              {!narrow && <JobIcon size={12} aria-hidden="true" />}
            </span>
          );
        })}
      </div>
      <div className={styles.hub}>
        <span className={styles.lbBox}><Network size={16} aria-hidden="true" /> Load balancer</span>
        <span key={seq} className={`${styles.bubble} ${styles.pop}`}>{f.say}</span>
      </div>
      <div className={styles.routes}>
        <svg viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
          {SERVERS.map((s) => {
            const x = col(s) * 3;
            const on = s === target;
            const bad = f.bounce?.from === s;
            return <line key={s} x1="150" y1="0" x2={x} y2="40" className={on ? styles.routeOn : bad ? styles.routeBad : styles.route} />;
          })}
        </svg>
        {f.req && (
          <span
            key={`fly${seq}`}
            className={`${styles.token} ${f.bounce ? styles.tokenBounce : ''}`}
            style={{ '--x1': `${col(f.bounce ? f.bounce.from : f.pick)}%`, '--x2': `${col(target)}%` }}
            aria-hidden="true"
          >
            <Avatar who={f.req.who} size={22} />
          </span>
        )}
      </div>
      <div className={styles.servers}>
        {SERVERS.map((s) => <ServerCard key={s} s={s} f={f} health={health} narrow={narrow} />)}
      </div>
    </div>
  );
}

const RULE = {
  rr: 'Take turns: A, B, C, A, B, C…',
  least: 'Send it to whoever is least busy right now.',
  weighted: 'Take turns, but the big server A gets 3 of every 5.',
  iphash: 'The same person always goes to the same server.',
  health: 'Take turns, but skip servers that fail their health checks.',
};

const balancerSpec = {
  title: 'Load balancing, one request at a time',
  examples: BALANCER,
  simulate: balancer,
  code: (input) => balancerCode[input.algo],
  kinds: {
    start: ['Ready', 'neutral'], pick: ['Send', 'accent'], crash: ['Crash', 'danger'], fail: ['Retry', 'warn'],
    out: ['Taken out', 'danger'], back: ['Back in', 'success'], done: ['Result', 'success'],
  },
  describe: (input) => BALANCER[input.algo].label,
  rule: (input) => RULE[input.algo],
  stats: (f) => [['time', `${f.t} s`]],
  legend: () => [
    [<span className={styles.legendRow}>{Object.keys(PERSON_TONE).map((p) => <Avatar key={p} who={p} size={16} />)}</span>, 'Asha, Ben, Chen, Dev'],
    [<span className={styles.legendRow}><FileText size={12} /> 1 s <Search size={12} /> 3 s <FileBarChart size={12} /> 6 s</span>, 'page, search, report'],
    [<span className={styles.legendRow}>{LOAD.map(([label, tone]) => <i key={tone} className={`${styles.swatch} ${styles[`load_${tone}`]}`} title={label} />)}</span>, 'idle → overloaded'],
  ],
  delay: () => 3600,
  Stage: BalancerStage,
};

export function BalancerViz(props) {
  return <StepViz spec={balancerSpec} {...props} />;
}
