import { useSyncExternalStore } from 'react';
import { createSyncedStore } from '../lib/syncedStore';

/**
 * The learner's Runway (day-by-day interview plan, see lib/runwayPlan.js).
 * Shape: { plan: Plan | null, updatedAt: ISO }. A plan is edited as a whole, so on merge the newer one wins.
 */
const store = createSyncedStore({
  name: 'runway',
  storageKey: 'bcb:runway',
  initial: {},
  merge: (local, remote) => ((local.updatedAt ?? '') >= (remote.updatedAt ?? '') ? local : remote),
});

export function useRunway() {
  return useSyncExternalStore(store.subscribe, store.get).plan ?? null;
}

/** Replace the plan, or update it with a function of the current plan. `null` deletes it. */
export function setRunway(next) {
  store.set((prev) => ({ plan: typeof next === 'function' ? next(prev.plan ?? null) : next, updatedAt: new Date().toISOString() }));
}
