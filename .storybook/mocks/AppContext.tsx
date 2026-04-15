'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserProfile, AppState } from '../../src/types/user';

interface AppContextType extends AppState {
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state] = useState<AppState>({
    user: null,
    isLoading: false,
    error: null,
  });

  const value: AppContextType = {
    ...state,
    setUser: () => {},
    signOut: async () => {},
    refreshProfile: async () => {},
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    return {
      user: null,
      isLoading: false,
      error: null,
      setUser: () => {},
      signOut: async () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}
