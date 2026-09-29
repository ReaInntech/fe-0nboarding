'use client';

import React from 'react';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at?: string;
  time?: string;
}

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItemData[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const variantIcons: Record<string, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className={styles['notification-drawer']}>
      {/* Backdrop */}
      <div
        className={styles['notification-drawer__backdrop']}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className={styles['notification-drawer__panel']}>
        {/* Header */}
        <div className={styles['notification-drawer__header']}>
          <div className={styles['notification-drawer__title-box']}>
            <Icon name="notifications" className={styles['notification-drawer__icon']} />
            <h2 className={styles['notification-drawer__title']}>Notifications</h2>
            {unreadCount > 0 && (
              <span className={styles['notification-drawer__badge']}>
                {unreadCount} new
              </span>
            )}
          </div>

          <div className={styles['notification-drawer__actions']}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className={styles['notification-drawer__mark-all-btn']}
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={styles['notification-drawer__close-btn']}
              aria-label="Close notifications"
            >
              <Icon name="close" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className={styles['notification-drawer__list']}>
            {notifications.map((item) => {
              const variant = item.variant || 'info';
              const iconName = variantIcons[variant] || 'notifications';

              return (
                <div
                  key={item.id}
                  onClick={() => onMarkRead(item.id)}
                  className={`${styles['notification-drawer__item']} ${
                    !item.is_read ? styles['notification-drawer__item--unread'] : ''
                  }`}
                >
                  {!item.is_read && (
                    <span className={styles['notification-drawer__item-indicator']} />
                  )}

                  <div
                    className={`${styles['notification-drawer__item-icon-box']} ${
                      styles[`notification-drawer__item-icon-box--${variant}`] || ''
                    }`}
                  >
                    <Icon name={iconName} />
                  </div>

                  <div className={styles['notification-drawer__item-content']}>
                    <div className={styles['notification-drawer__item-header']}>
                      <span className={styles['notification-drawer__item-title']}>
                        {item.title}
                      </span>
                      <span className={styles['notification-drawer__item-time']}>
                        {item.time || formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className={styles['notification-drawer__item-message']}>
                      {item.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles['notification-drawer__empty']}>
            <div className={styles['notification-drawer__empty-icon']}>
              <Icon name="notifications_none" />
            </div>
            <p className={styles['notification-drawer__empty-title']}>
              No notifications yet
            </p>
            <p className={styles['notification-drawer__empty-desc']}>
              When you receive updates about your subscriptions, onboarding requests, or tickets, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
