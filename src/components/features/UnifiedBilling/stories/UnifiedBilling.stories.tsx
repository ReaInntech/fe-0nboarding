import React from 'react';
import UnifiedBilling from '../UnifiedBilling';
import { Transaction } from '../TransactionHistory';
import { PaymentMethod } from '../PaymentMethodsContainer';

export default {
    title: 'Features/UnifiedBilling',
    component: UnifiedBilling,
    parameters: {
        layout: 'fullscreen',
    },
};

const mockTransactions: Transaction[] = [
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
        status: 'Paid',
    },
    {
        date: 'Sep 12, 2023',
        description: 'Enterprise API Subscription - Tier 3',
        amount: '$299.00',
        status: 'Paid',
    },
    {
        date: 'Sep 01, 2023',
        description: 'Consultation Fee - Migration Service',
        amount: '$850.00',
        status: 'Paid',
    }
];

const mockMethods: PaymentMethod[] = [
    {
        primary: true,
        typeLabel: 'Active Method',
        name: 'Priority Business Platinum',
        lastFour: '4242',
        holder: 'Alex Thompson',
        expiry: '12/26',
        brand: 'mastercard'
    },
    {
        primary: false,
        typeLabel: 'Backup Method',
        name: 'Corporate Gold Reserve',
        lastFour: '8899',
        holder: 'Alex Thompson',
        expiry: '09/25',
        brand: 'visa'
    }
];

export const Default = {
    args: {
        transactions: mockTransactions,
        methods: mockMethods,
        userProfile: {
            name: 'Alex Thompson',
            email: 'alex@example.com',
            avatar: null
        }
    },
};

export const EmptyTransactions = {
    args: {
        transactions: [],
        methods: mockMethods,
    },
};
