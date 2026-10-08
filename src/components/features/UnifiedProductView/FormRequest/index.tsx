'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import styles from './index.module.scss';

export interface FormField {
    id: string | number;
    label: string;
    type: string;
    required: boolean;
}

export interface FormRequestProps {
    id?: string;
    subscriptionId?: string;
    formTitle?: string;
    title?: string;
    instructions?: string;
    content?: string;
    fields?: FormField[];
    status?: 'pending' | 'submitted' | 'approved';
    submitDate?: string;
    data?: any;
    onSubmit?: (data: Record<string, string>) => void;
    onUpload?: () => void;
    className?: string;
}

export default function FormRequest({
    id,
    subscriptionId,
    formTitle,
    title,
    instructions,
    content,
    fields,
    status = 'pending',
    submitDate,
    data,
    onSubmit,
    onUpload,
    className = ''
}: FormRequestProps) {
    const { user } = useApp();

    // Extract initial responses if already submitted
    const initialResponses: Record<string, string> = data?.responses || data?.formData || {};
    const [formData, setFormData] = useState<Record<string, string>>(initialResponses);
    const [currentStatus, setCurrentStatus] = useState<string>(status);
    const [currentSubmitDate, setCurrentSubmitDate] = useState<string | undefined>(
        submitDate || (data?.submittedAt ? new Date(data.submittedAt).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : undefined)
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (status) {
            setCurrentStatus(status);
        }
        if (data?.responses || data?.formData) {
            setFormData(data.responses || data.formData);
        }
        if (submitDate || data?.submittedAt) {
            setCurrentSubmitDate(
                submitDate || (data?.submittedAt ? new Date(data.submittedAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : undefined)
            );
        }
    }, [status, data, submitDate]);

    const displayTitle = formTitle || title || 'Form Request';
    const displayInstructions = instructions || content || 'Please complete the requested information below.';
    const displayFields: FormField[] = (fields && fields.length > 0)
        ? fields
        : (data?.fields && Array.isArray(data.fields) ? data.fields : []);

    const isSubmitted = currentStatus === 'submitted' || currentStatus === 'approved' || Boolean(data?.responses && Object.keys(data.responses).length > 0);
    const isApproved = currentStatus === 'approved' || isSubmitted;

    const handleInputChange = (id: string, value: string) => {
        if (isApproved) return;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);

        try {
            const nowIso = new Date().toISOString();
            if (subscriptionId && id) {
                const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
                if (!freshToken) throw new Error('No active session found');
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
                            responses: formData,
                            submittedAt: nowIso,
                            status: 'approved',
                            clientStatus: 'approved',
                        },
                    }),
                });

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || 'Failed to submit form');
                }
            }

            setCurrentStatus('approved');
            setCurrentSubmitDate(new Date(nowIso).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));

            if (onSubmit) {
                onSubmit(formData);
            }
            if (onUpload) {
                onUpload();
            }
        } catch (err: any) {
            console.error('Failed to submit form responses:', err);
            setSubmitError(err.message || 'Failed to submit responses. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${styles['form-request']} ${className}`}>
            <div className={styles['form-request__header']}>
                <h3 className={styles['form-request__title-box']}>
                    <Icon 
                        name={isApproved ? "assignment_turned_in" : "assignment"} 
                        className={isApproved ? "text-emerald-500" : styles['form-request__form-icon']} 
                    /> 
                    Form Request
                </h3>
                {isApproved ? (
                    <Badge variant="success">Approved</Badge>
                ) : (
                    <Badge variant="warning">Action Required</Badge>
                )}
            </div>

            <div className={styles['form-request__content']}>
                <div className={styles['form-request__info']}>
                    <h4 className={styles['form-request__form-title']}>{displayTitle}</h4>
                    <p className={styles['form-request__instructions']}>{displayInstructions}</p>
                </div>

                {submitError && (
                    <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                        <Icon name="error_outline" className="text-base flex-shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}

                {isSubmitted ? (
                    <div className={styles['form-request__submitted-view']}>
                        <div className={styles['form-request__submitted-header']}>
                            <Icon name="check_circle" className="text-emerald-500 text-xl flex-shrink-0" />
                            <div>
                                <h5 className={styles['form-request__submitted-title']}>Formulario Solventado</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Respuestas enviadas y registradas correctamente.
                                </p>
                            </div>
                            {currentSubmitDate && (
                                <span className={styles['form-request__submitted-date']}>
                                    Enviado el {currentSubmitDate}
                                </span>
                            )}
                        </div>
                        <div className={styles['form-request__responses-list']}>
                            {displayFields && displayFields.length > 0 ? (
                                displayFields.map(field => {
                                    const val = formData[field.id.toString()] ?? formData[field.id] ?? formData[field.label];
                                    return (
                                        <div key={field.id} className={styles['form-request__response-row']}>
                                            <span className={styles['form-request__response-label']}>{field.label}</span>
                                            <span className={styles['form-request__response-value']}>
                                                {val || <span className={styles['form-request__not-provided']}>No especificado</span>}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                Object.entries(formData)
                                    .filter(([k]) => !['status', 'clientStatus', 'providerStatus', 'submittedAt', 'uploadedAt', 'feedbackNotes'].includes(k))
                                    .map(([key, val]) => (
                                        <div key={key} className={styles['form-request__response-row']}>
                                            <span className={styles['form-request__response-label']}>{key}</span>
                                            <span className={styles['form-request__response-value']}>
                                                {String(val) || <span className={styles['form-request__not-provided']}>No especificado</span>}
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles['form-request__form-body']}>
                        {displayFields?.map(field => (
                            <div key={field.id} className={styles['form-request__field-group']}>
                                <label className={styles['form-request__field-label']}>
                                    {field.label}
                                    {field.required && <span className={styles['form-request__required-star']}>*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className={styles['form-request__textarea']}
                                        required={field.required}
                                        value={formData[field.id.toString()] || ''}
                                        onChange={(e) => handleInputChange(field.id.toString(), e.target.value)}
                                        placeholder={`Ingresa ${field.label.toLowerCase()}`}
                                        disabled={isSubmitting}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                                        className={styles['form-request__input']}
                                        required={field.required}
                                        value={formData[field.id.toString()] || ''}
                                        onChange={(e) => handleInputChange(field.id.toString(), e.target.value)}
                                        placeholder={`Ingresa ${field.label.toLowerCase()}`}
                                        disabled={isSubmitting}
                                    />
                                )}
                            </div>
                        ))}

                        <div className={styles['form-request__form-footer']}>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className={styles['form-request__submit-btn']}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Icon name="progress_activity" className="text-sm mr-2 animate-spin" />
                                        Enviando respuestas...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="send" className="text-sm mr-2" />
                                        Submit Responses
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
