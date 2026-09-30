import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import { Subscription, ClientUser } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface ClientGroupData {
    clientId: string;
    legalName: string;
    tradeName?: string;
    taxId?: string;
    country?: string;
    clientType: 'natural_person' | 'legal_entity';
    email: string;
    phone: string;
    users: ClientUser[];
    subscriptions: Subscription[];
}

export interface UserAccordionRowProps {
    clientGroup: ClientGroupData;
    initialExpanded?: boolean;
    onDelete?: (sub: Subscription) => void;
    onDisable?: (sub: Subscription) => void;
    className?: string;
}

export default function UserAccordionRow({
    clientGroup,
    initialExpanded = false,
    onDelete,
    onDisable,
    className
}: UserAccordionRowProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    const isNatural = clientGroup.clientType === 'natural_person';
    const activeSubsCount = clientGroup.subscriptions.filter(s => s.status === 'active' || s.status === 'in_progress').length;
    const totalMrr = clientGroup.subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.monthlyPrice || 0), 0);

    // Get initials for avatar
    const getInitials = (name: string) => {
        if (!name) return 'CL';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const displayName = isNatural
        ? clientGroup.legalName
        : (clientGroup.tradeName || clientGroup.legalName);

    const primaryUser = clientGroup.users[0];

    return (
        <div className={`${styles['user-row']} ${isExpanded ? styles['user-row--expanded'] : ''} ${className || ''}`}>
            {/* Header / Interactive Row */}
            <div
                className={styles['user-row__header']}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Identity & Main Info */}
                <div className={styles['user-row__identity']}>
                    <div className={`${styles['user-row__avatar']} ${styles[`user-row__avatar--${isNatural ? 'natural' : 'legal'}`]}`}>
                        {getInitials(displayName)}
                    </div>

                    <div className={styles['user-row__main-info']}>
                        <div className={styles['user-row__name-line']}>
                            <h4 className={styles['user-row__name']}>{displayName}</h4>

                            <span className={`${styles['user-row__badge-type']} ${styles[`user-row__badge-type--${isNatural ? 'natural' : 'legal'}`]}`}>
                                <Icon name={isNatural ? 'person' : 'domain'} className="text-xs" />
                                <span>{isNatural ? 'Natural Person' : 'Legal Entity'}</span>
                            </span>

                            {clientGroup.country && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                                    {clientGroup.country}
                                </span>
                            )}
                        </div>

                        <div className={styles['user-row__meta-line']}>
                            {!isNatural && clientGroup.tradeName && clientGroup.tradeName !== clientGroup.legalName && (
                                <span className={styles['user-row__meta-item']}>
                                    <span className="text-slate-500">Legal:</span> {clientGroup.legalName}
                                </span>
                            )}
                            {clientGroup.taxId && (
                                <span className={styles['user-row__meta-item']}>
                                    <Icon name="badge" className="text-xs text-slate-500" />
                                    <span>{clientGroup.taxId}</span>
                                </span>
                            )}
                            <span className={styles['user-row__meta-item']}>
                                <Icon name="mail" className="text-xs text-slate-500" />
                                <span>{clientGroup.email}</span>
                            </span>
                            {clientGroup.phone && (
                                <span className={styles['user-row__meta-item']}>
                                    <Icon name="phone" className="text-xs text-slate-500" />
                                    <span>{clientGroup.phone}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscriptions Stats & Expand */}
                <div className={styles['user-row__stats-wrapper']}>
                    {/* Linked Users Count Badge */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-md border border-slate-800">
                        <Icon name="group" className="text-sm text-slate-400" />
                        <span>{clientGroup.users.length} {clientGroup.users.length === 1 ? 'user' : 'users'}</span>
                    </div>

                    {/* Subscription Count Pill */}
                    <div className={styles['user-row__sub-counter']}>
                        <span className="font-semibold text-slate-200">{clientGroup.subscriptions.length}</span>
                        <span className="text-slate-400">{clientGroup.subscriptions.length === 1 ? 'subscription' : 'subscriptions'}</span>
                        {activeSubsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-1">
                                <span className="size-1.5 rounded-full bg-emerald-400"></span>
                                {activeSubsCount} active
                            </span>
                        )}
                    </div>

                    {/* Total MRR */}
                    <div className={styles['user-row__revenue']}>
                        <span className={styles['user-row__revenue-amount']}>${totalMrr.toLocaleString()}</span>
                        <span className={styles['user-row__revenue-label']}>Total Active MRR</span>
                    </div>

                    {/* Expand/Collapse Chevron Button */}
                    <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse client subscriptions' : 'Expand client subscriptions'}
                        className={styles['user-row__expand-btn']}
                    >
                        <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Accordion Body */}
            {isExpanded && (
                <div className={styles['user-row__body']}>
                    {/* Top Section: Client Details & Linked Users */}
                    <div className="space-y-3">
                        <h5 className={styles['user-row__section-title']}>
                            <Icon name="assignment_ind" className="text-sm text-indigo-400" />
                            <span>Client Profile & Linked Users</span>
                        </h5>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* Legal Identity Card */}
                            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {isNatural ? 'Individual Information' : 'Organization Details'}
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Client ID</span>
                                    <span className="font-mono text-slate-300">{clientGroup.clientId}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Tax ID / NIT / Doc</span>
                                    <span className="font-medium text-slate-200">{clientGroup.taxId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-slate-400">Registered Email</span>
                                    <span className="text-slate-200 truncate max-w-[180px]">{clientGroup.email}</span>
                                </div>
                            </div>

                            {/* Linked Users Grid */}
                            <div className="lg:col-span-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                        Associated Auth Users ({clientGroup.users.length})
                                    </span>
                                    {isNatural && (
                                        <span className="text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                            1:1 Strict Link (Natural Person)
                                        </span>
                                    )}
                                </div>

                                <div className={styles['user-row__users-list']}>
                                    {clientGroup.users.map((usr, uIdx) => (
                                        <div key={usr.id || uIdx} className={styles['user-row__user-card']}>
                                            <div className="size-8 rounded-full bg-slate-700/80 flex items-center justify-center font-bold text-xs text-slate-200 shrink-0">
                                                {getInitials(usr.fullName)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-slate-200 truncate text-xs">{usr.fullName}</span>
                                                    {usr.roleName && (
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${
                                                            usr.roleName.toLowerCase() === 'admin'
                                                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                                        }`}>
                                                            {usr.roleName.toLowerCase() === 'member'
                                                                ? 'Operator'
                                                                : usr.roleName.charAt(0).toUpperCase() + usr.roleName.slice(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate">{usr.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Subscriptions History & Products */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <h5 className={styles['user-row__section-title']}>
                                <Icon name="receipt_long" className="text-sm text-cyan-400" />
                                <span>Subscriptions & Active Contracts ({clientGroup.subscriptions.length})</span>
                            </h5>
                        </div>

                        {clientGroup.subscriptions.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/30 border border-slate-800/60 rounded-xl">
                                No subscriptions found for this client.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {clientGroup.subscriptions.map((sub) => {
                                    let statusMod = 'default';
                                    if (sub.status === 'active') statusMod = 'active';
                                    else if (sub.status === 'in_progress') statusMod = 'in_progress';
                                    else if (sub.status === 'suspended') statusMod = 'suspended';
                                    else if (sub.status === 'cancelled') statusMod = 'cancelled';

                                    const signedDocsCount = sub.documents?.filter(d => d.status === 'signed').length || 0;
                                    const totalDocs = sub.documents?.length || 0;

                                    return (
                                        <div key={sub.id} className={styles['user-row__sub-card']}>
                                            <div className={styles['user-row__sub-header']}>
                                                {/* Product Info */}
                                                <div className={styles['user-row__product-info']}>
                                                    <div className={styles['user-row__product-icon']}>
                                                        <Icon
                                                            name={sub.product?.icon || 'category'}
                                                            style={{ color: sub.product?.iconColor || '#38bdf8' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h6 className="font-semibold text-slate-200 text-sm">{sub.product?.name || 'Subscription Product'}</h6>
                                                            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                                                {sub.tierName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                                            <span>Sub ID: <span className="font-mono text-slate-400">{sub.id}</span></span>
                                                            {sub.provisionedAt && (
                                                                <span>Provisioned: {new Date(sub.provisionedAt).toLocaleDateString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status, Pricing & Actions */}
                                                <div className="flex items-center gap-5 justify-between md:justify-end">
                                                    <span className={`${styles['user-row__status-badge']} ${styles[`user-row__status-badge--${statusMod}`]}`}>
                                                        {(sub.status || 'pending').replace('_', ' ').toUpperCase()}
                                                    </span>

                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-slate-100">${(sub.monthlyPrice || 0).toLocaleString()}</span>
                                                        <span className="text-[11px] text-slate-500 block">{sub.pricePeriod || '/ month'}</span>
                                                    </div>

                                                    {/* Action Buttons: Delete / Disable */}
                                                    <div className={styles['user-row__actions']}>
                                                        {sub.can_delete !== false ? (
                                                            <button
                                                                type="button"
                                                                title="Delete subscription"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onDelete?.(sub);
                                                                }}
                                                                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                            >
                                                                <Icon name="delete_outline" className="text-lg" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled
                                                                title="Cannot delete because approved payments exist. You can disable it instead."
                                                                className="size-8 rounded-lg flex items-center justify-center text-slate-600 cursor-not-allowed opacity-40"
                                                            >
                                                                <Icon name="delete" className="text-lg" />
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            title={sub.status === 'suspended' ? 'Reactivate subscription' : 'Disable / Suspend subscription'}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDisable?.(sub);
                                                            }}
                                                            className={`size-8 rounded-lg flex items-center justify-center transition-colors ${
                                                                sub.status === 'suspended'
                                                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                                                    : 'text-amber-400 hover:bg-amber-500/10'
                                                            }`}
                                                        >
                                                            <Icon name={sub.status === 'suspended' ? 'play_circle' : 'pause_circle'} className="text-lg" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub Card Secondary Meta: Payments & Documents pill */}
                                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                                                {totalDocs > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon name="description" className="text-xs text-slate-500" />
                                                        <span>Documents: <span className={signedDocsCount === totalDocs ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>{signedDocsCount}/{totalDocs} Signed</span></span>
                                                    </div>
                                                )}

                                                {sub.payments && sub.payments.length > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon name="paid" className="text-xs text-slate-500" />
                                                        <span>Recent Payment: <span className="text-slate-300 font-medium">${sub.payments[0].amount.toLocaleString()}</span> ({sub.payments[0].status})</span>
                                                    </div>
                                                )}

                                                {((sub as any).onboardingSteps || sub.steps) && ((sub as any).onboardingSteps || sub.steps).length > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon name="linear_scale" className="text-xs text-slate-500" />
                                                        <span>Onboarding: <span className="text-slate-300">{(((sub as any).onboardingSteps || sub.steps) as any[]).filter(s => s.status === 'completed').length}/{(((sub as any).onboardingSteps || sub.steps) as any[]).length} Steps</span></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
