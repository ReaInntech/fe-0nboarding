'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import FinanceKpiCard from '../FinanceKpiCard';
import RevenueAreaChart, { RevenueDataPoint } from '../RevenueAreaChart';
import DistributionPieChart, { DistributionData } from '../DistributionPieChart';
import TransactionTable, { FinanceTransaction } from '../TransactionTable';
import Card from '../../../shared/atoms/Card';
import PageHeader from '../../../shared/atoms/PageHeader';
import styles from './index.module.scss';

export interface FinanceKpis {
    totalRevenue: number;
    pendingPayout: number;
    activeClients: number;
    successRate: number;
    growth?: number;
}

export interface ProviderFinanceProps {
    kpis: FinanceKpis;
    revenueData: RevenueDataPoint[];
    distributionData: DistributionData[];
    transactions: FinanceTransaction[];
    productsFilterList: string[];
    clientsFilterList: string[];
    paymentMethodsList: string[];
    className?: string;
    userProfile?: any;
}

export default function ProviderFinance({
    kpis,
    revenueData,
    distributionData,
    transactions,
    productsFilterList,
    clientsFilterList,
    paymentMethodsList,
    className,
    userProfile
}: ProviderFinanceProps) {
    const { user } = useApp();

    // Data Presence Checks
    const hasKpiData = kpis.totalRevenue > 0 || kpis.pendingPayout > 0 || kpis.activeClients > 0;
    const hasRevenueData = revenueData && revenueData.length > 0;
    const hasDistributionData = distributionData && distributionData.length > 0;
    const hasAnyChartData = hasRevenueData || hasDistributionData;
    const onlyOneChart = (hasRevenueData ? 1 : 0) + (hasDistributionData ? 1 : 0) === 1;

    return (
        <div className={`${styles['provider-finance']} ${className || ''}`}>
            <ProviderTopNavigation activeTab="Finance" userProfile={userProfile} />
            {/* Main Content */}
            <main className={styles['provider-finance__main']}>
                <PageHeader
                    title={<>Finance <span className="text-[#1978e5]">Overview</span></>}
                    subtitle="Track your revenue, pending payouts, and recent payment history."
                    badge={{ text: "Financial Insights", icon: "analytics" }}
                    centered={true}
                />

                {/* KPI Cards */}
                {hasKpiData && (
                    <div className={styles['provider-finance__kpis-grid']}>
                        <FinanceKpiCard
                            icon="account_balance_wallet"
                            iconBgClass="bg-[#1978e5]/10"
                            iconTextClass="text-[#1978e5]"
                            label="Total Revenue (YTD)"
                            value={kpis.totalRevenue}
                            prefix="$"
                            badge={kpis.growth ? { text: `+${kpis.growth}%`, icon: 'trending_up', variant: 'success' } : undefined}
                            hoverBorderClass="hover:border-[#1978e5]/50"
                        />
                        <FinanceKpiCard
                            icon="pending_actions"
                            iconBgClass="bg-amber-500/10"
                            iconTextClass="text-amber-500"
                            label="Pending Payouts"
                            value={kpis.pendingPayout}
                            prefix="$"
                            hoverBorderClass="hover:border-amber-500/50"
                        />
                        <FinanceKpiCard
                            icon="groups"
                            iconBgClass="bg-emerald-500/10"
                            iconTextClass="text-emerald-500"
                            label="Active Clients"
                            value={kpis.activeClients}
                            hoverBorderClass="hover:border-emerald-500/50"
                        />
                        <FinanceKpiCard
                            icon="check_circle"
                            iconBgClass="bg-purple-500/10"
                            iconTextClass="text-purple-500"
                            label="Success Rate"
                            value={kpis.successRate}
                            suffix="%"
                            hoverBorderClass="hover:border-purple-500/50"
                        />
                    </div>
                )}

                {/* Charts Area */}
                {hasAnyChartData && (
                    <div className={styles['provider-finance__charts-grid']}>
                        {/* Revenue Over Time */}
                        {hasRevenueData && (
                            <Card className={`${styles['provider-finance__chart-card']} ${onlyOneChart ? 'lg:col-span-2' : ''}`}>
                                <div className={`${styles['provider-finance__chart-header']} ${styles['provider-finance__chart-header--mb8']}`}>
                                    <h3 className={styles['provider-finance__chart-title']}>Revenue Over Time</h3>
                                    <div className={styles['provider-finance__chart-badge']}>Last 12 Months</div>
                                </div>
                                <div className={`${styles['provider-finance__chart-body']} ${styles['provider-finance__chart-body--min-height']}`}>
                                    <RevenueAreaChart data={revenueData} height={280} color="#1978e5" />
                                </div>
                            </Card>
                        )}

                        {/* Distribution by Product */}
                        {hasDistributionData && (
                            <Card className={`${styles['provider-finance__chart-card']} ${onlyOneChart ? 'lg:col-span-2' : ''}`}>
                                <div className={`${styles['provider-finance__chart-header']} ${styles['provider-finance__chart-header--mb6']}`}>
                                    <h3 className={styles['provider-finance__chart-title']}>Distribution by Product</h3>
                                </div>
                                <div className={`${styles['provider-finance__chart-body']} ${styles['provider-finance__chart-body--center']}`}>
                                    <DistributionPieChart data={distributionData} />
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Transactions Table */}
                <TransactionTable
                    transactions={transactions}
                    productsFilterList={productsFilterList}
                    clientsFilterList={clientsFilterList}
                    paymentMethodsList={paymentMethodsList}
                />
            </main>
            <Footer />
        </div>
    );
}
