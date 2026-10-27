/**
 * HLD Data Storage step-throughs, part 1 (models for <DataModelsViz>, <BTreeViz>, <LsmViz> and
 * <UploadViz>). Pure, so scripts/viz-check.mjs can test them.
 */
import { list, plural } from './util.js';

// ---------------------------------------------------------------- one dataset, four data models

/** The records each model stores, by id (so a step can light up the ones a query touches). */
export const SHAPES = {
  sql: [
    { table: 'users', cols: ['id', 'name', 'city'], rows: [['u42', 'Asha', 'Pune'], ['u7', 'Ravi', 'Delhi']], ids: ['users:u42', 'users:u7'] },
    { table: 'orders', cols: ['id', 'user_id', 'status'], rows: [['o812', 'u42', 'PAID'], ['o813', 'u7', 'PAID'], ['o815', 'u42', 'SHIPPED']], ids: ['orders:o812', 'orders:o813', 'orders:o815'] },
    { table: 'order_items', cols: ['order_id', 'sku', 'qty'], rows: [['o812', 'BK-101', '2'], ['o812', 'PN-007', '1'], ['o813', 'BK-101', '1'], ['o815', 'MG-3', '1']], ids: ['items:1', 'items:2', 'items:3', 'items:4'] },
  ],
  doc: [
    { id: 'doc:o812', head: 'orders/o812', lines: ['buyer: { id: u42, name: "Asha" }', 'status: PAID', 'items: [BK-101 ×2, PN-007 ×1]'] },
    { id: 'doc:o813', head: 'orders/o813', lines: ['buyer: { id: u7, name: "Ravi" }', 'status: PAID', 'items: [BK-101 ×1]'] },
    { id: 'doc:o815', head: 'orders/o815', lines: ['buyer: { id: u42, name: "Asha" }', 'status: SHIPPED', 'items: [MG-3 ×1]'] },
    { id: 'doc:u42', head: 'users/u42', lines: ['name: "Asha", city: Pune'] },
  ],
  kv: [
    { id: 'kv:order:o812', key: 'order:o812', size: '96 B' },
    { id: 'kv:order:o813', key: 'order:o813', size: '71 B' },
    { id: 'kv:order:o815', key: 'order:o815', size: '74 B' },
    { id: 'kv:user:u42', key: 'user:u42', size: '38 B' },
    { id: 'kv:user:u7', key: 'user:u7', size: '37 B' },
    { id: 'kv:user:u42:orders', key: 'user:u42:orders', size: '18 B' },
  ],
  wide: [
    { partition: 'u42', rows: [{ id: 'wide:u42:o815', text: 'o815 · SHIPPED · MG-3 ×1 · Asha' }, { id: 'wide:u42:o812', text: 'o812 · PAID · BK-101 ×2, PN-007 ×1 · Asha' }] },
    { partition: 'u7', rows: [{ id: 'wide:u7:o813', text: 'o813 · PAID · BK-101 ×1 · Ravi' }] },
  ],
};

export const MODEL_NAMES = { sql: 'Relational', doc: 'Document', kv: 'Key-value', wide: 'Wide-column' };
export const VERDICTS = { best: 'one cheap read', good: 'fine', ok: 'works, with a cost', poor: 'not what it is for' };

const ALL_KV = SHAPES.kv.map((r) => r.id);
const ALL_WIDE = SHAPES.wide.flatMap((p) => p.rows.map((r) => r.id));

