import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import RequestVerificationContent, { VerificationPayload } from './RequestVerificationContent';
import styles from './index.module.scss';

export interface Request {
    id?: string;
    type: 'document_review' | 'other' | string;
    status: 'approved' | 'rejected' | 'pending';
    title: string;
    description?: string;
    dueDate?: string;
    metadata?: Array<{ label: string; value: string }>;
    payload?: VerificationPayload;
}

export interface RequestItemProps {
    req?: Request;
    className?: string;
}

export default function RequestItem({ req, className }: RequestItemProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!req) return null;

    const modifier = req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : 'pending';

    const handleOpenDetails = () => setIsModalOpen(true);
    const handleCloseDetails = () => setIsModalOpen(false);

    return (
        <>
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
                        {req.description && (
                            <p className={styles['request-item__description']}>{req.description}</p>
                        )}
                        {req.dueDate && req.status === 'pending' && (
                            <p className={styles['request-item__due-date']}>
                                <Icon name="schedule" className={styles['request-item__due-date-icon']} />
                                Due: {new Date(req.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                {req.metadata && req.metadata.length > 0 && (
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

                {req.payload && (
                    <button 
                        className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--details']}`}
                        onClick={handleOpenDetails}
                    >
                        <Icon name="visibility" className="text-[14px]" />
                        View Submission Details
                    </button>
                )}

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
            </div>

            {req.payload && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={handleCloseDetails}
                    title={`Verifying: ${req.title}`}
                    size="lg"
                    footer={
                        req.status === 'pending' ? (
                            <>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--reject']}`}
                                    onClick={handleCloseDetails}
                                >
                                    <Icon name="close" /> Reject Request
                                </button>
                                <button 
                                    className={`${styles['request-item__action-btn']} ${styles['request-item__action-btn--accept']}`}
                                    onClick={handleCloseDetails}
                                >
                                    <Icon name="check" /> Approve Request
                                </button>
                            </>
                        ) : null
                    }
                >
                    <RequestVerificationContent payload={req.payload} />
                </Modal>
            )}
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
