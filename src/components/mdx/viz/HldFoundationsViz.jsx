import { Cloud, Database, Globe, KeyRound, Monitor, Network, Server, Zap } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Sequence } from './hld/Sequence';
import { Topology } from './hld/Topology';
import styles from './hld/stages.module.css';
import {
  ESTIMATE, INTERVIEW, JOURNEY, bytes, count, estimate, estimateCode, interview, interviewCode, journey, journeyCode, parseEstimate, parseJourney,
} from './models/hldFoundations';

/**
 * Step-throughs for the HLD Foundations module:
 *   <InterviewViz />        a 45-minute design interview filling the whiteboard step by step
 *   <EstimationViz />       DAU → QPS → storage → bandwidth → cache → servers, with the arithmetic
 *   <RequestJourneyViz />   DNS, TCP, TLS and HTTP round trips on a stopwatch
 */

// ---------------------------------------------------------------- the interview

const SEGMENTS = [['s1', 'Clarify', 5], ['s2', 'Estimate', 4], ['s3', 'API', 3], ['s4', 'Data', 3], ['s5', 'Design', 11], ['s6', 'Deep dive', 14], ['s7', 'Wrap up', 5]];

function InterviewStage({ step: f, width }) {
  const b = f.board;
  const narrow = width < 600;
  const archW = narrow ? Math.min(width, 420) : Math.floor(width * 0.52);
  const flagAt = (id) => b.flags.filter((x) => x.at === id).map((x) => ({ text: x.text, tone: 'warn' }));
  const nodes = [
    { id: 'client', label: 'Client', icon: Monitor, x: 0.5, y: 22 },
    { id: 'lb', label: 'Load balancer', icon: Network, x: 0.5, y: 82, chips: flagAt('lb') },
    { id: 'app', label: 'App servers ×N', icon: Server, x: 0.5, y: 146, note: 'stateless' },
    { id: 'keys', label: 'Key generator', icon: KeyRound, x: 0.16, y: 214, state: b.focus === 'keys' ? 'focus' : undefined, chips: flagAt('keys') },
    { id: 'cache', label: 'Cache', icon: Zap, x: 0.84, y: 214, chips: flagAt('cache') },
    { id: 'db', label: 'Database', icon: Database, x: 0.5, y: 286, chips: flagAt('db') },
  ];
  const links = [['client', 'lb'], ['lb', 'app'], ['app', 'keys'], ['app', 'cache'], ['app', 'db'], ['cache', 'db']].map(([from, to]) => ({ from, to, tone: b.focus && (from === b.focus || to === b.focus) ? 'accent' : 'muted', dashed: from === 'cache' }));
  const elapsed = f.minute;
  return (
    <div className={styles.interview} style={{ width }}>
      <div className={styles.timebar} aria-label={`${elapsed} of 45 minutes`}>
        {SEGMENTS.map(([k, label, m]) => (
          <span key={k} className={`${styles.seg} ${f.kind === k ? styles.segNow : ''} ${SEGMENTS.findIndex((s) => s[0] === k) < SEGMENTS.findIndex((s) => s[0] === f.kind) || f.kind === 'done' ? styles.segDone : ''}`} style={{ flex: m }}>
            <span>{label}</span><small>{m}′</small>
          </span>
        ))}
        <span className={styles.timeHand} style={{ left: `${(elapsed / 45) * 100}%` }}>{elapsed}:00</span>
      </div>
      {f.signal && <p className={styles.signal}>Interviewer is scoring: <strong>{f.signal}</strong></p>}
      <div className={`${styles.board} ${narrow ? styles.boardNarrow : ''}`}>
        <div className={styles.boardLeft}>
          <section className={styles.boardSec}>
            <h4>Requirements</h4>
            {b.notes.length === 0 ? <p className={styles.empty}>— empty —</p> : (
              <div className={styles.stickies}>
                {b.notes.map((nt, k) => <span key={nt.text} className={`${styles.sticky} ${styles[`sticky_${nt.tone}`]} ${f.kind === 's1' ? styles.pop : ''}`} style={{ '--tilt': `${(k % 3) - 1}deg`, animationDelay: `${k * 0.08}s` }}>{nt.text}</span>)}
              </div>
            )}
          </section>
          <section className={styles.boardSec}>
            <h4>Numbers</h4>
            {b.numbers.length === 0 ? <p className={styles.empty}>— empty —</p> : (
              <div className={styles.numbers}>
                {b.numbers.map((n) => <span key={n.label} className={`${styles.number} ${f.kind === 's2' ? styles.pop : ''}`}><small>{n.label}</small>{n.value}</span>)}
              </div>
            )}
          </section>
          <section className={styles.boardSec}>
            <h4>API &amp; data</h4>
            {b.api.length === 0 && b.schema.length === 0 ? <p className={styles.empty}>— empty —</p> : (
              <div className={styles.codeNotes}>
                {[...b.api, ...b.schema].map((line) => <code key={line} className={f.kind === 's3' || f.kind === 's4' ? styles.pop : undefined}>{line}</code>)}
              </div>
            )}
          </section>
        </div>
        <div className={styles.boardRight}>
          <h4>Architecture</h4>
          {b.arch ? <Topology nodes={nodes} links={links} width={archW} height={310} label="URL shortener architecture" /> : <p className={styles.empty}>— drawn at step 5, once the scope and numbers are agreed —</p>}
        </div>
      </div>
    </div>
  );
}

