'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import ProviderProductForm from './ProviderProductForm';
import CreateSubscriptionModal from '../../../shared/molecule/CreateSubscriptionModal';
import { humanizeBillingModel, formatBillingPeriod } from '@/src/lib/utils/product';
import styles from './index.module.scss';

export interface ProviderProductHeaderProps {
    icon: string;
    iconColor: string;
    title: string;
    description?: string;
    price?: number | string;
    billing?: string;
    status?: string;
    badgeText: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'primary' | 'info' | 'error' | 'neutral';
    productId: string;
    productUuid?: string;
    sold?: number;
    onSaveProduct?: (data: any) => Promise<void>;
    productMetadata?: Record<string, any>;
}

export default function ProviderProductHeader({
    icon,
    iconColor,
    title,
    description = '',
    price = '',
    billing = 'monthly',
    status = 'inactive',
    badgeText,
    badgeVariant = 'info',
    productId,
    productUuid,
    sold = 0,
    onSaveProduct,
    productMetadata = {},
}: ProviderProductHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saved, setSaved] = useState({
        name: title,
        icon: icon,
        color: iconColor,
        price: price,
        billing: billing,
        status: status,
        description: description,
    });

    useEffect(() => {
        if (!isEditing) {
            setSaved({
                name: title,
                icon: icon,
                color: iconColor,
                price: price,
                billing: billing,
                status: status,
                description: description,
            });
        }
    }, [title, icon, iconColor, price, billing, status, description]);

    const handleSave = async (newData: any) => {
        setIsSaving(true);
        try {
            if (onSaveProduct) {
                await onSaveProduct(newData);
            }
            setSaved({ ...newData });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save product details', error);
            // Optionally, we could show a toast or error state here
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = saved.status === 'active' ? 'inactive' : 'active';
        setIsSaving(true);
        try {
            if (onSaveProduct) {
                await onSaveProduct({
                    name: saved.name,
                    icon: saved.icon,
                    color: saved.color,
                    price: saved.price,
                    billing: saved.billing,
                    description: saved.description,
                    status: newStatus
                });
            }
            setSaved(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            console.error('Failed to toggle status', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className={styles['provider-header']}>
            <section className={styles['provider-header__row']}>
                <div className={styles['provider-header__info']}>
                    <div
                        className={styles['provider-header__icon-box']}
                        style={{ backgroundColor: `${saved.color}1A`, color: saved.color }}
                    >
                        <Icon name={saved.icon} className="text-5xl" />
                    </div>
                    <div className={styles['provider-header__details']}>
                        <div className={styles['provider-header__title-box']}>
                            <h1 className={styles['provider-header__title']}>{saved.name}</h1>
                        </div>
                        <div className={styles['provider-header__meta']}>
                            <p className={styles['provider-header__id']}>
                                Product ID: <span>{productId}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <Icon name="payments" className="text-xs" />
                                <span>${Number(saved.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                {formatBillingPeriod(saved.billing) ? (
                                    <span className="text-xs opacity-70">{formatBillingPeriod(saved.billing)}</span>
                                ) : null}
                                <span className="text-xs opacity-70 font-medium">({humanizeBillingModel(saved.billing)})</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <Icon name="shopping_cart" className="text-xs" />
                                <span>{sold} {sold === 1 ? 'sale' : 'sales'}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-emerald-400 font-medium text-sm">
                                <Icon name="account_balance_wallet" className="text-xs" />
                                <span>${(sold * Number(saved.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })} revenue</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles['provider-header__actions']}>
                    <div className="flex items-center gap-3 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <span className={`text-xs font-bold uppercase tracking-wider ${saved.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {saved.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={handleToggleStatus}
                            disabled={isSaving}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${saved.status === 'active' ? 'bg-emerald-500' : 'bg-slate-600'
                                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="sr-only">Use setting</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${saved.status === 'active' ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsEditing(v => !v)}
                        className={`${styles['provider-header__edit-btn']} ${isEditing
                            ? styles['provider-header__edit-btn--active']
                            : styles['provider-header__edit-btn--idle']
                            }`}
                    >
                        <Icon name={isEditing ? 'expand_less' : 'edit'} className="text-sm" />
                        {isEditing ? 'Close Editor' : 'Edit Product'}
                    </button>
                </div>
            </section>
            <section className="flex items-center gap-3 mt-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={saved.status === 'inactive'}
                    className={`${styles['provider-header__edit-btn']} ${saved.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : styles['provider-header__edit-btn--idle']}`}
                >
                    <Icon name="person" className="text-sm" />
                    Add Clients
                </button>
                <button
                    disabled
                    className={`${styles['provider-header__edit-btn']} opacity-50 cursor-not-allowed ${styles['provider-header__edit-btn--idle']}`}
                >
                    <Icon name="group" className="text-sm" />
                    Massive Add Clients
                </button>
            </section>
            {isEditing && (
                <div className={styles['provider-header__panel']}>
                    <div className={styles['provider-header__panel-header']}>
                        <Icon name="edit" className="text-[#1978e5] text-sm" />
                        <span>Edit Product</span>
                    </div>

                    <ProviderProductForm
                        initialData={{
                            ...saved,
                            price: saved.price || '',
                            billing: saved.billing,
                            status: saved.status || 'inactive',
                            description: saved.description || '',
                        }}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSubmitting={isSaving}
                    />
                </div>
            )}

            <CreateSubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productPrice={Number(saved.price || 0)}
                productId={productUuid || productId}
                productBillingPeriod={saved.billing}
                productMetadata={productMetadata}
                onSuccess={() => {
                    // Could refetch subscriptions or show success toast
                    console.log('Subscription created successfully');
                }}
            />
        </div>
    );
}
