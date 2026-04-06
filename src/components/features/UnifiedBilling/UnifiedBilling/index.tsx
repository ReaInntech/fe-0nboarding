import React from 'react';
import TopNavigation from '../../../shared/molecule/TopNavigation';
import BillingHeader from '../BillingHeader';
import CostMetricCard from '../CostMetricCard';
import PaymentMethodsContainer, { PaymentMethod } from '../PaymentMethodsContainer';
import TransactionHistory, { Transaction } from '../TransactionHistory';
import QuickActions from '../QuickActions';
import styles from './index.module.scss';

export interface UnifiedBillingProps {
    transactions: Transaction[];
    methods: PaymentMethod[];
    userProfile?: any;
}

export default function UnifiedBilling({ transactions, methods, userProfile }: UnifiedBillingProps) {
    return (
        <div className={styles['unified-billing']}>
            <TopNavigation activeTab="Billing" userProfile={userProfile} />

            <div className={styles['unified-billing__layout-outer']}>
                <main className={styles['unified-billing__layout-inner']}>
                    <BillingHeader />

                    {/* Grid Layout for Metrics and Card */}
                    <div className={styles['unified-billing__metrics-grid']}>
                        <CostMetricCard 
                            label="Average Monthly Recurring Cost"
                            value="$428.50"
                            trend={{ value: '2.4%', icon: 'trending_up', variant: 'success' }}
                            progress={68}
                            progressLabel="68% of Budget Used"
                        />
                        <PaymentMethodsContainer methods={methods} />
                    </div>

                    <TransactionHistory transactions={transactions} />
                    <QuickActions />
                </main>
            </div>
        </div>
    );
}
