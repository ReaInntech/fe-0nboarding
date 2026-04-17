import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (error) {
  console.error('[Firebase Config] Failed to initialize Firebase App:', error);
}

// Ensure these are only accessed if app is valid
export const auth = app ? getAuth(app) : null as unknown as ReturnType<typeof getAuth>;
export const db = app ? getFirestore(app) : null as unknown as ReturnType<typeof getFirestore>;
export const googleProvider = new GoogleAuthProvider();

if (typeof window === 'undefined' && !firebaseConfig.apiKey) {
  console.warn('[Firebase Config] Warning: Firebase API Key is missing on the server. SSR initializations might fail.');
}

export { app };
