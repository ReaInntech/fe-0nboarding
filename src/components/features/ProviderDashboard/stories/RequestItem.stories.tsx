import React from 'react';
import RequestItem from '../RequestItem';

export default {
    title: 'Provider/Components/Organisms/ProviderDashboard/RequestItem',
    component: RequestItem,
    decorators: [
        (Story: any) => (
            <div className="max-w-md p-4 bg-[#0a0f18]">
                <Story />
            </div>
        ),
    ],
};

export const Pending = {
    args: {
        req: {
            id: '1',
            type: 'document_review',
            status: 'pending',
            title: 'Review Signed MSA',
            dueDate: '2025-05-01T00:00:00Z'
        }
    },
};

export const Approved = {
    args: {
        req: {
            id: '2',
            type: 'other',
            status: 'approved',
            title: 'KYC Verified'
        }
    },
};

export const Rejected = {
    args: {
        req: {
            id: '3',
            type: 'other',
            status: 'rejected',
            title: 'Invalid Payment Method'
        }
    },
};
