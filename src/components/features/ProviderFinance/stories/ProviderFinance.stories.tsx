import React from 'react';
import ProviderFinance from '../ProviderFinance';

const defaultKpis = { totalRevenue: 125000, pendingPayout: 18450, activeClients: 124, successRate: 98.2, growth: 14.5 };
const defaultRevenueData = [
    { label: 'Jan', value: 12000 }, { label: 'Feb', value: 19000 }, { label: 'Mar', value: 15500 },
    { label: 'Apr', value: 22000 }, { label: 'May', value: 28000 }, { label: 'Jun', value: 31000 },
    { label: 'Jul', value: 29000 }, { label: 'Aug', value: 38000 }, { label: 'Sep', value: 42000 },
    { label: 'Oct', value: 39000 }, { label: 'Nov', value: 45000 }, { label: 'Dec', value: 52000 }
];
const defaultDistributionData = [
    { label: 'Enterprise VPN', value: 65000, color: '#1978e5' },
    { label: 'Cloud Storage', value: 35000, color: '#10b981' },
    { label: 'Cyber Sec API', value: 25000, color: '#f59e0b' }
];
const defaultTransactions = [
    { id: 'TRX-101', date: '2026-03-05', client: 'Acme Corp', product: 'Enterprise VPN', amount: 5000, status: 'Completed', method: 'Bank Transfer' },
    { id: 'TRX-102', date: '2026-03-04', client: 'Globex Inc', product: 'Cloud Storage', amount: 1250, status: 'Pending', method: 'Stripe' },
];

export default {
    title: 'Features/ProviderFinance',
    component: ProviderFinance,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0f1523' },
            ]
        },
        nextjs: {
            appDirectory: true,
        },
    }
};

export const DefaultView = {
    args: {
        kpis: defaultKpis,
        revenueData: defaultRevenueData,
        distributionData: defaultDistributionData,
        transactions: defaultTransactions,
        productsFilterList: ['All Products', 'Enterprise VPN', 'Cloud Storage', 'Cyber Sec API'],
        clientsFilterList: ['All Clients', 'Acme Corp', 'Globex Inc'],
        paymentMethodsList: ['All Methods', 'Credit Card', 'Bank Transfer', 'Wire', 'Stripe']
    }
};

export const SpikeInRevenue = {
    args: {
        kpis: { totalRevenue: 1250000, pendingPayout: 4000, activeClients: 87, successRate: 99.1, growth: 125 },
        revenueData: [
            { label: 'Jan', value: 1000 }, { label: 'Dec', value: 120000 }
        ],
        distributionData: [
            { label: 'Cyber Sec API', value: 120000, color: '#f59e0b' },
        ],
        transactions: defaultTransactions,
        productsFilterList: ['All Products', 'Enterprise VPN', 'Cloud Storage', 'Cyber Sec API'],
        clientsFilterList: ['All Clients', 'Acme Corp', 'Globex Inc'],
        paymentMethodsList: ['All Methods', 'Credit Card', 'Bank Transfer', 'Wire', 'Stripe']
    }
};
