'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase/config';
import { UserProfile, AppState } from '../types/user';

interface AppContextType extends AppState {
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL_INTERNAL;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Fetch profile from backend
  const fetchProfile = async (uid: string, token: string): Promise<UserProfile | null> => {
    try {
      const resp = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(resp, API_BASE_URL);
      if (resp.status === 404) {
        console.log('[AppContext] User not found in backend (404)');
        return null;
      }

      if (!resp.ok) {
        console.warn('[AppContext] Failed to fetch profile from backend with status:', resp.status);
        return null;
      }

      const result = await resp.json();
      return result.data || result;
    } catch (err) {
      console.error('[AppContext] Error fetching profile:', err);
      return null;
    }
  };

  // Register user in backend
  const registerUser = async (fbUser: FirebaseUser, token: string): Promise<UserProfile | null> => {
    if (!fbUser.email) {
      console.warn('[AppContext] Cannot register user without email');
      return null;
    }

    try {
      console.log('[AppContext] Attempting auto-registration for:', fbUser.email);
      const resp = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fbUser.displayName || fbUser.email.split('@')[0] || 'New User',
          email: fbUser.email
        })
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        console.error('[AppContext] Registration failed:', JSON.stringify(errorData, null, 2));
        return null;
      }

      const result = await resp.json();
      console.log('[AppContext] Registration successful');
      return result.data?.user || result.user || null;
    } catch (err) {
      console.error('[AppContext] Error during registration:', err);
      return null;
    }
  };

  useEffect(() => {
    console.log('[AppContext] Initializing Firebase Auth listener...');
    
    // Async function to handle server auth actions
    const setupAuthListener = async () => {
      let createSession: ((token: string) => Promise<any>) | null = null;
      let removeSession: (() => Promise<any>) | null = null;
      
      try {
        const { createSession: cs, removeSession: rs } = await import('../lib/firebase/auth-actions');
        createSession = cs;
        removeSession = rs;
      } catch (error) {
        console.warn('[AppContext] Server auth-actions not available. Running in client-only mode.');
      }

      const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          console.log('[AppContext] Firebase user detected:', fbUser.email);
          setState(prev => ({ ...prev, isLoading: true }));

          try {
            const idTokenResult = await fbUser.getIdTokenResult();
            const token = idTokenResult.token;
            const claims = idTokenResult.claims as any;

            // 1. Sync session cookie with server (if available)
            if (createSession) {
              await createSession(token);
            }

            // 2. Try to initialize state from Custom Claims (Zero-Fetch)
            if (claims.org_id && claims.role_name) {
              console.log('[AppContext] Zero-fetch: User claims found', claims);
              setState({
                user: {
                  id: fbUser.uid,
                  email: fbUser.email || '',
                  full_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                  role_name: claims.role_name,
                  firebasePhotoUrl: fbUser.photoURL || undefined,
                  organization: {
                    id: claims.org_id,
                    legal_name: claims.org_name || 'Organization', // Optional claim
                    client_type: claims.client_type || 'legal_entity',
                  }
                },
                isLoading: false,
                error: null
              });
              // Background sync just in case, or for truly extended data
              fetchProfile(fbUser.uid, token).then(profile => {
                 if (profile) {
                   profile.firebasePhotoUrl = fbUser.photoURL || undefined;
                   setState(prev => ({ ...prev, user: profile }));
                 }
              });
              return;
            }

            // 3. Fallback: Try to fetch extended profile from backend if claims are missing
            let profile = await fetchProfile(fbUser.uid, token);

            // 4. If profile not found, attempt auto-registration
            if (!profile) {
              profile = await registerUser(fbUser, token);

              if (profile) {
                // Registration successful - force token refresh to get new claims
                const newToken = await fbUser.getIdToken(true);
                profile = await fetchProfile(fbUser.uid, newToken);
              }
            }

             if (profile) {
               profile.firebasePhotoUrl = fbUser.photoURL || undefined;
               setState({ user: profile, isLoading: false, error: null });
             } else {
               console.error('[AppContext] Could not resolve user profile after registration attempt');
               setState({ user: null, isLoading: false, error: 'Registration failed' });
             }
          } catch (err) {
            console.error('[AppContext] Error syncing auth:', err);
            setState({ user: null, isLoading: false, error: 'Authentication error' });
          }
        } else {
          console.log('[AppContext] No Firebase user detected.');
          if (removeSession) {
            await removeSession();
          }
          setState({ user: null, isLoading: false, error: null });
        }
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | null = null;
    setupAuthListener().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


  const setUser = (user: UserProfile | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const signOut = async () => {
    await auth.signOut();
    await removeSession();
    setState({ user: null, isLoading: false, error: null });
  };

  const refreshProfile = async () => {
    const fbUser = auth.currentUser;
    if (fbUser) {
      const token = await fbUser.getIdToken(true);
      const profile = await fetchProfile(fbUser.uid, token);
      if (profile) setUser(profile);
    }
  };

  const value: AppContextType = {
    ...state,
    setUser,
    signOut,
    refreshProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
