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
    id: string;
    title: string;
    description?: string;
    initialConfig?: DocumentRequestConfig;
    onDelete?: () => void;
    onSave?: (config: DocumentRequestConfig) => Promise<void>;
}

export default function DocumentRequestCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave
}: DocumentRequestCardProps) {
    const [config, setConfig] = useState<DocumentRequestConfig>(initialConfig || {
        documentTitle: title || '',
        instructions: description || '',
        allowedFormats: [],
        templateFile: null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (field: keyof DocumentRequestConfig, value: any) => {
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
            console.error('Failed to save document request:', error);
        } finally {
            setIsSaving(false);
        }
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
