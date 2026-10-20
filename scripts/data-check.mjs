#!/usr/bin/env node
/**
 * "Delete my data" must reach everything a learner stores. Checks that the synced stores the app
 * creates, the documents deleteAllData removes (STATE_DOCS) and the names firestore.rules allows
 * (freeNames + premiumNames, plus the 'reset' marker) are the same set, and that every premium store
 * in src/config/access.js is a premium name in the rules. Part of `npm run check`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const list = (text, re) => [...(re.exec(text)?.[1] ?? '').matchAll(/'([a-z]+)'/g)].map((m) => m[1]);

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.jsx?$/.test(f) ? [p] : [];
  });
}
const stores = new Set(files(join(root, 'src')).flatMap((p) => [...readFileSync(p, 'utf8').matchAll(/createSyncedStore\(\{\s*name:\s*'([a-z]+)'/g)].map((m) => m[1])));
const stateDocs = new Set(list(read('src/lib/accountData.js'), /STATE_DOCS = \[([^\]]*)\]/));
const rules = read('firestore.rules');
const free = list(rules, /function freeNames\(\) \{\s*return \[([^\]]*)\]/);
const premium = list(rules, /function premiumNames\(\) \{\s*return \[([^\]]*)\]/);
const premiumStores = list(read('src/config/access.js'), /PREMIUM_STORES = \[([^\]]*)\]/);

let failures = 0;
const check = (ok, msg) => { if (!ok) { failures += 1; console.log(`✗ ${msg}`); } };
for (const s of stores) check(stateDocs.has(s), `store '${s}' is not in STATE_DOCS: Delete my data would leave it in the account`);
for (const d of stateDocs) check(stores.has(d), `STATE_DOCS lists '${d}' but no store creates it`);
const ruleNames = new Set([...free, ...premium]);
for (const d of stateDocs) check(ruleNames.has(d), `firestore.rules doesn't allow '${d}'`);
for (const n of ruleNames) check(n === 'reset' || stateDocs.has(n), `firestore.rules allows '${n}' but Delete my data doesn't remove it`);
check(free.includes('reset'), "firestore.rules must allow the 'reset' marker");
check(!stateDocs.has('reset'), "STATE_DOCS must not delete the 'reset' marker");
for (const p of premiumStores) check(premium.includes(p), `premium store '${p}' is not a premium name in firestore.rules`);
for (const p of premium) check(premiumStores.includes(p), `firestore.rules premium name '${p}' is not in PREMIUM_STORES`);

console.log(failures ? `\n${failures} problem${failures === 1 ? '' : 's'} with Delete my data` : `✓ Delete my data covers all ${stores.size} synced stores, the rules and the premium list agree`);
process.exit(failures ? 1 : 0);
