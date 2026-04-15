import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TopNavigation from '../TopNavigation';

const meta: Meta<typeof TopNavigation> = {
    title: 'Shared UI/molecules/TopNavigation',
    component: TopNavigation,
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        activeTab: {
            control: { type: 'select' },
            options: ['Services', 'Billing', 'Support'],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: '8rem', background: '#0f1523' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof TopNavigation>;

export const Default: Story = {
    args: {
        activeTab: 'Services',
        userProfile: {
            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            clientType: 'business',
        },
    },
};
