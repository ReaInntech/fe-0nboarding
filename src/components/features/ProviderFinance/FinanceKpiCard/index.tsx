import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface FinanceKpiCardProps {
    icon: string;
    iconBgClass?: string;
    iconTextClass?: string;
    label: string;
    value: number | string;
    prefix?: string;
    suffix?: string;
    badge?: { text: string; icon?: string; variant?: "default" | "warning" | "success" | "primary" };
    hoverBorderClass?: string;
}

export default function FinanceKpiCard({
    icon,
    iconBgClass = '',
    iconTextClass = '',
    label,
    value,
    prefix,
    suffix,
    badge,
    hoverBorderClass = ''
}: FinanceKpiCardProps) {
    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;

    return (
        <Card className={`${hoverBorderClass} transition-colors cursor-default`}>
            <div className={styles['finance-kpi-card__header']}>
                <div className={`${styles['finance-kpi-card__icon']} ${iconBgClass} ${iconTextClass}`}>
                    <Icon name={icon} className={styles['finance-kpi-card__icon-inner']} />
                </div>
                {badge && (
                    <Badge variant={badge.variant || 'success'} className={styles['finance-kpi-card__badge']}>
                        {badge.icon && <Icon name={badge.icon} className={styles['finance-kpi-card__badge-icon']} />}
                        {badge.text}
                    </Badge>
                )}
            </div>
            <p className={styles['finance-kpi-card__label']}>{label}</p>
            <h2 className={styles['finance-kpi-card__value']}>{prefix}{formattedValue}{suffix}</h2>
        </Card>
    );
}
