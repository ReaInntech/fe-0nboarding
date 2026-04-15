// Mock auth-actions for Storybook (avoids loading Firebase Admin SDK)

export async function createSession(idToken: string) {
  console.warn('[Mock Auth] createSession called - this is a mock for Storybook');
  return { success: true };
}

export async function removeSession() {
  console.warn('[Mock Auth] removeSession called - this is a mock for Storybook');
  return { success: true };
}

export async function getSessionUser() {
  console.warn('[Mock Auth] getSessionUser called - this is a mock for Storybook');
  return null;
}
