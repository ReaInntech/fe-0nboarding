'use client';

import React, { useState } from 'react';
import Modal from '../Modal';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    icon?: string;
    isLoading?: boolean;
}

const VARIANT_CONFIG = {
    danger: {
        defaultIcon: 'delete_forever',
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-400',
        btnBg: 'bg-red-600 hover:bg-red-700',
        ringColor: 'ring-red-500/30',
    },
    warning: {
        defaultIcon: 'warning',
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        btnBg: 'bg-amber-600 hover:bg-amber-700',
        ringColor: 'ring-amber-500/30',
    },
    info: {
        defaultIcon: 'info',
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        btnBg: 'bg-blue-600 hover:bg-blue-700',
        ringColor: 'ring-blue-500/30',
    },
};

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message = '¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    icon,
    isLoading: externalLoading,
}: ConfirmDialogProps) {
    const [internalLoading, setInternalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoading = externalLoading ?? internalLoading;
    const config = VARIANT_CONFIG[variant];
    const displayIcon = icon || config.defaultIcon;

    const handleConfirm = async () => {
        setError(null);
        setInternalLoading(true);
        try {
            await onConfirm();
        } catch (err: any) {
            const msg = err?.response?.data?.message
                || err?.message
                || 'Ocurrió un error inesperado.';
            setError(msg);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setError(null);
        onClose();
    };

    const footer = (
        <div className={styles['confirm-dialog__footer']}>
            <button
                className={styles['confirm-dialog__cancel-btn']}
                onClick={handleClose}
                disabled={isLoading}
            >
                {cancelLabel}
            </button>
            <button
                className={`${styles['confirm-dialog__confirm-btn']} ${config.btnBg}`}
                onClick={handleConfirm}
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <Icon name={displayIcon} className="text-sm" />
                        {confirmLabel}
                    </>
                )}
            </button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            size="sm"
            footer={footer}
        >
            <div className={styles['confirm-dialog__body']}>
                <div className={`${styles['confirm-dialog__icon-circle']} ${config.iconBg} ${config.ringColor}`}>
                    <Icon name={displayIcon} className={`${styles['confirm-dialog__icon']} ${config.iconColor}`} />
                </div>

                <p className={styles['confirm-dialog__message']}>
                    {message}
                </p>

                {error && (
                    <div className={styles['confirm-dialog__error']}>
                        <Icon name="error" className="text-sm shrink-0" />
                        {error}
                    </div>
                )}
            </div>
        </Modal>
    );
}
