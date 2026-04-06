import React from 'react';
import styles from './index.module.scss';

export interface DistributionData {
    label: string;
    value: number;
    color: string;
}

export interface DistributionPieChartProps {
    data: DistributionData[];
    className?: string;
}

export default function DistributionPieChart({ data = [], className }: DistributionPieChartProps) {
    if (!data || data.length === 0) return null;

    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    let currentPercentage = 0;
    const gradientStops = data.map(item => {
        const span = (item.value / total) * 100;
        const stop = `${item.color} ${currentPercentage}%, ${item.color} ${currentPercentage + span}%`;
        currentPercentage += span;
        return stop;
    }).join(', ');

    return (
        <div className={`${styles['distribution-pie-chart']} ${className || ''}`}>
            {/* Donut Visual */}
            <div className={styles['distribution-pie-chart__donut-wrapper']}>
                <div
                    className={styles['distribution-pie-chart__donut-bg']}
                    style={{ background: `conic-gradient(${gradientStops})`, transform: 'rotate(-90deg)' }}
                ></div>
                <div className={styles['distribution-pie-chart__donut-hole']}>
                    <span className={styles['distribution-pie-chart__donut-label']}>Total</span>
                    <span className={styles['distribution-pie-chart__donut-value']}>${total.toLocaleString()}</span>
                </div>
            </div>

            {/* Legend */}
            <div className={styles['distribution-pie-chart__legend']}>
                {data.map((item, idx) => (
                    <div key={idx} className={styles['distribution-pie-chart__legend-item']}>
                        <div className={styles['distribution-pie-chart__legend-left']}>
                            <span className={styles['distribution-pie-chart__legend-dot']} style={{ backgroundColor: item.color }}></span>
                            <span className={styles['distribution-pie-chart__legend-text']}>{item.label}</span>
                        </div>
                        <span className={styles['distribution-pie-chart__legend-val']}>${item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