const interviewSpec = {
  title: 'A 45-minute design interview, step by step',
  examples: INTERVIEW,
  simulate: interview,
  code: () => interviewCode,
  kinds: {
    start: ['0:00', 'neutral'], s1: ['Step 1', 'accent'], s2: ['Step 2', 'accent'], s3: ['Step 3', 'accent'], s4: ['Step 4', 'accent'],
    s5: ['Step 5', 'accent'], s6: ['Step 6', 'interview'], s7: ['Step 7', 'success'], done: ['45:00', 'success'],
  },
  describe: () => '"Design a URL shortener"',
  rule: () => 'Scope → numbers → API → data → design → depth → wrap up.',
  stats: (f) => [['minute', `${f.minute} / 45`]],
  legend: () => [[<Key shape="box" tone="accent">note</Key>, 'functional requirement'], [<Key shape="box" tone="warn">note</Key>, 'non-functional requirement'], [<Key shape="box" tone="warn">flag</Key>, 'deep-dive or wrap-up point']],
  delay: () => 4500,
  Stage: InterviewStage,
};

export function InterviewViz(props) {
  return <StepViz spec={interviewSpec} {...props} />;
}

// ---------------------------------------------------------------- estimation

const CARDS = [
  ['wq', 'Write QPS', (v) => `${count(v)}/s`],
  ['rq', 'Read QPS', (v) => `${count(v)}/s`],
  ['peak', 'Peak QPS', (v) => `${count(v)}/s`],
  ['storage', `Storage, 5 yr × 3`, (v) => bytes(v)],
  ['bw', 'Egress', (v) => `${bytes(v)}/s`],
  ['cache', 'Cache memory', (v) => bytes(v)],
  ['servers', 'App servers', (v) => count(v)],
];

