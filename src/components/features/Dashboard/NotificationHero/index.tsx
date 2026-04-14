import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import NotificationItem from '../../../shared/molecule/NotificationItem';
import { Notification } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface NotificationHeroProps {
    notifications?: Notification[];
    className?: string;
}

export default function NotificationHero({ notifications: initialNotifications, className }: NotificationHeroProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);

    useEffect(() => {
        setNotifications(initialNotifications || []);
    }, [initialNotifications]);

    const handleDelete = (indexToDelete: number) => {
        setNotifications(prev => prev.filter((_, idx) => idx !== indexToDelete));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    return (
        <section className={`${styles['notification-hero']} ${className || ''}`}>
            <div className={styles['notification-hero__container']}>
                <div className={styles['notification-hero__header']}>
                    <div className={styles['notification-hero__header-title-wrapper']}>
                        <Icon name="notifications" className={styles['notification-hero__icon']} />
                        <h2 className={styles['notification-hero__title']}>Recent Notifications</h2>
                    </div>
                    {notifications?.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className={styles['notification-hero__clear-btn']}
                        >
                            Clear All
                        </button>
                    )}
                </div>
                {(!notifications || notifications.length === 0) ? (
                    <div className={styles['notification-hero__empty-state']}>
                        <div className={styles['notification-hero__empty-icon-wrapper']}>
                            <Icon name="check_circle" className={styles['notification-hero__empty-icon']} />
                        </div>
                        <h3 className={styles['notification-hero__empty-title']}>All caught up!</h3>
                        <p className={styles['notification-hero__empty-text']}>You have no new notifications. We'll let you know when something important happens.</p>
                    </div>
                ) : (
                    <div className={styles['notification-hero__list']}>
                        {notifications?.map((notif, idx) => (
                            <NotificationItem
                                key={idx}
                                title={notif.title}
                                time={notif.time}
                                message={notif.message}
                                variant={notif.variant as any}
                                onDelete={() => handleDelete(idx)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
