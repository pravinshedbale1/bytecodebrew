import { useSyncExternalStore, useCallback } from 'react';
import { createSyncedStore, mergeArrays } from '../lib/syncedStore';
import { logActivity } from './useActivity';

/*
 * Stores behind active recall. All of them save in the browser and sync to the account when signed in.
 *
 *  quiz      { [lessonKey]: { [questionId]: { first: bool, last: bool, at: ISO } } }   (id = hash of the question text)
 *            `first` is the first attempt (honest score), `last` the most recent one.
 *  practice  { [lessonKey + '#' + taskId]: { text, rating: 'nailed'|'partial'|'missed', at: ISO } }
 *  reviews   { [cardId]: { box, due: 'YYYY-MM-DD', last: ISO, reps, lapses, introduced: 'YYYY-MM-DD' } }
 *  mocks     [{ at, type, prompt, minutes, notes, rubric: { [criterion]: bool }, signal, aiFeedback? }]
 */

/** Merge two { key: record-with-`at`-or-`last` } maps, keeping the newer record per key. */
const newerWins = (field) => (local, remote) => {
  const out = { ...remote };
  for (const [k, v] of Object.entries(local)) {
    const r = remote[k];
    out[k] = !r || (v?.[field] ?? '') >= (r?.[field] ?? '') ? v : r;
  }
  return out;
};

const quizStore = createSyncedStore({
  name: 'quiz',
  storageKey: 'bcb:quiz',
  initial: {},
  merge: (local, remote) => {
    const out = { ...remote };
    for (const [lesson, answers] of Object.entries(local)) out[lesson] = newerWins('at')(answers, remote[lesson] ?? {});
    return out;
  },
});

const practiceStore = createSyncedStore({ name: 'practice', storageKey: 'bcb:practice', initial: {}, merge: newerWins('at') });
const reviewStore = createSyncedStore({ name: 'reviews', storageKey: 'bcb:reviews', initial: {}, merge: newerWins('last') });
const mockStore = createSyncedStore({
  name: 'mocks',
  storageKey: 'bcb:mocks',
  initial: [],
  merge: mergeArrays('at', { sort: (a, b) => b.at.localeCompare(a.at), limit: 50 }),
});

const useStore = (store) => useSyncExternalStore(store.subscribe, store.get);

// ---- quiz

export function useQuizResults() {
  return useStore(quizStore);
}

export function recordQuizAnswer(lessonKey, id, correct) {
  quizStore.set((prev) => {
    const lesson = prev[lessonKey] ?? {};
    const old = lesson[id];
    const rec = { first: old ? old.first : correct, last: correct, at: new Date().toISOString() };
    return { ...prev, [lessonKey]: { ...lesson, [id]: rec } };
  });
  logActivity('quiz');
}

/**
 * One-off migration from position-based ids (early builds) to text-hash ids.
 * mapQuiz(lessonKey, index) and mapReview(id) return the new id, or null to keep the old one.
 */
export function migrateLearningIds(mapQuiz, mapReview) {
  const quiz = quizStore.get();
  if (Object.values(quiz).some((answers) => Object.keys(answers).some((k) => /^\d+$/.test(k)))) {
    quizStore.set((prev) => Object.fromEntries(Object.entries(prev).map(([lesson, answers]) => [
      lesson,
      Object.fromEntries(Object.entries(answers).map(([k, v]) => [/^\d+$/.test(k) ? mapQuiz(lesson, Number(k)) ?? k : k, v])),
    ])));
  }
  const reviews = reviewStore.get();
  if (Object.keys(reviews).some((id) => /^(qa|quiz):.+:\d+$/.test(id))) {
    reviewStore.set((prev) => Object.fromEntries(Object.entries(prev).map(([id, v]) => [/^(qa|quiz):.+:\d+$/.test(id) ? mapReview(id) ?? id : id, v])));
  }
}

// ---- practice

export function usePracticeLog() {
  return useStore(practiceStore);
}

export function savePracticeAttempt(id, text, rating) {
  practiceStore.set((prev) => ({ ...prev, [id]: { text, rating, at: new Date().toISOString() } }));
  logActivity('practice');
}

// ---- reviews

export function useReviewState() {
  return useStore(reviewStore);
}

export const setReviewCard = (id, state) => reviewStore.set((prev) => ({ ...prev, [id]: state }));

// ---- mocks

export function useMocks() {
  const mocks = useStore(mockStore);
  const addMock = useCallback((m) => {
    mockStore.set((prev) => [m, ...prev].slice(0, 50));
    logActivity('mock');
  }, []);
  const updateMock = useCallback((at, patch) => {
    mockStore.set((prev) => prev.map((m) => (m.at === at ? { ...m, ...patch } : m)));
  }, []);
  const removeMock = useCallback((at) => mockStore.set((prev) => prev.filter((m) => m.at !== at)), []);
  return { mocks, addMock, updateMock, removeMock };
}
