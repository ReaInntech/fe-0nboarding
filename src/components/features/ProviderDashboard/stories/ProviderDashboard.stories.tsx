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
            { 
                id: 'req-form-1', 
                type: 'other', 
                status: 'pending', 
                title: 'Review Onboarding Data', 
                description: 'Client submitted the initial configuration form.',
                payload: {
                    type: 'form',
                    data: {
                        fields: [
                            { id: 'region', label: 'Preferred Region' },
                            { id: 'nodes', label: 'Cluster Nodes' },
                            { id: 'autoscale', label: 'Autoscaling' }
                        ],
                        responses: {
                            region: 'Europe West (Paris)',
                            nodes: '12',
                            autoscale: 'Yes (Max 24)'
                        }
                    }
                }
            },
            { 
                id: 'req-doc-1', 
                type: 'document_review', 
                status: 'pending', 
                title: 'Verify Signed SLA', 
                description: 'Please check the digital signature on the latest SLA version.',
                payload: {
                    type: 'document',
                    data: {
                        fileName: 'SLA_Signed_Acme.pdf',
                        uploadDate: 'Apr 11, 2025',
                        fileUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800'
                    }
                }
            }
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
        requests: [
            {
                id: 'req-pay-1',
                type: 'other',
                status: 'pending',
                title: 'Verify Manual Payment',
                description: 'User uploaded a receipt for a manual bank transfer.',
                payload: {
                    type: 'payment',
                    data: {
                        invoiceNumber: 'INV-DB-8899',
                        amount: '$249.00',
                        receiptUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800'
                    }
                }
            }
        ]
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
            { 
                id: 'req-terms-1', 
                type: 'other', 
                status: 'pending', 
                title: 'Verify Terms Acceptance', 
                description: 'Client needs to be verified for custom terms acceptance.',
                payload: {
                    type: 'terms',
                    data: {
                        content: 'This Security Compliance Addendum covers all aspects of data encryption...',
                        acceptedClauses: [
                            'AES-256 Encryption at rest',
                            'No logging policy acknowledgment',
                            '24/7 Security audit authorization'
                        ]
                    }
                }
            }
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
