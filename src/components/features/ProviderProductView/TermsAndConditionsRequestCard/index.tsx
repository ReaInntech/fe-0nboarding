'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface AcceptanceCheckbox {
    id: number;
    text: string;
}

export interface TermsRequestConfig {
    documentTitle: string;
    content: string;
    checkboxes: AcceptanceCheckbox[];
    templateFile: any | null;
}

export interface TermsAndConditionsRequestCardProps {
    title: string;
    onDelete?: () => void;
    onUpdate?: (config: TermsRequestConfig) => void;
}

export default function TermsAndConditionsRequestCard({
    title,
    onDelete,
    onUpdate
}: TermsAndConditionsRequestCardProps) {
    const [config, setConfig] = useState<TermsRequestConfig>({
        documentTitle: '',
        content: '',
        checkboxes: [],
        templateFile: null,
    });

    const handleChange = (field: keyof TermsRequestConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const addCheckbox = () => {
        const newCheckboxes = [...config.checkboxes, { id: Date.now(), text: '' }];
        const newConfig = { ...config, checkboxes: newCheckboxes };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const updateCheckbox = (id: number, text: string) => {
        const newCheckboxes = config.checkboxes.map(cb =>
            cb.id === id ? { ...cb, text } : cb
        );
        const newConfig = { ...config, checkboxes: newCheckboxes };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const removeCheckbox = (id: number) => {
        const newCheckboxes = config.checkboxes.filter(cb => cb.id !== id);
        const newConfig = { ...config, checkboxes: newCheckboxes };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    return (
        <div className={styles['terms-card']}>
            {/* Header */}
            <div className={styles['terms-card__header']}>
                <div className={styles['terms-card__title-box']}>
                    <div className={styles['terms-card__icon-wrapper']}>
                        <Icon name="gavel" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['terms-card__title']}>{title}</span>
                </div>
                <div className={styles['terms-card__actions']}>
                    <button type="button">
                        <Icon name="settings" style={{ fontSize: 14 }} />
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

            <div className={styles['terms-card__body']}>
                {/* Document Upload */}
                <div className={styles['terms-card__upload-zone']}>
                    <div className={styles['terms-card__upload-zone-icon']}>
                        <Icon name="upload_file" style={{ fontSize: 16 }} />
                    </div>
                    <p className={styles['terms-card__upload-zone-text']}>Upload T&C Document</p>
                    <p className={styles['terms-card__upload-zone-subtext']}>Upload the full legal PDF version</p>
                </div>

                {/* Title */}
                <div className={styles['terms-card__field-group']}>
                    <label className={styles['terms-card__label']}>Legal Title</label>
                    <input
                        type="text"
                        value={config.documentTitle}
                        onChange={(e) => handleChange('documentTitle', e.target.value)}
                        placeholder="e.g. Service Level Agreement"
                        className={styles['terms-card__input']}
                    />
                </div>

                {/* Editor Area */}
                <div className={styles['terms-card__field-group']}>
                    <label className={styles['terms-card__label']}>
                        Content Editor
                        <span>Notion Style</span>
                    </label>
                    <div className={styles['terms-card__editor-wrapper']}>
                        {/* Toolbar */}
                        <div className={styles['terms-card__editor-toolbar']}>
                            {['format_bold', 'format_italic', 'format_list_bulleted', 'format_quote', 'link'].map(icon => (
                                <button key={icon} type="button">
                                    <Icon name={icon} style={{ fontSize: 12 }} />
                                </button>
                            ))}
                        </div>
                        {/* Area */}
                        <textarea
                            value={config.content}
                            onChange={(e) => handleChange('content', e.target.value)}
                            placeholder="Type T&C body content here..."
                            rows={4}
                            className={styles['terms-card__editor-textarea']}
                        />
                    </div>
                </div>

                {/* Acceptance Checkboxes */}
                <div className={styles['terms-card__checkboxes-header']}>
                    <label className={styles['terms-card__label']}>Acceptance Checkboxes ({config.checkboxes.length})</label>
                    <button
                        type="button"
                        onClick={addCheckbox}
                        className={styles['terms-card__add-cb-btn']}
                    >
                        <Icon name="add_circle" style={{ fontSize: 12 }} /> Add checkbox
                    </button>
                </div>

                <div className={styles['terms-card__checkboxes-list']}>
                    {config.checkboxes.map((cb) => (
                        <div key={cb.id} className={styles['terms-card__cb-row']}>
                            <div className={styles['terms-card__cb-input-wrapper']}>
                                <div className={styles['terms-card__cb-input-prefix']}>
                                    <div className={styles['terms-card__cb-prefix-box']}>
                                        <div className="dot"></div>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={cb.text}
                                    onChange={(e) => updateCheckbox(cb.id, e.target.value)}
                                    placeholder="e.g. I have read and accept the privacy policy"
                                    className={styles['terms-card__cb-input']}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeCheckbox(cb.id)}
                                className={styles['terms-card__cb-remove']}
                            >
                                <Icon name="remove_circle_outline" style={{ fontSize: 14 }} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
