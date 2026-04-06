import React, { useState, useMemo } from 'react';
import SubscriptionRow, { SubscriptionData } from '../SubscriptionRow';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface SubscriptionListProps {
    subscriptions: SubscriptionData[];
    className?: string;
}

export default function SubscriptionList({ subscriptions = [], className }: SubscriptionListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [productFilter, setProductFilter] = useState('All');

    const uniqueProducts = useMemo(() => {
        const products = new Set(subscriptions.map(sub => sub.product.name));
        return ['All', ...Array.from(products)];
    }, [subscriptions]);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => {
            const matchesSearch =
                sub.client.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.client.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesProduct = productFilter === 'All' || sub.product.name === productFilter;

            return matchesSearch && matchesProduct;
        });
    }, [subscriptions, searchQuery, productFilter]);

    return (
        <div className={`${styles['subscription-list']} ${className || ''}`}>
            <div className={styles['subscription-list__filters']}>
                <div className={styles['subscription-list__search-wrapper']}>
                    <div className={styles['subscription-list__search-icon-container']}>
                        <Icon name="search" className={styles['subscription-list__search-icon']} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by client name, email or subscription ID..."
                        className={styles['subscription-list__search-input']}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles['subscription-list__select-wrapper']}>
                    <div className={styles['subscription-list__select-icon-left']}>
                        <Icon name="filter_list" className={styles['subscription-list__search-icon']} />
                    </div>
                    <select
                        className={styles['subscription-list__select-input']}
                        value={productFilter}
                        onChange={(e) => setProductFilter(e.target.value)}
                    >
                        {uniqueProducts.map(prod => (
                            <option key={prod} value={prod}>{prod === 'All' ? 'All Products' : prod}</option>
                        ))}
                    </select>
                    <div className={styles['subscription-list__select-icon-right']}>
                        <Icon name="expand_more" className={styles['subscription-list__search-icon']} />
                    </div>
                </div>
            </div>

            <div className={styles['subscription-list__list-container']}>
                {filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map(sub => (
                        <SubscriptionRow key={sub.id} sub={sub} />
                    ))
                ) : (
                    <div className={styles['subscription-list__empty-state']}>
                        <Icon name="inbox" className={styles['subscription-list__empty-icon']} />
                        <h3 className={styles['subscription-list__empty-title']}>No subscriptions found</h3>
                        <p className={styles['subscription-list__empty-text']}>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>

            <div className={styles['subscription-list__footer-text']}>
                Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
            </div>
        </div>
    );
}