const QUERIES = {
  order: {
    ask: 'Show order o812 with its items and the buyer\'s name',
    code: [
      ['sql', 'SELECT … FROM orders JOIN order_items … JOIN users … WHERE orders.id = \'o812\''],
      ['doc', 'db.orders.findOne({ _id: \'o812\' })'],
      ['kv', 'get(\'order:o812\');  get(\'user:u42\')'],
      ['wide', 'SELECT * FROM orders_by_user WHERE user_id = ?   -- we only know o812'],
    ],
    plans: {
      sql: { verdict: 'good', reads: 3, touch: ['orders:o812', 'items:1', 'items:2', 'users:u42'], calc: ['orders: primary key → o812', 'order_items: index on order_id → 2 rows', 'users: primary key → u42 (Asha)'], text: 'The order, its lines and the buyer live in three tables, so the database joins them: three indexed lookups. Normalised data costs a join, and with indexes the join is cheap.' },
      doc: { verdict: 'best', reads: 1, touch: ['doc:o812'], calc: ['orders/o812 → 1 document', 'items and buyer name are inside it'], text: 'One read. The items and even the buyer\'s name were stored inside the order, because they are read together. This is the case documents are built for.' },
      kv: { verdict: 'good', reads: 2, touch: ['kv:order:o812', 'kv:user:u42'], calc: ['get(order:o812) → a blob the app parses', 'get(user:u42) → the name'], text: 'Two gets by key, each very fast. The store can\'t look inside a value, so the app has to know which keys to fetch and parse the blobs itself.' },
      wide: { verdict: 'poor', reads: 1, touch: [], calc: ['orders_by_user needs the user id', 'fix: a second table, orders_by_id'], text: 'The table is partitioned by user, and all we have is an order id. In a wide-column store you design one table per query, so you would add orders_by_id and write every order twice.' },
    },
    wrap: 'Data that is read together, stored together, wins: document and key-value fetch the order in one or two reads. Relational pays for a join (cheap with indexes); wide-column needs a table made for this exact query.',
  },
  user: {
    ask: 'List Asha\'s (u42) orders, newest first',
    code: [
      ['sql', 'SELECT * FROM orders WHERE user_id = \'u42\' ORDER BY created_at DESC'],
      ['doc', 'db.orders.find({ \'buyer.id\': \'u42\' }).sort({ created: -1 })'],
      ['kv', 'ids = get(\'user:u42:orders\');  ids.map(get)'],
      ['wide', 'SELECT * FROM orders_by_user WHERE user_id = \'u42\''],
    ],
    plans: {
      sql: { verdict: 'good', reads: 1, touch: ['orders:o812', 'orders:o815'], calc: ['index on (user_id, created_at) → 2 rows, sorted'], text: 'One index range scan returns her two orders in date order. Any column can get an index when a new query needs it.' },
      doc: { verdict: 'good', reads: 1, touch: ['doc:o812', 'doc:o815'], calc: ['secondary index on buyer.id → 2 documents'], text: 'Document stores can query fields inside documents. With a secondary index on buyer.id, this is one indexed query.' },
      kv: { verdict: 'ok', reads: 3, touch: ['kv:user:u42:orders', 'kv:order:o815', 'kv:order:o812'], calc: ['no "find values that mention u42"', 'get(user:u42:orders) → [o815, o812]', 'get(order:o815), get(order:o812)'], text: 'A key-value store only finds things by key. So the app keeps its own list under user:u42:orders, updates it on every order, and does three gets.' },
      wide: { verdict: 'best', reads: 1, touch: ['wide:u42:o815', 'wide:u42:o812'], calc: ['partition u42 → one node', 'rows already sorted by order id, newest first'], text: 'The table was designed for exactly this: one partition, read sequentially, already in order. This is where wide-column stores shine, at any scale.' },
    },
    wrap: '"Everything in one partition, in order" is the wide-column sweet spot. Relational and document stores need a secondary index; key-value needs you to maintain the index by hand.',
  },
  report: {
    ask: 'How many BK-101 have we sold, across all orders?',
    code: [
      ['sql', 'SELECT sum(qty) FROM order_items WHERE sku = \'BK-101\''],
      ['doc', 'db.orders.aggregate([{ $unwind: \'$items\' }, { $match: { \'items.sku\': \'BK-101\' } }, …])'],
      ['kv', 'for key in scan(\'order:*\'):  parse(get(key))…'],
      ['wide', 'SELECT … WHERE sku = \'BK-101\'   -- rejected: no partition key'],
    ],
    plans: {
      sql: { verdict: 'best', reads: 1, touch: ['items:1', 'items:3'], calc: ['WHERE sku = \'BK-101\' → 2 rows', 'sum(qty) = 3'], text: 'A question nobody planned for, answered with one declarative query. Ad-hoc questions and reports are what relational databases do best.' },
      doc: { verdict: 'ok', reads: 3, touch: ['doc:o812', 'doc:o813', 'doc:o815'], calc: ['unwind the items of every order', '2 + 1 = 3'], text: 'The aggregation pipeline can do it, but it opens every order document (unless you add an index on items.sku). Fine for a small collection, slow for a huge one.' },
      kv: { verdict: 'poor', reads: ALL_KV.length, touch: ALL_KV, calc: ['no query language', 'read and parse every value in the app'], text: 'There is no way to ask the store. The app reads every key and parses every blob: at a billion keys, that is a batch job, not a query.' },
      wide: { verdict: 'poor', reads: ALL_WIDE.length, touch: ALL_WIDE, calc: ['no partition key → rejected', 'or ALLOW FILTERING: scan every node'], text: 'Without the partition key the query is refused (or scans the whole cluster). The fix is planning: keep a sales_by_sku counter table updated on every order, or run a Spark job.' },
    },
    wrap: 'Only the relational database answers an unplanned question directly. NoSQL stores make you decide your queries up front, and precompute the rest with counters, extra tables or batch jobs.',
  },
  rename: {
    ask: 'Asha changes her name to "Asha R."',
    code: [
      ['sql', 'UPDATE users SET name = \'Asha R.\' WHERE id = \'u42\''],
      ['doc', 'update users/u42;  update every order where buyer.id = u42'],
      ['kv', 'put(\'user:u42\', { …, name: \'Asha R.\' })'],
      ['wide', 'UPDATE orders_by_user … for every one of her rows (and orders_by_id)'],
    ],
    plans: {
      sql: { verdict: 'best', reads: 1, touch: ['users:u42'], calc: ['1 row updated', 'orders point at u42, so they see it at once'], text: 'Normalised data lives in one place. One row changes and every query that joins to it sees the new name.' },
      doc: { verdict: 'ok', reads: 3, touch: ['doc:u42', 'doc:o812', 'doc:o815'], calc: ['users/u42 + 2 orders = 3 writes', 'often not atomic across documents'], text: 'Her name was copied into each of her orders, so all the copies must change. Many document stores can\'t update several documents atomically, so a crash halfway leaves them disagreeing.' },
      kv: { verdict: 'good', reads: 1, touch: ['kv:user:u42'], calc: ['1 put', 'orders store only the user id'], text: 'Our order blobs store only the user id (that is why reading an order took two gets), so the name lives in one value.' },
      wide: { verdict: 'ok', reads: 2, touch: ['wide:u42:o815', 'wide:u42:o812'], calc: ['name is copied into each row', 'rewrite every row, in every query table'], text: 'Denormalised again: the name sits in every row of orders_by_user and of any other table built per query. Each copy has to be rewritten.' },
    },
    wrap: 'Normalised data changes in one place. Denormalised copies (documents, wide-column rows) make reads fast and writes wider, often without a transaction to keep them in step.',
  },
};

export const DATA_MODELS = {
  order: { label: 'Fetch one order', input: { q: 'order' } },
  user: { label: 'One user\'s orders', input: { q: 'user' } },
  report: { label: 'An ad-hoc report', input: { q: 'report' } },
  rename: { label: 'Update shared data', input: { q: 'rename' } },
};

export const dataModelsCode = (q) => QUERIES[q].code;

export function dataModels({ q }) {
  const Q = QUERIES[q];
  const steps = [];
  const scores = {};
  steps.push({
    kind: 'start', model: null, touch: [], scores: {}, lines: [],
    title: `"${Q.ask}"`,
    text: 'The same small shop data (two users, three orders) stored four ways. We run one question against each and count what it costs. Which model wins depends on the question, not on the database.',
    calc: ['users: u42 Asha, u7 Ravi', 'orders: o812, o813, o815'],
  });
  for (const m of ['sql', 'doc', 'kv', 'wide']) {
    const p = Q.plans[m];
    scores[m] = p.verdict;
    steps.push({
      kind: m, model: m, touch: p.touch, scores: { ...scores }, lines: [m], reads: p.reads,
      title: `${MODEL_NAMES[m]}: ${VERDICTS[p.verdict]}`,
      text: p.text,
      calc: p.calc,
    });
  }
  const best = Object.entries(scores).filter(([, v]) => v === 'best').map(([m]) => MODEL_NAMES[m]);
  steps.push({
    kind: 'done', model: null, touch: [], scores: { ...scores }, lines: [], answer: `best fit: ${best.join(', ') || '—'}`,
    title: 'Pick the model for your main access pattern',
    text: Q.wrap,
    calc: Object.entries(scores).map(([m, v]) => `${MODEL_NAMES[m]}: ${VERDICTS[v]}`),
  });
  return steps;
}

// ---------------------------------------------------------------- B+tree

export const MAX_KEYS = 2;   // per page: tiny, so splits happen quickly (real pages hold hundreds)

