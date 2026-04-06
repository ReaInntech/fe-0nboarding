import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface Request {
    id?: string;
    type: 'document_review' | 'other' | string;
    status: 'approved' | 'rejected' | 'pending';
    title: string;
    dueDate?: string;
}

export interface RequestItemProps {
    req?: Request;
    className?: string;
}

export default function RequestItem({ req, className }: RequestItemProps) {
    if (!req) return null;

    const modifier = req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : 'pending';

    return (
        <div className={`${styles['request-item']} ${styles[`request-item--${modifier}`]} ${className || ''}`}>
            <div className={styles['request-item__header']}>
                <div className={styles['request-item__icon-wrapper']}>
                    <Icon name={req.type === 'document_review' ? 'plagiarism' : 'fact_check'} className={`${styles['request-item__icon']} ${styles[`request-item__icon--${modifier}`]}`} />
                </div>
                <div className={styles['request-item__content']}>
                    <div className={styles['request-item__title-row']}>
                        <p className={styles['request-item__title']}>{req.title}</p>
                        {req.status !== 'pending' && (
                            <span className={`${styles['request-item__status-badge']} ${styles[`request-item__status-badge--${modifier}`]}`}>
                                {req.status}
                            </span>
                        )}
                    </div>
                    {req.dueDate && req.status === 'pending' && (
                        <p className={styles['request-item__due-date']}>
                            <Icon name="schedule" className={styles['request-item__due-date-icon']} />
                            Due: {new Date(req.dueDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </div>

            {req.status === 'pending' && (
                <div className={`${styles['request-item__actions']} ${styles['request-item__actions--pending']}`}>
                    <button className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--reject']}`}>
                        <Icon name="close" className="text-[14px]" />
                        Reject
                    </button>
                    <button className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--accept']}`}>
                        <Icon name="check" className="text-[14px]" />
                        Accept
                    </button>
                </div>
            )}

            {req.type === 'document_review' && (
                <button className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--view']}`}>
                    View Document
                </button>
            )}
        </div>
    );
}
