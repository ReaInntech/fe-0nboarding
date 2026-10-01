'use client';

import { useApp } from '@/src/context/AppContext';
import TopNavigation from '../../../shared/molecule/TopNavigation';
import Footer from '../../../shared/molecule/Footer';
import NotificationHero from '../NotificationHero';
import ServicesList from '../ServicesList';
import SupportLinks from '../SupportLinks';
import { Notification, Subscription } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface DashboardProps {
    notifications?: Notification[];
    subscriptions?: Subscription[];
    userProfile?: any;
    providerSlug?: string;
    supportPhone?: string | null;
    providerName?: string;
    isGeneral?: boolean;
}

export default function Dashboard({
    notifications = [],
    subscriptions = [],
    userProfile,
    providerSlug,
    supportPhone,
    providerName,
    isGeneral,
}: DashboardProps) {
    const { user } = useApp();

    return (
        <div className={styles.dashboard}>
            <TopNavigation activeTab="Services" userProfile={userProfile} />
            <div className={styles['dashboard__content-wrapper']}>
                <main className={styles['dashboard__main']}>
                    {notifications && notifications.length > 0 && (
                        <NotificationHero notifications={notifications} />
                    )}
                    <ServicesList subscriptions={subscriptions} />
                    <SupportLinks 
                        providerSlug={providerSlug}
                        supportPhone={supportPhone}
                        providerName={providerName}
                        isGeneral={isGeneral}
                    />
                </main>
            </div>
            <Footer />
        </div>
    );
}
