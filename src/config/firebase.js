/**
 * Firebase web config for ByteCodeBrew (Google sign-in + Firestore sync).
 *
 * These values are not secrets: every Firebase web app ships them to the browser.
 * Access is protected by Firestore security rules (firestore.rules), which only
 * let a signed-in user read and write their own documents.
 *
 * Leave apiKey empty to run the site without accounts (everything stays in the browser).
 */
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

/** `VITE_FIREBASE_EMULATOR=1 npm run dev` talks to the local emulators instead (see README). */
export const useEmulator = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATOR === '1';

export const firebaseEnabled = useEmulator || Boolean(firebaseConfig.apiKey);
