import React, { useState } from 'react';
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
    documentTitle: string;
    content: string;
    checkboxes: TermsCheckbox[];
    status: 'pending' | 'accepted';
    templateFile?: string | null;
    acceptDate?: string;
    onAccept?: () => void;
    className?: string;
}

export default function TermsAndConditionsRequest({
    documentTitle,
    content,
    checkboxes,
    status,
    templateFile,
    acceptDate,
    onAccept,
    className = ''
}: TermsAndConditionsRequestProps) {
    const isAccepted = status === 'accepted';
    const { user } = useApp();

    // Document Viewer state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Track which checkboxes are checked
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
        (checkboxes || []).reduce((acc, cb) => ({ ...acc, [cb.id.toString()]: false }), {})
    );

    const allChecked = (checkboxes || []).every(cb => checkedState[cb.id.toString()]);

    const handleCheckboxChange = (id: string) => {
        if (isAccepted) return;
        setCheckedState(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAccept = () => {
        if (allChecked && onAccept) {
            onAccept();
        }
    };

    const handleViewDocument = async () => {
        if (!templateFile || !user) return;
        
        setIsLoadingPreview(true);
        setIsModalOpen(true);
        setPreviewUrl(null);

        try {
            // Get fresh token
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user.accessToken));
            if (!freshToken) throw new Error("No authentication token available");

            const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
            const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(templateFile)}`, {
                headers: { Authorization: `Bearer ${freshToken}` }
            });

            if (response.ok) {
                const body = await response.json();
                const url = body.data?.url || body.url;
                setPreviewUrl(url);
            } else {
                throw new Error("Failed to get preview URL");
            }
        } catch (error) {
            console.error("Preview failed:", error);
            setIsModalOpen(false);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    return (
        <div className={`${styles['terms-request']} ${className}`}>
            <div className={styles['terms-request__header']}>
                <div className="flex items-center gap-2">
                    <h3 className={styles['terms-request__title-box']}>
                        <Icon name="gavel" className="text-emerald-500" /> Terms & Conditions
                    </h3>
                    {templateFile && (
                        <button 
                            onClick={handleViewDocument}
                            className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
                        >
                            <Icon name="picture_as_pdf" style={{ fontSize: 10 }} /> View PDF
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
                    <h4 className={styles['terms-request__doc-title']}>{documentTitle}</h4>
                </div>

                {/* Content Reader */}
                <div className={styles['terms-request__reader']}>
                    <div className={styles['terms-request__prose']}>
                        {content}
                    </div>
                </div>

                {isAccepted ? (
                    <div className={styles['terms-request__accepted-view']}>
                        <div className={styles['terms-request__accepted-info']}>
                            <Icon name="verified" className="text-emerald-500 text-2xl" />
                            <div>
                                <h5 className={styles['terms-request__accepted-title']}>Terms Accepted</h5>
                                <p className={styles['terms-request__accepted-subtext']}>
                                    You have agreed to all terms and conditions.
                                </p>
                            </div>
                        </div>
                        {acceptDate && (
                            <div className={styles['terms-request__accepted-date']}>
                                Accepted on {acceptDate}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className={styles['terms-request__checkboxes-list']}>
                            {checkboxes?.map(cb => {
                                const isChecked = checkedState[cb.id.toString()];
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
                                disabled={!allChecked}
                            >
                                <Icon name="task_alt" className="text-sm mr-2" /> Accept Terms
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={documentTitle || "Términos y Condiciones (PDF)"}
                size="lg"
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
