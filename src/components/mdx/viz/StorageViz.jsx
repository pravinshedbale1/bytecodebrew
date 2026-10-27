import { Archive, Braces, Cog, Database, HardDrive, KeyRound, MemoryStick, Monitor, Rows3, ScrollText, Server, Table2 } from 'lucide-react';
import { StepViz, Key } from './StepViz';
import { Sequence } from './hld/Sequence';
import styles from './hld/storage.module.css';
import {
  BLOOM_BITS, BTREE, DATA_MODELS, LSM, MAX_KEYS, MEMTABLE_MAX, MODEL_NAMES, SHAPES, UPLOADS, VERDICTS,
  btree, btreeCode, dataModels, dataModelsCode, lsm, lsmCode, parseBTree, startTree, treeKeys, uploads, uploadsCode,
} from './models/hldStorage';

/**
 * Step-throughs for the HLD Data Storage module (storage engines and blobs):
 *   <DataModelsViz />   one dataset in four data models, one question at a time
 *   <BTreeViz />        B+tree lookups, range scans and page splits
 *   <LsmViz />          memtable, flushes, tombstones, Bloom filters and compaction
 *   <UploadViz />       uploads through the API, with a presigned URL, and multipart
 */

// ---------------------------------------------------------------- data models

const MODEL_ICON = { sql: Table2, doc: Braces, kv: KeyRound, wide: Rows3 };
const VERDICT_TONE = { best: 'success', good: 'accent', ok: 'warn', poor: 'danger' };
const ORDER = ['sql', 'doc', 'kv', 'wide'];

