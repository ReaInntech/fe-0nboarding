import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface SupportLinksProps {
    className?: string;
}

export default function SupportLinks({ className }: SupportLinksProps) {
    return (
        <section className={`${styles['support-links']} ${className || ''}`}>
            <div className={styles['support-links__grid']}>
                <div className={`group ${styles['support-links__card']}`}>
                    <Icon name="receipt_long" className={styles['support-links__icon']} />
                    <h4 className={styles['support-links__title']}>View Billing History</h4>
                    <p className={styles['support-links__desc']}>Download invoices and manage payment methods.</p>
                </div>
                <div className={`group ${styles['support-links__card']}`}>
                    <Icon name="support_agent" className={styles['support-links__icon']} />
                    <h4 className={styles['support-links__title']}>Contact Support</h4>
                    <p className={styles['support-links__desc']}>Get help from our team or open a support ticket.</p>
                </div>
            </div>
        </section>
    );
}
