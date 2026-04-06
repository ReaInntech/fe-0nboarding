import React from 'react';
import styles from './index.module.scss';

export interface RevenueDataPoint {
    label: string;
    value: number;
}

export interface RevenueAreaChartProps {
    data: RevenueDataPoint[];
    height?: number;
    color?: string;
    className?: string;
}

export default function RevenueAreaChart({ data = [], height = 300, color = '#1978e5', className }: RevenueAreaChartProps) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value));
    const minVal = Math.min(...data.map(d => d.value)) * 0.8;
    const range = maxVal - minVal || 1;

    const width = 1000;
    const stepX = width / (data.length - 1 || 1);

    const points = data.map((d, i) => {
        const x = i * stepX;
        const y = height - (((d.value - minVal) / range) * height);
        return `${x},${y}`;
    });

    const pathD = `M ${points.map(p => p.split(',').join(' ')).join(' L ')}`;
    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    const gradientId = `revenue-gradient-${color.replace('#', '')}`;

    return (
        <div className={`${styles['revenue-area-chart']} ${className || ''}`} style={{ minHeight: height }}>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className={styles['revenue-area-chart__svg']}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.0" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill={`url(#${gradientId})`} />
                <path d={pathD} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {/* X-Axis Labels */}
            <div className={styles['revenue-area-chart__x-axis']}>
                {data.map((d, i) => (
                    (data.length <= 7 || i % Math.ceil(data.length / 6) === 0 || i === data.length - 1) && (
                        <span key={i} className={styles['revenue-area-chart__x-label']} style={{ left: `${(i / (data.length - 1 || 1)) * 100}%` }}>
                            {d.label}
                        </span>
                    )
                ))}
            </div>
        </div>
    );
}
