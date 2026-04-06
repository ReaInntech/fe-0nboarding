import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import styles from './index.module.scss';

export interface ServiceField {
    icon: string;
    label: string;
    value: string;
    iconColor?: string;
    valueColor?: string;
}

export interface ServiceDetailsProps {
    title: string;
    titleIcon: string;
    titleIconColor?: string;
    fields: ServiceField[];
    totalAmount?: number;
    paidAmount?: number;
    className?: string;
}

export default function ServiceDetails({
    title,
    titleIcon,
    titleIconColor,
    fields,
    totalAmount,
    paidAmount,
    className = ''
}: ServiceDetailsProps) {
    const progressPercent = totalAmount && totalAmount > 0 
        ? Math.min(Math.round(((paidAmount || 0) / totalAmount) * 100), 100) 
        : 0;

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(amt);
    };

    return (
        <Card className={className}>
            <h3 className={styles['service-details__title']}>
                <Icon 
                    name={titleIcon} 
                    style={titleIconColor ? { color: titleIconColor } : undefined} 
                    className={!titleIconColor ? 'text-[#1978e5]' : ''} 
                /> 
                {title}
            </h3>

            {/* Payment Progress Section */}
            {(totalAmount !== undefined && paidAmount !== undefined) && (
                <div className={styles['service-details__progress-section']}>
                    <div className={styles['service-details__progress-header']}>
                        <div className={styles['service-details__progress-label-box']}>
                            <span className={styles['service-details__progress-label']}>Payment Status</span>
                            <div className={styles['service-details__progress-amount-row']}>
                                <span className={styles['service-details__progress-paid']}>
                                    {formatCurrency(paidAmount)}
                                </span>
                                <span className={styles['service-details__progress-total']}>
                                    / {formatCurrency(totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={styles['service-details__progress-bar-bg']}>
                        <div 
                            className={styles['service-details__progress-bar-fill']} 
                            style={{ 
                                width: `${progressPercent}%`,
                                backgroundColor: titleIconColor || '#1978e5' 
                            }}
                        />
                    </div>
                </div>
            )}

            <div className={styles['service-details__fields-list']}>
                {fields?.map((field, idx) => (
                    <div key={idx} className={styles['service-details__field-item']}>
                        <div className={styles['service-details__field-info']}>
                            <Icon 
                                name={field.icon} 
                                className={field.iconColor ? '' : 'text-slate-400'} 
                                style={field.iconColor ? { color: field.iconColor } : undefined} 
                            />
                            <span className={styles['service-details__field-label']}>{field.label}</span>
                        </div>
                        <span 
                            className={styles['service-details__field-value']} 
                            style={field.valueColor ? { color: field.valueColor } : undefined}
                        >
                            {field.value}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
