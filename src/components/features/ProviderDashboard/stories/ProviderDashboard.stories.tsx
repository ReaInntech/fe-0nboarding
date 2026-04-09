import React from 'react';
import ProviderDashboard from '../ProviderDashboard';
import { SubscriptionData } from '../SubscriptionRow';

export default {
    title: 'Features/ProviderDashboard',
    component: ProviderDashboard,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
        },
    },
};

const mockUserProfile = {
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    clientType: 'provider'
};

const commonSteps = [
    { name: 'Initial Request', status: 'completed' as const },
    { name: 'Client Verification', status: 'completed' as const },
    { name: 'Legal Review', status: 'current' as const },
    { name: 'Configuration', status: 'pending' as const },
    { name: 'Provisioned', status: 'pending' as const }
];

const mockSubscriptions: SubscriptionData[] = [
    {
        id: 'sub-acme-001',
        client: {
            id: 'cli-acme-01',
            legalName: 'Acme Corp',
            clientType: 'legal_entity',
            email: 'admin@acmecorp.com',
            phone: '+1 (555) 123-4567'
        },
        product: {
            name: 'Enterprise Cloud Server',
            icon: 'cloud',
            iconColor: '#1978e5'
        },
        tierName: 'Platinum Tier',
        status: 'in_progress',
        monthlyPrice: 1500,
        pricePeriod: '/mo',
        provisionedAt: null,
        payments: [],
        documents: [
            { name: 'Master Service Agreement', status: 'signed' },
            { name: 'SLA Addendum', status: 'pending' }
        ],
        steps: commonSteps,
        requests: [
            { id: 'req-1', type: 'document_review', status: 'pending', title: 'Review SLA Addendum', dueDate: '2025-05-01T00:00:00Z' }
        ]
    },
    {
        id: 'sub-beta-002',
        client: {
            id: 'cli-beta-02',
            legalName: 'Jane Doe',
            clientType: 'person',
            email: 'jane@example.com',
            phone: '+1 (555) 987-6543'
        },
        product: {
            name: 'Managed Database',
            icon: 'database',
            iconColor: '#10b981'
        },
        tierName: 'Standard Tier',
        status: 'active',
        monthlyPrice: 250,
        pricePeriod: '/mo',
        provisionedAt: '2024-01-15T00:00:00Z',
        payments: [
            { id: 'pay-1', date: 'Mar 15, 2025', amount: 250, status: 'Paid', paymentMethod: 'Card ending in 4242' },
            { id: 'pay-2', date: 'Feb 15, 2025', amount: 250, status: 'Paid', paymentMethod: 'Card ending in 4242' }
        ],
        documents: [
            { name: 'Terms of Service', status: 'signed' }
        ],
        steps: [],
        requests: []
    }
];

export const Default = {
    args: {
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
    },
};

export const EmptyState = {
    args: {
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};
