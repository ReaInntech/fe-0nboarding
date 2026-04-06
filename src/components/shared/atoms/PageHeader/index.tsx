import React from 'react';
import Icon from '../Icon';
import styles from './index.module.scss';

interface PageHeaderProps {
    title: string | React.ReactNode;
    subtitle?: string;
    badge?: { text: string; icon?: string };
    centered?: boolean;
    actions?: React.ReactNode;
    className?: string;
}

export default function PageHeader({
    title,
    subtitle,
    badge,
    centered = false,
    actions,
    className = "",
}: PageHeaderProps) {
    return (
        <div className={`${styles['page-header']} ${centered ? styles['page-header--centered'] : ''} ${className}`}>
            <div className={styles['page-header__content']}>
                {badge && (
                    <div className={`${styles['page-header__badge']} ${centered ? styles['page-header__badge--centered'] : ''}`}>
                        {badge.icon && <Icon name={badge.icon} className={styles['page-header__badge-icon']} />}
                        <span className={styles['page-header__badge-text']}>{badge.text}</span>
                    </div>
                )}

                <h1 className={`${styles['page-header__title']} ${centered ? styles['page-header__title--centered'] : ''}`}>
                    {title}
                </h1>

                {subtitle && (
                    <p className={`${styles['page-header__subtitle']} ${centered ? styles['page-header__subtitle--centered'] : ''}`}>
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className={`${styles['page-header__actions']} ${centered ? styles['page-header__actions--centered'] : ''}`}>
                    {actions}
                </div>
            )}
        </div>
    );
}
