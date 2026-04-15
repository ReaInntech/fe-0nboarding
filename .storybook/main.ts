import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    addons: [],
    staticDirs: ['../public'],
    webpackFinal: async (config) => {
        const projectRoot = path.resolve(__dirname, '..');

        if (!config.resolve) config.resolve = {};
        if (!config.resolve.alias) config.resolve.alias = {};

        // Use absolute paths so aliases intercept both relative and @/ imports
        config.resolve.alias[path.resolve(projectRoot, 'src/lib/firebase/auth-actions')] = path.resolve(__dirname, './mocks/auth-actions.ts');
        config.resolve.alias[path.resolve(projectRoot, 'src/lib/firebase/admin')] = path.resolve(__dirname, './mocks/admin.ts');
        config.resolve.alias[path.resolve(projectRoot, 'src/lib/firebase/config')] = path.resolve(__dirname, './mocks/firebase-config.ts');
        config.resolve.alias[path.resolve(projectRoot, 'src/context/AppContext')] = path.resolve(__dirname, './mocks/AppContext.tsx');
        config.resolve.alias['firebase-admin'] = path.resolve(__dirname, './mocks/firebase-admin.ts');
        config.resolve.alias['node-domexception'] = path.resolve(__dirname, './mocks/empty.ts');
        config.resolve.alias['google-auth-library'] = path.resolve(__dirname, './mocks/empty.ts');

        // Also mock the firebase SDK packages themselves to prevent any initialization
        config.resolve.alias['firebase/app'] = path.resolve(__dirname, './mocks/firebase-app.ts');
        config.resolve.alias['firebase/auth'] = path.resolve(__dirname, './mocks/firebase-auth.ts');
        config.resolve.alias['firebase/firestore'] = path.resolve(__dirname, './mocks/firebase-firestore.ts');
        
        // Handle node core modules that shouldn't be in browser
        if (!config.resolve.fallback) config.resolve.fallback = {};
        
        config.resolve.fallback = {
            ...config.resolve.fallback,
            'worker_threads': false,
            'node:worker_threads': false,
            'fs': false,
            'path': false,
            'crypto': false,
            'stream': false,
            'util': false,
            'os': false,
            'http': false,
            'https': false,
            'zlib': false,
            'node:zlib': false,
            'node:fs': false,
            'node:path': false,
            'node:crypto': false,
            'node:stream': false,
            'node:util': false,
            'node:os': false,
            'node:http': false,
            'node:https': false,
        };
        
        return config;
    },
};

export default config;
