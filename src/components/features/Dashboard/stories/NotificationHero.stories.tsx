import React from 'react';
import NotificationHero from '../NotificationHero';

export default {
    title: 'Client/Components/Organisms/Dashboard/NotificationHero',
    component: NotificationHero,
    parameters: {
        layout: 'fullscreen',
    },
};

const mockNotifications = [
    {
        title: 'Critical Alert',
        time: '2 mins ago',
        message: 'Service disruption detected in US-East-1. Our engineers are investigating the issue.',
        variant: 'critical' as const,
    },
    {
        title: 'Billing Warning',
        time: '4 hours ago',
        message: "Your 'Cloud Infrastructure' subscription payment is overdue. Please update payment method.",
        variant: 'warning' as const,
    },
    {
        title: 'System Update',
        time: '1 day ago',
        message: 'Advanced API Analytics is now live. Access detailed usage reports in the Products tab.',
        variant: 'info' as const,
    },
];

export const Default = {
    args: {
        notifications: mockNotifications,
    },
    decorators: [
        (Story: any) => (
            <div className="bg-[#f5f6f8] dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 font-sans min-h-screen p-8">
                <div className="max-w-7xl mx-auto">
                    <Story />
                </div>
            </div>
        ),
    ],
};
