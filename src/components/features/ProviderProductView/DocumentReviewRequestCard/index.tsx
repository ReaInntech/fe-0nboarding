'use client';

import React, { useState, useRef } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface DocumentReviewRequestConfig {
    documentTitle: string;
    instructions: string;
    templateFile: string | null;
    requiresApproval: boolean;
    allowComments: boolean;
    customDocumentPerUser?: boolean;
    waitingExplanationMessage?: string;
}

export interface DocumentReviewRequestCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: DocumentReviewRequestConfig;
    onDelete?: () => void;
    onSave?: (config: DocumentReviewRequestConfig) => Promise<void>;
    disabled?: boolean;
    hasResolved?: boolean;
}

export default function DocumentReviewRequestCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave,
    disabled = false,
    hasResolved = false,
}: DocumentReviewRequestCardProps) {
    const [config, setConfig] = useState<DocumentReviewRequestConfig>(initialConfig || {
        documentTitle: title || '',
        instructions: description || '',
        templateFile: null,
        requiresApproval: true,
        allowComments: true,
        customDocumentPerUser: false,
        waitingExplanationMessage: 'El proveedor está fabricando el documento que se requiere aprobar. Te notificaremos en cuanto esté disponible para su revisión.',
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

    const handleChange = (field: keyof DocumentReviewRequestConfig, value: any) => {
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
            console.error('Failed to save document review request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error('No authentication token available');

            const uploadedKey = await uploadFile(file, 'documents', freshToken);
            const newConfig = { ...config, templateFile: uploadedKey };
            setConfig(newConfig);

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
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error('No authentication token available');

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(config.templateFile)}`, {
                headers: { Authorization: `Bearer ${freshToken}` },
            });

            if (response.ok) {
                const body = await response.json();
                const url = body.data?.url || body.url;
                setPreviewUrl(url);
            } else {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || 'Failed to get preview URL');
            }
        } catch (error: any) {
            console.error('Preview failed:', error);
            alert(`Error opening the document: ${error.message}`);
            setIsModalOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    return (
        <div className={styles['doc-review-card']}>
            <div className={styles['doc-review-card__header']}>
                <div className={styles['doc-review-card__title-box']}>
                    <div className={styles['doc-review-card__icon-wrapper']}>
                        <Icon name="rule_folder" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['doc-review-card__title']}>Review & Approval Request</span>
                </div>
                <div className={styles['doc-review-card__actions']}>
                    {showSuccess && (
                        <span className="text-[10px] text-emerald-400 font-medium animate-fade-in flex items-center gap-1 mr-2">
                            <Icon name="check" style={{ fontSize: 12 }} /> Saved
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => handleSave()}
                        disabled={disabled || isSaving || !isFormValid}
                        title="Save Changes"
                        className="hover:text-blue-400 disabled:opacity-50"
                    >
                        <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} style={{ fontSize: 16 }} />
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={disabled || hasResolved}
                        title={hasResolved ? 'Cannot delete resolved request' : 'Delete Request'}
                        className={`${styles['delete-btn']} disabled:opacity-30 disabled:hover:bg-transparent`}
                    >
                        <Icon name="delete" style={{ fontSize: 16 }} />
                    </button>
                </div>
            </div>

            <div className={styles['doc-review-card__body']}>
                {/* Document File Uploader / Attached Indicator */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xlsx"
                    className="hidden"
                />

                {config.templateFile ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="size-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                                <Icon name="description" style={{ fontSize: 16 }} />
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-semibold text-slate-200 truncate">
                                    {config.templateFile.split('/').pop()}
                                </p>
                                <p className="text-[10px] text-slate-500">Document attached for client review</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <button
                                type="button"
                                onClick={handleViewDocument}
                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Preview Document"
                            >
                                <Icon name="visibility" style={{ fontSize: 14 }} />
                            </button>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled || isUploading}
                                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Replace File"
                            >
                                <Icon name="upload" style={{ fontSize: 14 }} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                        className={styles['doc-review-card__upload-zone']}
                    >
                        <div className={styles['doc-review-card__upload-zone-icon']}>
                            <Icon name={isUploading ? 'sync' : 'upload_file'} className={isUploading ? 'animate-spin' : ''} style={{ fontSize: 18 }} />
                        </div>
                        <p className={styles['doc-review-card__upload-zone-text']}>
                            {isUploading ? 'Uploading Document...' : 'Attach Proposal / Contract Document'}
                        </p>
                        <p className={styles['doc-review-card__upload-zone-subtext']}>
                            PDF, Word or Excel to be reviewed and approved by client
                        </p>
                    </div>
                )}

                {/* Title */}
                <div className={styles['doc-review-card__field']}>
                    <label className={styles['doc-review-card__label']}>Title</label>
                    <input
                        type="text"
                        value={config.documentTitle}
                        onChange={(e) => handleChange('documentTitle', e.target.value)}
                        onBlur={() => handleSave()}
                        placeholder="e.g. Master Services Agreement (MSA)"
                        disabled={disabled}
                        className={styles['doc-review-card__input']}
                    />
                </div>

                {/* Instructions */}
                <div className={styles['doc-review-card__field']}>
                    <label className={styles['doc-review-card__label']}>Instructions for Client</label>
                    <textarea
                        rows={2}
                        value={config.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        onBlur={() => handleSave()}
                        placeholder="Please examine attached agreement and confirm acceptance..."
                        disabled={disabled}
                        className={styles['doc-review-card__input']}
                    />
                </div>

                {/* Configuration Toggles */}
                <div className={styles['doc-review-card__toggle-row']}>
                    <div>
                        <p className={styles['doc-review-card__toggle-label']}>Requires Client Approval</p>
                        <p className={styles['doc-review-card__toggle-subtext']}>Client must explicitly approve to pass step</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={config.requiresApproval}
                        onChange={(e) => {
                            const newCfg = handleChange('requiresApproval', e.target.checked);
                            handleSave(newCfg);
                        }}
                        disabled={disabled}
                        className={styles['doc-review-card__toggle-input']}
                    />
                </div>

                <div className={styles['doc-review-card__toggle-row']}>
                    <div>
                        <p className={styles['doc-review-card__toggle-label']}>Allow Feedback & Objections</p>
                        <p className={styles['doc-review-card__toggle-subtext']}>Client can submit notes if requesting changes</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={config.allowComments}
                        onChange={(e) => {
                            const newCfg = handleChange('allowComments', e.target.checked);
                            handleSave(newCfg);
                        }}
                        disabled={disabled}
                        className={styles['doc-review-card__toggle-input']}
                    />
                </div>

                {/* Custom Document Toggle */}
                <div className={styles['doc-review-card__toggle-row']}>
                    <div>
                        <p className={styles['doc-review-card__toggle-label']}>Custom Document per Client</p>
                        <p className={styles['doc-review-card__toggle-subtext']}>Each subscribed client will require a unique document uploaded specifically for them</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={config.customDocumentPerUser || false}
                        onChange={(e) => {
                            const newCfg = handleChange('customDocumentPerUser', e.target.checked);
                            handleSave(newCfg);
                        }}
                        disabled={disabled}
                        className={styles['doc-review-card__toggle-input']}
                    />
                </div>

                {/* Explanatory Waiting Message for Client (only visible when customDocumentPerUser is true) */}
                {config.customDocumentPerUser && (
                    <div className={styles['doc-review-card__field']}>
                        <label className={styles['doc-review-card__label']}>
                            Mensaje de Espera para el Cliente
                        </label>
                        <textarea
                            rows={3}
                            value={config.waitingExplanationMessage ?? ''}
                            onChange={(e) => handleChange('waitingExplanationMessage', e.target.value)}
                            onBlur={() => handleSave()}
                            placeholder="El proveedor está fabricando el documento que se requiere aprobar. Te notificaremos en cuanto esté disponible para su revisión."
                            disabled={disabled}
                            className={styles['doc-review-card__input']}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                            Este texto se mostrará al cliente mientras el documento personalizado está siendo elaborado por el proveedor.
                        </p>
                    </div>
                )}
            </div>

            {/* Document Preview Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={config.documentTitle || 'Document Preview'}
                size='lg'
            >
                <div className="h-[550px] w-full flex items-center justify-center bg-slate-900 rounded-lg overflow-hidden">
                    {isLoadingPreview ? (
                        <div className="flex flex-col items-center text-slate-400 gap-2">
                            <Icon name="sync" className="animate-spin text-2xl text-blue-500" />
                            <p className="text-xs">Loading document...</p>
                        </div>
                    ) : previewUrl ? (
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-none"
                            title="Document Preview"
                        />
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="error_outline" className="text-3xl text-red-500 mb-2" />
                            <p className="text-xs">Failed to load preview</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
