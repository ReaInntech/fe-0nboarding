import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import Logo from '../../atoms/Logo';
import Icon from '../../atoms/Icon';
import Avatar from '../../atoms/Avatar';
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
    const profile = user || { photoUrl: "", organization: { client_type: "" as any } };
    const isNaturalPerson = profile.organization?.client_type === 'natural_person';

    const [mode, setMode] = useState('provider');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems: NavItem[] = [
        { name: 'Dashboard', path: '/provider/dashboard' },
        { name: 'Finance', path: '/provider/finance' },
        { name: 'Products', path: '/provider/products' },
        { name: 'Chat', path: '#' },
        { name: 'Settings', path: '/provider/settings' },
    ];

    const activeTab = activeTabProp || navItems.find(item => pathname?.startsWith(item.path))?.name || 'Dashboard';

    const handleLogout = async () => {
        await signOut();
        onLogout?.();
        router.push('/login');
    };

    return (
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
                    {!isNaturalPerson && (
                        <div className={styles['nav__mode-selector']}>
                            <span className={styles['nav__mode-label']}>Mode:</span>
                            <select
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
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

                    <Avatar sizeClasses="size-8" src={profile.photoUrl || ''} />

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

                        {!isNaturalPerson && (
                            <div className={styles['nav__mobile-mode']}>
                                <span className={styles['nav__mobile-mode-label']}>Mode</span>
                                <div className={styles['nav__mobile-mode-wrapper']}>
                                    <select
                                        value={mode}
                                        onChange={(e) => setMode(e.target.value)}
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
    );
}
