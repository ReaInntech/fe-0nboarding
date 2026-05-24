'use client';

import React, { useState, useRef } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface DocumentRequestConfig {
    documentTitle: string;
    instructions: string;
    allowedFormats: string[];
    templateFile: string | null;
}

export interface DocumentRequestCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: DocumentRequestConfig;
    onDelete?: () => void;
    onSave?: (config: DocumentRequestConfig) => Promise<void>;
    disabled?: boolean;
    hasResolved?: boolean;
}

export default function DocumentRequestCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave,
    disabled = false,
    hasResolved = false
}: DocumentRequestCardProps) {
    const [config, setConfig] = useState<DocumentRequestConfig>(initialConfig || {
        documentTitle: title || '',
        instructions: description || '',
        allowedFormats: [],
        templateFile: null,
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

    const isFormValid = config.documentTitle.trim() !== '';

    const handleChange = (field: keyof DocumentRequestConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        setConfig(newConfig);
        return newConfig;
    };

    const handleSave = async (configToSave = config) => {
        if (!onSave || !isFormValid) return;
        setIsSaving(true);
        try {
            await onSave(configToSave);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save document request:', error);
        } finally {
            setIsSaving(false);
        }
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
            // Ignore form validation for file upload save to ensure it persists
            if (onSave) {
                await onSave(newConfig);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
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

    const toggleFormat = (format: string) => {
        const newFormats = config.allowedFormats.includes(format)
            ? config.allowedFormats.filter(f => f !== format)
            : [...config.allowedFormats, format];
        handleChange('allowedFormats', newFormats);
    };

    return (
        <>
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
                        onClick={() => handleSave(config)}
                        disabled={isSaving || !isFormValid || disabled}
                        className={`${isSaving || !isFormValid || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${showSuccess ? 'hidden' : ''}`}
                        title={disabled ? "Save the step first to enable" : !isFormValid ? "Document Title is required" : "Save changes"}
                    >
                        {isSaving ? (
                            <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" style={{ fontSize: 14 }} className={isFormValid ? "text-orange-400" : "text-slate-600"} />
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

            <div className={styles['document-card__body']}>
                {/* Template Upload */}
                <div 
                    className={`${styles['document-card__upload-zone']} ${!isFormValid || isUploading || disabled ? 'opacity-50 pointer-events-none' : ''} ${config.templateFile ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}
                    onClick={() => isFormValid && !isUploading && !disabled && !config.templateFile && fileInputRef.current?.click()}
                    style={{ cursor: (isFormValid && !isUploading && !disabled && !config.templateFile) ? 'pointer' : 'default' }}
                    title={disabled ? "Save the step first to enable" : !isFormValid ? "Complete Document Title to upload template" : ""}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="application/pdf,image/jpeg,image/png" 
                        className="hidden" 
                        disabled={!isFormValid}
                    />
                    
                    {isUploading ? (
                        <>
                            <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-2 mx-auto" />
                            <p className={styles['document-card__upload-zone-text']}>Uploading Document...</p>
                        </>
                    ) : config.templateFile ? (
                        <>
                            <div className={`${styles['document-card__upload-zone-icon']} text-emerald-400 bg-emerald-400/10`}>
                                <Icon name="task" style={{ fontSize: 16 }} />
                            </div>
                            <p className="text-emerald-400 text-sm font-semibold mt-2">Document Uploaded</p>
                            
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
                                        const newConfig = { ...config, templateFile: null };
                                        setConfig(newConfig);
                                        await handleSave(newConfig);
                                    }}
                                >
                                    Replace
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles['document-card__upload-zone-icon']}>
                                <Icon name="upload_file" style={{ fontSize: 16 }} />
                            </div>
                            <p className={styles['document-card__upload-zone-text']}>Upload Template to Fill</p>
                            <p className={styles['document-card__upload-zone-subtext']}>Provide a sample or template for the client</p>
                            {!isFormValid && (
                                <p className="text-[10px] text-orange-400 mt-2 font-medium bg-orange-400/10 px-2 py-1 rounded">
                                    Requires Document Title first
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Title */}
                <div className={styles['document-card__field']}>
                    <label className={styles['document-card__label']}>Document Title</label>
                    <input
                        type="text"
                        value={config.documentTitle}
                        disabled={disabled}
                        onChange={(e) => handleChange('documentTitle', e.target.value)}
                        placeholder="e.g. Proof of Identity"
                        className={`${styles['document-card__input']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                </div>

                {/* Instructions */}
                <div className={styles['document-card__field']}>
                    <label className={styles['document-card__label']}>Instructions</label>
                    <textarea
                        value={config.instructions}
                        disabled={disabled}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Explain how the client should provide this document..."
                        rows={3}
                        className={`${styles['document-card__textarea']} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Document Viewer"
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
                            title="Document Preview"
                        />
                    ) : (
                        <p className="text-rose-400">The document preview could not be loaded.</p>
                    )}
                </div>
            </Modal>
        </>
    );
}
