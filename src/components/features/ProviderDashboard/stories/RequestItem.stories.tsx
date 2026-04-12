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
            description: 'Please verify the signatures on the Master Service Agreement version 2.4.',
            dueDate: '2025-05-01T00:00:00Z',
            metadata: [
                { label: 'Document ID', value: 'DOC-MSA-2025-001' },
                { label: 'Version', value: '2.4.1' }
            ]
        }
    },
};

export const KYCValidation = {
    args: {
        req: {
            id: 'kyc-1',
            type: 'other',
            status: 'pending',
            title: 'Verify Business Identity',
            description: 'Validate the provided legal information against the national database.',
            metadata: [
                { label: 'Legal Name', value: 'Acme Corp Int.' },
                { label: 'Tax ID', value: 'VAT-99228811' },
                { label: 'Country', value: 'United States' },
                { label: 'Founded', value: '1998-04-12' }
            ]
        }
    }
};

export const BillingVerification = {
    args: {
        req: {
            id: 'bill-1',
            type: 'other',
            status: 'pending',
            title: 'Process Custom Payment',
            description: 'Verify the manual wire transfer receipt uploaded by the client.',
            metadata: [
                { label: 'Amount', value: '$12,500.00' },
                { label: 'Currency', value: 'USD' },
                { label: 'Ref Number', value: 'WIRE-ACME-4455' }
            ]
        }
    }
};

export const Approved = {
    args: {
        req: {
            id: '2',
            type: 'other',
            status: 'approved',
            title: 'KYC Verified',
            description: 'Aprovado por el sistema de validación automática.'
        }
    },
};

export const Rejected = {
    args: {
        req: {
            id: '3',
            type: 'other',
            status: 'rejected',
            title: 'Invalid Payment Method',
            description: 'El número de tarjeta proporcionado no es válido para transacciones internacionales.'
        }
    },
};