/** The starting tree: root [40] → [15, 25] and [60] → five leaves, linked left to right. */
export function startTree() {
  const nodes = {
    r: { id: 'r', keys: [40], children: ['a', 'b'] },
    a: { id: 'a', keys: [15, 25], children: ['l1', 'l2', 'l3'] },
    b: { id: 'b', keys: [60], children: ['l4', 'l5'] },
    l1: { id: 'l1', keys: [5, 10], children: null, next: 'l2' },
    l2: { id: 'l2', keys: [15, 20], children: null, next: 'l3' },
    l3: { id: 'l3', keys: [25, 30], children: null, next: 'l4' },
    l4: { id: 'l4', keys: [40, 50], children: null, next: 'l5' },
    l5: { id: 'l5', keys: [60, 70], children: null, next: null },
  };
  return { root: 'r', nodes, seq: 0 };
}

const cloneTree = (t) => ({ root: t.root, seq: t.seq, nodes: Object.fromEntries(Object.entries(t.nodes).map(([k, n]) => [k, { ...n, keys: [...n.keys], children: n.children && [...n.children] }])) });

export function treeKeys(t) {
  let n = t.nodes[t.root];
  while (n.children) n = t.nodes[n.children[0]];
  const out = [];
  for (; n; n = n.next ? t.nodes[n.next] : null) out.push(...n.keys);
  return out;
}

/** Which child to follow for key k, and the sentence that explains it. */
function route(node, k) {
  let i = 0;
  while (i < node.keys.length && k >= node.keys[i]) i++;
  const why = i === 0 ? `${k} < ${node.keys[0]}` : i === node.keys.length ? `${k} ≥ ${node.keys.at(-1)}` : `${node.keys[i - 1]} ≤ ${k} < ${node.keys[i]}`;
  return { i, why };
}

export const BTREE = {
  lookup: { label: 'Find 70', input: { mode: 'lookup', key: 70 } },
  miss: { label: 'Find 33 (missing)', input: { mode: 'lookup', key: 33 } },
  range: { label: 'Range 18–45', input: { mode: 'range', lo: 18, hi: 45 } },
  insert: { label: 'Insert 27, 33', input: { mode: 'insert', keys: [27, 33] } },
};

export const btreeCode = (mode) => ({
  lookup: [['descend', 'page = root;  while page is internal: page = child for key   // 1 page read per level'], ['leaf', 'return key in page.keys ? row : null']],
  range: [['descend', 'page = leaf for lo   // descend once'], ['scan', 'while page: emit keys in [lo, hi];  page = page.next   // leaves are linked'], ['stop', 'stop at the first key > hi']],
  insert: [['descend', 'leaf = leaf for key;  insert key in order'], ['split', 'if leaf is too full: split in two, copy the right half\'s first key up'], ['up', 'if the parent is too full: split it, move its middle key up'], ['root', 'if the root splits: new root, the tree grows one level']],
}[mode]);

