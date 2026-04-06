import React from 'react';
import ServicesList from '../ServicesList';

export default {
    title: 'Client/Components/Organisms/Dashboard/ServicesList',
    component: ServicesList,
};

const mockSubscriptions: any[] = [
    {
        id: '1',
        name: 'Enterprise Cloud Suite',
        tier: 'Platinum Enterprise',
        icon: 'cloud_done',
        badgeText: 'Active',
        badgeVariant: 'success',
        progressLabel: 'Onboarding Status',
        progressValue: 'Service Provisioned',
        price: '$12,450.00',
        pricePeriod: '/mo',
        hasActionRequest: false,
        currentStep: 4,
        totalSteps: 4
    },
    {
        id: '2',
        name: 'Security Suite',
        tier: 'Advanced Protection',
        icon: 'verified_user',
        badgeText: 'Setup',
        badgeVariant: 'default',
        progressLabel: 'Current Phase',
        progressValue: 'Legal Review',
        price: '$499.00',
        pricePeriod: '/yr',
        hasActionRequest: true,
        currentStep: 3,
        totalSteps: 4
    },
    {
        id: '3',
        name: 'Storage Bucket',
        tier: '5TB Managed Storage',
        icon: 'database',
        badgeText: 'Billing',
        badgeVariant: 'warning',
        progressLabel: 'Current Phase',
        progressValue: 'Awaiting Signatures',
        price: '$89.00',
        pricePeriod: '/mo',
        hasActionRequest: true,
        currentStep: 2,
        totalSteps: 4
    }
];

export const Default = {
    args: {
        subscriptions: mockSubscriptions,
    },
};

export const Empty = {
    args: {
        subscriptions: [],
    },
};
