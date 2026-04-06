import React from 'react';
import TransactionHistory from '../TransactionHistory';

export default {
    title: 'Client/Components/Organisms/UnifiedBilling/TransactionHistory',
    component: TransactionHistory,
};

const mockTransactions = [
    {
        date: 'Oct 12, 2023',
        description: 'Enterprise API Subscription - Tier 3',
        amount: '$299.00',
        status: 'Paid',
    },
    {
        date: 'Oct 05, 2023',
        description: 'Cloud Storage Add-on (500GB)',
        amount: '$45.00',
        status: 'Pending',
    },
    {
        date: 'Sep 12, 2023',
        description: 'Enterprise API Subscription - Tier 3',
        amount: '$299.00',
        status: 'Error',
    }
];

export const Default = {
    args: {
        transactions: mockTransactions
    },
};
