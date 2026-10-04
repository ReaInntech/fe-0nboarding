import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import RequestVerificationContent, { VerificationPayload } from './RequestVerificationContent';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import { useApp } from '@/src/context/AppContext';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface Request {
    id?: string;
    subscriptionId?: string;
    type: 'document_review' | 'form' | 'document' | 'payment' | 'terms' | string;
    status: 'approved' | 'rejected' | 'pending' | 'waiting_client';
    title: string;
    description?: string;
    dueDate?: string;
    metadata?: Array<{ label: string; value: string }>;
    clientResponses?: Array<{ label: string; value: string }>;
    payload?: VerificationPayload;
    rejectionReason?: string;
    customDocumentPerUser?: boolean;
    customDocumentFile?: string;
    data?: any;
    config?: any;
}

export interface RequestItemProps {
    req?: Request;
    subscriptionId?: string;
    className?: string;
}

export default function RequestItem({ req, subscriptionId, className }: RequestItemProps) {
    const { user } = useApp();
    const { uploadFile, isUploading } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedCustomFile, setUploadedCustomFile] = useState<string | null>(
        req?.customDocumentFile || req?.data?.customDocumentFile || null
    );

    const [currentStatus, setCurrentStatus] = useState<string>(req?.status || 'pending');
    const [currentRejectionReason, setCurrentRejectionReason] = useState<string | undefined>(req?.rejectionReason);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (req?.status) {
            setCurrentStatus(req.status);
        }
        setCurrentRejectionReason(req?.rejectionReason);
    }, [req?.status, req?.rejectionReason]);

    if (!req) return null;

    const modifier = currentStatus === 'approved'
        ? 'approved'
        : currentStatus === 'rejected'
        ? 'rejected'
        : currentStatus === 'waiting_client'
        ? 'waiting_client'
        : 'pending';

    const getStatusBadgeLabel = (st: string) => {
        switch (st) {
            case 'approved': return 'APPROVED';
            case 'rejected': return 'REJECTED';
            case 'waiting_client': return 'AWAITING CLIENT';
            case 'pending': return 'PENDING REVIEW';
            default: return st.replace('_', ' ').toUpperCase();
        }
    };

    const getRequestIcon = () => {
        if (currentStatus === 'waiting_client') return 'schedule';
        if (req.type === 'document_review') return 'plagiarism';
        if (req.type === 'form') return 'assignment';
        if (req.type === 'payment') return 'payments';
        if (req.type === 'document') return 'upload_file';
        return 'fact_check';
    };

    const handleOpenDetails = () => {
        setIsRejecting(false);
        setIsModalOpen(true);
    };
    
    const handleCloseDetails = () => {
        setIsModalOpen(false);
        setIsRejecting(false);
        setFeedback('');
    };

    const handleStartRejection = () => {
        setIsRejecting(true);
        if (!isModalOpen) setIsModalOpen(true);
    };

    const handleCancelRejection = () => {
        setIsRejecting(false);
        setFeedback('');
    };

    const handleApprove = async () => {
        const effectiveSubId = subscriptionId || req.subscriptionId;
        if (!effectiveSubId || !req.id) return;

        setIsSubmittingReview(true);
        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            if (!freshToken) throw new Error('No authentication token available');
            const orgId = user?.org_id || user?.organization?.id;
            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

            const response = await fetch(`${baseUrl}/subscriptions/${effectiveSubId}/resolved-requests/${req.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`,
                    ...(orgId ? { 'x-org-id': orgId } : {}),
                },
                body: JSON.stringify({ status: 'approved' }),
            });

            if (response.ok) {
                setCurrentStatus('approved');
                handleCloseDetails();
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Error al aprobar la solicitud');
            }
        } catch (error: any) {
            console.error('Failed to approve request:', error);
            alert(`Error aprobando solicitud: ${error.message}`);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleConfirmRejection = async () => {
        const effectiveSubId = subscriptionId || req.subscriptionId;
        if (!effectiveSubId || !req.id || !feedback.trim()) return;

        setIsSubmittingReview(true);
        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            if (!freshToken) throw new Error('No authentication token available');
            const orgId = user?.org_id || user?.organization?.id;
            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

            const response = await fetch(`${baseUrl}/subscriptions/${effectiveSubId}/resolved-requests/${req.id}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`,
                    ...(orgId ? { 'x-org-id': orgId } : {}),
                },
                body: JSON.stringify({ status: 'rejected', feedbackNotes: feedback.trim() }),
            });

            if (response.ok) {
                setCurrentStatus('rejected');
                setCurrentRejectionReason(feedback.trim());
                handleCloseDetails();
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Error al rechazar la solicitud');
            }
        } catch (error: any) {
            console.error('Failed to reject request:', error);
            alert(`Error rechazando solicitud: ${error.message}`);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleCustomDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const effectiveSubId = subscriptionId || req.subscriptionId;
        if (!file || !effectiveSubId || !req.id) return;

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            if (!freshToken) throw new Error('No authentication token available');

            const orgId = user?.org_id || user?.organization?.id;
            const uploadedKey = await uploadFile(file, 'documents', freshToken, orgId);

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/subscriptions/${effectiveSubId}/resolved-requests/${req.id}/custom-document`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${freshToken}`,
                    ...(orgId ? { 'x-org-id': orgId } : {}),
                },
                body: JSON.stringify({ fileKey: uploadedKey, fileName: file.name }),
            });

            if (response.ok) {
                setUploadedCustomFile(uploadedKey);
                setCurrentStatus('waiting_client');
                alert('Documento personalizado subido correctamente. El cliente ha sido notificado.');
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Error al guardar el documento personalizado');
            }
        } catch (error: any) {
            console.error('Failed to upload custom document:', error);
            alert(`Error subiendo documento: ${error.message}`);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const isCustomDocPendingUpload = Boolean(
        req.type === 'document_review' &&
        (req.customDocumentPerUser || req.config?.customDocumentPerUser) &&
        !uploadedCustomFile
    );

    const responsesList = req.clientResponses || (
        req.payload?.data?.responses && typeof req.payload?.data?.responses === 'object'
            ? Object.entries(req.payload.data.responses).map(([k, v]) => ({ label: k, value: String(v) }))
            : undefined
    );

    return (
        <>
            <div className={`${styles['request-item']} ${styles[`request-item--${modifier}`]} ${className || ''}`}>
                <div className={styles['request-item__header']}>
                    <div className={styles['request-item__icon-wrapper']}>
                        <Icon name={getRequestIcon()} className={`${styles['request-item__icon']} ${styles[`request-item__icon--${modifier}`]}`} />
                    </div>
                    <div className={styles['request-item__content']}>
                        <div className={styles['request-item__title-row']}>
                            <p className={styles['request-item__title']}>{req.title}</p>
                            <span className={`${styles['request-item__status-badge']} ${styles[`request-item__status-badge--${modifier}`]}`}>
                                {getStatusBadgeLabel(currentStatus)}
                            </span>
                        </div>
                        {req.description && (
                            <p className={styles['request-item__description']}>{req.description}</p>
                        )}
                        {req.dueDate && currentStatus === 'pending' && (
                            <p className={styles['request-item__due-date']}>
                                <Icon name="schedule" className={styles['request-item__due-date-icon']} />
                                Due: {new Date(req.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Rejection / Feedback Notes if rejected */}
                {currentStatus === 'rejected' && currentRejectionReason && (
                    <div className={styles['request-item__rejection-info']}>
                        <Icon name="error_outline" className={styles['request-item__rejection-info-icon']} />
                        <div className={styles['request-item__rejection-info-text']}>
                            <strong>Feedback / Observations:</strong>
                            {currentRejectionReason}
                        </div>
                    </div>
                )}

                {/* Client Submitted Responses (Form or Data) */}
                {responsesList && responsesList.length > 0 && (
                    <div className={styles['request-item__responses-box']}>
                        <div className={styles['request-item__responses-header']}>
                            <Icon name="assignment_turned_in" className="text-xs text-emerald-400" />
                            <span>Client Submitted Responses</span>
                        </div>
                        <div className={styles['request-item__responses-list']}>
                            {responsesList.map((item, idx) => (
                                <div key={idx} className={styles['request-item__response-item']}>
                                    <span className={styles['request-item__response-label']}>{item.label}:</span>
                                    <span className={styles['request-item__response-value']}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation Metadata if any */}
                {req.metadata && req.metadata.length > 0 && !responsesList && (
                    <div className={styles['request-item__metadata']}>
                        <p className={styles['request-item__metadata-title']}>Validation Details</p>
                        <div className={styles['request-item__metadata-grid']}>
                            {req.metadata.map((item, idx) => (
                                <div key={idx} className={styles['request-item__metadata-item']}>
                                    <span className={styles['request-item__metadata-label']}>{item.label}:</span>
                                    <span className={styles['request-item__metadata-value']}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Note when waiting for client */}
                {currentStatus === 'waiting_client' && (
                    <div className={styles['request-item__waiting-note']}>
                        <Icon name="hourglass_empty" className="text-xs" />
                        <span>Awaiting client submission or approval</span>
                    </div>
                )}

                {/* Modal View button if payload exists */}
                {req.payload && (
                    <button 
                        className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--details']}`}
                        onClick={handleOpenDetails}
                    >
                        <Icon name="visibility" className="text-[14px]" />
                        {currentStatus === 'pending' ? 'Review & Decision' : 'View Submission Details'}
                    </button>
                )}

                {/* Accept / Reject Buttons: ONLY appear when status is pending AND not waiting for PDF upload */}
                {currentStatus === 'pending' && !isCustomDocPendingUpload && (
                    <div className={`${styles['request-item__actions']} ${styles['request-item__actions--pending']}`}>
                        <button 
                            disabled={isSubmittingReview}
                            onClick={handleStartRejection}
                            className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--reject']}`}
                        >
                            <Icon name="close" className="text-[14px]" />
                            Reject
                        </button>
                        <button 
                            disabled={isSubmittingReview}
                            onClick={handleApprove}
                            className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--accept']}`}
                        >
                            <Icon name="check" className="text-[14px]" />
                            {isSubmittingReview ? 'Approving...' : 'Accept'}
                        </button>
                    </div>
                )}

                {/* Provider Custom Document Upload Flow */}
                {req.type === 'document_review' && (req.customDocumentPerUser || req.config?.customDocumentPerUser) && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        {uploadedCustomFile ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                <Icon name="check_circle" className="text-sm" />
                                <span>Custom PDF Uploaded</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                                <Icon name="hourglass_top" className="text-sm animate-pulse" />
                                <span>Pending PDF Upload</span>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleCustomDocFileChange}
                        />
                        <button
                            type="button"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 text-xs rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1 transition-colors"
                        >
                            <Icon name={isUploading ? 'sync' : 'upload_file'} className={isUploading ? 'animate-spin text-xs' : 'text-xs'} />
                            <span>{isUploading ? 'Uploading...' : uploadedCustomFile ? 'Replace PDF' : 'Upload PDF'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal for detailed verification or entering rejection feedback */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseDetails}
                title={isRejecting ? 'Rejecting: ' + req.title : 'Verifying: ' + req.title}
                size="lg"
                footer={
                    currentStatus === 'pending' ? (
                        isRejecting ? (
                            <>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--details']}`}
                                    onClick={handleCancelRejection}
                                    disabled={isSubmittingReview}
                                >
                                    Back
                                </button>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--reject']}`}
                                    onClick={handleConfirmRejection}
                                    disabled={!feedback.trim() || isSubmittingReview}
                                >
                                    <Icon name="report" /> {isSubmittingReview ? 'Rejecting...' : 'Confirm Rejection'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--reject']}`}
                                    onClick={handleStartRejection}
                                    disabled={isSubmittingReview}
                                >
                                    <Icon name="close" /> Reject Request
                                </button>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--accept']}`}
                                    onClick={handleApprove}
                                    disabled={isSubmittingReview}
                                >
                                    <Icon name="check" /> {isSubmittingReview ? 'Approving...' : 'Approve Request'}
                                </button>
                            </>
                        )
                    ) : null
                }
            >
                {isRejecting ? (
                    <div className="space-y-4">
                        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <h4 className="text-rose-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <Icon name="info" className="text-base" />
                                Why are you rejecting this?
                            </h4>
                            <p className="text-xs text-slate-400 mb-4">
                                This feedback will be shown to the client so they can correct the issue and re-submit.
                            </p>
                            <textarea 
                                className={styles['verification-feedback-input']}
                                placeholder="Example: The document is blurry, or the phone number format is invalid..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                ) : req.payload ? (
                    <RequestVerificationContent payload={req.payload} />
                ) : (
                    <div className="text-xs text-slate-400 p-4">
                        No additional submission payload available.
                    </div>
                )}
            </Modal>
        </>
    );
}

export const mockRequests: Request[] = [
    {
        id: 'mock-form',
        type: 'other',
        status: 'pending',
        title: 'Complete Company Profile',
        description: 'Verification of company details provided during signup.',
        payload: {
            type: 'form',
            data: {
                fields: [
                    { id: 'legal_name', label: 'Legal Name' },
                    { id: 'tax_address', label: 'Tax Address' }
                ],
                responses: {
                    legal_name: 'Example Corp SAS',
                    tax_address: '123 Business Ave, Silicon Valley, CA'
                }
            }
        }
    },
    {
        id: 'mock-doc',
        type: 'document_review',
        status: 'pending',
        title: 'Review ID Document',
        description: 'Verify the identity document uploaded by the authorized representative.',
        payload: {
            type: 'document',
            data: {
                fileName: 'representative_id.jpg',
                uploadDate: '2025-04-12',
                fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800'
            }
        }
    },
    {
        id: 'mock-pay',
        type: 'other',
        status: 'pending',
        title: 'Verify Setup Fee',
        description: 'Check receipt for the initial setup fee payment.',
        payload: {
            type: 'payment',
            data: {
                invoiceNumber: 'INV-SET-001',
                amount: '$500.00',
                receiptUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800'
            }
        }
    }
];
