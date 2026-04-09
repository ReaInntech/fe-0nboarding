'use client';

import { useApp } from '@/src/context/AppContext';
import TopNavigation from '../../../shared/molecule/TopNavigation';
import Footer from '../../../shared/molecule/Footer';
import ProductHeader, { ProductHeaderProps } from '../../UnifiedProductView/ProductHeader';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import TicketList, { TicketListProps } from '../TicketList/index';
import styles from './index.module.scss';

export interface SupportStats {
    open: number;
    inProgress: number;
    resolved: number;
    avgResponse: string;
}

export interface SupportCenterProps {
    headerProps: ProductHeaderProps;
    stats: SupportStats;
    ticketListProps: TicketListProps;
    className?: string;
}

export default function SupportCenter({
    headerProps,
    stats,
    ticketListProps,
    className
}: SupportCenterProps) {
    const { user } = useApp();

    const statItems = [
        { icon: 'error_outline', label: 'Open', value: stats.open, color: 'text-red-500', bg: 'bg-red-500/10' },
        { icon: 'sync', label: 'In Progress', value: stats.inProgress, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { icon: 'check_circle', label: 'Resolved', value: stats.resolved, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { icon: 'speed', label: 'Avg. Response', value: stats.avgResponse, color: 'text-[#1978e5]', bg: 'bg-[#1978e5]/10' },
    ];

    return (
        <div className={`${styles['support-center']} ${className || ''}`}>
            <TopNavigation activeTab="Support" />
            <main className={styles['support-center__main']}>
                <ProductHeader {...headerProps} />

                {/* Quick Stats */}
                <div className={styles['support-center__stats-grid']}>
                    {statItems.map((stat, idx) => (
                        <Card key={idx}>
                            <div className="flex items-center gap-4">
                                <div className={`${styles['support-center__stat-icon-wrapper']} ${stat.bg}`}>
                                    <Icon name={stat.icon} className={`${styles['support-center__stat-icon']} ${stat.color}`} />
                                </div>
                                <div>
                                    <p className={styles['support-center__stat-value']}>{stat.value}</p>
                                    <p className={styles['support-center__stat-label']}>{stat.label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Ticket List */}
                <TicketList {...ticketListProps} />
            </main>
            <Footer />
        </div>
    );
}
