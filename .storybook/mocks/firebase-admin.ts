// Mock firebase-admin for Storybook

export const initializeApp = () => {};

export const apps = [];

export const auth = () => ({
  verifyIdToken: async (token: string) => ({ uid: 'mock-user' }),
  createSessionCookie: async (token: string, options: any) => 'mock-session-cookie',
  verifySessionCookie: async (cookie: string, checkRevoked: boolean) => ({ uid: 'mock-user' }),
});

export const firestore = () => ({});

export const credential = {
  cert: (config: any) => config,
};

export default {
  initializeApp,
  apps,
  auth,
  firestore,
  credential,
};