export function btree(input) {
  const t = cloneTree(startTree());
  const steps = [];
  let reads = 0;
  const snap = (s) => steps.push({ tree: cloneTree(t), reads, path: [], hi: {}, found: null, fresh: [], ...s });
  const total = treeKeys(t).length;
  const leaves = () => { let n = t.nodes[t.root]; while (n.children) n = t.nodes[n.children[0]]; let c = 0; for (; n; n = n.next ? t.nodes[n.next] : null) c++; return c; };

  const descend = (k, verb) => {
    const path = [];
    let n = t.nodes[t.root];
    while (n.children) {
      path.push(n.id);
      reads++;
      const { i, why } = route(n, k);
      snap({
        kind: 'descend', cur: n.id, path: [...path], hi: { [n.id]: n.keys }, lines: ['descend'],
        title: `${verb}: page [${n.keys.join(', ')}] → child ${i + 1}`,
        text: `${n.id === t.root ? 'Start at the root (almost always cached in memory). ' : ''}This page only holds separator keys. ${why}, so follow pointer ${i + 1} of ${n.children.length}.`,
        calc: [`${why} → child ${i + 1}`, `pages read: ${reads}`],
      });
      n = t.nodes[n.children[i]];
    }
    path.push(n.id);
    reads++;
    return { leaf: n, path };
  };

  if (input.mode === 'lookup') {
    const k = input.key;
    snap({
      kind: 'start', lines: [],
      title: `SELECT … WHERE id = ${k}`,
      text: `A B+tree with ${total} keys. Internal pages hold separators that say which child to follow; leaf pages hold the keys (and the rows, or pointers to them). Pages hold ${MAX_KEYS} keys here so the tree stays small; real pages hold hundreds.`,
      calc: [`keys: ${total}`, `leaf pages: ${leaves()}`],
    });
    const { leaf, path } = descend(k, `find ${k}`);
    const hit = leaf.keys.includes(k);
    snap({
      kind: hit ? 'found' : 'missing', cur: leaf.id, path, hi: { [leaf.id]: hit ? [k] : leaf.keys }, found: hit ? k : null, lines: ['leaf'],
      title: hit ? `Leaf [${leaf.keys.join(', ')}] has ${k}` : `Leaf [${leaf.keys.join(', ')}] has no ${k}`,
      text: hit
        ? `Found after ${plural(reads, 'page read')}, one per level. The leaf holds the row (clustered index) or a pointer to it.`
        : `If ${k} existed, it would have to be in this leaf, so one path from root to leaf proves it is missing: ${plural(reads, 'page read')}, no scan.`,
      calc: [`${k} ${hit ? '∈' : '∉'} [${leaf.keys.join(', ')}]`, `pages read: ${reads}`],
    });
    snap({
      kind: 'done', path, hi: hit ? { [leaf.id]: [k] } : {}, found: hit ? k : null, lines: [], answer: `${hit ? 'found' : 'not found'} in ${plural(reads, 'page read')}`,
      title: 'One path, one page per level',
      text: `Without the index, the database would read all ${leaves()} leaf pages (every row). With it, the cost is the tree's height. With ~500 keys per real page, 3 levels cover 125 million rows and 4 levels 62 billion, and the top levels stay in memory.`,
      calc: [`index: ${reads} pages`, `full scan: ${leaves()} pages here, millions in real life`],
    });
  } else if (input.mode === 'range') {
    const { lo, hi } = input;
    snap({
      kind: 'start', lines: [],
      title: `SELECT … WHERE id BETWEEN ${lo} AND ${hi}`,
      text: `Descend once to the leaf where ${lo} would be, then walk right along the linked leaves until a key passes ${hi}. Linked leaves are why B+trees are great at range queries.`,
      calc: [`range [${lo}, ${hi}]`],
    });
    const { leaf, path } = descend(lo, `start of range ${lo}`);
    const out = [];
    let n = leaf;
    const walked = [...path];
    for (;;) {
      const inside = n.keys.filter((k) => k >= lo && k <= hi);
      out.push(...inside);
      const past = n.keys.some((k) => k > hi);
      if (n !== leaf) { reads++; walked.push(n.id); }
      snap({
        kind: 'scan', cur: n.id, path: [...walked], hi: { [n.id]: inside }, found: null, lines: ['scan'], result: [...out],
        title: `Leaf [${n.keys.join(', ')}]: ${inside.length ? `take ${inside.join(', ')}` : 'nothing in range'}`,
        text: past
          ? `${n.keys.find((k) => k > hi)} is past ${hi}, and keys only grow from here, so the scan stops. No other page is touched.`
          : `Every key in this leaf ${inside.length ? 'that is ≥ ' + lo + ' ' : ''}is in range. ${n.next ? 'Follow the leaf\'s next pointer to its right neighbour: no need to go back up the tree.' : 'This is the last leaf.'}`,
        calc: [`result so far: ${list(out)}`, `pages read: ${reads}`],
      });
      if (past || !n.next) break;
      n = t.nodes[n.next];
    }
    snap({
      kind: 'done', path: walked, hi: {}, lines: ['stop'], result: out, answer: `${list(out)} in ${plural(reads, 'page read')}`,
      title: `${plural(out.length, 'row')} from ${plural(reads, 'page')}`,
      text: `One descent plus a sequential walk over the leaves that hold the range. A hash index can't do this at all (it only answers "equals"), which is one reason B+trees are the default.`,
      calc: [`rows: ${list(out)}`, `pages: ${reads}`],
    });
  } else {
    snap({
      kind: 'start', lines: [],
      title: `INSERT ${input.keys.join(', ')}`,
      text: `Inserts go into the right leaf, in order. A page holds at most ${MAX_KEYS} keys here; one more and it splits, and the split can ripple up. The tree grows at the root, which keeps every leaf at the same depth.`,
      calc: [`keys: ${total}`, `max ${MAX_KEYS} keys per page`],
    });
    for (const k of input.keys) {
      reads = 0;
      const { leaf, path } = descend(k, `insert ${k}`);
      leaf.keys = [...leaf.keys, k].sort((x, y) => x - y);
      const over = leaf.keys.length > MAX_KEYS;
      let written = 1;
      snap({
        kind: 'place', cur: leaf.id, path, hi: { [leaf.id]: [k] }, lines: ['descend'],
        title: `${k} goes into leaf [${leaf.keys.join(', ')}]${over ? ': too full' : ''}`,
        text: over ? `The leaf now holds ${leaf.keys.length} keys, more than a page can take. It has to split.` : 'There is room, so the page is updated in place. Done: one page written (plus the write-ahead log).',
        calc: [`leaf: ${list(leaf.keys)}`, over ? `${leaf.keys.length} > ${MAX_KEYS} → split` : `${leaf.keys.length} ≤ ${MAX_KEYS} → fits`],
      });
      if (!over) continue;
      // split the leaf: left keeps the first half, right takes the rest, right's first key is copied up
      let node = leaf;
      let mid = Math.floor(node.keys.length / 2);
      const right = { id: `n${++t.seq}`, keys: node.keys.slice(mid), children: null, next: node.next };
      node.keys = node.keys.slice(0, mid);
      node.next = right.id;
      t.nodes[right.id] = right;
      let up = right.keys[0];
      let newChild = right.id;
      written++;
      snap({
        kind: 'split', cur: node.id, path, hi: { [node.id]: node.keys, [right.id]: right.keys }, fresh: [right.id], lines: ['split'],
        title: `Split: [${node.keys.join(', ')}] and [${right.keys.join(', ')}], copy ${up} up`,
        text: `The full leaf becomes two half-full leaves, linked to each other. Its parent needs a new separator so lookups can tell them apart: ${up}, the first key of the new right leaf (copied, because leaves keep every key).`,
        calc: [`left ${list(node.keys)}  right ${list(right.keys)}`, `separator ${up} → parent`],
      });
      for (let level = path.length - 2; ; level--) {
        if (level < 0) {
          const root = { id: `n${++t.seq}`, keys: [up], children: [node.id, newChild] };
          t.nodes[root.id] = root;
          t.root = root.id;
          written++;
          snap({
            kind: 'root', cur: root.id, path: [root.id], hi: { [root.id]: [up] }, fresh: [root.id], lines: ['root'],
            title: `New root [${up}]: the tree is one level taller`,
            text: `The old root split, so ${up} moves into a brand-new root above it. This is the only way a B-tree grows taller, so every leaf stays at the same depth and every lookup costs the same.`,
            calc: [`root = [${up}]`, `pages written: ${written}`],
          });
          break;
        }
        const parent = t.nodes[path[level]];
        const at = parent.children.indexOf(node.id);
        parent.keys.splice(at, 0, up);
        parent.children.splice(at + 1, 0, newChild);
        written++;
        if (parent.keys.length <= MAX_KEYS) {
          snap({
            kind: 'up', cur: parent.id, path, hi: { [parent.id]: [up] }, fresh: [], lines: ['split'],
            title: `Parent becomes [${parent.keys.join(', ')}]`,
            text: `${up} fits in this page, so the splitting stops here. Every leaf is still at the same depth, and one insert wrote ${plural(written, 'page')}.`,
            calc: [`page: ${list(parent.keys)}`, `${parent.keys.length} ≤ ${MAX_KEYS} → fits`, `pages written: ${written}`],
          });
          break;
        }
        // split the internal page: the middle key moves up (not copied)
        mid = Math.floor(parent.keys.length / 2);
        const moved = parent.keys[mid];
        const sib = { id: `n${++t.seq}`, keys: parent.keys.slice(mid + 1), children: parent.children.slice(mid + 1) };
        parent.keys = parent.keys.slice(0, mid);
        parent.children = parent.children.slice(0, mid + 1);
        t.nodes[sib.id] = sib;
        written++;
        snap({
          kind: 'split', cur: parent.id, path, hi: { [parent.id]: parent.keys, [sib.id]: sib.keys }, fresh: [sib.id], lines: ['up'],
          title: `Parent overflows too: split, move ${moved} up`,
          text: `With ${up} added, the parent held ${MAX_KEYS + 1} separators. It splits into [${parent.keys.join(', ')}] and [${sib.keys.join(', ')}], and the middle one, ${moved}, moves up to the next level (moved, not copied: internal pages only route).`,
          calc: [`left ${list(parent.keys)}  right ${list(sib.keys)}`, `${moved} → next level up`],
        });
        node = parent;
        newChild = sib.id;
        up = moved;
      }
    }
    snap({
      kind: 'done', lines: [], answer: `${plural(treeKeys(t).length, 'key')}, ${plural(leaves(), 'leaf', 'leaves')}`,
      title: 'Still balanced, still sorted',
      text: 'Splits keep every page at most full and every leaf at the same depth, and the leaf chain still reads the keys in order. The price: an insert may rewrite several pages scattered over the disk (random I/O), which is the write cost LSM trees avoid.',
      calc: [`keys in order: ${list(treeKeys(t))}`],
    });
  }
  return steps;
}

