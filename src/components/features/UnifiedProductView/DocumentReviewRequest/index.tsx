'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Button from '../../../shared/atoms/Button';
import Modal from '../../../shared/molecule/Modal';
import styles from './index.module.scss';

export interface DocumentReviewRequestProps {
    id?: string;
    documentTitle: string;
    instructions?: string;
    templateFile?: string | null;
    documentUrl?: string | null;
    fileName?: string;
    status: 'pending' | 'approved' | 'rejected';
    feedbackNotes?: string;
    requiresApproval?: boolean;
    allowComments?: boolean;
    onApprove?: () => Promise<void> | void;
    onReject?: (comments: string) => Promise<void> | void;
    className?: string;
}

export default function DocumentReviewRequest({
    documentTitle,
    instructions,
    templateFile,
    documentUrl,
    fileName,
    status = 'pending',
    feedbackNotes,
    requiresApproval = true,
    allowComments = true,
    onApprove,
    onReject,
    className = '',
}: DocumentReviewRequestProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [showRejectPanel, setShowRejectPanel] = useState(false);
    const [rejectionComments, setRejectionComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';
    const isPending = status === 'pending';

    const handleApprove = async () => {
        if (!onApprove) return;
        setIsSubmitting(true);
        try {
            await onApprove();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!onReject || !rejectionComments.trim()) return;
        setIsSubmitting(true);
        try {
            await onReject(rejectionComments.trim());
            setShowRejectPanel(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resolvedFileName = fileName || (templateFile ? templateFile.split('/').pop() : 'Proposal_Document.pdf');

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
                {isPending && <Badge variant="warning">Action Required</Badge>}
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

                        {/* Document File Card */}
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
                                {(documentUrl || templateFile) && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsViewerOpen(true)}
                                    >
                                        <Icon name="visibility" className="mr-1 text-sm" /> Preview
                                    </Button>
                                )}
                                {documentUrl && (
                                    <a
                                        href={documentUrl}
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
                                    {feedbackNotes ? (
                                        <p className="text-xs opacity-90 mt-1 italic bg-white/40 dark:bg-black/20 p-2 rounded">
                                            "{feedbackNotes}"
                                        </p>
                                    ) : (
                                        <p className="text-xs opacity-80 mt-0.5">
                                            You requested modifications. The provider is reviewing your notes.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Client Action Buttons (when pending) */}
                        {isPending && requiresApproval && (
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
            >
                <div className="h-[550px] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    {documentUrl ? (
                        <iframe
                            src={documentUrl}
                            className="w-full h-full border-none"
                            title="Document Preview"
                        />
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="description" className="text-5xl text-blue-500 mb-3" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{resolvedFileName}</p>
                            <p className="text-sm text-slate-400 mt-1">Preview rendered securely in client viewer.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
