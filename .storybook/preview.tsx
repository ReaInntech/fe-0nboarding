import type { Preview } from '@storybook/react';
import React from 'react';
import { AppProvider } from '../src/context/AppContext';
import '../app/globals.css';

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
                <AppProvider>
                    <Story />
                </AppProvider>
            );
        },
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },
};

export default preview;
