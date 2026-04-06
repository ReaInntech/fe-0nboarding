import React, { useMemo } from 'react';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import SubscriptionList from '../SubscriptionList';
import PageHeader from '../../../shared/atoms/PageHeader';
import { SubscriptionData } from '../SubscriptionRow';
import styles from './index.module.scss';

export interface ProviderDashboardProps {
    subscriptions?: SubscriptionData[];
    userProfile?: any;
    className?: string;
}

export default function ProviderDashboard({ subscriptions = [], userProfile, className }: ProviderDashboardProps) {

    const stats = useMemo(() => {
        const activeLimits = subscriptions.filter(s => s.status === 'active').length;
        const pendingSignatures = subscriptions.filter(s => s.documents?.some(d => d.status === 'pending')).length;
        const failedPayments = subscriptions.filter(s => s.payments?.some(p => p.status === 'Failed' || p.status === 'Error')).length;
        const monthlyMrr = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.monthlyPrice, 0);
        return { activeLimits, pendingSignatures, failedPayments, monthlyMrr };
    }, [subscriptions]);

    return (
        <div className={`${styles['provider-dashboard']} ${className || ''}`}>
            <ProviderTopNavigation activeTab="Dashboard" userProfile={userProfile} />

            <div className={styles['provider-dashboard__content']}>
                <PageHeader
                    title={<>Client <span className="text-[#1978e5]">Subscriptions</span></>}
                    subtitle="Review active subscriptions, client details, payment statuses, and legal documents."
                    badge={{ text: "Provider View", icon: "visibility" }}
                    centered={true}
                />

                <div className={styles['provider-dashboard__stats-grid']}>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Total Active Limits</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--default']}`}>{stats.activeLimits}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Pending Signatures</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--warning']}`}>{stats.pendingSignatures}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Failed Payments</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--danger']}`}>{stats.failedPayments}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Monthly MRR</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--success']}`}>${stats.monthlyMrr.toLocaleString()}</p>
                    </div>
                </div>

                <SubscriptionList subscriptions={subscriptions} />
            </div>
        </div>
    );
}
