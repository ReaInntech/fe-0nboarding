import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Footer from '../Footer';

const meta: Meta<typeof Footer> = {
    title: 'Shared UI/molecules/Footer',
    component: Footer,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [{ name: 'dark', value: '#0f1523' }],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
