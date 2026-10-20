import { useSyncExternalStore } from 'react';
import { CLAUDE_MODEL } from '../config/services';
import { readJSON, writeJSON } from './storage';
import { onAuth } from '../hooks/useAuth';
import { loadFirebase } from './firebase';
import { viewAs, noteReadOnly } from './viewAs';

/**
 * The AI interviewer calls the Claude API straight from the browser with the learner's own API key.
 *
 * The key is saved to the learner's account, users/{uid}/private/settings { claudeKey }, so it works
 * on every device they sign in on; firestore.rules let only that account read or write it, and it is
 * sent nowhere except api.anthropic.com. This browser keeps a copy (bcb:anthropic-key) for instant
 * use; signing out removes that copy. A key saved before account storage existed is uploaded the
 * first time its owner signs in (only when the account has never had a settings document, so a key
 * removed on another device is never brought back). The SDK is loaded on first use.
 */
const KEY = 'bcb:anthropic-key';

let current = readJSON(KEY, '') || '';
const listeners = new Set();
let uid = null;
let stop = null;

function setLocal(k) {
  if (k === current) return;
  current = k;
  writeJSON(KEY, k);
  listeners.forEach((l) => l());
}

async function settingsDoc() {
  const fb = await loadFirebase();
  return uid && fb ? { fb, ref: fb.fsMod.doc(fb.db, 'users', uid, 'private', 'settings') } : null;
}

/** Write the key to the account; resolves only once the account has confirmed it (or fails after 15 s). */
async function saveRemote(k) {
  const d = await settingsDoc();
  if (!d) return;
  const write = d.fb.fsMod.setDoc(d.ref, { claudeKey: k, updatedAt: d.fb.fsMod.serverTimestamp() });
  await Promise.race([write, new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('Your account didn’t answer in time'), { code: 'timeout' })), 15000))]);
}

onAuth((auth) => {
  if (viewAs) return;                        // admin "view as": the learner's key stays private
  const next = auth.status === 'signed-in' ? auth.user.uid : null;
  if (next === uid) return;
  stop?.();
  stop = null;
  if (uid && !next) setLocal('');            // signed out: don't leave the key behind in this browser
  uid = next;
  if (!uid) return;
  settingsDoc().then((d) => {
    if (!d || uid !== auth.user.uid) return;
    stop = d.fb.fsMod.onSnapshot(d.ref, (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      if (!snap.exists()) {
        if (current) saveRemote(current).catch(() => {});     // one-time move of a browser-only key
        return;
      }
      setLocal(snap.data().claudeKey ?? '');
    }, () => { /* offline or rules: the browser copy keeps working */ });
  });
});

// another tab of this browser saved or removed the key
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    current = readJSON(KEY, '') || '';
    listeners.forEach((l) => l());
  });
}

export const getApiKey = () => current;

/** The key for React components, updating when it changes here or on another device. */
export function useApiKey() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => current);
}

/** Save the key here and to the account. Resolves when the account has confirmed it (at once when signed out); rejects if it couldn't. */
export async function setApiKey(k) {
  if (viewAs) { noteReadOnly(); throw new Error('This is a read-only view of another learner.'); }
  const key = k.trim();
  setLocal(key);
  await saveRemote(key);
}

/** Remove the key here and from the account (and so from every device). */
export async function clearApiKey() {
  if (viewAs) { noteReadOnly(); throw new Error('This is a read-only view of another learner.'); }
  setLocal('');
  await saveRemote('');
}

/** Whether the key is saved to an account (vs. only this browser, when signed out). */
export const keySavedToAccount = () => Boolean(uid);

let sdk = null;
const loadSdk = () => (sdk ??= import('@anthropic-ai/sdk').then((m) => m.default));

function friendlyError(Anthropic, e) {
  if (e instanceof Anthropic.AuthenticationError) return 'That API key was rejected. Check it in Settings.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'This API key is not allowed to use the model.';
  if (e instanceof Anthropic.RateLimitError) return 'Rate limited by the Claude API. Wait a moment and try again.';
  if (e instanceof Anthropic.APIUserAbortError) return null;
  if (e instanceof Anthropic.APIConnectionError) return 'Could not reach the Claude API. Check your connection.';
  if (e instanceof Anthropic.APIError) return `Claude API error ${e.status ?? ''}: ${e.message}`;
  return e?.message ?? 'Something went wrong.';
}

/**
 * Stream one reply. `onText(delta)` receives text as it arrives; resolves to the full text.
 * Opus 5.5 always thinks; effort controls how much (low for chat turns, medium for written feedback).
 */
export async function streamClaude({ system, messages, effort = 'low', maxTokens = 16000, onText, signal }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Add your Claude API key in Settings first.');
  const Anthropic = await loadSdk();
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    const stream = client.beta.messages.stream(
      {
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        system,
        messages,
        output_config: { effort },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      },
      { signal },
    );
    stream.on('text', (t) => onText?.(t));
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('The model declined to answer that. Try rephrasing.');
    return msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  } catch (e) {
    const text = friendlyError(Anthropic, e);
    if (text == null) return null;     // aborted by the user
    throw new Error(text);
  }
}
