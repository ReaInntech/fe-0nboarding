import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

export interface Document {
    id?: string | number;
    title?: string;
    name?: string;
    description?: string;
    icon?: string;
    format?: string;
    step?: string;
    createdAt?: string;
    approvedAt?: string;
    generationStatus?: 'pending' | 'generating' | 'ready' | 'failed';
    fileKey?: string | null;
}

export interface LegalDocumentsProps {
    title?: string;
    showModificationLink?: boolean;
    documents: Document[];
    className?: string;
}

export default function LegalDocuments({
    title = 'Documents',
    documents = [],
    className = ''
}: LegalDocumentsProps) {
    if (!documents || documents.length === 0) {
        return null;
    }

    const [openingDocId, setOpeningDocId] = React.useState<string | number | null>(null);

    const handleOpenDocument = async (doc: Document) => {
        if (!doc.fileKey) return;
        setOpeningDocId(doc.id || doc.fileKey);

        try {
            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || '/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(doc.fileKey)}`);
            if (response.ok) {
                const body = await response.json();
                const downloadUrl = body.data?.url || body.url || body.downloadUrl;
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank');
                }
            } else {
                console.error('Failed to get download url for legal document');
            }
        } catch (err) {
            console.error('Error opening document:', err);
        } finally {
            setOpeningDocId(null);
        }
    };

    return (
        <div className={`${styles['legal-documents']} ${className}`}>
            <div className={styles['legal-documents__header']}>
                <h3 className={styles['legal-documents__title']}>
                    <Icon name="description" className="text-[#1978e5]" /> {title}
                </h3>
            </div>
            <div className={styles['legal-documents__list']}>
                {documents.map((doc, idx) => {
                    const isGenerating = doc.generationStatus === 'pending' || doc.generationStatus === 'generating';
                    const isFailed = doc.generationStatus === 'failed';
                    const isReady = doc.generationStatus === 'ready';
                    const isOpening = openingDocId === (doc.id || doc.fileKey);

                    return (
                        <div key={doc.id || idx} className={styles['legal-documents__item']}>
                            <div className={styles['legal-documents__item-main']}>
                                <div className={styles['legal-documents__item-top']}>
                                    <div className={styles['legal-documents__icon-container']}>
                                        <Icon 
                                            name={doc.icon || 'description'} 
                                            className={styles['legal-documents__icon']} 
                                        />
                                    </div>
                                    <div className={styles['legal-documents__item-info']}>
                                        <div className={styles['legal-documents__name-row']}>
                                            <h4 className={styles['legal-documents__name']}>
                                                {doc.name || doc.title}
                                            </h4>
                                            <div className={styles['legal-documents__badge-group']}>
                                                {doc.format && (
                                                    <span className={`${styles['legal-documents__badge']} ${styles['legal-documents__badge--format']}`}>
                                                        {doc.format}
                                                    </span>
                                                )}
                                                <span className={`${styles['legal-documents__badge']} ${styles['legal-documents__badge--step']}`}>
                                                    {doc.step || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={styles['legal-documents__description']}>
                                            {doc.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                <div className={styles['legal-documents__footer']}>
                                    <div className={styles['legal-documents__meta']}>
                                        <div className={styles['legal-documents__meta-item']}>
                                            <Icon name="add_circle_outline" className="text-[10px]" />
                                            <span>Created: {doc.createdAt || 'N/A'}</span>
                                        </div>
                                        
                                        {isGenerating && (
                                            <div className={`${styles['legal-documents__meta-item']} ${styles['legal-documents__meta-item--generating']}`}>
                                                <Icon name="sync" className="text-[11px] animate-spin" />
                                                <span>Generating PDF...</span>
                                            </div>
                                        )}

                                        {isReady && (
                                            <div className={`${styles['legal-documents__meta-item']} ${styles['legal-documents__meta-item--approved']}`}>
                                                <Icon name="verified" className="text-[10px]" />
                                                <span>Approved: {doc.approvedAt || 'Ready'}</span>
                                            </div>
                                        )}

                                        {isFailed && (
                                            <div className={`${styles['legal-documents__meta-item']} ${styles['legal-documents__meta-item--failed']}`}>
                                                <Icon name="error_outline" className="text-[10px]" />
                                                <span>Generation error</span>
                                            </div>
                                        )}

                                        {!isGenerating && !isReady && !isFailed && (
                                            <div className={`${styles['legal-documents__meta-item']} ${styles['legal-documents__meta-item--approved']}`}>
                                                <Icon name="verified" className="text-[10px]" />
                                                <span>Status: {doc.approvedAt || 'Pending'}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className={`${styles['legal-documents__action']} ${isGenerating || !doc.fileKey ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        title={
                                            isGenerating
                                                ? 'Document is being generated, it will be available shortly'
                                                : isOpening
                                                ? 'Opening...'
                                                : isReady
                                                ? 'View PDF document'
                                                : 'Pending document'
                                        }
                                        disabled={isGenerating || isOpening || !doc.fileKey}
                                        onClick={() => handleOpenDocument(doc)}
                                    >
                                        <Icon 
                                            name={isOpening ? 'sync' : isGenerating ? 'hourglass_empty' : 'visibility'} 
                                            className={`text-xl ${isOpening ? 'animate-spin' : ''}`} 
                                        />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
