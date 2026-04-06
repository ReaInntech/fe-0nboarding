import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import NotificationItem from '../NotificationItem';

const meta: Meta<typeof NotificationItem> = {
    title: 'Shared UI/molecules/NotificationItem',
    component: NotificationItem,
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['info', 'warning', 'critical'],
        },
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '36rem', margin: '1rem auto', border: '1px solid #1e293b', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof NotificationItem>;

export const Info: Story = {
    args: {
        title: 'System Update',
        time: '1 day ago',
        message: 'Advanced API Analytics is now live. Access detailed usage reports in the Products tab.',
        variant: 'info',
    },
};

export const Warning: Story = {
    args: {
        title: 'Billing Warning',
        time: '4 hours ago',
        message: "Your 'Cloud Infrastructure' subscription payment is overdue. Please update payment method.",
        variant: 'warning',
    },
};

export const Critical: Story = {
    args: {
        title: 'Critical Alert',
        time: '2 mins ago',
        message: 'Service disruption detected in US-East-1. Our engineers are investigating the issue.',
        variant: 'critical',
    },
};
