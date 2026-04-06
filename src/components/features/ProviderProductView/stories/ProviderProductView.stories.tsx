import type { Meta, StoryObj } from '@storybook/react';
import ProviderProductView from '../ProviderProductView';

const meta: Meta<typeof ProviderProductView> = {
    title: 'Features/ProviderProductView',
    component: ProviderProductView,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProviderProductView>;

const mockProduct = {
    name: 'Advanced Cloud Analytics',
    productCode: 'ACA-2024-X1',
    icon: 'analytics',
    iconColor: '#1978e5',
    status: 'active',
};

const mockSteps = [
    {
        id: 'step_1',
        name: 'Technical Configuration',
        description: 'Set up the core analytical engine parameters.',
        icon: 'settings',
        type: 'review',
        requests: [
            { id: 'req_1', title: 'Initialization Payment', type: 'payment' },
            { id: 'req_2', title: 'Data Architecture Doc', type: 'document' },
        ],
    },
    {
        id: 'step_2',
        name: 'Security & Compliance',
        description: 'Ensure all data handling meets enterprise standards.',
        icon: 'security',
        type: 'auto',
        requests: [
            { id: 'req_3', title: 'Privacy Agreement', type: 'terms' },
            { id: 'req_4', title: 'Compliance Survey', type: 'form' },
        ],
    },
];

const mockRequirements = [
    { id: 'r1', label: 'Storage Quota', value: '500 GB', required: true },
    { id: 'r2', label: 'Max Users', value: '25', required: true },
    { id: 'r3', label: 'API Endpoint', value: 'https://api.analytics.corp/v1', required: false },
];

const mockRequests = [
    { id: 'REQ-001', subject: 'Extended Support Access', status: 'pending', priority: 'high', date: '2024-03-20' },
    { id: 'REQ-002', subject: 'Quota Increase Request', status: 'in_review', priority: 'medium', date: '2024-03-18' },
    { id: 'REQ-003', subject: 'DNS Configuration Issue', status: 'approved', priority: 'low', date: '2024-03-15' },
];

export const Standard: Story = {
    args: {
        product: mockProduct,
        onboardingSteps: mockSteps as any,
        requirements: mockRequirements,
        requests: mockRequests as any,
        userProfile: {
            name: 'Provider Admin',
            role: 'Administrator',
            avatar: '',
        },
    },
};

export const SetupInProgress: Story = {
    args: {
        ...Standard.args,
        product: {
            ...mockProduct,
            status: 'pending',
            name: 'New AI Prototype',
        },
        onboardingSteps: [mockSteps[0]] as any,
    },
};

export const Empty: Story = {
    args: {
        product: mockProduct,
        onboardingSteps: [],
        requirements: [],
        requests: [],
        userProfile: Standard.args?.userProfile,
    },
};