function ModelBody({ m, touched }) {
  const hit = (id) => (touched.has(id) ? styles.hit : '');
  if (m === 'sql') {
    return (
      <div className={styles.tables}>
        {SHAPES.sql.map((t) => (
          <table key={t.table} className={styles.mini}>
            <caption>{t.table}</caption>
            <thead><tr>{t.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{t.rows.map((r, k) => <tr key={t.ids[k]} className={hit(t.ids[k])}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
          </table>
        ))}
      </div>
    );
  }
  if (m === 'doc') {
    return (
      <div className={styles.docs}>
        {SHAPES.doc.map((d) => (
          <div key={d.id} className={`${styles.doc} ${hit(d.id)}`}>
            <b>{d.head}</b>
            {d.lines.map((l) => <span key={l}>{l}</span>)}
          </div>
        ))}
      </div>
    );
  }
  if (m === 'kv') {
    return (
      <div className={styles.kvs}>
        {SHAPES.kv.map((r) => (
          <div key={r.id} className={`${styles.kv} ${hit(r.id)}`}>
            <code>{r.key}</code><span aria-hidden="true">→</span><span className={styles.blob} title="an opaque value">▒▒▒▒ {r.size}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={styles.partitions}>
      <small className={styles.tableName}>orders_by_user · partition user_id · sorted by order_id ↓</small>
      {SHAPES.wide.map((p) => (
        <div key={p.partition} className={styles.partition}>
          <b>{p.partition}</b>
          <div>{p.rows.map((r) => <span key={r.id} className={`${styles.wideRow} ${hit(r.id)}`}>{r.text}</span>)}</div>
        </div>
      ))}
    </div>
  );
}

function ModelPanel({ m, f }) {
  const Icon = MODEL_ICON[m];
  const v = f.scores[m];
  const focus = f.model === m;
  return (
    <section className={`${styles.panel} ${focus ? styles.panelFocus : ''} ${f.model && !focus ? styles.panelDim : ''}`}>
      <header className={styles.panelHead}>
        <Icon size={14} aria-hidden="true" /><strong>{MODEL_NAMES[m]}</strong>
        {v && <span key={v} className={`${styles.verdict} ${styles[`v_${VERDICT_TONE[v]}`]} ${focus ? styles.pop : ''}`}>{VERDICTS[v]}</span>}
      </header>
      <ModelBody m={m} touched={new Set(focus ? f.touch : [])} />
    </section>
  );
}

function DataModelsStage({ step: f, width }) {
  const narrow = width < 620;
  if (!narrow) {
    return <div className={styles.models} style={{ width: Math.min(width, 760) }}>{ORDER.map((m) => <ModelPanel key={m} m={m} f={f} />)}</div>;
  }
  const shown = f.model ?? (f.kind === 'done' ? null : 'sql');
  return (
    <div style={{ width }}>
      <div className={styles.tabs}>
        {ORDER.map((m) => {
          const v = f.scores[m];
          const Icon = MODEL_ICON[m];
          return (
            <span key={m} className={`${styles.tab} ${shown === m ? styles.tabNow : ''} ${v ? styles[`v_${VERDICT_TONE[v]}`] : ''}`}>
              <Icon size={13} aria-hidden="true" />{MODEL_NAMES[m]}{v && <small>{VERDICTS[v]}</small>}
            </span>
          );
        })}
      </div>
      {shown && <ModelPanel m={shown} f={{ ...f, model: shown }} />}
    </div>
  );
}

const dataModelsSpec = {
  title: 'One dataset, four data models',
  examples: DATA_MODELS,
  simulate: dataModels,
  code: (input) => dataModelsCode(input.q),
  kinds: { start: ['Question', 'neutral'], sql: ['Relational', 'accent'], doc: ['Document', 'note'], kv: ['Key-value', 'interview'], wide: ['Wide-column', 'warn'], done: ['Verdict', 'success'] },
  describe: (input) => DATA_MODELS[input.q].label,
  rule: () => 'Choose the model by the queries you must serve, not by the data alone.',
  stats: (f) => (f.reads !== undefined ? [['reads or writes', f.reads]] : []),
  legend: () => [
    [<Key shape="box" tone="accent">row</Key>, 'touched by this query'],
    [<Key shape="box" tone="success">one cheap read</Key>, ''], [<Key shape="box" tone="warn">works, with a cost</Key>, ''], [<Key shape="box" tone="danger">not what it is for</Key>, ''],
  ],
  delay: () => 5000,
  Stage: DataModelsStage,
};

export function DataModelsViz(props) {
  return <StepViz spec={dataModelsSpec} {...props} />;
}

// ---------------------------------------------------------------- B+tree

const LEVEL_H = 68;
const NODE_H = 26;

/**
 * Places every page, including one that a split has just created and its parent doesn't point at yet:
 * leaves in leaf-chain order, internal pages over the middle of their children, rows by height.
 */
function treeLayout(tree, W) {
  const { nodes } = tree;
  let first = nodes[tree.root];
  while (first.children) first = nodes[first.children[0]];
  const leaves = [];
  for (let n = first; n; n = n.next ? nodes[n.next] : null) leaves.push(n.id);
  const slot = W / leaves.length;
  const cell = Math.max(14, Math.min(26, Math.floor((slot - 12) / MAX_KEYS)));
  const height = {};
  const h = (id) => (height[id] ??= nodes[id].children ? h(nodes[id].children[0]) + 1 : 0);
  Object.keys(nodes).forEach(h);
  const top = Math.max(...Object.values(height));
  const pos = {};
  leaves.forEach((id, k) => { pos[id] = { x: (k + 0.5) * slot }; });
  const place = (id) => {
    if (!pos[id]) { const ch = nodes[id].children; place(ch[0]); place(ch.at(-1)); pos[id] = { x: (pos[ch[0]].x + pos[ch.at(-1)].x) / 2 }; }
    return pos[id];
  };
  Object.keys(nodes).forEach((id) => {
    const p = place(id);
    p.y = 10 + (top - height[id]) * LEVEL_H;
    p.w = Math.max(1, nodes[id].keys.length) * cell + 8;
    p.left = p.x - p.w / 2;
  });
  return { pos, cell, leaves, height: 10 + top * LEVEL_H + NODE_H + 14 };
}

function BTreeStage({ step: f, width }) {
  const W = Math.max(300, Math.min(width, 640));
  const t = f.tree;
  const { pos, cell, height } = treeLayout(t, W);
  const visited = new Set(f.path);
  const fresh = new Set(f.fresh);
  const edges = [];
  for (const n of Object.values(t.nodes)) {
    if (!n.children) continue;
    n.children.forEach((c, i) => {
      const a = pos[n.id], b = pos[c];
      const x1 = a.left + 4 + i * cell, y1 = a.y + NODE_H;
      const on = visited.has(n.id) && visited.has(c);
      edges.push({ key: `${n.id}-${c}`, d: `M${x1},${y1} L${b.x},${b.y}`, on });
    });
  }
  const links = Object.values(t.nodes).filter((n) => !n.children && n.next).map((n) => {
    const a = pos[n.id], b = pos[n.next];
    const y = a.y + NODE_H / 2;
    return { key: `${n.id}>${n.next}`, d: `M${a.left + a.w + 1},${y} L${b.left - 3},${y}`, on: visited.has(n.id) && visited.has(n.next) && f.kind !== 'descend' };
  });
  return (
    <div className={styles.tree} style={{ width: W, height: height + (f.result ? 30 : 0) }}>
      <svg className={styles.treeSvg} width={W} height={height} aria-hidden="true">
        <defs>
          <marker id="bt-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} /></marker>
        </defs>
        {edges.map((e) => <path key={e.key} d={e.d} style={{ d: `path('${e.d}')` }} className={`${styles.edge} ${e.on ? styles.edgeOn : ''}`} />)}
        {links.map((e) => <path key={e.key} d={e.d} style={{ d: `path('${e.d}')` }} markerEnd="url(#bt-arrow)" className={`${styles.leafLink} ${e.on ? styles.edgeOn : ''}`} />)}
      </svg>
      {Object.values(t.nodes).map((n) => {
        const p = pos[n.id];
        const hi = new Set(f.hi[n.id] ?? []);
        return (
          <div
            key={n.id}
            className={[styles.page, n.children ? styles.inner : styles.leaf, visited.has(n.id) && styles.pageOn, f.cur === n.id && styles.pageCur, fresh.has(n.id) && styles.pageNew].filter(Boolean).join(' ')}
            style={{ left: p.left, top: p.y, width: p.w, height: NODE_H }}
          >
            {n.keys.map((k) => (
              <span key={k} className={`${styles.cell} ${hi.has(k) ? (f.found === k ? styles.cellFound : styles.cellHi) : ''}`} style={{ width: cell }}>{k}</span>
            ))}
          </div>
        );
      })}
      {f.result && (
        <div className={styles.result} style={{ top: height }}>
          <small>result</small>
          {f.result.length ? f.result.map((k) => <span key={k} className={styles.pop}>{k}</span>) : <em>—</em>}
        </div>
      )}
    </div>
  );
}

const START_KEYS = treeKeys(startTree());

const btreeSpec = {
  title: 'Inside a B+tree index',
  examples: BTREE,
  simulate: btree,
  code: (input) => btreeCode(input.mode),
  kinds: {
    start: ['Query', 'neutral'], descend: ['Descend', 'accent'], found: ['Found', 'success'], missing: ['Not there', 'warn'], scan: ['Leaf scan', 'note'],
    place: ['Insert', 'accent'], split: ['Split', 'warn'], up: ['Fits', 'success'], root: ['New root', 'interview'], done: ['Done', 'success'],
  },
  describe: (input) => (input.mode === 'lookup' ? `find ${input.key}` : input.mode === 'range' ? `range ${input.lo}–${input.hi}` : `insert ${input.keys.join(', ')}`),
  rule: () => `Internal pages route, leaves hold the keys, leaves are linked. At most ${MAX_KEYS} keys per page here.`,
  stats: (f) => [['pages read', f.reads]],
  legend: (f, input) => [
    [<Key shape="box" tone="accent">40</Key>, input.mode === 'insert' ? 'page on the insert path' : 'page read on the way down'],
    [<Key shape="box" tone="success">70</Key>, 'the key we were looking for'],
    [<Key shape="dashed">→</Key>, 'leaf-to-leaf link'],
  ],
  fields: (input) => ({
    lookup: [{ name: 'key', label: 'find key', placeholder: '42', short: true }],
    range: [{ name: 'lo', label: 'from', placeholder: '18', short: true }, { name: 'hi', label: 'to', placeholder: '45', short: true }],
    insert: [{ name: 'keys', label: 'keys to insert', placeholder: '27, 33' }],
  }[input.mode]),
  values: (input) => (input.mode === 'lookup' ? { key: String(input.key) } : input.mode === 'range' ? { lo: String(input.lo), hi: String(input.hi) } : { keys: input.keys.join(', ') }),
  parse: parseBTree,
  random: (input) => {
    const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
    if (input.mode === 'lookup') return { mode: 'lookup', key: r(1, 99) };
    if (input.mode === 'range') { const lo = r(1, 60); return { mode: 'range', lo, hi: Math.min(99, lo + r(5, 40)) }; }
    const pool = Array.from({ length: 99 }, (_, k) => k + 1).filter((k) => !START_KEYS.includes(k));
    const keys = [];
    while (keys.length < 2) { const k = pool[r(0, pool.length - 1)]; if (!keys.includes(k)) keys.push(k); }
    return { mode: 'insert', keys };
  },
  hint: () => `Keys from 1 to 99 (1–3 keys to insert). The tree starts with ${START_KEYS.join(', ')}.`,
  delay: () => 2600,
  Stage: BTreeStage,
};

export function BTreeViz(props) {
  return <StepViz spec={btreeSpec} {...props} />;
}

// ---------------------------------------------------------------- LSM tree

const CHECK_TAG = { skip: ['skipped: filter says no', 'muted'], false: ['read: false positive', 'warn'], hit: ['read: found', 'success'], tomb: ['read: tombstone', 'danger'] };

function LsmStage({ step: f, width }) {
  const narrow = width < 520;
  const W = Math.min(width, 700);
  const slots = Array.from({ length: MEMTABLE_MAX }, (_, k) => f.mem[k] ?? null);
  return (
    <div className={`${styles.lsm} ${narrow ? styles.lsmNarrow : ''}`} style={{ width: W }}>
      <div className={styles.opBar}>
        {f.op ? <code key={f.op} className={styles.pop}>{f.op}</code> : <span>{f.kind === 'compact' ? 'background compaction' : f.kind === 'flush' ? 'flush to disk' : ' '}</span>}
      </div>
      <div className={styles.lsmCols}>
        <div className={styles.lsmCol}>
          <h4><MemoryStick size={13} aria-hidden="true" /> Memory</h4>
          <div className={styles.memtable}>
            <small>memtable (sorted)</small>
            {slots.map((e, k) => (
              <span key={e ? e[0] : `empty${k}`} className={`${styles.slot} ${e ? '' : styles.slotEmpty} ${e && e[1] === null ? styles.tomb : ''} ${e && f.memHit === e[0] ? styles.slotHit : ''}`}>
                {e ? <><b>{e[0]}</b>{e[1] === null ? '✝ deleted' : e[1]}</> : 'free'}
              </span>
            ))}
          </div>
          <h4><ScrollText size={13} aria-hidden="true" /> Commit log <small>append-only</small></h4>
          <div className={styles.log}>
            {f.log.length === 0 ? <em>empty (last flush made it safe to drop)</em> : f.log.map((e, k) => <span key={k} className={k === f.log.length - 1 && f.kind !== 'flush' ? styles.logNew : ''}>{e}</span>)}
          </div>
        </div>
        <div className={styles.lsmCol}>
          <h4><HardDrive size={13} aria-hidden="true" /> Disk <small>SSTables, newest first</small></h4>
          {f.tables.length === 0 && <p className={styles.none}>no SSTables yet</p>}
          {f.tables.map((t) => {
            const status = f.checked[t.id];
            const checking = f.check?.id === t.id;
            const bits = new Set(t.bits);
            return (
              <div key={t.id} className={[styles.sst, f.fresh.includes(t.id) && styles.sstNew, status && styles[`sst_${status}`], checking && styles.sstNow].filter(Boolean).join(' ')}>
                <div className={styles.sstHead}>
                  <b>{t.id}</b>
                  {status && <span className={`${styles.tag} ${styles[`tag_${CHECK_TAG[status][1]}`]}`}>{CHECK_TAG[status][0]}</span>}
                </div>
                <div className={styles.bloom} aria-label={`Bloom filter bits set: ${t.bits.join(', ')}`}>
                  {Array.from({ length: BLOOM_BITS }, (_, b) => (
                    <span key={b} className={[bits.has(b) && styles.bitOn, checking && f.check.bits.includes(b) && (bits.has(b) ? styles.bitYes : styles.bitNo)].filter(Boolean).join(' ')} title={`bit ${b}`} />
                  ))}
                </div>
                <div className={styles.rows}>
                  {t.rows.map(([k, v]) => <span key={k} className={`${v === null ? styles.tomb : ''} ${checking && f.check.key === k ? styles.slotHit : ''}`}><b>{k}</b>{v === null ? '✝' : v}</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const lsmSpec = {
  title: 'Inside an LSM tree',
  examples: LSM,
  simulate: lsm,
  code: () => lsmCode,
  kinds: {
    start: ['Setup', 'neutral'], put: ['Write', 'accent'], del: ['Delete', 'danger'], flush: ['Flush', 'interview'], get: ['Read', 'note'],
    bloom: ['Skip', 'neutral'], false: ['False +', 'warn'], hit: ['Hit', 'success'], miss: ['Miss', 'warn'], compact: ['Compact', 'interview'], done: ['So…', 'success'],
  },
  describe: (input) => LSM[input.script].label,
  rule: () => 'Writes append; reads check newest to oldest; compaction cleans up.',
  stats: (f) => [['memtable', `${f.mem.length}/${MEMTABLE_MAX}`], ['SSTables', f.tables.length], ...(f.reads !== undefined ? [['files read', f.reads]] : [])],
  legend: () => [[<span className={styles.legendBits}><i className={styles.bitOn} /><i /></span>, 'Bloom filter bit set / clear'], [<Key shape="box" tone="danger">bob ✝</Key>, 'tombstone (a delete)']],
  delay: () => 2600,
  Stage: LsmStage,
};

export function LsmViz(props) {
  return <StepViz spec={lsmSpec} {...props} />;
}

// ---------------------------------------------------------------- uploads

const UPLOAD_LANES = [
  { id: 'client', label: 'Client', icon: Monitor },
  { id: 'api', label: 'API', icon: Server },
  { id: 'db', label: 'DB', icon: Database },
  { id: 's3', label: 'Storage', icon: Archive },
  { id: 'worker', label: 'Worker', icon: Cog },
];

function UploadStage({ step: f, input, width, seq }) {
  const total = uploads(input).at(-1).rows.length;
  const W = Math.max(320, Math.min(width, 660));
  const parts = input.flow === 'multipart' ? [1, 2, 3, 4].map((p) => {
    const sent = f.rows.some((r) => r.label.startsWith(`PUT part ${p}`));
    const retried = p === 3 && f.rows.some((r) => r.label.startsWith('retry part 3'));
    return { p, state: !sent ? 'wait' : p === 3 && !retried ? 'fail' : retried ? 'retry' : 'ok' };
  }) : null;
  return (
    <div style={{ width: W, margin: '0 auto' }}>
      <Sequence lanes={UPLOAD_LANES} rows={f.rows} live={f.live} total={total} clock={f.clock} width={width} seq={seq} />
      <div className={styles.apiMeter}>
        <span>through your API</span>
        <div className={styles.apiBar}><i style={{ width: `${(f.apiMB / 800) * 100}%` }} /></div>
        <b className={f.apiMB ? styles.apiHot : undefined}>{f.apiMB} MB</b>
      </div>
      {parts && (
        <div className={styles.parts}>
          {parts.map(({ p, state }) => <span key={p} className={`${styles.part} ${styles[`part_${state}`]}`}>part {p}<small>{{ wait: 'waiting', ok: 'stored', fail: 'failed at 60 MB', retry: 'retried, stored' }[state]}</small></span>)}
        </div>
      )}
    </div>
  );
}

const uploadSpec = {
  title: 'Uploading a big file to object storage',
  examples: UPLOADS,
  simulate: uploads,
  code: (input) => uploadsCode[input.flow],
  kinds: {
    start: ['Setup', 'neutral'], recv: ['Upload', 'warn'], send: ['Re-send', 'warn'], row: ['Metadata', 'note'], reply: ['Reply', 'success'],
    ask: ['Ask', 'accent'], url: ['Sign', 'accent'], put: ['Upload', 'success'], retry: ['Retry', 'warn'], complete: ['Complete', 'accent'], event: ['Event', 'interview'], done: ['So…', 'success'],
  },
  describe: (input) => `${UPLOADS[input.flow].label}: a 400 MB file`,
  rule: (input) => (input.flow === 'proxy' ? 'Every byte passes through your servers.' : 'Your API hands out permission; bytes go straight to storage.'),
  stats: (f) => [['elapsed', f.clock], ['through API', `${f.apiMB} MB`]],
  legend: () => [[<Key tone="warn">bytes</Key>, 'the file itself'], [<Key tone="accent">JSON</Key>, 'small control messages'], [<Key tone="interview">event</Key>, 'storage notification']],
  delay: () => 2600,
  Stage: UploadStage,
};

export function UploadViz(props) {
  return <StepViz spec={uploadSpec} {...props} />;
}
