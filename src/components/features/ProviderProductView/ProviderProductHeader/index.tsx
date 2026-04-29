'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import ProviderProductForm from './ProviderProductForm';
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
    sold?: number;
    onSaveProduct?: (data: any) => Promise<void>;
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
    sold = 0,
    onSaveProduct,
}: ProviderProductHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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
                            <Badge variant={badgeVariant}>{badgeText}</Badge>
                        </div>
                        <div className={styles['provider-header__meta']}>
                            <p className={styles['provider-header__id']}>
                                Product ID: <span>{productId}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <Icon name="payments" className="text-xs" /> 
                                <span>${Number(saved.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                <span className="text-xs opacity-70">/{saved.billing}</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-slate-400 text-sm">
                                <Icon name="shopping_cart" className="text-xs" /> 
                                <span>{sold} ventas</span>
                            </p>
                            <p className="flex items-center gap-1.5 text-emerald-400 font-medium text-sm">
                                <Icon name="account_balance_wallet" className="text-xs" /> 
                                <span>${(sold * Number(saved.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })} recaudo</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles['provider-header__actions']}>
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
        </div>
    );
}
