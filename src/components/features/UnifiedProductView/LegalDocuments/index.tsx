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
    return (
        <div className={`${styles['legal-documents']} ${className}`}>
            <div className={styles['legal-documents__header']}>
                <h3 className={styles['legal-documents__title']}>
                    <Icon name="description" className="text-[#1978e5]" /> {title}
                </h3>
            </div>
            <div className={styles['legal-documents__list']}>
                {documents.map((doc, idx) => (
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
                                    <div className={`${styles['legal-documents__meta-item']} ${styles['legal-documents__meta-item--approved']}`}>
                                        <Icon name="verified" className="text-[10px]" />
                                        <span>Approved: {doc.approvedAt || 'Pending'}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    className={styles['legal-documents__action']}
                                    title="View document"
                                >
                                    <Icon name="visibility" className="text-xl" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
