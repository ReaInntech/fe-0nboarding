import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ProviderTopNavigation from '../ProviderTopNavigation';

const meta: Meta<typeof ProviderTopNavigation> = {
    title: 'Shared UI/molecules/ProviderTopNavigation',
    component: ProviderTopNavigation,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [{ name: 'dark', value: '#0f1523' }],
        },
    },
    argTypes: {
        activeTab: {
            control: { type: 'select' },
            options: ['Dashboard', 'Finance', 'Products', 'Chat', 'Settings'],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ height: '100vh', width: '100%', position: 'relative', paddingTop: '4rem', fontFamily: 'inherit' }}>
                <Story />
                <div style={{ padding: '2rem', color: '#94a3b8' }}>
                    <p>Sample Provider dashboard content below the navigation bar.</p>
                </div>
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof ProviderTopNavigation>;

export const DashboardActive: Story = {
    args: { activeTab: 'Dashboard' },
};

export const FinanceActive: Story = {
    args: { activeTab: 'Finance' },
};

export const ProductsActive: Story = {
    args: { activeTab: 'Products' },
};

export const ChatActive: Story = {
    args: { activeTab: 'Chat' },
};
