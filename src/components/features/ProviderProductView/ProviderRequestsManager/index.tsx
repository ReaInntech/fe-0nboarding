'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import { ClientRequest } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface ProviderRequestsManagerProps {
    requests: ClientRequest[];
    onReview?: (req: ClientRequest, status: 'approved' | 'rejected', feedbackNotes?: string) => Promise<void>;
}

const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' => {
    switch (status) {
        case 'pending': return 'warning';
        case 'in_review': return 'info';
        case 'approved': return 'success';
        case 'rejected': return 'error';
        default: return 'neutral';
    }
};

const getPriorityClass = (priority: string) => {
    switch (priority) {
        case 'high': return styles['requests-manager__priority--high'];
        case 'medium': return styles['requests-manager__priority--medium'];
        case 'low': return styles['requests-manager__priority--low'];
        default: return '';
    }
};

export default function ProviderRequestsManager({
    requests,
    onReview,
}: ProviderRequestsManagerProps) {
    const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [feedbackNotes, setFeedbackNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenReview = (req: ClientRequest) => {
        setSelectedRequest(req);
        setFeedbackNotes(req.feedback_notes || '');
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        if (isSubmitting) return;
        setIsDrawerOpen(false);
        setSelectedRequest(null);
    };

    const handleReviewAction = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest || !onReview) return;
        setIsSubmitting(true);
        try {
            await onReview(selectedRequest, status, feedbackNotes.trim());
            setIsDrawerOpen(false);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['requests-manager__header']}>
                <h3 className={styles['requests-manager__title']}>
                    <Icon name="notifications_active" className="text-[#1978e5]" /> Client Requests
                </h3>
                <Badge variant="warning">{requests.filter(r => r.status === 'pending').length} Pending</Badge>
            </div>

            <div className={styles['requests-manager__table-container']}>
                <table className={styles['requests-manager__table']}>
                    <thead>
                        <tr>
                            <th className={styles['requests-manager__th']}>Request</th>
                            <th className={styles['requests-manager__th']}>Date</th>
                            <th className={styles['requests-manager__th']}>Status</th>
                            <th className={`${styles['requests-manager__th']} ${styles['requests-manager__th--right']}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.id} className={styles['requests-manager__tr']}>
                                <td className={styles['requests-manager__td']}>
                                    <div className={styles['requests-manager__request-info']}>
                                        <span className={styles['requests-manager__subject']}>{req.subject}</span>
                                        <div className={styles['requests-manager__meta']}>
                                            <span className={styles['requests-manager__id']}>{req.id}</span>
                                            <span className={styles['requests-manager__separator']}>•</span>
                                            <span className={`${styles['requests-manager__priority']} ${getPriorityClass(req.priority)}`}>
                                                {req.priority} priority
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className={`${styles['requests-manager__td']} ${styles['requests-manager__td--date']}`}>
                                    {req.date}
                                </td>
                                <td className={styles['requests-manager__td']}>
                                    <Badge variant={getStatusVariant(req.status)} size="sm">
                                        {req.status.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className={`${styles['requests-manager__td']} ${styles['requests-manager__td--right']}`}>
                                    <Button
                                        variant="ghost"
                                        className={styles['requests-manager__review-btn']}
                                        onClick={() => handleOpenReview(req)}
                                    >
                                        Review
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {requests.length === 0 && (
                <div className={styles['requests-manager__empty']}>
                    No requests found for this product instance.
                </div>
            )}

            {/* Homologation & Review Drawer */}
            {isDrawerOpen && selectedRequest && (
                <div className={styles['requests-manager__drawer-backdrop']} onClick={handleCloseDrawer}>
                    <div className={styles['requests-manager__drawer']} onClick={(e) => e.stopPropagation()}>
                        <div className={styles['requests-manager__drawer-header']}>
                            <div className="flex items-center gap-2">
                                <Icon name="fact_check" className="text-blue-400" />
                                <h4 className="font-bold text-base text-white">Review Request</h4>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseDrawer}
                                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                <Icon name="close" />
                            </button>
                        </div>

                        <div className={styles['requests-manager__drawer-body']}>
                            {/* Request Summary Card */}
                            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Request Title</p>
                                        <p className="font-bold text-white text-base mt-0.5">{selectedRequest.subject}</p>
                                    </div>
                                    <Badge variant={getStatusVariant(selectedRequest.status)}>
                                        {selectedRequest.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                                    <div>
                                        <span className="text-slate-500">Client:</span>
                                        <p className="font-medium text-slate-300">{selectedRequest.client_name || 'Client Org'}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Submitted:</span>
                                        <p className="font-medium text-slate-300">{selectedRequest.date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Client Evidence / Submission details */}
                            <div className="space-y-2">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Client Evidence & Response
                                </h5>
                                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-3">
                                    {selectedRequest.resolved_data ? (
                                        <pre className="p-3 rounded bg-slate-900 overflow-x-auto text-[11px] text-blue-300 border border-slate-800">
                                            {JSON.stringify(selectedRequest.resolved_data, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="flex items-center gap-3 text-slate-300">
                                            <Icon name="attachment" className="text-emerald-400 text-lg" />
                                            <div>
                                                <p className="font-semibold text-slate-200">Attached Evidence / Response</p>
                                                <p className="text-[11px] text-slate-500">Client uploaded verification files or evidence</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Feedback & Review Observations */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                    <span>Review Notes / Reason</span>
                                    <span className="text-[10px] text-slate-500 font-normal">Sent to client</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={feedbackNotes}
                                    onChange={(e) => setFeedbackNotes(e.target.value)}
                                    placeholder="Enter feedback notes, verification remarks, or reasons for rejection..."
                                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600 resize-none"
                                />
                            </div>
                        </div>

                        <div className={styles['requests-manager__drawer-footer']}>
                            <Button
                                variant="outline"
                                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                                disabled={isSubmitting}
                                onClick={() => handleReviewAction('rejected')}
                            >
                                <Icon name="close" className="mr-1" />
                                {isSubmitting ? 'Processing...' : 'Reject Request'}
                            </Button>
                            <Button
                                variant="primary"
                                disabled={isSubmitting}
                                onClick={() => handleReviewAction('approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                            >
                                <Icon name="check" className="mr-1" />
                                {isSubmitting ? 'Processing...' : 'Approve Request'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
