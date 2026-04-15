// Mock firebase/auth for Storybook — prevents getAuth from requiring a valid API key

export function getAuth() {
  return {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      callback(null);
      return () => {};
    },
    signOut: async () => {},
    signInWithPopup: async () => ({ user: null }),
    signInWithEmailAndPassword: async () => ({ user: null }),
  };
}

export function initializeAuth() {
  return getAuth();
}

export function onAuthStateChanged(_auth: any, callback: any) {
  callback(null);
  return () => {};
}

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
  addScope() { return this; }
}

export class EmailAuthProvider {
  static PROVIDER_ID = 'password';
}

export function signInWithPopup() {
  return Promise.resolve({ user: null });
}

export function signInWithEmailAndPassword() {
  return Promise.resolve({ user: null });
}

export function signOut() {
  return Promise.resolve();
}

export function createUserWithEmailAndPassword() {
  return Promise.resolve({ user: null });
}

export function sendPasswordResetEmail() {
  return Promise.resolve();
}
