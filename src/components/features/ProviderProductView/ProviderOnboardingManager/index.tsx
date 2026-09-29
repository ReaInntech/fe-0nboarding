'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import ConfirmDialog from '../../../shared/molecule/ConfirmDialog';
import RequestPaymentCard from '../RequestPaymentCard';
import DocumentRequestCard from '../DocumentRequestCard';
import DocumentReviewRequestCard from '../DocumentReviewRequestCard';
import TermsAndConditionsRequestCard from '../TermsAndConditionsRequestCard';
import FormRequestCard from '../FormRequestCard';
import { OnboardingStep, OnboardingRequest } from '@/src/lib/api/types';
import Select from '../../../shared/atoms/Select';
import Input from '../../../shared/atoms/Input';
import Textarea from '../../../shared/atoms/Textarea';
import styles from './index.module.scss';

const ICONS = [
    'cloud_done', 'cloud', 'hub', 'storage', 'api', 'developer_board',
    'security', 'analytics', 'settings', 'rocket_launch', 'database',
    'shield', 'bolt', 'code', 'dns', 'wifi',
    'radio_button_checked', 'verified', 'lock', 'description', 'payments', 'gavel'
];

const STEP_TYPES = [
    { value: 'auto', label: 'Self-managed', icon: 'bolt', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { value: 'review', label: 'Requires Review', icon: 'visibility', color: 'text-amber-400', bg: 'bg-amber-500/10' },
] as const;

export interface ProviderOnboardingManagerProps {
    initialSteps: OnboardingStep[];
    productPrice?: number;
    onSaveStepMetadata?: (stepId: string, data: Partial<OnboardingStep>) => Promise<void>;
    onSaveRequest?: (stepId: string, requestId: string, type: OnboardingRequest['type'], config: Record<string, any>) => Promise<any>;
    onDeleteRequest?: (requestId: string) => Promise<void>;
    onDeleteStep?: (stepId: string) => Promise<void>;
    onAddStep?: (data: Partial<OnboardingStep>) => Promise<void>;
    onCancel?: () => void;
}

export default function ProviderOnboardingManager({
    initialSteps,
    productPrice,
    onSaveStepMetadata,
    onSaveRequest,
    onDeleteRequest,
    onDeleteStep,
    onAddStep,
    onCancel,
}: ProviderOnboardingManagerProps) {
    const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ idx: number; step: OnboardingStep } | null>(null);
    const [isDeletingStep, setIsDeletingStep] = useState(false);
    const [isSavingStep, setIsSavingStep] = useState<string | null>(null);

    const handleSaveStep = async (idx: number) => {
        if (isSavingStep) return;
        const step = steps[idx];
        if (!onSaveStepMetadata) return;

        setIsSavingStep(step.id);
        try {
            const result: any = await onSaveStepMetadata(step.id, {
                name: step.name,
                description: step.description,
                icon: step.icon,
                type: step.type
            });

            // If it was a new step, update the ID to the real one from DB
            if (step.id.startsWith('step_') && result?.id) {
                setSteps(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], id: result.id };
                    return next;
                });
            }
        } finally {
            setIsSavingStep(null);
        }
    };

    const handleCancel = () => {
        setSteps(initialSteps);
        setExpandedIdx(null);
        if (onCancel) onCancel();
    };

    const updateStep = (idx: number, field: keyof OnboardingStep, value: any) => {
        const newSteps = [...steps];
        newSteps[idx] = { ...newSteps[idx], [field]: value };
        setSteps(newSteps);
    };

    const toggleAccordion = (idx: number) => {
        setExpandedIdx(expandedIdx === idx ? null : idx);
    };

    const addRequest = (idx: number, type: OnboardingRequest['type'] = 'payment') => {
        const newSteps = [...steps];
        const titles: Record<string, string> = {
            payment: 'Payment Request',
            document: 'Document Request',
            terms: 'Terms & Conditions',
            form: 'Form Request',
            document_review: 'Review & Approval Request',
        };
        const newRequest: OnboardingRequest = {
            id: `req_${Date.now()}`,
            title: titles[type] || 'New Request',
            type: type
        };
        newSteps[idx].requests = [...(newSteps[idx].requests || []), newRequest];
        setSteps(newSteps);
    };

    const handleDeleteRequest = async (stepIdx: number, reqId: string) => {
        if (onDeleteRequest) {
            await onDeleteRequest(reqId);
        }
        const newSteps = [...steps];
        newSteps[stepIdx].requests = newSteps[stepIdx].requests.filter(r => r.id !== reqId);
        setSteps(newSteps);
    };

    const handleSaveRequest = async (stepId: string, reqId: string, type: OnboardingRequest['type'], config: any) => {
        if (onSaveRequest) {
            const result: any = await onSaveRequest(stepId, reqId, type, config);

            // If it was a new request, we MUST update the local ID with the real DB ID
            // otherwise subsequent deletes/updates will use the wrong ID
            if (reqId.startsWith('req_') && result?.id) {
                setSteps(prevSteps => {
                    const newSteps = [...prevSteps];
                    const stepIdx = newSteps.findIndex(s => s.id === stepId);
                    if (stepIdx === -1) return prevSteps;

                    const newRequests = [...(newSteps[stepIdx].requests || [])];
                    const reqIdx = newRequests.findIndex(r => r.id === reqId);
                    if (reqIdx === -1) return prevSteps;

                    newRequests[reqIdx] = {
                        ...newRequests[reqIdx],
                        id: result.id,
                        config: config // Also sync latest config
                    };

                    newSteps[stepIdx] = { ...newSteps[stepIdx], requests: newRequests };
                    return newSteps;
                });
            }
        }
    };

    const addStep = () => {
        const newStep: OnboardingStep = {
            id: `step_${Date.now()}`,
            name: 'New Step',
            description: 'Enter description...',
            icon: 'radio_button_checked',
            type: 'review',
            requests: []
        };
        setSteps([...steps, newStep]);
        setExpandedIdx(steps.length);
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['onboarding-manager__header']}>
                <h3 className={styles['onboarding-manager__title']}>
                    <Icon name="rule" className="text-[#1978e5]" /> Onboarding Steps
                </h3>
            </div>

            <div className={styles['onboarding-manager__steps-list']}>
                {steps.map((step, idx) => {
                    const isExpanded = expandedIdx === idx;
                    const stepType = STEP_TYPES.find(t => t.value === step.type) || STEP_TYPES[0];

                    return (
                        <div
                            key={step.id || idx}
                            className={`${styles['onboarding-manager__step']} ${isExpanded ? styles['onboarding-manager__step--expanded'] : ''}`}
                        >
                            {/* Header */}
                            <div
                                className={styles['onboarding-manager__step-header']}
                                onClick={() => toggleAccordion(idx)}
                            >
                                <span className={styles['onboarding-manager__drag-handle']}>
                                    <Icon name="drag_indicator" className="cursor-grab" />
                                </span>
                                <div className={styles['onboarding-manager__step-icon-box']}>
                                    <Icon name={step.icon || 'radio_button_checked'} className="text-lg" />
                                </div>
                                <div className={styles['onboarding-manager__step-info']}>
                                    <p className={styles['onboarding-manager__step-name']}>
                                        {step.name}
                                    </p>
                                    {!isExpanded && step.description && (
                                        <p className={styles['onboarding-manager__step-desc']}>{step.description}</p>
                                    )}
                                </div>
                                <div className={styles['onboarding-manager__step-meta']}>
                                    {!isExpanded && (
                                        <div className={`${styles['onboarding-manager__step-type-badge']} ${stepType.bg} ${stepType.color}`}>
                                            <Icon name={stepType.icon} style={{ fontSize: 12 }} />
                                            {stepType.label}
                                        </div>
                                    )}
                                    <span className={styles['onboarding-manager__step-index']}>Step {idx + 1}</span>
                                    <Icon
                                        name="expand_more"
                                        className={styles['onboarding-manager__accordion-icon']}
                                    />
                                </div>
                            </div>

                            {/* Body */}
                            {isExpanded && (
                                <div className={styles['onboarding-manager__step-body']}>
                                    <div className={styles['onboarding-manager__config-grid']}>
                                        <Input
                                            label="Step Name"
                                            value={step.name}
                                            onChange={(e) => updateStep(idx, 'name', e.target.value)}
                                            placeholder="e.g. Identity Verification"
                                        />
                                        <Select
                                            label="Step Icon"
                                            value={step.icon}
                                            onChange={(val) => updateStep(idx, 'icon', val)}
                                            options={ICONS.map(i => ({ value: i, label: i }))}
                                            type="icon"
                                            activeColor="#1978e5"
                                        />
                                        <Textarea
                                            label="Description"
                                            rows={1}
                                            value={step.description}
                                            onChange={(e) => updateStep(idx, 'description', e.target.value)}
                                        />
                                        <div className={styles['onboarding-manager__field']}>
                                            <label className={`${styles['onboarding-manager__label']} ${styles['onboarding-manager__label--secondary']}`}>Management Type</label>
                                            <div className={styles['onboarding-manager__type-grid']}>
                                                {STEP_TYPES.map(type => (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => updateStep(idx, 'type', type.value)}
                                                        className={`${styles['onboarding-manager__type-btn']} ${step.type === type.value
                                                            ? `${type.bg} ${type.color} ${styles['onboarding-manager__type-btn--active']}`
                                                            : styles['onboarding-manager__type-btn--idle']
                                                            }`}
                                                    >
                                                        <Icon name={type.icon} style={{ fontSize: 14 }} />
                                                        {type.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles['onboarding-manager__step-actions-bar']}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteTarget({ idx, step });
                                            }}
                                            className={styles['onboarding-manager__delete-btn']}
                                            disabled={!!isSavingStep}
                                        >
                                            <Icon name="delete" className="text-xs" /> Delete
                                        </Button>
                                        <div className="flex-1" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCancel}
                                            className="text-slate-500 hover:text-white"
                                            disabled={!!isSavingStep}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleSaveStep(idx)}
                                            className={styles['onboarding-manager__save-btn']}
                                            disabled={!!isSavingStep}
                                        >
                                            {isSavingStep === step.id ? (
                                                <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <><Icon name="save" className="mr-2 text-xs" /> Save Changes</>
                                            )}
                                        </Button>
                                    </div>
                                    <hr className="border-slate-700 mt-5" />

                                    {!step.id.startsWith('step_') ? (
                                        /* Requests */
                                        <div className={styles['onboarding-manager__requests-section']}>
                                            <div className={styles['onboarding-manager__requests-header']}>
                                                <h4>
                                                    <Icon name="component_exchange" className="text-[#1978e5]" /> Component Requests
                                                </h4>
                                                <button type="button" className="text-[10px] text-[#1978e5] font-bold hover:underline">Manage Components</button>
                                            </div>

                                            <div className={styles['onboarding-manager__requests-grid']}>
                                                {step.requests?.map(req => {
                                                    const isStepLocal = step.id.startsWith('step_');
                                                    const sharedProps = {
                                                        id: req.id,
                                                        initialConfig: req.config,
                                                        hasResolved: req.hasResolved,
                                                        onDelete: () => handleDeleteRequest(idx, req.id),
                                                        onSave: async (config: any) => {
                                                            if (isStepLocal) {
                                                                alert('You must save the step changes (Save Changes) before configuring its components.');
                                                                return;
                                                            }
                                                            return handleSaveRequest(step.id, req.id, req.type, config);
                                                        }
                                                    };

                                                    if (req.type === 'form') return (
                                                        <FormRequestCard
                                                            key={req.id}
                                                            title={req.title}
                                                            disabled={isStepLocal}
                                                            {...sharedProps}
                                                        />
                                                    );
                                                    if (req.type === 'terms') return (
                                                        <TermsAndConditionsRequestCard
                                                            key={req.id}
                                                            title={req.title}
                                                            disabled={isStepLocal}
                                                            {...sharedProps}
                                                        />
                                                    );
                                                    if (req.type === 'document') return (
                                                        <DocumentRequestCard
                                                            key={req.id}
                                                            title={req.title}
                                                            disabled={isStepLocal}
                                                            {...sharedProps}
                                                        />
                                                    );
                                                    if (req.type === 'document_review') return (
                                                        <DocumentReviewRequestCard
                                                            key={req.id}
                                                            title={req.title}
                                                            disabled={isStepLocal}
                                                            {...sharedProps}
                                                        />
                                                    );
                                                    return (
                                                        <RequestPaymentCard
                                                            key={req.id}
                                                            title={req.title}
                                                            productPrice={productPrice}
                                                            disabled={isStepLocal}
                                                            {...sharedProps}
                                                        />
                                                    );
                                                })}

                                                <div className={styles['onboarding-manager__add-requests-box']}>
                                                    <div className={styles['onboarding-manager__add-row']}>
                                                        <button
                                                            type="button"
                                                            onClick={() => addRequest(idx, 'payment')}
                                                            className={`${styles['onboarding-manager__add-card']} ${styles['onboarding-manager__add-card--payment']}`}
                                                        >
                                                            <div className={styles['onboarding-manager__add-card-icon']}>
                                                                <Icon name="payments" style={{ fontSize: 16 }} />
                                                            </div>
                                                            <span className={styles['onboarding-manager__add-card-label']}>Payment</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addRequest(idx, 'document')}
                                                            className={`${styles['onboarding-manager__add-card']} ${styles['onboarding-manager__add-card--document']}`}
                                                        >
                                                            <div className={styles['onboarding-manager__add-card-icon']}>
                                                                <Icon name="description" style={{ fontSize: 16 }} />
                                                            </div>
                                                            <span className={styles['onboarding-manager__add-card-label']}>Document</span>
                                                        </button>
                                                    </div>
                                                    <div className={styles['onboarding-manager__add-row']}>
                                                        <button
                                                            type="button"
                                                            onClick={() => addRequest(idx, 'terms')}
                                                            className={`${styles['onboarding-manager__add-card']} ${styles['onboarding-manager__add-card--terms']}`}
                                                        >
                                                            <div className={styles['onboarding-manager__add-card-icon']}>
                                                                <Icon name="gavel" style={{ fontSize: 16 }} />
                                                            </div>
                                                            <span className={styles['onboarding-manager__add-card-label']}>Terms</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addRequest(idx, 'form')}
                                                            className={`${styles['onboarding-manager__add-card']} ${styles['onboarding-manager__add-card--form']}`}
                                                        >
                                                            <div className={styles['onboarding-manager__add-card-icon']}>
                                                                <Icon name="assignment" style={{ fontSize: 16 }} />
                                                            </div>
                                                            <span className={styles['onboarding-manager__add-card-label']}>Form</span>
                                                        </button>
                                                    </div>
                                                    <div className={styles['onboarding-manager__add-row']}>
                                                        <button
                                                            type="button"
                                                            onClick={() => addRequest(idx, 'document_review')}
                                                            className={`${styles['onboarding-manager__add-card']} border-blue-500/20 hover:border-blue-500/60`}
                                                        >
                                                            <div className={`${styles['onboarding-manager__add-card-icon']} text-blue-400 bg-blue-500/10`}>
                                                                <Icon name="rule_folder" style={{ fontSize: 16 }} />
                                                            </div>
                                                            <span className={styles['onboarding-manager__add-card-label']}>Review & Approval</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 px-6 text-center bg-slate-800/30 rounded-xl mt-4 border border-dashed border-slate-700">
                                            <Icon name="info" className="text-slate-500 mb-2" />
                                            <p className="text-slate-400 text-sm">Save this step first to start adding component requests.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className={styles['onboarding-manager__footer']}>
                <Button variant="ghost" onClick={addStep} className="text-slate-500 text-sm hover:text-white">
                    <Icon name="add" className="mr-2" /> Add Step
                </Button>
            </div>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    const { idx, step } = deleteTarget;
                    const isLocal = step.id.startsWith('step_');

                    if (!isLocal && onDeleteStep) {
                        await onDeleteStep(step.id);
                    }

                    setSteps(prev => prev.filter((_, i) => i !== idx));
                    if (expandedIdx === idx) setExpandedIdx(null);
                    setDeleteTarget(null);
                }}
                title="Delete Step"
                message={`Are you sure you want to delete "${deleteTarget?.step.name || ''}"? All its components and associated requests will also be deleted.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                icon="delete_forever"
            />
        </Card>
    );
}
