import React from 'react';
import SubscriptionActionCenter from '../SubscriptionActionCenter';

export default {
    title: 'Provider/Components/Organisms/ProviderDashboard/SubscriptionActionCenter',
    component: SubscriptionActionCenter,
};

const commonSteps = [
    { name: 'Request', status: 'completed' as const },
    { name: 'Review', status: 'current' as const },
    { name: 'Provision', status: 'pending' as const }
];

export const Default = {
    args: {
        steps: commonSteps,
        requests: [
            { id: '1', type: 'other', status: 'pending', title: 'Approve configuration' }
        ]
    },
};

export const NoRequests = {
    args: {
        steps: commonSteps,
        requests: []
    },
};
