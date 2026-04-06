'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface DocumentRequestConfig {
    documentTitle: string;
    instructions: string;
    allowedFormats: string[];
    templateFile: any | null;
}

export interface DocumentRequestCardProps {
    title: string;
    onDelete?: () => void;
    onUpdate?: (config: DocumentRequestConfig) => void;
}

export default function DocumentRequestCard({
    title,
    onDelete,
    onUpdate
}: DocumentRequestCardProps) {
    const [config, setConfig] = useState<DocumentRequestConfig>({
        documentTitle: '',
        instructions: '',
        allowedFormats: [],
        templateFile: null,
    });

    const handleChange = (field: keyof DocumentRequestConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        if (onUpdate) onUpdate(newConfig);
    };

    const toggleFormat = (format: string) => {
        const newFormats = config.allowedFormats.includes(format)
            ? config.allowedFormats.filter(f => f !== format)
            : [...config.allowedFormats, format];
        handleChange('allowedFormats', newFormats);
    };

    return (
        <div className={styles['document-card']}>
            {/* Header */}
            <div className={styles['document-card__header']}>
                <div className={styles['document-card__title-box']}>
                    <div className={styles['document-card__icon-wrapper']}>
                        <Icon name="description" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['document-card__title']}>{title}</span>
                </div>
                <div className={styles['document-card__actions']}>
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

            <div className={styles['document-card__body']}>
                {/* Template Upload */}
                <div className={styles['document-card__upload-zone']}>
                    <div className={styles['document-card__upload-zone-icon']}>
                        <Icon name="upload_file" style={{ fontSize: 16 }} />
                    </div>
                    <p className={styles['document-card__upload-zone-text']}>Upload Template to Fill</p>
                    <p className={styles['document-card__upload-zone-subtext']}>Provide a sample or template for the client</p>
                </div>

                {/* Title */}
                <div className={styles['document-card__field']}>
                    <label className={styles['document-card__label']}>Document Title</label>
                    <input
                        type="text"
                        value={config.documentTitle}
                        onChange={(e) => handleChange('documentTitle', e.target.value)}
                        placeholder="e.g. Proof of Identity"
                        className={styles['document-card__input']}
                    />
                </div>

                {/* Instructions */}
                <div className={styles['document-card__field']}>
                    <label className={styles['document-card__label']}>Instructions</label>
                    <textarea
                        value={config.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Explain how the client should provide this document..."
                        rows={3}
                        className={styles['document-card__textarea']}
                    />
                </div>

                {/* Allowed Formats */}
                <div className={styles['document-card__field']}>
                    <label className={styles['document-card__label']}>Allowed Evidence Formats</label>
                    <div className={styles['document-card__formats']}>
                        {['pdf', 'docx', 'jpg', 'png', 'zip'].map((format) => (
                            <button
                                key={format}
                                type="button"
                                onClick={() => toggleFormat(format)}
                                className={`${styles['document-card__format-btn']} ${
                                    config.allowedFormats.includes(format)
                                    ? styles['document-card__format-btn--active']
                                    : styles['document-card__format-btn--idle']
                                }`}
                            >
                                {format}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
