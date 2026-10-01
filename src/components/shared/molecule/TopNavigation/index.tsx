'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import Logo from '../../atoms/Logo';
import Icon from '../../atoms/Icon';
import Avatar from '../../atoms/Avatar';
import NotificationDrawer, { NotificationItemData } from '../NotificationDrawer';
import OtpModal from '../OtpModal';
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
  EffectiveProvider
} from '@/src/lib/api/dashboard';
import { PublicProviderBranding } from '@/src/lib/api/provider';
import { useProviderBranding } from '@/src/context/BrandContext';
import styles from './index.module.scss';

interface NavItem {
    name: string;
    path: string;
}

interface TopNavigationProps {
    isProvider?: boolean;
    onLogout?: () => void;
    activeTab?: string;
    userProfile?: any;
    providerBranding?: PublicProviderBranding | null;
    providerSlug?: string;
    availableProviders?: EffectiveProvider[];
}

export default function TopNavigation({
    isProvider,
    onLogout,
    activeTab: activeTabProp,
    userProfile,
    providerBranding: propBranding,
    providerSlug: propSlug,
    availableProviders: propAvailableProviders,
}: TopNavigationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user: contextUser, signOut } = useApp();
    const brandContext = useProviderBranding();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const branding = propBranding !== undefined ? propBranding : brandContext.branding;
    const effectiveSlug = propSlug !== undefined ? propSlug : brandContext.providerSlug;
    const availableProviders = propAvailableProviders || brandContext.availableProviders || [];

    const user = userProfile || contextUser;
    const profile = user || { avatar_url: "", organization: { client_type: "" as any } };
    const isNaturalPerson = profile.organization?.client_type === 'natural_person';

    const [mode, setMode] = useState(isProvider ? 'provider' : 'client');

    // Notifications state
    const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItemData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // 2FA OTP Modal state (RF-TR-03)
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

    const basePath = effectiveSlug ? `/${effectiveSlug}` : '';
    const navItems: NavItem[] = [
        { name: 'Services', path: `${basePath}/dashboard` },
        { name: 'Billing', path: `${basePath}/billing` },
        { name: 'Support', path: `${basePath}/support` },
    ];

    const activeTab = activeTabProp || (pathname?.includes('/subscriptions') ? 'Services' : navItems.find(item => pathname?.endsWith(item.name.toLowerCase()) || pathname?.includes(`/${item.name.toLowerCase()}`))?.name) || 'Services';

    // Fetch notifications
    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        const fetchNotifs = async () => {
            try {
                const token = user.accessToken;
                const orgId = user.org_id || user.organization?.id;
                const count = await getUnreadNotificationsCount(token, orgId);
                if (isMounted) setUnreadCount(count);

                const data = await getNotifications(token, orgId);
                if (isMounted && data) {
                    const mapped: NotificationItemData[] = data.map((n: any) => ({
                        id: n.id,
                        title: n.title,
                        message: n.message,
                        variant: n.variant || 'info',
                        is_read: n.is_read ?? n.read ?? false,
                        time: n.time || n.created_at,
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

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id, user?.accessToken, user?.org_id || user?.organization?.id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead(user?.accessToken, user?.org_id || user?.organization?.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const handleLogout = async () => {
        await signOut();
        onLogout?.();
        router.push('/login');
    };

    const handleModeChange = (newMode: string) => {
        if (newMode === 'provider') {
            const isVerified = typeof window !== 'undefined' && sessionStorage.getItem('provider_2fa_session') === 'verified';
            if (!isVerified) {
                setIsOtpModalOpen(true);
                return;
            }
            setMode('provider');
            router.push('/provider/dashboard');
        } else {
            setMode('client');
            router.push(effectiveSlug ? `/${effectiveSlug}/dashboard` : '/dashboard');
        }
    };

    const handleOtpSuccess = () => {
        setIsOtpModalOpen(false);
        setMode('provider');
        router.push('/provider/dashboard');
    };

    return (
        <>
            <header className={styles.nav}>
                <div className={styles['nav__container']}>
                    <div className={styles['nav__logo-wrapper']}>
                        <a href={basePath ? `${basePath}/dashboard` : '/'} className={styles['nav__logo-link']}>
                            {branding?.logo_url ? (
                                <img
                                    src={branding.logo_url}
                                    alt={branding.name || 'Provider Logo'}
                                    className="h-8 max-h-8 w-auto max-w-[150px] object-contain"
                                />
                            ) : branding?.name ? (
                                <div className="flex items-center gap-2">
                                    {branding.isotype_url ? (
                                        <img
                                            src={branding.isotype_url}
                                            alt={branding.name}
                                            className="h-7 w-7 object-contain"
                                        />
                                    ) : (
                                        <div
                                            className="h-7 w-7 rounded-md flex items-center justify-center font-bold text-white text-xs shadow-sm"
                                            style={{ backgroundColor: branding.brand_primary_color || '#1978e5' }}
                                        >
                                            {branding.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span
                                        className="font-bold text-sm tracking-tight"
                                        style={{ color: 'var(--banner-text)' }}
                                    >
                                        {branding.name}
                                    </span>
                                </div>
                            ) : (
                                <Logo theme={brandContext.styles.themeType === 'light' || brandContext.styles.themeType === 'primary_dark_text' ? 'light' : 'dark'} />
                            )}
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
                        {availableProviders.length > 1 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200 text-xs font-medium text-slate-700">
                                <span className="text-slate-400 text-[11px] hidden sm:inline">Provider:</span>
                                <select
                                    value={effectiveSlug || 'all'}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'all') {
                                            router.push('/dashboard');
                                        } else {
                                            router.push(`/${val}/dashboard`);
                                        }
                                    }}
                                    className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-1"
                                >
                                    <option value="all">0nbording (General)</option>
                                    {availableProviders.map((p) => (
                                        <option key={p.slug} value={p.slug}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {!isNaturalPerson && (
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
                            {unreadCount > 0 && (
                                <span className={styles['nav__bell-badge']}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <Avatar sizeClasses="size-8" src={profile.avatar_url || profile.firebasePhotoUrl || ''} />

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

                            {availableProviders.length > 1 && (
                                <div className={styles['nav__mobile-mode']}>
                                    <span className={styles['nav__mobile-mode-label']}>Provider</span>
                                    <div className={styles['nav__mobile-mode-wrapper']}>
                                        <select
                                            value={effectiveSlug || 'all'}
                                            onChange={(e) => {
                                                setIsMobileMenuOpen(false);
                                                const val = e.target.value;
                                                if (val === 'all') {
                                                    router.push('/dashboard');
                                                } else {
                                                    router.push(`/${val}/dashboard`);
                                                }
                                            }}
                                            className={styles['nav__mode-select']}
                                        >
                                            <option value="all">0nbording (General)</option>
                                            {availableProviders.map((p) => (
                                                <option key={p.slug} value={p.slug}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className={styles['nav__mode-icon']}>
                                            <Icon name="expand_more" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isNaturalPerson && (
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
                unreadCount={unreadCount}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
            />

            {/* 2FA OTP Modal for Provider Mode (RF-TR-03) */}
            <OtpModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                onSuccess={handleOtpSuccess}
            />
        </>
    );
}
