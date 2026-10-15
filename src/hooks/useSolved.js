import { useSyncExternalStore, useCallback } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

const STORAGE_KEY = 'bcb:solved';

// Shape: { [leetcodeSlug]: ISOString of when it was marked solved }
let state = readJSON(STORAGE_KEY, {});
const listeners = new Set();

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

/** Practice problems the reader has marked as solved, shared by every page that lists problems. */
export function useSolved() {
  const solved = useSyncExternalStore(subscribe, getSnapshot);

  const isSolved = useCallback((slug) => Boolean(solved[slug]), [solved]);

  const toggleSolved = useCallback((slug) => {
    const next = { ...state };
    if (next[slug]) delete next[slug];
    else next[slug] = new Date().toISOString();
    state = next;
    writeJSON(STORAGE_KEY, state);
    listeners.forEach((l) => l());
  }, []);

  return { solved, isSolved, toggleSolved };
}

/** "https://leetcode.com/problems/two-sum/" → "two-sum"; null for any other link. */
export function problemSlug(href) {
  const m = /^https:\/\/leetcode\.com\/problems\/([a-z0-9-]+)\/?$/.exec(href ?? '');
  return m ? m[1] : null;
}
