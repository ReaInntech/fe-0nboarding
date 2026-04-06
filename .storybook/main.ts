import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    addons: [],
    staticDirs: ['../public'],
};

export default config;
