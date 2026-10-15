/**
 * Firebase web config for ByteCodeBrew (Google sign-in + Firestore sync).
 *
 * These values are not secrets: every Firebase web app ships them to the browser.
 * Access is protected by Firestore security rules (firestore.rules), which only
 * let a signed-in user read and write their own documents.
 *
 * Project: bytecodebrew-53f0c (Spark plan, Firestore in asia-south1). Set apiKey to '' to run the
 * site without accounts (everything then stays in the browser).
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyDLATfNwKaUCUB9QKIvjEjvaQabA2Jufac',
  authDomain: 'bytecodebrew-53f0c.firebaseapp.com',
  projectId: 'bytecodebrew-53f0c',
  storageBucket: 'bytecodebrew-53f0c.firebasestorage.app',
  messagingSenderId: '580073582238',
  appId: '1:580073582238:web:ada3e4a75ba20b6fbc158f',
};

/** `VITE_FIREBASE_EMULATOR=1 npm run dev` talks to the local emulators instead (see README). */
export const useEmulator = import.meta.env.DEV && import.meta.env.VITE_FIREBASE_EMULATOR === '1';

export const firebaseEnabled = useEmulator || Boolean(firebaseConfig.apiKey);
