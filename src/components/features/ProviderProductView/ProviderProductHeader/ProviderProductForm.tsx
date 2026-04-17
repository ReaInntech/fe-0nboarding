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

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClickOutside: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, onClickOutside]);
}

interface GenericDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; icon?: string; color?: string }[];
    type: 'icon' | 'color' | 'billing';
    activeColor?: string;
}

function CustomDropdown({ value, onChange, options, type, activeColor }: GenericDropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setOpen(false));

    const selectedOption = options.find(o => o.value === value) || options[0];

    const renderLeading = (opt: typeof selectedOption, isSelected: boolean) => {
        if (type === 'color') {
            return (
                <span
                    className={styles['icon-dropdown__item-icon-box']}
                    style={{
                        width: 24,
                        height: 24,
                        backgroundColor: opt.value,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)'
                    }}
                />
            );
        }
        
        const color = activeColor || '#1978e5';
        const iconName = type === 'icon' ? opt.value : opt.icon || 'help_outline';
        
        return (
            <span
                className={styles['icon-dropdown__item-icon-box']}
                style={{
                    width: 30,
                    height: 30,
                    backgroundColor: isSelected ? `${color}25` : 'rgba(255,255,255,0.04)',
                    color: isSelected ? color : '#94a3b8'
                }}
            >
                <Icon name={iconName} style={{ fontSize: 18 }} />
            </span>
        );
    };

    return (
        <div className={styles['icon-dropdown']} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={styles['icon-dropdown__trigger']}
            >
                {renderLeading(selectedOption, true)}
                <span className={styles['icon-dropdown__trigger-text']}>
                    {type === 'icon' ? selectedOption.value : selectedOption.label}
                </span>
                <Icon name={open ? 'expand_less' : 'expand_more'} className={styles['icon-dropdown__trigger-arrow']} />
            </button>

            {open && (
                <div className={styles['icon-dropdown__menu']}>
                    {options.map(opt => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`${styles['icon-dropdown__item']} ${isSelected ? styles['icon-dropdown__item--active'] : ''}`}
                            >
                                {renderLeading(opt, isSelected)}
                                <span className={`${styles['icon-dropdown__item-text']} ${isSelected ? styles['icon-dropdown__item-text--active'] : styles['icon-dropdown__item-text--idle']}`}>
                                    {type === 'icon' ? opt.value : opt.label}
                                </span>
                                {isSelected && <Icon name="check" className={styles['icon-dropdown__item-check']} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

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
    const [form, setForm] = useState<ProductFormData>({ ...initialData });

    const setField = (key: keyof ProductFormData, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = () => {
        onSave(form);
    };

    const iconOptions = ICONS.map(i => ({ value: i, label: i }));

    return (
        <div className={styles['provider-header__panel-content']}>
            <div className={styles['provider-header__panel-grid']}>
                <div className={styles['provider-header__field']}>
                    <label className={styles['provider-header__label']}>Name</label>
                    <div className={styles['provider-header__input-wrapper']}>
                        <input
                            value={form.name}
                            onChange={e => setField('name', e.target.value)}
                            className={styles['provider-header__input']}
                            placeholder="e.g. Premium Cloud API"
                        />
                    </div>
                </div>

                <div className={styles['provider-header__field']}>
                    <label className={styles['provider-header__label']}>Price</label>
                    <div className={styles['provider-header__input-wrapper']}>
                        <span className="prefix">$</span>
                        <input
                            value={form.price}
                            onChange={e => setField('price', e.target.value)}
                            className={`${styles['provider-header__input']} ${styles['provider-header__input--with-prefix']}`}
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className={styles['provider-header__field']}>
                    <label className={styles['provider-header__label']}>Billing Model</label>
                    <CustomDropdown 
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
                    <label className={styles['provider-header__label']}>Status</label>
                    <div className={styles['provider-header__status-list']}>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setField('status', opt.value)}
                                className={`${styles['provider-header__status-btn']} ${
                                    form.status === opt.value
                                    ? `${opt.bg} ${opt.color}`
                                    : styles['provider-header__status-btn--idle']
                                }`}
                            >
                                <Icon name={opt.icon} className="text-base" />
                                {opt.label}
                                {form.status === opt.value && (
                                    <Icon name="check" className="check-icon" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles['provider-header__field']}>
                    <label className={styles['provider-header__label']}>Icon</label>
                    <CustomDropdown 
                        value={form.icon} 
                        onChange={val => setField('icon', val)}
                        options={iconOptions}
                        type="icon"
                        activeColor={form.color}
                    />
                </div>

                <div className={styles['provider-header__field']}>
                    <label className={styles['provider-header__label']}>Primary Color</label>
                    <CustomDropdown 
                        value={form.color} 
                        onChange={val => setField('color', val)}
                        options={COLORS}
                        type="color"
                    />
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
                    <Button variant="primary" onClick={handleSave} className={styles['provider-header__save-btn']} isLoading={isSubmitting}>
                        <Icon name="save" className="mr-2 text-sm" /> {submitLabel}
                    </Button>
                </div>
            )}
        </div>
    );
}
