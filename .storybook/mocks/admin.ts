// Mock admin.ts for Storybook - Replaces src/lib/firebase/admin.ts
// This prevents the real admin.ts from being bundled since it imports firebase-admin
// which is a Node.js-only package

export const adminAuth = {
  verifyIdToken: async (token: string) => ({ uid: 'mock-user', email: 'test@example.com' }),
  createSessionCookie: async (token: string, options: any) => 'mock-session-cookie',
  verifySessionCookie: async (cookie: string, checkRevoked: boolean) => ({ 
    uid: 'mock-user',
    email: 'test@example.com' 
  }),
  getUser: async (uid: string) => ({
    uid,
    email: 'test@example.com',
    displayName: 'Test User',
  }),
};

export const adminDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => ({ 
        exists: false,
        data: () => ({})
      }),
      set: async (data: any) => {},
      update: async (data: any) => {},
      delete: async () => {},
    }),
    where: () => ({
      get: async () => ({ docs: [] })
    }),
    add: async (data: any) => ({ id: 'mock-doc-id' }),
  }),
};
