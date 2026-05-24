'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface FormField {
    id: number;
    label: string;
    type: string;
    required: boolean;
}

export interface FormRequestConfig {
    formTitle: string;
    instructions: string;
    fields: FormField[];
}

export interface FormRequestCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: FormRequestConfig;
    onDelete?: () => void;
    onSave?: (config: FormRequestConfig) => Promise<void>;
    disabled?: boolean;
    hasResolved?: boolean;
}

const FIELD_TYPES = ['string', 'number', 'email', 'tel', 'textarea'];

export default function FormRequestCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave,
    disabled = false,
    hasResolved = false
}: FormRequestCardProps) {
    const [config, setConfig] = useState<FormRequestConfig>(initialConfig || {
        formTitle: title || '',
        instructions: description || '',
        fields: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (field: keyof FormRequestConfig, value: any) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(config);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save form request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const addField = () => {
        const newFields = [...config.fields, { id: Date.now(), label: '', type: 'string', required: false }];
        handleChange('fields', newFields);
    };

    const updateField = (id: number, field: keyof FormField, value: any) => {
        const newFields = config.fields.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        );
        handleChange('fields', newFields);
    };

    const removeField = (id: number) => {
        const newFields = config.fields.filter(f => f.id !== id);
        handleChange('fields', newFields);
    };

    return (
        <div className={styles['form-card']}>
            {/* Header */}
            <div className={styles['form-card__header']}>
                <div className={styles['form-card__title-box']}>
                    <div className={styles['form-card__icon-wrapper']}>
                        <Icon name="assignment" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['form-card__title']}>{title}</span>
                </div>
                <div className={styles['form-card__actions']}>
                    {showSuccess && (
                        <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                            <Icon name="check_circle" className="mr-1.5 text-xs" /> Saved
                        </div>
                    )}
                    
                    <button 
                        type="button" 
                        onClick={() => handleSave()}
                        disabled={isSaving || disabled}
                        className={`${isSaving || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${showSuccess ? 'hidden' : ''}`}
                    >
                        {isSaving ? (
                            <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" style={{ fontSize: 14 }} className="text-violet-400" />
                        )}
                    </button>

                    <span
                        title={hasResolved ? "No se puede eliminar porque este challenge ya fue resuelto por usuarios" : "Delete request"}
                        className="inline-flex"
                    >
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={disabled || hasResolved}
                            className={`${styles['delete-btn']} ${(disabled || hasResolved) ? 'opacity-50' : ''}`}
                            style={(disabled || hasResolved) ? { pointerEvents: 'none' } : undefined}
                        >
                            <Icon name="delete" style={{ fontSize: 14 }} />
                        </button>
                    </span>
                </div>
            </div>

            <div className={styles['form-card__body']}>
                {/* Form Metadata */}
                <div className={styles['form-card__field-group']}>
                    <label className={styles['form-card__label']}>Form Title</label>
                    <input
                        type="text"
                        value={config.formTitle}
                        disabled={disabled}
                        onChange={(e) => handleChange('formTitle', e.target.value)}
                        placeholder="e.g. Technical Requirements Survey"
                        className={`${styles['form-card__input']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>
                <div className={styles['form-card__field-group']}>
                    <label className={styles['form-card__label']}>Instructions</label>
                    <textarea
                        value={config.instructions}
                        disabled={disabled}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Briefly explain what information we are gathering..."
                        rows={2}
                        className={`${styles['form-card__textarea']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                {/* Dynamic Fields Management */}
                <div className={styles['form-card__fields-header']}>
                    <label className={styles['form-card__label']}>Form Fields ({config.fields.length})</label>
                    <button
                        type="button"
                        onClick={addField}
                        disabled={disabled}
                        className={`${styles['form-card__add-btn']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icon name="add_circle" style={{ fontSize: 12 }} /> Add Field
                    </button>
                </div>

                <div className={styles['form-card__fields-list']}>
                    {config.fields.map((field) => (
                        <div key={field.id} className={styles['form-card__dynamic-field']}>
                            <button
                                type="button"
                                onClick={() => removeField(field.id)}
                                className={styles['form-card__field-remove']}
                            >
                                <Icon name="close" style={{ fontSize: 12 }} />
                            </button>

                            <div className={styles['form-card__field-edit']}>
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                    placeholder="Field Label (e.g. Phone Number)"
                                    className={styles['form-card__field-label-input']}
                                />

                                <div className={styles['form-card__field-controls']}>
                                    <div className={styles['form-card__type-list']}>
                                        {FIELD_TYPES.map(typeOpt => (
                                            <button
                                                key={typeOpt}
                                                type="button"
                                                onClick={() => updateField(field.id, 'type', typeOpt)}
                                                className={`${styles['form-card__type-btn']} ${
                                                    field.type === typeOpt
                                                    ? styles['form-card__type-btn--active']
                                                    : styles['form-card__type-btn--idle']
                                                }`}
                                            >
                                                {typeOpt}
                                            </button>
                                        ))}
                                    </div>

                                    <label className={styles['form-card__required-label']}>
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                            className="hidden"
                                        />
                                        <div className={`${styles['form-card__checkbox-custom']} ${
                                            field.required 
                                            ? styles['form-card__checkbox-custom--checked'] 
                                            : styles['form-card__checkbox-custom--idle']
                                        }`}>
                                            {field.required && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                                        </div>
                                        <span className={`${styles['form-card__required-text']} ${
                                            field.required 
                                            ? styles['form-card__required-text--active'] 
                                            : styles['form-card__required-text--idle']
                                        }`}>
                                            Required
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
