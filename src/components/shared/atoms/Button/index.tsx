import React from 'react';
import styles from './index.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function Button({ children, variant, size, className, ...props }: ButtonProps) {
    const variantName = variant || 'primary';
    const sizeName = size || 'md';

    return (
        <button
            className={`${styles.button} ${styles[`button--${variantName}`] || ''} ${styles[`button--${sizeName}`] || ''} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}
