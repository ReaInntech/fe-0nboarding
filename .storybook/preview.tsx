import type { Preview } from '@storybook/react';
import React, { createContext, useContext, useState } from 'react';
import '../app/globals.css';

// Mock AppContext for Storybook (avoids loading server-only dependencies)
const MockAppContext = createContext<any>(undefined);

function MockAppProvider({ children }: { children: React.ReactNode }) {
  const [state] = useState({
    user: null,
    isLoading: false,
    error: null,
  });

  return (
    <MockAppContext.Provider value={{ ...state, setUser: () => {}, signOut: async () => {}, refreshProfile: async () => {} }}>
      {children}
    </MockAppContext.Provider>
  );
}

const preview: Preview = {
    globalTypes: {
        darkMode: {
            description: 'Global theme for components',
            toolbar: {
                title: 'Theme',
                icon: 'circlehollow',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        darkMode: 'light',
    },
    decorators: [
        (Story, context) => {
            const isDarkMode = context.globals.darkMode === 'dark';
            const htmlNode = document.documentElement;

            if (isDarkMode) {
                htmlNode.classList.add('dark');
                htmlNode.style.backgroundColor = '#0f1523';
            } else {
                htmlNode.classList.remove('dark');
                htmlNode.style.backgroundColor = '#f5f6f8';
            }

            return (
                <MockAppProvider>
                    <Story />
                </MockAppProvider>
            );
        },
    ],
    parameters: {
        nextjs: {
            appDirectory: true,
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
