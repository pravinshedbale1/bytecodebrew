import { Database, Lock, Monitor, PenLine, Search, User } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Topology } from './hld/Topology';
import styles from './hld/distributed.module.css';
import {
  ISOLATION, REPLICATION, RING, RING_KEYS, SHARDING, isolation, isolationCode, replication, replicationCode, ring, ringCode, sharding, shardingCode,
} from './models/hldDistributed';

/**
 * Step-throughs for the HLD Data Storage module (distributing data):
 *   <IsolationViz />     two transactions, row versions, locks and snapshots: anomalies and their fixes
 *   <ReplicationViz />   leader logs, lag, failover and leaderless quorums
 *   <ShardingViz />      range vs hash partitioning, and rebalancing with mod N vs fixed partitions
 *   <RingViz />          consistent hashing: lookups, adding and removing servers, virtual nodes
 */

// ---------------------------------------------------------------- transactions

const fmt = (v) => (v === true ? 'on' : v === false ? 'off' : String(v));
const STATUS_TONE = { active: 'accent', blocked: 'warn', committed: 'success', aborted: 'danger', idle: 'muted' };

function IsolationStage({ step: f, width }) {
  const W = Math.min(width, 640);
  const focusKeys = new Set([].concat(f.focus?.key ?? []));
  return (
    <div className={styles.iso} style={{ width: W }}>
      <div className={styles.db}>
        <h4><Database size={13} aria-hidden="true" /> Database: every row keeps its versions</h4>
        {Object.entries(f.rows).map(([key, versions]) => (
          <div key={key} className={`${styles.dbRow} ${focusKeys.has(key) ? styles.dbRowOn : ''}`}>
            <b className={styles.dbKey}>
              {key}
              {f.locks[key] && <span className={styles.lock} title={`row lock held by ${f.locks[key]}`}><Lock size={10} aria-hidden="true" />{f.locks[key]}</span>}
            </b>
            <div className={styles.versions}>
              {versions.map((v, k) => {
                const seers = Object.entries(f.sees).filter(([, m]) => m[key] === k).map(([tx]) => tx);
                return (
                  <span key={k} className={[styles.version, v.at === null && !v.aborted && styles.vPending, v.aborted && styles.vAborted, k === versions.length - 1 && !v.aborted && focusKeys.has(key) && styles.pop].filter(Boolean).join(' ')}>
                    <strong>{fmt(v.value)}</strong>
                    <small>{v.by}{v.aborted ? ' · rolled back' : v.at === null ? ' · uncommitted' : v.by === 'T0' ? '' : ' ✓'}</small>
                    {seers.length > 0 && <span className={styles.seers}>{seers.map((s) => <i key={s} className={styles[`seer${s}`]}>{s} sees</i>)}</span>}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={styles.lanes}>
        {['T1', 'T2'].map((tx) => (
          <div key={tx} className={styles.laneHead}>
            <b className={styles[`tx${tx}`]}>{tx}</b>
            {f.status[tx] && <span className={`${styles.status} ${styles[`st_${STATUS_TONE[f.status[tx]]}`]}`}>{f.status[tx]}</span>}
          </div>
        ))}
        {f.lanes.map((l, k) => (
          ['T1', 'T2'].map((tx) => (
            <span key={`${k}${tx}`} className={tx === l.tx ? `${styles.stmt} ${styles[`stmt_${l.tone}`]} ${k === f.live ? styles.stmtLive : ''}` : styles.gap}>
              {tx === l.tx ? l.text : ''}
            </span>
          ))
        ))}
      </div>
    </div>
  );
}

const isolationSpec = {
  title: 'Two transactions at once',
  examples: ISOLATION,
  simulate: isolation,
  code: (input) => isolationCode(input.ex),
  kinds: {
    start: ['Setup', 'neutral'], begin: ['Begin', 'neutral'], read: ['Read', 'accent'], write: ['Write', 'note'], block: ['Wait', 'warn'], resume: ['Resume', 'note'],
    commit: ['Commit', 'success'], abort: ['Abort', 'danger'], anomaly: ['Anomaly', 'danger'], ok: ['Correct', 'success'],
  },
  describe: (input) => ISOLATION[input.ex].label,
  rule: (input) => ({ readskew: 'Read Committed: each statement sees the latest commit.', snapshot: 'Snapshot isolation: one snapshot per transaction.', lost: 'Read Committed, read-modify-write in the app.', atomic: 'Read Committed, increment inside one UPDATE.', writeskew: 'Snapshot isolation: only same-row writes conflict.', serializable: 'SSI: abort if the result could not happen serially.' })[input.ex],
  stats: () => [],
  legend: () => [[<Key shape="dashed">11</Key>, 'uncommitted version'], [<Key shape="box" tone="accent">T1 sees</Key>, 'the version each transaction reads'], [<Key shape="box" tone="warn"><Lock size={10} aria-hidden="true" />T1</Key>, 'row lock, held until commit']],
  delay: () => 3200,
  Stage: IsolationStage,
};

export function IsolationViz(props) {
  return <StepViz spec={isolationSpec} {...props} />;
}

// ---------------------------------------------------------------- replication

function ReplicationStage({ step: f, width, seq }) {
  const focus = new Set(f.focus ?? []);
  if (f.ex === 'quorum') {
    const nodes = [
      { id: 'writer', label: 'Writer', icon: PenLine, x: 0.22, y: 22 },
      { id: 'reader', label: 'Reader', icon: Search, x: 0.78, y: 22, note: f.result ? `x = ${f.result}` : undefined },
      ...['N1', 'N2', 'N3'].map((id, k) => {
        const n = f.nodes[id];
        return { id, label: id, icon: Database, x: [0.17, 0.5, 0.83][k], y: 168, w: 76, state: !n.up ? 'down' : focus.has(id) ? 'focus' : undefined, note: n.up ? undefined : 'unreachable', chips: [{ text: `${n.val} · t${n.t}`, tone: n.t === 2 ? 'success' : 'warn' }] };
      }),
    ];
    const links = ['N1', 'N2', 'N3'].flatMap((id) => [{ from: 'writer', to: id, dashed: true }, { from: 'reader', to: id, dashed: true, tone: 'note' }]);
    return <Topology nodes={nodes} links={links} packets={f.packets} width={width} height={222} seq={seq} label="leaderless replicas" />;
  }
  const n = f.nodes;
  const box = (id, x, y) => ({
    id, label: id === 'L' ? 'Node L' : `Node ${id}`, icon: Database, x, y, w: 108,
    tone: n[id].role.startsWith('leader') ? 'accent' : undefined,
    state: !n[id].up ? 'down' : focus.has(id) ? 'focus' : undefined,
    note: n[id].up ? `${n[id].role}${f.ex === 'failover' ? ` · e${n[id].epoch}` : ''}${n[id].lag ? ` · ${n[id].lag} behind` : ''}` : 'crashed',
    chips: n[id].chips,
  });
  const nodes = [
    { id: 'client', label: f.ex === 'lag' ? 'Asha' : 'Client', icon: f.ex === 'lag' ? User : Monitor, x: 0.5, y: 22 },
    box('L', 0.5, 112), box('F1', 0.2, 236), box('F2', 0.8, 236),
  ];
  const links = [
    { from: 'client', to: 'L', tone: n.L.role.startsWith('leader') && n.L.up ? 'accent' : 'muted', dashed: !n.L.up },
    { from: 'L', to: 'F1', dashed: !n.L.up }, { from: 'L', to: 'F2', dashed: !n.L.up },
    ...(f.ex === 'lag' ? [{ from: 'client', to: 'F2', dashed: true, tone: 'note' }] : []),
    ...(f.ex === 'failover' ? [{ from: 'F1', to: 'F2', dashed: true }, { from: 'client', to: 'F1', dashed: true }] : []),
  ];
  return <Topology nodes={nodes} links={links} packets={f.packets} width={width} height={300} seq={seq} label="leader and followers with their replication logs" />;
}

const replicationSpec = {
  title: 'Replication, message by message',
  examples: REPLICATION,
  simulate: replication,
  code: (input) => replicationCode[input.ex],
  kinds: {
    start: ['Setup', 'neutral'], write: ['Write', 'accent'], replicate: ['Replicate', 'note'], ack: ['Ack', 'success'], catchup: ['Catch up', 'note'],
    stale: ['Stale read', 'danger'], fix: ['Fix', 'success'], crash: ['Crash', 'danger'], elect: ['Elect', 'interview'], fence: ['Fence', 'warn'], rejoin: ['Rejoin', 'note'],
    read: ['Read', 'note'], repair: ['Repair', 'success'], done: ['So…', 'success'],
  },
  describe: (input) => REPLICATION[input.ex].label,
  rule: (input) => (input.ex === 'quorum' ? 'W + R > N: every read overlaps the latest write.' : 'One leader orders all writes; followers replay its log.'),
  stats: () => [],
  legend: (f) => (f.ex === 'quorum'
    ? [[<Key shape="box" tone="success">v2 · t2</Key>, 'x\'s latest version (value · timestamp)'], [<Key shape="box" tone="warn">v1 · t1</Key>, 'stale version']]
    : [[<Key shape="box" tone="accent">#4 x=5</Key>, 'log entry'], [<Key shape="box">#1–3 ✓</Key>, 'older entries, folded'], [<Key shape="box" tone="danger">down</Key>, 'crashed node']]),
  delay: () => 3600,
  Stage: ReplicationStage,
};

export function ReplicationViz(props) {
  return <StepViz spec={replicationSpec} {...props} />;
}

// ---------------------------------------------------------------- sharding

function ShardingStage({ step: f, width }) {
  const narrow = width < 520;
  if (f.ex === 'range' || f.ex === 'hash') {
    const max = Math.max(...f.shards.map((s) => s.rows));
    return (
      <div className={styles.shards} style={{ gridTemplateColumns: `repeat(${narrow ? 2 : 4}, minmax(0, 1fr))`, width: Math.min(width, 660) }}>
        {f.shards.map((s) => {
          const on = f.touched.includes(s.id);
          const hot = s.fresh.length >= 6;
          return (
            <div key={s.id} className={`${styles.shard} ${on ? (f.kind === 'query' ? styles.shardQuery : styles.shardOn) : ''} ${hot ? styles.shardHot : ''}`}>
              <div className={styles.shardHead}><Database size={13} aria-hidden="true" /><b>{s.id}</b>{f.kind === 'query' && on && <span className={styles.qTag}>queried</span>}</div>
              <small className={styles.shardLabel}>{s.label}</small>
              <div className={styles.fill}><i style={{ width: `${(s.rows / max) * 100}%` }} /></div>
              <small>{s.rows} rows</small>
              <div className={styles.newKeys}>
                {s.fresh.map((k) => <span key={k.id} className={k.old ? styles.keyOld : `${styles.keyNew} ${styles.pop}`}>{k.id}</span>)}
              </div>
              <span className={styles.writes}>{s.fresh.length ? `+${s.fresh.length} new` : 'no new writes'}</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (f.ex === 'modn') {
    const ids = Array.from({ length: f.n }, (_, k) => k);
    const moved = new Set(f.moved);
    return (
      <div className={styles.shards} style={{ gridTemplateColumns: `repeat(${narrow ? Math.min(3, f.n) : f.n}, minmax(0, 1fr))`, width: Math.min(width, 660) }}>
        {ids.map((sh) => (
          <div key={sh} className={`${styles.shard} ${sh === 4 ? styles.shardNew : ''}`}>
            <div className={styles.shardHead}><Database size={13} aria-hidden="true" /><b>S{sh + 1}</b></div>
            <small className={styles.shardLabel}>hash % {f.n} = {sh}</small>
            <div className={styles.users}>
              {f.keys.filter((k) => k.shard === sh).map((k) => (
                <span key={k.u} className={moved.has(k.u) ? `${styles.userMoved} ${styles.pop}` : styles.user} title={moved.has(k.u) ? `moved from S${k.from + 1}` : undefined}>
                  u{k.u}{moved.has(k.u) && <small>S{k.from + 1}→</small>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  const nodes = Array.from({ length: f.n }, (_, k) => k);
  const moved = new Set(f.moved);
  return (
    <div className={styles.shards} style={{ gridTemplateColumns: `repeat(${narrow ? Math.min(3, f.n) : f.n}, minmax(0, 1fr))`, width: Math.min(width, 660) }}>
      {nodes.map((nd) => (
        <div key={nd} className={`${styles.shard} ${nd === 4 ? styles.shardNew : ''}`}>
          <div className={styles.shardHead}><Database size={13} aria-hidden="true" /><b>S{nd + 1}</b></div>
          {f.parts.filter((p) => f.owner[p.p] === nd).map((p) => (
            <div key={p.p} className={`${styles.part} ${moved.has(p.p) ? `${styles.partMoved} ${styles.pop}` : ''}`}>
              <b>p{p.p}</b>
              <span>{p.users.length ? p.users.map((u) => `u${u}`).join(' ') : '—'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const shardingSpec = {
  title: 'Partitioning data across shards',
  examples: SHARDING,
  simulate: sharding,
  code: (input) => shardingCode[input.ex],
  kinds: { start: ['Setup', 'neutral'], write: ['Writes', 'accent'], query: ['Query', 'note'], grow: ['Add shard', 'warn'], move: ['Move', 'warn'], done: ['So…', 'success'] },
  describe: (input) => SHARDING[input.ex].label,
  rule: (input) => ({ range: 'Contiguous key ranges per shard.', hash: 'shard = hash(key) % 4', modn: 'shard = hash(key) % N, and N changes.', fixed: 'key → fixed partition → node (via a table).' })[input.ex],
  stats: (f) => (f.moved?.length && f.ex === 'modn' ? [['moved', `${f.moved.length} / 20`]] : []),
  legend: (f) => (f.ex === 'range' || f.ex === 'hash'
    ? [[<Key shape="box" tone="accent">405</Key>, 'new order in this step'], [<Key shape="box" tone="note">S4</Key>, 'shard the range query must ask']]
    : [[<Key shape="box" tone="warn">u7</Key>, f.ex === 'fixed' ? 'partition that moved' : 'key that moved to another shard']]),
  delay: () => 3600,
  Stage: ShardingStage,
};

export function ShardingViz(props) {
  return <StepViz spec={shardingSpec} {...props} />;
}

// ---------------------------------------------------------------- consistent hashing

const SERVER_TONE = { A: 'accent', B: 'note', C: 'interview', D: 'warn' };

function RingStage({ step: f, width, seq }) {
  const S = Math.max(300, Math.min(width, 420));
  const cx = S / 2, cy = S / 2;
  const R = S / 2 - 52;
  const at = (deg, r = R) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
  const arcPath = (a1, a2, r = R) => {
    const span = (a2 - a1 + 360) % 360 || 360;
    const [x1, y1] = at(a1, r), [x2, y2] = at(a1 + Math.min(span, 359.9), r);
    return `M${x1},${y1} A${r},${r} 0 ${span > 180 ? 1 : 0} 1 ${x2},${y2}`;
  };
  const sorted = [...f.points].sort((a, b) => a.at - b.at);
  const vnodes = f.points.some((p) => p.id !== p.server);
  const moved = new Set(f.moved);
  return (
    <svg className={styles.ring} width={S} height={S} viewBox={`0 0 ${S} ${S}`} role="img" aria-label="hash ring">
      <circle cx={cx} cy={cy} r={R} className={styles.ringBase} />
      {sorted.map((p, k) => {
        const prev = sorted[(k - 1 + sorted.length) % sorted.length].at;
        return <path key={`arc${p.id}`} d={arcPath(prev, p.at)} className={`${styles.arc} ${styles[`stroke_${SERVER_TONE[p.server]}`]}`} />;
      })}
      {f.arc && <path d={arcPath(f.arc.from, f.arc.to, R + 14)} className={styles.arcHi} key={`hi${seq}`} />}
      {f.walk && <path key={`walk${seq}`} d={arcPath(f.walk.from, f.walk.to, R - 16)} className={styles.walk} markerEnd="url(#ring-arrow)" />}
      <defs>
        <marker id="ring-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" className={styles.fillText} /></marker>
      </defs>
      {[0, 90, 180, 270].map((d) => {
        const [x, y] = at(d, R - 34);
        return <text key={d} x={x} y={y + 3} textAnchor="middle" className={styles.deg}>{d}°</text>;
      })}
      {f.keys.map(({ k, at: a }) => {
        const [x, y] = at(a);
        const [lx, ly] = at(a, R + 22);
        const tone = SERVER_TONE[f.owners[k]];
        const on = f.walk?.k === k || moved.has(k);
        return (
          <g key={k}>
            <circle key={moved.has(k) ? `m${seq}` : 'k'} cx={x} cy={y} r={on ? 7 : 5.5} className={`${styles[`fill_${tone}`]} ${styles.keyDot} ${moved.has(k) ? styles.keyMoved : ''}`} />
            <text x={lx} y={ly + 4} textAnchor="middle" className={`${styles.keyLabel} ${on ? styles.keyLabelOn : ''}`}>{k}</text>
          </g>
        );
      })}
      {f.gone && (() => {
        const [x, y] = at(f.gone.at);
        return <g className={styles.gone}><circle cx={x} cy={y} r={13} /><text x={x} y={y + 4} textAnchor="middle">{f.gone.server}</text></g>;
      })()}
      {f.points.map((p) => {
        const [x, y] = at(p.at);
        return (
          <g key={p.id} className={p.fresh ? styles.serverNew : undefined} style={{ transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r={vnodes ? 11 : 14} className={`${styles[`fill_${SERVER_TONE[p.server]}`]} ${styles.server}`} />
            <text x={x} y={y + 4} textAnchor="middle" className={styles.serverLabel}>{vnodes ? p.id : p.server}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" className={styles.centerTitle}>{vnodes ? 'share of the ring' : 'keys per server'}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" className={styles.centerValue}>
        {vnodes
          ? Object.entries(f.shares).map(([s, p]) => `${s} ${p}%`).join('  ')
          : Object.entries(Object.values(f.owners).reduce((m, s) => ({ ...m, [s]: (m[s] ?? 0) + 1 }), {})).sort().map(([s, c]) => `${s} ${c}`).join('  ')}
      </text>
    </svg>
  );
}

const ringSpec = {
  title: 'Consistent hashing on a ring',
  examples: RING,
  simulate: ring,
  code: (input) => ringCode[input.ex],
  kinds: { start: ['Setup', 'neutral'], walk: ['Lookup', 'accent'], all: ['All keys', 'accent'], add: ['Add', 'success'], remove: ['Remove', 'danger'], move: ['Move', 'warn'], vnodes: ['Vnodes', 'interview'], done: ['So…', 'success'] },
  describe: (input) => RING[input.ex].label,
  rule: () => 'A key belongs to the first server clockwise from it.',
  stats: (f) => (f.moved.length ? [['keys moved', `${f.moved.length} / ${Object.keys(RING_KEYS).length}`]] : []),
  legend: () => [[<Key tone="accent">A</Key>, 'server point'], [<Key shape="box" tone="accent">k1</Key>, 'key, coloured by owner'], [<Key shape="dashed">arc</Key>, 'the part of the ring a server owns']],
  delay: () => 3000,
  Stage: RingStage,
};

export function RingViz(props) {
  return <StepViz spec={ringSpec} {...props} />;
}