export function parseBTree(values, input) {
  const num = (t, name) => {
    const v = Number(String(t ?? '').trim());
    return Number.isInteger(v) && v >= 1 && v <= 99 ? { v } : { error: `${name} must be a whole number from 1 to 99.` };
  };
  if (input.mode === 'lookup') {
    const k = num(values.key, 'The key');
    return k.error ? k : { input: { mode: 'lookup', key: k.v } };
  }
  if (input.mode === 'range') {
    const lo = num(values.lo, '"From"'); if (lo.error) return lo;
    const hi = num(values.hi, '"To"'); if (hi.error) return hi;
    return lo.v > hi.v ? { error: '"From" must not be greater than "To".' } : { input: { mode: 'range', lo: lo.v, hi: hi.v } };
  }
  const parts = String(values.keys ?? '').split(/[\s,]+/).filter(Boolean);
  if (parts.length < 1 || parts.length > 3) return { error: 'Enter 1 to 3 keys.' };
  const keys = [];
  for (const p of parts) { const k = num(p, 'Each key'); if (k.error) return k; keys.push(k.v); }
  const have = new Set(treeKeys(startTree()));
  const dup = keys.find((k, i) => have.has(k) || keys.indexOf(k) !== i);
  return dup !== undefined ? { error: `${dup} is already in the tree (or listed twice).` } : { input: { mode: 'insert', keys } };
}

// ---------------------------------------------------------------- LSM tree

export const MEMTABLE_MAX = 4;
export const BLOOM_BITS = 16;

const charSum = (s) => [...s].reduce((a, c, k) => a + c.charCodeAt(0) * (k + 1), 0);
/** Two bit positions per key: a tiny but real Bloom filter. */
export const bloomBits = (key) => [charSum(key) % BLOOM_BITS, (charSum(key) * 7 + 3) % BLOOM_BITS];
const TOMB = null;

export const LSM = {
  life: { label: 'Writes, flush, compaction', input: { script: 'life' } },
  reads: { label: 'Reads and Bloom filters', input: { script: 'reads' } },
};

export const lsmCode = [
  ['put', 'commitLog.append(op);  memtable.put(key, value)      // sequential + in memory'],
  ['flush', 'if memtable.size == 4: write it to disk as a sorted SSTable'],
  ['get', 'check memtable, then SSTables newest → oldest'],
  ['bloom', '  skip an SSTable if its Bloom filter says "definitely not here"'],
  ['compact', 'merge SSTables: keep the newest value per key, drop tombstones'],
];

const SCRIPTS = {
  life: [
    ['put', 'ann', 31], ['put', 'bob', 12], ['put', 'cat', 7], ['put', 'dan', 40],
    ['put', 'ann', 35], ['del', 'bob'], ['put', 'eve', 9], ['put', 'fay', 22],
    ['get', 'cat'], ['get', 'bob'], ['compact'], ['get', 'cat'],
  ],
  reads: [
    ['load'], ['get', 'gus'], ['get', 'ann'], ['get', 'cat'], ['get', 'tom'], ['get', 'kim'],
  ],
};

/** The 'reads' script starts from three SSTables and a half-full memtable. */
const PRELOAD = {
  tables: [
    [['ann', 31], ['bob', 12], ['cat', 7], ['dan', 40]],
    [['eve', 9], ['fay', 22], ['hal', 5], ['ivy', 18]],
    [['ann', 35], ['jay', 3], ['lea', 14], ['max', 27]],
  ],
  mem: [['gus', 60], ['ned', 2]],
};

