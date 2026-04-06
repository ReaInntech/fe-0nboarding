import React from 'react';
import PaymentMethodsContainer from '../PaymentMethodsContainer';

export default {
    title: 'Client/Components/Organisms/UnifiedBilling/PaymentMethodsContainer',
    component: PaymentMethodsContainer,
};

const mockMethods = [
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
        methods: mockMethods
    },
};

export const SingleMethod = {
    args: {
        methods: [mockMethods[0]]
    },
};
