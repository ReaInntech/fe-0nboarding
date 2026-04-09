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
    try {
      const savedUser = localStorage.getItem('saslution_user');
      if (savedUser) {
        setState(prev => ({ ...prev, user: JSON.parse(savedUser), isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to load user session' }));
    }
  }, []);

  const setUser = (user: UserProfile | null) => {
    setState(prev => ({ ...prev, user }));
    if (user) {
      localStorage.setItem('saslution_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('saslution_user');
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setState(prev => {
      const newUser = prev.user ? { ...prev.user, ...updates } : updates as UserProfile;
      localStorage.setItem('saslution_user', JSON.stringify(newUser));
      return { ...prev, user: newUser };
    });
  };

  const clearStorage = () => {
    localStorage.removeItem('saslution_user');
    setState(prev => ({ ...prev, user: null }));
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
