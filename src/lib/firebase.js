import { firebaseConfig, firebaseEnabled, useEmulator } from '../config/firebase';

/**
 * Loads Firebase on demand, so the SDK never blocks the first paint.
 * Resolves to null when accounts are switched off (no config).
 */
let loading = null;

export function loadFirebase() {
  if (!firebaseEnabled) return Promise.resolve(null);
  loading ??= (async () => {
    const [appMod, authMod, fsMod] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
    ]);
    const config = useEmulator
      ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-bytecodebrew' }   // "demo-" projects never touch the cloud
      : firebaseConfig;
    const app = appMod.getApps()[0] ?? appMod.initializeApp(config);
    const auth = authMod.getAuth(app);
    const db = fsMod.getFirestore(app);
    if (useEmulator) {
      authMod.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      fsMod.connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    return { auth, db, authMod, fsMod };
  })();
  return loading;
}
