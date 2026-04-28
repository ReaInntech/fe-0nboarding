'use client';

import React, { useState, useRef } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface PaymentItem {
    id: number;
    description: string;
    price: number;
}

export interface RequestPaymentConfig {
    bank: string;
    accountNumber: string;
    nit: string;
    dueDate: string;
    amount: number;
    isItemized: boolean;
    items: PaymentItem[];
    useProductValue: boolean;
    instructions: string;
    certificateFile: string | null;
}

export interface RequestPaymentCardProps {
    id: string;
    title: string;
    description?: string;
    initialConfig?: RequestPaymentConfig;
    onDelete?: () => void;
    onSave?: (config: RequestPaymentConfig) => Promise<void>;
}

export default function RequestPaymentCard({
    id,
    title,
    description,
    initialConfig,
    onDelete,
    onSave
}: RequestPaymentCardProps) {
    const [config, setConfig] = useState<RequestPaymentConfig>(initialConfig || {
        bank: '',
        accountNumber: '',
        nit: '',
        dueDate: '',
        amount: 0,
        isItemized: false,
        items: [],
        useProductValue: false,
        instructions: description || '',
        certificateFile: null,
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

    // Helpers for currency formatting
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(val);
    };

    const parseCurrency = (val: string) => {
        return Number(val.replace(/[^0-9.-]+/g, '')) || 0;
    };

    const isFormValid = 
        config.bank.trim() !== '' &&
        config.accountNumber.trim() !== '' &&
        config.amount > 0;

    const handleChange = (field: keyof RequestPaymentConfig, value: any) => {
        setConfig(prev => {
            const newConfig = { ...prev, [field]: value };
            if (field === 'isItemized' && value === true) newConfig.useProductValue = false;
            if (field === 'useProductValue' && value === true) newConfig.isItemized = false;
            return newConfig;
        });
    };

    const handleSave = async (configToSave = config) => {
        if (!onSave || !isFormValid) return;
        setIsSaving(true);
        try {
            await onSave(configToSave);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save payment request:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error("No authentication token available");

            const uploadedKey = await uploadFile(file, 'documents', freshToken);
            
            const newConfig = { ...config, certificateFile: uploadedKey };
            setConfig(newConfig);
            // Ignore form validation for file upload save to ensure it persists
            if (onSave) {
                await onSave(newConfig);
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Falló la subida del documento. Inténtalo más tarde.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleViewDocument = async () => {
        if (!config.certificateFile || !user) return;
        
        setIsLoadingPreview(true);
        setIsModalOpen(true);
        setPreviewUrl(null);

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error("No authentication token available");

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(config.certificateFile)}`, {
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
            alert(`Error al abrir el documento: ${error.message}`);
            setIsModalOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const addItem = () => {
        const newItems = [...config.items, { id: Date.now(), description: '', price: 0 }];
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total, isItemized: true, useProductValue: false };
        setConfig(newConfig);
    };

    const updateItem = (id: number, field: keyof PaymentItem, value: any) => {
        const newItems = config.items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total };
        setConfig(newConfig);
    };

    const removeItem = (id: number) => {
        const newItems = config.items.filter(item => item.id !== id);
        const total = newItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const newConfig = { ...config, items: newItems, amount: total };
        setConfig(newConfig);
    };

    return (
        <>
        <div className={styles['payment-card']}>
            {/* Header */}
            <div className={styles['payment-card__header']}>
                <div className={styles['payment-card__title-box']}>
                    <div className={styles['payment-card__icon-wrapper']}>
                        <Icon name="payments" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['payment-card__title']}>{title}</span>
                </div>
                <div className={styles['payment-card__actions']}>
                    {showSuccess && (
                        <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] font-bold animate-in fade-in zoom-in duration-300">
                            <Icon name="check_circle" className="mr-1.5 text-xs" /> Saved
                        </div>
                    )}

                    <button 
                        type="button" 
                        onClick={() => handleSave(config)}
                        disabled={isSaving || !isFormValid}
                        className={`${isSaving || !isFormValid ? 'opacity-50 cursor-not-allowed' : ''} ${showSuccess ? 'hidden' : ''} ${styles['save-btn']}`}
                        title={!isFormValid ? "Fill required fields to save" : "Save changes"}
                    >
                        {isSaving ? (
                            <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" style={{ fontSize: 14 }} className={isFormValid ? "text-blue-500" : "text-slate-600"} />
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

            <div className={styles['payment-card__body']}>
                {/* Bank Certificate Upload */}
                <div 
                    className={`${styles['payment-card__upload-zone']} ${!isFormValid || isUploading ? 'opacity-50 pointer-events-none' : ''} ${config.certificateFile ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}
                    onClick={() => isFormValid && !isUploading && !config.certificateFile && fileInputRef.current?.click()}
                    style={{ cursor: (isFormValid && !isUploading && !config.certificateFile) ? 'pointer' : 'default' }}
                    title={!isFormValid ? "Complete required fields first" : ""}
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
                            <p className={styles['payment-card__upload-zone-text']}>Subiendo Documento...</p>
                        </>
                    ) : config.certificateFile ? (
                        <>
                            <div className={`${styles['payment-card__upload-zone-icon']} text-emerald-400 bg-emerald-400/10`}>
                                <Icon name="task" style={{ fontSize: 16 }} />
                            </div>
                            <p className="text-emerald-400 text-sm font-semibold mt-2">Certificado Subido</p>
                            
                            <div className="mt-3 flex gap-2 justify-center">
                                <button 
                                    type="button" 
                                    className="text-xs font-semibold text-primary hover:underline px-3 py-1 flex items-center justify-center gap-1 bg-primary/10 rounded-full"
                                    onClick={(e) => { e.stopPropagation(); handleViewDocument(); }}
                                >
                                    <Icon name="visibility" style={{ fontSize: 12 }} /> Ver Certificado
                                </button>
                                <button 
                                    type="button" 
                                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 flex items-center justify-center gap-1 rounded-full border border-rose-500/20"
                                    onClick={async (e) => { 
                                        e.stopPropagation(); 
                                        const newConfig = { ...config, certificateFile: null };
                                        setConfig(newConfig);
                                        await handleSave(newConfig);
                                    }}
                                >
                                    Reemplazar
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles['payment-card__upload-zone-icon']}>
                                <Icon name="upload_file" style={{ fontSize: 16 }} />
                            </div>
                            <p className={styles['payment-card__upload-zone-text']}>Upload Bank Certificate</p>
                            <p className={styles['payment-card__upload-zone-subtext']}>Required for payment verification</p>
                            {!isFormValid && (
                                <p className="text-[10px] text-blue-500 mt-2 font-medium bg-blue-500/10 px-2 py-1 rounded">
                                    Requires Bank, Account and Amount
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Instructions */}
                <div className={styles['payment-card__field-group']}>
                    <label className={styles['payment-card__label']}>Instructions</label>
                    <textarea
                        value={config.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Specific directions for this payment..."
                        rows={2}
                        className={styles['payment-card__textarea']}
                    />
                </div>

                {/* Account Details */}
                <div className={styles['payment-card__field-group--row']}>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Bank Name</label>
                        <input
                            type="text"
                            value={config.bank}
                            onChange={(e) => handleChange('bank', e.target.value)}
                            placeholder="e.g. Bank of America"
                            className={styles['payment-card__input']}
                        />
                    </div>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Account Number</label>
                        <input
                            type="text"
                            value={config.accountNumber}
                            onChange={(e) => handleChange('accountNumber', e.target.value)}
                            placeholder="0000-0000"
                            className={styles['payment-card__input']}
                        />
                    </div>
                </div>

                <div className={styles['payment-card__field-group--row']}>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Tax ID (NIT)</label>
                        <input
                            type="text"
                            value={config.nit}
                            onChange={(e) => handleChange('nit', e.target.value)}
                            placeholder="000.000.000-0"
                            className={styles['payment-card__input']}
                        />
                    </div>
                    <div className={styles['payment-card__field-group']}>
                        <label className={styles['payment-card__label']}>Due Date</label>
                        <input
                            type="date"
                            value={config.dueDate}
                            onChange={(e) => handleChange('dueDate', e.target.value)}
                            className={styles['payment-card__input']}
                        />
                    </div>
                </div>

                {/* Options Switches */}
                <div className={styles['payment-card__options-row']}>
                    <label className={styles['payment-card__option-label']}>
                        <input
                            type="checkbox"
                            checked={config.isItemized}
                            onChange={(e) => handleChange('isItemized', e.target.checked)}
                            className="hidden"
                        />
                        <div className={`${styles['payment-card__checkbox-custom']} ${config.isItemized ? styles['payment-card__checkbox-custom--checked'] : styles['payment-card__checkbox-custom--idle']}`}>
                            {config.isItemized && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                        </div>
                        <span className={`${styles['payment-card__option-text']} ${config.isItemized ? styles['payment-card__option-text--active'] : styles['payment-card__option-text--idle']}`}>
                            Itemized Details
                        </span>
                    </label>

                    <label className={styles['payment-card__option-label']}>
                        <input
                            type="checkbox"
                            checked={config.useProductValue}
                            onChange={(e) => handleChange('useProductValue', e.target.checked)}
                            className="hidden"
                        />
                        <div className={`${styles['payment-card__checkbox-custom']} ${config.useProductValue ? styles['payment-card__checkbox-custom--checked'] : styles['payment-card__checkbox-custom--idle']}`}>
                            {config.useProductValue && <Icon name="check" style={{ fontSize: 10, color: 'white' }} />}
                        </div>
                        <span className={`${styles['payment-card__option-text']} ${config.useProductValue ? styles['payment-card__option-text--active'] : styles['payment-card__option-text--idle']}`}>
                            Sync with Product
                        </span>
                    </label>
                </div>

                {/* Amount */}
                <div className={styles['payment-card__field-group']}>
                    <div className={styles['payment-card__amount-header']}>
                        <label className={styles['payment-card__label']}>Total Amount</label>
                        {config.useProductValue && (
                            <div className={styles['payment-card__sync-badge']}>
                                <Icon name="sync" style={{ fontSize: 10 }} className="animate-spin" />
                                <span>Synced</span>
                            </div>
                        )}
                    </div>
                    <div className={styles['payment-card__input-wrapper']}>
                        <span className={styles['payment-card__prefix']}>$</span>
                        <input
                            type="text"
                            readOnly={config.isItemized || config.useProductValue}
                            value={formatCurrency(config.amount)}
                            onChange={(e) => handleChange('amount', parseCurrency(e.target.value))}
                            className={`${styles['payment-card__input']} ${styles['payment-card__input--with-prefix']} ${
                                (config.isItemized || config.useProductValue) ? styles['payment-card__input--readonly'] : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Itemized Detail Area */}
                {config.isItemized && (
                    <div className={styles['payment-card__itemized-area']}>
                        <div className={styles['payment-card__itemized-header']}>
                            <span>Breakdown</span>
                            <button
                                type="button"
                                onClick={addItem}
                                className={styles['payment-card__add-item-btn']}
                            >
                                <Icon name="add_circle" style={{ fontSize: 12 }} /> Add Item
                            </button>
                        </div>

                        <div className={styles['payment-card__items-list']}>
                            {config.items.map(item => (
                                <div key={item.id} className={styles['payment-card__item-row']}>
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        placeholder="Item detail..."
                                        className={styles['payment-card__item-desc']}
                                    />
                                    <div className={styles['payment-card__item-price-wrapper']}>
                                        <span className={styles['payment-card__prefix']}>$</span>
                                        <input
                                            type="text"
                                            value={formatCurrency(item.price)}
                                            onChange={(e) => updateItem(item.id, 'price', parseCurrency(e.target.value))}
                                            className={styles['payment-card__item-price']}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className={styles['payment-card__item-remove']}
                                    >
                                        <Icon name="remove_circle_outline" style={{ fontSize: 14 }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Visualización de Certificado"
                size="2xl"
            >
                <div className="bg-surface rounded-xl overflow-hidden w-full h-[65vh] flex justify-center items-center">
                    {isLoadingPreview ? (
                        <div className="flex flex-col items-center text-slate-400">
                            <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-sm">Abriendo documento seguro...</p>
                        </div>
                    ) : previewUrl ? (
                        <iframe 
                            src={previewUrl} 
                            className="w-full h-full border-0" 
                            title="Certificate Preview"
                        />
                    ) : (
                        <p className="text-rose-400">No se pudo cargar la vista previa del documento.</p>
                    )}
                </div>
            </Modal>
        </>
    );
}
