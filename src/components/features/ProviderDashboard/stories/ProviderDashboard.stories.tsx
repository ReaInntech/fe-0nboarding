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

const completedSteps = [
    { name: 'Initial Request', status: 'completed' as const },
    { name: 'Client Verification', status: 'completed' as const },
    { name: 'Legal Review', status: 'completed' as const },
    { name: 'Configuration', status: 'completed' as const },
    { name: 'Provisioned', status: 'completed' as const }
];

const mockPayments = [
    { id: 'pay-1', date: 'Apr 15, 2025', amount: 1500, status: 'Paid', paymentMethod: 'Card ending in 4242' },
    { id: 'pay-2', date: 'Mar 15, 2025', amount: 1500, status: 'Paid', paymentMethod: 'Card ending in 4242' },
    { id: 'pay-3', date: 'Feb 15, 2025', amount: 1500, status: 'Paid', paymentMethod: 'Card ending in 4242' },
    { id: 'pay-4', date: 'Jan 15, 2025', amount: 1500, status: 'Paid', paymentMethod: 'Bank Transfer' },
    { id: 'pay-5', date: 'Dec 15, 2024', amount: 1500, status: 'Paid', paymentMethod: 'Bank Transfer' },
];

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
        payments: mockPayments.slice(0, 2),
        documents: [
            { name: 'Master Service Agreement', status: 'signed' },
            { name: 'SLA Addendum v2', status: 'pending' },
            { name: 'Data Processing Agreement', status: 'pending' }
        ],
        steps: commonSteps,
        requests: [
            { id: 'req-1', type: 'document_review', status: 'pending', title: 'Review SLA Addendum', dueDate: '2025-05-01T00:00:00Z' },
            { id: 'req-2', type: 'info_request', status: 'pending', title: 'Provide Tax ID', description: 'We need your VAT/Tax ID for billing purposes.' }
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
        payments: mockPayments,
        documents: [
            { name: 'Simple Terms of Service', status: 'signed' },
            { name: 'Privacy Policy Agreement', status: 'signed' }
        ],
        steps: completedSteps,
        requests: []
    },
    {
        id: 'sub-gamma-003',
        client: {
            id: 'cli-gamma-03',
            legalName: 'TechNova Solutions',
            clientType: 'legal_entity',
            email: 'billing@technova.com',
            phone: '+44 20 7946 0958'
        },
        product: {
            name: 'Security Shield VPN',
            icon: 'shield',
            iconColor: '#f59e0b'
        },
        tierName: 'Advanced Security',
        status: 'suspended',
        monthlyPrice: 599,
        pricePeriod: '/mo',
        provisionedAt: '2024-11-20T00:00:00Z',
        payments: [
            { id: 'pay-err-1', date: 'Apr 01, 2025', amount: 599, status: 'Error', paymentMethod: 'Visa ending in 8888' },
            { id: 'pay-ok-2', date: 'Mar 01, 2025', amount: 599, status: 'Paid', paymentMethod: 'Visa ending in 8888' }
        ],
        documents: [
            { name: 'Security Compliance Cert', status: 'signed' }
        ],
        steps: completedSteps,
        requests: [
            { id: 'req-3', type: 'payment_failed', status: 'pending', title: 'Update Payment Method', description: 'Your last payment was declined. Please update your billing info.' }
        ]
    }
];

export const Default = {
    args: {
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
        allExpanded: false,
    },
};

export const AllExpanded = {
    args: {
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
        allExpanded: true,
    },
};

export const EmptyState = {
    args: {
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};
