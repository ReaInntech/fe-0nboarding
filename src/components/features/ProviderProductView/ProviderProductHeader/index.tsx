'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
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
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' },
    { value: 'one_time', label: 'One-time Payment' },
    { value: 'usage', label: 'By Usage' },
];

const COLORS = [
    '#1978e5', '#7c3aed', '#0891b2', '#059669', '#d97706',
    '#dc2626', '#db2777', '#ea580c', '#65a30d', '#0f766e',
];

interface IconDropdownProps {
    value: string;
    onChange: (value: string) => void;
    color: string;
}

function IconDropdown({ value, onChange, color }: IconDropdownProps) {
    const [open, setOpen] = useState(false);
    return (
        <div className={styles['icon-dropdown']}>
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={styles['icon-dropdown__trigger']}
            >
                <span
                    className={styles['icon-dropdown__trigger-icon']}
                    style={{ width: 30, height: 30, backgroundColor: `${color}20`, color }}
                >
                    <Icon name={value} style={{ fontSize: 20 }} />
                </span>
                <span className={styles['icon-dropdown__trigger-text']}>{value}</span>
                <Icon name={open ? 'expand_less' : 'expand_more'} className={styles['icon-dropdown__trigger-arrow']} />
            </button>

            {open && (
                <div className={styles['icon-dropdown__menu']}>
                    {ICONS.map(ic => (
                        <button
                            key={ic}
                            type="button"
                            onClick={() => { onChange(ic); setOpen(false); }}
                            className={`${styles['icon-dropdown__item']} ${ic === value ? styles['icon-dropdown__item--active'] : ''}`}
                        >
                            <span
                                className={styles['icon-dropdown__item-icon-box']}
                                style={{
                                    width: 30,
                                    height: 30,
                                    backgroundColor: ic === value ? `${color}25` : 'rgba(255,255,255,0.04)',
                                    color: ic === value ? color : '#94a3b8'
                                }}
                            >
                                <Icon name={ic} style={{ fontSize: 18 }} />
                            </span>
                            <span className={`${styles['icon-dropdown__item-text']} ${ic === value ? styles['icon-dropdown__item-text--active'] : styles['icon-dropdown__item-text--idle']}`}>
                                {ic}
                            </span>
                            {ic === value && <Icon name="check" className={styles['icon-dropdown__item-check']} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

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
    const [form, setForm] = useState({
        name: title,
        description: '',
        icon: icon,
        color: iconColor,
        price: '',
        billing: 'monthly',
        status: 'active',
    });
    const [saved, setSaved] = useState({ ...form });

    const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSave = () => {
        setSaved({ ...form });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setForm({ ...saved });
        setIsEditing(false);
    };

    const currentStatus = STATUS_OPTIONS.find(s => s.value === form.status) || STATUS_OPTIONS[0];

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

                    <div className={styles['provider-header__panel-grid']}>
                        <div className={styles['provider-header__field']}>
                            <label className={styles['provider-header__label']}>Name</label>
                            <input
                                value={form.name}
                                onChange={e => setField('name', e.target.value)}
                                className={styles['provider-header__input']}
                            />
                        </div>

                        <div className={styles['provider-header__field']}>
                            <label className={styles['provider-header__label']}>Price</label>
                            <div className={styles['provider-header__input-wrapper']}>
                                <span className="prefix">$</span>
                                <input
                                    value={form.price}
                                    onChange={e => setField('price', e.target.value)}
                                    className={`${styles['provider-header__input']} ${styles['provider-header__input--with-prefix']}`}
                                />
                            </div>
                        </div>

                        <div className={styles['provider-header__field']}>
                            <label className={styles['provider-header__label']}>Billing Model</label>
                            <select
                                value={form.billing}
                                onChange={e => setField('billing', e.target.value)}
                                className={styles['provider-header__select']}
                            >
                                {BILLING_OPTIONS.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className={`${styles['provider-header__field']} ${styles['provider-header__field--span-2']}`}>
                            <label className={styles['provider-header__label']}>Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setField('description', e.target.value)}
                                rows={3}
                                className={styles['provider-header__textarea']}
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
                            <IconDropdown value={form.icon} onChange={val => setField('icon', val)} color={form.color} />
                        </div>

                        <div className={styles['provider-header__field']}>
                            <label className={styles['provider-header__label']}>Primary Color</label>
                            <div className={styles['provider-header__color-grid']}>
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setField('color', c)}
                                        className={`${styles['provider-header__color-btn']} ${form.color === c ? styles['provider-header__color-btn--active'] : ''}`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
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

                    <div className={styles['provider-header__panel-footer']}>
                        <Button variant="ghost" onClick={handleCancel} className="text-slate-400 hover:text-white">
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} className={styles['provider-header__save-btn']}>
                            <Icon name="save" className="mr-2 text-sm" /> Save Changes
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
