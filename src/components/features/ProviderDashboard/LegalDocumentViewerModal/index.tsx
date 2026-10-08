'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/molecule/Modal';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import { useApp } from '@/src/context/AppContext';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface LegalDocumentItem {
    id?: string;
    name?: string;
    title?: string;
    status?: string;
    generation_status?: 'pending' | 'generating' | 'ready' | 'failed' | string;
    generation_error?: string | null;
    file_key?: string | null;
    fileKey?: string | null;
    signed_at?: string | null;
    signedAt?: string | null;
    icon?: string;
    url?: string;
    format?: string;
    doc_type?: string;
}

export interface LegalDocumentViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: LegalDocumentItem | null;
    clientName?: string;
}

export default function LegalDocumentViewerModal({
    isOpen,
    onClose,
    document: doc,
    clientName,
}: LegalDocumentViewerModalProps) {
    const { user } = useApp();
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const docName = doc?.name || doc?.title || 'Legal Document';
    const fileKey = doc?.file_key || doc?.fileKey || doc?.url || null;
    const isGenerating = doc?.generation_status === 'pending' || doc?.generation_status === 'generating';
    const isFailed = doc?.generation_status === 'failed';

    const loadDocumentUrl = async () => {
        if (!fileKey) {
            setDownloadUrl(null);
            return;
        }

        // Direct external URL
        if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
            setDownloadUrl(fileKey);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            const orgId = user?.org_id || user?.organization?.id;
            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

            const headers: Record<string, string> = {};
            if (freshToken) {
                headers['Authorization'] = `Bearer ${freshToken}`;
            }
            if (orgId) {
                headers['X-Org-ID'] = orgId;
            }

            const res = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(fileKey)}`, {
                headers,
            });

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.message || `Error fetching download URL (${res.status})`);
            }

            const body = await res.json();
            const resolvedUrl = body.data?.url || body.url || body.downloadUrl;
            if (!resolvedUrl) {
                throw new Error('No download URL returned from storage service');
            }

            setDownloadUrl(resolvedUrl);
        } catch (err: any) {
            console.error('[LegalDocumentViewerModal] Error:', err);
            setError(err.message || 'Could not load document preview.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && doc) {
            loadDocumentUrl();
        } else {
            setDownloadUrl(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, doc, fileKey]);

    if (!isOpen || !doc) return null;

    let statusModifier = 'pending';
    if (doc.status === 'signed') statusModifier = 'signed';
    else if (isGenerating) statusModifier = 'generating';
    else if (isFailed) statusModifier = 'failed';

    const formattedSignedDate = doc.signed_at || doc.signedAt
        ? new Date(doc.signed_at || doc.signedAt!).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : null;

    const modalFooter = (
        <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-400">
                {clientName && <span>Client: <strong className="text-slate-200">{clientName}</strong></span>}
            </div>
            <div className="flex items-center gap-2">
                {downloadUrl && (
                    <>
                        <Button
                            variant="outline"
                            onClick={() => window.open(downloadUrl, '_blank')}
                        >
                            <div className="flex items-center gap-1.5 text-xs text-slate-200">
                                <Icon name="open_in_new" className="text-sm" />
                                <span>Open in new tab</span>
                            </div>
                        </Button>
                        <a
                            href={downloadUrl}
                            download={docName}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1978e5] hover:bg-[#1978e5]/90 text-white transition-colors"
                        >
                            <Icon name="download" className="text-sm" />
                            <span>Download PDF</span>
                        </a>
                    </>
                )}
                <Button variant="outline" onClick={onClose}>
                    <span>Close</span>
                </Button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={docName}
            size="2xl"
            footer={modalFooter}
        >
            <div className={styles.viewer}>
                {/* Document Metadata Bar */}
                <div className={styles['viewer__meta']}>
                    <div className={styles['viewer__meta-left']}>
                        <div className={styles['viewer__meta-icon-box']}>
                            <Icon name={doc.icon || 'description'} className="text-xl" />
                        </div>
                        <div className="min-w-0">
                            <h4 className={styles['viewer__meta-title']} title={docName}>{docName}</h4>
                            <div className={styles['viewer__meta-sub']}>
                                {doc.doc_type && <span>Type: {doc.doc_type}</span>}
                                {formattedSignedDate && (
                                    <span>• Signed: {formattedSignedDate}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles['viewer__meta-right']}>
                        <span className={`${styles['viewer__badge']} ${styles[`viewer__badge--${statusModifier}`]}`}>
                            {isGenerating ? 'GENERATING' : isFailed ? 'FAILED' : (doc.status || 'pending').toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content / PDF Preview Area */}
                <div className={styles['viewer__content']}>
                    {isLoading ? (
                        <div className={styles['viewer__state-box']}>
                            <div className={`${styles['viewer__state-icon']} ${styles['viewer__state-icon--loading']}`}>
                                <Icon name="sync" />
                            </div>
                            <h5 className={styles['viewer__state-title']}>Loading document...</h5>
                            <p className={styles['viewer__state-desc']}>
                                Fetching secure pre-signed preview from storage.
                            </p>
                        </div>
                    ) : isGenerating ? (
                        <div className={styles['viewer__state-box']}>
                            <div className={`${styles['viewer__state-icon']} ${styles['viewer__state-icon--generating']}`}>
                                <Icon name="hourglass_top" />
                            </div>
                            <h5 className={styles['viewer__state-title']}>Document is being generated</h5>
                            <p className={styles['viewer__state-desc']}>
                                This document is currently queued or being compiled by the background PDF engine. Please try again shortly.
                            </p>
                            <Button variant="outline" onClick={loadDocumentUrl}>
                                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                                    <Icon name="refresh" className="text-sm" />
                                    <span>Check again</span>
                                </div>
                            </Button>
                        </div>
                    ) : isFailed ? (
                        <div className={styles['viewer__state-box']}>
                            <div className={`${styles['viewer__state-icon']} ${styles['viewer__state-icon--error']}`}>
                                <Icon name="error_outline" />
                            </div>
                            <h5 className={styles['viewer__state-title']}>Generation Failed</h5>
                            <p className={styles['viewer__state-desc']}>
                                {doc.generation_error || 'An error occurred during automated document compilation.'}
                            </p>
                        </div>
                    ) : error ? (
                        <div className={styles['viewer__state-box']}>
                            <div className={`${styles['viewer__state-icon']} ${styles['viewer__state-icon--error']}`}>
                                <Icon name="error" />
                            </div>
                            <h5 className={styles['viewer__state-title']}>Preview Unavailable</h5>
                            <p className={styles['viewer__state-desc']}>{error}</p>
                            <Button variant="outline" onClick={loadDocumentUrl}>
                                <div className="flex items-center gap-1.5 text-xs text-slate-200">
                                    <Icon name="refresh" className="text-sm" />
                                    <span>Retry</span>
                                </div>
                            </Button>
                        </div>
                    ) : downloadUrl ? (
                        <iframe
                            src={downloadUrl}
                            className={styles['viewer__iframe']}
                            title={docName}
                        />
                    ) : (
                        <div className={styles['viewer__state-box']}>
                            <div className={`${styles['viewer__state-icon']} ${styles['viewer__state-icon--empty']}`}>
                                <Icon name="description" />
                            </div>
                            <h5 className={styles['viewer__state-title']}>No file attached</h5>
                            <p className={styles['viewer__state-desc']}>
                                This legal document record does not have a PDF file uploaded or linked yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
