import { SYNCED_STORES } from './syncedStore';

/**
 * "Download my data" and "Delete my data": everything ByteCodeBrew keeps about a learner lives in
 * the synced stores (browser + account) and a few browser-only keys prefixed "bcb:".
 */
const PREFIX = 'bcb:';
// Never exported: secrets stay in the browser that holds them.
const PRIVATE = new Set(['bcb:anthropic-key']);

function browserKeys() {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  } catch {
    return [];
  }
}

export function exportData() {
  const stores = Object.fromEntries(SYNCED_STORES.map((s) => [s.name, s.get()]));
  const storeKeys = new Set(SYNCED_STORES.map((s) => s.storageKey));
  const browser = {};
  for (const k of browserKeys()) {
    if (PRIVATE.has(k) || storeKeys.has(k)) continue;
    try { browser[k] = JSON.parse(localStorage.getItem(k)); } catch { browser[k] = localStorage.getItem(k); }
  }
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), stores, browser }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bytecodebrew-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Erase progress, solves, reviews, notes… here and in the signed-in account; keeps only the theme. */
export async function deleteAllData() {
  await Promise.all(SYNCED_STORES.map((s) => s.reset().catch(() => {})));
  for (const k of browserKeys()) if (k !== 'bcb:theme') {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  }
}
