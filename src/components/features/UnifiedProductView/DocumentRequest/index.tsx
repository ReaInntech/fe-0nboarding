'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Button from '../../../shared/atoms/Button';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface DocumentRequestProps {
    id?: string;
    subscriptionId?: string;
    documentTitle?: string;
    title?: string;
    instructions?: string;
    content?: string;
    allowedFormats?: string[];
    status?: 'pending' | 'uploaded' | 'approved' | 'rejected' | 'processing';
    uploadDate?: string;
    data?: any;
    feedbackNotes?: string;
    onUpload?: () => void;
    className?: string;
}

export default function DocumentRequest({
    id,
    subscriptionId,
    documentTitle,
    title,
    instructions,
    content,
    allowedFormats = ['pdf', 'png', 'jpg'],
    status = 'pending',
    uploadDate,
    data,
    feedbackNotes,
    onUpload,
    className = ''
}: DocumentRequestProps) {
    const { user } = useApp();
    const { uploadFile, isUploading } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial document state from data
    const initialDoc = (data?.fileKey || data?.fileUrl || data?.fileName) ? {
        fileKey: data.fileKey || data.fileUrl || '',
        fileName: data.fileName || (data.fileKey ? data.fileKey.split('/').pop() : 'Documento.pdf'),
        uploadedAt: data.uploadedAt || uploadDate,
    } : null;

    const [uploadedDoc, setUploadedDoc] = useState<{
        fileKey: string;
        fileName: string;
        uploadedAt?: string;
    } | null>(initialDoc);

    const [currentStatus, setCurrentStatus] = useState<string>(status);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Viewer modal state
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerTitle, setViewerTitle] = useState('Document Preview');
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [isLoadingViewer, setIsLoadingViewer] = useState(false);
    const [viewerError, setViewerError] = useState<string | null>(null);

    useEffect(() => {
        if (status) {
            setCurrentStatus(status);
        }
        if (data?.fileKey || data?.fileUrl || data?.fileName) {
            setUploadedDoc({
                fileKey: data.fileKey || data.fileUrl || '',
                fileName: data.fileName || (data.fileKey ? data.fileKey.split('/').pop() : 'Documento.pdf'),
                uploadedAt: data.uploadedAt || uploadDate,
            });
        }
    }, [status, data, uploadDate]);

    // Format helpers
    const normalizedFormats = (allowedFormats && allowedFormats.length > 0 ? allowedFormats : ['pdf', 'png', 'jpg'])
        .map(f => f.toLowerCase().replace(/^\./, '').trim())
        .filter(Boolean);

    const acceptAttr = normalizedFormats.map(f => `.${f}`).join(',');

    const displayTitle = documentTitle || title || 'Document Request';
    const displayInstructions = instructions || content || 'Por favor sube el documento solicitado a continuación.';
    const displayFeedbackNotes = feedbackNotes || data?.feedbackNotes;

    const isApproved = currentStatus === 'approved';
    const isRejected = currentStatus === 'rejected';
    const isUploaded = Boolean(uploadedDoc) || currentStatus === 'uploaded' || currentStatus === 'processing' || isApproved;
    const isUnderReview = isUploaded && !isApproved && !isRejected;

    const formattedUploadDate = uploadedDoc?.uploadedAt
        ? new Date(uploadedDoc.uploadedAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : uploadDate;

    // Helper to fetch download URL from Core API
    const fetchDownloadUrl = async (key: string): Promise<string> => {
        const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
        if (!freshToken) throw new Error('No authentication token available');

        const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
        const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${freshToken}` },
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to get file URL');
        }

        const body = await response.json();
        return body.data?.url || body.url;
    };

    const handleViewDocument = async () => {
        if (!uploadedDoc?.fileKey) return;
        setViewerError(null);
        setViewerTitle(uploadedDoc.fileName || displayTitle);
        setIsViewerOpen(true);
        setIsLoadingViewer(true);

        try {
            const url = await fetchDownloadUrl(uploadedDoc.fileKey);
            setViewerUrl(url);
        } catch (err: any) {
            console.error('Failed to load document preview:', err);
            setViewerError(err.message || 'Could not load document preview');
        } finally {
            setIsLoadingViewer(false);
        }
    };

    // File selection & upload
    const handleFileSelect = async (file: File) => {
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (normalizedFormats.length > 0 && !normalizedFormats.includes(ext)) {
            setValidationError(
                `Formato de archivo no válido (.${ext}). Los formatos permitidos son: ${normalizedFormats.map(f => f.toUpperCase()).join(', ')}`
            );
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setValidationError(null);
        setIsSubmitting(true);

        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            if (!freshToken) throw new Error('No se encontró sesión activa');
            const orgId = user?.org_id || user?.organization?.id;

            // 1. Upload to DigitalOcean Spaces via Core API S3 presigned URL
            const uploadedKey = await uploadFile(file, 'documents', freshToken, orgId);

            // 2. Persist in Core API resolved request
            const nowIso = new Date().toISOString();
            if (subscriptionId && id) {
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const res = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/resolved-requests/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${freshToken}`,
                        ...(orgId ? { 'x-org-id': orgId } : {}),
                    },
                    body: JSON.stringify({
                        status: 'pending',
                        data: {
                            fileKey: uploadedKey,
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            uploadedAt: nowIso,
                            status: 'pending',
                            clientStatus: 'processing',
                            providerStatus: null,
                            feedbackNotes: null,
                        },
                    }),
                });

                if (!res.ok) {
                    console.warn('Backend update failed, maintaining local state');
                }
            }

            // 3. Update local state
            setUploadedDoc({
                fileKey: uploadedKey,
                fileName: file.name,
                uploadedAt: nowIso,
            });
            setCurrentStatus('processing');

            if (onUpload) {
                onUpload();
            }
        } catch (err: any) {
            console.error('Failed to upload document:', err);
            setValidationError(err.message || 'Error al subir el documento. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isApproved && !isSubmitting && !isUploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (isApproved || isSubmitting || isUploading) return;
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleTriggerClick = () => {
        if (isApproved || isSubmitting || isUploading) return;
        fileInputRef.current?.click();
    };

    return (
        <div className={`${styles['document-request']} ${className}`}>
            <div className={styles['document-request__header']}>
                <h3 className={styles['document-request__title-box']}>
                    <Icon 
                        name="description" 
                        className={isApproved ? 'text-emerald-500' : isRejected ? 'text-red-500' : isUnderReview ? 'text-blue-500' : 'text-amber-500'} 
                    /> 
                    Document Request
                </h3>
                {isApproved && <Badge variant="success">Approved</Badge>}
                {isUnderReview && <Badge variant="primary">Under Review</Badge>}
                {isRejected && <Badge variant="warning">Rejected</Badge>}
                {!isUploaded && !isRejected && <Badge variant="warning">Action Required</Badge>}
            </div>

            <div className={styles['document-request__content']}>
                <div className={styles['document-request__layout']}>
                    <div className={styles['document-request__info']}>
                        <div>
                            <h4 className={styles['document-request__doc-title']}>{displayTitle}</h4>
                            <p className={styles['document-request__instructions']}>{displayInstructions}</p>
                        </div>

                        <div className={styles['document-request__formats-row']}>
                            <span className={styles['document-request__formats-label']}>Accepted Formats:</span>
                            <div className={styles['document-request__formats-list']}>
                                {normalizedFormats.map(ext => (
                                    <span key={ext} className={styles['document-request__format-tag']}>
                                        .{ext.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Validation Error Banner */}
                        {validationError && (
                            <div className={`${styles['document-request__status-box']} ${styles['document-request__status-box--warning']}`}>
                                <Icon name="warning" className="text-amber-500 text-lg flex-shrink-0" />
                                <div className={styles['document-request__status-text-box']}>
                                    <p className={styles['document-request__status-title']}>Formato No Válido</p>
                                    <p className={styles['document-request__status-subtext']}>{validationError}</p>
                                </div>
                            </div>
                        )}

                        {/* Uploaded / Approved Status Box */}
                        {isUploaded && !isRejected && (
                            <div className={`${styles['document-request__status-box']} ${styles['document-request__status-box--success']}`}>
                                <Icon name="check_circle" className="text-emerald-500 text-lg flex-shrink-0" />
                                <div className={styles['document-request__status-text-box']}>
                                    <p className={styles['document-request__status-title']}>
                                        {isApproved ? 'Documento Aprobado' : 'Documento Subido Correctamente'}
                                    </p>
                                    <p className={styles['document-request__status-subtext']}>
                                        {uploadedDoc?.fileName || 'Documento adjunto'}
                                        {formattedUploadDate && ` • Subido el ${formattedUploadDate}`}
                                    </p>
                                    {uploadedDoc?.fileKey && (
                                        <button 
                                            type="button" 
                                            className={styles['document-request__view-btn']}
                                            onClick={handleViewDocument}
                                        >
                                            <Icon name="visibility" className="text-sm" /> Ver documento
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rejected Status Box */}
                        {isRejected && (
                            <div className={`${styles['document-request__status-box']} ${styles['document-request__status-box--error']}`}>
                                <Icon name="error" className="text-red-500 text-lg flex-shrink-0" />
                                <div className={styles['document-request__status-text-box']}>
                                    <p className={styles['document-request__status-title']}>Documento Rechazado</p>
                                    <p className={styles['document-request__status-subtext']}>
                                        {displayFeedbackNotes 
                                            ? `Observaciones del proveedor: "${displayFeedbackNotes}"`
                                            : 'Por favor revisa las instrucciones y sube un reemplazo.'}
                                    </p>
                                    {uploadedDoc?.fileKey && (
                                        <button 
                                            type="button" 
                                            className={styles['document-request__view-btn']}
                                            onClick={handleViewDocument}
                                        >
                                            <Icon name="visibility" className="text-sm" /> Ver documento rechazado
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles['document-request__upload-section']}>
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleInputChange}
                            accept={acceptAttr}
                            className="hidden"
                            disabled={isApproved || isSubmitting || isUploading}
                        />

                        {!isApproved && (
                            <div 
                                className={`${styles['document-request__dropzone']} ${
                                    isDragging ? styles['document-request__dropzone--dragging'] : ''
                                } ${isSubmitting || isUploading ? styles['document-request__dropzone--disabled'] : ''}`} 
                                onClick={handleTriggerClick}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className={styles['document-request__upload-icon-box']}>
                                    {isSubmitting || isUploading ? (
                                        <Icon name="progress_activity" className="animate-spin text-[#1978e5]" />
                                    ) : (
                                        <Icon name="upload_file" />
                                    )}
                                </div>
                                <span className={styles['document-request__upload-label']}>
                                    {isSubmitting || isUploading 
                                        ? 'Subiendo documento...' 
                                        : isUploaded || isRejected 
                                            ? 'Subir Reemplazo' 
                                            : 'Explorar Archivos'}
                                </span>
                                <span className={styles['document-request__upload-hint']}>
                                    {isSubmitting || isUploading 
                                        ? 'Por favor espera' 
                                        : 'o arrastra y suelta aquí'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <Modal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                title={viewerTitle}
                size="lg"
                footer={
                    viewerUrl ? (
                        <div className="flex justify-end gap-3 w-full">
                            <a
                                href={viewerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1978e5] text-white text-xs font-semibold hover:bg-[#1567c5] transition-colors"
                            >
                                <Icon name="download" className="text-sm" /> Descargar Archivo
                            </a>
                            <Button variant="secondary" size="sm" onClick={() => setIsViewerOpen(false)}>
                                Cerrar
                            </Button>
                        </div>
                    ) : undefined
                }
            >
                <div className="h-[520px] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    {isLoadingViewer ? (
                        <div className="flex flex-col items-center gap-3">
                            <Icon name="progress_activity" className="animate-spin text-3xl text-blue-500" />
                            <p className="text-sm text-slate-500">Cargando vista previa...</p>
                        </div>
                    ) : viewerUrl ? (
                        <iframe
                            src={viewerUrl}
                            className="w-full h-full border-none"
                            title={viewerTitle}
                        />
                    ) : viewerError ? (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="error_outline" className="text-4xl text-red-500 mb-2" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">No se pudo cargar la vista previa</p>
                            <p className="text-sm text-slate-400 mt-1">{viewerError}</p>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="description" className="text-5xl text-blue-500 mb-3" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{viewerTitle}</p>
                            <p className="text-sm text-slate-400 mt-1">No hay documento disponible.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
