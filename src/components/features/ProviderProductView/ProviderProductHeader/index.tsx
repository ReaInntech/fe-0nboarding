'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import ProviderProductForm from './ProviderProductForm';
import styles from './index.module.scss';

export interface ProviderProductHeaderProps {
    icon: string;
    iconColor: string;
    title: string;
    badgeText: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'primary' | 'info' | 'error' | 'neutral';
    productId: string;
    clientName: string;
    clientId: string;
}

export default function ProviderProductHeader({
    icon,
    iconColor,
    title,
    badgeText,
    badgeVariant = 'info',
    productId,
    clientName,
    clientId,
}: ProviderProductHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState({
        name: title,
        icon: icon,
        color: iconColor,
        price: '',
        billing: 'monthly',
        status: 'inactive',
        description: '',
    });

    const handleSave = (newData: any) => {
        setSaved({ ...newData });
        setIsEditing(false);
        // In a real scenario, we might call an API here to update the product
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
                            <p className={styles['provider-header__client']}>
                                <Icon name="domain" className="text-xs" /> {clientName} 
                                <span>({clientId})</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className={styles['provider-header__actions']}>
                    <button
                        onClick={() => setIsEditing(v => !v)}
                        className={`${styles['provider-header__edit-btn']} ${
                            isEditing 
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
                            billing: saved.billing || 'monthly',
                            status: saved.status || 'inactive',
                            description: saved.description || '',
                        }}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </div>
    );
}
