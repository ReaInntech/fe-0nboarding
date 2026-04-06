import React from 'react';
import styles from './index.module.scss';

interface LogoProps {
    className?: string;
    showText?: boolean;
    theme?: 'light' | 'dark';
}

export default function Logo({ className, showText, theme }: LogoProps) {
    const themeName = theme || 'light';

    return (
        <div className={`${styles.logo} ${className || ''}`}>
            <div className={styles['logo__icon-container']}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles['logo__svg']}>
                    <circle cx="20" cy="20" r="14" stroke="#1978e5" strokeWidth="4" />
                    <path d="M20 28V12M20 12L15 17M20 12L25 17" stroke="#1978e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            {(showText ?? true) && (
                <span className={`${styles['logo__text']} ${styles[`logo__text--${themeName}`] || ''}`}>
                    nbording
                </span>
            )}
        </div>
    );
}
