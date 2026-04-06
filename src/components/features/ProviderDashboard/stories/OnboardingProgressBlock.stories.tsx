import React from 'react';
import OnboardingProgressBlock from '../OnboardingProgressBlock';

export default {
    title: 'Provider/Components/Organisms/ProviderDashboard/OnboardingProgressBlock',
    component: OnboardingProgressBlock,
    decorators: [
        (Story: any) => (
            <div className="max-w-3xl p-8 bg-[#0a0f18]">
                <Story />
            </div>
        ),
    ],
};

const mockSteps = [
    { name: 'Initial Request', status: 'completed' as const },
    { name: 'Client KYC', status: 'completed' as const },
    { name: 'Legal Signing', status: 'current' as const },
    { name: 'Provisioning', status: 'pending' as const }
];

export const Default = {
    args: {
        steps: mockSteps
    },
};

export const FullyCompleted = {
    args: {
        steps: mockSteps.map(s => ({ ...s, status: 'completed' as const }))
    },
};
