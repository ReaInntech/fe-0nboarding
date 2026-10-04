import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface PaymentEntry {
    date: string;
    description: string;
    amount: string;
    status: 'Paid' | 'Pending' | string;
    receiptUrl?: string;
    invoiceNumber?: string;
}

export interface PaymentHistoryProps {
    title: string;
    showDownloadAll?: boolean;
    payments: PaymentEntry[];
    className?: string;
}

export default function PaymentHistory({
    title,
    showDownloadAll = false,
    payments = [],
    className = ''
}: PaymentHistoryProps) {
    return (
        <div className={`${styles['payment-history']} ${className}`}>
            <div className={styles['payment-history__header']}>
                <h3 className={styles['payment-history__title-box']}>
                    <Icon name="receipt_long" className="text-[#1978e5]" /> {title}
                </h3>
                {showDownloadAll && (
                    <button className={styles['payment-history__download-all']}>
                        Download All
                    </button>
                )}
            </div>
            <div className={styles['payment-history__table-container']}>
                <table className={styles['payment-history__table']}>
                    <thead>
                        <tr>
                            <th className={styles['payment-history__th']}>Date</th>
                            <th className={styles['payment-history__th']}>Description</th>
                            <th className={`${styles['payment-history__th']} ${styles['payment-history__th--right']}`}>Amount</th>
                            <th className={`${styles['payment-history__th']} ${styles['payment-history__th--center']}`}>Status</th>
                            <th className={`${styles['payment-history__th']} ${styles['payment-history__th--center']}`}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {payments?.map((payment, idx) => (
                            <tr key={idx} className={styles['payment-history__tr']}>
                                <td className={`${styles['payment-history__td']} ${styles['payment-history__td--date']}`}>{payment.date}</td>
                                <td className={`${styles['payment-history__td']} ${styles['payment-history__td--desc']}`}>{payment.description}</td>
                                <td className={`${styles['payment-history__td']} ${styles['payment-history__td--amount']}`}>{payment.amount}</td>
                                <td className={`${styles['payment-history__td']} ${styles['payment-history__td--center']}`}>
                                    <Badge
                                        variant={payment.status === 'Paid' ? 'success' : 'warning'}
                                        className={styles['payment-history__status-badge']}
                                    >
                                        {payment.status}
                                    </Badge>
                                </td>
                                <td className={`${styles['payment-history__td']} ${styles['payment-history__td--center']}`}>
                                    {payment.receiptUrl ? (
                                        <a
                                            href={payment.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className={styles['payment-history__download-btn']}
                                            title="Descargar comprobante"
                                        >
                                            <Icon name="download" className="text-[20px]" />
                                        </a>
                                    ) : (
                                        <button className={styles['payment-history__download-btn']} title="Comprobante no disponible" disabled>
                                            <Icon name="download" className="text-[20px] opacity-40" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles['payment-history__footer']}>
                <button className={styles['payment-history__load-more']}>
                    Load More Transactions
                    <Icon name="keyboard_arrow_down" className="text-sm" />
                </button>
            </div>
        </div>
    );
}
