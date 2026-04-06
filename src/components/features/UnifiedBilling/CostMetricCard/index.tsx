import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import ProgressBar from '../../../shared/atoms/ProgressBar';
import styles from './index.module.scss';

export interface TrendData {
    value: string;
    icon: string;
    variant: 'success' | 'danger' | string;
}

export interface CostMetricCardProps {
    label: string;
    value: string | number;
    trend?: TrendData;
    progress?: number;
    progressLabel?: string;
    className?: string;
}

export default function CostMetricCard({
    label = 'Average Monthly Recurring Cost',
    value = '$428.50',
    trend = { value: '2.4%', icon: 'trending_up', variant: 'success' },
    progress = 68,
    progressLabel = '68% of Budget Used',
    className
}: CostMetricCardProps) {
    return (
        <div className={`${styles['cost-metric-card']} ${className || ''}`}>
            <div className={styles['cost-metric-card__top-content']}>
                <p className={styles['cost-metric-card__label']}>{label}</p>
                <div className={styles['cost-metric-card__value-container']}>
                    <span className={styles['cost-metric-card__value']}>{value}</span>
                    {trend && (
                        <span className={`${styles['cost-metric-card__trend']} ${styles[`cost-metric-card__trend--${trend.variant}`]}`}>
                            <Icon name={trend.icon} className={styles['cost-metric-card__trend-icon']} /> {trend.value}
                        </span>
                    )}
                </div>
            </div>
            <div className={styles['cost-metric-card__bottom-content']}>
                {progress !== undefined && <ProgressBar value={progress} />}
                {progressLabel && <p className={styles['cost-metric-card__progress-label']}>{progressLabel}</p>}
            </div>
            <div className={styles['cost-metric-card__bg-glow']}></div>
        </div>
    );
}
