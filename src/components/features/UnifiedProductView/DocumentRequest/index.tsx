'use client';

import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface DocumentRequestProps {
    documentTitle: string;
    instructions: string;
    allowedFormats: string[];
    status: 'pending' | 'uploaded' | 'approved' | 'rejected';
    uploadDate?: string;
    onUpload?: () => void;
    className?: string;
}

export default function DocumentRequest({
    documentTitle,
    instructions,
    allowedFormats,
    status,
    uploadDate,
    onUpload,
    className = ''
}: DocumentRequestProps) {
    const isUploaded = status === 'uploaded' || status === 'approved';
    const isApproved = status === 'approved';
    const isRejected = status === 'rejected';

    return (
        <div className={`${styles['document-request']} ${className}`}>
            <div className={styles['document-request__header']}>
                <h3 className={styles['document-request__title-box']}>
                    <Icon 
                        name="description" 
                        className={isApproved ? 'text-emerald-500' : isRejected ? 'text-red-500' : 'text-amber-500'} 
                    /> 
                    Document Request
                </h3>
                {isApproved && <Badge variant="success">Approved</Badge>}
                {isUploaded && !isApproved && <Badge variant="primary">Under Review</Badge>}
                {isRejected && <Badge variant="warning">Rejected</Badge>}
                {!isUploaded && !isRejected && <Badge variant="warning">Action Required</Badge>}
            </div>

            <div className={styles['document-request__content']}>
                <div className={styles['document-request__layout']}>
                    <div className={styles['document-request__info']}>
                        <div>
                            <h4 className={styles['document-request__doc-title']}>{documentTitle}</h4>
                            <p className={styles['document-request__instructions']}>{instructions}</p>
                        </div>

                        <div className={styles['document-request__formats-row']}>
                            <span className={styles['document-request__formats-label']}>Accepted Formats:</span>
                            <div className={styles['document-request__formats-list']}>
                                {allowedFormats?.map(ext => (
                                    <span key={ext} className={styles['document-request__format-tag']}>
                                        {ext}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {isUploaded && (
                            <div className={`${styles['document-request__status-box']} ${styles['document-request__status-box--success']}`}>
                                <Icon name="check_circle" className="text-emerald-500" />
                                <div className={styles['document-request__status-text-box']}>
                                    <p className={styles['document-request__status-title']}>Document Uploaded Successfully</p>
                                    {uploadDate && (
                                        <p className={styles['document-request__status-subtext']}>
                                            Uploaded on {uploadDate}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {isRejected && (
                            <div className={`${styles['document-request__status-box']} ${styles['document-request__status-box--error']}`}>
                                <Icon name="error" className="text-red-500" />
                                <div className={styles['document-request__status-text-box']}>
                                    <p className={styles['document-request__status-title']}>Document Rejected</p>
                                    <p className={styles['document-request__status-subtext']}>
                                        Please review the instructions and upload again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles['document-request__upload-section']}>
                        {!isApproved && (
                            <div className={styles['document-request__dropzone']} onClick={onUpload}>
                                <div className={styles['document-request__upload-icon-box']}>
                                    <Icon name="upload_file" />
                                </div>
                                <span className={styles['document-request__upload-label']}>
                                    {isUploaded || isRejected ? 'Upload Replacement' : 'Browse Files'}
                                </span>
                                <span className={styles['document-request__upload-hint']}>or drag and drop</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
