import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import ProviderOnboardingManager from '../ProviderOnboardingManager';
import DocumentRequestCard from '../DocumentRequestCard';
import FormRequestCard from '../FormRequestCard';
import RequestPaymentCard from '../RequestPaymentCard';
import TermsAndConditionsRequestCard from '../TermsAndConditionsRequestCard';
import ProviderRequestsManager from '../ProviderRequestsManager';

// Meta for Onboarding Manager (the default export of this file for simplicity, 
// though usually you'd have one file per component)
const meta: Meta<typeof ProviderOnboardingManager> = {
    title: 'Features/ProviderProductView/SubComponents',
    component: ProviderOnboardingManager,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
};

export default meta;

type Story = StoryObj<typeof ProviderOnboardingManager>;

export const OnboardingManager: Story = {
    args: {
        initialSteps: [
            {
                id: 'step_1',
                name: 'Technical Configuration',
                description: 'Set up the core analytical engine parameters.',
                icon: 'settings',
                type: 'review',
                requests: [
                    { id: 'req_1', title: 'Data Architecture Doc', type: 'document' },
                    { id: 'req_2', title: 'Security Audit', type: 'form' },
                ],
            },
            {
                id: 'step_2',
                name: 'Environment Provisioning',
                description: 'Automated deployment of sandbox instances.',
                icon: 'cloud_done',
                type: 'auto',
                requests: [
                    { id: 'req_3', title: 'Provisioning Fee', type: 'payment' },
                ],
            },
        ],
    },
    render: (args) => (
        <div style={{ width: '800px' }}>
            <ProviderOnboardingManager {...args} />
        </div>
    )
};

export const RequestsManager: StoryObj<typeof ProviderRequestsManager> = {
    render: () => (
        <div style={{ width: '800px' }}>
            <ProviderRequestsManager 
                requests={[
                    { id: 'REQ-01', subject: 'Proof of Incorporation', status: 'pending', priority: 'high', date: 'Oct 12, 2024' },
                    { id: 'REQ-02', subject: 'Tax ID Certificate', status: 'approved', priority: 'medium', date: 'Oct 10, 2024' },
                    { id: 'REQ-03', subject: 'Signed Contract', status: 'rejected', priority: 'low', date: 'Oct 08, 2024' },
                ]} 
            />
        </div>
    ),
};

// --- Individual Cards ---

export const DocumentCard: StoryObj<typeof DocumentRequestCard> = {
    render: () => (
        <div style={{ width: '400px' }}>
            <DocumentRequestCard 
                title="Identity Verification" 
                onDelete={() => console.log('Delete')} 
            />
        </div>
    ),
};

export const FormCard: StoryObj<typeof FormRequestCard> = {
    render: () => (
        <div style={{ width: '400px' }}>
            <FormRequestCard 
                title="Compliance Survey" 
                onDelete={() => console.log('Delete')} 
            />
        </div>
    ),
};

export const PaymentCard: StoryObj<typeof RequestPaymentCard> = {
    render: () => (
        <div style={{ width: '400px' }}>
            <RequestPaymentCard 
                title="Security Deposit" 
                onDelete={() => console.log('Delete')} 
            />
        </div>
    ),
};

export const TermsCard: StoryObj<typeof TermsAndConditionsRequestCard> = {
    render: () => (
        <div style={{ width: '400px' }}>
            <TermsAndConditionsRequestCard 
                title="End User License Agreement" 
                onDelete={() => console.log('Delete')} 
            />
        </div>
    ),
};
