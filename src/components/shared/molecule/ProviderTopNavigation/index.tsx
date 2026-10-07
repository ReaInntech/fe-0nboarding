'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import Logo from '../../atoms/Logo';
import Icon from '../../atoms/Icon';
import Avatar from '../../atoms/Avatar';
import NotificationDrawer, { NotificationItemData } from '../NotificationDrawer';
import {
  getNotifications,
  deleteNotification,
} from '@/src/lib/api/dashboard';
import { canSwitchBetweenRoles } from '@/src/lib/utils/email';
import { getUserAvatarUrl } from '@/src/lib/utils/avatar';
import styles from './index.module.scss';

interface NavItem {
    name: string;
    path: string;
}

interface ProviderTopNavigationProps {
    onLogout?: () => void;
    activeTab?: string;
    userProfile?: any;
}

export default function ProviderTopNavigation({ onLogout, activeTab: activeTabProp, userProfile }: ProviderTopNavigationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user: contextUser, signOut } = useApp();
    
    const user = userProfile || contextUser;
    const profile = user || { avatar_url: "", organization: { client_type: "" as any } };
    const isNaturalPerson = profile.organization?.client_type === 'natural_person';
    const showModeSwitcher = canSwitchBetweenRoles(user?.email);

    const [mode, setMode] = useState('provider');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Notification State
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItemData[]>([]);


    const navItems: NavItem[] = [
        { name: 'Dashboard', path: '/provider/dashboard' },
        { name: 'Products', path: '/provider/products' },
        { name: 'Finance', path: '/provider/finance' },
        { name: 'Settings', path: '/provider/settings' },
    ];

    const activeTab = activeTabProp || navItems.find(item => pathname?.startsWith(item.path))?.name || 'Dashboard';

    // Fetch Notifications
    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        const fetchNotifs = async () => {
            try {
                const token = user.accessToken;
                const orgId = user.org_id || user.organization?.id;
                const data = await getNotifications(token, orgId);
                if (isMounted && data) {
                    const mapped: NotificationItemData[] = data.map((n: any) => ({
                        id: n.id,
                        title: n.title,
                        message: n.message,
                        variant: n.variant || 'info',
                        is_read: n.is_read ?? n.read ?? false,
                        time: n.time || n.created_at,
                        subscription_id: n.subscription_id || n.subscriptionId || n.metadata?.subscription_id,
                        action_url: n.action_url || n.actionUrl,
                        metadata: n.metadata,
                    }));
                    setNotifications(mapped);
                }
            } catch (err) {
                console.warn('Could not load notifications:', err);
            }
        };
        fetchNotifs();
        return () => { isMounted = false; };
    }, [user?.accessToken, user?.org_id, user?.organization?.id]);



    const handleNotificationClick = (item: NotificationItemData) => {
        setIsNotificationDrawerOpen(false);
        if (item.subscription_id) {
            router.push(`/provider/dashboard?subscriptionId=${item.subscription_id}`);
        } else if (item.action_url) {
            router.push(item.action_url);
        } else {
            router.push('/provider/dashboard');
        }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            const token = user?.accessToken;
            const orgId = user?.org_id || user?.organization?.id;
            setNotifications(prev => prev.filter(n => n.id !== id));
            await deleteNotification(id, token, orgId);
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onLogout?.();
        router.push('/login');
    };

    const handleModeChange = (newMode: string) => {
        setMode(newMode);
        if (newMode === 'client') {
            router.push('/dashboard');
        } else {
            router.push('/provider/dashboard');
        }
    };

    return (
        <>
            <header className={styles.nav}>
                <div className={styles['nav__container']}>
                    <div className={styles['nav__logo-wrapper']}>
                        <a href="/provider/dashboard" className={styles['nav__logo-link']}>
                            <Logo theme="dark" />
                        </a>
                    </div>

                    <nav className={styles['nav__desktop-nav']}>
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                className={`${styles['nav__nav-link']} ${activeTab === item.name ? styles['nav__nav-link--active'] : ''}`}
                                href={item.path}
                            >
                                {item.name}
                            </a>
                        ))}
                    </nav>

                    <div className={styles['nav__controls']}>
                        {showModeSwitcher && (
                            <div className={styles['nav__mode-selector']}>
                                <span className={styles['nav__mode-label']}>Mode:</span>
                                <select
                                    value={mode}
                                    onChange={(e) => handleModeChange(e.target.value)}
                                    className={styles['nav__mode-select']}
                                >
                                    <option value="client">Client</option>
                                    <option value="provider">Provider</option>
                                </select>
                                <div className={styles['nav__mode-icon']}>
                                    <Icon name="expand_more" />
                                </div>
                            </div>
                        )}

                        {/* Notification Bell */}
                        <button
                            type="button"
                            className={styles['nav__bell-btn']}
                            onClick={() => setIsNotificationDrawerOpen(true)}
                            title="Notifications"
                            aria-label="View notifications"
                        >
                            <Icon name="notifications" />
                            {notifications.length > 0 && (
                                <span className={styles['nav__bell-badge']}>
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            )}
                        </button>

                        <Avatar
                            sizeClasses="size-8"
                            src={getUserAvatarUrl(profile)}
                            alt={profile.full_name || profile.name || profile.email || 'Provider User'}
                        />

                        <button onClick={handleLogout} className={styles['nav__logout-btn']} title="Logout">
                            <Icon name="logout" className={styles['nav__logout-icon']} />
                        </button>

                        <button
                            className={styles['nav__mobile-toggle']}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <Icon name={isMobileMenuOpen ? "close" : "menu"} className={styles['nav__mobile-toggle-icon']} />
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className={styles['nav__mobile-menu']}>
                        <nav className={styles['nav__mobile-nav']}>
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    className={`${styles['nav__mobile-link']} ${activeTab === item.name ? styles['nav__mobile-link--active'] : ''}`}
                                    href={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </a>
                            ))}

                            {showModeSwitcher && (
                                <div className={styles['nav__mobile-mode']}>
                                    <span className={styles['nav__mobile-mode-label']}>Mode</span>
                                    <div className={styles['nav__mobile-mode-wrapper']}>
                                        <select
                                            value={mode}
                                            onChange={(e) => handleModeChange(e.target.value)}
                                            className={styles['nav__mode-select']}
                                        >
                                            <option value="client">Client</option>
                                            <option value="provider">Provider</option>
                                        </select>
                                        <div className={styles['nav__mode-icon']}>
                                            <Icon name="expand_more" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={handleLogout} className={styles['nav__mobile-logout']}>
                                <Icon name="logout" className={styles['nav__mobile-logout-icon']} />
                                <span className={styles['nav__mobile-logout-text']}>Logout</span>
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Transversal Notification Drawer */}
            <NotificationDrawer
                isOpen={isNotificationDrawerOpen}
                onClose={() => setIsNotificationDrawerOpen(false)}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onDeleteNotification={handleDeleteNotification}
            />
        </>
    );
}
