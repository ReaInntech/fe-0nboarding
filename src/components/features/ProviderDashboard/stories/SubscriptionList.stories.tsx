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
            legalName: 'Acme Corp International',
            clientType: 'legal_entity',
            email: 'admin@acmecorp.com',
            phone: '+1 (555) 123-4567'
        },
        product: {
            name: 'Enterprise Cloud Suite',
            icon: 'cloud',
            iconColor: '#3b82f6'
        },
        tierName: 'Platinum Enterprise',
        status: 'in_progress',
        monthlyPrice: 1500,
        pricePeriod: '/mo',
        provisionedAt: null,
        payments: [
            { id: 'p1', date: 'Apr 10, 2025', amount: 1500, status: 'Paid', paymentMethod: 'Wire Transfer' }
        ],
        documents: [
            { name: 'Master Agreement', status: 'signed' },
            { name: 'SLA v2', status: 'pending' }
        ],
        steps: [
            { name: 'Request', status: 'completed' },
            { name: 'Vetting', status: 'completed' },
            { name: 'Review', status: 'current' },
            { name: 'Setup', status: 'pending' }
        ],
        requests: [
            { id: 'r1', type: 'document_review', status: 'pending', title: 'Sign SLA v2' }
        ]
    },
    {
        id: 'sub-beta-002',
        client: {
            id: 'cli-beta-02',
            legalName: 'Sarah Jenkins',
            clientType: 'person',
            email: 'sarah.j@freelance.io',
            phone: '+1 (555) 987-6543'
        },
        product: {
            name: 'Managed Database Pro',
            icon: 'database',
            iconColor: '#10b981'
        },
        tierName: 'Standard Monthly',
        status: 'active',
        monthlyPrice: 249,
        pricePeriod: '/mo',
        provisionedAt: '2024-01-15T00:00:00Z',
        payments: [
            { id: 'p2', date: 'Mar 15, 2025', amount: 249, status: 'Paid', paymentMethod: 'Visa ending in 4242' },
            { id: 'p3', date: 'Feb 15, 2025', amount: 249, status: 'Paid', paymentMethod: 'Visa ending in 4242' }
        ],
        documents: [
            { name: 'Terms of Service', status: 'signed' }
        ],
        steps: [],
        requests: []
    },
    {
        id: 'sub-gamma-003',
        client: {
            id: 'cli-gamma-03',
            legalName: 'Global Logistics SaaS',
            clientType: 'legal_entity',
            email: 'billing@globallog.com',
            phone: '+44 20 7946 0958'
        },
        product: {
            name: 'Fleet Manager AI',
            icon: 'local_shipping',
            iconColor: '#8b5cf6'
        },
        tierName: 'Premium Fleet',
        status: 'suspended',
        monthlyPrice: 850,
        pricePeriod: '/mo',
        provisionedAt: '2024-11-20T00:00:00Z',
        payments: [
            { id: 'p4', date: 'Apr 01, 2025', amount: 850, status: 'Error', paymentMethod: 'Amex ending in 1001' }
        ],
        documents: [
            { name: 'Contract Agreement', status: 'signed' }
        ],
        steps: [],
        requests: [
            { id: 'r2', type: 'payment_failed', status: 'pending', title: 'Payment Failed', description: 'Please update your card details.' }
        ]
    }
];

export const Default = {
    args: {
        subscriptions: mockSubscriptions,
        allExpanded: false,
    },
};

export const AllExpanded = {
    args: {
        subscriptions: mockSubscriptions,
        allExpanded: true,
    },
};
