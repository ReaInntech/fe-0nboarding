import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import UnifiedProductView from '../UnifiedProductView';
import { ProductHeaderProps } from '../ProductHeader';
import { ServiceDetailsProps } from '../ServiceDetails';
import { LegalDocumentsProps } from '../LegalDocuments';
import { ContractingProgressProps } from '../ContractingProgress';
import { PaymentHistoryProps } from '../PaymentHistory';

const meta: Meta<typeof UnifiedProductView> = {
    title: 'Features/UnifiedProductView',
    component: UnifiedProductView,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
        },
    },
};

export default meta;
type Story = StoryObj<typeof UnifiedProductView>;

// --- Mock Data ---

const simpleHeaderProps: ProductHeaderProps = {
    icon: 'build',
    iconColor: '#f59e0b',
    title: 'Vehicle Repair Service',
    badgeText: 'In Progress',
    badgeVariant: 'warning',
    productId: 'SRV-100472-MX',
    meta: [
        { icon: 'calendar_today', text: 'Requested Feb 28, 2026' },
        { icon: 'location_on', text: 'AutoFix Workshop — Downtown' },
    ],
    actions: [
        { label: 'Contact', icon: 'call', variant: 'secondary' },
        { label: 'View Estimate', icon: 'receipt_long', variant: 'primary' },
    ],
};

const simpleServiceDetailsProps: ServiceDetailsProps = {
    title: 'Service Details',
    titleIcon: 'info',
    titleIconColor: '#f59e0b',
    fields: [
        { icon: 'category', label: 'Service Type', value: 'Engine & Transmission Repair' },
        { icon: 'directions_car', iconColor: '#f59e0b', label: 'Vehicle', value: 'Toyota Corolla 2021' },
        { icon: 'event', label: 'Estimated Completion', value: 'March 10, 2026' },
        { icon: 'account_balance_wallet', label: 'Total Estimate', value: '$1,850.00' },
    ],
};


const simpleLegalDocumentsProps: LegalDocumentsProps = {
    showModificationLink: true,
    documents: [
        {
            icon: 'article',
            name: 'Service Agreement',
            description: 'General terms of vehicular maintenance and repair service.',
            createdAt: 'Feb 28, 2026',
            approvedAt: 'Mar 01, 2026',
            step: 'Contracting',
            format: 'PDF',
        },
        {
            icon: 'gavel',
            name: 'Warranty Policy',
            description: 'Coverage and scope of the warranty for original replacement parts.',
            createdAt: 'Mar 02, 2026',
            approvedAt: 'Mar 02, 2026',
            step: 'Delivery',
            format: 'Digital',
        },
    ],
};

// --- Stories ---

export const Simple: Story = {
    args: {
        headerProps: simpleHeaderProps,
        showContractingProgress: false,
        serviceDetailsProps: simpleServiceDetailsProps,
        legalDocumentsProps: simpleLegalDocumentsProps,
        showRequests: false,
    },
};

export const WithPaymentRequest: Story = {
    args: {
        headerProps: simpleHeaderProps,
        showContractingProgress: false,
        serviceDetailsProps: simpleServiceDetailsProps,
        legalDocumentsProps: simpleLegalDocumentsProps,
        showRequests: true,
        requestsProps: {
            requests: [
                {
                    type: 'payment',
                    title: 'Vehicle Repair — Final Payment',
                    invoiceNumber: 'INV-2026-0472',
                    issuedDate: 'Mar 05, 2026',
                    dueDate: 'Mar 15, 2026',
                    status: 'pending',
                    total: '$1,350.00',
                    bank: 'Bancolombia',
                    accountNumber: '912-445672-01',
                    nit: '901.432.111-5',
                    lineItems: [
                        { description: 'Labor - Engine Overhaul', amount: '$800.00' },
                        { description: 'Parts - Timing Belt Kit', amount: '$550.00' }
                    ]
                }
            ]
        }
    },
};

export const WithAllRequests: Story = {
    args: {
        headerProps: simpleHeaderProps,
        showContractingProgress: false,
        serviceDetailsProps: simpleServiceDetailsProps,
        legalDocumentsProps: simpleLegalDocumentsProps,
        showRequests: true,
        requestsProps: {
            requests: [
                { 
                    type: 'payment', 
                    title: 'Vehicle Repair — Initial Deposit', 
                    invoiceNumber: 'INV-2026-001',
                    issuedDate: 'Feb 28, 2026',
                    dueDate: 'Mar 05, 2026',
                    status: 'paid',
                    total: '$500.00',
                    paymentDate: 'Mar 01, 2026'
                },
                { 
                    type: 'document', 
                    documentTitle: 'Vehicle Registration', 
                    instructions: 'Please upload the vehicle registration document for verification.', 
                    status: 'pending',
                    allowedFormats: ['pdf', 'jpg', 'png']
                },
                { 
                    type: 'form', 
                    formTitle: 'Vehicle Condition Survey', 
                    instructions: 'Please fill out these details about your vehicle.', 
                    status: 'pending',
                    fields: [
                        { id: '1', label: 'Current Mileage', type: 'number', required: true }, 
                        { id: '2', label: 'Known Issues', type: 'textarea', required: false }
                    ] 
                },
                { 
                    type: 'terms', 
                    documentTitle: 'Repair Service Liability Waiver', 
                    content: 'By accepting these terms, you agree that the workshop is not responsible for personal items left in the vehicle...',
                    status: 'pending',
                    checkboxes: [
                        { id: '1', text: 'I agree to the liability waiver.' }, 
                        { id: '2', text: 'I authorize the use of aftermarket parts if OEM is unavailable.' }
                    ] 
                }
            ]
        }
    },
};

