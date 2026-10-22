import { useSyncExternalStore } from 'react';
import { createSyncedStore } from '../lib/syncedStore';
import { migrate } from '../lib/runwayPlan';

/**
 * The learner's Runway (day-by-day interview plan, see lib/runwayPlan.js).
 * Shape: { plan: Plan | null, updatedAt: ISO }. A plan is edited as a whole, so on merge the newer one wins.
 * Plans are read through migrate(), so a version 1 plan saved before Runway 2 works unchanged.
 */
const store = createSyncedStore({
  name: 'runway',
  storageKey: 'bcb:runway',
  initial: {},
  merge: (local, remote) => ((local.updatedAt ?? '') >= (remote.updatedAt ?? '') ? local : remote),
});

// the same stored plan always gives the same migrated object, so React sees no change
const migrated = new WeakMap();
const read = (plan) => {
  if (!plan || plan.version >= 2) return plan ?? null;
  if (!migrated.has(plan)) migrated.set(plan, migrate(plan));
  return migrated.get(plan);
};

export function useRunway() {
  return read(useSyncExternalStore(store.subscribe, store.get).plan);
}

export const getRunway = () => read(store.get().plan);

/** False until the account's copy of the plan has been merged in, so automatic changes never overwrite a newer plan. */
export const useRunwaySettled = () => useSyncExternalStore(store.subscribe, store.isSettled);

// ---- undo: the plans before the learner's last edits, in this tab only
const UNDO_MAX = 20;
let undoStack = [];
const undoListeners = new Set();
const emitUndo = () => undoListeners.forEach((l) => l());

/**
 * Replace the plan, or update it with a function of the current plan. `null` deletes it.
 * Edits can be undone; pass { undo: false } for changes the learner didn't make (the daily re-plan).
 */
export function setRunway(next, { undo = true } = {}) {
  const before = getRunway();
  const value = typeof next === 'function' ? next(before) : next;
  if (value === before) return;
  store.set(() => ({ plan: value, updatedAt: new Date().toISOString() }));
  if (undo && before) {
    undoStack = [...undoStack, before].slice(-UNDO_MAX);
    emitUndo();
  }
}

/** Put back the plan as it was before the last edit. */
export function undoRunway() {
  const prev = undoStack.at(-1);
  if (!prev) return;
  undoStack = undoStack.slice(0, -1);
  store.set(() => ({ plan: prev, updatedAt: new Date().toISOString() }));
  emitUndo();
}

const subscribeUndo = (l) => { undoListeners.add(l); return () => undoListeners.delete(l); };
/** How many edits can be undone. */
export const useRunwayUndo = () => useSyncExternalStore(subscribeUndo, () => undoStack.length);
