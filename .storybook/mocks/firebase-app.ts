// Mock firebase/app for Storybook — prevents real Firebase initialization
export function initializeApp() {
  return { name: '[STORYBOOK-MOCK]', options: {}, automaticDataCollectionEnabled: false };
}

export function getApps() {
  return [{ name: '[STORYBOOK-MOCK]' }];
}

export function getApp() {
  return { name: '[STORYBOOK-MOCK]', options: {}, automaticDataCollectionEnabled: false };
}