function EstimationStage({ step: f, input, width }) {
  const cols = width < 520 ? 2 : width < 700 ? 3 : 4;
  return (
    <div className={styles.estimate} style={{ width }}>
      <div className={styles.assumptions}>
        <span><small>DAU</small>{count(input.dau)}</span>
        <span><small>writes / user / day</small>{input.writes}</span>
        <span><small>reads / user / day</small>{input.reads}</span>
        <span><small>stored per write</small>{bytes(input.writeKB * 1e3)}</span>
        <span><small>served per read</small>{bytes(input.readKB * 1e3)}</span>
      </div>
      <div className={styles.cards} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {CARDS.map(([id, label, fmt], k) => {
          const has = id in f.cards;
          const now = f.card === id;
          return (
            <div key={id} className={`${styles.card} ${has ? styles.cardDone : styles.cardGhost} ${now ? styles.cardNow : ''}`}>
              <span className={styles.cardNum}>{k + 1}</span>
              <small>{label}</small>
              <strong key={now ? 'now' : 'v'} className={now ? styles.pop : undefined}>{has ? fmt(f.cards[id]) : '?'}</strong>
              {now && f.compare && <span className={styles.compare}>{f.compare}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const estimationSpec = {
  title: 'Back-of-the-envelope estimation, step by step',
  examples: ESTIMATE,
  simulate: estimate,
  code: () => estimateCode,
  kinds: { start: ['Assumptions', 'neutral'], qps: ['Traffic', 'accent'], peak: ['Peak', 'warn'], storage: ['Storage', 'interview'], bw: ['Bandwidth', 'note'], cache: ['Cache', 'accent'], servers: ['Servers', 'accent'], done: ['So…', 'success'] },
  describe: (input) => `${input.name}: ${count(input.dau)} DAU`,
  rule: () => 'One chain: each number feeds the next. Round to make the arithmetic easy.',
  stats: () => [],
  legend: () => [[<Key shape="box" tone="accent">5</Key>, 'number worked out in this step'], [<Key shape="dashed">?</Key>, 'still to estimate']],
  fields: () => [
    { name: 'dau', label: 'DAU', placeholder: '10M', short: true },
    { name: 'writes', label: 'writes/user/day', placeholder: '2', short: true },
    { name: 'reads', label: 'reads/user/day', placeholder: '50', short: true },
    { name: 'writeKB', label: 'KB per write', placeholder: '500', short: true },
    { name: 'readKB', label: 'KB per read', placeholder: '30', short: true },
  ],
  values: (input) => ({ dau: count(input.dau), writes: String(input.writes), reads: String(input.reads), writeKB: String(input.writeKB), readKB: String(input.readKB) }),
  parse: parseEstimate,
  random: () => ({ name: 'a random service', dau: [1e6, 5e6, 2e7, 1e8][Math.floor(Math.random() * 4)], writes: [0.5, 2, 10][Math.floor(Math.random() * 3)], reads: [20, 100, 500][Math.floor(Math.random() * 3)], writeKB: [1, 50, 2000][Math.floor(Math.random() * 3)], readKB: [2, 30, 300][Math.floor(Math.random() * 3)] }),
  hint: () => 'DAU accepts 10M, 2.5B…; sizes are in KB. Peak 3×, 3 replicas, 5 years and 2,000 requests/s per server are fixed.',
  delay: () => 4000,
  Stage: EstimationStage,
};

export function EstimationViz(props) {
  return <StepViz spec={estimationSpec} {...props} />;
}

// ---------------------------------------------------------------- the request journey

const PART_TONE = { dns: 'interview', tcp: 'warn', tls: 'note', handshake: 'accent', request: 'success', server: 'muted' };

function JourneyStage({ step: f, input, width, seq }) {
  const lanes = [
    { id: 'browser', label: 'Browser', icon: Monitor },
    { id: 'dns', label: 'DNS resolver', icon: Globe },
    f.server === 'edge' ? { id: 'edge', label: 'CDN edge', icon: Cloud } : { id: 'server', label: 'Server', icon: Server },
  ];
  const total = journey(input).at(-1).rows.length;
  const sum = Object.values(f.parts).reduce((x, y) => x + y, 0) || 1;
  return (
    <div style={{ width: Math.max(320, Math.min(width, 660)), margin: '0 auto' }}>
      <Sequence lanes={lanes} rows={f.rows} live={f.live} total={total} clock={`${f.clock} ms`} width={width} seq={seq} />
      <div className={styles.budget} aria-label="where the time went">
        {Object.entries(f.parts).map(([k, v]) => (
          <span key={k} className={`${styles.budgetPart} ${styles[`bp_${PART_TONE[k] ?? 'muted'}`]}`} style={{ flex: v / sum }} title={`${k}: ${Math.round(v)} ms`}>
            {v / sum > 0.12 ? `${k} ${Math.round(v)}` : ''}
          </span>
        ))}
        {Object.keys(f.parts).length === 0 && <span className={styles.budgetEmpty}>time to first byte will build up here</span>}
      </div>
    </div>
  );
}

const journeySpec = {
  title: 'What happens when you type a URL',
  examples: JOURNEY,
  simulate: journey,
  code: () => journeyCode,
  kinds: { start: ['Start', 'neutral'], dns: ['DNS', 'interview'], tcp: ['TCP', 'warn'], tls: ['TLS', 'note'], quic: ['QUIC', 'accent'], http: ['HTTP', 'success'], done: ['First byte', 'success'] },
  describe: (input) => `RTT to the server = ${input.rtt} ms`,
  rule: () => 'Each arrow takes half a round trip. Handshakes are what make first visits slow.',
  stats: (f) => [['elapsed', `${f.clock} ms`]],
  legend: () => [[<Key tone="interview">DNS</Key>, 'name lookup'], [<Key tone="warn">TCP</Key>, 'connection'], [<Key tone="note">TLS</Key>, 'encryption'], [<Key tone="success">HTTP</Key>, 'the request itself']],
  fields: () => [{ name: 'rtt', label: 'round trip to the server (ms)', placeholder: '80', short: true }],
  values: (input) => ({ rtt: String(input.rtt) }),
  parse: parseJourney,
  random: (input) => ({ rtt: [20, 80, 150, 300][Math.floor(Math.random() * 4)], mode: input.mode }),
  hint: () => 'Try 20 ms (same city), 80 ms (same continent) or 300 ms (the other side of the world). The edge example always uses 20 ms.',
  delay: () => 2000,
  Stage: JourneyStage,
};

export function RequestJourneyViz(props) {
  return <StepViz spec={journeySpec} {...props} />;
}
