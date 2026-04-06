import React from 'react';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

const iconNames: Record<string, string> = {
    critical: 'error',
    warning: 'warning',
    info: 'info',
};

interface NotificationItemProps {
    title: string;
    message: string;
    time: string;
    variant?: 'info' | 'warning' | 'critical';
    onDelete?: () => void;
}

export default function NotificationItem({ title, message, time, variant, onDelete }: NotificationItemProps) {
    const variantName = variant || 'info';
    const iconName = iconNames[variantName] || 'info';

    return (
        <div className={`${styles.notification} ${styles[`notification--${variantName}`] || ''}`}>
            <button
                onClick={onDelete}
                className={styles['notification__delete-btn']}
                aria-label="Delete notification"
            >
                <Icon name="close" style={{ fontSize: 14 }} />
            </button>
            <div className={`${styles['notification__icon-box']} ${styles[`notification__icon-box--${variantName}`] || ''}`}>
                <Icon name={iconName} style={{ fontSize: 16 }} />
            </div>
            <div className={styles['notification__body']}>
                <div className={styles['notification__header']}>
                    <span className={`${styles['notification__title']} ${styles[`notification__title--${variantName}`] || ''}`}>
                        {title}
                    </span>
                    <span className={styles['notification__time']}>{time}</span>
                </div>
                <p className={styles['notification__message']}>
                    {message}
                </p>
            </div>
        </div>
    );
}
