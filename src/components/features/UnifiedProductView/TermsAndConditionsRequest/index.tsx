'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import styles from './index.module.scss';

export interface TermsCheckbox {
    id: string | number;
    text: string;
}

export interface TermsAndConditionsRequestProps {
    id?: string;
    subscriptionId?: string;
    documentTitle?: string;
    title?: string;
    content?: string;
    checkboxes?: TermsCheckbox[];
    status?: 'pending' | 'accepted' | 'approved';
    templateFile?: string | null;
    acceptDate?: string;
    data?: any;
    onAccept?: () => void;
    onUpload?: () => void;
    className?: string;
}

export default function TermsAndConditionsRequest({
    id,
    subscriptionId,
    documentTitle,
    title,
    content,
    checkboxes = [],
    status = 'pending',
    templateFile,
    acceptDate,
    data,
    onAccept,
    onUpload,
    className = ''
}: TermsAndConditionsRequestProps) {
    const { user } = useApp();

    const displayTitle = documentTitle || title || 'Términos y Condiciones';
    const displayCheckboxes: TermsCheckbox[] = (checkboxes && checkboxes.length > 0)
        ? checkboxes
        : (data?.checkboxes && Array.isArray(data.checkboxes) ? data.checkboxes : []);

    const isInitialAccepted = status === 'accepted' || status === 'approved' || Boolean(data?.acceptedAt || data?.status === 'approved' || data?.status === 'accepted');

    const [currentStatus, setCurrentStatus] = useState<string>(isInitialAccepted ? 'accepted' : status);
    const [currentAcceptDate, setCurrentAcceptDate] = useState<string | undefined>(
        acceptDate || (data?.acceptedAt ? new Date(data.acceptedAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) : undefined)
    );

    // Document Viewer state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Track which checkboxes are checked
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
        (displayCheckboxes || []).reduce((acc, cb) => ({
            ...acc,
            [cb.id.toString()]: isInitialAccepted,
        }), {})
    );

    const isAccepted = currentStatus === 'accepted' || currentStatus === 'approved';
    const allChecked = displayCheckboxes.length > 0
        ? displayCheckboxes.every(cb => checkedState[cb.id.toString()])
        : true;

    // Synchronize props when refreshed or updated
    useEffect(() => {
        if (status) {
            setCurrentStatus(status);
        }
        if (acceptDate || data?.acceptedAt) {
            setCurrentAcceptDate(
                acceptDate || (data?.acceptedAt ? new Date(data.acceptedAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) : undefined)
            );
        }
    }, [status, acceptDate, data]);

    // Automatically load the document preview if templateFile is present
    useEffect(() => {
        let isMounted = true;
        if (!templateFile) return;

        const loadPreviewUrl = async () => {
            setIsLoadingPreview(true);
            setPreviewError(null);
            try {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                if (!freshToken) throw new Error("No authentication token available");

                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(templateFile)}`, {
                    headers: { Authorization: `Bearer ${freshToken}` }
                });

                if (response.ok) {
                    const body = await response.json();
                    const url = body.data?.url || body.url;
                    if (isMounted) setPreviewUrl(url);
                } else {
                    throw new Error("Failed to get preview URL");
                }
            } catch (error: any) {
                console.error("Preview failed:", error);
                if (isMounted) setPreviewError("No se pudo cargar la vista previa del documento.");
            } finally {
                if (isMounted) setIsLoadingPreview(false);
            }
        };

        loadPreviewUrl();
        return () => { isMounted = false; };
    }, [templateFile, user?.accessToken]);

    const handleCheckboxChange = (cbId: string) => {
        if (isAccepted) return;
        setCheckedState(prev => ({ ...prev, [cbId]: !prev[cbId] }));
    };

    const handleAccept = async () => {
        if (!allChecked || isAccepted || isSubmitting) return;

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const nowIso = new Date().toISOString();
            if (subscriptionId && id) {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                if (!freshToken) throw new Error('No se encontró sesión activa');
                const orgId = user?.org_id || user?.organization?.id;
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

                const res = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/resolved-requests/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${freshToken}`,
                        ...(orgId ? { 'x-org-id': orgId } : {}),
                    },
                    body: JSON.stringify({
                        status: 'approved',
                        data: {
                            status: 'approved',
                            clientStatus: 'approved',
                            acceptedAt: nowIso,
                            acceptedClauses: displayCheckboxes.map(cb => cb.text),
                            checkedBoxIds: Object.keys(checkedState).filter(k => checkedState[k]),
                        },
                    }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Error al aceptar los términos y condiciones');
                }
            }

            setCurrentStatus('accepted');
            setCurrentAcceptDate(new Date().toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }));

            if (onAccept) {
                onAccept();
            }
            if (onUpload) {
                onUpload();
            }
        } catch (err: any) {
            console.error('Failed to accept terms:', err);
            setSubmitError(err.message || 'Error al aceptar los términos. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${styles['terms-request']} ${className}`}>
            <div className={styles['terms-request__header']}>
                <div className="flex items-center gap-2">
                    <h3 className={styles['terms-request__title-box']}>
                        <Icon 
                            name={isAccepted ? "verified" : "gavel"} 
                            className={isAccepted ? "text-emerald-500" : "text-emerald-600"} 
                        /> 
                        Terms & Conditions
                    </h3>
                    {templateFile && previewUrl && (
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
                        >
                            <Icon name="picture_as_pdf" style={{ fontSize: 10 }} /> Ver PDF Completo
                        </button>
                    )}
                </div>
                {isAccepted ? (
                    <Badge variant="success">Accepted</Badge>
                ) : (
                    <Badge variant="warning">Action Required</Badge>
                )}
            </div>

            <div className={styles['terms-request__content']}>
                <div className={styles['terms-request__info']}>
                    <h4 className={styles['terms-request__doc-title']}>{displayTitle}</h4>
                </div>

                {submitError && (
                    <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                        <Icon name="error_outline" className="text-base flex-shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                {/* Embedded Document Viewer (Iframe or Prose Reader) */}
                {templateFile ? (
                    <div className={styles['terms-request__document-container']}>
                        <div className={styles['terms-request__document-header']}>
                            <div className="flex items-center gap-1.5">
                                <Icon name="description" className="text-emerald-500 text-sm" />
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Documento Legal Adjunto
                                </span>
                            </div>
                            {previewUrl && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    >
                                        <Icon name="fullscreen" style={{ fontSize: 13 }} /> Pantalla Completa
                                    </button>
                                    <a
                                        href={previewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                                    >
                                        <Icon name="open_in_new" style={{ fontSize: 13 }} /> Abrir
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className={styles['terms-request__iframe-box']}>
                            {isLoadingPreview ? (
                                <div className={styles['terms-request__iframe-loading']}>
                                    <div className="size-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-3" />
                                    <p className="text-xs text-slate-500">Cargando documento de términos y condiciones...</p>
                                </div>
                            ) : previewUrl ? (
                                <iframe
                                    src={previewUrl}
                                    className={styles['terms-request__iframe']}
                                    title={displayTitle}
                                />
                            ) : previewError ? (
                                <div className={styles['terms-request__iframe-error']}>
                                    <Icon name="error_outline" className="text-2xl text-amber-500 mb-1" />
                                    <p className="text-xs text-slate-500 mb-2">{previewError}</p>
                                    {content && (
                                        <div className={styles['terms-request__prose']}>
                                            {content}
                                        </div>
                                    )}
                                </div>
                            ) : content ? (
                                <div className={styles['terms-request__prose-container']}>
                                    <div className={styles['terms-request__prose']}>{content}</div>
                                </div>
                            ) : (
                                <div className={styles['terms-request__iframe-empty']}>
                                    <Icon name="description" className="text-2xl text-slate-400 mb-1" />
                                    <p className="text-xs text-slate-400">Documento no disponible.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles['terms-request__reader']}>
                        <div className={styles['terms-request__prose']}>
                            {content || 'Por favor lea y acepte los términos y condiciones antes de continuar.'}
                        </div>
                    </div>
                )}

                {isAccepted ? (
                    <div>
                        <div className={styles['terms-request__accepted-view']}>
                            <div className={styles['terms-request__accepted-info']}>
                                <Icon name="verified" className="text-emerald-500 text-2xl flex-shrink-0" />
                                <div>
                                    <h5 className={styles['terms-request__accepted-title']}>Términos Aceptados</h5>
                                    <p className={styles['terms-request__accepted-subtext']}>
                                        Has aceptado todos los términos y condiciones del servicio.
                                    </p>
                                </div>
                            </div>
                            {currentAcceptDate && (
                                <div className={styles['terms-request__accepted-date']}>
                                    Aceptado el {currentAcceptDate}
                                </div>
                            )}
                        </div>

                        {displayCheckboxes.length > 0 && (
                            <div className={styles['terms-request__accepted-clauses']}>
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2.5">
                                    Cláusulas confirmadas:
                                </p>
                                <div className="space-y-2">
                                    {displayCheckboxes.map(cb => (
                                        <div key={cb.id} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                            <Icon name="check_circle" className="text-emerald-500 text-sm mt-0.5 flex-shrink-0" />
                                            <span>{cb.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className={styles['terms-request__checkboxes-list']}>
                            {displayCheckboxes.map(cb => {
                                const isChecked = Boolean(checkedState[cb.id.toString()]);
                                const customCheckboxClass = `${styles['terms-request__checkbox-custom']} ${
                                    isChecked ? styles['terms-request__checkbox-custom--checked'] : ''
                                }`;

                                return (
                                    <label key={cb.id} className={styles['terms-request__checkbox-label']}>
                                        <div className={styles['terms-request__checkbox-input-box']}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(cb.id.toString())}
                                                className="hidden"
                                                disabled={isSubmitting}
                                            />
                                            <div className={customCheckboxClass}>
                                                {isChecked && (
                                                    <Icon 
                                                        name="check" 
                                                        style={{ fontSize: 14, color: 'white' }} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className={styles['terms-request__checkbox-text']}>
                                            {cb.text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className={styles['terms-request__footer']}>
                            <Button
                                variant={allChecked ? "primary" : "secondary"}
                                className={styles['terms-request__accept-btn']}
                                onClick={handleAccept}
                                disabled={!allChecked || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon name="progress_activity" className="text-sm mr-2 animate-spin" />
                                        Aceptando términos...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="task_alt" className="text-sm mr-2" />
                                        Aceptar Términos
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={displayTitle || "Términos y Condiciones (PDF)"}
                size="lg"
            >
                <div className="bg-surface rounded-xl overflow-hidden w-full h-[65vh] flex justify-center items-center">
                    {isLoadingPreview ? (
                        <div className="flex flex-col items-center text-slate-400">
                            <div className="size-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                            <p className="text-sm">Abriendo documento...</p>
                        </div>
                    ) : previewUrl ? (
                        <iframe 
                            src={previewUrl} 
                            className="w-full h-full border-0" 
                            title="PDF Preview"
                        />
                    ) : (
                        <p className="text-rose-400">No se pudo cargar la vista previa del documento.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
}
