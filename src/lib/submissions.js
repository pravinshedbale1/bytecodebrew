import { useCallback, useEffect, useState } from 'react';
import { readJSON, writeJSON } from './storage';
import { onAuth } from '../hooks/useAuth';
import { loadFirebase } from './firebase';

/**
 * Submissions on practice problems: the latest MAX_SUBS per problem, newest first, each
 * { at, lang, status, passed, total, time, code }.
 *
 * Kept in this browser (bcb:subs:<slug>) and, when signed in, in the account at
 * users/{uid}/submissions/{slug} as { json, updatedAt }: one document per problem, so the history
 * never outgrows Firestore's document limit (the synced stores keep one document per store).
 * Opening a problem merges the two copies; a new submission is added to the account in a
 * transaction, so submissions from two devices never overwrite each other. If a write fails
 * (offline, or premium access lapsed), the browser copy keeps it and the next merge uploads it.
 */
export const MAX_SUBS = 20;
const MAX_JSON = 800000;          // firestore.rules allows 900,000 characters
const localKey = (slug) => `bcb:subs:${slug}`;

/** Older entries were all Java. */
const normalise = (list) => (Array.isArray(list) ? list.filter((s) => s && typeof s.at === 'number').map((s) => (s.lang ? s : { ...s, lang: 'java' })) : []);

/** Union by submission time, newest first, capped. */
export function mergeSubs(a, b) {
  const byAt = new Map();
  for (const s of [...normalise(b), ...normalise(a)]) byAt.set(s.at, s);
  return [...byAt.values()].sort((x, y) => y.at - x.at).slice(0, MAX_SUBS);
}

/** Drops the oldest submissions until the list fits in one document. */
function fit(list) {
  let out = list;
  while (out.length > 1 && JSON.stringify(out).length > MAX_JSON) out = out.slice(0, -1);
  return out;
}

export const readLocalSubs = (slug) => normalise(readJSON(localKey(slug), []));

async function remoteRef(uid, slug) {
  const fb = await loadFirebase();
  return fb ? { fb, ref: fb.fsMod.doc(fb.db, 'users', uid, 'submissions', slug) } : null;
}

const parse = (snap) => {
  if (!snap.exists()) return null;
  try { return normalise(JSON.parse(snap.data().json)); } catch { return null; }
};

/** Merges `add` into the account's copy and returns the result. */
async function pushRemote(uid, slug, add) {
  const r = await remoteRef(uid, slug);
  if (!r) return null;
  const { fb, ref } = r;
  return fb.fsMod.runTransaction(fb.db, async (tx) => {
    const snap = await tx.get(ref);
    const remote = parse(snap) ?? [];
    const merged = fit(mergeSubs(add, remote));
    const json = JSON.stringify(merged);
    if (!snap.exists() || snap.data().json !== json) tx.set(ref, { json, updatedAt: fb.fsMod.serverTimestamp() });
    return merged;
  });
}

let currentUid = null;
onAuth((auth) => { currentUid = auth.status === 'signed-in' ? auth.user.uid : null; });

/**
 * A problem's submissions: [subs, add]. `add(entry)` records a new submission here and, when signed
 * in, in the account.
 */
export function useSubmissions(slug) {
  const [subs, setSubs] = useState(() => readLocalSubs(slug));
  const [uid, setUid] = useState(currentUid);

  useEffect(() => onAuth((auth) => setUid(auth.status === 'signed-in' ? auth.user.uid : null)), []);

  const apply = useCallback((list) => {
    writeJSON(localKey(slug), list);
    setSubs(list);
  }, [slug]);

  // this browser's copy right away, then the account's merged in
  useEffect(() => {
    setSubs(readLocalSubs(slug));
    if (!uid) return undefined;
    let alive = true;
    pushRemote(uid, slug, readLocalSubs(slug))
      .then((merged) => { if (alive && merged) apply(mergeSubs(readLocalSubs(slug), merged)); })
      .catch(() => { /* offline or not allowed: the browser copy stands */ });
    return () => { alive = false; };
  }, [slug, uid, apply]);

  const add = useCallback((entry) => {
    const next = mergeSubs([entry], readLocalSubs(slug));
    apply(next);
    if (uid) {
      pushRemote(uid, slug, next)
        .then((merged) => { if (merged) apply(mergeSubs(readLocalSubs(slug), merged)); })
        .catch(() => {});
    }
  }, [slug, uid, apply]);

  return [subs, add];
}

/** Every submission document in the account (for "Delete my data"). */
export async function deleteRemoteSubmissions(fb, uid) {
  const snaps = await fb.fsMod.getDocs(fb.fsMod.collection(fb.db, 'users', uid, 'submissions'));
  await Promise.all(snaps.docs.map((d) => fb.fsMod.deleteDoc(d.ref)));
}
