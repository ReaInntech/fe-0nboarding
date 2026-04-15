// Mock firebase/config for Storybook
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: any) => {
    callback(null);
    return () => {};
  },
};

export const db = {};

export const googleProvider = {};
