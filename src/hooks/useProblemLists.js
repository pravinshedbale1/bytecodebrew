import { useSyncExternalStore, useMemo } from 'react';
import { createSyncedStore, mergeObjects } from '../lib/syncedStore';

/**
 * The learner's own problem lists ("Graphs to redo", "Google week"), synced when signed in.
 * Shape: { [id]: { id, name, slugs: [slug…], createdAt, updatedAt, deleted? } }.
 * A deleted list stays as a small tombstone ({ deleted: true }) so a device that still has it
 * doesn't bring it back on its next merge. On conflicts the most recently changed copy wins.
 */
export const MAX_LISTS = 50;
export const MAX_LIST_SIZE = 500;
export const MAX_NAME = 60;

const newer = (a, b) => ((a?.updatedAt ?? '') >= (b?.updatedAt ?? '') ? a : b);
const store = createSyncedStore({ name: 'lists', storageKey: 'bcb:lists', initial: {}, merge: mergeObjects(newer) });

const now = () => new Date().toISOString();
const cleanName = (name) => String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME);

/** Live lists (not deleted), oldest first. */
export function liveLists(all) {
  return Object.values(all).filter((l) => l && !l.deleted).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function change(id, fn) {
  store.set((prev) => {
    const cur = prev[id];
    if (!cur || cur.deleted) return prev;
    const next = fn(cur);
    return next === cur ? prev : { ...prev, [id]: { ...next, updatedAt: now() } };
  });
}

/**
 * Creates a list and returns its id (null when the name is empty or there are too many lists).
 * A name that is already taken (ignoring case) adds the problems to that list instead.
 */
export function createList(name, slugs = []) {
  const clean = cleanName(name);
  if (!clean) return null;
  const live = liveLists(store.get());
  const same = live.find((l) => l.name.toLowerCase() === clean.toLowerCase());
  if (same) {
    slugs.forEach((s) => addToList(same.id, s));
    return same.id;
  }
  if (live.length >= MAX_LISTS) return null;
  const id = `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const at = now();
  store.set((prev) => ({ ...prev, [id]: { id, name: clean, slugs: [...new Set(slugs)].slice(0, MAX_LIST_SIZE), createdAt: at, updatedAt: at } }));
  return id;
}

export function renameList(id, name) {
  const clean = cleanName(name);
  if (clean) change(id, (l) => (l.name === clean ? l : { ...l, name: clean }));
}

export function deleteList(id) {
  store.set((prev) => (prev[id] ? { ...prev, [id]: { id, deleted: true, createdAt: prev[id].createdAt, updatedAt: now() } } : prev));
}

export function addToList(id, slug) {
  change(id, (l) => (l.slugs.includes(slug) || l.slugs.length >= MAX_LIST_SIZE ? l : { ...l, slugs: [...l.slugs, slug] }));
}

export function removeFromList(id, slug) {
  change(id, (l) => (l.slugs.includes(slug) ? { ...l, slugs: l.slugs.filter((s) => s !== slug) } : l));
}

export function toggleInList(id, slug) {
  const l = store.get()[id];
  if (l?.slugs?.includes(slug)) removeFromList(id, slug);
  else addToList(id, slug);
}

/** Moves a problem one place up (-1) or down (+1) in its list. */
export function moveInList(id, slug, by) {
  change(id, (l) => {
    const i = l.slugs.indexOf(slug);
    const j = i + by;
    if (i < 0 || j < 0 || j >= l.slugs.length) return l;
    const slugs = [...l.slugs];
    [slugs[i], slugs[j]] = [slugs[j], slugs[i]];
    return { ...l, slugs };
  });
}

/** Every live list, plus a lookup by id. */
export function useProblemLists() {
  const all = useSyncExternalStore(store.subscribe, store.get);
  return useMemo(() => {
    const lists = liveLists(all);
    return { lists, byId: (id) => lists.find((l) => l.id === id) ?? null };
  }, [all]);
}
