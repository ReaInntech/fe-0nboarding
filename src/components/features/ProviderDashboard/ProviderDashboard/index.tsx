'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import SubscriptionList from '../SubscriptionList';
import UserSubscriptionList from '../UserSubscriptionList';
import PageHeader from '../../../shared/atoms/PageHeader';
import Button from '../../../shared/atoms/Button';
import Icon from '../../../shared/atoms/Icon';
import CreateClientModal from '../../ProviderClients/CreateClientModal';
import BulkImportModal from '../../ProviderClients/BulkImportModal';
import DeleteSubscriptionModal from '../DeleteSubscriptionModal';
import DisableSubscriptionModal from '../DisableSubscriptionModal';
import { Subscription } from '@/src/lib/api/types';
import { deleteProviderSubscription, updateProviderSubscriptionStatus } from '@/src/lib/api/provider';
import styles from './index.module.scss';

export interface ProviderDashboardProps {
    subscriptions: Subscription[];
    stats: any;
    className?: string;
    userProfile?: any;
    allExpanded?: boolean;
    activeTab?: string;
    targetSubscriptionId?: string;
}

export default function ProviderDashboard({
    subscriptions = [],
    className,
    userProfile,
    allExpanded = false,
    activeTab = "Dashboard",
    targetSubscriptionId
}: ProviderDashboardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const querySubId = searchParams?.get('subscriptionId') || undefined;
    const effectiveTargetSubId = targetSubscriptionId || querySubId;

    const { user } = useApp();
    const token = user?.accessToken;
    const orgId = user?.org_id || user?.organization?.id || 'org-prov-1';

    // Local reactive list of subscriptions
    const [subList, setSubList] = useState<Subscription[]>(subscriptions);
    useEffect(() => {
        setSubList(subscriptions);
    }, [subscriptions]);

    // View tab state: 'subscriptions' vs 'users'
    const [activeView, setActiveView] = useState<'subscriptions' | 'users'>('subscriptions');

    // Deep-linking: auto-switch to subscriptions view and scroll into targeted subscription row
    useEffect(() => {
        if (effectiveTargetSubId) {
            setActiveView('subscriptions');
            const timer = setTimeout(() => {
                const element = document.getElementById(`subscription-row-${effectiveTargetSubId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [effectiveTargetSubId]);

    // Auto-refresh when tab gains focus or every 15s to reflect client actions
    useEffect(() => {
        const handleFocus = () => {
            router.refresh();
        };
        window.addEventListener('focus', handleFocus);
        const interval = setInterval(() => {
            router.refresh();
        }, 15000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, [router]);

    // Unique clients count for tab badge
    const uniqueClientsCount = useMemo(() => {
        const ids = new Set(subList.map(s => s.client?.id || s.client?.legalName).filter(Boolean));
        return ids.size;
    }, [subList]);

    // Client modal states (RF-PV-29 & RF-PV-30)
    const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Subscription delete & disable states
    const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);
    const [subToDisable, setSubToDisable] = useState<Subscription | null>(null);
    const [isDeletingSub, setIsDeletingSub] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 4500);
    };

    const stats = useMemo(() => {
        const activeLimits = subList.filter(s => s.status === 'active').length;
        const pendingSignatures = subList.filter(s => s.documents?.some(d => d.status === 'pending') || s.status === 'in_progress').length;
        const failedPayments = subList.filter(s => s.payments?.some(p => p.status === 'Failed' || p.status === 'Error')).length;
        const monthlyMrr = subList.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.monthlyPrice || 0), 0);
        return { activeLimits, pendingSignatures, failedPayments, monthlyMrr };
    }, [subList]);

    const handleConfirmDelete = async (sub: Subscription) => {
        setIsDeletingSub(true);
        try {
            await deleteProviderSubscription(sub.id, token, orgId);
            setSubList(prev => prev.filter(s => s.id !== sub.id));
            setSubToDelete(null);
            showNotification('success', `Subscription for ${sub.client?.legalName || 'client'} deleted successfully.`);
        } catch (error: any) {
            console.error('[ProviderDashboard] Delete subscription failed:', error);
            showNotification('error', error.message || 'Failed to delete subscription.');
        } finally {
            setIsDeletingSub(false);
        }
    };

    const handleConfirmDisable = async (sub: Subscription, newStatus: 'suspended' | 'active') => {
        setIsUpdatingStatus(true);
        try {
            await updateProviderSubscriptionStatus(sub.id, newStatus, token, orgId);
            setSubList(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
            setSubToDisable(null);
            showNotification(
                'success',
                newStatus === 'suspended'
                    ? `Subscription for ${sub.client?.legalName || 'client'} suspended successfully.`
                    : `Subscription for ${sub.client?.legalName || 'client'} reactivated successfully.`
            );
        } catch (error: any) {
            console.error('[ProviderDashboard] Update status failed:', error);
            showNotification('error', error.message || 'Failed to update subscription status.');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const headerActions = (
        <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
                <div className="flex items-center gap-2 text-slate-100">
                    <Icon name="upload_file" className="text-blue-400" />
                    <span>Bulk CSV Import</span>
                </div>
            </Button>
            <Button variant="primary" onClick={() => setIsSingleModalOpen(true)}>
                <div className="flex items-center gap-2">
                    <Icon name="person_add" />
                    <span>New Client</span>
                </div>
            </Button>
        </div>
    );

    return (
        <div className={`${styles['provider-dashboard']} ${className || ''}`}>
            <ProviderTopNavigation activeTab={activeTab} userProfile={userProfile} />
            <div className={styles['provider-dashboard__content']}>
                <PageHeader
                    title={<>Client <span className="text-[#1978e5]">Subscriptions</span></>}
                    subtitle="Review active subscriptions, client details, payment statuses, and legal documents."
                    badge={{ text: "Provider View", icon: "visibility" }}
                    centered={true}
                    actions={headerActions}
                />

                <div className={styles['provider-dashboard__stats-grid']}>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Total Active Limits</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--default']}`}>{stats.activeLimits}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Pending Signatures</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--warning']}`}>{stats.pendingSignatures}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Failed Payments</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--danger']}`}>{stats.failedPayments}</p>
                    </div>
                    <div className={styles['provider-dashboard__stat-card']}>
                        <p className={styles['provider-dashboard__stat-label']}>Monthly MRR</p>
                        <p className={`${styles['provider-dashboard__stat-value']} ${styles['provider-dashboard__stat-value--success']}`}>${stats.monthlyMrr.toLocaleString()}</p>
                    </div>
                </div>

                {/* Tab Switcher: By Subscriptions vs By User & Client */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-6">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start">
                        <button
                            type="button"
                            onClick={() => setActiveView('subscriptions')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeView === 'subscriptions'
                                    ? 'bg-[#1978e5] text-white shadow-md shadow-[#1978e5]/20 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon name="view_list" className="text-base" />
                            <span>By Subscriptions</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeView === 'subscriptions' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {subList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveView('users')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeView === 'users'
                                    ? 'bg-[#1978e5] text-white shadow-md shadow-[#1978e5]/20 font-semibold'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            }`}
                        >
                            <Icon name="group" className="text-base" />
                            <span>By User & Client</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeView === 'users' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {uniqueClientsCount}
                            </span>
                        </button>
                    </div>

                    <div className="text-xs text-slate-400 self-center sm:self-auto">
                        {activeView === 'users' ? (
                            <span>Grouped by user & organization with expandable subscription history</span>
                        ) : (
                            <span>Listing individual subscriptions and statuses</span>
                        )}
                    </div>
                </div>

                {activeView === 'subscriptions' ? (
                    <SubscriptionList
                        subscriptions={subList}
                        allExpanded={allExpanded}
                        targetSubscriptionId={effectiveTargetSubId}
                        onDelete={(sub) => setSubToDelete(sub)}
                        onDisable={(sub) => setSubToDisable(sub)}
                    />
                ) : (
                    <UserSubscriptionList
                        subscriptions={subList}
                        allExpanded={allExpanded}
                        onDelete={(sub) => setSubToDelete(sub)}
                        onDisable={(sub) => setSubToDisable(sub)}
                    />
                )}
            </div>

            {/* Modals for Client Registration and Bulk CSV Import */}
            <CreateClientModal
                isOpen={isSingleModalOpen}
                onClose={() => setIsSingleModalOpen(false)}
                onSuccess={(client) => {
                    showNotification('success', `Client ${client?.trade_name || client?.legal_name || ''} registered successfully.`);
                }}
                token={token}
                orgId={orgId}
            />

            <BulkImportModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={(result) => {
                    showNotification('success', `Bulk import processed: ${result.summary.successful} created successfully.`);
                }}
                token={token}
                orgId={orgId}
            />

            {/* Delete Subscription Modal */}
            <DeleteSubscriptionModal
                isOpen={!!subToDelete}
                onClose={() => setSubToDelete(null)}
                subscription={subToDelete}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeletingSub}
            />

            {/* Disable/Reactivate Subscription Modal */}
            <DisableSubscriptionModal
                isOpen={!!subToDisable}
                onClose={() => setSubToDisable(null)}
                subscription={subToDisable}
                onConfirm={handleConfirmDisable}
                isUpdating={isUpdatingStatus}
            />

            {/* Feedback Toast */}
            {feedback && (
                <div
                    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-md transition-all ${
                        feedback.type === 'success'
                            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
                            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
                    }`}
                >
                    <Icon name={feedback.type === 'success' ? 'check_circle' : 'error'} />
                    <span>{feedback.message}</span>
                </div>
            )}

            <Footer />
        </div>
    );
}
