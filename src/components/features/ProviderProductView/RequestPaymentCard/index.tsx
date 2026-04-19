'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface PaymentItem {
    id: number;
    description: string;
    price: number;
}

export interface RequestPaymentConfig {
    bank: string;
    accountNumber: string;
    nit: string;
    dueDate: string;
    amount: number;
    isItemized: boolean;
    items: PaymentItem[];
    useProductValue: boolean;
    instructions: string;
    certificateFile: any | null;
}

export interface RequestPaymentCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: RequestPaymentConfig;
    onDelete?: () => void;
    onSave?: (config: RequestPaymentConfig) => Promise<void>;
}

export default function RequestPaymentCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave
}: RequestPaymentCardProps) {
    const [config, setConfig] = useState<RequestPaymentConfig>(initialConfig || {
        bank: '',
        accountNumber: '',
        nit: '',
        dueDate: '',
        amount: 0,
        isItemized: false,
        items: [],
        useProductValue: false,
        instructions: description || '',
        certificateFile: null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (field: keyof RequestPaymentConfig, value: any) => {
        setConfig(prev => {
            const newConfig = { ...prev, [field]: value };
            if (field === 'isItemized' && value === true) newConfig.useProductValue = false;
            if (field === 'useProductValue' && value === true) newConfig.isItemized = false;
            return newConfig;
        });
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(config);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save payment request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const addItem = () => {
        const newItems = [...config.items, { id: Date.now(), description: '', price: 0 }];
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total, isItemized: true, useProductValue: false };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const updateItem = (id: number, field: keyof PaymentItem, value: any) => {
        const newItems = config.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const removeItem = (id: number) => {
        const newItems = config.items.filter(item => item.id !== id);
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    return (
        <div className={styles['payment-card']}>
            {/* Header */}
            <div className={styles['payment-card__header']}>
                <div className={styles['payment-card__title-box']}>
                    <div className={styles['payment-card__icon-wrapper']}>
                        <Icon name="payments" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['payment-card__title']}>{title}</span>
                </div>
                <div className={styles['payment-card__actions']}>
                    {showSuccess && (
                        <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                            <Icon name="check_circle" className="mr-1.5 text-xs" /> Saved
                        </div>
                    )}

                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`${isSaving ? 'opacity-50 cursor-not-allowed' : ''} ${showSuccess ? 'hidden' : ''}`}
                    >
                        {isSaving ? (
                            <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" style={{ fontSize: 14 }} className="text-violet-400" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onDelete}
                        className={styles['delete-btn']}
                    >
                        <Icon name="delete" style={{ fontSize: 14 }} />
                    </button>
                </div>
            </div>

            <div className={styles['payment-card__body']}>
                {/* Bank Certificate Upload */}
                <div className={styles['payment-card__upload-zone']}>
                    <div className={styles['payment-card__upload-zone-icon']}>
                        <Icon name="upload_file" style={{ fontSize: 16 }} />
                    </div>
                    <p className={styles['payment-card__upload-zone-text']}>Upload Bank Certificate</p>
                    <p className={styles['payment-card__upload-zone-subtext']}>Required for payment verification</p>
                </div>

                {/* Instructions */}
                <div className={styles['payment-card__field-group']}>
                    <label className={styles['payment-card__label']}>Instructions</label>
                    <textarea
                        value={config.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Specific directions for this payment..."
                        rows={2}
                        className={styles['payment-card__textarea']}
                    />
                </div>

                {/* Account Details */}
                <div className={styles['payment-card__field-group--row']}>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Bank Name</label>
                        <input
                            type="text"
                            value={config.bank}
                            onChange={(e) => handleChange('bank', e.target.value)}
                            placeholder="e.g. Bank of America"
                            className={styles['payment-card__input']}
                        />
                    </div>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Account Number</label>
                        <input
                            type="text"
                            value={config.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            placeholder="0000-0000"
                            className={styles['payment-card__input']}
                        />
                    </div>
                </div>

                <div className={styles['payment-card__field-group--row']}>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Tax ID (NIT)</label>
                        <input
                            type="text"
                            value={config.nit}
                            onChange={(e) => handleChange('nit', e.target.value)}
                            placeholder="000.000.000-0"
                            className={styles['payment-card__input']}
                        />
                    </div>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Due Date</label>
                        <input
                            type="date"
                            value={config.dueDate}
                            onChange={(e) => handleChange('dueDate', e.target.value)}
                            className={styles['payment-card__input']}
                        />
                    </div>
                </div>

                {/* Options Switches */}
                <div className={styles['payment-card__options-row']}>
                    <label className={styles['payment-card__option-label']}>
                        <input
                            type="checkbox"
                            checked={config.isItemized}
                            onChange={(e) => handleChange('isItemized', e.target.checked)}
                            className="hidden"
                        />
                        <div className={`${styles['payment-card__checkbox-custom']} ${config.isItemized ? styles['payment-card__checkbox-custom--checked'] : styles['payment-card__checkbox-custom--idle']}`}>
                            {config.isItemized && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                        </div>
                        <span className={`${styles['payment-card__option-text']} ${config.isItemized ? styles['payment-card__option-text--active'] : styles['payment-card__option-text--idle']}`}>
                            Itemized Details
                        </span>
                    </label>

                    <label className={styles['payment-card__option-label']}>
                        <input
                            type="checkbox"
                            checked={config.useProductValue}
                            onChange={(e) => handleChange('useProductValue', e.target.checked)}
                            className="hidden"
                        />
                        <div className={`${styles['payment-card__checkbox-custom']} ${config.useProductValue ? styles['payment-card__checkbox-custom--checked'] : styles['payment-card__checkbox-custom--idle']}`}>
                            {config.useProductValue && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                        </div>
                        <span className={`${styles['payment-card__option-text']} ${config.useProductValue ? styles['payment-card__option-text--active'] : styles['payment-card__option-text--idle']}`}>
                            Sync with Product
                        </span>
                    </label>
                </div>

                {/* Amount */}
                <div className={styles['payment-card__field-group']}>
                    <div className={styles['payment-card__amount-header']}>
                        <label className={styles['payment-card__label']}>Total Amount</label>
                        {config.useProductValue && (
                            <div className={styles['payment-card__sync-badge']}>
                                <Icon name="sync" style={{ fontSize: 10 }} className="animate-spin" />
                                <span>Synced</span>
                            </div>
                        )}
                    </div>
                    <div className={styles['payment-card__input-wrapper']}>
                        <span className="prefix">$</span>
                        <input
                            type="number"
                            readOnly={config.isItemized || config.useProductValue}
                            value={config.amount}
                            onChange={(e) => handleChange('amount', Number(e.target.value))}
                            className={`${styles['payment-card__input']} ${styles['payment-card__input--with-prefix']} ${
                                (config.isItemized || config.useProductValue) ? styles['payment-card__input--readonly'] : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Itemized Detail Area */}
                {config.isItemized && (
                    <div className={styles['payment-card__itemized-area']}>
                        <div className={styles['payment-card__itemized-header']}>
                            <span>Breakdown</span>
                            <button
                                type="button"
                                onClick={addItem}
                                className={styles['payment-card__add-item-btn']}
                            >
                                <Icon name="add_circle" style={{ fontSize: 12 }} /> Add Item
                            </button>
                        </div>

                        <div className={styles['payment-card__items-list']}>
                            {config.items.map(item => (
                                <div key={item.id} className={styles['payment-card__item-row']}>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        placeholder="Item detail..."
                                        className={styles['payment-card__item-desc']}
                                    />
                                    <div className={styles['payment-card__item-price-wrapper']}>
                                        <span className="prefix">$</span>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                                            className={styles['payment-card__item-price']}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className={styles['payment-card__item-remove']}
                                    >
                                        <Icon name="remove_circle_outline" style={{ fontSize: 14 }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