export function lsm({ script }) {
  const steps = [];
  let mem = new Map();
  let log = [];
  let tables = [];             // newest first: { id, rows: [[k, v]], bits: Set }
  let tid = 0;
  let op = null;               // the operation this step belongs to, and what each SSTable said to it
  let checked = {};
  const makeTable = (rows) => {
    const bits = new Set(rows.flatMap(([k]) => bloomBits(k)));
    return { id: `SST-${++tid}`, rows: [...rows].sort(([a], [b]) => (a < b ? -1 : 1)), bits };
  };
  const snap = (s) => steps.push({
    mem: [...mem.entries()].sort(([a], [b]) => (a < b ? -1 : 1)), log: [...log],
    tables: tables.map((t) => ({ id: t.id, rows: t.rows.map((r) => [...r]), bits: [...t.bits].sort((a, b) => a - b) })),
    check: null, memHit: null, fresh: [], op, checked: { ...checked }, ...s,
  });
  const show = (v) => (v === TOMB ? 'tombstone' : v);
  snap({
    kind: 'start', lines: [],
    title: script === 'life' ? 'An LSM tree: writes are appends, never in-place updates' : 'Reading from an LSM tree',
    text: script === 'life'
      ? `Every write goes to an append-only commit log (for durability) and to the memtable, a small sorted map in memory. When the memtable holds ${MEMTABLE_MAX} keys it is written out as an immutable sorted file, an SSTable. Nothing on disk is ever modified.`
      : 'A read has to check the memtable and then SSTables from newest to oldest, because a newer file may hold a newer value. Each SSTable carries a Bloom filter that can say "definitely not here" without touching the file.',
    calc: [`memtable holds ${MEMTABLE_MAX} keys`, `Bloom filter: ${BLOOM_BITS} bits, 2 per key`],
  });
  for (const [verb, key, value] of SCRIPTS[script]) {
    checked = {};
    op = null;
    if (verb === 'load') {
      tables = PRELOAD.tables.map(makeTable).reverse();
      mem = new Map(PRELOAD.mem);
      log = PRELOAD.mem.map(([k, v]) => `${k}=${v}`);
      snap({
        kind: 'flush', fresh: tables.map((t) => t.id), lines: ['flush'],
        title: 'Three SSTables on disk, two keys in the memtable',
        text: `Earlier writes were flushed into ${tables.length} SSTables (newest at the top). Note "ann" appears in two of them: the newer file holds her newer value. Each table's Bloom filter has the bits of its own keys set.`,
        calc: tables.map((t) => `${t.id}: ${t.rows.map(([k]) => k).join(', ')}`),
      });
      continue;
    }
    if (verb === 'put' || verb === 'del') {
      const v = verb === 'del' ? TOMB : value;
      const had = mem.has(key) || tables.some((t) => t.rows.some(([k]) => k === key));
      log.push(verb === 'del' ? `del ${key}` : `${key}=${v}`);
      mem.set(key, v);
      op = verb === 'del' ? `DELETE ${key}` : `PUT ${key} = ${v}`;
      snap({
        kind: verb, memHit: key, lines: ['put'],
        title: verb === 'del' ? `DELETE ${key}: write a tombstone` : `PUT ${key} = ${v}${had ? ' (an overwrite)' : ''}`,
        text: verb === 'del'
          ? `Files on disk are immutable, so a delete can't remove "${key}" from the SSTable that holds it. Instead it writes a tombstone, a marker meaning "deleted", which hides the older value until compaction removes both.`
          : had
            ? `"${key}" already exists in an SSTable, but there is no in-place update: the new value is simply written again. Reads will find the newer one first; compaction will discard the old one.`
            : `Appended to the commit log (a sequential write, cheap even on spinning disks) and inserted into the sorted memtable. The write is done: no page was searched or rewritten.`,
        calc: [`log += ${log.at(-1)}`, `memtable: ${mem.size} / ${MEMTABLE_MAX}`],
      });
      if (mem.size >= MEMTABLE_MAX) {
        const t = makeTable([...mem.entries()]);
        tables = [t, ...tables];
        mem = new Map();
        log = [];
        op = null;
        snap({
          kind: 'flush', fresh: [t.id], lines: ['flush'],
          title: `Memtable full: flush it as ${t.id}`,
          text: `The memtable is written to disk in one sequential pass as ${t.id}: sorted, immutable, with its own Bloom filter. The commit log for those writes can now be discarded, and a fresh memtable starts.`,
          calc: [`${t.id}: ${t.rows.map(([k, x]) => `${k}=${show(x)}`).join(', ')}`, `SSTables on disk: ${tables.length}`],
        });
      }
      continue;
    }
    if (verb === 'compact') {
      const merged = new Map();
      for (const t of [...tables].reverse()) for (const [k, v] of t.rows) merged.set(k, v);    // oldest first, newer overwrite
      const dropped = [...merged.entries()].filter(([, v]) => v === TOMB).map(([k]) => k);
      const rows = [...merged.entries()].filter(([, v]) => v !== TOMB);
      const before = tables.reduce((a, t) => a + t.rows.length, 0);
      const t = makeTable(rows);
      tables = [t];
      snap({
        kind: 'compact', fresh: [t.id], lines: ['compact'],
        title: `Compaction: ${before} entries in, ${rows.length} out`,
        text: `In the background, the SSTables are merge-sorted into one (like the merge step of merge sort). For each key only the newest value survives; ${dropped.length ? `"${dropped.join('", "')}" had a tombstone, so it and its old value are both dropped` : 'there were no tombstones'}. Reads now check fewer files.`,
        calc: [`${t.id}: ${rows.map(([k, v]) => `${k}=${v}`).join(', ')}`, `dropped: ${before - rows.length} stale entries`],
      });
      continue;
    }
    // get: memtable, then SSTables newest → oldest, skipping by Bloom filter
    let reads = 0;
    const [b1, b2] = bloomBits(key);
    op = `GET ${key}`;
    if (mem.has(key)) {
      const v = mem.get(key);
      snap({
        kind: 'get', memHit: key, lines: ['get'], result: show(v), reads,
        title: `GET ${key}: in the memtable → ${show(v)}`,
        text: `The newest data is in memory, so the read ends here without touching disk: 0 files read.`,
        calc: [`memtable[${key}] = ${show(v)}`, 'files read: 0'],
      });
      continue;
    }
    snap({
      kind: 'get', lines: ['get'], reads, check: null,
      title: `GET ${key}: not in the memtable`,
      text: `Not in memory, so check the SSTables, newest first: a newer file shadows older ones. Before opening a file, ask its Bloom filter: bits ${b1} and ${b2} for "${key}".`,
      calc: [`bloom("${key}") → bits ${b1}, ${b2}`],
    });
    let found = false;
    for (const t of tables) {
      const maybe = t.bits.has(b1) && t.bits.has(b2);
      const row = t.rows.find(([k]) => k === key);
      if (!maybe) {
        checked[t.id] = 'skip';
        snap({
          kind: 'bloom', lines: ['bloom'], check: { id: t.id, bits: [b1, b2], maybe: false }, reads,
          title: `${t.id}: Bloom filter says no, skip it`,
          text: `${[b1, b2].filter((b) => !t.bits.has(b)).length === 2 ? `Bits ${b1} and ${b2} are both` : `Bit ${!t.bits.has(b1) ? b1 : b2} is`} 0 in ${t.id}'s filter, so "${key}" was never added to this file. A Bloom filter never gives a false "no", so the file is skipped without a disk read.`,
          calc: [`bits ${b1}, ${b2}: ${t.bits.has(b1) ? 1 : 0}, ${t.bits.has(b2) ? 1 : 0}`, `files read: ${reads}`],
        });
        continue;
      }
      reads++;
      if (!row) {
        checked[t.id] = 'false';
        snap({
          kind: 'false', lines: ['bloom'], check: { id: t.id, bits: [b1, b2], maybe: true, miss: true }, reads,
          title: `${t.id}: "maybe", but it isn't there (a false positive)`,
          text: `Both bits are 1, set by other keys that happen to share them. The filter can only say "maybe", so the file is read, and "${key}" is not in it: one wasted read. Bigger filters make this rarer (about 1% at 10 bits per key).`,
          calc: [`bits ${b1}, ${b2}: 1, 1 → maybe`, `files read: ${reads}`],
        });
        continue;
      }
      found = true;
      checked[t.id] = row[1] === TOMB ? 'tomb' : 'hit';
      snap({
        kind: 'hit', lines: ['get'], check: { id: t.id, bits: [b1, b2], maybe: true, key }, reads, result: row[1] === TOMB ? 'deleted' : row[1],
        title: row[1] === TOMB ? `${t.id}: a tombstone → "${key}" is deleted` : `${t.id}: found ${key} = ${row[1]}`,
        text: row[1] === TOMB
          ? `The newest entry for "${key}" is a tombstone, so the answer is "not found", even though an older SSTable still holds a value. The search stops here.`
          : t === tables.at(-1) && tables.length > 1
            ? `It was in the oldest file, so every newer file had to be ruled out first. That is where Bloom filters earn their keep: ${plural(reads, 'file')} read out of ${tables.length}.`
            : `The filter said "maybe" and the file has it.${tables.length > 1 ? ` Older SSTables might hold older values for "${key}", but the newest one wins, so the search stops.` : ''}`,
        calc: [`${key} = ${show(row[1])}`, `files read: ${reads} of ${tables.length}`],
      });
      break;
    }
    if (!found) {
      snap({
        kind: 'miss', lines: ['get'], reads, result: 'not found',
        title: `"${key}" is not in any SSTable`,
        text: `All ${tables.length} files checked, ${plural(reads, 'disk read')} actually made thanks to the Bloom filters. Without them, a miss would read every SSTable: that is the read amplification LSM trees pay for fast writes.`,
        calc: [`files read: ${reads} of ${tables.length}`],
      });
    }
  }
  op = null;
  checked = {};
  snap({
    kind: 'done', lines: [], answer: script === 'life' ? `${plural(tables.length, 'SSTable')}, ${plural(tables[0]?.rows.length ?? 0, 'live key')}` : 'Bloom filters skip most files',
    title: script === 'life' ? 'Fast writes, background tidying' : 'Reads pay for fast writes',
    text: script === 'life'
      ? 'Every write was a sequential append, which is why LSM trees (Cassandra, RocksDB, HBase) absorb huge write rates. The cost moved to reads, which may check several files, and to compaction, which uses background I/O.'
      : 'A hit in a recent file is cheap; a key that lives in an old file, or nowhere, has to get past every newer file. Bloom filters make "not here" almost free, and compaction keeps the number of files small.',
    calc: script === 'life' ? ['writes: sequential appends', 'reads: memtable + newest-first SSTables'] : ['hit in memtable: 0 files', 'miss: Bloom filters skip most files'],
  });
  return steps;
}

