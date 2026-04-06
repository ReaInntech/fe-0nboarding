import React from 'react';
import SubscriptionRow from '../SubscriptionRow';

export default {
    title: 'Provider/Components/Organisms/ProviderDashboard/SubscriptionRow',
    component: SubscriptionRow,
};

const mockSub = {
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
    payments: [
        { id: '1', date: 'Mar 1, 2025', amount: 1500, status: 'Pending', paymentMethod: 'Wire Transfer' }
    ],
    documents: [
        { name: 'Service Agreement', status: 'signed' }
    ],
    steps: [
        { name: 'Initial Request', status: 'completed' as const },
        { name: 'Verifications', status: 'current' as const },
        { name: 'Provision', status: 'pending' as const }
    ],
    requests: [
        { id: 'req-1', type: 'document_review', status: 'pending', title: 'Review ID', dueDate: '2025-05-01T00:00:00Z' }
    ]
};

export const Default = {
    args: {
        sub: mockSub,
    },
};
