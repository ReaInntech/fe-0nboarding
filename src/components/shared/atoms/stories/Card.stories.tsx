import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Card from '../Card';

const meta: Meta<typeof Card> = {
    title: 'Shared UI/atoms/Card',
    component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    args: {
        children: (
            <div className="text-slate-700 dark:text-slate-300">
                <h3 className="text-lg font-bold mb-2">Card Title</h3>
                <p>This is standard card content with default padding.</p>
            </div>
        ),
    },
};

export const NoPadding: Story = {
    args: {
        noPadding: true,
        children: (
            <div className="bg-emerald-500/10 text-emerald-500 p-8 rounded-xl text-center font-bold">
                A custom deeply colored card with `noPadding` enabled.
            </div>
        ),
    },
};