// ---------------------------------------------------------------- uploads to object storage

export const UPLOADS = {
  proxy: { label: 'Through your API', input: { flow: 'proxy' } },
  presigned: { label: 'Presigned URL', input: { flow: 'presigned' } },
  multipart: { label: 'Multipart, one part fails', input: { flow: 'multipart' } },
};

export const FILE_MB = 400;
export const STREAM_MBPS = 10;      // one connection from a phone or laptop
const DC_MBPS = 100;                // your server to object storage, inside the cloud

export const uploadsCode = {
  proxy: [['recv', 'POST /upload  (the whole file, in the request body)'], ['send', 'api: s3.putObject(key, body)'], ['row', 'api: INSERT INTO files …;  return 201']],
  presigned: [['ask', 'POST /uploads {name, size, type}  → validate, INSERT (PENDING)'], ['url', 'return s3.presign(PUT, key, expires = 15 min)'], ['put', 'client: PUT bytes → object storage'], ['event', 'on ObjectCreated: verify, mark UPLOADED, start processing']],
  multipart: [['ask', 'POST /uploads → s3.createMultipartUpload → uploadId'], ['url', 'presign one URL per part (100 MB each)'], ['put', 'client: PUT parts in parallel;  retry only a failed part'], ['done', 'completeMultipartUpload(uploadId, [part, etag]…)'], ['event', 'on ObjectCreated: verify, mark UPLOADED']],
};

const fmtS = (s) => (s < 1 ? `${Math.round(s * 1000)} ms` : `${Math.round(s * 10) / 10} s`);

