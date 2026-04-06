import React from 'react';
import styles from './index.module.scss';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'primary' | 'info' | 'error' | 'neutral';
    size?: 'sm' | 'md';
    className?: string;
}

export default function Badge({ children, variant, className, ...props }: BadgeProps) {
    const variantName = variant || 'default';

    return (
        <span
            className={`${styles.badge} ${styles[`badge--${variantName}`] || ''} ${className || ''}`}
            {...props}
        >
            {children}
        </span>
    );
}
