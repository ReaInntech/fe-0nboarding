'use client';

import React, { useState, useRef } from 'react';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export interface NotificationItemData {
  id: string;
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'error';
  is_read?: boolean;
  created_at?: string;
  time?: string;
  subscription_id?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItemData[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (item: NotificationItemData) => void;
  onDeleteNotification?: (id: string) => void;
  onClearAll?: () => void;
  isClientView?: boolean;
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

interface SwipeableNotificationItemProps {
  item: NotificationItemData;
  onItemClick: (item: NotificationItemData) => void;
  onDelete?: (id: string) => void;
}

function SwipeableNotificationItem({
  item,
  onItemClick,
  onDelete,
}: SwipeableNotificationItemProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startXRef = useRef<number | null>(null);

  const THRESHOLD = 75; // px to trigger delete

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if (diff > 0) {
      setDragX(Math.min(diff, 180));
    }
  };

  const handleTouchEnd = () => {
    if (dragX >= THRESHOLD && onDelete) {
      triggerDelete();
    } else {
      setDragX(0);
    }
    startXRef.current = null;
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startXRef.current === null || !isDragging) return;
    const diff = e.clientX - startXRef.current;
    if (diff > 0) {
      setDragX(Math.min(diff, 180));
    }
  };

  const handleMouseUp = () => {
    if (dragX >= THRESHOLD && onDelete) {
      triggerDelete();
    } else {
      setDragX(0);
    }
    startXRef.current = null;
    setIsDragging(false);
  };

  const triggerDelete = () => {
    setIsDeleting(true);
    setDragX(350);
    setTimeout(() => {
      onDelete?.(item.id);
    }, 220);
  };

  const handleClick = () => {
    if (dragX > 8) return;
    onItemClick(item);
  };

  const variant = item.variant || 'info';
  const iconName = variantIcons[variant] || 'notifications';

  return (
    <div
      className={styles['notification-drawer__swipe-wrapper']}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDragging) {
          if (dragX >= THRESHOLD && onDelete) {
            triggerDelete();
          } else {
            setDragX(0);
          }
          startXRef.current = null;
          setIsDragging(false);
        }
      }}
    >


      {/* Draggable Card Ticket */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translateX(${dragX}px)`,
          opacity: isDeleting ? 0 : isDragging ? Math.max(0.15, 1 - (dragX / 140) * 0.85) : 1,
        }}
        className={`${styles['notification-drawer__item']} ${
          isDragging ? styles['notification-drawer__item--swiping'] : ''
        } ${isDeleting ? styles['notification-drawer__item--deleting'] : ''}`}
      >


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
    </div>
  );
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
  onDeleteNotification,
  onClearAll,
  isClientView = false,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const handleItemClick = (item: NotificationItemData) => {
    onNotificationClick?.(item);
  };

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
            {notifications.length > 0 && (
              <span className={styles['notification-drawer__badge']}>
                {notifications.length}
              </span>
            )}
          </div>

          <div className={styles['notification-drawer__actions']}>
            {isClientView && onClearAll && notifications.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className={styles['notification-drawer__clear-btn']}
                title="Permanently remove all notifications"
              >
                Clear all
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
            {notifications.map((item) => (
              <SwipeableNotificationItem
                key={item.id}
                item={item}
                onItemClick={handleItemClick}
                onDelete={onDeleteNotification}
              />
            ))}
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

