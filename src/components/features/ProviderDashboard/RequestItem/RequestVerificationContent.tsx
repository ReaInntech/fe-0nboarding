import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import { useApp } from '@/src/context/AppContext';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface VerificationPayload {
    type: 'form' | 'payment' | 'document' | 'terms';
    data: any;
}

interface RequestVerificationContentProps {
    payload: VerificationPayload;
}

function SecureFilePreview({ fileKey, altTitle }: { fileKey: string; altTitle: string }) {
    const { user } = useApp();
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPdf = fileKey.toLowerCase().endsWith('.pdf') || fileKey.includes('.pdf');

    useEffect(() => {
        let isMounted = true;
        if (!fileKey) return;

        if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
            setDownloadUrl(fileKey);
            return;
        }

        const resolveUrl = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                if (!freshToken) throw new Error('No authentication token available');
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const res = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(fileKey)}`, {
                    headers: { Authorization: `Bearer ${freshToken}` },
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Error cargando archivo');
                }
                const body = await res.json();
                const url = body.data?.url || body.url;
                if (isMounted) setDownloadUrl(url);
            } catch (err: any) {
                if (isMounted) setError(err.message || 'No se pudo cargar el archivo');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        resolveUrl();
        return () => { isMounted = false; };
    }, [fileKey, user?.accessToken]);

    if (isLoading) {
        return (
            <div className={styles['verification-pdf-placeholder']}>
                <Icon name="sync" className="text-3xl text-slate-400 animate-spin mb-2" />
                <span className="text-xs text-slate-400">Cargando vista previa...</span>
            </div>
        );
    }

    if (error || !downloadUrl) {
        return (
            <div className={styles['verification-pdf-placeholder']}>
                <Icon name="error_outline" className="text-3xl text-rose-500 mb-2" />
                <span className="text-xs text-slate-400">{error || 'Vista previa no disponible'}</span>
            </div>
        );
    }

    return (
        <div className={styles['verification-preview-box']}>
            {isPdf ? (
                <div className={styles['verification-pdf-placeholder']}>
                    <Icon name="picture_as_pdf" className="text-4xl text-rose-500 mb-2" />
                    <span className="text-sm font-medium">{altTitle || 'Documento PDF'}</span>
                    <button
                        type="button"
                        onClick={() => window.open(downloadUrl, '_blank')}
                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-1.5"
                    >
                        <Icon name="open_in_new" className="text-sm" />
                        <span>Abrir en nueva pestaña</span>
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <img src={downloadUrl} alt={altTitle || "Receipt"} className={styles['verification-image-preview']} />
                    <button
                        type="button"
                        onClick={() => window.open(downloadUrl, '_blank')}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs transition-colors flex items-center gap-1.5 text-slate-300"
                    >
                        <Icon name="open_in_new" className="text-xs" />
                        <span>Abrir imagen en pestaña nueva</span>
                    </button>
                </div>
            )}
        </div>
    );
}

export default function RequestVerificationContent({ payload }: RequestVerificationContentProps) {
    const { type, data } = payload;

    switch (type) {
        case 'form': {
            const fields: any[] = Array.isArray(data?.fields) ? data.fields : [];
            const responses: Record<string, any> = (data?.responses && typeof data.responses === 'object') ? data.responses : {};

            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Respuestas del Formulario</h4>
                        <div className={styles['verification-table']}>
                            {fields.length > 0 ? (
                                fields.map((field: any) => {
                                    const val = responses[field.id] ?? responses[String(field.id)] ?? responses[field.label];
                                    return (
                                        <div key={field.id} className={styles['verification-row']}>
                                            <span className={styles['verification-label']}>{field.label || `Campo ${field.id}`}</span>
                                            <span className={styles['verification-value']}>
                                                {val !== undefined && val !== null && String(val).trim() !== '' ? String(val) : 'N/A'}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : Object.keys(responses).length > 0 ? (
                                Object.entries(responses)
                                    .filter(([k]) => !['status', 'clientStatus', 'providerStatus', 'submittedAt', 'uploadedAt', 'feedbackNotes'].includes(k))
                                    .map(([key, val]) => (
                                        <div key={key} className={styles['verification-row']}>
                                            <span className={styles['verification-label']}>{key}</span>
                                            <span className={styles['verification-value']}>
                                                {val !== undefined && val !== null ? String(val) : 'N/A'}
                                            </span>
                                        </div>
                                    ))
                            ) : (
                                <div className="p-4 text-center text-slate-400 text-xs">
                                    No hay respuestas registradas para este formulario.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        case 'payment':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Detalles del Pago</h4>
                        <div className={styles['verification-table']}>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Cuenta / Referencia</span>
                                <span className={styles['verification-value']}>{data.invoiceNumber}</span>
                            </div>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Monto Total</span>
                                <span className={styles['verification-value']}>{data.amount}</span>
                            </div>
                            {data.fileName && (
                                <div className={styles['verification-row']}>
                                    <span className={styles['verification-label']}>Archivo Comprobante</span>
                                    <span className={styles['verification-value']}>{data.fileName}</span>
                                </div>
                            )}
                            {data.uploadDate && (
                                <div className={styles['verification-row']}>
                                    <span className={styles['verification-label']}>Fecha de Envío</span>
                                    <span className={styles['verification-value']}>{data.uploadDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {data.receiptUrl && (
                        <div className={styles['verification-section']}>
                            <h4 className={styles['verification-subtitle']}>Comprobante de Pago Subido</h4>
                            <SecureFilePreview fileKey={data.receiptUrl} altTitle={data.fileName || 'Comprobante de Pago'} />
                        </div>
                    )}
                </div>
            );

        case 'document':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Uploaded Document</h4>
                        <div className={styles['verification-table']}>
                            <div className={styles['verification-row']}>
                                <span className={styles['verification-label']}>Document Name</span>
                                <span className={styles['verification-value']}>{data.fileName}</span>
                            </div>
                            {data.uploadDate && (
                                <div className={styles['verification-row']}>
                                    <span className={styles['verification-label']}>Uploaded On</span>
                                    <span className={styles['verification-value']}>{data.uploadDate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {data.fileUrl && (
                        <div className={styles['verification-section']}>
                            <h4 className={styles['verification-subtitle']}>Document Preview</h4>
                            <SecureFilePreview fileKey={data.fileUrl} altTitle={data.fileName || 'Uploaded Document'} />
                        </div>
                    )}
                </div>
            );

        case 'terms':
            return (
                <div className="space-y-6">
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Agreement Summary</h4>
                        <div className={styles['verification-terms-summary']}>
                            <p className="text-sm italic opacity-70 mb-4">"User has agreed to the following terms and conditions by selecting the required checkboxes."</p>
                            <div className="space-y-2">
                                {data.acceptedClauses.map((clause: string, idx: number) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <Icon name="check_circle" className="text-emerald-500 mt-0.5 text-base" />
                                        <span>{clause}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className={styles['verification-section']}>
                        <h4 className={styles['verification-subtitle']}>Full Document Content</h4>
                        <div className={styles['verification-terms-content']}>
                            {data.content}
                        </div>
                    </div>
                </div>
            );

        default:
            return <div>Unsupported verification type.</div>;
    }
}
