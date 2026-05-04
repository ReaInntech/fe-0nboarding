'use client';

import React, { useState, useRef } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface AcceptanceCheckbox {
    id: number;
    text: string;
}

export interface TermsRequestConfig {
    documentTitle: string;
    content: string;
    checkboxes: AcceptanceCheckbox[];
    templateFile: string | null;
}

export interface TermsAndConditionsRequestCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: TermsRequestConfig;
    onDelete?: () => void;
    onSave?: (config: TermsRequestConfig) => Promise<void>;
    disabled?: boolean;
}

export default function TermsAndConditionsRequestCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave,
    disabled = false
}: TermsAndConditionsRequestCardProps) {
    const [config, setConfig] = useState<TermsRequestConfig>({
        documentTitle: initialConfig?.documentTitle || title || '',
        content: initialConfig?.content || description || '',
        checkboxes: initialConfig?.checkboxes || [],
        templateFile: initialConfig?.templateFile || null,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // File Upload hooks & state
    const { user } = useApp();
    const { uploadFile, isUploading } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Document Viewer state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const handleChange = (field: keyof TermsRequestConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        return newConfig;
    };

    const handleSave = async (configToSave = config) => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(configToSave);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save terms request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const addCheckbox = () => {
        const newCheckboxes = [...config.checkboxes, { id: Date.now(), text: '' }];
        handleChange('checkboxes', newCheckboxes);
    };

    const updateCheckbox = (id: number, text: string) => {
        const newCheckboxes = config.checkboxes.map(cb =>
            cb.id === id ? { ...cb, text } : cb
        );
        handleChange('checkboxes', newCheckboxes);
    };

    const removeCheckbox = (id: number) => {
        const newCheckboxes = config.checkboxes.filter(cb => cb.id !== id);
        handleChange('checkboxes', newCheckboxes);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            // Get fresh token
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error("No authentication token available");

            const uploadedKey = await uploadFile(file, 'documents', freshToken);

            // Update local state AND trigger save immediately for persistence
            const newConfig = { ...config, templateFile: uploadedKey };
            setConfig(newConfig);
            await handleSave(newConfig);
        } catch (error) {
            console.error('Upload failed', error);
            alert('Document upload failed. Please try again later.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleViewDocument = async () => {
        if (!config.templateFile || !user) return;

        setIsLoadingPreview(true);
        setIsModalOpen(true);
        setPreviewUrl(null);

        try {
            // Get a fresh token before fetching download URL
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error("No authentication token available");

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(config.templateFile)}`, {
                headers: { Authorization: `Bearer ${freshToken}` }
            });

            if (response.ok) {
                const body = await response.json();
                // Handle standard { data: { url: '...' } } wrapper
                const url = body.data?.url || body.url;
                setPreviewUrl(url);
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Failed to get preview URL");
            }
        } catch (error: any) {
            console.error("Preview failed:", error);
            alert(`Error opening the document: ${error.message}`);
            setIsModalOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    return (
        <>
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
                                <Icon name="save" style={{ fontSize: 14 }} className="text-emerald-400" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={disabled}
                            className={`${styles['delete-btn']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Icon name="delete" style={{ fontSize: 14 }} />
                        </button>
                    </div>
                </div>

                <div className={styles['terms-card__body']}>
                    {/* Title */}
                    <div className={styles['terms-card__field-group']}>
                        <label className={styles['terms-card__label']}>Legal Title</label>
                        <input
                            type="text"
                            value={config.documentTitle}
                            disabled={disabled}
                            onChange={(e) => handleChange('documentTitle', e.target.value)}
                            placeholder="e.g. Service Level Agreement"
                            className={`${styles['terms-card__input']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>

                    {/* Document Upload */}
                    <div
                        className={`${styles['terms-card__upload-zone']} ${isUploading || disabled ? 'opacity-50 pointer-events-none' : ''} ${config.templateFile ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}
                        onClick={() => !isUploading && !disabled && !config.templateFile && fileInputRef.current?.click()}
                        style={{ cursor: (!isUploading && !disabled && !config.templateFile) ? 'pointer' : 'default' }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                        />

                        {isUploading ? (
                            <>
                                <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2 mx-auto" />
                                <p className={styles['terms-card__upload-zone-text']}>Uploading Document...</p>
                            </>
                        ) : config.templateFile ? (
                            <>
                                <div className={`${styles['terms-card__upload-zone-icon']} text-emerald-400 bg-emerald-400/10`}>
                                    <Icon name="task" style={{ fontSize: 16 }} />
                                </div>
                                <p className="text-emerald-400 text-sm font-semibold mt-2">Document Uploaded (PDF)</p>

                                <div className="mt-3 flex gap-2 justify-center">
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-primary hover:underline px-3 py-1 flex items-center justify-center gap-1 bg-primary/10 rounded-full"
                                        onClick={(e) => { e.stopPropagation(); handleViewDocument(); }}
                                    >
                                        <Icon name="visibility" style={{ fontSize: 12 }} /> View Document
                                    </button>
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 flex items-center justify-center gap-1 rounded-full border border-rose-500/20"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            const newConfig = handleChange('templateFile', null);
                                            await handleSave(newConfig);
                                        }}
                                    >
                                        Replace
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className={styles['terms-card__upload-zone-icon']}>
                                    <Icon name="upload_file" style={{ fontSize: 16 }} />
                                </div>
                                <p className={styles['terms-card__upload-zone-text']}>Upload T&C Document</p>
                                <p className={styles['terms-card__upload-zone-subtext']}>Upload the full legal PDF version</p>
                            </>
                        )}
                    </div>



                    {/* Editor Area     
                    <div className={styles['terms-card__field-group']}>
                        <label className={styles['terms-card__label']}>
                            Content Editor
                            <span>Notion Style</span>
                        </label>
                        <div className={styles['terms-card__editor-wrapper']}>
                            <div className={styles['terms-card__editor-toolbar']}>
                                {['format_bold', 'format_italic', 'format_list_bulleted', 'format_quote', 'link'].map(icon => (
                                    <button key={icon} type="button">
                                        <Icon name={icon} style={{ fontSize: 12 }} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={config.content}
                                disabled={disabled}
                                onChange={(e) => handleChange('content', e.target.value)}
                                placeholder="Type T&C body content here..."
                                rows={4}
                                className={`${styles['terms-card__editor-textarea']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                    */}

                    {/* Acceptance Checkboxes */}
                    <div className={styles['terms-card__checkboxes-header']}>
                        <label className={styles['terms-card__label']}>Acceptance Checkboxes ({config.checkboxes.length})</label>
                        <button
                            type="button"
                            onClick={addCheckbox}
                            disabled={disabled}
                            className={`${styles['terms-card__add-cb-btn']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Terms & Conditions (PDF)"
                size="2xl"
            >
                <div className="bg-surface rounded-xl overflow-hidden w-full h-[65vh] flex justify-center items-center">
                    {isLoadingPreview ? (
                        <div className="flex flex-col items-center text-slate-400">
                            <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-sm">Opening secure document...</p>
                        </div>
                    ) : previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            title="PDF Preview"
                        />
                    ) : (
                        <p className="text-rose-400">The document preview could not be loaded.</p>
                    )}
                </div>
            </Modal>
        </>
    );
}
