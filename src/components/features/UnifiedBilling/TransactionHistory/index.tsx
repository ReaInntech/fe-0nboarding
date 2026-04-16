import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import { Transaction as SharedTransaction } from '@/src/lib/api/types';
export type Transaction = SharedTransaction;
import styles from './index.module.scss';

export interface TransactionHistoryProps {
    transactions: Transaction[];
    className?: string;
}

export default function TransactionHistory({ transactions, className }: TransactionHistoryProps) {
    return (
        <div className={`${styles['transaction-history']} ${className || ''}`}>
            <div className={styles['transaction-history__header']}>
                <h3 className={styles['transaction-history__title']}>Transaction History</h3>
                <button className={styles['transaction-history__download-all']}>Download All</button>
            </div>
            <div className={styles['transaction-history__table-wrapper']}>
                <table className={styles['transaction-history__table']}>
                    <thead>
                        <tr className={styles['transaction-history__thead-row']}>
                            <th className={styles['transaction-history__th']}>Date</th>
                            <th className={styles['transaction-history__th']}>Description</th>
                            <th className={`${styles['transaction-history__th']} ${styles['transaction-history__th--right']}`}>Amount</th>
                            <th className={`${styles['transaction-history__th']} ${styles['transaction-history__th--center']}`}>Status</th>
                            <th className={`${styles['transaction-history__th']} ${styles['transaction-history__th--center']}`}>Receipt</th>
                        </tr>
                    </thead>
                    <tbody className={styles['transaction-history__tbody']}>
                        {transactions?.map((tx, idx) => (
                            <tr key={idx} className={styles['transaction-history__tr']}>
                                <td className={`${styles['transaction-history__td']} ${styles['transaction-history__td--date']}`}>{tx.date}</td>
                                <td className={`${styles['transaction-history__td']} ${styles['transaction-history__td--description']}`}>{tx.description}</td>
                                <td className={`${styles['transaction-history__td']} ${styles['transaction-history__td--amount']}`}>{tx.amount}</td>
                                <td className={`${styles['transaction-history__td']} ${styles['transaction-history__td--center']}`}>
                                    <Badge variant={tx.status === 'Paid' ? 'success' : 'warning'} className={styles['transaction-history__badge']}>
                                        {tx.status}
                                    </Badge>
                                </td>
                                <td className={`${styles['transaction-history__td']} ${styles['transaction-history__td--center']}`}>
                                    <button className={styles['transaction-history__download-btn']}>
                                        <Icon name="download" className={styles['transaction-history__download-icon']} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles['transaction-history__footer']}>
                <button className={styles['transaction-history__load-more']}>
                    Load More Transactions
                    <Icon name="keyboard_arrow_down" className={styles['transaction-history__load-more-icon']} />
                </button>
            </div>
        </div>
    );
}
