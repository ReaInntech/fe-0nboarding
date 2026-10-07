import React, { useState, useEffect } from "react";
import Icon from "../../../shared/atoms/Icon";
import NotificationItem from "../../../shared/molecule/NotificationItem";
import { Notification } from "@/src/lib/api/types";
import { clearAllNotifications, deleteNotification } from "@/src/lib/api/dashboard";
import { useApp } from "@/src/context/AppContext";
import styles from "./index.module.scss";

export interface NotificationHeroProps {
    notifications?: Notification[];
    className?: string;
}

export default function NotificationHero({ notifications: initialNotifications, className }: NotificationHeroProps) {
    const { user } = useApp();
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);

    useEffect(() => {
        setNotifications(initialNotifications || []);
    }, [initialNotifications]);

    // Synchronize with external events (e.g. from NotificationDrawer / TopNavigation)
    useEffect(() => {
        const handleCleared = () => {
            setNotifications([]);
        };
        const handleDeleted = (e: any) => {
            const deletedId = e.detail?.id;
            if (deletedId) {
                setNotifications(prev => prev.filter(n => n.id !== deletedId));
            }
        };
        window.addEventListener("notifications-cleared", handleCleared);
        window.addEventListener("notification-deleted", handleDeleted);
        return () => {
            window.removeEventListener("notifications-cleared", handleCleared);
            window.removeEventListener("notification-deleted", handleDeleted);
        };
    }, []);

    const handleDelete = async (indexToDelete: number) => {
        const itemToDelete = notifications[indexToDelete];
        setNotifications(prev => prev.filter((_, idx) => idx !== indexToDelete));
        if (itemToDelete?.id) {
            window.dispatchEvent(new CustomEvent("notification-deleted", { detail: { id: itemToDelete.id } }));
            try {
                const token = user?.accessToken;
                const orgId = user?.org_id || user?.organization?.id;
                await deleteNotification(itemToDelete.id, token, orgId);
            } catch (err) {
                console.error("Error deleting notification:", err);
            }
        }
    };

    const handleClearAll = async () => {
        setNotifications([]);
        window.dispatchEvent(new CustomEvent("notifications-cleared"));
        try {
            const token = user?.accessToken;
            const orgId = user?.org_id || user?.organization?.id;
            await clearAllNotifications(token, orgId);
        } catch (err) {
            console.error("Error clearing notifications:", err);
        }
    };

    return (
        <section className={`${styles["notification-hero"]} ${className || ""}`}>
            <div className={styles["notification-hero__container"]}>
                <div className={styles["notification-hero__header"]}>
                    <div className={styles["notification-hero__header-title-wrapper"]}>
                        <Icon name="notifications" className={styles["notification-hero__icon"]} />
                        <h2 className={styles["notification-hero__title"]}>Recent Notifications</h2>
                    </div>
                    {notifications?.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className={styles["notification-hero__clear-btn"]}
                        >
                            Clear All
                        </button>
                    )}
                </div>
                {(!notifications || notifications.length === 0) ? (
                    <div className={styles["notification-hero__empty-state"]}>
                        <div className={styles["notification-hero__empty-icon-wrapper"]}>
                            <Icon name="check_circle" className={styles["notification-hero__empty-icon"]} />
                        </div>
                        <h3 className={styles["notification-hero__empty-title"]}>All caught up!</h3>
                        <p className={styles["notification-hero__empty-text"]}>You have no new notifications. We will let you know when something important happens.</p>
                    </div>
                ) : (
                    <div className={styles["notification-hero__list"]}>
                        {notifications?.map((notif, idx) => (
                            <NotificationItem
                                key={notif.id || idx}
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
