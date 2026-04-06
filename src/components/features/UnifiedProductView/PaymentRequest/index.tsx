import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface LineItem {
    description: string;
    amount: string;
}

export interface PaymentRequestProps {
    title: string;
    invoiceNumber: string;
    issuedDate: string;
    dueDate: string;
    status: 'pending' | 'processing' | 'paid';
    bank?: string;
    accountNumber?: string;
    nit?: string;
    instructions?: string;
    uploadDate?: string;
    paymentDate?: string;
    lineItems?: LineItem[];
    total: string;
    onUpload?: () => void;
    className?: string;
}

export default function PaymentRequest({
    title,
    invoiceNumber,
    issuedDate,
    dueDate,
    status,
    bank,
    accountNumber,
    nit,
    instructions,
    uploadDate,
    paymentDate,
    lineItems,
    total,
    onUpload,
    className = ''
}: PaymentRequestProps) {
    const isPaid = status === 'paid';
    const isProcessing = status === 'processing';

    const contentClass = `${styles['payment-request__content']} ${
        isPaid ? styles['payment-request__content--paid'] : 
        isProcessing ? styles['payment-request__content--processing'] : 
        styles['payment-request__content--pending']
    }`;

    const iconBoxClass = `${styles['payment-request__icon-box']} ${
        isPaid ? styles['payment-request__icon-box--paid'] : 
        isProcessing ? styles['payment-request__icon-box--processing'] : 
        styles['payment-request__icon-box--pending']
    }`;

    return (
        <div className={`${styles['payment-request']} ${className}`}>
            <div className={styles['payment-request__header']}>
                <h3 className={styles['payment-request__title-box']}>
                    <Icon 
                        name="payments" 
                        className={isPaid ? 'text-emerald-500' : 'text-[#1978e5]'} 
                    /> 
                    Payment Request
                </h3>
                {isPaid && <Badge variant="success">Paid</Badge>}
                {isProcessing && <Badge variant="primary">Verifying Payment</Badge>}
                {!isPaid && !isProcessing && <Badge variant="warning">Pending Payment</Badge>}
            </div>

            <div className={contentClass}>
                <div className={styles['payment-request__layout']}>
                    {/* Left Column: Invoice Details */}
                    <div className={styles['payment-request__details']}>
                        <div className={styles['payment-request__details-top']}>
                            <div className={iconBoxClass}>
                                <Icon name="receipt_long" />
                            </div>
                            <div className={styles['payment-request__info-body']}>
                                <p className={styles['payment-request__info-title']}>{title}</p>
                                <p className={styles['payment-request__info-meta']}>
                                    Invoice #{invoiceNumber} • Issued {issuedDate}
                                </p>

                                <div className={styles['payment-request__status-row']}>
                                    {isPaid ? (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--paid']}`}>
                                            <Icon name="check_circle" className="text-base" />
                                            <span>Payment Completed</span>
                                        </div>
                                    ) : isProcessing ? (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--processing']}`}>
                                            <Icon name="hourglass_top" className="text-base" />
                                            <span>Payment Under Review</span>
                                        </div>
                                    ) : (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--pending']}`}>
                                            <Icon name="pending" className="text-base" />
                                            <span>Action Required</span>
                                            <span className={styles['payment-request__due-date']}>Due: {dueDate}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles['payment-request__invoice-table']}>
                                    {lineItems?.map((item, idx) => (
                                        <div key={idx} className={styles['payment-request__invoice-row']}>
                                            <span>{item.description}</span>
                                            <span className={styles['payment-request__invoice-item-amount']}>
                                                {item.amount}
                                            </span>
                                        </div>
                                    ))}
                                    <div className={styles['payment-request__invoice-total-row']}>
                                        <span className={styles['payment-request__invoice-total-label']}>Total Amount</span>
                                        <span className={styles['payment-request__invoice-total-value']}>{total}</span>
                                    </div>
                                </div>

                                <div className={styles['payment-request__actions']}>
                                    <Button variant="ghost">
                                        <Icon name="download" className="text-sm mr-1" /> Download Invoice PDF
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bank Details & Upload */}
                    <div className={styles['payment-request__sidebar']}>
                        {!isPaid && (
                            <div className={styles['payment-request__sidebar-section']}>
                                <div>
                                    <h4 className={styles['payment-request__bank-title']}>Bank Transfer Details</h4>
                                    <div className={styles['payment-request__bank-card']}>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Bank Name</p>
                                            <p className={styles['payment-request__bank-value']}>{bank || 'N/A'}</p>
                                        </div>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Account Number</p>
                                            <div className={styles['payment-request__bank-copy-row']}>
                                                <p className={styles['payment-request__bank-mono']}>{accountNumber || 'N/A'}</p>
                                                <button className="text-slate-400 hover:text-[#1978e5]" title="Copy">
                                                    <Icon name="content_copy" className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Tax ID (NIT)</p>
                                            <p className={styles['payment-request__bank-value']}>{nit || 'N/A'}</p>
                                        </div>
                                        {instructions && (
                                            <div className={styles['payment-request__instruction-box']}>
                                                <Icon name="info" className="text-amber-500 text-[10px] mr-1 inline" />
                                                {instructions}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!isProcessing ? (
                                    <div
                                        onClick={onUpload}
                                        className={styles['payment-request__upload-dropzone']}
                                    >
                                        <div className={styles['payment-request__upload-icon-box']}>
                                            <Icon name="upload_file" />
                                        </div>
                                        <span className={styles['payment-request__upload-text']}>Upload Receipt</span>
                                        <span className={styles['payment-request__upload-subtext']}>
                                            Provide your payment certificate here
                                        </span>
                                    </div>
                                ) : (
                                    <div className={styles['payment-request__uploaded-card']}>
                                        <div className={styles['payment-request__uploaded-icon-box']}>
                                            <Icon name="hourglass_top" className="text-[#1978e5] text-sm" />
                                        </div>
                                        <div>
                                            <p className={styles['payment-request__uploaded-title']}>Receipt Uploaded</p>
                                            <p className={styles['payment-request__uploaded-subtext']}>
                                                Awaiting provider validation
                                            </p>
                                            {uploadDate && (
                                                <p className={styles['payment-request__uploaded-date']}>
                                                    Uploaded {uploadDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isPaid && (
                            <div className="flex flex-col gap-3 h-full justify-center">
                                <div className={styles['payment-request__paid-info']}>
                                    <div className={styles['payment-request__paid-header']}>
                                        <Icon name="verified" className="text-emerald-500 text-xl" />
                                        <h4 className={styles['payment-request__paid-title']}>Payment Verified</h4>
                                    </div>
                                    {paymentDate && (
                                        <div className={styles['payment-request__paid-meta-row']}>
                                            <span className={styles['payment-request__paid-date-label']}>Verified On</span>
                                            <span className={styles['payment-request__paid-date-value']}>{paymentDate}</span>
                                        </div>
                                    )}
                                    <p className={styles['payment-request__paid-description']}>
                                        Your payment has been successfully matched with our records. Thank you!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
