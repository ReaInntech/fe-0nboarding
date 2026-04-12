import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface VerificationPayload {
    type: 'form' | 'payment' | 'document' | 'terms';
    data: any;
}

interface RequestVerificationContentProps {
    payload: VerificationPayload;
}

export default function RequestVerificationContent({ payload }: RequestVerificationContentProps) {
    const { type, data } = payload;

    switch (type) {
        case 'form':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Form Responses</h4>
                        <div className={styles['verification-table']}>
                            {data.fields.map((field: any) => (
                                <div key={field.id} className={styles['verification-row']}>
                                    <span className={styles['verification-label']}>{field.label}</span>
                                    <span className={styles['verification-value']}>{data.responses[field.id] || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

        case 'payment':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Invoice Details</h4>
                        <div className={styles['verification-table']}>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Invoice #</span>
                                <span className={styles['verification-value']}>{data.invoiceNumber}</span>
                            </div>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Total Amount</span>
                                <span className={styles['verification-value']}>{data.amount}</span>
                            </div>
                        </div>
                    </div>
                    {data.receiptUrl && (
                        <div className={styles['verification-section']}>
                            <h4 className={styles['verification-subtitle']}>Payment Receipt Preview</h4>
                            <div className={styles['verification-preview-box']}>
                                {data.receiptUrl.endsWith('.pdf') ? (
                                    <div className={styles['verification-pdf-placeholder']}>
                                        <Icon name="picture_as_pdf" className="text-4xl text-rose-500 mb-2" />
                                        <span>PDF Document</span>
                                        <button className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                                            Open in New Tab
                                        </button>
                                    </div>
                                ) : (
                                    <img src={data.receiptUrl} alt="Receipt" className={styles['verification-image-preview']} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'document':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Uploaded Document</h4>
                        <div className={styles['verification-table']}>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Document Name</span>
                                <span className={styles['verification-value']}>{data.fileName}</span>
                            </div>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Uploaded On</span>
                                <span className={styles['verification-value']}>{data.uploadDate}</span>
                            </div>
                        </div>
                    </div>
                    {data.fileUrl && (
                        <div className={styles['verification-section']}>
                            <h4 className={styles['verification-subtitle']}>Document Preview</h4>
                            <div className={styles['verification-preview-box']}>
                                {data.fileUrl.endsWith('.pdf') ? (
                                    <div className={styles['verification-pdf-placeholder']}>
                                        <Icon name="picture_as_pdf" className="text-4xl text-rose-500 mb-2" />
                                        <span>PDF Document</span>
                                        <button className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">
                                            Open in New Tab
                                        </button>
                                    </div>
                                ) : (
                                    <img src={data.fileUrl} alt="Document" className={styles['verification-image-preview']} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'terms':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Agreement Summary</h4>
                        <div className={styles['verification-terms-summary']}>
                            <p className="text-sm italic opacity-70 mb-4">"User has agreed to the following terms and conditions by selecting the required checkboxes."</p>
                            <div className="space-y-2">
                                {data.acceptedClauses.map((clause: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <Icon name="check_circle" className="text-emerald-500 mt-0.5 text-base" />
                                        <span>{clause}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Full Document Content</h4>
                        <div className={styles['verification-terms-content']}>
                            {data.content}
                        </div>
                    </div>
                </div>
            );

        default:
            return <div>Unsupported verification type.</div>;
    }
}
