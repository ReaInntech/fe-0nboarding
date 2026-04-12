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

export const FormVerification = {
    args: {
        req: {
            id: 'form-1',
            type: 'other',
            status: 'pending',
            title: 'Verify Client Data Form',
            description: 'Customer submitted the onboarding questionnaire.',
            payload: {
                type: 'form',
                data: {
                    fields: [
                        { id: 'company_name', label: 'Company Name' },
                        { id: 'founding_year', label: 'Founding Year' },
                        { id: 'industry', label: 'Industry' },
                        { id: 'employee_count', label: 'Employees' }
                    ],
                    responses: {
                        company_name: 'Starlight Tech',
                        founding_year: '2021',
                        industry: 'Quantum Computing',
                        employee_count: '45'
                    }
                }
            }
        }
    }
};

export const PaymentVerification = {
    args: {
        req: {
            id: 'pay-1',
            type: 'other',
            status: 'pending',
            title: 'Validate Service Payment',
            description: 'Check if the receipt matches the invoice amount.',
            payload: {
                type: 'payment',
                data: {
                    invoiceNumber: 'INV-2025-4422',
                    amount: '$2,450.00',
                    receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800'
                }
            }
        }
    }
};

export const DocumentVerification = {
    args: {
        req: {
            id: 'doc-1',
            type: 'document_review',
            status: 'pending',
            title: 'Verify Business License',
            description: 'Ensure the document is valid and not expired.',
            payload: {
                type: 'document',
                data: {
                    fileName: 'business_license_2025.jpg',
                    uploadDate: '2025-04-10',
                    fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800'
                }
            }
        }
    }
};

export const TermsVerification = {
    args: {
        req: {
            id: 'terms-1',
            type: 'other',
            status: 'pending',
            title: 'Verify MSA Acceptance',
            description: 'Provider needs to acknowledge the user accepted all clauses.',
            payload: {
                type: 'terms',
                data: {
                    content: 'This Master Service Agreement ("Agreement") is entered into between...',
                    acceptedClauses: [
                        'I agree to the Terms of Service',
                        'I accept the Privacy Policy',
                        'I agree to the Data Processing Addendum',
                        'I authorize automatic monthly billing'
                    ]
                }
            }
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
            description: 'Automated check passed.',
            payload: {
                type: 'form',
                data: {
                    fields: [{ id: 'status', label: 'System Status' }],
                    responses: { status: 'Verification Successful' }
                }
            }
        }
    },
};

export const Rejected = {
    args: {
        req: {
            id: '3',
            type: 'document_review',
            status: 'rejected',
            title: 'Invalid Documents',
            description: 'Uploaded file is blurry and unreadable.',
            rejectionReason: 'The uploaded scan of the Business License is too blurry to read the expiration date. Please provide a high-resolution scan or a digital copy.',
            payload: {
                type: 'document',
                data: {
                    fileName: 'blurry_id.jpg',
                    uploadDate: '2025-04-10',
                    fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
                }
            }
        }
    },
};
