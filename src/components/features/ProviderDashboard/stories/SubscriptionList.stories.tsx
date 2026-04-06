import React from 'react';
import SubscriptionList from '../SubscriptionList';
import { SubscriptionData } from '../SubscriptionRow';

export default {
    title: 'Provider/Components/Organisms/ProviderDashboard/SubscriptionList',
    component: SubscriptionList,
};

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
        documents: [],
        steps: [],
        requests: []
    },
    {
        id: 'sub-beta-002',
        client: {
            id: 'cli-beta-02',
            legalName: 'Beta Logistics',
            clientType: 'legal_entity',
            email: 'billing@betalogistics.com',
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
        payments: [],
        documents: [],
        steps: [],
        requests: []
    }
];

export const Default = {
    args: {
        subscriptions: mockSubscriptions,
    },
};
