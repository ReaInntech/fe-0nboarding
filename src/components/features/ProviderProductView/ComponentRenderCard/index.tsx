'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface ComponentRenderConfig {
    templateFile: string;
    props: Record<string, any>;
}

export interface ComponentRenderCardProps {
    id: string;
    title: string;
    initialConfig?: ComponentRenderConfig;
    onDelete?: () => void;
    onSave?: (config: ComponentRenderConfig) => Promise<void>;
    disabled?: boolean;
}

/**
 * Provider-side card to configure a Dynamic UI Component (component_render).
 */
export default function ComponentRenderCard({
    id,
    title,
    initialConfig,
    onDelete,
    onSave,
    disabled = false
}: ComponentRenderCardProps) {
    const [config, setConfig] = useState<ComponentRenderConfig>(initialConfig || {
        templateFile: '',
        props: {}
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = async () => {
        if (!onSave || disabled) return;
        setIsSaving(true);
        try {
            await onSave(config);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Failed to save dynamic component config:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles['dynamic-card']}>
            <div className={styles['dynamic-card__header']}>
                <div className={styles['dynamic-card__title-box']}>
                    <div className={styles['dynamic-card__icon-wrapper']}>
                        <Icon name="extension" style={{ fontSize: 16 }} />
                    </div>
                    <span className={styles['dynamic-card__title']}>{title}</span>
                </div>
                <div className={styles['dynamic-card__actions']}>
                    {showSuccess && (
                        <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-[10px] font-bold">
                            <Icon name="check_circle" className="mr-1.5 text-xs" /> Saved
                        </div>
                    )}

                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={isSaving || disabled}
                        className={`${(isSaving || disabled) ? 'opacity-50' : ''} ${showSuccess ? 'hidden' : ''} ${styles['save-btn']}`}
                    >
                        {isSaving ? (
                            <div className="size-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Icon name="save" style={{ fontSize: 14 }} className="text-blue-500" />
                        )}
                    </button>

                    <button type="button" onClick={onDelete} className={styles['delete-btn']}>
                        <Icon name="delete" style={{ fontSize: 14 }} />
                    </button>
                </div>
            </div>

            <div className={styles['dynamic-card__body']}>
                <div className={styles['dynamic-card__field']}>
                    <label>Component Template (.tsx)</label>
                    <input 
                        type="text"
                        value={config.templateFile}
                        onChange={(e) => setConfig({ ...config, templateFile: e.target.value })}
                        placeholder="e.g. IdentityVerificationComponent"
                        className={styles['dynamic-card__input']}
                    />
                </div>
                
                <div className={styles['dynamic-card__field']}>
                    <label>Initial Props (JSON)</label>
                    <textarea 
                        value={JSON.stringify(config.props, null, 2)}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                setConfig({ ...config, props: parsed });
                            } catch (err) {
                                // Ignore invalid JSON while typing
                            }
                        }}
                        placeholder='{ "mode": "strict" }'
                        rows={3}
                        className={styles['dynamic-card__textarea']}
                    />
                </div>

                <div className={styles['dynamic-card__info-box']}>
                    <Icon name="info" className="text-blue-400" />
                    <p>This component will be rendered dynamically in the client's view using the specified template.</p>
                </div>
            </div>
        </div>
    );
}
