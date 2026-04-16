'use server';

import { cookies } from 'next/headers';
import { adminAuth } from './admin';

const SESSION_COOKIE_NAME = 'session';
const ID_TOKEN_COOKIE_NAME = 'id_token';
const EXPIRES_IN = 60 * 60 * 24 * 5 * 1000; // 5 days
const ID_TOKEN_EXPIRES_IN = 60 * 60 * 1000; // 1 hour (Firebase standard)

/**
 * Creates a session cookie after verifying the Firebase ID token.
 */
export async function createSession(idToken: string) {
  try {
    // Verify the ID token first to ensure it's valid
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    if (!decodedToken) {
      return { success: false, error: 'Invalid token' };
    }

    // Create a session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn: EXPIRES_IN });

    // Set the cookies in the browser
    const cookieStore = await cookies();
    
    // 1. Next.js Session Cookie (for Middleware/Auth)
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // 2. Pure ID Token Cookie (for Microservice calls via SSR)
    cookieStore.set(ID_TOKEN_COOKIE_NAME, idToken, {
      maxAge: ID_TOKEN_EXPIRES_IN / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('[AuthAction] Error creating session:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Removes the session cookie.
 */
export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(ID_TOKEN_COOKIE_NAME);
  return { success: true };
}

/**
 * Helper to get the current session user on the server.
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!session) return null;

    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch (error) {
    console.error('[AuthAction] Error verifying session:', error);
    return null;
  }
}
