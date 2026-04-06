import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import styles from './index.module.scss';

export interface FinanceTransaction {
    id: string;
    date: string;
    client: string;
    product: string;
    amount: number;
    status: string;
    method: string;
}

export interface TransactionTableProps {
    transactions?: FinanceTransaction[];
    productsFilterList?: string[];
    clientsFilterList?: string[];
    paymentMethodsList?: string[];
    className?: string;
}

export default function TransactionTable({
    transactions = [],
    productsFilterList = ['All Products'],
    clientsFilterList = ['All Clients'],
    paymentMethodsList = ['All Methods'],
    className
}: TransactionTableProps) {
    const [selectedProduct, setSelectedProduct] = useState(productsFilterList[0] || 'All Products');
    const [selectedClient, setSelectedClient] = useState(clientsFilterList[0] || 'All Clients');
    const [selectedMethod, setSelectedMethod] = useState(paymentMethodsList[0] || 'All Methods');

    const filteredTransactions = transactions.filter(t => {
        if (selectedProduct !== 'All Products' && selectedProduct !== productsFilterList[0] && t.product !== selectedProduct) return false;
        if (selectedClient !== 'All Clients' && selectedClient !== clientsFilterList[0] && t.client !== selectedClient) return false;
        if (selectedMethod !== 'All Methods' && selectedMethod !== paymentMethodsList[0] && t.method !== selectedMethod) return false;
        return true;
    });

    return (
        <Card className={`${styles['transaction-table']} ${className || ''}`}>
            {/* Header & Filters */}
            <div className={styles['transaction-table__header']}>
                <div className={styles['transaction-table__header-left']}>
                    <h3 className={styles['transaction-table__title']}>Transaction History</h3>
                    <span className={styles['transaction-table__count']}>{filteredTransactions.length} records</span>
                </div>

                <div className={styles['transaction-table__header-right']}>
                    <div className={styles['transaction-table__filters']}>
                        {/* Product Filter */}
                        <div className={styles['transaction-table__filter-wrapper']}>
                            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className={styles['transaction-table__select']}>
                                {productsFilterList.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <Icon name="filter_list" className={styles['transaction-table__select-icon']} />
                        </div>

                        {/* Client Filter */}
                        <div className={styles['transaction-table__filter-wrapper']}>
                            <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className={styles['transaction-table__select']}>
                                {clientsFilterList.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <Icon name="group" className={styles['transaction-table__select-icon']} />
                        </div>

                        {/* Method Filter */}
                        <div className={styles['transaction-table__filter-wrapper']}>
                            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className={styles['transaction-table__select']}>
                                {paymentMethodsList.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <Icon name="credit_card" className={styles['transaction-table__select-icon']} />
                        </div>
                    </div>

                    {/* Export Button */}
                    <button className={styles['transaction-table__export-btn']}>
                        Export
                        <Icon name="download" className={styles['transaction-table__export-icon']} />
                    </button>
                </div>
            </div>

            {/* Table Body */}
            <div className={styles['transaction-table__table-wrapper']}>
                {filteredTransactions.length > 0 ? (
                    <table className={styles['transaction-table__table']}>
                        <thead className={styles['transaction-table__thead']}>
                            <tr>
                                <th className={styles['transaction-table__th']}>Transaction ID</th>
                                <th className={styles['transaction-table__th']}>Date</th>
                                <th className={styles['transaction-table__th']}>Client</th>
                                <th className={styles['transaction-table__th']}>Product</th>
                                <th className={styles['transaction-table__th']}>Method</th>
                                <th className={styles['transaction-table__th']}>Status</th>
                                <th className={`${styles['transaction-table__th']} ${styles['transaction-table__th--right']}`}>Amount</th>
                            </tr>
                        </thead>
                        <tbody className={styles['transaction-table__tbody']}>
                            {filteredTransactions.map((trx, idx) => {
                                const statusClass = trx.status === 'Completed' ? styles['transaction-table__status-badge--completed'] : 
                                                    trx.status === 'Pending' ? styles['transaction-table__status-badge--pending'] : 
                                                    styles['transaction-table__status-badge--failed'];
                                const dotClass = trx.status === 'Completed' ? styles['transaction-table__status-dot--completed'] : 
                                                 trx.status === 'Pending' ? styles['transaction-table__status-dot--pending'] : 
                                                 styles['transaction-table__status-dot--failed'];
                                
                                return (
                                <tr key={idx} className={styles['transaction-table__tr']}>
                                    <td className={`${styles['transaction-table__td']} ${styles['transaction-table__td--id']}`}>{trx.id}</td>
                                    <td className={`${styles['transaction-table__td']} ${styles['transaction-table__td--date']}`}>{trx.date}</td>
                                    <td className={`${styles['transaction-table__td']} ${styles['transaction-table__td--client']}`}>{trx.client}</td>
                                    <td className={`${styles['transaction-table__td']} ${styles['transaction-table__td--product']}`}>{trx.product}</td>
                                    <td className={styles['transaction-table__td']}>
                                        <span className={styles['transaction-table__method-badge']}>
                                            <Icon name={trx.method.includes('Bank') || trx.method.includes('Wire') ? 'account_balance' : 'credit_card'} className={styles['transaction-table__method-icon']} />
                                            {trx.method}
                                        </span>
                                    </td>
                                    <td className={styles['transaction-table__td']}>
                                        <span className={`${styles['transaction-table__status-badge']} ${statusClass}`}>
                                            <span className={`${styles['transaction-table__status-dot']} ${dotClass}`}></span>
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className={`${styles['transaction-table__td']} ${styles['transaction-table__td--amount']}`}>
                                        ${trx.amount.toLocaleString()}
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles['transaction-table__empty-state']}>
                        <div className={styles['transaction-table__empty-icon-wrapper']}>
                            <Icon name="search_off" className={styles['transaction-table__empty-icon']} />
                        </div>
                        <h4 className={styles['transaction-table__empty-title']}>No transactions found</h4>
                        <p className={styles['transaction-table__empty-desc']}>There are no records matching your current filter criteria:
                            <span className={styles['transaction-table__empty-desc-bold']}>{selectedProduct}</span>, <span className={styles['transaction-table__empty-desc-bold']}>{selectedClient}</span> &amp; <span className={styles['transaction-table__empty-desc-bold']}>{selectedMethod}</span>.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
