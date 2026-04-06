import React from 'react';
import styles from './index.module.scss';

interface ProgressBarProps {
    value?: number;
    max?: number;
    className?: string;
}

export default function ProgressBar({ value, max, className }: ProgressBarProps) {
    const safeMax = max || 100;
    const percentage = Math.min(Math.max(((value || 0) / safeMax) * 100, 0), 100);
    return (
        <div className={`${styles['progress-bar']} ${className || ''}`}>
            <div
                className={styles['progress-bar__fill']}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
}
