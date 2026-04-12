'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, AppState } from '../types/user';

interface AppContextType extends AppState {
  setUser: (user: UserProfile | null) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  clearStorage: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    console.log('[AppContext] Initializing session state...');
    try {
      if (typeof window !== 'undefined') {
        const savedUser = localStorage.getItem('saslution_user');
        console.log('[AppContext] Saved user found:', savedUser ? 'Yes' : 'No');
        
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setState({ user, isLoading: false, error: null });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        // This shouldn't happen inside useEffect, but for safety:
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error('[AppContext] Error loading user from localStorage:', err);
      setState({ user: null, isLoading: false, error: 'Failed to load user session' });
    }
  }, []);

  const setUser = (user: UserProfile | null) => {
    console.log('[AppContext] Setting user:', user ? user.email : 'null');
    setState(prev => ({ ...prev, user, isLoading: false }));
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('saslution_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('saslution_user');
      }
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setState(prev => {
      const newUser = prev.user ? { ...prev.user, ...updates } : updates as UserProfile;
      if (typeof window !== 'undefined') {
        localStorage.setItem('saslution_user', JSON.stringify(newUser));
      }
      return { ...prev, user: newUser, isLoading: false };
    });
  };

  const clearStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saslution_user');
    }
    setState({ user: null, isLoading: false, error: null });
  };

  const value: AppContextType = {
    ...state,
    setUser,
    updateUser,
    clearStorage,
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