export function uploads({ flow }) {
  const steps = [];
  const rows = [];
  let clock = 0;
  let apiMB = 0;
  const add = (r, secs) => { clock += secs; rows.push({ ...r, at: fmtS(clock) }); return rows.length - 1; };
  const snap = (s) => steps.push({ rows: rows.map((r) => ({ ...r })), clock: fmtS(clock), apiMB, ...s });
  const single = FILE_MB / STREAM_MBPS;
  snap({
    kind: 'start', live: null, lines: [],
    title: `Upload a ${FILE_MB} MB video`,
    text: {
      proxy: 'The naive way: the client sends the file to your API, and the API passes it on to object storage. Watch how much of the work lands on your servers.',
      presigned: 'The API hands out permission, not bandwidth: it returns a short-lived signed URL and the client uploads straight to object storage.',
      multipart: `A big file in ${FILE_MB / 100} parts of 100 MB, each with its own presigned URL, uploaded in parallel. One part will fail halfway.`,
    }[flow],
    calc: [`file: ${FILE_MB} MB`, `one connection: ~${STREAM_MBPS} MB/s`],
  });
  if (flow === 'proxy') {
    apiMB = FILE_MB;
    let live = add({ from: 'client', to: 'api', label: `POST /upload (${FILE_MB} MB)`, tone: 'warn', sub: `${single} s` }, single);
    snap({ kind: 'recv', live, lines: ['recv'], title: 'The whole file streams into your API server', text: `At ~${STREAM_MBPS} MB/s that takes ${single} seconds, and for all of it an API server holds the connection, buffers bytes and can't do much else. Mobile uploads are slower still.`, calc: [`${FILE_MB} MB ÷ ${STREAM_MBPS} MB/s = ${single} s`, `through your API: ${apiMB} MB`] });
    apiMB += FILE_MB;
    live = add({ from: 'api', to: 's3', label: `PUT object (${FILE_MB} MB)`, tone: 'warn', sub: `${FILE_MB / DC_MBPS} s` }, FILE_MB / DC_MBPS);
    snap({ kind: 'send', live, lines: ['send'], title: 'Then the API sends it all again, to storage', text: 'Every byte crosses your fleet twice: in from the client, out to object storage. You pay for that bandwidth and those busy servers.', calc: [`${FILE_MB} MB ÷ ${DC_MBPS} MB/s = ${FILE_MB / DC_MBPS} s`, `through your API: ${apiMB} MB`] });
    live = add({ from: 'api', to: 'db', label: 'INSERT file row', tone: 'note' }, 0.01);
    snap({ kind: 'row', live, lines: ['row'], title: 'Record the metadata', text: 'The file\'s name, owner, size and storage key go into the database. The bytes live in object storage; the database only points at them.', calc: ['files: id, owner, key, size, status'] });
    live = add({ from: 'api', to: 'client', label: '201 Created', tone: 'success' }, 0.04);
    snap({ kind: 'reply', live, lines: ['row'], title: `Done after ${fmtS(clock)}`, text: 'It works, and for small files (avatars, a few hundred KB) it is fine. For big files it ties up your servers for the whole upload.', calc: [`elapsed: ${fmtS(clock)}`, `through your API: ${apiMB} MB`] });
    snap({ kind: 'done', live: null, lines: [], answer: `${apiMB} MB through your API`, title: 'Your servers became the bottleneck', text: `A thousand people uploading at once means ${FILE_MB * 2} GB moving through your API fleet and a thousand connections held for ~${Math.round(clock)} s each. Object storage is built to take this traffic; let it.`, calc: [`per upload: ${apiMB} MB through the API`, `×1,000 users = ${FILE_MB * 2} GB`] });
    return steps;
  }
  // presigned and multipart both start with a tiny request to the API
  let live = add({ from: 'client', to: 'api', label: 'POST /uploads {name, size}', tone: 'accent', sub: '~200 bytes' }, 0.05);
  snap({ kind: 'ask', live, lines: ['ask'], title: 'Ask for permission, not to carry the file', text: 'The client sends only the file\'s name, size and type. The API checks the user is allowed (auth, quota, file type) before anything is uploaded.', calc: ['request: ~200 bytes', 'through your API: 0 MB'] });
  live = add({ from: 'api', to: 'db', label: 'INSERT file (PENDING)', tone: 'note' }, 0.01);
  snap({ kind: 'ask', live, lines: ['ask'], title: 'A metadata row, marked PENDING', text: 'The row exists before the bytes do. If the upload never finishes, a cleanup job finds old PENDING rows and removes them.', calc: ['status = PENDING'] });
  if (flow === 'presigned') {
    live = add({ from: 'api', to: 'client', label: 'presigned PUT URL', tone: 'accent', sub: 'expires in 15 min' }, 0.04);
    snap({ kind: 'url', live, lines: ['url'], title: 'A signed URL that allows exactly one upload', text: 'The URL carries a signature made with your credentials. It authorises one PUT to one key, for 15 minutes, optionally with a size limit and content type. Nobody else can reuse it for anything else.', calc: ['PUT /videos/9f2c…?X-Amz-Signature=…', 'API work so far: ~0.1 s'] });
    live = add({ from: 'client', to: 's3', label: `PUT bytes (${FILE_MB} MB)`, tone: 'success', sub: `${single} s` }, single);
    snap({ kind: 'put', live, lines: ['put'], title: 'The bytes go straight to object storage', text: `Still ${single} seconds on the client's connection, but none of it touches your servers. Object storage scales to millions of these uploads.`, calc: [`${FILE_MB} MB ÷ ${STREAM_MBPS} MB/s = ${single} s`, 'through your API: 0 MB'] });
  } else {
    live = add({ from: 'api', to: 's3', label: 'CreateMultipartUpload', tone: 'note' }, 0.03);
    snap({ kind: 'url', live, lines: ['ask'], title: 'Start a multipart upload', text: 'Object storage returns an upload id. Parts uploaded under that id are held until the client says "complete".', calc: ['uploadId = 7Hc…'] });
    live = add({ from: 'api', to: 'client', label: 'uploadId + 4 part URLs', tone: 'accent' }, 0.03);
    snap({ kind: 'url', live, lines: ['url'], title: 'One presigned URL per part', text: 'Four 100 MB parts, four URLs. Parts can go in any order and in parallel.', calc: ['parts 1–4 × 100 MB'] });
    const first = rows.length;
    for (let p = 1; p <= 4; p++) rows.push({ from: 'client', to: 's3', label: p === 3 ? 'PUT part 3 ✗ reset at 60 MB' : `PUT part ${p} (100 MB)`, tone: p === 3 ? 'danger' : 'success', at: fmtS(clock) });
    clock += 100 / STREAM_MBPS;
    snap({ kind: 'put', live: [first, first + 1, first + 2, first + 3], lines: ['put'], title: 'Four parts in parallel; part 3 drops', text: `Each part has its own connection, so four run at once: ${100 / STREAM_MBPS} s for the lot instead of ${single} s (if the client's link can carry ~${STREAM_MBPS * 4} MB/s). Part 3's connection resets at 60 MB.`, calc: [`4 × 100 MB in parallel = ${100 / STREAM_MBPS} s`, 'part 3: failed at 60 MB'] });
    live = add({ from: 'client', to: 's3', label: 'retry part 3 only (100 MB)', tone: 'warn' }, 100 / STREAM_MBPS);
    snap({ kind: 'retry', live, lines: ['put'], title: 'Retry just the part that failed', text: `Parts 1, 2 and 4 are already stored. Only part 3 is sent again: 100 MB, not ${FILE_MB}. A single big PUT would have restarted from zero.`, calc: ['re-sent: 100 MB', `a single PUT would re-send ${FILE_MB} MB`] });
    live = add({ from: 'client', to: 's3', label: 'Complete [1..4 + ETags]', tone: 'accent' }, 0.2);
    snap({ kind: 'complete', live, lines: ['done'], title: 'Complete: storage stitches the parts together', text: 'The client lists each part number with the ETag (checksum) it got back. Object storage assembles them into one object. Until this call, the parts are invisible.', calc: ['object = part1 + part2 + part3 + part4'] });
  }
  live = add({ from: 's3', to: 'worker', label: 'ObjectCreated event', tone: 'interview' }, 0.2);
  snap({ kind: 'event', live, lines: ['event'], title: 'Storage announces the new object', text: 'Object storage emits an event (S3 → SQS or Lambda, for example). This, not the client saying "done", is the trustworthy signal that the bytes really landed.', calc: ['event: ObjectCreated'] });
  live = add({ from: 'worker', to: 'db', label: 'mark UPLOADED + process', tone: 'success' }, 0.1);
  snap({ kind: 'event', live, lines: ['event'], title: 'A worker verifies and finishes the job', text: 'The worker checks size and checksum, marks the row UPLOADED, and queues thumbnails, virus scanning or transcoding. The API was never involved after the first request.', calc: ['status = UPLOADED'] });
  snap({
    kind: 'done', live: null, lines: [], answer: `${fmtS(clock)} · ${apiMB} MB through your API`,
    title: flow === 'presigned' ? 'Your API did ~0.1 s of work' : `${fmtS(clock)} instead of ${single} s, and a failure cost one part`,
    text: flow === 'presigned'
      ? `Same ${single} s for the user, but your API handled two small JSON requests instead of ${FILE_MB * 2} MB. The heavy lifting went to the system built for it. Downloads work the same way with presigned GET URLs or a CDN.`
      : 'Parallel parts made it faster, and the failure cost 100 MB instead of the whole file. Add a lifecycle rule to abort uploads that never complete, because their stored parts still cost money.',
    calc: [`elapsed: ${fmtS(clock)}`, 'through your API: 0 MB', ...(flow === 'multipart' ? ['re-sent: 100 MB'] : [])],
  });
  return steps;
}
