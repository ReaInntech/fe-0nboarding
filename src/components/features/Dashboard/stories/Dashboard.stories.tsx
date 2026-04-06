import React from 'react';
import Dashboard from '../Dashboard';

export default {
    title: 'Features/Dashboard',
    component: Dashboard,
    parameters: {
        layout: 'fullscreen',
    },
};

const mockUserProfile = {
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    clientType: 'business'
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
        message: 'Advanced API Analytics is now live. All features are now available in your service dashboard.',
        variant: 'info' as const,
    }
];

const mockSubscriptions: any[] = [
    {
        id: '1',
        name: 'Cloud Infrastructure',
        tier: 'Pro Enterprise Tier',
        icon: 'cloud',
        badgeText: 'Auto-renews',
        badgeVariant: 'success',
        progressLabel: 'Billing Cycle Progress',
        progressValue: '24 days left',
        progressPct: 65,
        price: '$129.00',
        pricePeriod: '/mo'
    },
    {
        id: '2',
        name: 'Security Suite',
        tier: 'Advanced Protection',
        icon: 'security',
        badgeText: 'One-time',
        badgeVariant: 'default',
        progressLabel: 'License Validity',
        progressValue: '182 days remaining',
        progressPct: 45,
        price: '$499.00',
        pricePeriod: '/yr'
    },
    {
        id: '3',
        name: 'Storage Bucket',
        tier: '5TB Managed Storage',
        icon: 'database',
        badgeText: 'Auto-renews',
        badgeVariant: 'success',
        progressLabel: 'Usage Limit Progress',
        progressValue: '1.2TB remaining',
        progressPct: 78,
        price: '$89.00',
        pricePeriod: '/mo'
    }
];

export const Default = {
    args: {
        notifications: mockNotifications,
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
    },
};

export const EmptyState = {
    args: {
        notifications: [],
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};

export const NotificationsOnly = {
    args: {
        notifications: mockNotifications,
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};

export const ServicesOnly = {
    args: {
        notifications: [],
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
    },
};
