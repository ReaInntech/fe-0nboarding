import React from 'react';
import styles from './index.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
    className?: string;
}

export default function Button({ children, variant, className, ...props }: ButtonProps) {
    const variantName = variant || 'primary';

    return (
        <button
            className={`${styles.button} ${styles[`button--${variantName}`] || ''} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}
