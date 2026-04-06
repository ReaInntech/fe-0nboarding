import React from 'react';
import styles from './index.module.scss';

export interface BillingHeaderProps {
    className?: string;
}

export default function BillingHeader({ className }: BillingHeaderProps) {
    return (
        <div className={`${styles['billing-header']} ${className || ''}`}>
            <h2 className={styles['billing-header__title']}>
                Billing &amp; Payment Methods
            </h2>
            <p className={styles['billing-header__desc']}>
                Manage your recurring costs, subscriptions, and payment details.
            </p>
        </div>
    );
}
