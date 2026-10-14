import { useSyncExternalStore, useCallback } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

const STORAGE_KEY = 'bcb:progress';

// Shape: { [lessonKey]: { completedAt: ISOString } , __lastVisited: lessonKey }
let state = readJSON(STORAGE_KEY, {});
const listeners = new Set();

function emit() {
  writeJSON(STORAGE_KEY, state);
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, getSnapshot);

  const isComplete = useCallback((key) => Boolean(progress[key]?.completedAt), [progress]);

  const setComplete = useCallback((key, done) => {
    const next = { ...state };
    if (done) next[key] = { completedAt: new Date().toISOString() };
    else delete next[key];
    state = next;
    emit();
  }, []);

  const markVisited = useCallback((key) => {
    if (state.__lastVisited === key) return;
    state = { ...state, __lastVisited: key };
    emit();
  }, []);

  return { isComplete, setComplete, markVisited, lastVisited: progress.__lastVisited ?? null };
}
