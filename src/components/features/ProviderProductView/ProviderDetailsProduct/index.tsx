'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

export interface ProviderDetailsProductProps {
    initialMetadata?: Record<string, any>;
    onSave?: (metadata: Record<string, any>) => Promise<void>;
}

interface MetadataEntry {
    id: string;
    key: string;
    value: string;
    isCustomByUser: boolean;
}

export default function ProviderDetailsProduct({
    initialMetadata = {},
    onSave
}: ProviderDetailsProductProps) {
    const [entries, setEntries] = useState<MetadataEntry[]>(() => {
        return Object.entries(initialMetadata).map(([key, data]) => {
            const isObject = typeof data === 'object' && data !== null;
            return {
                id: Math.random().toString(36).substr(2, 9),
                key,
                value: isObject ? String(data.value || '') : String(data),
                isCustomByUser: isObject ? !!data.isCustomByUser : false
            };
        });
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const addField = () => {
        setEntries([...entries, { id: Date.now().toString(), key: '', value: '', isCustomByUser: false }]);
    };

    const updateField = (id: string, field: 'key' | 'value' | 'isCustomByUser', val: string | boolean) => {
        setEntries(entries.map(e => e.id === id ? { ...e, [field]: val } : e));
    };

    const removeField = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            const newMetadata: Record<string, any> = {};
            entries.forEach(e => {
                if (e.key.trim()) {
                    newMetadata[e.key.trim()] = {
                        value: e.value,
                        isCustomByUser: e.isCustomByUser
                    };
                }
            });
            await onSave(newMetadata);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1000);
        } catch (error) {
            console.error('Failed to save metadata:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['details-product__header']}>
                <div className="flex items-center gap-4">
                    <h3 className={styles['details-product__title']}>
                        <Icon name="assignment_turned_in" className="text-[#1978e5]" /> Product Metadata
                    </h3>
                    {showSuccess && (
                        <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                            <Icon name="check_circle" className="mr-1.5 text-xs" /> Saved
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className={styles['details-product__add-btn']} onClick={addField}>
                        <Icon name="add" className="mr-1" /> Add Field
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving || showSuccess}
                        className="text-xs font-bold h-8 flex items-center"
                    >
                        {isSaving ? (
                            <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin mr-1.5" />
                        ) : (
                            <Icon name="save" className="mr-1.5 text-sm" />
                        )}
                        Save
                    </Button>
                </div>
            </div>

            <div className={styles['details-product__list']}>
                {entries.length === 0 && (
                    <div className="text-center p-6 text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-lg">
                        No metadata defined yet. Click "Add Field" to create custom attributes.
                    </div>
                )}
                {entries.map((entry) => (
                    <div key={entry.id} className={styles['details-product__item']}>
                        <div className={styles['details-product__item-left']}>
                            <div className="flex-1">
                                <span className={styles['details-product__label']}>Attribute Name (Key)</span>
                                <input
                                    type="text"
                                    value={entry.key}
                                    onChange={(e) => updateField(entry.id, 'key', e.target.value)}
                                    placeholder="e.g. SLA Level"
                                    className={styles['details-product__input']}
                                />
                            </div>
                            <div className="flex-1">
                                <span className={styles['details-product__label']}>Value</span>
                                <input
                                    type="text"
                                    value={entry.value}
                                    onChange={(e) => updateField(entry.id, 'value', e.target.value)}
                                    placeholder="e.g. 99.99%"
                                    className={styles['details-product__input']}
                                />
                            </div>

                            <div className="flex items-center ml-4 mr-2">
                                <label className={styles['details-product__checkbox-label']}>
                                    <input
                                        type="checkbox"
                                        checked={entry.isCustomByUser}
                                        onChange={(e) => updateField(entry.id, 'isCustomByUser', e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`${styles['details-product__checkbox-custom']} ${entry.isCustomByUser
                                            ? styles['details-product__checkbox-custom--checked']
                                            : styles['details-product__checkbox-custom--idle']
                                        }`}>
                                        {entry.isCustomByUser && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                                    </div>
                                    <span className={`${styles['details-product__checkbox-text']} ${entry.isCustomByUser
                                            ? styles['details-product__checkbox-text--active']
                                            : styles['details-product__checkbox-text--idle']
                                        }`}>
                                        Custom by user
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className={styles['details-product__actions']}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-400 transition-colors"
                                onClick={() => removeField(entry.id)}
                            >
                                <Icon name="close" className="text-sm" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles['details-product__info-box']}>
                <p className={styles['details-product__info-text']}>
                    <Icon name="info" className="text-sm mr-1 inline-block" />
                    Specify the custom metadata attributes for this product. These are free-form key/value pairs used internally and externally.
                </p>
            </div>
        </Card>
    );
}
