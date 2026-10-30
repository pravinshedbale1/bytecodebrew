import { firebaseConfig, firebaseEnabled, useEmulator } from '../config/firebase';

/**
 * Loads Firebase on demand, so the SDK never blocks the first paint.
 * Resolves to null when accounts are switched off (no config).
 *
 * loadAuth() fetches only the app and sign-in SDKs: enough to learn whether someone is signed in.
 * loadFirebase() adds Firestore (the largest part), which only signed-in accounts need, so visitors
 * who never sign in never download it.
 */
let authLoading = null;
let loading = null;

export function loadAuth() {
  if (!firebaseEnabled) return Promise.resolve(null);
  authLoading ??= (async () => {
    const [appMod, authMod] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
    const config = useEmulator
      ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-bytecodebrew' }   // "demo-" projects never touch the cloud
      : firebaseConfig;
    const app = appMod.getApps()[0] ?? appMod.initializeApp(config);
    const auth = authMod.getAuth(app);
    if (useEmulator) authMod.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    return { app, auth, authMod };
  })();
  return authLoading;
}

export function loadFirebase() {
  if (!firebaseEnabled) return Promise.resolve(null);
  loading ??= (async () => {
    const [{ app, auth, authMod }, fsMod] = await Promise.all([loadAuth(), import('firebase/firestore')]);
    const db = fsMod.getFirestore(app);
    if (useEmulator) fsMod.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    return { auth, db, authMod, fsMod };
  })();
  return loading;
}
