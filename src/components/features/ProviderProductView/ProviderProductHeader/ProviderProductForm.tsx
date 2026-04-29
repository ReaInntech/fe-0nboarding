'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

const ICONS = [
    'cloud_done', 'cloud', 'hub', 'storage', 'api', 'developer_board',
    'security', 'analytics', 'settings', 'rocket_launch', 'database',
    'shield', 'bolt', 'code', 'dns', 'wifi',
];

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active', icon: 'check_circle', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { value: 'maintenance', label: 'Maintenance', icon: 'build', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { value: 'inactive', label: 'Inactive', icon: 'cancel', color: 'text-slate-400', bg: 'bg-slate-700/30 border-slate-600/30' },
];

const BILLING_OPTIONS = [
    { value: 'monthly', label: 'Monthly', icon: 'calendar_month' },
    { value: 'annual', label: 'Annual', icon: 'event_available' },
    { value: 'one_time', label: 'One-time Payment', icon: 'payments' },
    { value: 'usage', label: 'By Usage', icon: 'show_chart' },
];

const COLORS = [
    { value: '#1978e5', label: 'Blue' },
    { value: '#7c3aed', label: 'Purple' },
    { value: '#0891b2', label: 'Cyan' },
    { value: '#059669', label: 'Emerald' },
    { value: '#d97706', label: 'Amber' },
    { value: '#dc2626', label: 'Red' },
    { value: '#db2777', label: 'Pink' },
    { value: '#ea580c', label: 'Orange' },
    { value: '#65a30d', label: 'Lime' },
    { value: '#0f766e', label: 'Teal' },
];

import Input from '../../../shared/atoms/Input';
import Select from '../../../shared/atoms/Select';

export interface ProductFormData {
    name: string;
    description: string;
    icon: string;
    color: string;
    price: string | number;
    billing: string;
    status: string;
    productCode?: string;
}

interface ProviderProductFormProps {
    initialData: ProductFormData;
    onSave: (data: ProductFormData) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    showFooter?: boolean;
}

export default function ProviderProductForm({
    initialData,
    onSave,
    onCancel,
    isSubmitting = false,
    submitLabel = 'Save Changes',
    cancelLabel = 'Cancel',
    showFooter = true,
}: ProviderProductFormProps) {
    const [form, setForm] = useState<ProductFormData>({ 
        ...initialData,
        status: initialData.status || 'inactive'
    });

    const setField = (key: keyof ProductFormData, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = () => {
        // Convert formatted price back to number before saving
        const dataToSave = { ...form };
        if (typeof dataToSave.price === 'string') {
            const numericPrice = parseFloat(dataToSave.price.replace(/,/g, ''));
            dataToSave.price = isNaN(numericPrice) ? 0 : numericPrice;
        }
        onSave(dataToSave);
    };

    const iconOptions = ICONS.map(i => ({ value: i, label: i }));

    return (
        <div className={styles['provider-header__panel-content']}>
            <div className={styles['provider-header__panel-grid']}>
                <div className={styles['provider-header__field']}>
                    <Input
                        label="Name"
                        value={form.name}
                        onChange={e => setField('name', e.target.value)}
                        placeholder="e.g. Premium Cloud API"
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <Input
                        label="Price"
                        prefix="$"
                        type="currency"
                        value={form.price}
                        onChange={e => setField('price', e.target.value)}
                        placeholder="0.00"
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <Select
                        label="Billing Model"
                        value={form.billing}
                        onChange={val => setField('billing', val)}
                        options={BILLING_OPTIONS}
                        type="billing"
                        activeColor={form.color}
                    />
                </div>


                <div className={`${styles['provider-header__field']} ${styles['provider-header__field--span-2']}`}>
                    <label className={styles['provider-header__label']}>Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setField('description', e.target.value)}
                        rows={3}
                        className={styles['provider-header__textarea']}
                        placeholder="Provide a brief overview of the product's capabilities and value proposition."
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <Select
                        label="Icon"
                        value={form.icon}
                        onChange={val => setField('icon', val)}
                        options={iconOptions}
                        type="icon"
                        activeColor={form.color}
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <Select
                        label="Primary Color"
                        value={form.color}
                        onChange={val => setField('color', val)}
                        options={COLORS}
                        type="color"
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <div

                        className={styles['provider-header__preview']}
                        style={{ backgroundColor: `${form.color}15` }}
                    >
                        <div
                            className={styles['provider-header__preview-icon']}
                            style={{ backgroundColor: `${form.color}25`, color: form.color }}
                        >
                            <Icon name={form.icon} className="text-xl" />
                        </div>
                        <div className={styles['provider-header__preview-info']}>
                            <p>{form.name || 'Product Name'}</p>
                            <p style={{ color: form.color }}>{form.color}</p>
                        </div>
                    </div>
                </div>
            </div>

            {showFooter && (
                <div className={styles['provider-header__panel-footer']}>
                    <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white" disabled={isSubmitting}>
                        {cancelLabel}
                    </Button>
                    <Button variant="primary" onClick={handleSave} className={styles['provider-header__save-btn']} disabled={isSubmitting}>
                        <Icon name="save" className="mr-2 text-sm" /> {submitLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
