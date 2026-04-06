import React from 'react';
import styles from './index.module.scss';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function Card({ children, className, noPadding }: CardProps) {
    return (
        <div
            className={`${styles.card} ${noPadding ? styles['card--no-padding'] : ''} ${className || ''}`}
        >
            {children}
        </div>
    );
}
