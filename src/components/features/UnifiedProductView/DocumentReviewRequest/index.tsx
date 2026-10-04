'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Button from '../../../shared/atoms/Button';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import styles from './index.module.scss';

export interface DocumentReviewRequestProps {
    id?: string;
    subscriptionId?: string;
    documentTitle: string;
    instructions?: string;
    templateFile?: string | null;
    documentUrl?: string | null;
    fileName?: string;
    customDocumentPerUser?: boolean;
    waitingExplanationMessage?: string;
    data?: any;
    status: 'pending' | 'approved' | 'rejected';
    feedbackNotes?: string;
    requiresApproval?: boolean;
    allowComments?: boolean;
    onApprove?: () => Promise<void> | void;
    onReject?: (comments: string) => Promise<void> | void;
    className?: string;
}

export default function DocumentReviewRequest({
    id,
    subscriptionId,
    documentTitle,
    instructions,
    templateFile,
    documentUrl,
    fileName,
    customDocumentPerUser = false,
    waitingExplanationMessage,
    data,
    status = 'pending',
    feedbackNotes,
    requiresApproval = true,
    allowComments = true,
    onApprove,
    onReject,
    className = '',
}: DocumentReviewRequestProps) {
    const { user } = useApp();
    const [currentStatus, setCurrentStatus] = useState<'pending' | 'approved' | 'rejected'>(status);
    const [currentFeedbackNotes, setCurrentFeedbackNotes] = useState<string | undefined>(feedbackNotes);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(documentUrl || null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const [showRejectPanel, setShowRejectPanel] = useState(false);
    const [rejectionComments, setRejectionComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const customDocumentFile = data?.customDocumentFile;
    const isWaitingForCustomDoc = Boolean(customDocumentPerUser && !customDocumentFile);
    const targetFileKey = customDocumentPerUser ? customDocumentFile : (templateFile || null);

    const resolvedFileName =
        fileName ||
        data?.customDocumentFileName ||
        (customDocumentFile ? customDocumentFile.split('/').pop() : null) ||
        (templateFile ? templateFile.split('/').pop() : 'Proposal_Document.pdf');

    const resolvedWaitingMessage =
        waitingExplanationMessage?.trim() ||
        'El proveedor está fabricando el documento que se requiere aprobar. Te notificaremos en cuanto esté disponible para su revisión.';

    const isApproved = currentStatus === 'approved';
    const isRejected = currentStatus === 'rejected';
    const isPending = currentStatus === 'pending' || (currentStatus as string) === 'ready_for_review';

    const handleOpenPreview = async () => {
        setIsViewerOpen(true);
        if (previewUrl || !targetFileKey) return;

        setIsLoadingPreview(true);
        setPreviewError(null);

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            if (!freshToken) throw new Error('No authentication token available');

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(targetFileKey)}`, {
                headers: { Authorization: `Bearer ${freshToken}` },
            });

            if (response.ok) {
                const body = await response.json();
                const url = body.data?.url || body.url;
                setPreviewUrl(url);
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to get preview URL');
            }
        } catch (error: any) {
            console.error('Preview failed:', error);
            setPreviewError(error.message || 'Could not load document preview');
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            if (onApprove) {
                await onApprove();
            } else if (subscriptionId && id) {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                const orgId = user?.org_id || user?.organization?.id;
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const response = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/resolved-requests/${id}/review`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${freshToken}`,
                        ...(orgId ? { 'x-org-id': orgId } : {}),
                    },
                    body: JSON.stringify({ status: 'approved' }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.message || 'Error al aprobar el documento');
                }
            }
            setCurrentStatus('approved');
        } catch (error: any) {
            console.error('Failed to approve document:', error);
            alert(`Error al aprobar el documento: ${error.message || 'Intente nuevamente'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionComments.trim()) return;
        setIsSubmitting(true);
        try {
            if (onReject) {
                await onReject(rejectionComments.trim());
            } else if (subscriptionId && id) {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                const orgId = user?.org_id || user?.organization?.id;
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const response = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/resolved-requests/${id}/review`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${freshToken}`,
                        ...(orgId ? { 'x-org-id': orgId } : {}),
                    },
                    body: JSON.stringify({ status: 'rejected', feedbackNotes: rejectionComments.trim() }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    throw new Error(err.message || 'Error al enviar observaciones');
                }
            }
            setCurrentStatus('rejected');
            setCurrentFeedbackNotes(rejectionComments.trim());
            setShowRejectPanel(false);
        } catch (error: any) {
            console.error('Failed to submit feedback:', error);
            alert(`Error al enviar observaciones: ${error.message || 'Intente nuevamente'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${styles['doc-review-request']} ${className}`}>
            <div className={styles['doc-review-request__header']}>
                <h3 className={styles['doc-review-request__title-box']}>
                    <Icon
                        name="rule_folder"
                        className={isApproved ? 'text-emerald-500' : isRejected ? 'text-red-500' : 'text-blue-500'}
                    />
                    Document Review & Approval
                </h3>
                {isApproved && <Badge variant="success">Approved</Badge>}
                {isRejected && <Badge variant="error">Changes Requested</Badge>}
                {isPending && isWaitingForCustomDoc && <Badge variant="warning">In Preparation</Badge>}
                {isPending && !isWaitingForCustomDoc && <Badge variant="warning">Action Required</Badge>}
            </div>

            <div className={styles['doc-review-request__content']}>
                <div className={styles['doc-review-request__layout']}>
                    <div className={styles['doc-review-request__info']}>
                        <div>
                            <h4 className={styles['doc-review-request__doc-title']}>{documentTitle}</h4>
                            {instructions && (
                                <p className={styles['doc-review-request__instructions']}>{instructions}</p>
                            )}
                        </div>

                        {/* Custom Document In-Preparation State */}
                        {isWaitingForCustomDoc ? (
                            <div className={styles['doc-review-request__in-prep-box']}>
                                <div className={styles['doc-review-request__in-prep-icon-wrapper']}>
                                    <Icon name="pending_actions" className={styles['doc-review-request__in-prep-icon']} />
                                </div>
                                <div className={styles['doc-review-request__in-prep-content']}>
                                    <h4 className={styles['doc-review-request__in-prep-title']}>
                                        Documento en preparación por el proveedor
                                    </h4>
                                    <p className={styles['doc-review-request__in-prep-text']}>
                                        {resolvedWaitingMessage}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Regular Document File Card */
                            <div className={styles['doc-review-request__document-card']}>
                                <div className={styles['doc-review-request__document-left']}>
                                    <div className={styles['doc-review-request__document-icon']}>
                                        <Icon name="description" />
                                    </div>
                                    <div>
                                        <p className={styles['doc-review-request__document-name']}>{resolvedFileName}</p>
                                        <p className={styles['doc-review-request__document-hint']}>Review document before approving</p>
                                    </div>
                                </div>

                                <div className={styles['doc-review-request__document-actions']}>
                                    {(previewUrl || targetFileKey) && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleOpenPreview}
                                        >
                                            <Icon name="visibility" className="mr-1 text-sm" /> Preview
                                        </Button>
                                    )}
                                    {previewUrl && (
                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            <Icon name="download" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status Message Boxes */}
                        {isApproved && (
                            <div className={`${styles['doc-review-request__status-box']} ${styles['doc-review-request__status-box--approved']}`}>
                                <Icon name="check_circle" className="text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Document Approved</p>
                                    <p className="text-xs opacity-80 mt-0.5">
                                        You have approved this document. The onboarding process can now proceed.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isRejected && (
                            <div className={`${styles['doc-review-request__status-box']} ${styles['doc-review-request__status-box--rejected']}`}>
                                <Icon name="error" className="text-red-500 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">Feedback Sent to Provider</p>
                                    {currentFeedbackNotes ? (
                                        <p className="text-xs opacity-90 mt-1 italic bg-white/40 dark:bg-black/20 p-2 rounded">
                                            "{currentFeedbackNotes}"
                                        </p>
                                    ) : (
                                        <p className="text-xs opacity-80 mt-0.5">
                                            You requested modifications. The provider is reviewing your notes.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Action Buttons (when pending and NOT waiting for custom document) */}
                        {isPending && requiresApproval && !isWaitingForCustomDoc && (
                            <div className="space-y-3">
                                {!showRejectPanel ? (
                                    <div className={styles['doc-review-request__action-bar']}>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={handleApprove}
                                            className={styles['doc-review-request__approve-btn']}
                                        >
                                            <Icon name="check" />
                                            {isSubmitting ? 'Approving...' : 'Approve Document'}
                                        </button>

                                        {allowComments && (
                                            <button
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() => setShowRejectPanel(true)}
                                                className={styles['doc-review-request__reject-btn']}
                                            >
                                                <Icon name="chat_bubble_outline" />
                                                Request Changes
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className={styles['doc-review-request__comments-panel']}>
                                        <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                                            Observations / Reason for Requesting Changes:
                                        </p>
                                        <textarea
                                            rows={3}
                                            value={rejectionComments}
                                            onChange={(e) => setRejectionComments(e.target.value)}
                                            placeholder="Specify which clauses, prices or details need adjustment..."
                                            className={styles['doc-review-request__textarea']}
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowRejectPanel(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                                size="sm"
                                                disabled={isSubmitting || !rejectionComments.trim()}
                                                onClick={handleRejectSubmit}
                                            >
                                                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            <Modal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                title={documentTitle}
                size='lg'
            >
                <div className="h-[550px] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    {isLoadingPreview ? (
                        <div className="flex flex-col items-center gap-3">
                            <Icon name="progress_activity" className="animate-spin text-3xl text-blue-500" />
                            <p className="text-sm text-slate-500">Loading document preview...</p>
                        </div>
                    ) : previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Document Preview"
                        />
                    ) : previewError ? (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="error_outline" className="text-4xl text-red-500 mb-2" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Could not load preview</p>
                            <p className="text-sm text-slate-400 mt-1">{previewError}</p>
                            <Button variant="secondary" size="sm" className="mt-4" onClick={handleOpenPreview}>
                                Try Again
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="description" className="text-5xl text-blue-500 mb-3" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{resolvedFileName}</p>
                            <p className="text-sm text-slate-400 mt-1">No document available to preview.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