const realInnovationHeaderProps: ProductHeaderProps = {
    icon: 'lightbulb',
    iconColor: '#7ED957',
    title: 'Innovation Consulting',
    badgeText: 'In Diagnostic',
    badgeVariant: 'info',
    productId: 'RI-CONS-2024-001',
    meta: [
        { icon: 'calendar_today', text: 'Started Mar 15, 2026' },
        { icon: 'business', text: 'Real Innovation Tech' },
        { icon: 'location_on', text: 'Remote / Hybrid' },
    ],
    actions: [
        { label: 'Schedule Session', icon: 'event', variant: 'primary' },
        { label: 'Contact Consultant', icon: 'chat', variant: 'secondary' }
    ],
};

const realInnovationContractingProgressProps: ContractingProgressProps = {
    currentPhase: 'Diagnostic',
    steps: [
        { label: 'Discovery', status: 'completed', icon: 'search' },
        { label: 'Diagnostic', status: 'active', icon: 'monitor_heart' },
        { label: 'Prototyping', status: 'pending', icon: 'design_services' },
        { label: 'Development', status: 'pending', icon: 'developer_mode' },
        { label: 'Impact', status: 'pending', icon: 'trending_up' },
    ]
};

const realInnovationPaymentHistoryProps: PaymentHistoryProps = {
    title: 'Payment History',
    showDownloadAll: true,
    payments: [
        {
            date: 'Mar 15, 2025',
            description: 'Deposit - AI-Powered Innovation Consulting',
            amount: '$2,500.00',
            status: 'Paid',
        },
        {
            date: 'Mar 28, 2025',
            description: 'Milestone 1 - Diagnostic & Strategic Roadmap',
            amount: '$1,800.00',
            status: 'Paid',
        },
        {
            date: 'Apr 05, 2025',
            description: 'Monthly Subscription - AI Advisory',
            amount: '$450.00',
            status: 'Paid',
        }
    ]
};

export const RealInnovationConsulting: Story = {
    args: {
        headerProps: realInnovationHeaderProps,
        showContractingProgress: true,
        contractingProgressProps: realInnovationContractingProgressProps,
        serviceDetailsProps: {
            title: 'Consulting Details',
            titleIcon: 'psychology',
            titleIconColor: '#7ED957',
            totalAmount: 10000000,
            paidAmount: 4300000,
            fields: [
                { icon: 'info', label: 'Service Type', value: 'Innovation Consulting' },
                { icon: 'groups', label: 'Consultant', value: 'Daniel Bernal' },
                { icon: 'speed', label: 'Focus', value: 'Process Optimization & Automation' },
                { icon: 'account_balance_wallet', label: 'Monthly Payment', value: '$1,000,000' },
            ],
        },
        legalDocumentsProps: {
            showModificationLink: true,
            documents: [
                {
                    icon: 'gavel',
                    name: 'Non-Disclosure Agreement (NDA)',
                    description: 'Intellectual property and data protection shared during the consulting process.',
                    createdAt: 'Mar 10, 2026',
                    approvedAt: 'Mar 10, 2026',
                    step: 'Discovery',
                    format: 'PDF',
                },
                {
                    icon: 'description',
                    name: 'Strategic Consulting Contract',
                    description: 'Scope, deliverables, and timeline for AI implementation.',
                    createdAt: 'Mar 12, 2026',
                    approvedAt: 'Pending',
                    step: 'Contracting',
                    format: 'DOCX',
                }
            ]
        },
        showRequests: true,
        requestsProps: {
            requests: [
                {
                    type: 'terms',
                    documentTitle: 'Terms & Conditions',
                    content: 'I have read and accept the terms and conditions of the consulting service...',
                    status: 'pending',
                    checkboxes: [{ id: '1', text: 'I have read and accept the terms and conditions of the consulting service.' }]
                }
            ]
        },
        showPaymentHistory: true,
        paymentHistoryProps: realInnovationPaymentHistoryProps,
    },
};
